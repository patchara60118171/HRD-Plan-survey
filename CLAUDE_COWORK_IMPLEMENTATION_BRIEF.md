# Claude Cowork Implementation Brief

## Objective
Implement the next architecture phase of the Well-being Survey system without breaking current production behavior.

This project currently has working static-entry pages and an existing Supabase-backed system. The goal is not a full rewrite in one shot. The goal is to evolve the system into a clearer multi-role, multi-organization platform with safer structure, better authorization boundaries, better data management, and admin-managed form configuration.

Primary outcomes:
- Keep current public Well-being survey working.
- Keep current CH1 flow working.
- Keep current admin portal working while refactoring toward modular structure.
- Introduce explicit role model: `super_admin`, `admin`, `org_hr`.
- Support 15 real organizations plus 1 dedicated test organization.
- Keep Well-being survey per-organization via unique links, not org selection inside the form.
- Support CH1 as one submission per organization for the single 2569 reporting round.
- Support reopen/edit flows under configured time windows.
- Allow `admin` to edit question text/labels only.
- Reserve add/remove/change-question-type capability for `super_admin`.

---

## Non-Negotiable Business Rules

### Roles
#### `super_admin`
- Full system control.
- Can see all organizations.
- Can manage all system settings.
- Can manage permissions of `admin` users.
- Can override all cases.
- Can add/remove/change question types and form structure.

#### `admin`
- Can see all organizations.
- Can manage `admin` and `org_hr` accounts.
- Can create accounts.
- Can reset passwords.
- Can manage open/close windows for each form.
- Can view aggregate dashboards, logs, reminders, and settings.
- Can edit question wording/labels only.
- Can edit CH1 on behalf of organizations.
- Cannot change deep form structure unless explicitly elevated by `super_admin`.

#### `org_hr`
- One account per organization.
- Can access only their own organization scope.
- Can fill/edit CH1 for their own organization.
- Can reopen within allowed time windows.
- Can view dashboards for their own organization.
- Can view individual raw Well-being responses and summaries for their own organization only.
- Cannot manage global settings.

### CH1 Rules
- CH1 is filled primarily by `org_hr`.
- `admin` can edit on behalf of organizations.
- Reopen is allowed to all roles, but only within configured windows.
- Only one CH1 submission exists per organization per cycle.
- Further edits should update the same logical submission record for that organization-cycle pair.

### Well-being Rules
- Respondents are general personnel.
- No login is required for respondents.
- Organization is assigned through per-organization links, not through a select box in the public form.
- `org_hr` can see all raw records and summaries for their own organization.
- `admin` and `super_admin` can see all records.
- Well-being raw data must be exportable.

### Form Editing Rules
#### `admin`
Can:
- Edit question text.
- Edit display labels.
- Adjust wording for clarity/correction.

Cannot:
- Add new questions.
- Remove questions.
- Change question type.
- Restructure forms deeply.

#### `super_admin`
Can:
- Add questions.
- Remove questions.
- Change question types.
- Perform structure-level form changes.

### Test Organization
- Create one dedicated test organization.
- Test data must be clearly separable from production organizations.
- Test organization must support both CH1 and Well-being flows.
- Dashboards and exports should be able to filter out test data when needed.

---

## Important Clarification About CH1 Round
For this phase, CH1 does **not** need a multi-cycle architecture.

Business decision from the product owner:
- There is only one reporting round for CH1 in this project scope.
- That round is the 2569 collection round.
- Each organization submits CH1 once for this round.
- Reopen/edit updates the same logical submission.

Implementation guidance:
- You may still name the round internally if needed, but do not over-engineer a general cycle management system yet.
- A simple fixed value such as `round_2569` or equivalent metadata is acceptable for now.
- Prioritize correctness and simplicity over future-proof abstraction.

---

## Security and Password Handling
The user wants passwords that are easy to remember, word + numbers style.

Use this policy:
- Admin can create a user.
- System generates a temporary easy-to-read password, e.g. `Nida2026HR`, `Org15Start`, `HappyWork15`.
- Show temp password once at creation/reset time.
- Store only password hashes through Supabase Auth, not reversible passwords, unless an unavoidable legacy integration explicitly forces a different path.
- Admin can reset password and issue a new temporary password.
- If the legacy UI currently implies “view password”, prefer to interpret that as “issue/reset temporary password”, not “retrieve existing password”.
- Easy-to-remember passwords are allowed by product direction, but still avoid plaintext password storage wherever possible.

