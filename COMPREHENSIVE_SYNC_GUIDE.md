# Comprehensive Questions Sync System

## Overview
This system ensures all Well-being Survey questions are synchronized from a single source of truth (`js/questions.js`) to all other parts of the application.

## Single Source of Truth
- **Main file**: `js/questions.js` - Contains `SURVEY_DATA` object with all questions
- **All other files** sync from this source

## Sync Targets
1. **wb-printable**: `data/questions-wellbeing.json`
2. **Public Survey App**: `apps/public-survey/js/questions.js`
3. **Main Web App**: Uses `js/questions.js` directly (no sync needed)
4. **PDF Generation**: Uses synced data from above sources

## Available Commands

### 1. Basic Sync (wb-printable only)
```bash
npm run sync:questions
```
- Updates: `data/questions-wellbeing.json`
- Use when: Only printable version needs updating

### 2. Comprehensive Sync (All systems)
```bash
npm run sync:all
```
- Updates: 
  - `data/questions-wellbeing.json`
  - `apps/public-survey/js/questions.js`
  - Creates: `sync-report.json`
  - Creates: `clear-all-caches.html`
- Use when: Making changes to questions that affect all systems

### 3. Watch Mode (Auto-sync during development)
```bash
npm run watch:questions
```
- Watches: `js/questions.js` for changes
- Auto-syncs to: `data/questions-wellbeing.json`
- Use when: Actively editing questions

## Workflow for Question Updates

### When editing questions:
1. Make changes in `js/questions.js`
2. Run `npm run sync:all` to update all systems
3. Open `clear-all-caches.html` in browser OR refresh all pages with Ctrl+F5
4. Test all affected systems:
   - Main survey: `http://localhost:3000/`
   - Printable: `http://localhost:3000/wb-printable`
   - Public survey: Check if applicable

### Cache Clearing
After any sync, clear browser cache to see latest questions:
- **Option 1**: Open `clear-all-caches.html`
- **Option 2**: Hard refresh (Ctrl+F5 or Ctrl+Shift+R)
- **Option 3**: Clear browser data manually

## Files That Auto-Sync
- ✅ `data/questions-wellbeing.json` - For wb-printable
- ✅ `apps/public-survey/js/questions.js` - For public survey app

## Files That Use Source Directly
- ✅ `index.html` - Loads `js/questions.js` directly
- ✅ `org-portal.html` - Uses FormSchema with fallback to `js/questions.js`

## Troubleshooting

### Questions not updating?
1. Run `npm run sync:all`
2. Clear browser cache
3. Check browser console for errors
4. Verify `sync-report.json` shows correct timestamp

### Sync fails?
1. Check `js/questions.js` for syntax errors
2. Ensure `SURVEY_DATA` object is properly formatted
3. Verify target files exist and are writable

### Cache issues?
1. Open `clear-all-caches.html`
2. Or use browser DevTools to clear storage
3. Restart browser if needed

## Best Practices
1. Always edit questions in `js/questions.js` only
2. Run `npm run sync:all` after any question changes
3. Clear cache after syncing
4. Test all affected systems
5. Keep backup of `js/questions.js` before major changes

## Report Files
- `sync-report.json`: Shows what was synced and when
- `clear-all-caches.html`: Browser cache clearing utility
- `QUESTIONS_SYNC.md`: Basic sync documentation
