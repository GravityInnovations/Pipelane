# Gravity Outreach OS — Data Model

## Conventions

- PostgreSQL/Supabase is authoritative. Tables live in `public`; Auth users live in `auth.users`.
- Primary keys are UUIDs generated with `gen_random_uuid()` except `profiles.id`, which equals the Auth user ID.
- Event timestamps use `timestamptz` in UTC with `now()` defaults. Due/target days use `date`.
- Mutable tables have `created_at` and `updated_at`; an update trigger maintains `updated_at`.
- Human-visible text has deliberate length/check constraints; free-form notes remain `text`.
- Enums begin as Postgres enum types because values drive constraints and RLS-aware workflows. Removing values requires a migration.
- Foreign keys are indexed when used for joins, policy checks, or queues.
- Business history is normally archived/statused, not hard-deleted.

## Relationship overview

```text
auth.users 1---1 profiles
profiles 1---* goals / companies / contacts / tasks / activities / opportunities
playbooks 1---* playbook_task_templates
playbooks 1---* goals
goals 1---* goal_prospects *---1 companies
companies 1---* contacts 1---* contact_channels
goal_prospects *---0..1 contacts
goal_prospects 1---* tasks / research / outreach_drafts / activities
research 1---* outreach_drafts
companies / contacts / goals 1---* activities / notes
companies 1---* opportunities *---1 contacts
```

## Enum catalogue

The initial enums are:

- `app_role`: `admin`, `sales_manager`, `sales_rep`
- `record_priority`: `low`, `normal`, `high`, `critical`
- `goal_status`: `draft`, `active`, `paused`, `completed`, `archived`
- `company_status`: `active_prospect`, `customer`, `partner`, `past_customer`, `not_relevant`, `archived`
- `relationship_status`: `unknown`, `identified`, `contacted`, `connected`, `replied`, `conversation`, `warm`, `opportunity`, `customer`, `partner`, `no_response`, `not_interested`, `do_not_contact`
- `channel_type`: `email`, `linkedin`, `whatsapp`, `phone`, `website_form`, `instagram`, `facebook`, `x`, `other`
- `prospect_status`: values specified in the product brief from `new` through `disqualified`
- `qualification_status`: `unknown`, `qualified`, `maybe`, `disqualified`
- `task_status`: `not_started`, `in_progress`, `ready_for_review`, `changes_requested`, `approved`, `completed`, `blocked`, `cancelled`
- `task_type`: the complete task-type catalogue in the product brief
- `research_status`: `draft`, `ready_for_review`, `changes_requested`, `approved`
- `outreach_type`: the complete outreach-type catalogue in the product brief
- `outreach_status`: `draft`, `ready_for_review`, `changes_requested`, `approved`, `sent`, `cancelled`
- `activity_type`: the complete activity catalogue in the product brief
- `opportunity_status`: `identified`, `discovery`, `call_booked`, `qualified`, `proposal`, `negotiation`, `won`, `lost`, `nurture`

## Tables

### `profiles`

Columns: `id uuid` PK/FK `auth.users(id)` ON DELETE CASCADE; `full_name text` required; `role app_role` required default `sales_rep`; `active boolean` required default true; optional `job_title text`, `avatar_url text`; timestamps.

Indexes: `(role, active)` for team/admin lists.

Rules: a trigger may create a safe default profile for new Auth users. Only admins can alter `role` or `active`; users can update permitted personal fields. The first admin is bootstrapped with an audited SQL/dashboard procedure, not public sign-up metadata.

### `playbooks`

Columns: UUID PK; required `name`; optional `description`, `target_customer_profile`, `preferred_contact_roles`, `research_instructions`, `qualification_criteria`, `disqualification_criteria`, `outreach_angles`, `tone_guidance`, `things_to_avoid`, `initial_outreach_guidance`, `followup_guidance`, `notes`; `active boolean` default true; timestamps.

