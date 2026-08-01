# I AM Architecture, Budget, and Release Decision

**Owner:** Storm And Me LLC  
**Product:** I AM — working title  
**Decision date:** August 1, 2026  
**Decision:** Continue activation using existing infrastructure; create no duplicate production systems and spend no build/domain/trademark money without a separate owner decision.

## 1. Verified current state

### Supabase

- Project: **I AM Premium**
- Reference: `xdstipqlrnnuutggvhbz`
- Region: U.S. East
- Status at verification: `ACTIVE_HEALTHY`
- Public tables: **35**
- RLS-enabled public tables: **35**
- RLS policies: **43**
- Active Edge Functions: **10**
- Active circles: **4**
- Seed achievements: **4**
- Currently verified and unexpired resources meeting the checked criteria: **2**

This is the production backend. Do not create another production Supabase project.

### Edge Functions observed

- `chat`
- `moderate-community`
- `admin-ops`
- `delete-account`
- `verify-purchase`
- `analyze-career`
- `apple-auth-token`
- `public-request`
- `revenuecat-webhook`
- `dispatch-notification`

Eight functions currently require JWT according to the connected inventory. `public-request` and `revenuecat-webhook` are intentionally public-facing patterns that require their own validation, rate limiting, anti-abuse, and secret/signature controls.

### GitHub

- Connected owner: `wscott2k26`.
- No repository dedicated to the native I AM source was found in the connected account.
- The existing `wscott2k26/stormandmeofficial` repository contains the public website and I AM legal/support routes.
- This activation package is isolated on branch `iam-activation-2026-08-01` in that website repository.
- The website repository is **not** declared the canonical native-mobile source repository.

Before native work resumes, the complete existing mobile source must be placed in one private, owner-controlled repository with its real history/migrations where available. Do not rebuild the native app from reports or create competing copies.

### Vercel

- Existing project: `stormandmeofficial`.
- Existing public I AM routes: privacy, terms, safety, support, and account deletion.
- The internal clickable prototype uses the same project on an isolated preview branch.
- Do not create another Vercel project for the prototype.

### Domains and name

- `iamhim.ai` was observed as available through Vercel at **$160 for two years**.
- `iamher.ai` was observed as unavailable.
- Connected email did not prove ownership of either exact domain.
- `I AM` and `I AM HER` have meaningful preliminary trademark risk.

No domain purchase or public-brand approval is included in this decision.

## 2. Approved architecture

### Product model

- One universal React Native/Expo mobile app.
- One account and one subscription entitlement.
- Three user-selectable experience lanes: Him, Her, and Becoming/custom.
- One public web/legal/support surface under Storm And Me LLC.
- One server-side AI gateway and one governed resource system.

### Environment model

1. **Local development:** synthetic/test accounts and non-production secrets.
2. **Staging:** create only when owner-controlled provider configuration and real-device testing begin; no production user data.
3. **Production:** existing I AM Premium Supabase project and final store applications.

Do not use production user data for local or staging tests. Do not create empty environments merely to look enterprise-grade.

### Backend and AI

- Supabase Auth/PostgreSQL/Storage/Edge Functions remain the core backend.
- AI provider calls remain server-side through authenticated, rate-limited functions.
- High-stakes resources come from verified structured data, not free model generation.
- Service-role, AI, Apple, Google, RevenueCat, signing, notification, and webhook secrets remain server-side.
- Admin functions remain separate from user functions with audit records and least privilege.

### Payments

- Apple App Store and Google Play subscriptions are the mobile billing systems.
- RevenueCat may unify verified entitlement state after products and webhook credentials are configured.
- The app fails closed: paid UI does not grant entitlement based only on a client claim.
- Safety resources, reporting, privacy controls, and account deletion are never paywalled.

### Website

- Continue using the existing Storm And Me Vercel project for legal, support, deletion, and internal review.
- The internal prototype remains unlinked from public navigation and uses `noindex` behavior.
- A future marketing site/domain change should point into the same product architecture rather than fork the app.

## 3. Security decision

The August 1 Supabase security-advisor review produced warnings that policies may be available to anonymous roles across numerous tables and informational notices that five server-owned tables have RLS enabled without client policies. The warnings require source-level investigation before real-user launch.

### Required handling

