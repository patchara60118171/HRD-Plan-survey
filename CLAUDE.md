โปรเจกต์: NIDA Well-being Survey (vanilla HTML/JS + Supabase + Vercel static)
Workspace: c:\Users\Pchr Pyl\Desktop\Well-being Survey
Repo: https://github.com/patchara60118171/HRD-Plan-survey (main)
Supabase project_id: fgdommhiqhzvsedfzyrr
Vercel project_id: prj_BIYzkJEWE09Hss0JhrG9iVBj6bfV (auto-deploy จาก main)
Live: https://nidawellbeing.vercel.app

ภาษา: ตอบไทยเป็นหลัก (user ใช้ไทย), code/log เป็นอังกฤษ กระชับ ไม่ประจบ

เป้าหมายระยะยาว:
- Restructure เป็นสถาปัตยกรรม SSOT (form defs + org metadata + constants รวมใน data file เดียว)
- 3-role model: super_admin / admin / org_hr (ดูรายละเอียดใน docs/)
- CH1 สำหรับ org_hr; Well-being survey สำหรับ public (ไม่ login)

กฎบังคับ:
1. ทุก DDL → `mcp1_apply_migration` เท่านั้น (ห้าม execute_sql ทำ DDL)
2. ห้ามแก้/ลบ migration เก่าที่ apply แล้ว — เพิ่มไฟล์ใหม่เท่านั้น (supabase/migrations/)
3. ห้าม hardcode/เปลี่ยน Supabase key ใน js/supabase-config.js จนกว่าจะทำ M7 (env injection)
4. Commit เป็น logical chunk, อย่ารวม migrations + refactor + UI fix เข้า commit เดียว
5. Push = deploy → verify Vercel ทุกครั้งหลัง push
6. อัปเดต docs/AUDIT_REPORT_2026-04.md progress tracker ทุกครั้งที่ปิด task
7. ห้ามสร้างไฟล์ .md/progress สุ่มถ้าไม่จำเป็น; ห้ามเพิ่ม console.log ในโปรดักชัน (มี js/logger.js silencer)
8. Code style: อย่าเพิ่ม/ลบ comment ถ้าไม่ถูกสั่ง; ใช้ `esc()` ทุกจุดที่ inject ค่าผู้ใช้เข้า innerHTML
9. Legacy `onclick="..."` ใน admin.html ยังอ้าง global functions — refactor ต้องคง globals ไว้ (ห้ามย้ายเป็น ES modules โดยไม่อัปเดต HTML พร้อมกัน)

ไฟล์อ้างอิงก่อนเริ่มงาน:
- docs/AUDIT_REPORT_2026-04.md (SSOT ของ progress)
- admin/js/services/data.js (data layer)
- admin/js/app.js (entry point)
- js/a11y.js, js/logger.js (อย่าลบ behavior)
- .windsurf/skills/supabase-postgres-best-practices/SKILL.md

Workflow: ใช้ browser control (Playwright headless:false) verify หลังแก้ UI; ใช้ Supabase MCP list_migrations + get_advisors ก่อน/หลัง apply