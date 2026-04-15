# 📋 HRD Plan Survey - Project Documentation

**Project Name:** Well-being Survey System  
**Version:** 3.1.0  
**Repository:** https://github.com/patchara60118171/HRD-Plan-survey.git  
**Last Updated:** 6 April 2026

---

## 🛠️ 1. Tech Stack (เทคโนโลยีหลักที่ใช้)

### **Frontend**
- **Framework:** Vanilla JavaScript (ES6+) - ไม่ใช้ React/Next.js
- **Styling:** Pure CSS with CSS Variables (ไม่ใช้ Tailwind CSS)
- **Components:** Custom JavaScript Components (ไม่ใช้ Shadcn/UI)
- **Architecture:** Multi-page SPA with Service Worker
- **Build Tool:** Static files (no build process required)

### **Backend/Database**
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth with RLS (Row Level Security)
- **API:** Supabase Client SDK (@supabase/supabase-js)
- **Edge Functions:** Supabase Functions (Google Sheets sync)
- **Real-time:** Supabase Realtime subscriptions

### **Deployment**
- **Platform:** Vercel
- **Environment:** Production + Preview deployments
- **CDN:** Vercel Edge Network
- **Build:** Static site (no build command)

### **Development Tools**
- **Testing:** Playwright (E2E automation)
- **Package Manager:** npm
- **Version Control:** Git
- **Environment:** Node.js 18+

---

## 🎨 2. UI & Design Preferences (การออกแบบ)

### **Color System**
```css
/* Primary Colors */
--primary-gradient: linear-gradient(135deg, #0D9488 0%, #3B82F6 100%);
--primary-teal: #0D9488;
--primary-blue: #3B82F6;

/* Well-being Dimensions */
--color-physical: #10B981;      /* Green */
--color-mental: #8B5CF6;        /* Purple */
--color-social: #F59E0B;        /* Amber */
--color-environment: #06B6D4;  /* Cyan */

/* Neutral Colors */
--bg-primary: #F8FAFC;          /* Light gray background */
--bg-secondary: #F1F5F9;        /* Beige/minimal tone */
```

### **Design Style**
- **Background:** Minimal clean design with light gray/beige tones
- **Typography:** Clean, professional Thai fonts
- **Layout:** Card-based design with proper spacing
- **Responsive:** Mobile-first approach
- **Components:** Custom CSS components (ไม่ใช้ UI library)

### **Primary Action Color**
- **Main Action:** `#0D9488` (Teal) - ใช้สำหรับปุ่มหลัก
- **Secondary:** `#3B82F6` (Blue) - ใช้สำหรับปุ่มรอง
- **Accent:** `#F59E0B` (Amber) - ใช้สำหรับจุดเน้น

---

## 📝 3. Coding Guidelines (มาตรฐานการเขียนโค้ด)

### **Clean Code Standards**
```javascript
// ✅ ฟังก์ชันต้องมี comment อธิบายสั้นๆ
/**
 * คำนวณค่า BMI จากส่วนสูงและน้ำหนัก
 * @param {number} height - ส่วนสูง (cm)
 * @param {number} weight - น้ำหนัก (kg)
 * @returns {number} ค่า BMI
 */
function calculateBMI(height, weight) {
    return weight / ((height / 100) ** 2);
}
```

### **State Management**
- **Global State:** JavaScript objects with localStorage persistence
- **Form State:** Component-level state management
- **Data Sync:** Supabase real-time subscriptions
- **Cache Strategy:** Service Worker with versioned cache

### **Error Handling**
```javascript
// ✅ ต้องมี Try-Catch ในส่วนที่เชื่อมต่อ API
async function saveToSupabase(data) {
    try {
        const { error } = await supabase
            .from('survey_responses')
            .insert(data);
        
        if (error) throw error;
        
        showToast('บันทึกข้อมูลสำเร็จ', 'success');
        return true;
    } catch (error) {
        console.error('Save error:', error);
        showToast('เกิดข้อผิดพลาด: ' + error.message, 'error');
        return false;
    }
}
```

### **Language Standards**
- **Variables/Functions:** English (`calculateBMI`, `surveyData`)
- **Comments:** Thai (`// คำนวณค่า BMI`)
- **User Messages:** Thai (`toast('บันทึกข้อมูลสำเร็จ', 'success')`)
- **Error Messages:** Thai (`toast('เกิดข้อผิดพลาด', 'error')`)

### **File Structure**
```
js/
├── app.js              # Main application logic
├── components.js       # UI components
├── questions.js        # Survey questions (SSOT)
├── utils.js           # Utility functions
└── form-schema.js     # Form schema management
```

---

## 🔄 4. Workflow (ขั้นตอนการทำงาน)

### **Step 1: Impact Analysis (วิเคราะห์ผลกระทบ)**
```javascript
// ตัวอย่างการวิเคราะห์ก่อนแก้ไข
const impactAnalysis = {
    affectedFiles: ['js/wellbeing/loader.js', 'data/questions-wellbeing.json'],
    breakingChanges: false,
    testRequired: true,
    rollbackPlan: 'git checkout HEAD~1'
};
```

### **Step 2: Code Implementation (เขียนโค้ด)**
- **Single Source of Truth:** `data/questions-wellbeing.json`
- **Runtime Loader:** `js/wellbeing/loader.js`
- **Schema Report:** `scripts/wellbeing/build-report.js`
- **Testing:** Manual + E2E with Playwright
- **Validation:** Form validation before submission

