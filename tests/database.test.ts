import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";

test("Postgres: migration, account isolation, protected feedback and atomic quota", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      `create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;grant usage on schema auth,public to anon,authenticated,service_role;grant execute on function auth.uid() to authenticated;`,
    );
    await db.exec(
      readFileSync(
        new URL(
          "../supabase/migrations/20260911150137_authenticated_learning.sql",
          import.meta.url,
        ),
        "utf8",
      ),
    );
    const a = "00000000-0000-4000-8000-000000000001",
      b = "00000000-0000-4000-8000-000000000002";
    await db.exec(
      `insert into auth.users values('${a}'),('${b}');set role authenticated;select set_config('request.jwt.claim.sub','${a}',false);`,
    );
    await db.query("insert into profiles values($1,$2)", [
      a,
      { name: "A", goal: "work", dailyMinutes: 10 },
    ]);
    await assert.rejects(
      db.query("insert into profiles values($1,$2)", [
        b,
        { name: "B", goal: "work", dailyMinutes: 10 },
      ]),
    );
    await assert.rejects(
      db.query(
        "insert into ai_turns(user_id,request_id,conversation_id,request_hash,mode,topic) values($1,$2,$2,$3,$4,$5)",
        [a, a, "hash", "room", "work"],
      ),
    );
    await assert.rejects(
      db.query("select reserve_ai_turn($1,$1,$1,$2,$3,$4)", [
        a,
        "hash",
        "room",
        "work",
      ]),
    );
    await db.exec(`select set_config('request.jwt.claim.sub','${b}',false)`);
    assert.equal((await db.query("select * from profiles")).rows.length, 0);
    await db.exec("reset role;set role service_role;");
    const reserve = async (id: string) =>
      db.query<{ reserve_ai_turn: string }>(
        "select reserve_ai_turn($1,$2,$1,$3,$4,$5)",
        [a, id, "hash", "room", "work"],
      );
    assert.equal((await reserve(a)).rows[0]?.reserve_ai_turn, "reserved");
    assert.equal((await reserve(a)).rows[0]?.reserve_ai_turn, "processing");
    const feedback = {
      transcript: "I go yesterday.",
      corrected: "I went yesterday.",
      explanation: "Use o passado.",
      reply: "Where did you go?",
      followup: "Diga onde foi.",
      hasCorrection: true,
    };
    await db.query("select finish_ai_turn($1,$1,$2)", [a, feedback]);
    assert.equal((await reserve(a)).rows[0]?.reserve_ai_turn, "completed");
    for (let n = 2; n <= 30; n++)
      assert.equal(
        (
          await reserve(
            `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`,
          )
        ).rows[0]?.reserve_ai_turn,
        "reserved",
      );
    assert.equal(
      (await reserve("00000000-0000-4000-8000-000000000031")).rows[0]
        ?.reserve_ai_turn,
      "quota_exceeded",
    );
    await db.exec(
      `reset role;set role authenticated;select set_config('request.jwt.claim.sub','${b}',false);`,
    );
    assert.equal((await db.query("select * from ai_turns")).rows.length, 0);
    assert.equal((await db.query("select * from review_items")).rows.length, 0);
    await db.exec(`select set_config('request.jwt.claim.sub','${a}',false)`);
    assert.equal((await db.query("select * from review_items")).rows.length, 1);
    await db.exec("update review_items set repetitions=1,due_at=now()");
    await assert.rejects(db.exec("update review_items set corrected='forged'"));
    await db.exec("reset role;set role anon;");
    await assert.rejects(db.exec("select * from profiles"));
  } finally {
    await db.close();
  }
});
