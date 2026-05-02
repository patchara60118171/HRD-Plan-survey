---
title: Project Vault Guide
aliases:
  - Vault README
---

# Project Vault 📚

Obsidian vault สำหรับจัดการและติดตามโปรเจคต่างๆ ใช้ tags, links, canvas, และ database views.

## 🗂️ โครงสร้าง

```
notes/
├── Projects/          ← Project notes ที่มี #project tag
│   ├── HRD-Plan.md
│   ├── Admin-Dashboard.md
│   ├── Survey-Components.md
│   ├── Data-Schema.md
│   └── Future-Features.md
├── Projects.canvas    ← Visual mind map (เชื่อมโยง projects)
├── Projects.base      ← Database views (table/cards/grouped)
└── README.md          ← Guide นี้
```

## 📌 ใช้ Tags ประจำ

- `#project` — ระบุว่าเป็น note หลัก
- `#active` — โปรเจคที่กำลังดำเนิน
- `#feature` — ฟีเจอร์หรือส่วนของโปรเจค
- `#technical` — เทคนิค/architecture/schema
- `#backlog` — แผนอนาคต

## 🔍 วิธีใช้

### 1️⃣ ดูโปรเจคทั้งหมด
- **Canvas**: เปิด `Projects.canvas` → ดูความสัมพันธ์เชิงภาพ
- **Database**: เปิด `Projects.base` → เลือก view:
  - *All Projects* = ตารางทั้งหมด grouped by status
  - *Project Cards* = in-progress projects เท่านั้น
  - *By Priority* = grouped by priority level

### 2️⃣ เพิ่มโปรเจคใหม่
1. สร้าง markdown file ใน `Projects/`
2. เพิ่ม frontmatter:
   ```yaml
   ---
   title: Project Name
   tags: [project, active]  # หรือ [project, backlog]
   date: 2026-04-29
   status: in-progress      # หรือ complete, planning
   priority: high           # หรือ medium, low
   owner: Your Name
   ---
   ```
3. Canvas & Database จะเห็นอัตโนมัติ

### 3️⃣ เชื่อมโยง Notes
ใช้ wikilinks:
```markdown
[[HRD Plan Survey]]        ← Link ไปยัง note
[[Admin-Dashboard#Tasks]] ← Link ไปยัง section
```

### 4️⃣ ดึงบทความจาก URL
```bash
# ดึงจาก URL → markdown
defuddle parse <url> --md -o notes/Articles/article-name.md

# แล้ว link จาก project note:
![[Articles/article-name.md]]
```

## 📊 Canvas & Database

| ไฟล์ | ประเภท | ใช้สำหรับ |
|------|--------|----------|
| `Projects.canvas` | Mind Map | ดูความสัมพันธ์เชิงภาพ |
| `Projects.base` | Database | ดูข้อมูลแบบตาราง/การ์ด |

## 🏷️ Frontmatter Reference

| Field | ตัวอย่าง | หมายเหตุ |
|-------|----------|---------|
| `title` | "HRD Plan Survey" | ชื่อ note |
| `tags` | `[project, active]` | ต้องมี `project` ถึงจะแสดงใน Canvas/Database |
| `date` | `2026-04-29` | วันสร้าง/อัปเดต |
| `status` | `in-progress` | complete, planning, in-progress |
| `priority` | `high` | high, medium, low |
| `owner` | `Patchara` | ผู้รับผิดชอบ |

## 💡 Tips

- **ค้นหา**: Ctrl+Shift+F (search ทั้งหมด)
- **Graph View**: Ctrl+Shift+G (ดูความสัมพันธ์เป็นกราฟ)
- **Backlinks**: กลับมาดูว่าใครไป link note นี้
- **Tag Pane**: ดูทั้งหมด tags + นับจำนวน

## 📝 Next Steps

- [ ] เพิ่มเติม project notes
- [ ] ลิงก์ articles จากเว็บ
- [ ] ขยาย database formulas (emoji status, etc.)
- [ ] สร้าง templates สำหรับ new projects
