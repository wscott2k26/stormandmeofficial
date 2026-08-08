# I AM Phase 1 Core Auth and Chat — Verification Report

**Date:** 2026-08-02  
**Owner:** Storm And Me LLC  
**Working title:** I AM  
**Branch:** `iam-real-web-phase-1`  
**Status:** The implementation, source validators, and latest 26-test suite are proven. An earlier Phase 1 revision compiled successfully. The current branch remains **blocked** before final compilation and runtime authentication until the two public Supabase browser variables are configured in Vercel and the owner completes a real browser walkthrough.

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
- real standard-mode conversation creation and saved history;
- real authenticated invocation of the existing Supabase `chat` Edge Function;
- accurately described private mode that does not intentionally persist normal conversation history;
- owner-scoped saved-history opening and conversation deletion;
- safe filtering that hides unsupported Phase 2 plan, memory, and report actions;
- deliberate `tel:` and Safety Path actions returned by the backend;
- 8,000-character composer limit, loading, offline, rate-limit, retry, and uncertain-send reconciliation states;
- premium responsive gradients and a living-light visual foundation;
- reduced-motion and keyboard-focus support;
- noindex/no-store handling for private routes;
- build-blocking checks for configuration, dead controls, route isolation, browser secrets, auth capabilities, honest history language, and the existing 13-area/113-screen product map.

## 2. Isolation and diff verification

The branch started from reviewed `main` commit:

`97751673cca440ad5758d417a6e8c3b64f343e72`

The branch remains:

- isolated from open PR #3 (`feat/featured-shirts-deploy`);
- limited to I AM frontend code, tests, validators, verification documentation, `App.js`, `SeoManager.js`, `frontend/package.json`, and private-route Vercel headers;
- unmerged and contained in draft PR #5.

No Expo, EAS, native app, TestFlight, Google Play, domain, trademark, subscription, or production database migration was touched.

## 3. Proven build and test evidence

### Earlier full compile proof

Vercel deployment:

- ID: `dpl_59VAdkcN611rBFYKnK5pjeQdzUYm`
- Commit: `669afb8b3251399a1c6f6346594bf0ffaa709a73`
- State: `READY`

Evidence:

- existing prototype validator passed: **13 areas, 113 screens, 13 unique area IDs, 113 unique screen IDs**;
- real-app validator passed;
- Jest: **8 test suites passed / 8 total**;
- Jest: **21 tests passed / 21 total**;
- Create React App result: **Compiled successfully**.

### Latest functional-source test proof

Vercel deployment:

- ID: `dpl_DnzMbbGsZv78vWawSRn7h1SKptsi`
- Commit: `332d2f3da5ea58aac9adcdb7267938ac2d0f6ed2`
- State: `ERROR` only because the strict environment gate intentionally stopped the build after tests

Evidence before the configuration stop:

- existing prototype validator passed: **13 areas / 113 screens**;
- Jest: **8 test suites passed / 8 total**;
- Jest: **26 tests passed / 26 total**;
- the expanded tests cover first-message interruption cleanup, uncertain-send recovery, preserved conversation identity, failed-history fallback, private-mode no-row creation, auth boundaries, owner profile payloads, route isolation, and safe action filtering;
- exact stop: `REACT_APP_SUPABASE_URL is missing or does not match the approved I AM project`.

The latest branch has additional honesty-validator and documentation-only changes after that functional-source commit. Final production compilation of the current branch is intentionally impossible until the approved public configuration is present.

The builds emitted existing dependency deprecation and peer-dependency warnings. They are not represented as resolved by Phase 1.

## 4. Focused reliability review and fixes

A focused review of authentication, protected routing, standard/private chat, saved history, and deletion found and corrected a first-message interruption edge case.

Before the correction, a brand-new standard conversation could be created before the Edge Function request, then a network interruption could leave the browser without the new conversation ID for reconciliation.

The corrected behavior now:

