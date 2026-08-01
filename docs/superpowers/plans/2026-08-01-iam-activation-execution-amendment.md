# I AM Activation Execution Amendment

This amendment overrides only the test mechanics in Task 2 of `2026-08-01-iam-activation-foundation.md`. The connected execution environment can write and inspect GitHub files and observe Vercel builds, but it cannot run an interactive local Jest process against the repository checkout.

## Testable file changes

- Replace planned `frontend/src/data/iamPrototypeScreens.js` with `frontend/src/data/iamPrototypeScreens.json`.
- Replace planned `frontend/src/pages/IamPrototype.test.js` with `frontend/scripts/validate-iam-prototype.cjs`.
- Modify `frontend/package.json` to add:

```json
{
  "scripts": {
    "validate:iam": "node scripts/validate-iam-prototype.cjs",
    "prebuild": "yarn validate:iam"
  }
}
```

The existing `build` command remains unchanged. Yarn automatically runs `prebuild` before `build`, so every Vercel preview build must pass the I AM inventory validator before Create React App compiles.

## Validator contract

`validate-iam-prototype.cjs` must exit nonzero unless all conditions pass:

1. Required area IDs exist: `onboarding`, `home`, `talk`, `plan`, `career`, `relationships`, `wellness`, `confidence-style`, `safety`, `community`, `memory`, `profile-subscription`, and `admin-support`.
2. Every area has a non-empty `screens` array.
3. Every screen has non-empty `id`, `title`, `eyebrow`, `summary`, and `primaryAction` values.
4. Area IDs and screen IDs are globally unique.
5. Home, Talk, and Profile/Subscription contain a safety shortcut or safety-link screen.
6. The registry contains no `coming soon`, `placeholder`, or `TBD` text.
7. The prototype page source contains `Internal concept review`, `working title`, `noindex`, `/iam/safety`, `/iam/support`, and `/iam/delete-account`.
8. The prototype route exists in `frontend/src/App.js` and is not added to the public navigation.

## Evidence standard

A Vercel deployment may be called build-passing only when its build status is READY after these branch changes. A failed or absent preview must be reported as a blocker; it must not be described as passing.