---

## Current System Context
Known current runtime shape:
- `index.html`: public Well-being survey.
- `ch1.html`: CH1 survey form.
- `admin.html`: main admin portal.
- `js/supabase-config.js`: Supabase connection config.
- Existing per-organization link management is already present in admin UI.
- Vercel is used for deployment.
- Supabase is the backend.

Do not rewrite the whole system. Refactor incrementally.

---

## Required Deliverables

### 1. Requirement/architecture docs
Create or update docs that clearly explain:
- roles and permissions
- data scope per role
- CH1 lifecycle
- Well-being link model
- test organization strategy
- form editor scope rules
- cycle concept

Suggested files:
- `SYSTEM_PLAN.md`
- `ROLE_PERMISSION_MATRIX.md`
- `DATA_SCOPE_AND_ACCESS_RULES.md`
- `CH1_LIFECYCLE.md`

If some of these already exist under a different name, update rather than duplicate unnecessarily.

### 2. Database design and migrations
Design and implement required Supabase schema changes with migrations.

### 3. Admin portal changes
Implement safely and incrementally.

### 4. Access control and organization scoping
Ensure UI and data access are role-aware and org-scoped.

### 5. Test organization support
Seed or create one test organization.

### 6. Export and reporting behavior
Ensure raw data export is available where required.

---

## Recommended Target Data Model
This is a proposal. Adjust carefully to fit current schema, but preserve the business rules exactly.

### Organizations
Table: `organizations`
Recommended fields:
- `id`
- `org_code` unique
- `org_name_th`
- `org_name_en` nullable
- `is_test` boolean default false
- `is_active` boolean default true
- `created_at`
- `updated_at`

Add one test organization, for example:
- `org_code = 'test-org'`
- `org_name_th = 'องค์กรทดสอบระบบ'`
- `is_test = true`

### User Profiles / Roles
If using Supabase Auth users + profile table, define a profile table such as `user_profiles`.
Recommended fields:
- `id` references auth user id
- `email`
- `role` check in (`super_admin`, `admin`, `org_hr`)
- `org_code` nullable for global roles, required for `org_hr`
- `display_name`
- `is_active`
- `created_by`
- `created_at`
- `updated_at`

Rules:
- `org_hr` must have exactly one organization.
- `super_admin` and `admin` may have `org_code = null`.
- Enforce one active `org_hr` account per organization if product owner really wants strict 1:1. If this is too rigid operationally, support soft replacement by deactivating old account before creating new one.

### CH1 Round Metadata
Only introduce a dedicated round/config table if it genuinely helps current implementation.

Because the current business rule is a single CH1 round for year 2569, simpler approaches are acceptable:
- store a fixed round value on CH1 records, such as `round_2569`
- or keep a very small config table only for the current round window

Do not build a large generalized multi-cycle subsystem unless needed by existing code or deployment constraints.

### Form Registry
If not already present or if current `survey_forms` is incomplete, extend it.
Table: `survey_forms`
Recommended fields:
- `id`
- `form_code` unique, e.g. `wellbeing`, `ch1`
- `form_name`
- `description`
- `is_active`
- `allow_label_edit_by_admin` boolean default true
- `allow_structure_edit_by_admin` boolean default false
- `created_at`
- `updated_at`

### Form Windows
Table: `form_windows`
Recommended fields:
- `id`
- `form_code`
- `round_code`
- `org_code` nullable if global, set if org-specific override is needed later
- `opens_at`
- `closes_at`
- `edit_until`
- `is_active`
- `created_at`
- `updated_at`

Logic:
- Reopen is only allowed while current time is within configured allowed edit window.

### CH1 Submission State
If current CH1 data is stored directly in `hrd_ch1_responses`, preserve compatibility, but introduce a clear lifecycle model.
Possible approach:
- Either add lifecycle columns to existing table, or
- Create a companion state table if current schema is too messy.

Recommended fields for CH1 state if added to main CH1 response table:
- `org_code`
- `round_code`
- `status` in (`draft`, `submitted`, `reopened`, `locked`)
- `last_saved_at`
- `submitted_at`
- `reopened_at`
- `locked_at`
- `updated_by`

Constraint:
- Unique on (`org_code`, `round_code`) or equivalent single-round identifier

### Well-being Link Mapping
If current URL management already uses a mapping table, keep/extend it.
Suggested table if needed: `org_form_links`
Recommended fields:
- `id`
- `org_code`
- `form_code`
- `slug` or token
- `public_url`
- `is_active`
- `created_at`

