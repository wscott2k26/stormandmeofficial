# I AM Phase 1 Core Auth and Chat — Self-Review Amendment

**Date:** 2026-08-02  
**Applies to:** `2026-08-02-iam-phase-1-core-auth-chat.md`  
**Status:** Binding correction from the required plan self-review

This amendment corrects two execution details in the Phase 1 plan. All other requirements remain unchanged.

## Correction 1 — Yarn Classic install command

In Task 1, Step 4, replace:

```bash
yarn install --frozen-lockfile=false
```

with:

```bash
yarn install
```

Expected result remains: `package.json` and `yarn.lock` change only as needed for the exact dependency `@supabase/supabase-js@2.106.2`; no unrelated dependency version is manually edited.

## Correction 2 — Complete password-reset flow

The Phase 1 release gate requires password reset to work end to end, not only send a reset email.

### Updated provider interface

In Task 2, the `useIamAuth()` interface is:

```js
{
  status,
  session,
  user,
  error,
  signUp,
  signIn,
  signOut,
  requestPasswordReset,
  updatePassword,
}
```

### Updated sign-up call

Replace the original sign-up call with:

```js
client.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: `${window.location.origin}/iam/auth?mode=confirmed`,
  },
});
```

This makes the confirmation destination explicit and keeps the user inside the I AM auth flow.

### Reset-email request

Keep:

```js
client.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/iam/auth?mode=reset`,
});
```

### Actual password update

Add this provider action:

```js
async function updatePassword(password) {
  const normalized = String(password || "");
  if (normalized.length < 10) {
    throw new Error("Password must be at least 10 characters.");
  }

  const { data, error } = await client.auth.updateUser({ password: normalized });
  if (error) throw new Error(error.message || "Password could not be updated.");
  return data.user;
}
```

### Updated auth-page behavior

When `/iam/auth?mode=reset` loads and Supabase has established the recovery session from the emailed link:

1. show `New password` and `Confirm new password` fields;
2. require both values to match;
3. require at least 10 characters;
4. call `updatePassword(password)`;
5. show `Your password has been updated.` only after Supabase succeeds;
6. navigate to `/iam/onboarding` for an incomplete profile or `/iam/app/talk` for a complete profile;
7. show `This reset link is invalid or expired. Request a new one.` when no recovery session is available.

The page must not display the access token, refresh token, URL fragment, or raw provider response.

### Updated tests

Add provider/auth-page contract tests that assert:

```js
expect(mockClient.auth.signUp).toHaveBeenCalledWith({
  email: "adult@example.com",
  password: "a-secure-password",
  options: {
    emailRedirectTo: "https://stormandmeofficial.com/iam/auth?mode=confirmed",
  },
});

expect(mockClient.auth.updateUser).toHaveBeenCalledWith({
  password: "a-new-secure-password",
});
```

Also test mismatched passwords and passwords shorter than 10 characters without calling `updateUser`.

### Updated validator requirement

Task 8 `validate-iam-app.cjs` must confirm auth source contains all four calls:

- `signUp`
- `signInWithPassword`
- `resetPasswordForEmail`
- `updateUser`

A build fails when the reset-request path exists but the actual password-update path is absent.

## Self-Review Result

- Password recovery now has a complete request-and-update path.
- Email confirmation returns to the I AM auth flow.
- Yarn installation uses a command supported by the repository's Yarn Classic setup.
- No database migration, secret exposure, paid action, or mobile build was added.