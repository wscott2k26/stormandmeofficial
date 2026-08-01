# I AM Activation Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the approved I AM product bible into a reviewable activation package: verified domain/trademark findings, a complete clickable Release 1.0 screen prototype, formal draft safety/privacy/resource-governance policies, and a conservative architecture/budget/release decision record without creating duplicate infrastructure or running an EAS build.

**Architecture:** Keep the native app and live Supabase project as the system of record. Add a non-production, noindex prototype and governance documents to the existing `stormandmeofficial` repository on an isolated branch. Use the existing Storm And Me website only for internal review and already-approved public legal/support routes; do not create another Vercel or Supabase project.

**Tech Stack:** React 19, React Router, Tailwind CSS, Framer Motion, Lucide React, Create React App, Vercel, Supabase.

## Global Constraints

- Working product name remains `I AM` only as a working title until professional trademark clearance.
- One universal app; experience lanes are Him, Her, and Becoming/custom.
- Initial audience is U.S. adults age 18+.
- No therapy, clinical diagnosis, emergency monitoring, guaranteed safety, legal advice, financial advice, or exclusivity claims.
- No domain purchase, trademark filing, paid service, EAS build, TestFlight upload, Google Play upload, or store submission in this plan.
- Do not create a second Supabase project or a second Vercel project.
- Do not place OpenAI, Apple, Google, RevenueCat, service-role, signing, or webhook secrets in GitHub or client code.
- Do not merge to `main` until the prototype build, route audit, legal-copy review, and security findings are reviewed.
- The prototype must be clearly labeled `Internal concept review`, use synthetic data, and include `noindex` behavior.
- High-stakes resources must come from approved records with source, jurisdiction, verification date, expiry/review date, and status.
- Safety resources and account deletion must never be paywalled.

---

## File Map

- Create: `frontend/src/data/iamPrototypeScreens.js` — canonical Release 1.0 screen inventory and synthetic prototype copy.
- Create: `frontend/src/pages/IamPrototype.js` — interactive phone-frame prototype with area navigation, lane switching, next/back controls, and safety/legal callouts.
- Create: `frontend/src/pages/IamPrototype.test.js` — smoke tests for complete area coverage, screen navigation, working-title notice, and safety shortcuts.
- Modify: `frontend/src/App.js` — add the unlinked `/iam/internal-prototype` route.
- Create: `docs/iam/IAM_DOMAIN_AND_TRADEMARK_RISK_REVIEW.md` — domain facts, preliminary USPTO findings, risk level, and owner decision gate.
- Create: `docs/iam/IAM_SAFETY_POLICY_DRAFT.md` — product boundaries, crisis routing, abuse-safe behavior, dependency protections, and incident escalation.
- Create: `docs/iam/IAM_PRIVACY_AND_RETENTION_INVENTORY_DRAFT.md` — data categories, purpose, storage, retention, user controls, processors, and deletion rules.
- Create: `docs/iam/IAM_RESOURCE_GOVERNANCE_POLICY_DRAFT.md` — approved-resource lifecycle and verification process.
- Create: `docs/iam/IAM_ARCHITECTURE_BUDGET_RELEASE_DECISION.md` — existing infrastructure, build-once decision, cost controls, release gates, and unresolved owner actions.
- Create: `docs/iam/IAM_ACTIVATION_VERIFICATION_REPORT.md` — evidence from GitHub, Supabase, Vercel, domain checks, route checks, and build validation.

---

### Task 1: Record domain and trademark facts

**Files:**
- Create: `docs/iam/IAM_DOMAIN_AND_TRADEMARK_RISK_REVIEW.md`

**Interfaces:**
- Consumes: Current domain availability checks, owner email search, preliminary official USPTO/TTAB records.
- Produces: `domainDecision`, `workingNameRisk`, and `publicBrandGate` decisions used by all later tasks.

- [ ] **Step 1: Write the evidence table**

Record the checked date, method, observed availability, price/term, and whether ownership was proven. State explicitly that unavailable does not prove the owner controls a domain.

- [ ] **Step 2: Record trademark risk**

Document the crowded `I AM` field and existing `I AM HER` registrations/proceedings. Label the review `preliminary and not legal clearance`.

- [ ] **Step 3: Set the safe interim decision**

Use `I AM — working title` in internal materials. Do not buy a domain or launch public branding until registrar ownership and attorney clearance are documented.

- [ ] **Step 4: Review for unsupported claims**

Search the document for `owns`, `cleared`, `approved trademark`, and `safe to launch`. Each occurrence must be supported or replaced with qualified language.

- [ ] **Step 5: Commit**

```bash
git add docs/iam/IAM_DOMAIN_AND_TRADEMARK_RISK_REVIEW.md
git commit -m "docs: record I AM domain and trademark risk"
```

### Task 2: Build the complete clickable screen prototype

**Files:**
- Create: `frontend/src/data/iamPrototypeScreens.js`
- Create: `frontend/src/pages/IamPrototype.js`
- Create: `frontend/src/pages/IamPrototype.test.js`
- Modify: `frontend/src/App.js`