- Do not disable RLS.
- Do not add broad policies merely to silence the advisor.
- Do not change production DDL without the canonical migration source, a staging reproduction, and regression tests.
- Confirm whether anonymous sign-in is enabled and whether each policy is scoped to `authenticated` versus `public`/`anon` roles.
- Test unauthenticated reads/writes against every user, community, report, resource, entitlement, audit, admin, and safety table.
- Treat `admin_users`, `apple_auth_tokens`, `public_requests`, `purchase_events`, and `rate_limits` as server-owned unless the canonical source proves a different design.
- Re-run security and performance advisors after remediation.

**Release status:** backend exists and is healthy, but security review is **not cleared for real users** based on the current advisor output.

## 4. Budget gates

### Gate A — $0 activation work: approved now

- preserve and inspect source;
- clickable prototype and policy drafts;
- static validation and preview build;
- provider inventory and architecture documentation;
- security-policy analysis without untested production DDL;
- domain/trademark research that does not incur fees;
- source handoff into one private repository.

### Gate B — owner-authorized setup spending

Requires a separate yes and a current total before purchase:

- domain registration/transfer/renewal;
- trademark attorney/search/filing;
- licensed safety and survivor-services review;
- Apple/Google developer or store costs not already paid;
- RevenueCat, AI, monitoring, email/SMS, or other paid provider plans;
- design assets or contractors.

The owner must see initial price, renewal/recurring price, taxes/fees, cancellation terms, and the reason the expense is necessary.

### Gate C — owner-authorized provider configuration

May involve credentials or billing but not a native build:

- OpenAI project key and low budget/alerts;
- Google OAuth and Supabase provider settings;
- Apple identifier, key, provider, and server secrets;
- Firebase Android app and FCM credential;
- App Store and Play subscription products;
- RevenueCat project, entitlement, offering, SDK keys, and webhook secret;
- monitoring/error alert ownership.

Never paste private keys into ChatGPT, screenshots, ordinary email, GitHub, or an `EXPO_PUBLIC_` variable unless the key is specifically designed to be public.

### Gate D — consolidated build authorization

A separate explicit authorization is required for each platform/build action. Before an EAS build:

- canonical source is in the owner-controlled repository;
- `npm run ready:build` passes;
- full tests/type/lint/config checks pass;
- trademark/app-name decision is accepted;
- security warnings are resolved or formally risk-accepted after evidence;
- provider credentials are configured;
- subscription products are available;
- store/legal/privacy/safety URLs work;
- build profile/version/build number are reviewed;
- expected Expo/EAS usage and cost are stated.

Do not run an EAS build or upload to TestFlight/Google Play under this activation decision.

### Gate E — controlled launch authorization

Requires successful real-device and store-sandbox testing plus safety, privacy, accessibility, moderation, resource, incident, deletion, purchase, and support gates. Begin with a small U.S. adult test group and defined rollback ownership.

## 5. Owner-controlled credentials still unresolved

- OpenAI production project key, model choice, and budget alerts.
- Google OAuth client and Supabase provider activation.
- Apple identifier/key/provider setup and token-revocation secrets.
- EAS project ID.
- Firebase Android configuration and FCM v1 credential.
- App Store Connect and Google Play app/subscription records.
- RevenueCat project keys, entitlement/offering, and webhook authorization.
- Error monitoring and operational alert recipients.
- Canonical native source repository.

These are blockers, not evidence that the architecture failed.

## 6. Release sequence

1. Preserve the complete native source in one private GitHub repository.
2. Reconcile source migrations/functions with the live 35-table/10-function backend.
3. Reproduce and resolve the anonymous-role security warnings in staging.
4. Complete trademark/name decision before store records and paid domains.
5. Complete expert safety, survivor-services, privacy, and accessibility reviews.
6. Configure owner-controlled providers and subscription products.
7. Run the source readiness gate locally.
8. Receive separate explicit authorization for one consolidated iOS build and one consolidated Android build.
9. Validate real devices, purchases, restore, auth, AI, reporting, community, notifications, Safety Path, resource failures, and deletion.
10. Submit only after review evidence is attached to the release record.

## 7. Decisions intentionally not made

- No domain selected or purchased.
- No trademark declared clear or filed.
- No native source repository was fabricated.
- No Supabase project, Vercel project, Expo project, Firebase project, store app, subscription, or RevenueCat project was created in this pass.
- No production database policy was changed blindly.
- No EAS build, TestFlight upload, Play upload, or paid deployment was initiated.