Constraints/indexes: case-insensitive unique active-name strategy (normalised expression/partial index); `(active, name)`.

Delete: restrict when referenced; deactivate instead. Admin/manager write, relevant rep read.

### `playbook_task_templates`

Columns: UUID PK; `playbook_id` FK ON DELETE CASCADE; `sequence_number integer > 0`; required `title`; optional `description`; `task_type`; optional `default_assignee_role`; `requires_review boolean`; `default_due_offset_days integer >= 0`; `active boolean`; timestamps.

Constraints/indexes: unique `(playbook_id, sequence_number)`; index `(playbook_id, active, sequence_number)`.

Delete: cascade only while deleting an unreferenced playbook. Generated tasks contain snapshots and are not linked for behaviour.

### `goals`

Columns: UUID PK; required `name`; optional `description`; `status`; `owner_user_id` FK profiles RESTRICT; optional `playbook_id` FK playbooks SET NULL; optional `start_date`, `target_end_date`; `priority`; non-negative target columns for companies, contacts, outreach attempts, replies, conversations, calls, opportunities; optional `notes`; timestamps.

Constraints/indexes: end date not before start date; `(status, owner_user_id)`, `(owner_user_id, target_end_date)`.

Delete: restrict once referenced; archive for history. Admin/manager write; reps read relevant active/assigned goals.

### `companies`

Columns: UUID PK; required `name`; optional `website`, `normalized_domain`, `linkedin_url`, `industry`, `sub_industry`, `country`, `region`, `city`, `company_size`, `description`, `source`, `general_notes`; `primary_owner_user_id` FK profiles SET NULL; `status`; `created_by` FK profiles RESTRICT; timestamps.

Constraints/indexes: lower-case domain format check; partial unique index on `normalized_domain` when non-null and not archived; trigram/normalised-name index for duplicate hints; `(primary_owner_user_id, status)`.

Delete: restrict if referenced; archive/not-relevant for ordinary lifecycle.

### `contacts`

Columns: UUID PK; `company_id` FK companies RESTRICT; optional `first_name`, `last_name`; required `full_name`; optional `job_title`, `department`, `seniority`, `linkedin_url`, `primary_email`, `secondary_email`, `phone`, `whatsapp`, `country`, `city`, `source`, `notes`; `assigned_to_user_id` FK profiles SET NULL; `relationship_status`; `created_by` FK profiles RESTRICT; timestamps.

Constraints/indexes: at least a non-blank full name; partial unique normalised email and LinkedIn URL indexes when present; `(company_id, full_name)`, `(assigned_to_user_id, relationship_status)`.

Delete: restrict if referenced. `do_not_contact` is durable and prominently enforced by outreach workflows.

### `contact_channels`

Columns: UUID PK; `contact_id` FK contacts CASCADE; `channel_type`; required `value`; optional `source`, `source_url`, `notes`; `verified boolean` default false; `preferred boolean` default false; timestamps.

Constraints/indexes: unique normalised `(contact_id, channel_type, value)`; at most one preferred channel per contact/type via partial unique index; `(contact_id, preferred)`.

Delete: cascade with an otherwise-unreferenced contact. Write follows contact visibility.

### `goal_prospects`

Columns: UUID PK; `goal_id` FK goals RESTRICT; `company_id` FK companies RESTRICT; nullable `contact_id` FK contacts RESTRICT; `assigned_to_user_id` FK profiles RESTRICT; `prospect_status`; `qualification_status`; `priority`; optional `outreach_angle`, required-for-readiness `reason_for_outreach`; `entered_at` default now; optional `completed_at`; optional `notes`; timestamps.

Constraints/indexes: contact, if present, must belong to company (enforced by composite FK/trigger); partial unique indexes distinguish company-level `(goal_id, company_id) WHERE contact_id IS NULL` and contact-level `(goal_id, company_id, contact_id) WHERE contact_id IS NOT NULL`; queue indexes `(assigned_to_user_id, prospect_status, priority)` and `(goal_id, prospect_status)`.

