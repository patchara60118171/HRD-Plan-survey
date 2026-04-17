# Wellbeing SSOT Structure

## Canonical source

- `data/questions-wellbeing.json`

## Runtime files

- `js/wellbeing/loader.js`
  - โหลด schema จาก canonical JSON
  - normalize ข้อมูล
  - hydrate เข้า `PROJECT_SSOT.wellbeing`
  - expose `ensureWellbeingSurveyData()`

- `js/wellbeing/overrides.js`
  - apply ข้อความ override จาก `form_configs`
  - expose `applyWellbeingFormConfig()`

## Compatibility files

- `js/questions.js`
- `js/wellbeing-schema-loader.js`
- `sync-questions.js`
- `sync-all-questions.js`
- `watch-questions.js`

ไฟล์กลุ่มนี้มีไว้เพื่อรองรับ reference เก่าเท่านั้น ไม่ใช่ source หลัก

## Tooling files

- `scripts/wellbeing/validate-schema.js`
- `scripts/wellbeing/build-report.js`
- `scripts/wellbeing/watch-schema.js`

## Current runtime flow

1. `index.html` โหลด `js/project-ssot.js`
2. `index.html` โหลด `js/wellbeing/loader.js`
3. `index.html` โหลด `js/wellbeing/overrides.js`
4. `js/app.js` เรียก `ensureWellbeingSurveyData()`
5. `js/app.js` ดึง override จาก Supabase แล้วเรียก `applyWellbeingFormConfig()`

## Cleanup guideline

ถ้าจะลบ compatibility files ในอนาคต ให้ตรวจทุก reference ก่อนว่าไม่มี consumer ใด include path เก่าอยู่แล้ว
