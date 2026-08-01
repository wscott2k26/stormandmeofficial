# I AM Verified Resource Governance Policy — Draft

**Owner:** Storm And Me LLC  
**Product:** I AM — working title  
**Scope:** Crisis, domestic-violence, stalking, medical-emergency orientation, legal-aid, housing, food, employment, mental-health, and other high-stakes support resources.

## 1. Core rule

The language model may explain categories of help, but it may not invent or freely generate a high-stakes organization's name, phone number, text code, URL, address, operating hours, language support, eligibility, jurisdiction, availability, cost, or service promise. High-stakes contacts shown to users must come from the approved resource database.

## 2. Record states

- **draft:** entered but not reviewed; never user-visible in high-stakes retrieval.
- **pending_review:** evidence assembled and assigned to a reviewer; not user-visible.
- **verified:** official source checked, required fields complete, review current; eligible for display.
- **expired:** review date passed; automatically excluded from high-stakes display.
- **suspended:** potentially inaccurate, unsafe, inaccessible, compromised, or under investigation; immediately excluded.
- **retired:** intentionally removed because service ended, territory changed, a replacement was approved, or the record is no longer appropriate.

Only `verified` records with a completed verification timestamp and no current expiry/suspension may be returned.

## 3. Required fields

Every verified record must include:

- canonical organization and service name;
- service category and risk context;
- official source URL and source type;
- national/state/local jurisdiction and geographic coverage;
- supported contact methods: call, text, chat, website, email, in-person, or other;
- each contact value in a structured field;
- hours/availability with time zone when applicable;
- language and accessibility information when verified;
- eligibility, cost, confidentiality, or documentation notes when officially stated;
- limitations and user-facing caution notes;
- reviewer identity/role;
- verification time;
- next review/expiry time;
- verification evidence and change history;
- active/suspended/retired state and reason.

Unknown information must be labeled unknown, not guessed.

## 4. Source hierarchy

Preferred evidence, in order:

1. official government or official service-provider page;
2. direct verified communication from the provider;
3. official national/state/local directory with documented maintenance;
4. reputable partner organization linking to the official provider;
5. secondary directory only as a lead for further verification, never sole evidence for a high-risk contact.

Search-engine snippets, AI output, social posts, scraped lists, blogs, review sites, and user comments are not sufficient verification by themselves.

## 5. Verification procedure

1. Confirm the official organization identity and source domain.
2. Compare every structured contact value with the official source.
3. Confirm jurisdiction and service type.
4. Confirm hours, language, accessibility, cost, and eligibility only when stated.
5. Test web links for correct destination and secure transport.
6. For critical national resources, use a second evidence check or direct provider confirmation when feasible.
7. Record reviewer, timestamp, evidence, next review, and notes.
8. Publish only after an authorized second-person or policy-approved review step for critical resources.

The system must preserve prior values and verification history rather than silently overwriting them.

## 6. Review cadence

- Critical crisis and abuse resources: review at least every 90 days and immediately after a correction, public incident, provider notice, or failed contact report.
- Government/emergency orientation resources: review at least every 180 days and after material official changes.
- Other high-stakes support resources: review at least every 180 days unless volatility requires a shorter period.
- Local resources with changing capacity or eligibility: use shorter review windows and state that availability must be confirmed directly.

Expiry must be enforced automatically. A missed review removes the record from high-stakes retrieval; it does not silently extend verification.

## 7. User-facing presentation

A displayed resource must show enough context for an informed choice:

- organization/service name;
- what it offers and where;
- available contact methods;
- important limitations;
- verification/review information;
- a reminder that details and availability can change.

The app must not imply endorsement, guaranteed response, guaranteed shelter, confidentiality beyond the provider's terms, legal outcome, medical outcome, eligibility, or service availability.

## 8. Location and privacy

- Use national options when a user does not choose to share location.
- Request the least precise location needed, usually state, county, city, or ZIP—not exact GPS or street address.
- Explain why location is requested and allow refusal.
- Do not persist location for resource discovery unless the user knowingly chooses to save it for another feature.
- Avoid sensitive resource names in lock-screen notifications, analytics event text, or public URLs.

## 9. Correction and suspension

Users and providers may submit a resource correction through the protected support flow. A correction request must:

- create a review record;
- capture the reported field and supporting source when available;
- avoid exposing the reporter publicly;
- trigger immediate suspension when the report plausibly indicates dangerous or materially false contact information;
- require authorized human review before publication;
- record the final decision and evidence.

No correction from a public form publishes automatically.

## 10. Failure behavior

When no current verified result is available:

- clearly say that a verified matching local resource was not found;
- show current verified national options relevant to the user's chosen need;
- encourage direct confirmation of details;
- for immediate danger, orient to local emergency services without trapping the user in search;
- never let the model fill the gap with invented contact information.

When the resource service or database is unavailable, use a small, versioned emergency fallback set that has been separately verified and packaged for that release. Fallback content must have ownership, review dates, tests, and an emergency update path.

## 11. Technical controls

- Retrieval queries require `verification_status = 'verified'`, a non-null verification time, and an unexpired/unsuspended state.
- User-facing clients cannot directly promote records to verified.
- Admin operations are role-restricted and audited.
- Critical field changes require review metadata.
- Edge Functions return structured resource objects, not unbounded model prose.
- Cache lifetimes cannot outlive the resource's verification window.
- Tests cover expired, suspended, missing-field, wrong-jurisdiction, provider-outage, and hallucinated-resource scenarios.
- Analytics record category and result status, not sensitive query text by default.

## 12. Current production inventory finding

The August 1, 2026 live-backend check found **two** records meeting the current verified, timestamped, and unexpired criteria. That is enough to prove the mechanism, not enough to claim comprehensive U.S. coverage. Coverage expansion and expert review remain release gates.

## 13. Roles

- **Resource reviewer:** verifies source and structured fields.
- **Safety lead:** approves critical categories, wording, cadence, and emergency fallback behavior.
- **Privacy/security reviewer:** approves location handling, access, logs, and correction evidence.
- **Operations owner:** monitors expirations, failures, queues, and provider changes.
- **Engineering owner:** enforces retrieval, state transitions, caching, tests, and rollback.

One person may hold multiple roles during early development, but critical verification should not rely on unreviewed AI output or a single automated action.

## 14. Release gates

Before controlled launch:

- national crisis and domestic-violence resources are current and expert-reviewed;
- emergency orientation and safer-device wording are approved;
- required U.S. coverage scope is defined honestly;
- expiration and suspension are tested in production-like conditions;
- correction forms and queues work;
- admin access and audit logging are reviewed;
- offline/provider-failure fallback is tested;
- no model-generated contact information appears in red-team tests.
