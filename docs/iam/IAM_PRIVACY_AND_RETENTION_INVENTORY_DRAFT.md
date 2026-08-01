# I AM Privacy and Retention Inventory — Draft

**Owner:** Storm And Me LLC  
**Product:** I AM — working title  
**Status:** Internal implementation inventory. Public-policy language must be reconciled with actual source, provider settings, contracts, and counsel before launch.

## Privacy commitments

- Collect only data required for a user-selected feature.
- Memory is visible, consensual, editable, pausable, and deletable.
- Sensitive conversation, wellness, abuse, safety, career-document, and private-plan data is not sold or used to build advertising profiles.
- Server secrets never ship in the app or browser.
- Production user data is not copied into development or test environments.
- Safety and account deletion remain available without a paid entitlement.
- Private-session and quick-exit copy must explain device, browser, account, network, backup, and provider limitations.

## Systems of record

- **Supabase Auth/PostgreSQL/Storage:** identity, application records, user content, moderation, resources, support, audit, and operational data.
- **Supabase Edge Functions:** authenticated AI routing, moderation, account deletion, purchase verification, career analysis, Apple token handling, public requests, RevenueCat webhooks, and notification dispatch.
- **Apple/Google:** identity and app-store transaction records under their own terms.
- **RevenueCat:** subscription entitlement and lifecycle processing when activated.
- **OpenAI or approved AI provider:** requested inference through server-side functions when activated; provider settings must minimize retention where supported.
- **Expo/Firebase/APNs:** build and push-delivery infrastructure when activated.
- **Vercel:** public website, legal/support pages, and internal prototype preview.

## Data inventory

| Category | Example tables/data | Purpose | Sensitivity | Access | Retention/deletion requirement |
|---|---|---|---|---|---|
| Identity and authentication | Supabase Auth, `profiles`, Apple token records | Sign-in, account recovery, lane/preferences, deletion | High | User and restricted server/admin roles | Active account; delete or de-identify on verified deletion except narrow lawful/security records. Revoke linked tokens where implemented. |
| Adult confirmation and consent | `consents`, policy versions | Eligibility, community standards, legal record | High | User; restricted audit/admin | Keep current consent while active. Preserve minimum evidence of required consent changes when legally/operationally necessary. |
| Companion preferences | `profiles` | Lane, tone, humor, faith-sensitive language, communication style | Moderate/high | User and AI gateway | Until changed or account deletion. |
| Conversations and messages | `conversations`, `messages` | Deliver requested AI chat and history | High | User; AI gateway; restricted report review | User-controlled deletion. Account deletion removes user content except minimum evidence tied to a valid incident/legal obligation. Backup expiry must be documented before launch. |
| Private sessions | Local/session-scoped data and provider request | Temporary AI interaction | High | User device and server inference path | Must not enter normal cloud history. Temporary logs/caches and provider processing must be measured and disclosed. |
| Memories | `memories` | User-approved personalization | High | User and AI gateway | Until user edits/deletes, memory is paused, or account deletion. Original source conversation is separately controlled. |
| Goals and progress | `goals`, `goal_steps`, `check_ins`, `xp_events`, `achievements`, `user_achievements` | Plans, action steps, progress, ethical rewards | Moderate/high | User and authorized service logic | Until user deletes/archives/account deletion; avoid retaining high-risk state solely for engagement. |
| Career files and analyses | Storage objects, `resume_analyses`, `applications`, `interview_sessions` | Résumé review, job match, interview practice, tracking | High | User and career-analysis service | User-controlled deletion and account deletion. Uploaded files need short signed access and server-side type/size validation. |
| Relationship/wellness/style artifacts | `studio_artifacts`, relevant goals/check-ins | User-requested plans and saved boards | High | User and authorized service logic | Until user deletion/account deletion. Do not repurpose for advertising. |
| Safety-plan drafts | `safety_plans` and device-local drafts | User-controlled safety planning | Very high | User; only minimum protected server access when cloud save is explicitly chosen | Prefer device-local drafting where feasible. Cloud persistence requires explicit choice. Delete promptly on request/account deletion except narrow incident/legal evidence. |
| Community content | `circles`, `circle_members`, `community_posts`, `post_reactions` | Moderated adult community | Public or community-visible; may contain sensitive content | Members, public as configured, moderators/admin | User deletion subject to moderation/evidence needs. Removed content may be held in restricted form for appeals, safety, fraud, or legal obligations for a documented limited period. |
| Reports and blocks | `reports`, `blocks` | Safety, moderation, quality, user control | High | Reporter/blocked-user controls as designed; restricted moderators | Retain minimum necessary for investigation, repeat-abuse control, appeal, and legal obligations under a published internal schedule. |
| Resources and verification | `resources`, `resource_verifications` | Verified high-stakes referrals | Operational/public | Users; authorized reviewers | Keep active and historical verification records for accountability. Expired/suspended records must not surface in high-stakes retrieval. |
| Subscription state | `entitlements`, `purchase_events`, provider IDs | Access control, purchase/restore/refund lifecycle | High financial metadata; no full card data | User, store/webhook services, restricted billing support | Retain minimum records required for entitlement, fraud, accounting, dispute, and legal obligations. Card details remain with stores/payment providers. |
| Push tokens and preferences | `push_tokens`, profile settings | User-enabled neutral notifications | High device identifier | User and notification service | Remove on sign-out/device removal/account deletion; disable on provider rejection; never place sensitive content in payloads by default. |
| Analytics and errors | `analytics_events`, `client_errors` | Reliability, release quality, abuse prevention | Moderate; can become high if payloads are careless | Restricted operations | Minimize payloads; no raw sensitive conversation content by default. Set a documented maximum retention and scrub identifiers where possible. |
| Rate limits and fraud controls | `rate_limits`, security metadata | Protect users and infrastructure | Moderate/high | Server only | Short operational retention unless needed for a documented abuse/security incident. |
| Audit logs and admin access | `audit_logs`, `admin_users` | Accountability and incident review | High | Authorized administrators only | Tamper-resistant limited schedule aligned with security/legal needs. Never expose through normal client access. |
| Support/public requests | `public_requests`, deletion requests | Technical, billing, privacy, resource, unsafe-AI, and deletion support | High | Restricted support/admin | Retain through verification and resolution, then delete or minimize under a documented schedule; do not request passwords, codes, card data, IDs, or detailed medical records. |

