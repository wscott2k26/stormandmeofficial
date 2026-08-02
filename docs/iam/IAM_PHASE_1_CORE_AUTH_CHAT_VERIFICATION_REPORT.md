# I AM Phase 1 Core Auth and Chat — Verification Report

**Date:** 2026-08-02  
**Owner:** Storm And Me LLC  
**Working title:** I AM  
**Branch:** `iam-real-web-phase-1`  
**Status:** Code, validators, tests, and production compilation are proven. Runtime authentication is **blocked** until the two public Supabase browser variables are configured in Vercel and the owner completes a real browser walkthrough.

## 1. Implemented scope

Phase 1 adds a real web-application surface under the existing Storm And Me deployment without using the normal Storm website header/footer.

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
- real standard-mode conversation creation and history;
- real authenticated invocation of the existing Supabase `chat` Edge Function;
- accurately described private mode that does not intentionally persist normal conversation history;
- owner-scoped conversation history, resume, and delete actions;
- safe filtering that hides unsupported Phase 2 plan, memory, and report actions;
- deliberate `tel:` and Safety Path actions returned by the backend;
- 8,000-character composer limit, loading, offline, rate-limit, retry, and uncertain-send reconciliation states;
- premium responsive gradients and a living-light visual foundation;
- reduced-motion and keyboard-focus support;
- noindex/no-store handling for private routes;
- build-blocking checks for configuration, dead controls, route isolation, browser secrets, auth capabilities, and the existing 13-area/113-screen product map.

## 2. Isolation and diff verification

The branch started from reviewed `main` commit:

`97751673cca440ad5758d417a6e8c3b64f343e72`

At the pre-report comparison, the branch was:

- 38 commits ahead;
- 0 commits behind;
- isolated from open PR #3 (`feat/featured-shirts-deploy`);
- limited to I AM frontend code, validators, `App.js`, `SeoManager.js`, `frontend/package.json`, and private-route Vercel headers.

No Expo, EAS, native app, TestFlight, Google Play, domain, trademark, subscription, or production database migration was touched.

## 3. Fresh code-gate evidence

Vercel deployment:

- ID: `dpl_59VAdkcN611rBFYKnK5pjeQdzUYm`
- Commit: `669afb8b3251399a1c6f6346594bf0ffaa709a73`
- State: `READY`

Build evidence:

- Existing prototype validator passed: **13 areas, 113 screens, 13 unique area IDs, 113 unique screen IDs**.
- New real-app validator passed: auth, onboarding, real chat, history, privacy, noindex, safety-action, and dead-control checks.
- Jest result: **8 test suites passed, 8 total**.
- Jest result: **21 tests passed, 21 total**.
- Create React App result: **Compiled successfully**.

The build emitted existing dependency deprecation and peer-dependency warnings. They did not fail this verified build and are not represented as resolved by Phase 1.

## 4. Runtime configuration gate

A stricter follow-up validator was added so the preview cannot be called functional unless Vercel provides:

- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`

The URL must match the approved Supabase project. The key must be an enabled public/anon or publishable browser key. Service-role and OpenAI credentials are expressly prohibited from the browser.

Fresh enforcement deployment:

- ID: `dpl_Hnxg7oHYeV5dxPQc2pX27148QJaU`
- Commit: `a14207d5c0a0998670affd51d24a9b8502df5a78`
- State: `ERROR`, intentionally blocked by the configuration validator
- Exact blocker: `REACT_APP_SUPABASE_URL is missing or does not match the approved I AM project`

This is a real release blocker, not a code-pass claim. The connected Vercel tool can inspect projects and deployments but does not expose an environment-variable write action. The owner must add the two public values in Vercel, then redeploy the branch.

## 5. Backend contract verified before implementation

The existing production backend remains unchanged.

Verified facts used by Phase 1:

- Supabase project: `xdstipqlrnnuutggvhbz`;
- `chat` Edge Function is active and requires JWT;
- the function authenticates the user, rate-limits requests, moderates input/output, classifies safety risk, retrieves the user's profile/memories/goals, calls the server-side OpenAI Responses API, persists standard-mode messages, and returns structured safety actions;
- profiles, conversations, messages, memories, and goals already exist;
- owner RLS checks use `auth.uid()`;
- deleting a conversation cascades to its messages;
- separately saved memories set their source-conversation reference to null rather than being silently deleted;
- no production DDL was required or applied.

## 6. What is not yet proven

The following remain open and block merge/readiness claims:

1. Vercel public Supabase variables are not configured.
2. The latest strict-gate deployment is red by design until configuration is added.
3. Sign-up, email confirmation, sign-in, password reset, and session restoration have not been completed by a real browser user on the protected preview.
4. Supabase redirect allowlisting for the protected Vercel preview has not been proven.
5. A real authenticated standard-mode AI exchange has not been completed end to end from the web client.
6. A real private-mode exchange has not been manually checked for absence from normal conversation history.
7. Conversation resume and deletion have not been manually checked against a real test account.
8. Owner mobile/desktop visual review has not occurred.
9. Phase 2 actions—plans, memories, and reports—are intentionally hidden, not implemented.
10. Momentum, Daily Moves, levels, and full celebration behavior remain Phase 3.

## 7. Required next verification

After the two public Vercel values are added:

1. Redeploy the latest branch head.
2. Require both validators, all 21 tests, and production compilation to pass again.
3. Open the protected `/iam` preview in a real browser.
4. Create or use a dedicated test account.
5. Complete onboarding in each lane at least once.
6. Send a normal standard-mode message and verify the real AI response and persisted history.
7. Reload, resume, and delete the test conversation.
8. Send a private-mode message and verify it does not enter normal conversation history.
9. Test sign-out, sign-in, password-reset request, and password update.
10. Check mobile and desktop layouts, keyboard operation, reduced motion, no dead controls, Safety links, and noindex/no-store headers.

## 8. Merge recommendation

Keep the pull request in **draft** state.

Do not merge until:

- the two public Vercel values are configured;
- the latest branch deployment is `READY` under the strict configuration gate;
- a real authenticated AI exchange is proven;
- the owner visually and functionally reviews the protected preview;
- unresolved findings are either fixed or explicitly accepted.

No native build authorization is implied by eventual web merge.