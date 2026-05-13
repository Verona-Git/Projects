# Autovalet CRM Production Workflow

This project separates website code from CRM data.

- Code lives in GitHub and deploys through Vercel.
- CRM data lives in Supabase tables.
- Schema changes live in `supabase/migrations`.
- Production data must never be stored in hardcoded arrays, browser-only localStorage, static JSON files, or seed files that overwrite production.

## Project Structure

```text
.
├── .github/workflows/ci.yml
├── .env.example
├── README.md
├── package.json
├── src
│   ├── app
│   │   ├── auth/callback/route.js
│   │   ├── crm
│   │   │   ├── active-projects/page.js
│   │   │   ├── enquiries/page.js
│   │   │   ├── layout.js
│   │   │   └── page.js
│   │   ├── login/page.js
│   │   └── pending-approval/page.js
│   └── lib
│       ├── realtime/useCrmRealtime.js
│       └── supabase
│           ├── client.js
│           └── server.js
└── supabase/migrations
    └── 202605130001_initial_crm_schema.sql
```

## Local Development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Fill `.env.local` with local Supabase and integration values:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
MICROSOFT_TENANT_ID=
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
OUTLOOK_USER_EMAIL=
```

Never commit `.env`, `.env.local`, exported CRM data, or production backups.

## GitHub Workflow

Use `main` as the production branch.

```bash
git checkout main
git pull
git checkout -b feature/short-description
git status
git add .
git commit -m "Describe the change"
git push -u origin feature/short-description
```

Open a pull request from the feature branch into `main`.

Before merging, confirm:

- GitHub CI passed.
- Vercel Preview Deployment succeeded.
- The Vercel preview URL works.
- CRM data is still read from Supabase, not code files.
- No migration contains `DROP TABLE`, `TRUNCATE`, or `DELETE FROM` for production tables unless explicitly approved.

Merge into `main` only after checks pass. Vercel will then create a Production Deployment.

## Vercel Setup

1. Import this GitHub repository into Vercel.
2. Set the Production Branch to `main`.
3. Keep automatic deployments enabled:
   - Pushes to non-`main` branches create Preview Deployments.
   - Merges into `main` create Production Deployments.
4. Add environment variables separately for Local, Preview, and Production:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
MICROSOFT_TENANT_ID
MICROSOFT_CLIENT_ID
MICROSOFT_CLIENT_SECRET
OUTLOOK_USER_EMAIL
```

Only variables beginning with `NEXT_PUBLIC_` are allowed in browser code. Never use `SUPABASE_SERVICE_ROLE_KEY` in frontend components.

## Supabase Setup

1. Create a Supabase project.
2. Enable Supabase Auth.
3. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://*-your-vercel-project.vercel.app/auth/callback`
   - `https://your-production-domain.com/auth/callback`
4. Apply migrations from `supabase/migrations`.
5. Enable Realtime for `enquiries` and `active_projects`.
6. Invite users through Supabase Auth.
7. Approve users by setting `profiles.is_approved = true`.

The initial migration creates `profiles`, `enquiries`, `active_projects`, and `processed_emails`. It enables Row Level Security so only authenticated approved users can read or write CRM data.

## Migration Rules

Use migrations for structure changes only. Do not use migrations to reset, replace, or seed production CRM data.

Before any production schema migration:

1. Create a Supabase backup.
2. Export affected production tables if the change touches live CRM data.
3. Review SQL for destructive commands.
4. Run the migration on preview/staging first.
5. Confirm the app can still read existing records.
6. Apply to production only after approval.

Production migrations must not include `DROP TABLE`, `TRUNCATE`, or `DELETE FROM` for `enquiries`, `active_projects`, `processed_emails`, or `profiles` unless explicitly approved.

## Authentication And Realtime

All `/crm` routes are protected by `src/middleware.js`. Access requires Supabase Auth and `profiles.is_approved = true`.

Realtime subscriptions are implemented in `src/lib/realtime/useCrmRealtime.js` and `src/app/crm/CrmRealtimeRefresh.js`. When `enquiries` or `active_projects` changes, open CRM pages refresh without manual browser refresh.

## CI Checks

GitHub Actions runs:

```bash
npm install
npm run lint --if-present
npm run test --if-present
npm run build
```

If the build fails, do not merge to `main`.

## Data Preservation Rule

Website code updates must never delete or overwrite existing CRM data.

Do not store production CRM data in hardcoded JavaScript arrays, browser-only localStorage, static JSON files, or seed files that overwrite production. All production CRM data belongs in Supabase.
