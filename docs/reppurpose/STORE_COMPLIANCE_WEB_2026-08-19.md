# RepPurpose Store Compliance Web Routes — 2026-08-19

Operator: Storm And Me LLC

Production routes after merge/deploy:
- `/reppurpose/` — RepPurpose compliance landing page
- `/reppurpose/privacy.html` — RepPurpose privacy policy
- `/reppurpose/delete-account.html` — external account-deletion request page

The external deletion page submits to the RepPurpose Supabase `request-account-deletion` Edge Function. That public function creates a deletion request only; it does not delete an Auth user and does not expose whether an account exists. The destructive signed-in deletion path remains inside RepPurpose through the JWT-protected `delete-account` Edge Function.

Preview verification before merge:
- deletion page returned HTTP 200 on Vercel preview
- privacy page returned HTTP 200 on Vercel preview
- both pages identified Storm And Me LLC and RepPurpose and cross-linked the deletion/privacy controls