**Interfaces:**
- Consumes: Product Bible screen inventory and Release 1.0 must-ship capabilities.
- Produces: `IAM_PROTOTYPE_AREAS`, `getPrototypeScreen(areaId, screenId)`, and route `/iam/internal-prototype`.

- [ ] **Step 1: Write the failing inventory tests**

Tests must assert that the registry includes onboarding, home, talk, plan, career, relationships, wellness, confidence/style, safety, community, memory, profile/subscription, and admin/support; every area has at least one screen; IDs are unique; Safety is reachable from Home, Talk, and Profile; and the prototype displays a working-title warning.

- [ ] **Step 2: Run tests to verify failure**

```bash
cd frontend
yarn test --watchAll=false --runInBand src/pages/IamPrototype.test.js
```

Expected: failure because the registry and page do not exist.

- [ ] **Step 3: Implement the canonical registry**

Each screen entry must contain:

```js
{
  id: 'stable-kebab-id',
  title: 'Visible screen title',
  eyebrow: 'Area label',
  summary: 'One-screen purpose',
  primaryAction: 'Concrete next action',
  secondaryAction: 'Optional back or alternate action',
  safetyNote: null,
  premium: false
}
```

Do not include dead `Coming soon` entries. Deferred features stay out of the registry.

- [ ] **Step 4: Implement the interactive prototype**

The page must provide area tabs, phone-frame rendering, lane selector, screen list, previous/next buttons, primary-action progression, progress indicator, mobile/desktop responsiveness, synthetic content, safety quick-exit demonstration, and links to existing privacy/terms/safety/support/deletion pages.

- [ ] **Step 5: Add route without navigation exposure**

Import `IamPrototype` in `frontend/src/App.js` and add:

```jsx
<Route path="/iam/internal-prototype" element={<IamPrototype />} />
```

Do not add the route to the public header or sitemap.

- [ ] **Step 6: Run focused tests**

```bash
cd frontend
yarn test --watchAll=false --runInBand src/pages/IamPrototype.test.js
```

Expected: all prototype tests pass.

- [ ] **Step 7: Run production build**

```bash
cd frontend
yarn build
```