### **Step 3: Unit Testing (ทดสอบ Logic หลัก)**
```javascript
// ตัวอย่างการทดสอบฟังก์ชันคำนวณ
function testBMICalculation() {
    const result = calculateBMI(170, 65);
    console.assert(result === 22.49, 'BMI calculation failed');
    console.log('✅ BMI test passed');
}
```

### **Step 4: Security Check (ตรวจสอบความปลอดภัย)**
- **RLS Policies:** ตรวจสอบ Row Level Security ใน Supabase
- **Data Validation:** Validate input ก่อนบันทึก
- **Authentication:** Verify user permissions
- **XSS Protection:** Sanitize user inputs

---

## 📊 5. Project Architecture (สถาปัตยกรรมโปรเจกต์)

### **Applications Overview**
| ส่วนระบบ | ไฟล์หลัก | เส้นทาง | คำอธิบาย |
|---|---|---|---|
| Public Survey | `index.html` | `/` | แบบสำรวจ 97 คำถาม |
| CH1 Survey | `ch1.html` | `/ch1` | แบบสำรวจ HRD บทที่ 1 |
| Admin Portal | `admin.html` | `/admin` | จัดการระบบและรายงาน |
| Org Portal | `org-portal.html` | `/ch1` | พอร์ทัลองค์กร |

### **Data Flow**
```
User Input → Form Validation → Supabase DB → Real-time Update → UI Refresh
     ↓
LocalStorage (Draft) → Auto-save → Recovery
```

### **Key Features**
- **97 Survey Questions** across 4 dimensions (Physical, Mental, Social, Environmental)
- **Multi-step Forms** with progress tracking
- **Auto-save & Recovery** with localStorage
- **Real-time Data Sync** via Supabase
- **Role-based Access** with RLS policies
- **PDF Generation** for reports
- **E2E Automation** with Playwright

---

## 🚀 6. Development Commands (คำสั่งที่ใช้บ่อย)

### **Development**
```bash
npm run dev                    # Start development server
npm run sync:questions         # Validate canonical wellbeing schema
npm run sync:all               # Build schema report + cache helpers
npm run watch:questions        # Watch canonical wellbeing schema
npm run test:public-survey    # Run E2E tests
```

### **Database**
```bash
npm run supabase:test         # Test database connection
npm run supabase:stats        # Database statistics
npm run supabase:export       # Export data
```

### **Deployment**
```bash
npm run deploy               # Deploy to production
npm run deploy:preview       # Deploy preview
```

---

## 📋 7. Survey Structure (โครงสร้างแบบสำรวจ)

### **Well-being Dimensions (4 มิติ)**
1. **Physical** (กายภาพ) - Personal Info, Body Measurements
2. **Mental** (จิตใจ) - TMHI-15, Stress Assessment
3. **Social** (สังคม) - UCLA Loneliness Scale, Social Support
4. **Environment** (สิ่งแวดล้อม) - Workplace, Pollution, Safety

### **Question Types**
- `radio` - เลือกข้อเดียว
- `checkbox` - เลือกได้หลายข้อ
- `scale` - มาตราส่วน (1-5)
- `time` - ชั่วโมง:นาที
- `number` - ตัวเลข
- `text` - ข้อความ

### **Special Features**
- **"อื่น ๆ (ระบุ)"** พร้อมช่องกรอกข้อความ
- **Conditional Logic** แสดง/ซ่อนคำถาม
- **Progress Tracking** แสดงความคืบหน้า
- **Validation** ตรวจสอบความสมบูรณ์

---

## 🔐 8. Security & Permissions (ความปลอดภัยและสิทธิ์)

### **Authentication**
- **Supabase Auth** สำหรับ Admin Portal
- **Organization Links** สำหรับ Public Survey
- **Session Management** พร้อม timeout

### **Row Level Security (RLS)**
- **Survey Responses:** Users can only see their own data
- **Admin Access:** Role-based permissions
- **Organization Data:** Isolated by organization code

### **Data Protection**
- **Input Validation:** Sanitize all user inputs
- **XSS Protection:** Content Security Policy headers
- **HTTPS Only:** Secure connections only
- **Data Encryption:** Supabase handles encryption

---

## 📈 9. Performance Optimization (การปรับปรุงประสิทธิภาพ)

### **Caching Strategy**
- **Service Worker:** Versioned cache (v3.4)
- **Browser Cache:** Static assets cached
- **Supabase Cache:** Query results cached
- **CDN:** Vercel Edge Network

### **Load Performance**
- **Lazy Loading:** Components loaded on demand
- **Code Splitting:** Separate JS files per feature
- **Image Optimization:** Compressed images
- **Minification:** CSS/JS minified in production

---

## 🎯 10. Best Practices (แนวทางปฏิบัติที่ดีที่สุด)

### **Code Quality**
- **Single Source of Truth:** `data/questions-wellbeing.json`
- **Consistent Naming:** English variables, Thai comments
- **Error Handling:** Try-catch blocks everywhere
- **Documentation:** Clear function comments

### **User Experience**
- **Progressive Enhancement:** Works without JavaScript
- **Mobile First:** Responsive design
- **Accessibility:** ARIA labels, semantic HTML
- **Thai Language:** All user-facing text in Thai

### **Maintainability**
- **Modular Architecture:** Separate concerns
- **Version Control:** Clear commit messages
- **Testing:** E2E automation
- **Monitoring:** Error tracking and logging

---

**📝 สรุป:** โปรเจกต์นี้ใช้ Vanilla JavaScript + Supabase + Vercel ในการสร้างระบบสำรวจสุขภาวะบุคลากรครบชุด โดยเน้นความเสถียร ความปลอดภัย และประสบการณ์ผู้ใช้ที่ดี พร้อมรองรับการขยายตัวในอนาคตครับ! 🚀✅
