# I AM Real Web Companion Implementation Roadmap

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement each phase task-by-task. Every phase must finish with its own reviewable pull request and protected Vercel preview.

**Goal:** Convert the existing I AM screen-review prototype into a real private web companion, then add user-controlled actions, ethical Momentum, premium gradients, and release hardening without spending Expo/EAS credits.

**Architecture:** The existing Storm And Me React site becomes the first real client. Supabase Auth, PostgreSQL, RLS, and the authenticated `chat` Edge Function remain the shared backend for the future web and native apps. Work is split into four independently testable phases so a visual system or gamification layer can never hide a broken AI or data flow.

**Tech Stack:** React 19, React Router 7, Create React App/CRACO, Tailwind CSS, Framer Motion, Lucide React, Supabase JS, Supabase Auth/PostgreSQL/Edge Functions, OpenAI Responses API through the existing server-side `chat` function, Vercel.

## Global Constraints

- `I AM` remains a working title; Him, Her, and Becoming are experience lanes, not cleared public trademarks.
- Audience remains United States adults age 18 and older.
- Memory defaults off and requires an explicit user decision.
- Safety Path, reporting, support, privacy controls, and account deletion are never paywalled.
- No romantic roleplay, exclusivity, dependency language, passive location, secret recording, covert monitoring, or claim that a human is continuously watching.
- No points, celebrations, streak pressure, or retention rewards may be triggered by crisis, abuse, self-harm, violence, medical-emergency, or high-distress disclosures.
- Every visible primary control must perform a real action, navigate to a real destination, or be clearly disabled with a reason.
- No service-role key, OpenAI key, Apple key, Google secret, RevenueCat secret, webhook secret, or signing credential may enter browser code or GitHub.
- No production database DDL is authorized by this roadmap. A required migration must receive a separate reviewed plan and approval.
- No EAS build, TestFlight upload, Google Play upload, domain purchase, trademark filing, or paid mobile action is authorized.
- Do not mix I AM work with open PR #3 (`feat/featured-shirts-deploy`). Every I AM branch starts from the latest reviewed `main` commit and remains isolated.
- Google's three release ingredients remain binding: real utility, high-quality user experience, and meaningful differentiation.

---

## Phase 1 — Core Authenticated AI Vertical Slice

**Outcome:** A user can create an account or sign in, complete adult/AI-boundary onboarding, choose a lane, start or resume a real conversation, send a message to the existing authenticated Supabase `chat` function, receive a real response, and use standard or accurately described private mode.

**Plan:** `docs/superpowers/plans/2026-08-02-iam-phase-1-core-auth-chat.md`

**Merge gate:**

- Real Supabase Auth works on a protected Vercel preview.
- A fresh account receives or creates a real profile.
- Standard chat creates a real conversation and persists messages.
- Private mode does not intentionally persist conversation history and does not claim to erase device/network/provider traces.
- Every visible control in the Phase 1 path works.
- Build and validator pass.
- Owner completes a real browser walkthrough before merge.

## Phase 2 — User-Controlled Goals, Memories, Reports, and Safety Actions

**Outcome:** Returned AI actions become genuine workflows. `Make a plan` creates a user-reviewed goal, `Save insight` creates an explicitly approved memory, `Report` reaches a protected queue, and safety actions route to real verified support surfaces.

**Planned files:**

- `frontend/src/iam/goals/goalApi.js`
- `frontend/src/iam/goals/IamGoalsPage.js`
- `frontend/src/iam/goals/GoalConfirmDialog.js`
- `frontend/src/iam/memory/memoryApi.js`
- `frontend/src/iam/memory/IamMemoriesPage.js`
- `frontend/src/iam/memory/MemoryConfirmDialog.js`
- `frontend/src/iam/report/reportApi.js`
- `frontend/src/iam/report/ReportResponseDialog.js`
- `frontend/src/iam/safety/IamSafetyPathPage.js`
- focused tests for all data contracts and failure states

**Merge gate:**

- Goals and memories write only after confirmation and reload under authenticated RLS.
- Memory enable/disable and delete controls are honest and functional.
- Reports cannot display a false success state.
- `tel:` and route actions require a deliberate user click and never place a call automatically.
- Safety Path shows safer-device cautions and receives no celebration or Momentum event.

## Phase 3 — Momentum, Daily Moves, Companion Presence, and Premium Visual System