Expected: Create React App production build succeeds with no compile errors.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/data/iamPrototypeScreens.js frontend/src/pages/IamPrototype.js frontend/src/pages/IamPrototype.test.js frontend/src/App.js
git commit -m "feat: add internal I AM release prototype"
```

### Task 3: Formalize safety and dependency protections

**Files:**
- Create: `docs/iam/IAM_SAFETY_POLICY_DRAFT.md`

**Interfaces:**
- Consumes: Product Bible safety matrix, existing public Safety Statement, and live Edge Function architecture.
- Produces: policy controls for prompt design, model evaluation, incident operations, and release review.

- [ ] **Step 1: Define scope and non-capabilities**

State that the product is not emergency response, real-time monitoring, therapy, diagnosis, treatment, legal counsel, or a guarantee of safety.

- [ ] **Step 2: Define risk levels and routing**

Document ordinary distress, elevated risk, imminent self-harm/violence, abuse/stalking/coercive control, and medical emergency routes. Include fail-safe behavior when classification is uncertain.

- [ ] **Step 3: Define survivor-centered abuse controls**

Include safe-device warnings, no confrontation defaults, no automated leaving instructions, quick exit limitations, local drafting for safety plans, and verified advocate resources.

- [ ] **Step 4: Define emotional-dependency protections**

Ban exclusivity, jealousy, guilt, threats of abandonment, simulated consciousness claims, replacement-of-human-relationships language, and crisis-triggered retention tactics.

- [ ] **Step 5: Define incident and release gates**

Specify report intake, severity assignment, containment, preservation, correction, model/prompt rollback, post-incident review, and expert sign-off before controlled launch.

- [ ] **Step 6: Commit**

```bash
git add docs/iam/IAM_SAFETY_POLICY_DRAFT.md
git commit -m "docs: add I AM safety policy draft"
```

### Task 4: Formalize privacy, retention, and resource governance

**Files:**
- Create: `docs/iam/IAM_PRIVACY_AND_RETENTION_INVENTORY_DRAFT.md`
- Create: `docs/iam/IAM_RESOURCE_GOVERNANCE_POLICY_DRAFT.md`

**Interfaces:**
- Consumes: Live 35-table schema, existing public Privacy Policy, resource verification tables, and account-deletion workflow.
- Produces: reviewable data inventory and verified-resource operating rules.

- [ ] **Step 1: Map data categories**

Cover identity/auth, consents, profiles/preferences, conversations/messages, memories, goals/check-ins, career documents/analyses, relationship/wellness artifacts, safety plans, community content, reports/blocks, subscriptions, push tokens, analytics/errors, audit logs, support, deletion, and Apple revocation tokens.

- [ ] **Step 2: Map purpose, storage, access, and deletion**

For each category, record purpose, source, system of record, sensitivity, client/server access, retention trigger, deletion behavior, and required legal/operational exceptions.

- [ ] **Step 3: Set privacy defaults**

Document opt-in memory, private-session behavior, minimum analytics, no advertising profiles from sensitive data, no sale of sensitive data, and no production data in development.

- [ ] **Step 4: Define resource states**

Use `draft`, `pending_review`, `verified`, `expired`, `suspended`, and `retired`. Only `verified` and unexpired records may be shown in high-stakes contexts.

- [ ] **Step 5: Define verification cadence**

Require source URL, jurisdiction, contact methods, accessibility/language metadata, reviewer, verification timestamp, next review/expiry, and correction history.

- [ ] **Step 6: Commit**

```bash
git add docs/iam/IAM_PRIVACY_AND_RETENTION_INVENTORY_DRAFT.md docs/iam/IAM_RESOURCE_GOVERNANCE_POLICY_DRAFT.md
git commit -m "docs: add I AM privacy and resource governance drafts"
```

### Task 5: Approve conservative architecture and budget gates

**Files:**
- Create: `docs/iam/IAM_ARCHITECTURE_BUDGET_RELEASE_DECISION.md`

**Interfaces:**
- Consumes: Live provider inventory, owner build-credit preferences, current app completion report, and security advisor output.
- Produces: approved no-duplicate architecture, cost ceilings, and release-gate checklist.

- [ ] **Step 1: Record existing infrastructure**

Document Supabase project `xdstipqlrnnuutggvhbz`, existing Storm And Me Vercel project, existing public legal/support routes, and the absence of a connected I AM GitHub source repository.

- [ ] **Step 2: Lock the one-of-each architecture**

Approve one mobile source repository, one production Supabase project, one development/staging environment only when testing begins, one RevenueCat project, and one consolidated iOS/Android build cycle.

- [ ] **Step 3: Create cost-control tiers**

Use:

- `$0 now`: prototype, policies, source handoff, security fixes, static verification.
- `Owner-authorized setup`: domains, trademark attorney/search, provider accounts, expert reviews.
- `Build-authorized`: one development/release build per platform after `ready:build` passes.
- `Launch-authorized`: controlled U.S. rollout only after safety, privacy, accessibility, store, purchase, deletion, and incident gates pass.

Do not invent provider prices that were not directly verified.

- [ ] **Step 4: Record security blockers**

Include the current Supabase advisor warning about anonymous-sign-in exposure and require policy/auth review before accepting real users. Do not apply blind DDL changes without the migration source and regression tests.

- [ ] **Step 5: Record owner-only credential gates**

List OpenAI project key/budget, Google OAuth, Apple identifier/key, EAS project ID, Firebase/FCM, App Store/Play subscriptions, RevenueCat keys/webhook, and final build authorization.

- [ ] **Step 6: Commit**

```bash
git add docs/iam/IAM_ARCHITECTURE_BUDGET_RELEASE_DECISION.md
git commit -m "docs: approve I AM architecture and release gates"
```

### Task 6: Quadruple verification and PR handoff

**Files:**
- Create: `docs/iam/IAM_ACTIVATION_VERIFICATION_REPORT.md`

**Interfaces:**
- Consumes: All completed tasks and connected-provider checks.
- Produces: auditable result and merge/no-merge recommendation.

- [ ] **Step 1: Verification layer 1 — source and diff**

Compare the activation branch to `main`. Confirm only the planned files changed and no secrets, IDs, package versions, checkout code, or build workflows changed.

- [ ] **Step 2: Verification layer 2 — build and route**

Confirm the Vercel preview build is READY. Open `/iam/internal-prototype`, `/iam/privacy`, `/iam/terms`, `/iam/safety`, `/iam/support`, and `/iam/delete-account`; record HTTP/render results.

- [ ] **Step 3: Verification layer 3 — backend**

Recheck project health, 35 public tables, 35 RLS-enabled tables, 43 policies, 10 active Edge Functions, 4 circles, 4 achievements, and 2 current verified resources. Re-run security and performance advisors.

- [ ] **Step 4: Verification layer 4 — business/legal facts**

Recheck domain availability immediately before any purchase decision. Confirm trademark review is still labeled preliminary and no ownership or legal-clearance claim is made.

- [ ] **Step 5: Secret and risky-copy scan**

Search changed files for `sk-`, service-role keys, private keys, webhook secrets, passwords, medical/therapy claims, guaranteed safety, emergency monitoring, exclusivity, and unsupported ownership language.

- [ ] **Step 6: Create draft pull request**

Open a draft PR from `iam-activation-2026-08-01` to `main`. Include verified results, unresolved blockers, exact no-spend/no-build statement, and rollback scope.

- [ ] **Step 7: Merge recommendation**

Recommend merge only when the preview passes and the owner accepts the working-title/trademark hold. Keep native build authorization separate.

---

## Self-Review

- Spec coverage: all five owner-approved activation actions are represented.
- No placeholders: every task has a concrete deliverable, command, or decision rule.
- Type consistency: prototype registry fields and route names are consistent across tasks.
- Safety gap: expert clinical/survivor review remains a launch gate and is not falsely marked complete.
- Source gap: native mobile source is not in the connected GitHub account; this plan does not fabricate or overwrite it.
- Cost gap: domains, legal review, provider credentials, and builds require separate owner authorization.
