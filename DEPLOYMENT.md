# Gravity Outreach OS — Deployment

## Deployment status

Local development and Supabase setup can proceed. Cloudflare production deployment is currently a documented compatibility gate.

The project must not use Wrangler in any form: no local command/login, repository configuration, package script, direct dependency, or transitive adapter dependency. As verified on 19 August 2026, Cloudflare's official [Next.js Workers guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/) deploys full-stack Next.js through OpenNext and a Wrangler-based deployment step. Cloudflare's [Workers Builds configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/) likewise describes a deploy command using that toolchain.

Therefore this document does not provide a misleading Cloudflare deploy recipe. The application will stay portable and Cloudflare-compatible where practical, but a preview or production deployment cannot be marked complete until Cloudflare offers a supported full-stack, Git-connected Next.js route with no Wrangler involvement, or the constraint is explicitly revised.

## Local development

### Prerequisites

- the Node.js LTS version pinned by the repository once Phase 1 begins;
- the package manager/version declared in `package.json`;
- a Supabase project intended for local development or testing;
- no production customer data.

Expected commands after Phase 1:

```sh
npm install
cp .env.example .env.local
npm run dev
```

Windows PowerShell users can copy the file with `Copy-Item .env.example .env.local`.

Quality commands will be exposed as repository scripts, expected to include:

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

The repository will not include a manual production-deployment command.

## Environment variables

Phase 1 will define and validate at least:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Rules:

- `.env.local` is ignored and never committed;
- only browser-safe values use the `NEXT_PUBLIC_` prefix;
- a Supabase secret/service-role key is not required by the normal V1 application;
- if an administrative maintenance script later needs a secret, it must be an explicit operator-only process outside browser/runtime bundles and documented separately;
- production and preview variables are configured in the hosting dashboard, not committed.

## Supabase project setup

### 1. Create projects/environments

Use separate Supabase projects for production and non-production. Development seed data must never be applied to production.

### 2. Apply migrations

Migrations in `supabase/migrations/` are the source of truth. During implementation, the repository will document the selected migration execution path supported by Supabase Dashboard/CLI. Migration review must occur before applying it to a shared project.

Apply in numeric order and regenerate the TypeScript database types after schema changes. Do not make undocumented production-only edits in the dashboard.

### 3. Configure Auth

- enable email/password authentication;
- disable public sign-up in production;
- set the Site URL to the production application origin once deployment exists;
- add `http://localhost:3000/**` only to the non-production redirect allow-list;
- add exact production callback URLs;
- add preview patterns only after confirming they cannot permit an attacker-controlled redirect;
- use the current Supabase SSR cookie/PKCE approach;
- create users through a controlled invitation/admin process.

