# Well-being Survey v3.0 - Deployment Guide

## 🚀 อัพโหลดขึ้น GitHub

### 1. เตรียมโปรเจค

```bash
# เข้าไปในโฟลเดอร์โปรเจค
cd "c:\Users\Pchr Pyl\Desktop\Well-being Survey"

# สร้าง .gitignore
echo "node_modules/
.DS_Store
*.log
.env
.env.local
dist/
build/" > .gitignore

# สร้าง package.json (ถ้ายังไม่มี)
npm init -y
npm install @supabase/supabase-js
```

### 2. Git Commands

```bash
# เริ่ม Git repository
git init
git add .
git commit -m "Initial commit: Well-being Survey v3.0"

# เชื่อมต่อกับ GitHub (แทนที่ YOUR_USERNAME/YOUR_REPO)
git remote add origin https://github.com/YOUR_USERNAME/well-being-survey-v3.git
git branch -M main
git push -u origin main
```

### 3. สร้าง GitHub Repository

1. เข้าไปที่ [GitHub](https://github.com)
2. สร้าง repository ใหม่ชื่อ `well-being-survey-v3`
3. เลือก Public/Private ตามต้องการ
4. คัดลอก repository URL มาใช้ในข้อ 2

### 4. ตั้งค่า GitHub Pages (ถ้าต้องการ Deploy)

```bash
# สร้าง gh-pages branch
git checkout --orphan gh-pages
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages
```

หรือใช้ GitHub Actions อัตโนมัติ:

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./
```

### 5. Environment Variables

สร้าง `.env` สำหรับ development:
```env
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_KEY=YOUR_SERVICE_KEY
```

### 6. การอัพเดตในอนาคต

```bash
# เมื่อมีการเปลี่ยนแปลง
git add .
git commit -m "Update: [รายละเอียดการเปลี่ยนแปลง]"
git push origin main
```

## 📋 Checklist ก่อนอัพโหลด

- [ ] ตรวจสอบว่า Supabase schema อัพเดตแล้ว
- [ ] ทดสอบฟอร์มใน local ว่าทำงานปกติ
- [ ] ลบข้อมูล sensitive (API keys) จาก code
- [ ] ตรวจสอบ .gitignore ครอบคลุมไฟล์ที่ไม่ควรอัพ
- [ ] เขียน README.md ให้ชัดเจน
- [ ] ทดสอบ deployment ใน staging ก่อน

## 🔧 การแก้ไขปัญหาที่อาจเกิดขึ้น

### Supabase CORS Issues
```sql
-- รันใน Supabase SQL Editor
ALTER PUBLICATION supabase_realtime ADD TABLE hrd_ch1_responses;
```

### GitHub Pages 404
- ตรวจสอบว่า base URL ถูกต้อง
- ใช้ relative paths ใน HTML

### Form Validation ไม่ทำงาน
- ตรวจสอบ console ใน browser
- ตรวจสอบว่า JavaScript files โหลดถูกต้อง

---

**พร้อมใช้งาน!** 🎉