Rules: transition function enforces context-first readiness and later states. Delete restricted after workflow records exist; use disqualified/lost/nurture.

### `tasks`

Columns: UUID PK; required `title`; optional `description`; `task_type`; nullable FKs `goal_id`, `goal_prospect_id`, `company_id`, `contact_id` (RESTRICT/SET NULL according to retained history); `assigned_to_user_id` and `created_by_user_id` FKs profiles RESTRICT; nullable `reviewer_user_id` FK profiles SET NULL; optional `sequence_number`; `priority`; `status`; nullable `due_date`, `started_at`, `completed_at`; `requires_review`; optional `blocked_reason`, `outcome`; optional snapshot fields `source_template_id`, `generation_key`; timestamps.

Constraints/indexes: at least one business context for generated workflow tasks; sequence positive; blocked status requires reason; completed status requires completed time; unique generation key per prospect/template; queue index `(assigned_to_user_id, status, due_date, priority)`; review index `(reviewer_user_id, status, updated_at)`; context indexes.

Rules: status changes go through an explicit transition command. Reviewer cannot equal assignee/submitting actor for required review. Hard delete is restricted; cancel instead.

### `research`

Columns: UUID PK; `goal_id` and `company_id` required FKs RESTRICT; nullable `goal_prospect_id`, `contact_id`, `task_id`; `created_by_user_id` FK profiles RESTRICT; `research_status`; optional structured text fields from the brief; `sources jsonb` default `[]`; nullable `reviewer_user_id`, `review_comment`, `approved_at`; timestamps.

Constraints/indexes: `sources` is an array of objects such as `{url,title,accessedAt,note}`; approval requires reviewer and approved timestamp; changes requested requires reviewer comment; indexes `(goal_prospect_id, updated_at)`, `(research_status, updated_at)`, `(reviewer_user_id, research_status)`.

Rules: text explicitly permits uncertainty labels. Author cannot approve own submission. Delete draft only; reviewed records retained/cancelled by policy.

### `outreach_drafts`

Columns: UUID PK; required FKs `goal_id`, `goal_prospect_id`, `company_id`, `contact_id`, `created_by_user_id`; nullable `research_id`, `task_id`; `outreach_type`; optional `subject`; required `body`, `outreach_angle`; `status`; nullable `reviewer_user_id`, `review_comment`, `approved_at`, `sent_at`; timestamps.

Constraints/indexes: sent requires prior approval data and `sent_at`; changes requested requires comment; context consistency validated; `(status, updated_at)`, `(goal_prospect_id, created_at)`, `(reviewer_user_id, status)`.

Rules: records content only. Mark Sent is a transactional manual confirmation, never a delivery action. Retain reviewed/sent drafts.

### `activities`

Columns: UUID PK; nullable context FKs `goal_id`, `goal_prospect_id`, `company_id`, `contact_id`, `task_id`; `created_by_user_id` FK profiles RESTRICT; `activity_type`; optional `channel`; required `subject`; optional `description`; `activity_date timestamptz` default now; optional `outcome`; `metadata jsonb` default `{}`; `created_at`.

Constraints/indexes: at least one context FK; indexes `(contact_id, activity_date DESC)`, `(company_id, activity_date DESC)`, `(goal_id, activity_date DESC)`, `(created_by_user_id, activity_date DESC)`, and `(activity_type, activity_date DESC)`.

Rules: append-only to ordinary users. Corrections create a follow-up note/activity; admin-only deletion is exceptional and audited.

### `notes`

Columns: UUID PK; `entity_type` constrained to supported types; `entity_id uuid`; `created_by_user_id` FK profiles RESTRICT; required non-blank `body`; timestamps.

Indexes: `(entity_type, entity_id, created_at DESC)`.

