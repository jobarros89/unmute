create table public.profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 settings jsonb not null check (jsonb_typeof(settings) = 'object' and settings ?& array['name','goal','dailyMinutes'] and length(settings->>'name') <= 40 and settings->>'goal' in ('everyday','work','travel') and (settings->>'dailyMinutes')::int in (5,10,20)),
 created_at timestamptz not null default now()
);
create table public.lesson_sessions (
 user_id uuid not null references auth.users(id) on delete cascade,
 id uuid not null,
 payload jsonb not null check (jsonb_typeof(payload)='object' and payload ?& array['id','lessonId','completedAt','repetitions','recordingSeconds'] and payload->>'id'=id::text and (payload->>'repetitions')::int between 1 and 100 and (payload->>'recordingSeconds')::numeric between 0 and 3600),
 completed_at timestamptz not null,
 primary key(user_id,id)
);
create index lesson_sessions_recent on public.lesson_sessions(user_id,completed_at desc);
create table public.assessments (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 listening_correct int not null check(listening_correct between 0 and 3),
 listening_total int not null check(listening_total=3),
 speaking_comfort int not null check(speaking_comfort between 0 and 3),
 summary text not null check(length(summary)<=1000),
 created_at timestamptz not null default now()
);
create index assessments_recent on public.assessments(user_id,created_at desc);
create table public.ai_turns (
 user_id uuid not null references auth.users(id) on delete cascade,
 request_id uuid not null,
 conversation_id uuid not null,
 request_hash text not null,
 mode text not null check(mode in ('drill','room')),
 topic text not null check(length(topic)<=80),
 status text not null default 'processing' check(status in ('processing','completed','failed')),
 result jsonb,
 created_at timestamptz not null default now(),
 primary key(user_id,request_id)
);
create index ai_turns_context on public.ai_turns(user_id,conversation_id,created_at desc);
create table public.review_items (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 request_id uuid not null,
 original text not null check(length(original)<=4000),
 corrected text not null check(length(corrected)<=4000),
 explanation text not null check(length(explanation)<=2000),
 repetitions int not null default 0 check(repetitions between 0 and 10),
 due_at timestamptz not null default now(),
 unique(user_id,request_id),
 foreign key(user_id,request_id) references public.ai_turns(user_id,request_id) on delete cascade
);
create index review_items_due on public.review_items(user_id,due_at);
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
create table private.ai_usage (
 user_id uuid not null references auth.users(id) on delete cascade,
 day date not null,
 requests int not null default 0,
 primary key(user_id,day)
);
alter table private.ai_usage enable row level security;
grant usage on schema private to service_role;
grant all on private.ai_usage to service_role;

alter table public.profiles enable row level security;
alter table public.lesson_sessions enable row level security;
alter table public.assessments enable row level security;
alter table public.ai_turns enable row level security;
alter table public.review_items enable row level security;
revoke all on public.profiles,public.lesson_sessions,public.assessments,public.ai_turns,public.review_items from anon,authenticated;
grant select,insert,update on public.profiles to authenticated;
grant select,insert on public.lesson_sessions,public.assessments to authenticated;
grant select on public.ai_turns,public.review_items to authenticated;
grant update(repetitions,due_at) on public.review_items to authenticated;
grant all on public.profiles,public.lesson_sessions,public.assessments,public.ai_turns,public.review_items to service_role;

create policy profile_read on public.profiles for select to authenticated using((select auth.uid())=user_id);
create policy profile_insert on public.profiles for insert to authenticated with check((select auth.uid())=user_id);
create policy profile_update on public.profiles for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy session_read on public.lesson_sessions for select to authenticated using((select auth.uid())=user_id);
create policy session_insert on public.lesson_sessions for insert to authenticated with check((select auth.uid())=user_id);
create policy assessment_read on public.assessments for select to authenticated using((select auth.uid())=user_id);
create policy assessment_insert on public.assessments for insert to authenticated with check((select auth.uid())=user_id);
create policy turn_read on public.ai_turns for select to authenticated using((select auth.uid())=user_id);
create policy review_read on public.review_items for select to authenticated using((select auth.uid())=user_id);
create policy review_update on public.review_items for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);

-- Privileged operations are callable only by the verified Edge Function's service client.
-- Quota + request reservation share one transaction and a per-user row lock.
create function public.reserve_ai_turn(p_user uuid,p_request uuid,p_conversation uuid,p_hash text,p_mode text,p_topic text)
returns text language plpgsql security invoker set search_path='' as $$
declare existing public.ai_turns; used int;
begin
 insert into private.ai_usage(user_id,day) values(p_user,(now() at time zone 'UTC')::date) on conflict do nothing;
 select requests into used from private.ai_usage where user_id=p_user and day=(now() at time zone 'UTC')::date for update;
 select * into existing from public.ai_turns where user_id=p_user and request_id=p_request;
 if found then
   if existing.request_hash<>p_hash then raise exception 'request_conflict'; end if;
   return existing.status;
 end if;
 if used>=30 then return 'quota_exceeded'; end if;
 update private.ai_usage set requests=requests+1 where user_id=p_user and day=(now() at time zone 'UTC')::date;
 insert into public.ai_turns(user_id,request_id,conversation_id,request_hash,mode,topic) values(p_user,p_request,p_conversation,p_hash,p_mode,p_topic);
 return 'reserved';
end $$;
revoke all on function public.reserve_ai_turn(uuid,uuid,uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.reserve_ai_turn(uuid,uuid,uuid,text,text,text) to service_role;

create function public.finish_ai_turn(p_user uuid,p_request uuid,p_result jsonb)
returns void language plpgsql security invoker set search_path='' as $$
begin
 update public.ai_turns set status='completed',result=p_result where user_id=p_user and request_id=p_request and status='processing';
 if not found then raise exception 'request_not_processing'; end if;
 if (p_result->>'hasCorrection')::boolean then
  insert into public.review_items(user_id,request_id,original,corrected,explanation)
  values(p_user,p_request,p_result->>'transcript',p_result->>'corrected',p_result->>'explanation');
 end if;
end $$;
revoke all on function public.finish_ai_turn(uuid,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.finish_ai_turn(uuid,uuid,jsonb) to service_role;
