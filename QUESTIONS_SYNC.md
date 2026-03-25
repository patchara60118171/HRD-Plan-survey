# Questions Sync System

## Overview
The Well-being Survey has two question sources:
- `js/questions.js` - Main source for the web application
- `data/questions-wellbeing.json` - Used by wb-printable.html

## Why Sync is Needed
- `wb-printable.html` loads questions from the JSON file for faster loading
- The main survey uses `js/questions.js` directly
- Changes to `js/questions.js` don't automatically update the JSON file

## How to Sync

### Method 1: Manual Sync (After making changes)
```bash
npm run sync:questions
```

### Method 2: Auto-Watch (During development)
```bash
npm run watch:questions
```
This will:
- Watch `js/questions.js` for changes
- Automatically sync to JSON when you save
- Show real-time sync status

## Workflow
1. Make changes to `js/questions.js`
2. Run sync (manual or watch mode)
3. Both web app and wb-printable will show the same questions

## Files
- `sync-questions.js` - Sync logic
- `watch-questions.js` - File watcher
- `data/questions-wellbeing.json` - Target JSON file

## Notes
- The sync preserves all question structure and options
- Invalid JavaScript in questions.js will cause sync to fail
- Always test both web app and printable after sync
