/* ========== ADMIN PORTAL — CONFIG & STATE ========== */
const SUPABASE_URL = 'https://fgdommhiqhzvsedfzyrr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZG9tbWhpcWh6dnNlZGZ6eXJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMzY2MzUsImV4cCI6MjA4NDkxMjYzNX0.GFMOeDArhq-9lPt39OizkBOFFgK4TDpVDJrk_HRQ6Xc';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const titles = {
  dashboard:['Dashboard ภาพรวม','/ ภาพรวม'],
  progress:['สถานะการส่งข้อมูล','/ ติดตามความคืบหน้า'],
  timeline:['Timeline โครงการ','/ ภาพรวม'],
  orgs:['องค์กรที่เข้าร่วม','/ จัดการข้อมูล'],
  'form-ch1':['ฟอร์ม Ch1','/ จัดการข้อมูล'],
  'form-wb':['Wellbeing Survey','/ จัดการข้อมูล'],
  'ch1-summary':['สรุปภาพรวม Ch1','/ วิเคราะห์ข้อมูล'],
  'an-ch1':['วิเคราะห์ผล Ch1','/ วิเคราะห์'],
  'an-wb':['วิเคราะห์ Wellbeing','/ วิเคราะห์'],
  compare:['เปรียบเทียบองค์กร','/ วิเคราะห์'],
  export:['Export รายงาน','/ วิเคราะห์'],
  users:['จัดการผู้ใช้ / Viewer','/ จัดการระบบ'],
  links:['ลิงก์แบบสอบถาม','/ จัดการระบบ'],
  notif:['Reminder / แจ้งเตือน','/ จัดการระบบ'],
  settings:['ตั้งค่าระบบ','/ จัดการระบบ'],
  audit:['Audit Log','/ จัดการระบบ'],
  'form-editor':['แก้ไขเนื้อหาฟอร์ม','/ จัดการระบบ'],
};

