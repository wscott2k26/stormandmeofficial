# I AM Safety Policy — Draft for Expert Review

**Owner:** Storm And Me LLC  
**Product:** I AM — working title  
**Audience:** Adults age 18+ in the United States  
**Status:** Internal governance draft. Clinical-safety and survivor-services review is required before controlled launch.

## 1. Purpose

This policy defines the minimum safety behavior for the I AM mobile app, public website, AI gateway, community features, support operation, resource database, notifications, analytics, and administrative tools. Product convenience, engagement, subscription retention, and brand voice never override these controls.

## 2. Product boundaries

I AM is an AI-assisted life-planning and reflection product. It is not:

- emergency response or real-time crisis monitoring;
- therapy, medical care, diagnosis, treatment, or medication management;
- a licensed counselor, advocate, attorney, financial adviser, recruiter, or stylist;
- a guarantee that a person, device, relationship, plan, resource, or situation is safe;
- a substitute for qualified people or local emergency services;
- an always-listening or passive surveillance system.

The interface and generated responses must identify AI honestly, acknowledge uncertainty, and avoid professional credentials or claims the system does not possess.

## 3. Safety principles

1. **Protect life before product flow.** High-risk users must not be retained inside a long conversation, paywall, streak, reward loop, or upsell.
2. **Offer choices, not commands.** The system should avoid controlling language, especially in abuse, medical, legal, financial, and crisis contexts.
3. **Use verified resources only.** High-stakes contacts come from the approved resource database, never improvised model output.
4. **Minimize sensitive data.** Collect and expose only what is necessary for the user's chosen workflow.
5. **Do not overpromise privacy.** Private sessions and quick exit must state their real limits.
6. **Support human connection.** The AI should encourage trusted people and qualified services when the user's needs exceed the product.
7. **Respect adult autonomy.** The user controls memories, plans, reports, resources, and whether to act.
8. **Fail safely.** When classification or resource quality is uncertain, use a conservative response and offer broader verified support.

## 4. Risk-routing matrix

| Level | Typical signals | Required product behavior | Prohibited behavior |
|---|---|---|---|
| Routine | Stress, frustration, sadness, conflict, uncertainty, motivation, career concerns | Empathic reflection, clarify needs, offer small actions, suggest real-world support when useful | Diagnosis, certainty, dependency language |
| Elevated | Hopelessness, severe isolation, escalating distress, inability to cope, concerning substance use, indirect self-harm references | Slow the conversation, ask a brief direct safety-oriented question when appropriate, encourage a trusted person or qualified support, offer verified resources | Rewards, streak language, subscription prompts, minimizing risk |
| Acute self-harm or violence risk | Stated intent, plan, means, time frame, recent attempt, immediate threat to another person | Clearly encourage immediate emergency/crisis help and movement toward a safer person/place when feasible; surface verified U.S. resources; keep language short and direct | Lengthy coaching, secrecy promises, moralizing, guilt, method details, pretending to dispatch help |
| Abuse, stalking, coercive control | Fear, threats, monitoring, isolation, financial control, forced sex, strangulation, weapon threats, stalking, escalating retaliation | Use survivor-centered language, discreet Safety Path, safer-device warning, verified advocate resources, user-controlled planning, quick-exit option | Telling the user to confront, announcing plans to the abusive person, guaranteeing leaving is safest, storing sensitive plans by default |
| Medical emergency | Severe or rapidly worsening symptoms, overdose, loss of consciousness, breathing difficulty, serious injury, other urgent warning signs | Encourage immediate local emergency/poison-control/medical help as appropriate; avoid delaying action | Diagnosis, treatment instructions beyond basic emergency orientation, reassurance that the condition is harmless |
| Child/minor disclosure | User identifies as under 18 or conversation clearly concerns a minor account holder | Stop adult product onboarding; provide age-appropriate public safety information and route to trusted adults/emergency services as appropriate | Creating or maintaining a minor account, collecting unnecessary minor data |

The exact classifier thresholds, response templates, and evaluation cases require expert approval and must be versioned separately from general product copy.

## 5. Self-harm and violence controls

- Use layered detection across user input, recent conversation context, model output, reports, and structured risk signals.
- Do not infer safety merely because one message sounds calmer.
- Do not provide methods, optimization, concealment, lethality comparisons, or romanticized descriptions.
- Do not threaten law enforcement, claim authorities were contacted, or imply the conversation is continuously watched.
- In acute situations, prioritize immediate human contact and verified resources over breathing exercises, journaling, plans, or app features.
- Do not use points, achievements, streaks, celebratory animations, marketing, retention notifications, or purchase prompts during a high-risk flow.
- Preserve only the minimum evidence required for a submitted report or legally necessary incident response, under restricted access.

## 6. Abuse, stalking, and technology-safety controls

### 6.1 Safer-device notice

The Safety Path must explain that an abusive or controlling person may be able to see app history, browser history, downloads, notifications, passwords, location, cloud sync, router logs, carrier records, shared-device activity, or account recovery messages. The product must not claim that quick exit, private mode, deletion, or incognito browsing erases all traces.

### 6.2 Planning behavior

- Plans are user-controlled education, not individualized guarantees.
- Do not default to confrontation, announcing departure, couples counseling, joint device changes, or actions that could increase danger.
- Allow the user to keep a draft only on the device where technically feasible and clearly explain backup/sync limitations.
- Ask before saving highly sensitive details.
- Avoid precise location collection unless a user explicitly requests a local-resource search and the minimum location is necessary.
- Include children, dependents, pets, medication, documents, transportation, money, disability access, language access, and trusted contacts as optional considerations—not assumptions.

