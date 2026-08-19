# Gravity Outreach OS

> A human-led outreach operating system for structured prospect research, contextual messaging, approvals, follow-ups, and sales execution.

Gravity Outreach OS is an open-source, self-hostable internal work application for Gravity Innovations. It organises outreach without automating human judgement or external communication.

## Project status

**Phase 1 foundation in progress.** The Next.js application shell, Supabase SSR authentication boundary, profiles/RBAC migration, core UI primitives, and initial unit tests are implemented on a feature branch. Live Supabase integration remains unverified until a non-production project is configured.

Cloudflare Workers is the intended hosting target, but production deployment is currently gated: the project has an absolute no-Wrangler rule, while Cloudflare's documented full-stack Next.js/OpenNext deployment path currently depends on that toolchain. See [DEPLOYMENT.md](DEPLOYMENT.md) for the exact constraint. No deployment is claimed.

## What V1 will do

- manage goals, playbooks, companies, contacts, and goal-specific prospects;
- generate assigned task sequences from playbook templates;
- enforce context-first outreach and manager approvals;
- capture structured research without forcing speculative answers;
- prepare outreach drafts while keeping email, LinkedIn, WhatsApp, and calls manual;
- log activities, replies, conversations, follow-ups, calls, and opportunities;
- give reps a prioritised My Work queue and managers review/progress views;
- import companies and contacts from validated CSV previews;
- enforce permissions with application checks and Supabase RLS;
- expose a reusable service layer for a future restricted MCP interface.

It will not send messages, scrape the web, enrich leads, call AI APIs, or become a general-purpose CRM/marketing platform.

## Core principle

> Automate the organisation of sales work, not the human judgement involved in sales.

A prospect cannot become ready for outreach without a company, relevant contact, goal, and explicit reason for outreach. Research may remain unknown or unconfirmed; the system must never encourage invented certainty.

## Planned stack

- Next.js App Router, React, and TypeScript
- Tailwind CSS and lightweight accessible component primitives
- Supabase Postgres, Auth, and RLS
- Zod validation
- Vitest-compatible unit/integration testing and Playwright E2E smoke tests
- Cloudflare Workers target, subject to the documented no-Wrangler deployment gate

Package choices and versions will be pinned during Phase 1 after compatibility checks.

## Architecture

```text
Browser
   |
   v
Next.js application
   +-- Server Components
   +-- Server Actions / restricted Route Handlers
   +-- Application service layer
   |
   v
Supabase
   +-- PostgreSQL + RLS
   +-- Auth
   +-- Storage (deferred)
```

See [ARCHITECTURE.md](ARCHITECTURE.md) and [DATA_MODEL.md](DATA_MODEL.md) for boundaries, workflows, entities, constraints, and the RLS strategy.

## Documentation

- [PLAN.md](PLAN.md) — scope, phases, acceptance criteria, assumptions, and risks
- [TASKS.md](TASKS.md) — live implementation checklist
- [ARCHITECTURE.md](ARCHITECTURE.md) — runtime, security, services, API, errors, and testing
- [DATA_MODEL.md](DATA_MODEL.md) — tables, relationships, constraints, indexes, deletion, and RLS intent
- [DEPLOYMENT.md](DEPLOYMENT.md) — local/Supabase setup and the Cloudflare compatibility gate

## Local setup

Install dependencies, copy the environment template, and start the local application:

```sh
npm install
cp .env.example .env.local
npm run dev
```

Quality gates:

```sh
npm run lint
npm run format:check
npm run typecheck
npm test
npm run build
```

Required browser-safe configuration will include:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Never commit `.env.local`, secret/service-role keys, credentials, or real prospect/customer data.

## Supabase setup

Phase 1 onward will add forward migrations under `supabase/migrations/`, generated TypeScript database types, policy tests, and an obviously fake development seed. Supabase Auth users are created separately through a controlled Auth workflow; business-data seeds do not fabricate Auth credentials.

See [DEPLOYMENT.md](DEPLOYMENT.md) for environment separation, Auth redirects, admin bootstrap, migrations, RLS verification, and seed guidance.

## Screenshots

Screenshots will be added after the first complete UI vertical slice.

## Security

- Supabase Auth owns authentication; no custom password system.
- Every application table uses RLS, with direct-access tests for each role.
- Server-side services validate inputs, permissions, and workflow transitions.
- A sales rep cannot approve their own required-review work.
- The browser never receives a Supabase secret/service-role key.
- External communications are manual and outside the application.

Please report security issues privately to Gravity Innovations rather than opening a public issue with exploit details. A formal security contact/process will be added before a public release.

## Contributing

Contribution guidance will be expanded once the foundation and CI are present. For now:

1. work on a focused branch;
2. keep documentation aligned with material architecture changes;
3. add tests for business rules and denied paths;
4. run the repository quality scripts;
5. submit changes through a pull request—never directly to `main`.

## Licence

Gravity Outreach OS is licensed under the [MIT License](LICENSE).