**Outcome:** The product gains the premium gradients, living light companion, real progress hub, optional Daily Move, flexible Rhythm indicator, milestones, and restrained completion celebrations described in the approved addendum.

**Planned files:**

- `frontend/src/iam/theme/iamTheme.js`
- `frontend/src/iam/theme/IamThemeProvider.js`
- `frontend/src/iam/components/CompanionOrb.js`
- `frontend/src/iam/momentum/momentumApi.js`
- `frontend/src/iam/momentum/momentumReducer.js`
- `frontend/src/iam/momentum/IamMomentumPage.js`
- `frontend/src/iam/momentum/DailyMoveCard.js`
- `frontend/src/iam/momentum/MomentumProgress.js`
- `frontend/src/iam/momentum/CompletionCelebration.js`
- `frontend/src/iam/settings/ExperienceSettings.js`
- focused tests for deduplication, hidden/reduced-motion settings, crisis exclusion, and real-data progress

**Database gate:** The existing schema already references `goal_steps`, `check_ins`, `xp_events`, `achievements`, and `user_achievements` in the approved privacy inventory, but source and RLS must be freshly verified before use. Any missing column, uniqueness rule, or policy requires a separate migration plan and explicit approval.

**Merge gate:**

- Momentum changes only after a confirmed successful real-world action write.
- No points are awarded for chat volume, time in app, crisis use, or intimate disclosure.
- Rhythm allows rest and never displays loss/shame language.
- Gradients preserve readable contrast across Him, Her, and Becoming.
- Reduced-motion and hide-gamification controls work.
- Companion language never implies consciousness, romance, need, jealousy, or exclusivity.

## Phase 4 — Release Hardening and Controlled Private Test

**Outcome:** The real web companion is tested as a coherent product rather than a collection of pages.

**Planned work:**

- authentication recovery and session-expiry tests
- no-dead-control audit
- keyboard-only and screen-reader smoke tests
- mobile/desktop responsive visual review
- offline and rate-limit behavior
- unsafe-AI and safety-routing regression set
- unauthenticated RLS tests for all user-facing tables
- privacy/retention copy reconciliation with actual behavior
- account deletion test with a non-production account
- performance and runtime error review
- owner release checklist and rollback record

**Launch boundary:** Completing Phase 4 may support a small owner-approved private U.S. adult web test. It does not authorize a public launch, trademark claim, native build, App Store submission, Google Play submission, subscription activation, or expert safety sign-off claim.

---

## Execution Order

1. Execute and review Phase 1.
2. Write the detailed Phase 2 plan using the verified Phase 1 interfaces.
3. Execute and review Phase 2.
4. Write the detailed Phase 3 plan after verifying the live progress schema and RLS.
5. Execute and review Phase 3.
6. Write and execute the Phase 4 hardening plan.

This order is deliberate: the AI and data loop must work before visual gamification is allowed to decorate it.

## Current Read-Only Verification Used by the Plans

- Latest reviewed `main` documentation commit at planning time: `104bc5737b306eb0477bb7ed67918222eadc3614`.
- Existing frontend has React 19, React Router 7, Tailwind, Framer Motion, Lucide React, and a build-blocking I AM validator.
- Existing frontend does not yet include `@supabase/supabase-js`.
- Existing Supabase project: `xdstipqlrnnuutggvhbz`.
- Existing `chat` Edge Function is active, requires JWT, rate-limits users, moderates input/output, classifies safety tiers, retrieves the authenticated user's profile/memories/goals, calls the OpenAI Responses API, and persists standard-mode messages.
- Existing auth trigger creates a profile after a new auth user is inserted.
- Existing lane enum values are `him`, `her`, and `becoming`.
- Existing goal status values are `active`, `paused`, `completed`, and `archived`.
- Existing policies allow owners to access their own profiles, conversations, goals, and memories; message read/insert/delete policies are scoped to `authenticated` users and their own conversations.
- Some policies are assigned to the broad `public` role while checking `auth.uid()`. That advisor concern remains a separate pre-public-launch security review and must not be widened or silently changed during frontend wiring.

## Roadmap Acceptance

The roadmap is complete when each phase has its own plan, isolated branch, passing test/build evidence, protected preview, human review, and explicit merge decision. Mobile work remains separate and can reuse the same backend only after the real web flows prove the product architecture.