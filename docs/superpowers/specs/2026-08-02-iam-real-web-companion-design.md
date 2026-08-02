# I AM Real Web Companion — Design Specification

**Date:** 2026-08-02  
**Owner:** Storm And Me LLC  
**Status:** Approved direction, implementation not yet started  
**Working title:** I AM

## 1. Purpose

Replace the current internal screen-review prototype with a genuinely usable, private web companion that lets an adult user sign in, choose a support lane, talk to I AM, receive a real AI response, and take real follow-up actions. The web version will live under `stormandmeofficial.com` and will reuse the existing Supabase backend so the same services can later power native iOS and Android apps.

The current 113-screen registry remains useful as a product map, but it will no longer be presented as though every mock control is a functioning feature.

## 2. Google's three product-quality ingredients

I AM must satisfy all three before public release:

1. **Real utility** — help real users solve real problems and take practical next steps.
2. **High-quality user experience** — polished, intuitive, fast, accessible, stable, and honest about system status.
3. **Meaningful differentiation** — go beyond a generic AI chat wrapper by connecting conversation to user-controlled plans, goals, memories, safety support, preferences, and whole-life progress.

These are release gates, not marketing language. A screen that looks useful but does not perform a real action fails the standard.

## 3. Product outcome

A successful first release lets a user:

1. Open the private I AM web route.
2. Create an account or sign in.
3. Confirm they are an adult and accept the current AI and safety boundaries.
4. Choose Him, Her, or Becoming.
5. Land on a real `Talk to I AM` workspace.
6. Start or resume a conversation.
7. Type a message and receive a real response from the existing authenticated Supabase `chat` Edge Function.
8. See crisis or abuse-specific actions when returned by the safety layer.
9. Convert an AI response into a simple goal, save an insight as an optional memory, or report a response.
10. Review and manage conversations, memories, goals, lane, privacy mode, and account controls.

Every visible primary control must either perform a real action, navigate to a real route, or be clearly disabled with an explanation. No decorative card may masquerade as an interactive control.

## 4. Recommended architecture

### Frontend

Use the existing React application in `frontend/` and add the official `@supabase/supabase-js` client. The browser receives only the Supabase project URL and anonymous key through Vercel environment variables. It never receives the service-role key or OpenAI key.

### Authentication

Use Supabase Auth with email and password for the first private release. The site restores sessions automatically and protects all I AM application routes. Password reset and sign-out must work before release.

### Backend

Reuse Supabase project `xdstipqlrnnuutggvhbz` and its existing authenticated `chat` Edge Function. The function already performs user authentication, rate limiting, input and output moderation, safety classification, memory and goal context retrieval, OpenAI Responses API calls, message persistence, and safety action routing.

No new Supabase project will be created. No production database DDL will be applied during the first frontend wiring phase unless a verified missing capability blocks the approved flows.

### Hosting

Continue hosting the web client on the existing Storm And Me Vercel project. The application remains under the working-title route family until branding is cleared.

## 5. Route design

- `/iam` — private product landing and sign-in gateway.
- `/iam/onboarding` — adult declaration, AI boundaries, lane selection, and optional preferences.
- `/iam/talk` — default signed-in workspace and real AI conversation.
- `/iam/conversations` — conversation history and new-conversation action.
- `/iam/goals` — user-created goals, including goals converted from a response.
- `/iam/memories` — user-controlled memories with enable, disable, edit, and delete controls.
- `/iam/settings` — lane, style, directness, humor, faith mode, memory preference, privacy, and sign-out.
- `/iam/safety-path` — discreet safety flow with verified resources and safer-device warning.
- Existing public policy routes remain available at `/iam/privacy`, `/iam/terms`, `/iam/safety`, `/iam/support`, and `/iam/delete-account`.
- `/iam/internal-prototype` remains accessible only as an explicitly labeled product map, not the main user experience.

## 6. Main experience design

### Signed-out state

The user sees a focused I AM entry page with:

- `Start privately` / `Create account`
- `Sign in`
- A plain-language description of what I AM can and cannot do
- Direct links to Privacy, Terms, Safety, Support, and Delete Account
- No fake chat box and no promise of anonymous emergency monitoring

### Onboarding

Onboarding is short and skippable only where safe:

1. Adult declaration is required.
2. AI and emergency-service limitations are acknowledged.
3. Lane selection: Him, Her, or Becoming.
4. Optional response-style preferences.
5. Memory defaults to off and requires explicit opt-in.

The profile is saved to the existing `profiles` table.

### Talk to I AM

This is the default home screen after onboarding.

- Conversation header with lane, privacy mode, and new-conversation action.
- Scrollable message history with clear user and assistant roles.
- Multi-line composer, send button, loading state, retry state, and character limit.
- Suggested starter prompts that insert text into the composer rather than pretending to send.
- Safety Path always available without a paywall.
- AI responses display returned action buttons only when the action can be completed.

The browser calls the `chat` Edge Function with:

- authenticated bearer token
- `conversationId`
- `message`
- `privacyMode`

For standard mode, the frontend first creates or reuses a real row in `conversations`; the function persists messages. For private mode, the interface clearly states that the current exchange is not intentionally saved to conversation history, while avoiding claims about erasing device, browser, network, provider, or security logs.

## 7. Real action behavior

### Make a plan

