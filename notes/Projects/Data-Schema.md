---
title: Data Schema
tags:
  - project
  - technical
date: 2026-04-26
status: complete
priority: high
owner: Patchara
---

# Data Schema

Supabase PostgreSQL schema with RLS policies and migration history.

## Tables
- `organizations` - Org metadata
- `users` - User profiles (super_admin/admin/org_hr)
- `survey_forms` - Form definitions
- `survey_responses` - Response records
- `survey_answers` - Individual answers

## Key Concepts
- SSOT: Single Source of Truth via data layer
- RLS: Row-level security for multi-tenant isolation
- Audit trail: Track changes for compliance

## Related
- [[HRD Plan Survey]]
- [[Survey Components]]