Public flow:
- A respondent visits the organization-specific Well-being URL.
- The URL implicitly maps response to `org_code`.
- No manual org selection in the form.

### Form Editor Metadata
If form labels are becoming editable, do not hardcode this only in HTML long term.
Introduce form metadata tables or JSON-backed definitions.

Suggested minimum viable model:
- `form_question_overrides`
  - `id`
  - `form_code`
  - `question_key`
  - `label_text`
  - `help_text` nullable
  - `updated_by`
  - `updated_at`

Rules:
- `admin` can update overrides only.
- `super_admin` can modify underlying structure definitions.

This preserves existing submitted data keys while allowing wording changes.

---

## Access Control Requirements
Implement both UI-level and database-level control where possible.

### UI Rules
- Hide global admin features from `org_hr`.
- Hide organization switching for `org_hr`.
- Show only org-specific dashboards, tables, links, and exports for `org_hr`.
- Show full cross-org dashboards for `admin` and `super_admin`.
- Show structure-edit actions only to `super_admin`.
- Show label-edit actions to `admin` and `super_admin`.

### Database / RLS Rules
Use Supabase Row Level Security where feasible.

#### `org_hr`
- Can only read rows where `org_code` matches their profile org.
- Can only update CH1 rows for their own org.
- Can only read Well-being raw rows for their own org.

#### `admin`
- Can read all org rows.
- Can update CH1 rows for all orgs.
- Can manage label overrides.
- Can manage user profile rows allowed for admin scope.

#### `super_admin`
- Full access.

If direct admin-wide RLS is hard to express cleanly, use secure RPCs / Edge Functions for sensitive operations.

---

## Required Admin Features

### User Management
Implement or refine:
- create user
- deactivate/reactivate user
- assign role
- assign org for `org_hr`
- reset password
- optionally issue temporary password

Guardrails:
- One active `org_hr` account per org.
- `org_hr` must always have an `org_code`.
- Prevent accidental deletion of the last `super_admin`.

### Form Window Management
Admin UI must support:
- setting open date/time
- setting close date/time
- setting edit-until date/time
- toggling active/inactive state
- viewing current status by form and cycle

### Reopen Behavior
Reopen should mean:
- user can revisit and edit the existing organization-round submission
- files can be reviewed and corrected
- incomplete forms can be completed
- reopening does not create a new logical submission for that org-round

### Raw Data Export
For Well-being:
- `org_hr` can export raw data for own org only
- `admin` and `super_admin` can export across orgs
- support CSV and/or Excel
- exports should preserve all survey questions as columns when possible

### Dashboard Scope
#### `org_hr`
Show only:
- own org submission status
- own org response counts
- own org raw records
- own org summary analytics

#### `admin` / `super_admin`
Show:
- all organizations
- completion status across organizations
- timeline/progress overview
- comparative analytics
- test org filtered separately when needed

---

## Recommended Project Structure And Refactor Strategy
Do not break current routes.

Current routes should keep working:
- `/` or public survey route
- `/ch1`
- `/admin`

Recommended target structure:
```text
apps/
  public-survey/
  ch1-survey/
  admin-portal/

shared/
  config/
  ui/
  utils/
  types/

backend/
  supabase/
  database/

scripts/
  dev/
  ops/
  audit/
```

Interpretation:
- `apps/public-survey/` = current public Well-being survey runtime and related assets
- `apps/ch1-survey/` = current CH1 runtime and related assets
- `apps/admin-portal/` = current admin runtime and related assets
- `shared/` = reusable config, helpers, shared UI, common constants, and cross-app utilities
- `backend/` = Supabase-related schema, migrations, SQL, functions, policies, and backend documentation
- `scripts/` = development scripts, operational scripts, audits, one-off maintenance tools

Important migration rule:
- This structure is the target architecture.
- Do not attempt a full one-shot move immediately.
- Migrate incrementally while keeping current entry routes working.
- It is acceptable to keep current root HTML entry points temporarily and move code/assets behind them in phases.

Near-term refactor tasks:
1. Keep `admin.html` as runtime entry for now.
2. Continue extracting inline assets into dedicated files.
3. Begin aligning code locations with the target structure above.
4. Separate admin logic into modules:
   - auth service
   - organization service
   - forms service
   - user management service
   - dashboard service
   - export service
