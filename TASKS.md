# Gravity Outreach OS — Delivery Tasks

This checklist is append-only for unfinished work: complete items are checked, discovered work is added, and deferred items remain visible.

## Phase 0 — Planning

- [x] Inspect repository, tracked files, branch, remote, and licence
- [x] Read and classify the master build brief
- [x] Verify current official Supabase SSR direction
- [x] Verify current official Cloudflare Next.js/OpenNext Workers direction and record the no-Wrangler incompatibility
- [x] Define V1 scope, exclusions, assumptions, risks, and acceptance criteria
- [x] Define runtime, security, service, API, testing, and deployment architecture
- [x] Define entities, relationships, constraints, indexes, deletion rules, and RLS intent
- [x] Document dashboard-based Git deployment and local setup expectations
- [x] Create the initial README
- [ ] Review and merge the Phase 0 pull request

## Phase 1 — Project foundation

- [x] Initialise a current stable Next.js App Router project with TypeScript and `src/`
- [x] Configure package manager version, Node version, scripts, and lockfile
- [x] Configure Tailwind CSS and compact application design tokens
- [x] Add accessible lightweight component primitives and Lucide icons
- [x] Add ESLint, formatting, strict TypeScript, and import boundaries
- [x] Add `.gitignore`, `.env.example`, and runtime environment validation
- [x] Confirm the dependency tree contains no Wrangler package and add no Wrangler/OpenNext configuration
- [x] Add browser and server Supabase SSR client factories
- [x] Add session-refresh proxy using the current supported Supabase pattern
- [x] Implement verified identity helper and protected route group
- [x] Create initial enums, `profiles` migration, profile trigger, and indexes
- [x] Enable RLS and add profile read/update/bootstrap policies
- [x] Implement email/password login, logout, unauthorised, and inactive-user states
- [x] Implement server-side role lookup and reusable permission guards
- [x] Build responsive app shell, sidebar, header, mobile drawer, and user menu
- [x] Apply role-aware navigation without treating UI visibility as authorisation
- [x] Add PageHeader, StatCard, StatusBadge, EmptyState, and ConfirmDialog primitives
- [x] Add global loading/error/not-found boundaries
- [x] Unit-test permission and environment helpers
- [ ] Integration-test protected route and inactive profile behaviour
- [x] Run lint, typecheck, unit tests, and the standard Next.js production build
- [ ] Update documentation and check Phase 1 acceptance criteria

## Phase 2 — CRM foundation

- [ ] Create migrations for goals, playbooks, playbook task templates, companies, contacts, and contact channels
- [ ] Add constraints, indexes, updated-at triggers, and RLS for each table
- [ ] Generate/maintain database TypeScript types
- [ ] Define Zod create/update/filter schemas and DTOs
- [ ] Implement goal, playbook, company, contact, and channel services
- [ ] Implement authorised Server Actions for supported mutations
- [ ] Build goals list/create/edit/detail shell
- [ ] Build playbooks list/create/edit and ordered task-template editor
- [ ] Build companies list/create/edit/detail shell
- [ ] Build contacts list/create/edit/detail shell and contact-channel editor
- [ ] Add deterministic company-domain and contact email/LinkedIn duplicate validation
- [ ] Build reusable DataTable, FilterBar, EntityHeader, and form primitives
- [ ] Add accessible empty, loading, validation, and error states
- [ ] Add unit tests for normalisation and validation
- [ ] Add integration/RLS tests for all three roles
- [ ] Run phase quality gates and update documentation

## Phase 3 — Workflow engine

- [ ] Create goal-prospect and task migrations, enums, constraints, indexes, and RLS
- [ ] Implement context-first prospect transition validation
- [ ] Implement transactional/idempotent playbook task generation
- [ ] Preserve template snapshots, ordering, review flags, assignee, and calculated due dates
- [ ] Define task state machine and sequence-actionability rules
- [ ] Enforce reviewer separation and role checks in database and services
- [ ] Implement prospect add/assign/update services and screens
- [ ] Implement task list/detail/update/assignment services and screens
- [ ] Build My Work sections and deterministic priority ordering
- [ ] Add task filters and role-scoped queries
- [ ] Implement follow-up task creation from supported parent contexts
- [ ] Unit-test transitions, context rule, task generation, and follow-up creation
- [ ] Integration-test concurrent/retried generation and unauthorised transitions
- [ ] Run phase quality gates and update documentation

## Phase 4 — Context and history

- [ ] Create research, activity, and note migrations, constraints, indexes, and RLS
- [ ] Model structured source entries and uncertainty-safe research validation
- [ ] Implement research draft CRUD and submit service
- [ ] Implement append-only activity creation/query service
- [ ] Emit activities for completed workflow events
- [ ] Implement note services and entity note panels
- [ ] Build ActivityTimeline and reverse chronological company/contact histories
- [ ] Build globally accessible QuickLogDialog
- [ ] Make Quick Log activity plus optional follow-up atomic
- [ ] Complete company/contact overview tabs, next action, and last activity
- [ ] Add unit, integration, RLS, and accessibility tests
- [ ] Run phase quality gates and update documentation

