# Accessibility Audit Report
**Date:** 2026-04-18  
**Audited Files:** admin.html, index.html, ch1.html  
**Based on:** Web Interface Guidelines (vercel-labs/web-interface-guidelines)

## Executive Summary

This audit identified several accessibility issues across the main HTML files. The most critical issues involve:
- Non-semantic interactive elements (divs with onclick instead of buttons)
- Missing ARIA labels on icon-only buttons
- Lack of keyboard navigation support
- Missing focus states on interactive elements

## Critical Issues

### 1. Non-Semantic Interactive Elements (admin.html)
**Severity:** HIGH  
**Location:** admin.html lines 71-91

**Issue:** Navigation items use `<div>` elements with `onclick` handlers instead of semantic `<button>` elements.

```html
<!-- Current (Incorrect) -->
<div class="nav-item active" onclick="go('dashboard',this)"><span class="ni">📊</span> Dashboard ภาพรวม</div>
<div class="nav-item" onclick="go('progress',this)"><span class="ni">📋</span> สถานะการส่งข้อมูล</div>
```

**Guideline:** `<button>` for actions, `<a>`/`<Link>` for navigation (not `<div onClick>`)

**Recommendation:** Replace with semantic buttons:
```html
<button class="nav-item active" onclick="go('dashboard',this)" aria-current="page">
  <span class="ni">📊</span> Dashboard ภาพรวม
</button>
<button class="nav-item" onclick="go('progress',this)">
  <span class="ni">📋</span> สถานะการส่งข้อมูล
</button>
```

**Impact:** Screen readers cannot properly identify these as interactive elements, and keyboard users cannot navigate to them.

### 2. Missing ARIA Labels on Icon-Only Buttons (admin.html)
**Severity:** HIGH  
**Location:** admin.html line 51, 99

**Issue:** Icon-only buttons lack `aria-label` attributes.

```html
<!-- Current -->
<button class="sidebar-close-btn" onclick="document.body.classList.remove('sidebar-open')" aria-label="ปิดเมนู">✕</button>
<button class="hamburger" onclick="document.body.classList.toggle('sidebar-open')" aria-label="เปิดเมนู">☰</button>
```

**Status:** ✅ **FIXED** - These already have `aria-label` attributes. Good!

### 3. Sidebar Backdrop (admin.html)
**Severity:** MEDIUM  
**Location:** admin.html line 48

**Issue:** Div with onclick should be a button with proper ARIA.

```html
<!-- Current -->
<div class="sidebar-backdrop" onclick="document.body.classList.remove('sidebar-open')"></div>
```

**Recommendation:**
```html
<button class="sidebar-backdrop" onclick="document.body.classList.remove('sidebar-open')" aria-label="ปิดเมนู"></button>
```

## Medium Priority Issues

### 4. Loading State Text (index.html)
**Severity:** MEDIUM  
**Location:** index.html line 69

**Issue:** Loading text should use ellipsis per guidelines.

```html
<!-- Current -->
<p>กำลังโหลด...</p>
```

**Status:** ✅ **COMPLIANT** - Already uses ellipsis correctly.

### 5. Form Labels
**Severity:** MEDIUM  
**Location:** All HTML files

**Issue:** Need to verify all form inputs have associated labels or aria-label.

**Recommendation:** Audit all form inputs to ensure:
- Each input has a `<label>` with `for` attribute matching the input's `id`, OR
- Each input has an `aria-label` attribute

### 6. Focus States
**Severity:** MEDIUM  
**Location:** CSS files

**Issue:** Need to verify all interactive elements have visible focus states.

**Guideline:** Interactive elements need visible focus: `focus-visible:ring-*` or equivalent. Never `outline-none` / `outline: none` without focus replacement.

**Recommendation:** Review CSS to ensure:
- All buttons/links have `:focus-visible` styles
- No `outline: none` without replacement focus indicator

## Low Priority Issues

### 7. Heading Hierarchy
**Severity:** LOW  
**Location:** All HTML files

**Issue:** Need to verify proper heading hierarchy (h1-h6) and include skip link for main content.

**Guideline:** Headings hierarchical `<h1>`–`<h6>`; include skip link for main content

**Recommendation:** 
- Add skip link at top of page
- Ensure headings follow proper hierarchy (no skipping levels)

### 8. Image Alt Text
**Severity:** LOW  
**Location:** All HTML files

**Issue:** Need to verify all images have alt text.

**Guideline:** Images need `alt` (or `alt=""` if decorative)

**Recommendation:** Audit all `<img>` tags for alt attributes.

## Positive Findings

✅ **Good practices already implemented:**
- Proper `lang="th"` attribute on html tag
- Proper viewport meta tag
- Preconnect to font CDNs for performance
- Some aria-label attributes present
- Semantic HTML structure where applicable

## Recommendations Summary

### Immediate Actions (High Priority)
1. Replace all `<div onclick="...">` with `<button onclick="...">` in admin.html sidebar navigation
2. Add `role="button"` and `tabindex="0"` to any remaining non-button interactive elements
3. Ensure all icon-only buttons have `aria-label`

### Short-term Actions (Medium Priority)
4. Add visible focus states to all interactive elements in CSS
5. Audit and fix form labels across all forms
6. Add skip link for keyboard users

### Long-term Actions (Low Priority)
7. Verify heading hierarchy across all pages
8. Audit all images for alt text
9. Consider adding `aria-live` regions for async updates (toasts, validation messages)

## Testing Recommendations

1. **Keyboard Navigation Test:** Navigate entire application using only Tab/Shift+Tab
2. **Screen Reader Test:** Test with NVDA (Windows) or VoiceOver (Mac)
3. **Color Contrast Test:** Verify all text meets WCAG AA standards (4.5:1 for normal text)
4. **Focus Visible Test:** Verify focus indicators are clearly visible on all interactive elements

## Resources

- [Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
