-- Migration: Extend organizations table
-- Date: 2026-03-22
-- Adds show_in_dashboard and display_order columns

ALTER TABLE organizations ADD COLUMN IF NOT EXISTS show_in_dashboard BOOLEAN DEFAULT true;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Update existing rows to show in dashboard by default
UPDATE organizations SET show_in_dashboard = true WHERE show_in_dashboard IS NULL;
