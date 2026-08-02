# I AM Phase 1 Core Auth and Chat Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a protected Vercel preview where an adult user can create or access an account, complete honest onboarding, choose Him/Her/Becoming, start or resume a real conversation, and receive a real response from the existing authenticated Supabase `chat` Edge Function.

**Architecture:** Add an isolated I AM application surface outside the normal Storm And Me site header/footer while keeping the same React deployment. Use a single browser Supabase client for Auth and owner-scoped table access. Keep all OpenAI and service-role work inside the existing JWT-protected Supabase `chat` function. Extract configuration, auth state, onboarding payloads, chat data access, and chat state into focused modules with pure tests before wiring pages.

**Tech Stack:** React 19, React Router 7, Create React App/CRACO, Tailwind CSS, Framer Motion, Lucide React, `@supabase/supabase-js@2.106.2`, Supabase Auth/PostgreSQL/Edge Functions, Jest through `react-scripts`, Vercel.

## Global Constraints

- Start from the latest `main` commit containing both approved specs and the implementation roadmap. At planning time the roadmap commit is `1019ef86d031d1116486be20e55a84f7375e127c`.
- Use isolated branch `iam-real-web-phase-1`; do not edit or merge open PR #3 (`feat/featured-shirts-deploy`).
- `I AM` remains a working title. Him, Her, and Becoming are internal experience lanes.
- Release is for United States adults age 18 and older.
- Memory defaults off.
- No service-role, OpenAI, Apple, Google, RevenueCat, webhook, or signing secret enters browser code, Vercel public variables, tests, or GitHub.
- Browser configuration uses only `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY`.
- Do not apply production DDL or weaken RLS in this phase.
- Standard mode may persist conversations/messages. Private mode must not intentionally save conversation history and must not claim to erase device, browser, network, provider, or security logs.
- Hide unsupported `convert_plan`, `save`, and `report` actions until Phase 2 rather than rendering dead controls.
- Safety actions returned by the backend may render only as deliberate `tel:` links or routes to the existing I AM Safety page.
- No EAS build, Expo credit use, TestFlight upload, Google Play upload, domain purchase, trademark filing, subscription activation, or production launch.
- Every visible primary control must work, navigate to a real route, or be clearly disabled with a reason.
- Protected preview must receive a real owner browser walkthrough before merge.

---

## File Map

### Configuration and client

- Modify: `frontend/package.json` — add the Supabase browser package and Phase 1 validator script.
- Create: `frontend/src/iam/config/iamConfig.js` — parse and validate public environment configuration.
- Create: `frontend/src/iam/config/iamConfig.test.js` — configuration contract tests.
- Create: `frontend/src/iam/data/supabaseClient.js` — create the singleton browser client and fail closed when unconfigured.

### Auth and profile

- Create: `frontend/src/iam/auth/authState.js` — pure auth reducer and initial state.
- Create: `frontend/src/iam/auth/authState.test.js` — reducer tests.
- Create: `frontend/src/iam/auth/IamAuthProvider.js` — session lifecycle and auth actions.
- Create: `frontend/src/iam/auth/IamProtectedRoute.js` — loading, signed-out, and onboarding gates.
- Create: `frontend/src/iam/auth/IamEntryPage.js` — private product entry page.
- Create: `frontend/src/iam/auth/IamAuthPage.js` — sign-up, sign-in, reset-password request, and confirmation state.
- Create: `frontend/src/iam/profile/profileApi.js` — load and save the owner profile.
- Create: `frontend/src/iam/profile/profileContract.js` — lane constants, completion check, and onboarding payload builder.
- Create: `frontend/src/iam/profile/profileContract.test.js` — profile contract tests.
- Create: `frontend/src/iam/profile/IamOnboardingPage.js` — required adult/boundary/lane onboarding.

### App shell and routes

- Create: `frontend/src/iam/layout/IamAppShell.js` — separate I AM navigation shell with outlet.
- Create: `frontend/src/iam/styles/iam.css` — mobile-first Phase 1 gradient, focus, layout, reduced-motion, and chat styles.
- Modify: `frontend/src/App.js` — add I AM routes outside the normal Storm site `Layout`.
- Modify: `frontend/src/components/SeoManager.js` — working-title metadata and noindex behavior for private app routes.

### Chat and history

- Create: `frontend/src/iam/chat/chatApi.js` — conversation/message queries and Edge Function invocation.
- Create: `frontend/src/iam/chat/chatApi.test.js` — mocked Supabase data-contract tests.
- Create: `frontend/src/iam/chat/chatState.js` — pure composer/message reducer and action filtering.
- Create: `frontend/src/iam/chat/chatState.test.js` — reducer and action-filter tests.
- Create: `frontend/src/iam/chat/IamTalkPage.js` — real standard/private chat interface.
- Create: `frontend/src/iam/chat/IamConversationsPage.js` — list, resume, create, and delete owner conversations.

