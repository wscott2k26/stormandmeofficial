# I AM Phase 1 Core Auth and Chat — Verification Report

**Updated:** 2026-08-08  
**Owner:** Storm And Me LLC  
**Working title:** I AM  
**Branch:** `iam-real-web-phase-1`  
**Pull request:** #5  
**Status:** Automated source, test, backend-deployment, and Vercel build gates are green. A real signed-in owner browser walkthrough remains required before merge.

## 1. Implemented web scope

Phase 1 provides a real private I AM web application surface under the existing Storm And Me deployment, outside the normal Storm website header/footer.

Implemented:

- private I AM entry page;
- email/password account creation and sign-in;
- email confirmation destination;
- password-reset request and actual new-password update;
- authenticated session restoration and sign-out;
- required adult and AI-boundary onboarding;
- Him, Her, and Becoming lane selection;
- memory default off with explicit opt-in language;
- protected application routes;
- real standard-mode conversation creation, history opening, and deletion;
- authenticated invocation of the Supabase `chat` Edge Function;
- private mode with accurate non-persistence and trace limitations;
- safe filtering that hides unsupported Phase 2 plan, memory, and report actions;
- deliberate `tel:` and Safety Path actions returned by the backend;
- 8,000-character composer limit, loading, offline, rate-limit, retry, and uncertain-send reconciliation states;
- premium responsive gradients and living-light visual foundation;
- reduced-motion and keyboard-focus support;
- noindex/no-store handling for private routes;
- build-blocking validation for configuration, route isolation, browser secrets, auth capability, continuity disclosures, safety actions, and dead controls.

## 2. Isolation and no-spend verification

The work remains isolated on `iam-real-web-phase-1` and is unmerged in draft PR #5.

No Expo or EAS build was run. No TestFlight or Google Play upload occurred. No native build credit was used. No new Supabase or Vercel project was created. No domain was purchased, no trademark was filed, and no subscription was activated.

No production database DDL or schema migration was applied for this work.

## 3. Vercel configuration resolution

The browser requires these public Vercel values:

- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`

The approved Supabase project URL is `https://xdstipqlrnnuutggvhbz.supabase.co`.

The owner configured both values for Vercel. Fresh Preview builds proved they were present. Testing then identified that the copied project URL contained a harmless trailing `/`. Rather than requiring fragile exact formatting, runtime and build-time parsing now trim whitespace and normalize trailing slashes before validating the approved project.

Regression coverage proves both surrounding whitespace and a copied trailing slash are accepted while a different Supabase project is still rejected.

## 4. Web reliability fixes

A focused auth/chat/history review found and corrected an interrupted first-message edge case. The client now:

- removes a newly created blank conversation after explicit function failure;
- preserves the conversation ID after an uncertain network interruption;
- checks persisted history before allowing a duplicate resend;
- preserves conversation identity after reconciliation;
- keeps a successful AI response visible if history reload temporarily fails;
- automatically re-enables the composer after the temporary client-side rate-limit pause.

## 5. True bounded multi-turn continuity — implemented

The earlier v10 limitation has been resolved.

Supabase `chat` Edge Function **version 11** is ACTIVE with JWT verification enabled.

Deployment identity:

- Function ID: `79fb70a4-1878-4c81-ac4b-7e541aa1c447`
- Version: `11`
- Status: `ACTIVE`
- `verify_jwt`: `true`
- Deployed SHA: `692a1dafd985d05b3dcff40d3a9ef6722733497da3e9f916aebc81f2892e14da`

Saved-mode continuity behavior:

1. The requested conversation is first verified to belong to the authenticated user.
2. History is read through the authenticated RLS client, never through the service-role client.
3. Only prior `user` and `assistant` messages from that conversation are eligible.
4. At most the newest **12** eligible messages are loaded.
5. Combined history is capped at **12,000 characters** without slicing a message or skipping an intervening over-cap turn to reach older context.
6. Selected history is restored to chronological order before the current user message.
7. Prior conversation text remains ordinary conversation content and is never promoted to system/developer authority.
8. The OpenAI Responses request keeps `store: false`.

Private-mode behavior:

- private mode does not verify or load a saved conversation;
- private mode does not query prior message history;
- private mode is not intentionally persisted to the normal conversation history;
- the UI explicitly warns that private mode cannot erase browser, device, network, provider, or security logs.

Safety ordering:

- the current message is moderated and classified first;
- high-risk self-harm, violence, and medical-emergency routing occurs before any saved thread history is loaded;
- abuse guidance retains the existing safer-device and trained-resource behavior.

## 6. Backend source and rollback

The reviewed v11 source is now version-controlled in PR #5:

- `supabase/functions/chat/source/index.ts`
- `supabase/functions/chat/_shared/openai.ts`
- `supabase/functions/chat/_shared/cors.ts`
- `supabase/functions/chat/_shared/safety.ts`
- `supabase/functions/chat/_shared/chat-core.mjs`
- `supabase/functions/chat/_shared/chat-core.test.mjs`

The exact previous production v10 core sources were preserved before deployment under `supabase/functions/chat/rollback/` so a rollback reference exists.

## 7. Latest automated verification

Latest fully evaluated Preview deployment before this documentation-only commit:

- Deployment: `dpl_EDnN3fWhSFnQ3nGVyXmaiTHWiJaB`
- Commit: `2e6fd01950ca7df70498059cbdc9e503f2145e3f`
- State: **READY**

Fresh evidence from that deployment:

- original I AM prototype validator: **13 areas / 113 screens passed**;
- frontend Jest: **9 test suites passed / 9 total**;
- frontend Jest: **29 tests passed / 29 total**;
- bounded Edge continuity tests: **8 passed / 8 total**;
- Edge contract validator passed owner-only history, private-mode exclusion, safety-first ordering, context caps, role boundaries, and `store:false` checks;
- I AM app validator passed auth, onboarding, real chat, bounded continuity disclosures, privacy, noindex, safety-action, Edge-context, and dead-control checks;
- Create React App optimized production build: **Compiled successfully**;
- Vercel deployment: **READY**.

Existing dependency/deprecation warnings remain and are not represented as fixed.

## 8. Honest remaining manual verification

Automated verification does **not** substitute for a real signed-in browser walkthrough. The protected Vercel preview may redirect automated fetches through Vercel SSO, so the following still require owner testing in the browser:

1. Create an account or sign in.
2. Complete onboarding and verify the selected lane persists.
3. In Saved mode, send an identifiable first message and receive a real AI response.
4. Send a follow-up that depends on the first message and confirm the AI uses the recent thread context.
5. Reload/open that saved conversation, send another follow-up, and confirm continuity still works.
6. Open History and delete a test conversation.
7. Switch to Private mode and confirm the UI clearly states that each private message is handled without loading prior conversation history.
8. Verify a private exchange does not appear in normal saved conversation history.
9. Test sign-out/sign-in and password reset/update.
10. Review the mobile layout, Safety Path, keyboard/focus behavior, and visible controls for dead or misleading interactions.

No claim of end-to-end signed-in browser success should be made until this walkthrough is completed.

## 9. Scope still deferred

Phase 2 remains intentionally deferred: real plan conversion, Memory Center writes, and reporting workflows.

Phase 3 remains intentionally deferred: Momentum, Daily Moves, levels/milestones, premium celebration behavior, and broader gamification.

## 10. Merge recommendation

Keep PR #5 in **draft** until the owner completes the real browser walkthrough and confirms the experience visually and functionally.

Web merge authorization remains separate from any future Expo/EAS, TestFlight, Google Play, or native-app build authorization.
