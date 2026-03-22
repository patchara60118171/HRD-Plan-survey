/**
 * ch1.js — Page: CH1 Survey Data + Summary + PDF
 * Sprint 3C: Extracted from admin.html inline script
 * Depends on: config.js (state, ORG_NAMES, sb), utils.js (esc, fmtDate, fmtNum, showToast)
 *             export.js (downloadWorkbook, exportCh1All, exportCh1Filtered)
 *
 * Functions (all are stubs — TODO: move full impls from admin.html):
 *   renderCh1(summary)             → admin.html line ~1605  (~190 lines)
 *   renderCh1RawSheet()            → admin.html line ~1795  (~20 lines)
 *   renderCh1Pdf()                 → admin.html line ~1816  (~25 lines)
 *   filterCh1Pdf()                 → admin.html line ~1841  (~10 lines)
 *   renderCh1Summary()             → admin.html line ~2886  (~180 lines)
 *   filterCh1Data()                → admin.html line ~3285  (~10 lines)
 *   filterCh1Sheet()               → admin.html line ~3296  (~25 lines)
 *   exportCh1SummaryReport()       → admin.html line ~3067  (~20 lines)
 *   exportCh1SummaryPdf()          → admin.html line ~3086  (~65 lines)
 *   showCh1RowDetail(index)        → admin.html line ~4110  (~180 lines)
 *   showCh1PDF(index)              → admin.html line ~4827  (~210 lines)
 *
 * NOTE: CH1 is the largest page module (~920 lines total).
 * Priority: move renderCh1Summary and showCh1RowDetail first (most complex).
 */

// ─── All functions currently in admin.html inline script ─────────────────────
// They are functional there. This file is the migration target.

// TODO: renderCh1(summary) — admin.html ~1605
//   Renders CH1 status table for all orgs + round status badges + submission timeline

// TODO: renderCh1RawSheet() — admin.html ~1795
//   Renders raw CH1 sheet (all fields) for admin review + export

// TODO: renderCh1Pdf() — admin.html ~1816
//   Renders PDF preview list per org

// TODO: filterCh1Pdf() — admin.html ~1841
//   Filters PDF list by org selector

// TODO: renderCh1Summary() — admin.html ~2886
//   Massive summary chart renderer: staff breakdown, disease, mental health, engagement
//   Uses: renderMiniBars, renderTrendLine, renderCh1SummaryChart (in links.js TODO)

// TODO: filterCh1Data() — admin.html ~3285
//   Filter CH1 table by org + status

// TODO: filterCh1Sheet() — admin.html ~3296
//   Filter raw CH1 sheet by search query

// TODO: exportCh1SummaryReport() — admin.html ~3067
//   Export CH1 summary as Excel with all KPIs

// TODO: exportCh1SummaryPdf() — admin.html ~3086
//   Export CH1 summary as printable PDF page

// TODO: showCh1RowDetail(index) — admin.html ~4110
//   Modal: full CH1 form display for 1 org, with all sections

// TODO: showCh1PDF(index) — admin.html ~4827
//   Opens printable PDF of CH1 form in new window/iframe