Rules: because a polymorphic FK cannot enforce parent existence, services validate the parent and RLS policies use entity-specific branches. If policies become unwieldy, replace with typed note join tables before implementation rather than weakening RLS.

### `opportunities`

Columns: UUID PK; `company_id` FK companies RESTRICT; `primary_contact_id` FK contacts RESTRICT; `goal_id` FK goals RESTRICT; required `name`; `owner_user_id` FK profiles RESTRICT; `status`; nullable `estimated_value numeric(14,2)`, `currency char(3)`, `next_step`, `next_step_date`, `notes`; timestamps.

Constraints/indexes: value non-negative; value and currency supplied together; primary contact belongs to company; `(owner_user_id, status, next_step_date)`, `(goal_id, status)`, `(company_id, status)`.

Delete: restrict after creation; won/lost/nurture represent lifecycle.

### `import_jobs` and `import_rows`

These operational tables are added in Phase 7 if request-only preview cannot meet reliability limits.

`import_jobs`: actor, entity type, status, original filename (not path), mapping JSON, counts, optional goal/assignee, timestamps. `import_rows`: job FK CASCADE, row number, sanitised parsed data JSON, validation/duplicate result JSON, status, created entity ID, safe error code.

CSV contents are short-lived and subject to a retention cleanup. No real data appears in seeds or logs.

## Delete behaviour summary

| Parent | Default behaviour |
| --- | --- |
| Auth user -> profile | Cascade only when Auth user is deliberately removed; referenced business rows otherwise restrict that removal |
| Playbook -> templates | Cascade templates, but restrict playbook if goals reference it |
| Company/contact/goal/prospect | Restrict when history exists; use lifecycle status |
| Contact -> channels | Cascade only with safe contact deletion |
| Draft workflow records | Draft-only deletion; retain submitted/approved/sent history |
| Activity | Append-only; exceptional admin correction only |
| Import job -> rows | Cascade after retention period |

## RLS policy matrix

All application tables enable and force RLS where compatible. Helper functions such as `current_app_role()` and `is_active_user()` derive identity from `auth.uid()` and are hardened.

| Table group | Admin | Manager | Rep |
| --- | --- | --- | --- |
| Profiles | all CRUD subject to last-admin safeguards | read active team; update own safe fields | read own/necessary assignee display; update own safe fields |
| Goals/playbooks/templates | full | read/write | read relevant; no strategic writes |
| Companies/contacts/channels | full | full | read/write assigned or permitted onboarding scope |
| Goal prospects/tasks | full | full/assign/review | read/update assigned scope; no approval/self-review |
| Research/outreach | full | full/review | create/read/update own or assigned; submit but not approve |
| Activities/notes | full | read/create/update notes | read/create in visible context; no activity mutation |
| Opportunities | full | full | read/update owned/assigned scope; creation only from visible context |
| Imports | full | own/team as configured | own jobs and permitted target records |

Each migration must document SELECT, INSERT, UPDATE, and DELETE policies explicitly. Policy tests use separate users for admin, manager, rep A, rep B, inactive, and anonymous.

## Derived data and metrics

Dashboard counts are computed from canonical records, not stored counters in V1. Database views or parameterised functions may provide role-safe read models for:

- goal funnel counts by prospect status;
- overdue/due-today/approved-to-send task queues;
- review queue counts;
- team activity grouped by actor and type;
- conversations, calls, and opportunities by date/goal.

If performance later requires materialisation, refresh semantics and reconciliation tests must be documented first.

## Migration order

1. Extensions, enums, timestamp/auth helper functions, and profiles.
2. Playbooks/templates and goals.
3. Companies, contacts, and channels.
4. Goal prospects and tasks.
5. Research, outreach drafts, activities, and notes.
6. Opportunities.
7. Search/import support.
8. Seed data and read-model functions.

Migrations are forward-only in shared environments, idempotent only where Supabase tooling expects it, and paired with generated TypeScript database types.