### Build verification

- Create: `frontend/scripts/validate-iam-app.cjs` — source-level route/config/dead-control contract.
- Modify: `frontend/scripts/validate-iam-prototype.cjs` only when required to keep the internal product-map validator compatible; do not remove its 13-area/113-screen checks.
- Modify: `vercel.json` — noindex/no-store headers for authenticated I AM app paths while preserving current rules.

---

### Task 1: Create the isolated work area and lock the public configuration contract

**Files:**
- Modify: `frontend/package.json`
- Create: `frontend/src/iam/config/iamConfig.js`
- Create: `frontend/src/iam/config/iamConfig.test.js`
- Create: `frontend/src/iam/data/supabaseClient.js`

**Interfaces:**
- Consumes: `process.env.REACT_APP_SUPABASE_URL`, `process.env.REACT_APP_SUPABASE_ANON_KEY`.
- Produces: `readIamConfig(env)`, `iamConfig`, `supabase`, and `requireSupabase()`.

- [ ] **Step 1: Create the isolated branch/worktree**

Use the required worktree skill at execution time. Verify the starting SHA equals the current reviewed `main` SHA and that `git status --short` is empty.

```bash
git fetch origin main
git worktree add ../stormandme-iam-phase-1 -b iam-real-web-phase-1 origin/main
cd ../stormandme-iam-phase-1
git status --short
git rev-parse HEAD
```

Expected: clean status; SHA equals the latest reviewed `main`; no file from PR #3 appears in the diff.

- [ ] **Step 2: Write the failing configuration tests**

Create `frontend/src/iam/config/iamConfig.test.js`:

```js
import { readIamConfig } from "./iamConfig";

describe("I AM public configuration", () => {
  test("accepts the expected Supabase public values", () => {
    expect(readIamConfig({
      REACT_APP_SUPABASE_URL: "https://xdstipqlrnnuutggvhbz.supabase.co",
      REACT_APP_SUPABASE_ANON_KEY: "public-anon-value",
    })).toEqual({
      isConfigured: true,
      supabaseUrl: "https://xdstipqlrnnuutggvhbz.supabase.co",
      supabaseAnonKey: "public-anon-value",
      errors: [],
    });
  });

  test("fails closed when either public value is missing", () => {
    const result = readIamConfig({ REACT_APP_SUPABASE_URL: "" });
    expect(result.isConfigured).toBe(false);
    expect(result.errors).toEqual([
      "REACT_APP_SUPABASE_URL must be an https://*.supabase.co URL.",
      "REACT_APP_SUPABASE_ANON_KEY is required.",
    ]);
  });
});
```

- [ ] **Step 3: Run the focused test and confirm failure**

```bash
cd frontend
yarn test --watchAll=false --runInBand src/iam/config/iamConfig.test.js
```

Expected: FAIL because `iamConfig.js` does not exist.

- [ ] **Step 4: Add the pinned Supabase dependency**

Add exactly this dependency to `frontend/package.json`:

```json
"@supabase/supabase-js": "2.106.2"
```

Run:

```bash
cd frontend
yarn install --frozen-lockfile=false
```

Expected: `package.json` and `yarn.lock` change; no unrelated dependency version is manually edited.

- [ ] **Step 5: Implement the configuration parser**

Create `frontend/src/iam/config/iamConfig.js`:

```js
const SUPABASE_URL = /^https:\/\/[a-z0-9-]+\.supabase\.co$/;

export function readIamConfig(env = process.env) {
  const supabaseUrl = String(env.REACT_APP_SUPABASE_URL || "").trim();
  const supabaseAnonKey = String(env.REACT_APP_SUPABASE_ANON_KEY || "").trim();
  const errors = [];

  if (!SUPABASE_URL.test(supabaseUrl)) {
    errors.push("REACT_APP_SUPABASE_URL must be an https://*.supabase.co URL.");
  }
  if (!supabaseAnonKey) {
    errors.push("REACT_APP_SUPABASE_ANON_KEY is required.");
  }

  return {
    isConfigured: errors.length === 0,
    supabaseUrl,
    supabaseAnonKey,
    errors,
  };
}

export const iamConfig = readIamConfig();
```

- [ ] **Step 6: Implement the singleton browser client**

Create `frontend/src/iam/data/supabaseClient.js`:

```js
import { createClient } from "@supabase/supabase-js";
import { iamConfig } from "../config/iamConfig";

export const supabase = iamConfig.isConfigured
  ? createClient(iamConfig.supabaseUrl, iamConfig.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export function requireSupabase() {
  if (!supabase) {
    throw new Error(`I AM configuration is incomplete: ${iamConfig.errors.join(" ")}`);
  }
  return supabase;
}
```

- [ ] **Step 7: Run tests and production build**

```bash
cd frontend
yarn test --watchAll=false --runInBand src/iam/config/iamConfig.test.js
yarn build
```

