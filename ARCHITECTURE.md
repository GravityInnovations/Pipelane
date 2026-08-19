# Gravity Outreach OS — Architecture

## System context

Gravity Outreach OS is one portable Next.js application intended for eventual deployment as a Cloudflare Worker. Supabase supplies authentication, Postgres, and—only if later required—private object storage. All user-facing mutations cross a server-side application-service boundary; Postgres RLS remains the final enforcement layer.

The project has an absolute no-Wrangler constraint: no Wrangler command, login, configuration, script, direct dependency, or transitive adapter dependency may be introduced. Cloudflare's official full-stack Next.js Workers path currently uses Wrangler through OpenNext, so Cloudflare deployment is an unresolved compatibility gate. The application architecture proceeds without coupling to that toolchain and must not claim a successful Worker deployment until Cloudflare provides a supported Wrangler-free route or the constraint changes explicitly.

```text
Browser
  |  HTTPS + Supabase session cookies
  v
Next.js runtime (Cloudflare Worker target is gated)
  |
  +-- Server Components -------- read models
  +-- Server Actions ----------- UI commands
  +-- Route Handlers ----------- restricted API / future MCP boundary
  +-- Application Services ----- validation, authorisation, workflows
  +-- Repositories ------------- caller-scoped Supabase queries
  |
  v
Supabase
  +-- Auth --------------------- users, JWTs, password flows
  +-- PostgREST / RPC ---------- RLS-constrained data access
  +-- PostgreSQL --------------- records, policies, transactions
  +-- Storage (deferred) ------- private attachments only
```

Future integration preserves the same rules:

```text
ChatGPT
  |
  v
MCP server or authenticated MCP route adapter
  |
  v
Restricted Route Handlers
  |
  v
Application Services -> caller-scoped Supabase -> RLS
```

No AI API, scraper, message sender, or separate backend is part of V1.

## Runtime boundaries

### Browser

The browser owns presentation state, accessible interaction, optimistic feedback only where rollback is safe, CSV file selection, and client-side previews. It may use a browser Supabase client for session-aware reads or future realtime features, but RLS must make every direct request safe. It never receives a service-role/secret key or authoritative role input.

### Next.js application

- **Server Components** compose initial, role-scoped read models and keep data-heavy pages out of the client bundle.
- **Client Components** are limited to tables, filters, forms, dialogs, drawers, and other interaction that needs browser state.
- **Server Actions** adapt trusted UI intents into validated service calls. They do not contain reusable domain rules.
- **Route Handlers** expose narrow authenticated operations where an HTTP boundary is useful. They return DTOs, not raw unrestricted table access.
- **Proxy/session refresh** follows the current Supabase SSR cookie pattern. Protected pages verify claims or fetch the current user; server code does not authorise from an unverified session object.

Authenticated responses that set or depend on session cookies must not be shared-cached. Public static assets may be cached normally.

### Application services

Services are `server-only`, accept explicit actor context, validate input with Zod, enforce application permissions, coordinate repositories/RPCs, emit safe errors, and return DTOs. Planned service modules:

```text
src/server/
  auth/
  services/
    activities.ts
    companies.ts
    contacts.ts
    goals.ts
    imports.ts
    opportunities.ts
    outreach.ts
    playbooks.ts
    research.ts
    search.ts
    tasks.ts
  repositories/
  validation/
  errors/
  logging/
```

Services must not import React, request globals, or GPT/OpenAI libraries. Adapters build actor context and pass it in. This keeps rules reusable by Server Actions, Route Handlers, tests, and a future MCP adapter.

### Supabase

Ordinary reads and writes use a caller-scoped Supabase client. RLS is mandatory on every application table. Multi-record workflows use security-invoker Postgres functions where possible; any security-definer function must have a fixed empty `search_path`, fully qualified objects, minimal grants, and explicit actor checks.

## Proposed source structure

```text
src/
  app/
    (auth)/login/
    (app)/
      dashboard/  my-work/  goals/  companies/  contacts/
      tasks/  reviews/  opportunities/  activity/  playbooks/
      team/  imports/  settings/
    api/v1/
  components/
    ui/  layout/  data-table/  forms/  workflow/
  features/
    activities/  companies/  contacts/  goals/  imports/
    opportunities/  outreach/  playbooks/  research/  tasks/
  lib/
    supabase/client.ts
    supabase/server.ts
    supabase/proxy.ts
    env.ts
  server/
    auth/  services/  repositories/  validation/  errors/  logging/
  types/
supabase/
  migrations/
  seed.sql
tests/
  unit/  integration/  e2e/
```

Feature folders contain screen-specific presentation and forms. Cross-feature business rules belong in server services, not components.

## Identity and authorisation

### Authentication

Supabase Auth owns passwords and sessions. Production public sign-up is disabled. The app uses email/password login, cookie-based SSR, session refresh, logout, and an inactive/unauthorised state. `public.profiles.id` references `auth.users.id`.

### Role model

Roles are `admin`, `sales_manager`, and `sales_rep`.

| Capability | Admin | Manager | Rep |
| --- | --- | --- | --- |
| Platform/user role administration | Yes | No | No |
| View all sales records | Yes | Yes | No |
| Manage goals/playbooks | Yes | Yes | Read relevant |
| Assign work | Yes | Yes | No |
| Review/approve another user's work | Yes | Yes | No |
| Update assigned prospects/tasks | Yes | Yes | Yes |
| Log activities and draft/submit work | Yes | Yes | Yes, in scope |

Application guards improve errors and keep workflows explicit. RLS independently enforces visibility and writes, including direct browser requests. Client-side button hiding is convenience only.

