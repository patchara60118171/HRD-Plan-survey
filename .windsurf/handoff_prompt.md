# Handoff Prompt for New AI Model

## Project Overview
**Project:** NIDA Wellbeing Survey System
**Workspace:** `c:\Users\Pchr Pyl\Desktop\Well-being Survey`
**Git Remote:** https://github.com/patchara60118171/HRD-Plan-survey.git (branch: `main`)
**Live URL:** https://nidawellbeing.vercel.app

This is a multi-page survey system with:
- `index.html` - General wellbeing survey (public, no login)
- `ch1.html` - HRD Chapter 1 organizational survey (filled by org_hr)
- `admin.html` - Admin portal for super_admin, admin, org_hr roles

## Recent Session Progress (2026-04-18 → 2026-04-21)

### Migrations Applied to Production Supabase
1. ✅ `20260418_harden_survey_update_rls.sql` - C4 RLS hardening
2. ✅ `20260418_add_perf_indexes.sql` - H1 composite indexes
3. ✅ `20260419_org_dashboard_summary_view.sql` - H3 aggregation view (`v_organization_dashboard_summary`)
4. ✅ `20260420_fix_dashboard_view_security_invoker.sql` - H3 hotfix (DEFINER→INVOKER)
5. ✅ `20260421_fix_pre_existing_security_definer_views.sql` - Phase 5 P1+P2 (2 views flipped to INVOKER)
6. ✅ `20260421_phase5_warn_cleanup.sql` - Phase 5 WARN cleanup (dropped 3 duplicate indexes, pinned search_path on 5 functions)

### Code Changes Completed
- ✅ Wired `js/a11y.js` into all 3 HTML entry points (keyboard support for legacy onclick elements)
- ✅ Refactored `admin/js/app.js:refreshData()` for phased loading (core first, extras in background)
- ✅ Implemented double-submit guard in `js/app.js:submitSurvey()` (M14)
- ✅ Added focus trap + ARIA attributes to consent popup in `js/app.js` (M6)
- ✅ Added Mermaid architecture diagram to README.md (L4)
- ✅ Consolidated `.env.example` (deleted duplicate `.env.local.example`) (L5)
- ✅ Updated `.vercelignore` to exclude dev-tools/ and supabase/one-off/
- ✅ Modified `admin/js/services/data.js:summarizeOrgs()` to include ch1Submitted/ch1Draft counts
- ✅ Updated labels in admin.html from "Ch1" to "แบบสำรวจข้อมูลองค์กร"
- ✅ Created `CLAUDE.md` with project-level instructions

### Security Advisor Scorecard
- **Security ERROR:** 3 → 1 (remaining: `organizations_public` DEFINER - documented exception for anon pre-login org list)
- **Security WARN:** 7 → 2 (remaining: `pg_net` in public schema, `auth_leaked_password_protection` dashboard toggle)
- **Performance WARN (duplicate_index):** 3 → 0

## Immediate Pending Tasks

### #6: Git Commit + Push
✅ **Completed**

- Latest commit already on `main` and pushed to origin:
	- `291839d fix(kpi): relax status check - count as submitted if submitted_at exists`
- Branch status: `main...origin/main` (no ahead/behind)

### #11: Vercel Deployment Verification
✅ **Completed (2026-04-19)**

- Production endpoints respond with HTTP 200:
	- `https://nidawellbeing.vercel.app`
	- `https://nidawellbeing.vercel.app/admin`
	- `https://nidawellbeing.vercel.app/ch1`
	- `https://nidawellbeing.vercel.app/org-portal`
- Content markers confirmed on live pages (public survey/admin/ch1)
- `.html` paths redirect (308) to clean routes, expected behavior on current deployment routing

## Recent Code Change (Just Made)
User modified `admin/js/services/data.js` (lines 445-456) to fix CH1 status counting logic:
- **Old:** `const isSubmitted = status === 'submitted' || (!status && row.submitted_at);`
- **New:** `const isSubmitted = status === 'submitted' || row.submitted_at;`
- **Reason:** If `submitted_at` exists, count as submitted regardless of `status` value
- **Added:** Debug logging for first 3 rows per organization to see status values

This change is NOT yet committed.

## Architecture Goals (Long-term)
1. **SSOT (Single Source of Truth):** Centralize form definitions, organization metadata, and shared constants into one canonical data file
2. **3-Role Model:** super_admin (full control), admin (all orgs, form editing), org_hr (single org, CH1 only)
3. **Hybrid Architecture:** Evolve admin modularization into shared-data architecture consuming SSOT

## Supabase Configuration
- **Project ID:** `fgdommhiqhzvsedfzyrr`
- **URL:** https://fgdommhiqhzvsedfzyrr.supabase.co
- **Anon Key:** Stored in `js/supabase-config.js`
- **Tables:** `hrd_ch1_responses`, `wellbeing_responses`, `organizations`, `survey_forms`, `org_form_links`, `admin_user_roles`, `org_form_links`

## Vercel Configuration
- **Project ID:** `prj_BIYzkJEWE09Hss0JhrG9iVBj6bfV`
- **Dashboard:** https://vercel.com/mai5/well-being-survey
- **Deployment:** Auto-deploy from `main` branch (static site, no build command)

## Key Reference Files
- `CLAUDE.md` - Project-level instructions and rules
- `docs/AUDIT_REPORT_2026-04.md` - Detailed audit findings and status
- `README.md` - Architecture diagram and overview
- `.vercelignore` - Deployment exclusions

## Mandatory Rules
1. **DDL Changes:** Always create migration files in `supabase/migrations/` with date prefix
2. **Supabase Keys:** Never hardcode keys; use `js/supabase-config.js` pattern
3. **Commit Hygiene:** Commit logical chunks with descriptive messages
4. **Code Style:** Follow existing patterns in the codebase
5. **RLS Enforcement:** Views must use `security_invoker=true` to enforce RLS

## Phase 5 Deferred Items (Optional Future Work)
- `organizations_public` DEFINER - leave as-is (intentional exception)
- `pg_net` extension in public schema - requires coordinated change
- `auth_leaked_password_protection` - enable via Supabase dashboard GUI
- `multiple_permissive_policies` × 14 - consolidate when perf becomes material
- `unindexed_foreign_keys` × 2 - defer until write pattern warrants
- H3 client switch-over to `v_organization_dashboard_summary` - requires view extension for JSONB aggregation

## Next Steps for You
1. Remove temporary debug `console.log` in `admin/js/services/data.js:summarizeOrgs()` after KPI validation is complete
2. Continue deferred Phase 5 items based on priority (starting from non-breaking security/perf backlog)
3. Keep `docs/AUDIT_REPORT_2026-04.md` in sync after each completed task

## Important Context
- User speaks Thai and English; respond in Thai when appropriate
- The project uses vanilla JavaScript (no React/frameworks)
- Admin portal is a SPA in `admin.html` with modular JS in `admin/js/`
- Survey forms use IndexedDB for offline sync
- Focus on minimal, focused edits following existing patterns