Expected: configuration tests PASS; build compiles or displays only the existing dependency deprecation warnings.

- [ ] **Step 8: Commit**

```bash
git add frontend/package.json frontend/yarn.lock frontend/src/iam/config/iamConfig.js frontend/src/iam/config/iamConfig.test.js frontend/src/iam/data/supabaseClient.js
git commit -m "feat: add I AM Supabase client contract"
```

### Task 2: Implement deterministic auth state and the session provider

**Files:**
- Create: `frontend/src/iam/auth/authState.js`
- Create: `frontend/src/iam/auth/authState.test.js`
- Create: `frontend/src/iam/auth/IamAuthProvider.js`

**Interfaces:**
- Consumes: `requireSupabase()`.
- Produces: `authReducer(state, action)`, `IamAuthProvider`, and `useIamAuth()` returning `{ status, session, user, error, signUp, signIn, signOut, requestPasswordReset }`.

- [ ] **Step 1: Write the failing reducer tests**

Create `frontend/src/iam/auth/authState.test.js`:

```js
import { authInitialState, authReducer } from "./authState";

describe("I AM auth state", () => {
  test("moves from loading to authenticated", () => {
    const session = { user: { id: "user-1", email: "adult@example.com" } };
    expect(authReducer(authInitialState, { type: "SESSION_READY", session })).toEqual({
      status: "authenticated",
      session,
      user: session.user,
      error: "",
    });
  });

  test("clears identity on sign out", () => {
    expect(authReducer({ status: "authenticated", session: {}, user: {}, error: "" }, { type: "SIGNED_OUT" }))
      .toEqual({ status: "anonymous", session: null, user: null, error: "" });
  });

  test("keeps a plain user-facing auth error", () => {
    expect(authReducer(authInitialState, { type: "AUTH_ERROR", error: "Invalid login credentials" }).error)
      .toBe("Invalid login credentials");
  });
});
```

- [ ] **Step 2: Verify the reducer test fails**

```bash
cd frontend
yarn test --watchAll=false --runInBand src/iam/auth/authState.test.js
```

Expected: FAIL because `authState.js` does not exist.

- [ ] **Step 3: Implement the reducer**

Create `frontend/src/iam/auth/authState.js` with these exact states: `loading`, `anonymous`, `authenticated`, and `error`. Unknown actions must return the current state.

```js
export const authInitialState = {
  status: "loading",
  session: null,
  user: null,
  error: "",
};

export function authReducer(state, action) {
  switch (action.type) {
    case "SESSION_READY":
      return action.session
        ? { status: "authenticated", session: action.session, user: action.session.user, error: "" }
        : { status: "anonymous", session: null, user: null, error: "" };
    case "SIGNED_OUT":
      return { status: "anonymous", session: null, user: null, error: "" };
    case "AUTH_ERROR":
      return { ...state, status: state.user ? "authenticated" : "error", error: action.error };
    case "CLEAR_ERROR":
      return { ...state, error: "" };
    default:
      return state;
  }
}
```

- [ ] **Step 4: Implement the provider**

`IamAuthProvider` must:

1. call `supabase.auth.getSession()` once;
2. subscribe to `supabase.auth.onAuthStateChange()`;
3. unsubscribe on unmount;
4. expose sign-up, sign-in, sign-out, and reset-password request actions;
5. normalize thrown/provider errors to one plain message;
6. never log credentials or tokens.

Use these calls:

