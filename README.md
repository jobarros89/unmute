# Unmute

**English for real life.** A mobile-first learning product designed to improve listening comprehension and unlock speaking through short, repeatable daily practice.

## Product thesis

Traditional courses often over-index on content consumption. Unmute is built around an active learning loop:

**Listen → Understand → Speak → Feedback → Repeat → Progress**

The goal is not to put AI on top of a traditional course. The goal is to make speaking practice frequent, measurable and sustainable for busy adults.

## Stack

- React Native + Expo SDK 57
- TypeScript (strict mode)
- Expo Router
- TanStack Query
- Zustand
- Supabase (Postgres, Auth, RLS, Storage, Edge Functions)
- Zod
- GitHub Actions

AI/voice integrations will be introduced behind server-side boundaries. API secrets must never be shipped inside the mobile application.

## Project structure

```text
src/
  app/          # Expo Router routes
  features/     # Product domains and vertical slices
  lib/          # External clients and infrastructure helpers
  providers/    # Global application providers
  theme/        # Design tokens
```

## Local development

Requirements:

- Node.js 22.13+
- npm
- Expo Go or a simulator/device

```bash
npm install
cp .env.example .env
npm run start
```

Environment variables:

```text
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

## Engineering rules

1. Keep product logic inside feature modules, not route files.
2. Never expose private AI/provider keys to the mobile client.
3. Validate external data at boundaries.
4. Prefer small vertical slices that can be tested end-to-end.
5. Database changes must be versioned as migrations when the Supabase project is created.
6. Protect `main`; development should happen through branches and pull requests.

## Delivery roadmap

### Foundation
- [x] Expo + TypeScript bootstrap
- [x] Router and application providers
- [x] Supabase client boundary
- [x] CI baseline
- [ ] Supabase project + migrations

### MVP slice 1 — Diagnostic
- [ ] Account creation
- [ ] Goal and routine questions
- [ ] Listening baseline
- [ ] Speaking baseline
- [ ] Initial level/profile

### MVP slice 2 — Core learning loop
- [ ] Listen
- [ ] Understand
- [ ] Speak
- [ ] AI feedback
- [ ] Repeat with targeted correction
- [ ] Session completion/progress

### MVP slice 3 — Daily system
- [ ] Daily plan
- [ ] Streak with recovery mechanics
- [ ] Weekly progress summary
- [ ] Adaptive next lesson

## Current status

Bootstrap branch establishes the technical foundation. The next implementation target is the diagnostic vertical slice, followed immediately by the first complete Listen → Speak → Feedback session.