const ORG_META = [
  { name:'สำนักงานสภาพัฒนาการเศรษฐกิจและสังคมแห่งชาติ', ministry:'สำนักนายกฯ', code:'NESDC', letter:'เลขาธิการสภาพัฒนาการเศรษฐกิจและสังคมแห่งชาติ', email:'saraban@nesdc.go.th', contact:'นางสาวณัฐติยาภรณ์  พันธนาม', contactRole:'นักวิเคราะห์นโยบายและแผนปฏิบัติการ', contactPhone:'02 280 4085 ต่อ 5442', contactLine:'n-kate', contactEmail:'natthiyaporn.ph@gmail.com' },
  { name:'สำนักงานนโยบายและยุทธศาสตร์การค้า', ministry:'พาณิชย์', code:'TPSO', letter:'ผู้อำนวยการสำนักงานนโยบายและยุทธศาสตร์การค้า', email:'saraban-tpso@moc.go.th', contact:'นางสาวเพ็ญวนา  ปรานสุจริต', contactRole:'นักวิชาการพาณิชย์ชำนาญการ', contactPhone:'0864155818', contactLine:'penvana', contactEmail:'penvana.p@gmail.com' },
  { name:'กรมวิทยาศาสตร์บริการ', ministry:'อว.', code:'DSS', letter:'อธิบดีกรมวิทยาศาสตร์บริการ', email:'saraban@dss.go.th', contact:'ดร.จิราภรณ์  บุราคร', contactRole:'นักวิทยาศาสตร์เชี่ยวชาญ', contactPhone:'0659875854', contactLine:'0659875854', contactEmail:'juntarama@yahoo.com' },
  { name:'กรมสนับสนุนบริการสุขภาพ', ministry:'สำนักนายกฯ', code:'BOB', letter:'ผู้อำนวยการกรมสนับสนุนบริการสุขภาพ', email:'saraban@bb.go.th', contact:'นายเฉลิมพงษ์ ขวดแก้ว', contactRole:'นักทรัพยากรบุคคลชำนาญการ', contactPhone:'02-2787-000 ต่อ 1121', contactLine:'guggsan', contactEmail:'chalermpong.k@bb.go.th' },
  { name:'กรมอุตุนิยมวิทยา', ministry:'ดิจิทัลฯ', code:'TMD', letter:'อธิบดีกรมอุตุนิยมวิทยา', email:'saraban@tmd.mail.go.th', contact:'นางภานุมาศ ลิ่วเจริญทรัพย์', contactRole:'นักทรัพยากรบุคคลชำนาญการพิเศษ', contactPhone:'869828347', contactLine:'869828347', contactEmail:'phanumat.lew@gmail.com' },
  { name:'กรมส่งเสริมวัฒนธรรม', ministry:'วัฒนธรรม', code:'DCP', letter:'อธิบดีกรมส่งเสริมวัฒนธรรม', email:'saraban@culture.mail.go.th', contact:'พิชชาภา เจริญพระ', contactRole:'นักวิชาการวัฒนธรรมปฏิบัติการ', contactPhone:'—', contactLine:'pitchapap_', contactEmail:'hrd.dcp2023@gmail.com' },
  { name:'กรมคุมประพฤติ', ministry:'ยุติธรรม', code:'PROB', letter:'อธิบดีกรมคุมประพฤติ', email:'saraban@probation.mail.go.th', contact:'นางสาวจิรา  มณเฑียร', contactRole:'นักทรัพยากรบุคคลชำนาญการพิเศษ', contactPhone:'0818085635', contactLine:'poundboy', contactEmail:'jmonthen@gmail.com' },
  { name:'สำนักงานปลัดกระทรวงการท่องเที่ยวและกีฬา', ministry:'ท่องเที่ยวฯ', code:'MOTS', letter:'ปลัดกระทรวงการท่องเที่ยวและกีฬา', email:'saraban@mots.go.th', contact:'นางสาวสุวรรณา หาญชนะ', contactRole:'นักทรัพยากรบุคคลชำนาญการ', contactPhone:'898473149', contactLine:'898473149', contactEmail:'hrd@mots.go.th' },
  { name:'กรมสุขภาพจิต', ministry:'สาธารณสุข', code:'DMH', letter:'อธิบดีกรมสุขภาพจิต', email:'saraban@dmh.mail.go.th', contact:'นางสาววธัญญา สนธิพันธ์', contactRole:'นักทรัพยากรบุคคล', contactPhone:'902854793', contactLine:'902854793', contactEmail:'ya.watanya@gmail.com' },
  { name:'สำนักงานนโยบายและแผนทรัพยากรธรรมชาติและสิ่งแวดล้อม', ministry:'ทรัพยากรฯ', code:'ONEP', letter:'เลขาธิการสำนักงานนโยบายและแผนทรัพยากรธรรมชาติและสิ่งแวดล้อม', email:'saraban@onep.go.th', contact:'นางสาวอักษิพร จันทร์เทวี', contactRole:'นักทรัพยากรบุคคลปฏิบัติการ', contactPhone:'22656524', contactLine:'22656524', contactEmail:'hronep@gmail.com' },
  { name:'สำนักงานการวิจัยแห่งชาติ', ministry:'อว.', code:'NRCT', letter:'ผู้อำนวยการสำนักงานการวิจัยแห่งชาติ', email:'saraban@nrct.go.th', contact:'นายศุภกร มณีนิล', contactRole:'นักวิเคราะห์นโยบายและแผนชำนาญการพิเศษ', contactPhone:'—', contactLine:'artnrct28', contactEmail:'subhakorn.m@nrct.go.th' },
  { name:'สำนักงานมาตรฐานสินค้าเกษตรและอาหารแห่งชาติ', ministry:'เกษตรฯ', code:'ACFS', letter:'เลขาธิการสำนักงานมาตรฐานสินค้าเกษตรและอาหารแห่งชาติ', email:'saraban@acfs.go.th', contact:'นายอนุวัตร วิสุทธิสมาจาร', contactRole:'นักทรัพยากรบุคคลปฏิบัติการ', contactPhone:'864107372', contactLine:'864107372', contactEmail:'hrd.acfs@gmail.com' },
  { name:'สำนักงาน กพร.', ministry:'สำนักนายกฯ', code:'OPDC', letter:'เลขาธิการคณะกรรมการพัฒนาระบบราชการ', email:'saraban@opdc.go.th', contact:'ณพฤธ วีระกรพานิช', contactRole:'นักพัฒนาระบบราชการปฏิบัติการ', contactPhone:'0 2356 9999 ต่อ 8796', contactLine:'—', contactEmail:'napruet.v@opdc.go.th' },
  { name:'กรมชลประทาน', ministry:'เกษตรฯ', code:'RID', letter:'อธิบดีกรมชลประทาน', email:'saraban@rid.go.th', contact:'นายสมบุญ ศรีเมือง', contactRole:'ผู้อำนวยการส่วนสวัสดิการและพัฒนาคุณภาพชีวิต', contactPhone:'0851146480', contactLine:'sombun76', contactEmail:'sombun76@gmail.com' },
  { name:'กรมกิจการเด็กและเยาวชน', ministry:'พม.', code:'DCY', letter:'อธิบดีกรมกิจการเด็กและเยาวชน', email:'saraban@dcy.go.th', contact:'นายภาณุวัฒน์ ดีเลิศ', contactRole:'เจ้าพนักงานธุรการปฏิบัติงาน', contactPhone:'—', contactLine:'bombayfc606', contactEmail:'pattanahrd@gmail.com' },
];

let ORG_NAMES = ORG_META.map((org) => org.name);
let ORG_LOOKUP = new Map(ORG_META.map((org) => [org.name, org]));
const state = {
  session: null,
  surveyRows: [],
  ch1Rows: [],
  linkRows: [],
  userRows: [],
  orgProfiles: [],
  orgSelectedName: '',
  rawFiltered: [],
  rawPage: 1,
  rawPageSize: 50,
};