5. Avoid large rewrites in a single commit.
6. Preserve current behavior while moving logic gradually.

---

## Supabase Work Expected
Claude cowork can use connected MCP systems. Use them to inspect and implement carefully.

Expected Supabase tasks:
- inspect current schema
- inspect current policies
- inspect current auth/profile strategy
- create migrations for missing tables/columns/indexes
- create or update RLS policies
- create seed data for the test organization
- create seed/admin workflow for initial user setup
- verify existing data compatibility before destructive changes

Do not drop or rewrite existing production data without a migration plan.

---

## Vercel / Deployment Tasks
- Preserve current rewrites and working entry points.
- Ensure any new static asset paths are deploy-safe.
- Do not rename routes in a way that breaks current public links.
- Validate `vercel.json` after changes.
- If environment variables are needed, document them clearly.

---

## Google Sheets / Apps Script / Drive Integration
Because the owner has connected multiple MCP systems, inspect current integrations before adding more.

Possible tasks if required by existing business flow:
- export or sync summary data to Google Sheets
- archive exports or attachments to Drive
- trigger reminders or scheduled reporting via Apps Script

Do not invent new external sync flows unless they are clearly required. First audit what already exists and document it.

---

## Form Editor Scope Implementation Guidance
This is important. The product owner wants Google-Forms-like editing, but only partially for `admin`.

Recommended implementation phases:

### Phase 1
- Add editable question labels/help text through metadata overrides.
- Keep underlying field keys unchanged.
- Ensure old submissions remain compatible.

### Phase 2
- Add `super_admin`-only structure editor for advanced changes.
- Structure changes must be guarded carefully and documented.

Do not start with a fully dynamic form builder if current project is still heavily static. Start with label override metadata.

---

## Test Organization Requirements
Implement one dedicated test organization end-to-end:
- visible in admin organization management
- generates its own public Well-being link
- has its own CH1 scope
- can have an `org_hr` account
- can be clearly filtered as test data
- should not be mixed into official analytics by default unless explicitly included

Suggested defaults:
- org code: `test-org`
- org name: `องค์กรทดสอบระบบ`

---

## Acceptance Criteria
The work is successful only if all of the following are true:

### Authorization / Roles
- `super_admin`, `admin`, and `org_hr` are explicit and enforced.
- `org_hr` cannot see other organizations.
- `admin` can manage `admin` and `org_hr` accounts.
- `super_admin` can perform higher-risk form structure changes.

### CH1
- One organization has one CH1 submission for the single 2569 round in scope.
- CH1 can be drafted, submitted, reopened, and locked.
- `admin` can edit on behalf of org.
- Reopen updates the same logical submission.

### Well-being
- Public respondents can answer without login.
- Organization is assigned by unique link.
- `org_hr` can see raw and summary data for own org.
- Raw export works.

### Admin Portal
- Existing route remains operational.
- Modularization does not break current workflows.
- Windows/timeline management works.
- User management works.
- Dashboard scoping works.

### Test Org
- A dedicated test org exists and is distinguishable.

---

## Recommended Execution Order
1. Audit current schema, auth model, and current admin behavior.
2. Produce/update design docs and permission matrix.
3. Implement database changes and seed test org.
4. Implement role/profile model and secure access rules.
5. Implement CH1 lifecycle and single-round model for 2569.
6. Implement org-scoped Well-being access and export checks.
7. Implement admin-managed label editing metadata.
8. Continue modular admin refactor safely.
9. Verify deployment and route compatibility.
10. Add basic smoke tests.

---

## Required Caution
- Do not do a big-bang rewrite.
- Do not break existing public survey links.
- Do not mix test data with real organization reporting silently.
- Do not store plaintext passwords.
- Do not change question keys casually if existing data depends on them.
- Do not delete old tables/files until source-of-truth mapping is documented.

---

## What to Report Back After Implementation
Claude cowork should provide:
- summary of schema changes
- list of new/updated files
- list of migrations added
- list of RLS/policy changes
- how roles are enforced
- how test org was created
- what remains deferred
- risks or follow-up recommendations

---

## If There Is Ambiguity
Prefer these defaults unless the owner corrects them:
- CH1 scope = single reporting round for 2569, not a generalized multi-cycle system
- password policy = temp password generation + reset, not password retrieval
- one active `org_hr` per org
- test org excluded by default from official analytics filters
- `admin` can create `admin` and `org_hr` accounts
- `org_hr` can export raw data for own org only
