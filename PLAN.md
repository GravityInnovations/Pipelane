# Gravity Outreach OS — Implementation Plan

## Product understanding

Gravity Outreach OS is a self-hostable internal sales execution system. It gives a small sales team one place to organise goals, prospects, research, approvals, manual outreach, follow-ups, activities, and opportunities. It deliberately automates coordination and record-keeping while leaving research judgement and every external communication to a person.

The product is not a general-purpose CRM or an automated sales agent. Its differentiator is a context-first, reviewable workflow: a prospect must have a company, relevant contact, goal, and explicit reason for outreach before outreach can be prepared.

## V1 scope

V1 includes:

- Supabase email/password authentication, profiles, and three roles;
- goals, playbooks, immutable generated task sequences, companies, contacts, and contact channels;
- goal-specific prospects with qualification, ownership, priority, and reason for outreach;
- assigned work, follow-ups, task transition rules, and manager review;
- structured research and outreach drafts with approval history represented by activities;
- manual-send and manual-reply logging only;
- company/contact histories, notes, opportunities, goal metrics, manager reporting, and global search;
- validated CSV import previews with duplicate hints and explicit confirmation;
- a server-side application service layer and restricted HTTP API suitable for a future MCP adapter;
- Supabase migrations, RLS, fake development seed data, automated tests, and Git-connected Cloudflare Workers deployment documentation.

## Out of scope

- AI or LLM APIs, autonomous agents, enrichment, scraping, email discovery, or verification;
- email, LinkedIn, WhatsApp, SMS, or dialler integrations and automated sequences;
- bulk marketing, lead scoring, warm-up, marketing automation, or configurable workflow builders;
- billing, invoicing, proposals, catalogues, support desk, or forecasting;
- speculative attachments and Storage usage until the core workflow is complete;
- automatic merging of duplicate records;
- direct database administration or unrestricted CRUD through the future MCP/API boundary.

## Major modules

1. **Identity and access** — Supabase Auth, profiles, RBAC, protected routes, and RLS.
2. **Strategy** — goals, playbooks, and playbook task templates.
3. **CRM context** — companies, contacts, contact channels, notes, and search.
4. **Execution** — goal prospects, generated tasks, My Work, and follow-ups.
5. **Evidence** — structured research, sources, and uncertainty-safe fields.
6. **Approval** — research and outreach review, comments, and separation of duties.
7. **History** — activities, Quick Log, and automatic workflow events.
8. **Pipeline** — opportunities, goal progress, and manager/team dashboards.
9. **Operations** — CSV imports, error handling, observability, seeds, and deployment.
10. **Integration boundary** — application services and restricted route handlers for future MCP use.

## Architectural decisions

- Use a single Next.js App Router application with TypeScript; do not introduce a second backend.
- Use server components for initial reads and small client islands for interactive forms, tables, filters, and dialogs.
- Put domain rules in framework-light server-only services. Server Actions and Route Handlers call services rather than containing business rules.
- Use the caller's Supabase session for ordinary operations so RLS remains the final data boundary. A service-role key is not required by the application runtime in V1.
- Use `@supabase/ssr` cookie-based clients and verify identity server-side with current supported claims/user validation, never a client-supplied role.
- Store roles in `public.profiles`; protect role changes with database policy/function controls and application checks.
- Use Postgres functions for multi-row atomic workflows whose correctness depends on transactions, including task generation and approval transitions.
- Record workflow events as append-only activities. Mutable records retain their current state; activities provide the audit-oriented timeline.
- Use UTC `timestamptz` for events and `date` for due/target dates. Render in the user's/browser's local timezone.
- Use `jsonb` only for activity metadata, import mapping/results, and research sources. Core queryable business fields remain typed columns.
- Keep the application compatible with Cloudflare Workers, but do not add Wrangler directly, indirectly, or through an adapter. As of 19 August 2026, Cloudflare's documented full-stack Next.js/OpenNext deployment path relies on Wrangler, so production deployment is a recorded compatibility gate rather than a falsely completed feature.