Role escalation is prevented by column-sensitive profile update policies or a restricted admin function. A user cannot change their own `role`, `active`, or identity fields through a generic update.

### Visibility model

- Admins/managers can read all application sales records.
- Reps can read their own profile, active goals/playbooks needed for assigned work, and companies/contacts/prospects/tasks connected to their assignments or records they created where onboarding requires it.
- Child records inherit visibility through their parent company/contact/goal prospect.
- Inactive profiles have no application data access.

This is a single-workspace model. Multi-tenancy would require an organisation key on every table and is a future architectural change.

## Workflow consistency

### Context-first prospect transition

The task service validates the requested transition, and a database trigger/function rejects `ready_for_outreach` unless the prospect has a company, non-null contact, goal, and trimmed `reason_for_outreach`. Later stages inherit that invariant.

### Task generation

When requested, one transactional function locks the goal prospect, verifies the playbook, and clones active templates into tasks. A uniqueness key prevents duplicate generation on retries. Template values are copied; later template edits do not rewrite tasks.

### Task review

An explicit transition map rejects arbitrary status updates. Required-review work follows submission, review, approval, and completion states. The reviewer must be an active manager/admin and cannot be the task assignee or submitting author. Change requests require a comment in the corresponding research/outreach record and emit an activity.

### Manual outreach

Approval makes a manual-send task actionable. `markOutreachSent` validates approval, records `sent_at`, updates the task/prospect as appropriate, and inserts an activity in one transaction. It never invokes an external messaging API. Optional follow-up creation is part of the same command.

## Data access and API strategy

Repositories provide small query operations and never return secret Auth fields. Services expose business-oriented methods such as `generateProspectTasks`, `submitResearch`, `approveOutreach`, and `logActivityWithFollowup`.

Route Handlers under `/api/v1` will be added only for approved MCP-ready operations. Each route:

1. verifies identity and active profile;
2. validates path/query/body and enforces size limits;
3. calls the same service used by the UI;
4. returns a stable DTO/error code;
5. logs correlation ID, actor ID, operation, result, and duration without message bodies or personal contact values.

There is no endpoint for arbitrary table/query execution.

## UI architecture

The responsive shell has a persistent desktop sidebar, compact top bar, and mobile drawer. Manager and rep dashboards use role-specific read models. My Work is the primary rep screen.

Reusable primitives include `StatCard`, `StatusBadge`, `DataTable`, `FilterBar`, `EmptyState`, `ActivityTimeline`, `TaskList`, `GoalProgress`, `ReviewCard`, `QuickLogDialog`, `EntityHeader`, `PageHeader`, and `ConfirmDialog`. Native semantic HTML and accessible headless primitives take priority over a large UI framework.

Tables use server-side filtering/pagination once record counts justify it. Charts are avoided until a relationship cannot be communicated clearly with counts, tables, or progress bars.

## Validation and errors

- Zod schemas validate forms, Server Actions, Route Handlers, transitions, and import rows.
- Database constraints protect invariants independently of TypeScript.
- Expected failures use typed error codes: `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_FAILED`, `CONFLICT`, `INVALID_TRANSITION`, and `INTERNAL_ERROR`.
- UI errors are actionable and do not expose stack traces, SQL, tokens, or policy details.
- Unique/conflict failures are mapped to user-safe messages.

## Logging and auditability

Runtime logs are structured JSON with timestamp, level, request/correlation ID, actor ID when known, operation, duration, and safe error code. Passwords, tokens, outreach bodies, research notes, emails, phone numbers, and CSV contents are not logged.

Activities are business history, not security logs. Important events are append-only and include their actor and timestamp. Cloudflare's built-in Worker logs/observability are sufficient for V1; no commercial vendor is required.

## Testing strategy

- **Unit:** validation, permissions, normalisation, transition maps, task generation planning, follow-up construction, and metric definitions.
- **Database/integration:** migrations against an isolated Supabase-compatible database, RLS matrices using real role JWTs, RPC atomicity/idempotency, service CRUD, and protected routes.
- **Component/accessibility:** critical forms, dialogs, queue ordering, empty/error states, labels, focus, and keyboard behaviour.
- **E2E:** Playwright runs the specified goal-to-opportunity scenario against a disposable test project/seed.
- **Deployment smoke:** Next production build plus OpenNext build/preview; a Git-connected Cloudflare preview validates Auth callbacks and runtime behaviour.

Tests must prove denied paths as well as happy paths, especially self-approval and cross-rep access.

## Cloudflare compatibility

Do not install `wrangler`, `@opennextjs/cloudflare`, or another package whose deployment path introduces Wrangler. Dependencies are still checked for eventual Workers compatibility before adoption. Avoid native binaries, local filesystem persistence, long background processes, and Node-only socket assumptions.

Supabase is accessed over HTTPS through its supported JavaScript libraries. Authenticated pages are dynamic and not shared-cached. The standard Next.js build remains the verified application artifact while deployment is gated. At the production-readiness phase, official Cloudflare documentation must be checked again for a Git-connected, full-stack Next.js deployment that satisfies the absolute no-Wrangler rule. If none exists, this is a reported blocker requiring an explicit decision; it is not worked around or marked complete.

## Security review checklist

- RLS enabled and policy matrix tested for every table and operation;
- profile role/active fields protected against self-escalation;
- caller-scoped clients for ordinary operations and no browser secret key;
- database functions reviewed for privilege and `search_path` safety;
- state transitions and multi-row workflows enforced transactionally;
- CSRF-safe framework mutation patterns and strict input/size validation;
- safe redirects and production/preview Auth allow-list;
- no sensitive fields in logs, URLs, browser errors, seed data, or repository;
- dependencies and Worker compatibility reviewed before release.