```js
client.auth.signUp({ email, password });
client.auth.signInWithPassword({ email, password });
client.auth.signOut();
client.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/iam/auth?mode=reset`,
});
```

`signUp` returns:

```js
{
  user: data.user,
  session: data.session,
  requiresEmailConfirmation: Boolean(data.user && !data.session),
}
```

- [ ] **Step 5: Run auth tests**

```bash
cd frontend
yarn test --watchAll=false --runInBand src/iam/auth/authState.test.js
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/iam/auth/authState.js frontend/src/iam/auth/authState.test.js frontend/src/iam/auth/IamAuthProvider.js
git commit -m "feat: add I AM authentication state"
```

### Task 3: Add the separate I AM entry, auth routes, protected shell, and noindex metadata

**Files:**
- Create: `frontend/src/iam/auth/IamProtectedRoute.js`
- Create: `frontend/src/iam/auth/IamEntryPage.js`
- Create: `frontend/src/iam/auth/IamAuthPage.js`
- Create: `frontend/src/iam/layout/IamAppShell.js`
- Create: `frontend/src/iam/styles/iam.css`
- Modify: `frontend/src/App.js`
- Modify: `frontend/src/components/SeoManager.js`

**Interfaces:**
- Consumes: `useIamAuth()` and React Router navigation.
- Produces: `/iam`, `/iam/auth`, `/iam/onboarding`, `/iam/app/talk`, and `/iam/app/conversations` route skeletons.

- [ ] **Step 1: Write a failing route-source check**

Create `frontend/src/iam/auth/IamRouteContract.test.js` that reads `src/App.js` and asserts:

```js
expect(source).toContain('path="/iam"');
expect(source).toContain('path="/iam/auth"');
expect(source).toContain('path="/iam/onboarding"');
expect(source).toContain('path="/iam/app"');
expect(source.indexOf('path="/iam"')).toBeGreaterThan(source.indexOf("</Route>"));
```

The final assertion ensures the new application routes are outside the first Storm site `Layout` route block.

- [ ] **Step 2: Verify the route contract fails**

```bash
cd frontend
yarn test --watchAll=false --runInBand src/iam/auth/IamRouteContract.test.js
```

Expected: FAIL because real application routes do not exist.

- [ ] **Step 3: Implement `IamProtectedRoute`**

Behavior:

- `loading` renders an accessible `Checking your private session…` status.
- unconfigured client renders the owner-facing configuration message without keys.
- anonymous users receive `<Navigate to="/iam/auth" replace state={{ from: location.pathname }} />`.
- authenticated users render children.
- onboarding completion is handled in Task 4, not guessed here.

- [ ] **Step 4: Implement entry and auth pages**

`IamEntryPage` must contain working links/buttons for:

- `Create account` → `/iam/auth?mode=signup`
- `Sign in` → `/iam/auth?mode=signin`
- Privacy → `/iam/privacy`
- Terms → `/iam/terms`
- Safety → `/iam/safety`
- Support → `/iam/support`
- Delete Account → `/iam/delete-account`

`IamAuthPage` must:

- use a real `<form>`;
- validate email and a minimum 10-character password before calling Supabase;
- display email-confirmation state when sign-up has no session;
- provide a real reset-password request form;
- preserve generic provider messages without exposing stack traces;
- provide a working return link to `/iam`.

- [ ] **Step 5: Implement the separate app shell**

`IamAppShell` must import `../styles/iam.css`, render an `<Outlet />`, and provide only working navigation:

- Talk → `/iam/app/talk`
- Conversations → `/iam/app/conversations`
- Safety → `/iam/safety`
- Settings is not shown in Phase 1.
- Sign out calls the real auth action, then navigates to `/iam`.

- [ ] **Step 6: Register routes outside the Storm site layout**

Wrap routing with `IamAuthProvider`. Keep existing public and legal routes unchanged. Add:

```jsx
<Route path="/iam" element={<IamEntryPage />} />
<Route path="/iam/auth" element={<IamAuthPage />} />
<Route path="/iam/onboarding" element={<IamProtectedRoute><IamOnboardingPage /></IamProtectedRoute>} />
<Route path="/iam/app" element={<IamProtectedRoute><IamAppShell /></IamProtectedRoute>}>
  <Route index element={<Navigate to="talk" replace />} />
  <Route path="talk" element={<IamTalkPage />} />
  <Route path="conversations" element={<IamConversationsPage />} />
</Route>
```

Temporary imports for Task 4/6/7 pages may use minimal real components committed in the same task; no button may claim chat works before Task 6.

- [ ] **Step 7: Add centralized metadata/noindex behavior**

Add page titles for `/iam`, `/iam/auth`, `/iam/onboarding`, `/iam/app/talk`, and `/iam/app/conversations`. Extend noindex logic so every path starting with `/iam/app`, plus `/iam/auth` and `/iam/onboarding`, receives `noindex,follow`. Keep `/iam/internal-prototype` noindex behavior intact.

- [ ] **Step 8: Add the Phase 1 visual foundation**

`iam.css` must define:

- `--iam-bg`, `--iam-surface`, `--iam-text`, and lane accent variables;
- mobile-first shell width and composer spacing;
- visible `:focus-visible` outlines;
- restrained gradient backgrounds;
- readable disabled/error/loading states;
- `@media (prefers-reduced-motion: reduce)` disabling nonessential transitions.

No casino animation, infinite attention loop, fake progress, or celebration enters Phase 1.

- [ ] **Step 9: Run the route test and build**

```bash
cd frontend
yarn test --watchAll=false --runInBand src/iam/auth/IamRouteContract.test.js
yarn build
```

Expected: PASS and successful optimized build.

- [ ] **Step 10: Commit**

```bash
git add frontend/src/App.js frontend/src/components/SeoManager.js frontend/src/iam/auth/IamProtectedRoute.js frontend/src/iam/auth/IamEntryPage.js frontend/src/iam/auth/IamAuthPage.js frontend/src/iam/auth/IamRouteContract.test.js frontend/src/iam/layout/IamAppShell.js frontend/src/iam/styles/iam.css
git commit -m "feat: add private I AM web routes"
```

### Task 4: Persist honest onboarding to the existing profile table

**Files:**
- Create: `frontend/src/iam/profile/profileContract.js`
- Create: `frontend/src/iam/profile/profileContract.test.js`
- Create: `frontend/src/iam/profile/profileApi.js`
- Create: `frontend/src/iam/profile/IamOnboardingPage.js`
- Modify: `frontend/src/iam/auth/IamProtectedRoute.js`

**Interfaces:**
- Consumes: authenticated `user.id`, existing `profiles` defaults and owner policy.
- Produces: `IAM_LANES`, `isProfileComplete(profile)`, `buildProfilePayload(input)`, `loadProfile(userId)`, and `saveProfile(userId, input)`.

- [ ] **Step 1: Write the failing profile-contract tests**

```js
import { buildProfilePayload, isProfileComplete } from "./profileContract";

