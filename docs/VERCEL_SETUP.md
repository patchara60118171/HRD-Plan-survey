# 🚀 Vercel Deployment Guide

## การตั้งค่า Vercel สำหรับ Well-being Survey

### ขั้นตอนที่ 1: ติดตั้ง Vercel CLI

```bash
npm install -g vercel
```

### ขั้นตอนที่ 2: Login

```bash
vercel login
```

เลือกวิธี login:
- GitHub
- GitLab
- Bitbucket
- Email

### ขั้นตอนที่ 3: Deploy ครั้งแรก

```bash
# ใน root directory ของโปรเจค
vercel

# ตอบคำถาม:
# ? Set up and deploy "~/Well-being Survey"? [Y/n] y
# ? Which scope do you want to deploy to? [Your Account]
# ? Link to existing project? [y/N] n
# ? What's your project's name? well-being-survey
# ? In which directory is your code located? ./
```

### ขั้นตอนที่ 4: Deploy Production

```bash
vercel --prod
```

---

## ⚙️ Configuration

### vercel.json

โปรเจคมี `vercel.json` ที่ตั้งค่าไว้แล้ว:

```json
{
    "outputDirectory": ".",
    "cleanUrls": true,
    "trailingSlash": false,
    "rewrites": [...],
    "headers": [...]
}
```

**Features:**
- Clean URLs (ไม่ต้องใส่ .html)
- URL rewrites สำหรับ short URLs
- Security headers (XSS, Frame, Content-Type)
- Cache headers สำหรับ static assets

### Environment Variables

ตั้งค่าใน Vercel Dashboard:

1. ไปที่ Project Settings
2. คลิก "Environment Variables"
3. เพิ่มตัวแปร (ถ้าจำเป็น):
   - `SUPABASE_URL` (optional - ใช้ใน build time)
   - `SUPABASE_ANON_KEY` (optional - ใช้ใน build time)

**หมายเหตุ:** ปกติไม่จำเป็นต้องตั้งค่า env vars เพราะใช้ `js/supabase-config.js` แทน

---

## 🔄 Automatic Deployments

### GitHub Integration

1. ไปที่ Vercel Dashboard
2. เลือก Project
3. คลิก "Settings" → "Git"
4. เชื่อมต่อกับ GitHub repository

**Auto-deploy:**
- Push to `main` branch → Deploy to Production
- Push to other branches → Deploy Preview
- Pull Requests → Deploy Preview

### Deploy Hooks

สร้าง webhook สำหรับ trigger deployment:

1. Project Settings → Git → Deploy Hooks
2. สร้าง hook ใหม่
3. ใช้ URL เพื่อ trigger:

```bash
curl -X POST https://api.vercel.com/v1/integrations/deploy/...
```

---

## 🌐 Custom Domain

### เพิ่ม Domain

1. Project Settings → Domains
2. เพิ่ม domain ของคุณ
3. ตั้งค่า DNS:

```
Type: CNAME
Name: www (หรือ subdomain)
Value: cname.vercel-dns.com
```

หรือใช้ A Record:
```
Type: A
Name: @
Value: 76.76.21.21
```

### SSL Certificate

Vercel จัดการ SSL ให้อัตโนมัติ:
- ✅ Auto-renewal
- ✅ Free Let's Encrypt certificate
- ✅ HTTPS redirect

---

## 📊 Monitoring

### Analytics

เปิดใช้งาน Vercel Analytics:

1. Project Settings → Analytics
2. Enable Analytics
3. ดูสถิติ:
   - Page views
   - Unique visitors
   - Top pages
   - Performance metrics

### Logs

ดู deployment logs:

```bash
vercel logs [deployment-url]
```

หรือดูใน Dashboard:
- Deployments → เลือก deployment → Logs

---

## 🐛 Troubleshooting

### ปัญหา: 404 Not Found

**สาเหตุ:** Routing ไม่ถูกต้อง

**แก้ไข:**
1. ตรวจสอบ `vercel.json` → `rewrites`
2. ตรวจสอบว่าไฟล์ HTML อยู่ใน root directory
3. Redeploy: `vercel --prod`

### ปัญหา: Build Failed

**สาเหตุ:** Dependencies หรือ configuration ผิด

**แก้ไข:**
1. ตรวจสอบ `package.json`
2. ลบ `node_modules` และ `package-lock.json`
3. รัน `npm install` ใหม่
4. Commit และ push

### ปัญหา: Environment Variables ไม่ทำงาน

**สาเหตุ:** ตั้งค่าไม่ถูกต้อง

**แก้ไข:**
1. ตรวจสอบ Project Settings → Environment Variables
2. ตรวจสอบว่าเลือก Environment ถูกต้อง (Production/Preview/Development)
3. Redeploy

### ปัญหา: Cache ไม่ทำงาน

**สาเหตุ:** Headers ไม่ถูกต้อง

**แก้ไข:**
1. ตรวจสอบ `vercel.json` → `headers`
2. ใช้ Vercel CLI เพื่อ purge cache:
```bash
vercel --prod --force
```

---

## 🔐 Security Best Practices

### 1. Environment Variables
- ไม่เก็บ secrets ใน code
- ใช้ Vercel Environment Variables
- แยก Production/Preview/Development

### 2. Headers
- ใช้ security headers ใน `vercel.json`
- Enable HTTPS only
- Set CSP (Content Security Policy) ถ้าจำเป็น

### 3. Access Control
- ใช้ Vercel Password Protection สำหรับ staging
- ใช้ Vercel Authentication สำหรับ admin pages

---

## 📈 Performance Optimization

### 1. Edge Network
Vercel ใช้ CDN อัตโนมัติ:
- ✅ Global edge network
- ✅ Automatic caching
- ✅ Brotli compression

### 2. Image Optimization
ใช้ Vercel Image Optimization:

```html
<img src="/assets/logo.png" alt="Logo" loading="lazy" />
```

### 3. Code Splitting
- แยก JavaScript เป็น modules
- Lazy load components
- ใช้ dynamic imports

---

## 💰 Pricing

### Hobby Plan (Free)
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ SSL certificates
- ✅ Custom domains
- ✅ Analytics (basic)

### Pro Plan ($20/month)
- ✅ Everything in Hobby
- ✅ 1 TB bandwidth/month
- ✅ Advanced analytics
- ✅ Password protection
- ✅ Team collaboration

**โปรเจคนี้:** Hobby Plan เพียงพอ

---

## 🔗 Useful Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Vercel Status](https://www.vercel-status.com/)

---

## 📞 Support

หากพบปัญหา:
1. ตรวจสอบ [Vercel Documentation](https://vercel.com/docs)
2. ดู deployment logs
3. ติดต่อ Vercel Support (Pro plan)
4. ถาม community ใน [Vercel Discord](https://vercel.com/discord)