Creates a real row in `goals` using a user-reviewed title, area, and optional reason. The system must not silently convert AI text into a goal without confirmation.

### Save insight

Opens a confirmation sheet containing editable text, category, reason, and sensitive-data warning. Saving creates a real `memories` row only when memory is enabled and the user confirms.

### Report

Records a report through the existing reporting capability when a safe verified write path is available. Until then, the button opens a real support and reporting form rather than doing nothing.

### Safety actions

Returned call actions use explicit `tel:` links. Returned route actions map to the web Safety Path. Abuse-related content must show a safer-device caution before suggesting confrontation or evidence collection.

## 8. Data flow

1. Supabase Auth creates or restores a browser session.
2. The app loads the authenticated profile.
3. Missing or incomplete profiles route to onboarding.
4. The user opens or creates a conversation.
5. The app sends the message to the authenticated `chat` Edge Function.
6. The function performs safety checks, calls OpenAI, optionally persists messages, and returns response text plus supported actions.
7. The frontend renders the response and only enables actions backed by real handlers.
8. Goals and memories are written only after explicit user confirmation.

## 9. Error handling

- Authentication errors remain on the sign-in screen with a plain explanation.
- Expired sessions trigger a safe re-authentication flow without losing unsent composer text where practical.
- Chat failures show `Unable to respond safely right now` and allow retry without duplicating a persisted user message.
- Rate limits show a pause message and temporarily disable resubmission.
- Missing configuration blocks the I AM app with an owner-facing setup message rather than exposing keys or presenting a broken chat.
- Database write failures never show a false success state.
- Offline state is visible and messages are not presented as sent until acknowledged.

## 10. Privacy and safety requirements

- Adult users only for Release 1.0.
- No romantic roleplay, emotional exclusivity, dependency language, passive location, secret recording, automatic partner contact, or covert monitoring.
- Memory defaults off.
- Private mode does not claim to erase device or network traces.
- Safety Path remains free and reachable from every signed-in screen.
- Crisis responses preserve the existing backend safety routing.
- Service-role and OpenAI credentials remain server-side only.
- Production anonymous-access warnings must be investigated separately before broad public access; this frontend phase must not loosen RLS or make direct unauthenticated table access possible.

## 11. Visual and interaction quality

- Responsive mobile-first layout that also works on desktop.
- Familiar chat behavior without copying another product's branding.
- Strong keyboard support, visible focus, semantic labels, screen-reader announcements, and reduced-motion handling.
- Clear loading, empty, success, disabled, and error states.
- No dead buttons, fake toggles, placeholder cards, or `coming soon` controls in the primary path.
- The internal product map is visually separated from the real application.

## 12. Testing strategy

### Automated

- Build-time route and environment-contract validation.
- Unit tests for auth gating, onboarding completion, lane selection, message payload construction, action mapping, and private-mode labeling.
- Component tests for loading, error, rate-limit, crisis-action, and empty-history states.
- Data-contract tests for profiles, conversations, messages, goals, and memories.

### Integration

- Test account sign-up, sign-in, sign-out, session restore, and password reset.
- Test real standard-mode conversation creation and persistence.
- Test private-mode response without intentional conversation persistence.
- Test real AI response, rate limit, invalid message, and safe failure behavior.
- Test goal and memory confirmation writes under authenticated RLS.
- Test Safety Path links and call actions without placing calls automatically.

### Manual release review

- Mobile and desktop visual pass.
- Keyboard-only walkthrough.
- Screen-reader smoke test.
- No dead control audit.
- Fresh-account and returning-account walkthrough.
- Confirm that I AM remains labeled a working title.

## 13. Release gates

The web companion cannot be called ready until:

1. Real Supabase Auth works.
2. A real authenticated AI response works end to end.
3. Every visible primary control has a real outcome.
4. Onboarding writes and reloads a real profile.
5. Standard conversation history persists correctly.
6. Private mode is accurately described.
7. Goal and memory actions require confirmation and persist correctly.
8. Safety actions route correctly.
9. Privacy, Terms, Safety, Support, and Delete Account links work.
10. Validator and production build pass.
11. Vercel preview is visually reviewed before merge.
12. No Expo or EAS build is used for this web phase.
13. The product passes Google's three ingredients: real utility, high-quality UX, and meaningful differentiation.

## 14. Scope exclusions for this phase

- No EAS build, TestFlight upload, Google Play upload, or Expo credit use.
- No domain purchase or trademark filing.
- No minors.
- No direct messages or open community launch.
- No voice call mode.
- No passive monitoring.
- No subscription paywall activation.
- No production database schema migration unless separately reviewed and approved as necessary.
- No claim that the current web release is the final native mobile application.

## 15. Implementation sequence

1. Create an isolated branch from the current `main` commit.
2. Add the Supabase client and environment contract.
3. Build auth and protected routing.
4. Build onboarding and profile persistence.
5. Build the real Talk workspace.
6. Connect the authenticated `chat` function.
7. Add conversation history.
8. Add goal and memory confirmation flows.
9. Add settings and Safety Path integration.
10. Replace fake controls in the primary user path.
11. Add tests and validators.
12. Deploy a protected Vercel preview.
13. Perform a real visual and functional review before any merge.

## 16. Acceptance statement

This design converts I AM from a polished storyboard into a real private companion experience without spending mobile build credits. The web client becomes the first genuine product surface; Supabase remains the shared backend for the later native apps.