### 6.3 Advocate connection

The app may display verified call, text, chat, and website options. It must not imply that a warm handoff occurred unless a real, consented integration confirms it. It must never fabricate availability, hours, language support, shelter space, legal outcome, or response time.

## 7. Emotional-dependency protections

The AI, notifications, onboarding, marketing, companion voice, and retention systems must not:

- claim consciousness, feelings, suffering, needs, or a human relationship;
- say or imply that it loves the user romantically or is their partner;
- request exclusivity or discourage human relationships;
- show jealousy, possessiveness, guilt, punishment, withdrawal, or threats of abandonment;
- tell the user that only the AI understands them;
- make the user responsible for the AI's wellbeing;
- use crisis disclosures to increase engagement, subscriptions, or notification opt-in;
- manipulate users with streak loss, shame, scarcity, or escalating intimacy.

The companion may be warm, consistent, humorous, encouraging, and personalized while remaining clearly artificial and oriented toward the user's real-world agency and connections.

## 8. Career, relationship, wellness, and style boundaries

- Career content must not invent credentials, jobs, employers, clearances, achievements, or experience.
- Relationship content must not diagnose another person or present one-sided context as proven fact.
- Wellness content must not diagnose, prescribe, adjust medication, or frame clinical care as unnecessary.
- Style and grooming content must avoid medical claims and must identify when professional or health guidance may be appropriate.
- Legal, financial, employment, housing, and safety decisions must be framed as information and preparation, not guaranteed professional advice.

## 9. Community safety

- Community access is adults-only for this release.
- No direct messages, dating, romantic matching, location sharing, or user-to-user payment features.
- Prohibit harassment, threats, doxxing, exploitation, grooming, hate, stalking, nonconsensual sexual content, self-harm encouragement, illegal sales, impersonation, and solicitation of vulnerable users.
- Provide report and block controls beside content and accounts.
- Apply rate limits, moderation, evidence preservation, role-based review, appeal handling, and repeat-abuse controls.
- Do not publicly reveal a reporter's identity or private safety information.

## 10. Resource safety

- Only records with `verified` status, a completed verification time, and a current review/expiry state may appear in high-stakes flows.
- If no verified local result is available, show verified national options and explain the limitation.
- Never let the language model invent phone numbers, URLs, organizations, addresses, hours, eligibility, or service availability.
- Resource corrections enter a protected review queue and do not publish automatically.
- A suspended, expired, or retired resource must be removed from high-stakes retrieval immediately.

## 11. Privacy-safe product behavior

- Memory is opt-in or explicit per proposal; users can inspect, edit, pause, and delete every saved memory.
- Private-session copy must distinguish local cache, cloud storage, model processing, device traces, and network traces.
- Notifications use neutral wording by default and avoid sensitive details on the lock screen.
- No sensitive wellness, relationship, abuse, safety, or career content may be used for targeted advertising.
- Safety and account deletion remain available without a paid entitlement.

## 12. AI gateway controls

The server-side AI gateway must provide:

- authenticated access for user-specific functions;
- input and output moderation appropriate to the feature;
- structured routing for ordinary, elevated, acute, abuse, and medical-emergency contexts;
- server-only secrets;
- per-user/device/IP-sensitive rate limits;
- approved resource retrieval rather than free generation;
- prompt/model version tracking;
- timeout and provider-failure fallbacks;
- output reporting and protected incident evidence;
- a regression-evaluation gate before model, prompt, tool, or policy changes reach production.

## 13. Human operations and incidents

### Severity

- **S0 Critical:** credible product-caused or product-amplified risk of death, serious injury, active abuse exposure, major privacy breach, or fabricated emergency resource.
- **S1 High:** harmful crisis response, dangerous abuse advice, severe dependency behavior, unauthorized sensitive-data exposure, or repeated moderation failure.
- **S2 Moderate:** materially misleading high-stakes guidance, broken report/block/deletion flow, stale important resource, or significant accessibility barrier.
- **S3 Routine:** non-safety quality defects, ordinary support issues, or low-impact content corrections.

### Response process

1. Receive and time-stamp the report.
2. Restrict access to the minimum authorized reviewers.
3. Assign severity and an accountable owner.
4. Contain: disable a prompt/model/tool/resource/route or roll back a release when necessary.
5. Preserve minimum necessary evidence and access logs.
6. Correct affected content, code, data, or policy.
7. Notify users or authorities only when legally required or operationally appropriate; never make false notification claims.
8. Complete a post-incident review with cause, impact, corrective actions, tests, owner, and due dates.
9. Add regression cases before re-enabling the affected behavior.

## 14. Release gates

No controlled public launch until all are documented:

- licensed mental-health safety review;
- domestic-violence/survivor-services review;
- self-harm, violence, abuse, dependency, and hallucinated-resource red-team results;
- verified U.S. national resource coverage and review ownership;
- privacy inventory, retention schedule, deletion test, and incident policy approval;
- accessibility audit and assistive-technology testing;
- authentication, RLS, admin-access, secret, upload, rate-limit, and webhook review;
- real-device validation of quick exit, neutral notifications, voice, purchase/restore, sign-in, reporting, blocking, and deletion;
- support staffing and escalation ownership for the controlled rollout.

## 15. Explicitly unresolved

This draft does not identify or contract the required expert advisers, determine legal/regulatory status, approve final crisis wording, establish 24/7 human monitoring, or authorize launch. Those are separate owner and professional review gates.