describe("I AM profile onboarding contract", () => {
  test("builds the exact owner-scoped profile payload", () => {
    expect(buildProfilePayload({
      userId: "user-1",
      displayName: "Will",
      lane: "him",
      acceptedAdultBoundary: true,
      acceptedAiBoundary: true,
      memoryEnabled: false,
      timezone: "America/New_York",
    })).toEqual({
      id: "user-1",
      display_name: "Will",
      lane: "him",
      companion_style: "coach",
      directness: "clear",
      humor: "light",
      faith_mode: "user-led",
      life_areas: [],
      memory_enabled: false,
      declared_adult: true,
      timezone: "America/New_York",
    });
  });

  test("rejects onboarding without both required acknowledgements", () => {
    expect(() => buildProfilePayload({
      userId: "user-1",
      lane: "becoming",
      acceptedAdultBoundary: true,
      acceptedAiBoundary: false,
    })).toThrow("Adult confirmation and AI boundaries must be accepted.");
  });

  test("requires an allowed lane and adult declaration for completion", () => {
    expect(isProfileComplete({ lane: "her", declared_adult: true })).toBe(true);
    expect(isProfileComplete({ lane: "other", declared_adult: true })).toBe(false);
  });
});
```

- [ ] **Step 2: Verify the test fails**

```bash
cd frontend
yarn test --watchAll=false --runInBand src/iam/profile/profileContract.test.js
```

Expected: FAIL because contract does not exist.

- [ ] **Step 3: Implement the pure profile contract**

Use exact lane values from the live enum:

```js
export const IAM_LANES = Object.freeze(["him", "her", "becoming"]);
```

`buildProfilePayload` must trim `displayName`, default memory to false, and reject a missing user ID, invalid lane, or missing acknowledgements.

- [ ] **Step 4: Implement owner-scoped profile reads/writes**

`profileApi.js` uses:

```js
client.from("profiles").select("*").eq("id", userId).maybeSingle();
client.from("profiles").upsert(payload, { onConflict: "id" }).select("*").single();
```

The live auth trigger creates a default profile, but `upsert` remains safe for a missing row and supplies every non-null user-facing field.

- [ ] **Step 5: Implement onboarding UI**

Required controls:

- adult confirmation checkbox;
- AI is not therapy/emergency monitoring acknowledgement checkbox;
- lane radio group: Him, Her, Becoming;
- optional display name;
- memory choice defaults to off;
- real submit button disabled until required controls are valid;
- direct Safety, Privacy, and Terms links.

On successful save, navigate to `/iam/app/talk`. On write failure, remain on the page and display `Your choices were not saved. Please try again.`

- [ ] **Step 6: Add the onboarding gate**

After authentication, `IamProtectedRoute` loads the profile once. For `/iam/app/*`:

- complete profile → render the requested app route;
- incomplete profile → redirect to `/iam/onboarding`;
- profile read error → show a retry control, not a false onboarding state.

For `/iam/onboarding`, authenticated users may render the page even when the profile is incomplete.

- [ ] **Step 7: Run tests and build**

```bash
cd frontend
yarn test --watchAll=false --runInBand src/iam/profile/profileContract.test.js
yarn build
```

Expected: PASS and successful build.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/iam/profile/profileContract.js frontend/src/iam/profile/profileContract.test.js frontend/src/iam/profile/profileApi.js frontend/src/iam/profile/IamOnboardingPage.js frontend/src/iam/auth/IamProtectedRoute.js
git commit -m "feat: add I AM adult onboarding"
```

### Task 5: Define and test the real conversation and Edge Function contract

**Files:**
- Create: `frontend/src/iam/chat/chatApi.js`
- Create: `frontend/src/iam/chat/chatApi.test.js`

**Interfaces:**
- Consumes: authenticated Supabase client, user ID, `chat` Edge Function response `{ text, safetyTier, actions }`.
- Produces: `deriveConversationTitle`, `createConversation`, `listConversations`, `loadMessages`, `deleteConversation`, `sendChatMessage`, and `reconcileUncertainSend`.

- [ ] **Step 1: Write failing pure/data-contract tests**

Cover these cases:

```js
expect(deriveConversationTitle("   I need help changing careers after a layoff   "))
  .toBe("I need help changing careers after a layoff");
expect(deriveConversationTitle("x".repeat(100))).toHaveLength(60);
```

Mock the Supabase chain and assert standard conversation creation sends:

```js
{
  user_id: "user-1",
  title: "New conversation",
  area: "general",
  privacy_mode: "standard",
}
```

Assert private invocation sends a generated string `conversationId` but never calls `from("conversations").insert`.

Assert only these response fields are returned to the UI:

```js
{
  text: "response text",
  safetyTier: "normal",
  actions: [],
  conversationId: "conversation-1",
}
```

- [ ] **Step 2: Run tests and confirm failure**

```bash
cd frontend
yarn test --watchAll=false --runInBand src/iam/chat/chatApi.test.js
```

Expected: FAIL because `chatApi.js` does not exist.

- [ ] **Step 3: Implement conversation queries**

Use these owner-scoped queries:

```js
client.from("conversations")
  .select("id,title,area,privacy_mode,created_at,updated_at")
  .order("updated_at", { ascending: false });

client.from("messages")
  .select("id,role,content,risk,created_at")
  .eq("conversation_id", conversationId)
  .order("created_at", { ascending: true });
```

Conversation deletion uses:

```js
client.from("conversations").delete().eq("id", conversationId).eq("user_id", userId);
```

The live foreign key cascades message deletion and sets `memories.source_conversation_id` to null; the confirmation copy must say saved memories are separate and are not automatically deleted.

- [ ] **Step 4: Implement standard and private sends**

Standard mode:

1. create a conversation when no ID exists;
2. invoke `chat` with `{ conversationId, message, privacyMode: "standard" }`;
3. update the conversation title after the first successful response;
4. reload messages from the database before returning success.

Private mode:

1. generate an ephemeral UUID in the browser;
2. invoke `chat` with `{ conversationId: ephemeralId, message, privacyMode: "private" }`;
3. keep the returned exchange only in component state;
4. do not create or query a conversation row.

Invoke with:

```js
client.functions.invoke("chat", {
  body: { conversationId, message, privacyMode },
});
```

Reject empty messages and messages over 8,000 characters before invocation.

- [ ] **Step 5: Implement uncertain-network reconciliation**

When the browser cannot know whether a standard send completed, `reconcileUncertainSend` reloads the latest messages. If the latest user message has identical trimmed content and was created after the local send start time, return `{ persisted: true, messages }`; otherwise return `{ persisted: false, messages }`. The UI may offer resend only when `persisted` is false.

- [ ] **Step 6: Run API tests**

```bash
cd frontend
yarn test --watchAll=false --runInBand src/iam/chat/chatApi.test.js
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/iam/chat/chatApi.js frontend/src/iam/chat/chatApi.test.js
git commit -m "feat: add I AM chat data contract"
```

### Task 6: Implement the real Talk to I AM workspace

**Files:**
- Create: `frontend/src/iam/chat/chatState.js`
- Create: `frontend/src/iam/chat/chatState.test.js`
- Create: `frontend/src/iam/chat/IamTalkPage.js`

**Interfaces:**
- Consumes: Phase 1 auth/profile context and `chatApi` functions.
- Produces: real standard/private conversation UI and safe backend-action mapping.

- [ ] **Step 1: Write the failing reducer/action-filter tests**

Tests must prove:

- `SEND_STARTED` locks the composer;
- `SEND_SUCCEEDED` appends or replaces with authoritative messages and clears the draft;
- `SEND_FAILED` preserves the draft;
- `429` copy becomes `Please pause for a moment before sending another message.`;
- `convert_plan`, `save`, and `report` actions are hidden in Phase 1;
- `call` actions are allowed only when route starts with `tel:`;
- `route` action `/safety` maps to `/iam/safety`.

Example:

```js
expect(filterPhaseOneActions([
  { label: "Make a plan", type: "convert_plan" },
  { label: "Call 988", type: "call", route: "tel:988" },
  { label: "Open Safe Path", type: "route", route: "/safety" },
])).toEqual([
  { label: "Call 988", type: "call", route: "tel:988" },
  { label: "Open Safe Path", type: "route", route: "/iam/safety" },
]);
```

- [ ] **Step 2: Verify tests fail**

```bash
cd frontend
yarn test --watchAll=false --runInBand src/iam/chat/chatState.test.js
```

Expected: FAIL because `chatState.js` does not exist.

- [ ] **Step 3: Implement the reducer and action filter**

Use explicit statuses: `idle`, `loading-history`, `sending`, `reconciling`, and `error`. Keep `privacyMode` as `standard` or `private`. Clear private messages immediately when switching back to standard mode after a confirmation.

- [ ] **Step 4: Implement the Talk page**

The page must include:

- visible AI identity and working-title label;
- lane label loaded from profile;
- standard/private segmented control;
- honest private-mode caution;
- message history with user/assistant semantics;
- starter prompts that only populate the composer;
- multi-line composer with `8,000` character counter;
- send button disabled while empty, over limit, offline, or sending;
- `aria-live="polite"` response/loading announcements;
- loading and retry/reconciliation state;
- explicit new-conversation control for standard mode;
- Safety link available at all times;
- only real filtered backend actions.

Do not show goals, memories, reporting, Momentum, levels, or celebrations in Phase 1.

- [ ] **Step 5: Implement failure behavior**

- 401 → sign-in recovery message and `/iam/auth` link.
- 429 → backend pause message and temporary disabled send.
- offline before send → `You appear to be offline. Your message has not been sent.`
- uncertain network after invocation → run reconciliation before displaying resend.
- other safe failure → `Unable to respond safely right now.`

Never render raw stack traces or provider response bodies.

- [ ] **Step 6: Run reducer tests and build**

```bash
cd frontend
yarn test --watchAll=false --runInBand src/iam/chat/chatState.test.js
yarn build
```

Expected: PASS and successful build.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/iam/chat/chatState.js frontend/src/iam/chat/chatState.test.js frontend/src/iam/chat/IamTalkPage.js
git commit -m "feat: connect Talk to I AM"
```

### Task 7: Add real conversation history, resume, new, and delete behavior

**Files:**
- Create: `frontend/src/iam/chat/IamConversationsPage.js`
- Modify: `frontend/src/iam/chat/IamTalkPage.js`

**Interfaces:**
- Consumes: `listConversations`, `loadMessages`, `deleteConversation`.
- Produces: query-parameter contract `/iam/app/talk?conversation=<uuid>`.

- [ ] **Step 1: Write a failing conversation-navigation test**

Extract and test:

```js
export function conversationHref(id) {
  return `/iam/app/talk?conversation=${encodeURIComponent(id)}`;
}
```

Assert UUID input produces the exact encoded route and missing input throws `Conversation id is required.`

- [ ] **Step 2: Verify the test fails**

```bash
cd frontend
yarn test --watchAll=false --runInBand src/iam/chat/IamConversationsPage.test.js
```

Expected: FAIL because the page/test target does not exist.

- [ ] **Step 3: Implement the history page**

Real states:

- loading;
- empty history with working `Start a conversation` button;
- list of owner conversations with title and updated timestamp;
- open/resume link;
- delete button with a confirmation dialog;
- error with real retry button.

Deletion confirmation copy:

`Delete this conversation and its messages? Any separately saved memory remains in the Memory Center until you delete it there.`

Only show the success state after the database delete resolves without error.

- [ ] **Step 4: Make Talk load the requested conversation**

Read `conversation` from `useSearchParams()`. In standard mode, call `loadMessages` for that ID. If the row is missing or inaccessible, show `This conversation is unavailable.` with working `Start a new conversation` and `Back to conversations` controls.

- [ ] **Step 5: Run focused tests and build**

```bash
cd frontend
yarn test --watchAll=false --runInBand src/iam/chat/IamConversationsPage.test.js
yarn build
```

Expected: PASS and successful build.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/iam/chat/IamConversationsPage.js frontend/src/iam/chat/IamConversationsPage.test.js frontend/src/iam/chat/IamTalkPage.js
git commit -m "feat: add I AM conversation history"
```

### Task 8: Add build-blocking app validation and create the protected preview

**Files:**
- Create: `frontend/scripts/validate-iam-app.cjs`
- Modify: `frontend/package.json`
- Modify: `vercel.json`
- Create: `docs/iam/IAM_PHASE_1_VERIFICATION_REPORT.md`

**Interfaces:**
- Consumes: all Phase 1 files, routes, tests, Vercel deployment, and a dedicated test account.
- Produces: build-blocking validation evidence and a draft pull request.

- [ ] **Step 1: Write the validator before registering it**

`validate-iam-app.cjs` must exit nonzero unless all conditions are true:

1. `@supabase/supabase-js` is pinned to `2.106.2`.
2. config/client/auth/profile/chat modules exist.
3. `/iam`, `/iam/auth`, `/iam/onboarding`, `/iam/app/talk`, and `/iam/app/conversations` are registered.
4. `/iam/app` routes are outside the Storm `Layout` route.
5. no I AM app route is added to `Navbar.js`.
6. `SeoManager.js` contains noindex handling for private I AM routes.
7. Talk source contains `8,000`, `private`, `/iam/safety`, and an `aria-live` region.
8. Talk source does not display `convert_plan`, `save`, `report`, `Momentum`, `streak`, `Coming soon`, or `placeholder` as Phase 1 controls.
9. auth page contains sign-up, sign-in, and password-reset calls.
10. onboarding source contains adult and AI-boundary controls and defaults memory off.
11. the original prototype validator still reports 13 areas and 113 screens.

- [ ] **Step 2: Register validator scripts**

Use:

```json
{
  "scripts": {
    "validate:iam": "node scripts/validate-iam-prototype.cjs",
    "validate:iam:app": "node scripts/validate-iam-app.cjs",
    "prebuild": "yarn validate:iam && yarn validate:iam:app"
  }
}
```

Keep the existing `build` script unchanged.

- [ ] **Step 3: Add no-store headers**

Preserve existing headers and add noindex/no-store rules for:

- `/iam/auth`
- `/iam/onboarding`
- `/iam/app/:path*`

Each receives:

```json
[
  { "key": "X-Robots-Tag", "value": "noindex, nofollow, noarchive" },
  { "key": "Cache-Control", "value": "no-store" }
]
```

- [ ] **Step 4: Run the complete local gate**

```bash
cd frontend
yarn test --watchAll=false --runInBand --testPathPattern=src/iam
yarn validate:iam
yarn validate:iam:app
yarn build
```

Expected:

- all I AM tests PASS;
- prototype validator still reports 13 areas and 113 screens;
- app validator PASS;
- optimized build compiles successfully.

- [ ] **Step 5: Configure only the public preview variables**

In the existing Vercel project, configure the Preview environment with:

- `REACT_APP_SUPABASE_URL=https://xdstipqlrnnuutggvhbz.supabase.co`
- the current Supabase anonymous/public key as `REACT_APP_SUPABASE_ANON_KEY`

Do not add the service-role key or OpenAI key to Vercel frontend variables. OpenAI remains configured only in the Supabase Edge Function environment.

- [ ] **Step 6: Push and verify the protected Vercel preview**

```bash
git push -u origin iam-real-web-phase-1
```

Record:

- commit SHA;
- Vercel deployment ID;
- READY state;
- validator output;
- compile result;
- preview URL.

- [ ] **Step 7: Complete the real-account integration checklist**

Use a dedicated test account, not a production personal account containing sensitive history.

1. Create account.
2. Handle email confirmation when required.
3. Sign in.
4. Confirm incomplete profile redirects to onboarding.
5. Confirm memory starts off.
6. Choose each lane and verify it reloads.
7. Send `Hello, I need help choosing one thing to focus on today.` in standard mode.
8. Verify a real AI reply appears.
9. Refresh and verify messages persist.
10. Open Conversations and resume the thread.
11. Delete the thread and verify it disappears.
12. Start private mode, send a non-sensitive test message, leave the page, and verify it does not appear in Conversations.
13. Trigger a safe abuse-keyword test using synthetic language and verify only real Safety/call actions appear, with no celebration.
14. Sign out and verify protected routes redirect to auth.
15. Verify all visible buttons on mobile and desktop.

Do not place emergency calls during testing.

- [ ] **Step 8: Write the verification report**

`IAM_PHASE_1_VERIFICATION_REPORT.md` must state:

- what was tested;
- exact deployment/commit;
- real AI result status without copying sensitive message content;
- auth/onboarding/history/private-mode outcomes;
- known limitations;
- no-spend/no-mobile-build statement;
- whether owner visual review is still pending;
- merge or no-merge recommendation.

- [ ] **Step 9: Open a draft pull request**

PR title:

`I AM Phase 1: real authenticated web companion`

PR body must include:

- real utility delivered;
- exact tests/build evidence;
- preview link;
- working-title hold;
- no Expo/EAS/store action statement;
- Phase 2 actions intentionally hidden rather than dead;
- owner visual and functional review gate.

- [ ] **Step 10: Commit the final verification artifacts**

```bash
git add frontend/scripts/validate-iam-app.cjs frontend/package.json vercel.json docs/iam/IAM_PHASE_1_VERIFICATION_REPORT.md
git commit -m "test: verify I AM phase one companion"
git push
```

---

## Self-Review

- **Spec coverage:** Phase 1 covers real auth, adult/AI onboarding, lane selection, real chat, standard persistence, private-mode honesty, conversation history, no dead controls, safe action mapping, accessibility basics, and preview review.
- **Deferred by design:** goals, memories, reporting, Momentum, Daily Moves, levels, celebrations, and full Safety Path application are Phase 2/3 and are not rendered as fake Phase 1 controls.
- **Type consistency:** profile keys match the live `profiles` columns; lane values match the live enum; conversation/message query fields match the live schema; privacy modes match the existing Edge Function contract.
- **Deletion consistency:** conversation deletion cascades messages; saved-memory source references become null and are not falsely claimed deleted.
- **Security consistency:** no RLS change, no production DDL, no client secret, no service-role key, and no direct browser OpenAI call.
- **Error consistency:** every write shows success only after Supabase confirms it; uncertain standard sends reconcile history before offering resend.
- **Cost consistency:** no EAS, Expo, store, domain, trademark, or subscription action is included.

## Phase 1 Completion Definition

Phase 1 is complete only when the protected preview is READY, all tests and both validators pass, a dedicated test account completes the full checklist, a real AI response succeeds end to end, the owner visually reviews mobile and desktop, and the pull request remains unmerged until an explicit merge authorization is given.