The current Supabase guidance is documented in [Server-Side Rendering](https://supabase.com/docs/guides/auth/server-side) and [Creating a Supabase client for SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs&queryGroups=framework).

### 4. Bootstrap the first admin

1. Create the Auth user through the Supabase Dashboard or approved admin invitation flow.
2. Confirm the profile trigger created a `sales_rep` profile.
3. In the SQL editor, run the narrowly documented bootstrap statement from the relevant migration/runbook to set that known user's role to `admin`.
4. Verify the user ID and email before execution.
5. Sign in and create/promote subsequent users through the application's admin flow when available.

Never accept a requested role from public sign-up metadata.

### 5. Verify RLS

Before connecting production, run the policy suite for:

- anonymous;
- inactive user;
- sales rep A;
- sales rep B;
- sales manager;
- admin.

Test SELECT, INSERT, UPDATE, and DELETE independently for every table. Browser/API tests must use publishable credentials and user JWTs, not a secret that bypasses RLS.

### 6. Seed non-production data

Run the documented business seed only after test Auth users exist and their IDs are mapped. Seed records are obviously fake. The seed includes the two example goals/playbooks and fake companies, contacts, tasks, research, outreach, and activities from the brief.

### 7. Storage

No bucket is required for the basic V1 workflow. If attachments are later approved, create a private `attachments` bucket with file-size/type limits, RLS, and signed-URL access. Do not create a public bucket or store CRM rows as files.

## Cloudflare Git deployment gate

The intended operating model remains:

```text
GitHub pull request -> review -> merge to production branch
                                      |
                                      v
                         Cloudflare detects commit
                                      |
                                      v
                          managed build and deploy
```

Before configuring a Cloudflare project, recheck the official documentation and inspect the complete dependency tree. Continue only if all of the following are true:

- Cloudflare supports full Next.js App Router features needed here, including SSR, Server Actions/Route Handlers, cookies, and dynamic authenticated pages;
- setup is performed through the Cloudflare Dashboard with GitHub connected;
- neither the repository nor Cloudflare build requires Wrangler, directly or indirectly;
- no local Cloudflare credentials or manual production commands are required;
- previews and production can receive separate secrets/environment values.

If those conditions become satisfiable, use the Dashboard workflow:

1. In Cloudflare, create a Worker/application from an imported Git repository.
2. Authorise GitHub and select `GravityInnovations/Pipelane` with least-privilege repository access.
3. Set the reviewed production branch (normally `main`).
4. Select the supported native Next.js framework preset that meets the gate; do not add a workaround package.
5. Use the repository's standard install/build commands as required by that preset.
6. Configure production build variables/secrets for Supabase URL, publishable key, and canonical app URL.
7. Enable pull-request preview deployments and configure separate non-production Supabase values.
8. Deploy a preview and run Auth, protected-route, mutation, RLS, and critical-workflow smoke tests.
9. Add the preview/production origins to Supabase's exact Auth redirect allow-list.
10. Attach the custom domain, enforce HTTPS, update `NEXT_PUBLIC_APP_URL`, and retest login/logout/callback cookies.
11. Merge only after the preview and automated gates pass; verify the deployed commit SHA in Cloudflare.

If Cloudflare still exposes only a Wrangler-dependent path, stop at this gate. Do not silently switch to Cloudflare Pages static export: it would not satisfy the required authenticated full-stack Next.js behaviour.

## Preview and production separation

| Concern | Preview | Production |
| --- | --- | --- |
| Git source | Pull-request branch | Reviewed `main` merge |
| Supabase | Non-production project | Production project |
| Seed data | Fake seed allowed | Never seed demo data |
| Auth redirects | Exact preview origin/pattern after review | Exact canonical domain |
| Variables | Preview-scoped | Production-scoped |
| Release gate | Automated checks + smoke test | Approved PR merge + deployed SHA verification |

## Rollback

Application rollback should redeploy a previously reviewed Git commit through the hosting dashboard. Database migrations are forward-only in shared environments: use a reviewed corrective migration rather than editing history or assuming application rollback reverses schema/data changes.

Before a destructive migration, document backup/recovery, compatibility with the currently deployed app, and an expand/migrate/contract sequence where needed.

## Production checklist

- [ ] All changes arrived through reviewed pull requests
- [ ] Exact source commit identified
- [ ] Lint, typecheck, unit, integration, E2E, and production build passed
- [ ] Dependency tree contains no prohibited deployment toolchain
- [ ] Cloudflare no-Wrangler compatibility gate satisfied
- [ ] Production variables configured only in dashboards/secrets
- [ ] Supabase migrations reviewed and applied
- [ ] RLS matrix passed using user-scoped credentials
- [ ] Public sign-up disabled and admin bootstrap verified
- [ ] Production/preview Auth URLs tightly allow-listed
- [ ] No real data, tokens, or secret keys in Git, logs, or browser bundles
- [ ] Preview critical workflow and responsive/accessibility smoke checks passed
- [ ] Custom domain, HTTPS, session cookies, and deployed SHA verified

Until the Cloudflare gate is satisfied, its checklist items remain incomplete and the project status must say deployment-blocked.