## Retention schedule gate

Exact durations are not approved in this draft because they must match source behavior, provider backups, legal obligations, financial records, security needs, and deletion tests. Before launch, every category above must receive:

1. a primary-record duration or user-control trigger;
2. a backup/log expiry;
3. an incident/legal-hold exception;
4. a deletion method and accountable owner;
5. a verified test showing the published promise matches the system.

No public policy may say data is deleted immediately, within a fixed number of days, or never retained unless the complete data path has been tested.

## User controls required

- Inspect, edit, pause, and delete memories.
- Delete conversations and saved artifacts.
- Use a session that does not enter normal cloud history, with transparent limitations.
- Disable notifications and remove push tokens.
- Review consent and privacy choices.
- Export appropriate user-provided content where supported.
- Request permanent account deletion in-app and through the public page.
- Sign out and revoke sessions.
- Report unsafe AI, community content, privacy concerns, and inaccurate resources.

## Account-deletion workflow

A verified deletion must coordinate:

- Supabase Auth identity removal;
- profile, conversation, message, memory, goal, check-in, career, artifact, safety-plan, community, notification, and entitlement handling;
- uploaded-file deletion;
- Apple authorization-token revocation when applicable;
- RevenueCat/store entitlement separation from store-managed billing cancellation;
- deletion-request status and minimal lawful evidence;
- cache, queue, error-log, and backup expiry;
- user confirmation without exposing account details.

Deletion must be idempotent, auditable, least-privilege, and tested on a non-production account before release.

## Data minimization rules

- Do not ask for exact address, government ID, payment card, password, authentication code, medical record, or precise safety-plan details unless a narrowly approved workflow genuinely requires it.
- Resume uploads accept only approved types/sizes and use short-lived signed access.
- Resource location uses the least precise geography needed.
- Analytics events use allowlisted fields, not arbitrary user text.
- Reports include only the evidence needed to investigate the selected issue.
- Model prompts must not include unrelated memories or records.

## Security requirements

- RLS on every user-accessible table with authenticated-role review.
- Service-role, AI, signing, Apple, Google, RevenueCat, and webhook secrets remain server-side.
- Role-based admin access, audit logging, rate limits, upload validation, encryption in transit/at rest, and secret rotation.
- Separate development/staging/production data and credentials.
- Security advisor findings must be reviewed before real users are admitted.

## Public-policy reconciliation checklist

Before publication, compare this inventory with:

- the mobile source and migrations;
- live Supabase schema, policies, storage, auth, logs, and backups;
- every active Edge Function;
- Apple, Google, RevenueCat, OpenAI, Expo, Firebase, Vercel, and support-provider terms/settings;
- App Store Privacy Nutrition Labels and Google Play Data Safety declarations;
- the public Privacy Policy, Terms, Safety Statement, support form, and deletion form;
- South Carolina, U.S. federal, and applicable state privacy/consumer requirements.

Any mismatch blocks release until the system or policy is corrected.