## Delivery phases

### Phase 0 — Planning

Produce and cross-check this plan, the task breakdown, architecture, data model, deployment guide, and README skeleton.

**Complete when:** the six documents agree on scope, entities, security boundary, delivery sequence, and production path; no application code exists yet.

### Phase 1 — Foundation

Initialise Next.js, TypeScript, Tailwind, accessible UI primitives, Supabase clients, environment validation, authentication, profiles/RBAC, and the responsive shell. Keep runtime dependencies portable and do not add Wrangler/OpenNext while the no-Wrangler constraint is unresolved.

**Complete when:** a configured user can log in/out, refresh a session, reach protected routes, see role-appropriate navigation, and an unauthorised user cannot enter the app. Lint, typecheck, unit tests, and the standard Next.js production build pass. A Workers build is not claimed until a genuinely Wrangler-free supported route exists.

### Phase 2 — CRM foundation

Implement migrations, RLS, services, and screens for goals, playbooks/templates, companies, contacts, and contact channels.

**Complete when:** authorised users can manage the core records allowed by their role, duplicates are constrained/hinted where deterministic, and RLS tests prove cross-user restrictions.

### Phase 3 — Workflow engine

Implement goal prospects, context-first readiness, transactional task generation, task transitions, assignment, My Work, and follow-up creation.

**Complete when:** generated task snapshots survive later playbook changes, invalid transitions fail server-side, review tasks enforce separation of duties, and queue ordering is deterministic.

### Phase 4 — Context and history

Implement structured research, activities, notes, Quick Log, and entity timelines.

**Complete when:** uncertainty can be recorded without invented facts, Quick Log creates an activity and optional follow-up atomically, and company/contact pages show reverse chronological history.

### Phase 5 — Approval workflow

Implement research and outreach submission, review queue, change requests, approval, manual sent logging, and associated activity/task/prospect changes.

**Complete when:** reps cannot self-approve; reviewer comments are required for changes; approval unlocks the correct next task; marking sent never sends externally and can schedule a follow-up.

### Phase 6 — Management

Implement goal metrics, manager/rep dashboards, bottlenecks, team activity, and opportunities.

**Complete when:** dashboard counts reconcile with source records and the critical workflow can progress from reply through conversation, call, and opportunity.

### Phase 7 — Operational tools

Implement global Postgres search, filters, and two-step CSV imports for companies and contacts.

**Complete when:** search respects RLS; import mapping/preview is validated; likely duplicates are shown but never auto-merged; confirmed rows report success and failure individually.

### Phase 8 — MCP readiness

Harden application services, add authenticated restricted Route Handlers, document DTOs and errors, and prove UI/API paths use the same rules.

**Complete when:** supported operations expose narrow business commands/queries without raw CRUD, service-role credentials, or AI dependencies.

### Phase 9 — Production readiness

Complete unit/integration/E2E coverage, accessibility and responsive QA, RLS/security review, fake seeds, failure states, deployment configuration, and final documentation.

**Complete when:** the end-to-end acceptance scenario passes in a test Supabase project and, only if the deployment gate has been resolved without Wrangler, a Cloudflare preview; all other quality gates pass; production setup requires no paid external API. If Cloudflare still requires Wrangler, V1 is application-complete but deployment-blocked and must be reported honestly.

## Cross-phase acceptance criteria

- Every mutation validates input and authorisation on the server and is also constrained by RLS.
- A prospect cannot become `ready_for_outreach` without company, contact, goal, and non-blank `reason_for_outreach`.
- A rep cannot approve their own required-review work, even by calling Supabase directly.
- Every outbound communication is performed outside the app; the app only stores approved content and manual activity confirmation.
- Workflow operations that update multiple records are transactional and idempotent where retries are plausible.
- Tables include deliberate constraints, indexes, delete behaviour, and documented RLS policies.
- Empty, loading, validation, unauthorised, and server-error states are usable and accessible.
- No secrets, real prospect data, or service-role keys enter source control or browser bundles.
- Each phase updates `TASKS.md` and relevant documentation before its PR is considered complete.

