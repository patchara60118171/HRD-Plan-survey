/* ========== ADMIN PORTAL — CONFIG & STATE ========== */
const SUPABASE_URL = 'https://fgdommhiqhzvsedfzyrr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZG9tbWhpcWh6dnNlZGZ6eXJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMzY2MzUsImV4cCI6MjA4NDkxMjYzNX0.GFMOeDArhq-9lPt39OizkBOFFgK4TDpVDJrk_HRQ6Xc';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const SURVEY_BASE_URL = PROJECT_SSOT?.constants?.surveyBaseUrl || 'https://nidawellbeing.vercel.app';
const LOCKED_SUPERADMIN_EMAILS = PROJECT_SSOT?.constants?.lockedSuperadminEmails || ['admin@gmail.com'];
const ORG_HR_EMAIL_DOMAIN = PROJECT_SSOT?.constants?.orgHrEmailDomain || '@wellbeing.go.th';

 const titles = {
  dashboard:['Dashboard ภาพรวม','/ ภาพรวม'],
  progress:['สถานะการส่งข้อมูล','/ ติดตามความคืบหน้า'],
  timeline:['Timeline โครงการ','/ ภาพรวม'],
  orgs:['องค์กรที่เข้าร่วม','/ จัดการข้อมูล'],
  'form-ch1':['ฟอร์ม Ch1','/ จัดการข้อมูล'],
  'form-wb':['Wellbeing Survey','/ จัดการข้อมูล'],
  'ch1-summary':['สรุปภาพรวม Ch1','/ วิเคราะห์ข้อมูล'],
  'an-wb':['วิเคราะห์ Wellbeing','/ วิเคราะห์'],
  compare:['เปรียบเทียบองค์กร','/ วิเคราะห์'],
  export:['Export รายงาน','/ วิเคราะห์'],
  'org-credentials':['Org HR Credentials','/ จัดการระบบ'],
  'form-editor':['แก้ไขเนื้อหาฟอร์ม','/ จัดการระบบ'],
};

// ORG_NAMES and ORG_LOOKUP are populated at runtime from Supabase organizations table
// via refreshOrgDerivedState() in data.js after loadBackend() completes.
// Do NOT hardcode org data here — Supabase is the single source of truth.
let ORG_NAMES = [];
let ORG_LOOKUP = new Map();
const state = {
  session: null,
  surveyRows: [],
  ch1Rows: [],
  linkRows: [],
  userRows: [],
  orgHrCredentials: [],
  orgProfiles: [],
  orgSelectedName: '',
  rawFiltered: [],
  rawPage: 1,
  rawPageSize: 50,
};