- removes a newly created blank conversation after an explicit HTTP/function failure;
- preserves the new conversation ID when an uncertain network interruption may have persisted the message;
- reconciles against the server before allowing a duplicate resend;
- preserves the conversation identity after reconciliation;
- keeps a successful AI response visible even when history reload temporarily fails;
- automatically re-enables the composer after the temporary client-side rate-limit pause.

These behaviors are covered by the expanded 26-test suite.

## 5. Runtime configuration gate

The preview cannot be called functional unless Vercel provides:

- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`

The URL must equal:

`https://xdstipqlrnnuutggvhbz.supabase.co`

The key must be an enabled public/anon or publishable browser key. Service-role and OpenAI credentials are expressly prohibited from the browser.

The connected Vercel tools can inspect projects and deployments but do not expose an environment-variable write action. The owner must add the two public values in Vercel, then redeploy the branch.

### 2026-08-08 redeploy verification trigger

The owner reported that both public values were added in Vercel. A documentation-only commit was intentionally pushed to this branch to force a fresh Preview deployment so the strict build gate can prove whether those values are actually present in the Preview build environment. No application logic, Supabase schema, Edge Function, Expo/EAS, or native build behavior is changed by this trigger.

A second documentation-only trigger was pushed after the owner confirmed both variables were saved, specifically to prove the updated Preview environment on the `iam-real-web-phase-1` branch rather than relying on a production redeploy of `main`.

## 6. Backend contract and current thread-context limit

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

### Important limitation

The current `chat` Edge Function does **not** load prior messages from the selected conversation into the model request. Saved messages can be displayed and deleted, but the AI currently responds to the newest user message plus profile, approved memories, and active goals—not the full prior thread.

The web interface now discloses this limitation and uses `Open saved history` language rather than claiming full thread continuity.

True multi-turn continuity requires a separately reviewed Edge Function change with:

- owner-only conversation lookup;
- bounded recent-message retrieval;
- context/token limits;
- private-mode exclusion;
- safety and prompt-injection tests;
- regression evaluation;
- controlled deployment and rollback evidence.

No silent production Edge Function change was made in this phase.

## 7. What is not yet proven

The following remain open and block merge/readiness claims:

1. Vercel public Supabase variables are not configured.
2. The current strict-gate deployment is red by design until configuration is added.
3. Sign-up, email confirmation, sign-in, password reset, and session restoration have not been completed by a real browser user on the protected preview.
4. Supabase redirect allowlisting for the protected Vercel preview has not been proven.
5. A real authenticated standard-mode AI exchange has not been completed end to end from the web client.
6. A real private-mode exchange has not been manually checked for absence from normal conversation history.
7. Saved-history opening and conversation deletion have not been manually checked against a real test account.
8. True multi-turn AI thread context is not implemented.
9. Owner mobile/desktop visual review has not occurred.
10. Phase 2 actions—plans, memories, and reports—are intentionally hidden, not implemented.
11. Momentum, Daily Moves, levels, and full celebration behavior remain Phase 3.

## 8. Required next verification

After the two public Vercel values are added:

1. Redeploy the latest branch head.
2. Require both validators, all **26 tests**, and production compilation to pass again.
3. Open the protected `/iam` preview in a real browser.
4. Create or use a dedicated test account.
5. Complete onboarding in each lane at least once.
6. Send a normal standard-mode message and verify the real AI response and persisted history.
7. Reload, open, and delete the test conversation while recognizing the current thread-context limitation.
8. Send a private-mode message and verify it does not enter normal conversation history.
9. Test sign-out, sign-in, password-reset request, and password update.
10. Check mobile and desktop layouts, keyboard operation, reduced motion, no dead controls, Safety links, and noindex/no-store headers.

A separate backend plan is required before enabling full multi-turn model context.

## 9. Merge recommendation

Keep pull request #5 in **draft** state.

Do not merge until:

- the two public Vercel values are configured;
- the latest branch deployment is `READY` under the strict configuration gate;
- a real authenticated AI exchange is proven;
- the owner visually and functionally reviews the protected preview;
- the current thread-context limitation is accepted for Phase 1 or resolved through a separately approved backend change;
- unresolved findings are either fixed or explicitly accepted.

No native build authorization is implied by eventual web merge.