## Phase 5 — Approval workflow

- [ ] Create outreach-draft migration, constraints, indexes, and RLS
- [ ] Implement research submit/approve/request-changes transitions
- [ ] Implement outreach create/submit/approve/request-changes transitions
- [ ] Require reviewer comment for changes requested
- [ ] Prevent self-approval in both services and database operations
- [ ] Implement review queue queries and Research/Outreach/Resubmission tabs
- [ ] Build ReviewCard and review detail actions
- [ ] Unlock or create the correct next task after approval
- [ ] Implement manual Mark Sent with activity and prospect/task transitions
- [ ] Offer optional follow-up after Mark Sent without external communication
- [ ] Test full change-request/resubmission path and forbidden transitions
- [ ] Run phase quality gates and update documentation

## Phase 6 — Management and opportunities

- [ ] Create opportunity migration, constraints, indexes, and RLS
- [ ] Implement opportunity services and screens
- [ ] Define canonical goal funnel and team activity metric queries
- [ ] Build manager KPI cards, review queue summary, goal progress, team activity, and bottlenecks
- [ ] Build rep dashboard focused on actionable work
- [ ] Build GoalProgress and TaskList primitives
- [ ] Complete goal detail metrics and tabs
- [ ] Add conversation, call-booked, and opportunity workflow actions
- [ ] Reconcile dashboard metrics against source records in tests
- [ ] Run phase quality gates and update documentation

## Phase 7 — Operational tools

- [ ] Add RLS-respecting global search queries for companies, contacts, goals, tasks, and opportunities
- [ ] Build global search UI with keyboard and empty states
- [ ] Define CSV size/row limits and supported company/contact fields
- [ ] Implement safe CSV parsing and column mapping
- [ ] Validate rows and render preview without database writes
- [ ] Detect deterministic matches and likely duplicate hints
- [ ] Add optional goal and assignee mapping
- [ ] Require explicit confirmation before import
- [ ] Import valid rows transactionally in bounded batches and report per-row failures
- [ ] Never auto-merge uncertain duplicates
- [ ] Add parsing, validation, duplicate, RLS, and resource-limit tests
- [ ] Run phase quality gates and update documentation

## Phase 8 — MCP readiness

- [ ] Audit UI mutations to ensure all rules live in reusable server services
- [ ] Define authenticated query/command DTOs and stable error codes
- [ ] Add narrow Route Handlers for approved future MCP operations
- [ ] Add request size limits, structured logs, and correlation IDs
- [ ] Ensure API clients operate as the caller and remain RLS constrained
- [ ] Document API routes, permissions, inputs, outputs, and errors
- [ ] Test UI/API behavioural parity and unauthorised access
- [ ] Confirm no AI dependency or unrestricted raw CRUD exists
- [ ] Run phase quality gates and update documentation

## Phase 9 — Production readiness

- [ ] Create repeatable fake business-data seed and cleanup process
- [ ] Document Auth user creation and admin bootstrap separately from business seed
- [ ] Complete critical unit and Supabase integration suites
- [ ] Implement Playwright critical acceptance scenario
- [ ] Test keyboard navigation, focus management, labels, contrast, and reduced motion
- [ ] Test desktop and mobile layouts for critical screens
- [ ] Audit loading, empty, validation, unauthorised, conflict, and server-error states
- [ ] Review every table's SELECT/INSERT/UPDATE/DELETE RLS policies
- [ ] Test direct Supabase access as admin, manager, rep, inactive user, and anonymous user
- [ ] Verify no secret/service-role key is exposed or committed
- [ ] Run dependency and Cloudflare runtime compatibility review
- [ ] Configure CI for lint, typecheck, unit, integration, build, and E2E tiers
- [ ] Recheck official Cloudflare support for a genuinely Wrangler-free full-stack Next.js Git deployment
- [ ] Validate Git-connected Cloudflare preview only if the no-Wrangler gate is satisfied
- [ ] If still blocked, document the exact incompatibility and obtain an explicit platform/constraint decision
- [ ] Validate Supabase Auth callbacks and cookies in preview
- [ ] Execute the complete 34-step acceptance scenario
- [ ] Add README screenshots and final setup/status details
- [ ] Run final cleanup and all quality gates

## Deferred beyond V1

- [ ] Multi-workspace tenancy and organisation membership
- [ ] Permanent attachment storage with private bucket policies
- [ ] Business-day calendars and regional holidays
- [ ] External MCP server packaging after the internal API stabilises
- [ ] Optional integrations only after explicit product approval