## Assumptions

1. V1 is a single Gravity Innovations workspace; multi-tenancy and organisations are deferred. RLS is role/assignment based within that workspace.
2. Admin accounts are invited/created through Supabase administration, then promoted using the documented bootstrap procedure; public sign-up is disabled for production.
3. Managers and admins may see all sales records. Reps see records assigned to them plus active goals/playbooks necessary to complete assigned work.
4. A goal prospect is unique by goal, company, and nullable contact using explicit partial unique indexes.
5. Generated tasks are snapshots. Editing or disabling a playbook template affects future generation only.
6. Due offsets are calendar days in V1; business-day calendars and holidays are deferred.
7. Currency values use `numeric(14,2)` with an ISO 4217 three-letter code; currency conversion is out of scope.
8. Soft archival/statuses preserve business history. Hard deletes are restricted and used mainly for erroneous, unreferenced data.
9. Research textual fields may contain `Unknown`, `Not Found`, or `Not Confirmed`; blank is also valid while draft.
10. Search uses Postgres full-text/trigram facilities only if available in hosted Supabase; otherwise indexed `ilike` is the initial fallback.
11. CSV files are parsed during the request/short-lived job without permanent Storage in the first implementation.
12. Notifications are an in-app indicator derived from tasks/reviews; email/push notifications are out of scope.
13. Cloudflare and Supabase are separate managed services reached over HTTPS; no direct Postgres TCP connection is required from an eventual Worker runtime.
14. The latest Cloudflare deployment documentation will be reverified at the deployment phase. No Wrangler or OpenNext dependency/configuration may be added merely to satisfy the original platform target.

## Risks and mitigations

| Risk | Consequence | Mitigation |
| --- | --- | --- |
| RLS policy complexity | Data exposure or blocked legitimate work | Policy matrix per table, helper functions with fixed `search_path`, caller-scoped clients, and automated multi-role tests |
| Role escalation | Rep obtains manager/admin powers | Restrict profile role updates; never trust form/JWT metadata alone; audit admin role changes |
| SSR session mistakes | Spoofed/stale identity or leaked cached session | Current `@supabase/ssr` cookie pattern, verified claims/user, no shared caching for authenticated output |
| No-Wrangler rule conflicts with Cloudflare's current Next.js path | Production deployment cannot honestly be completed | Keep standard Next.js portable, add no Wrangler/OpenNext package or config, recheck official support at the deployment gate, and require an explicit platform/constraint decision if still blocked |
| Multi-record workflow failure | Tasks, statuses, and activities disagree | Transactional Postgres functions, idempotency checks, and integration tests |
| Duplicate people/companies | Fragmented history | Normalisation, deterministic unique indexes where safe, duplicate hints, no uncertain auto-merge |
| Task sequencing ambiguity | Premature work becomes actionable | Explicit transition service and sequence gating; keep templates simple in V1 |
| Dashboard metric drift | Managers lose trust | Define metrics in one query/service layer and reconciliation tests |
| Future MCP bypasses rules | Wider attack surface | Reuse application services and narrow commands; authenticate every route; retain RLS |
| CSV resource limits on Workers | Timeout or memory pressure | File/row limits, streaming or chunking where supported, preview before commit, partial failure report |
| Scope size | Slow delivery and inconsistent UX | Phase gates, vertical slices, live task list, and no speculative integrations |

## Change control

Material changes to identity, authorisation, tenancy, deployment, workflow state machines, or core entity relationships must update the relevant planning document before implementation. The PR must explain the reason, migration impact, and compatibility risk.
