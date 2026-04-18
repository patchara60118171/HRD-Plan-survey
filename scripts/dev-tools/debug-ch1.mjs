import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fgdommhiqhzvsedfzyrr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZG9tbWhpcWh6dnNlZGZ6eXJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMzY2MzUsImV4cCI6MjA4NDkxMjYzNX0.GFMOeDArhq-9lPt39OizkBOFFgK4TDpVDJrk_HRQ6Xc';

const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const CANONICAL_ORGS = [
  { code: 'nesdc', name: 'สำนักงานสภาพัฒนาการเศรษฐกิจและสังคมแห่งชาติ' },
  { code: 'tpso',  name: 'สำนักงานนโยบายและยุทธศาสตร์การค้า' },
  { code: 'dss',   name: 'กรมวิทยาศาสตร์บริการ' },
  { code: 'dhss',  name: 'กรมสนับสนุนบริการสุขภาพ' },
  { code: 'tmd',   name: 'กรมอุตุนิยมวิทยา' },
  { code: 'dcp',   name: 'กรมส่งเสริมวัฒนธรรม' },
  { code: 'dop',   name: 'กรมคุมประพฤติ' },
  { code: 'mots',  name: 'สำนักงานปลัดกระทรวงการท่องเที่ยวและกีฬา' },
  { code: 'dmh',   name: 'กรมสุขภาพจิต' },
  { code: 'onep',  name: 'สำนักงานนโยบายและแผนทรัพยากรธรรมชาติและสิ่งแวดล้อม' },
  { code: 'nrct',  name: 'สำนักงานการวิจัยแห่งชาติ' },
  { code: 'acfs',  name: 'สำนักงานมาตรฐานสินค้าเกษตรและอาหารแห่งชาติ' },
  { code: 'opdc',  name: 'สำนักงานคณะกรรมการพัฒนาระบบราชการ' },
  { code: 'rid',   name: 'กรมชลประทาน' },
  { code: 'dcy',   name: 'กรมกิจการเด็กและเยาวชน' },
];

async function main() {
  console.log('=== hrd_ch1_responses ===');
  // First: peek at schema
  const { data: peek, error: peekErr } = await sb.from('hrd_ch1_responses').select('*').limit(1);
  if (peekErr) { console.error('ERROR:', peekErr.message); return; }
  if (peek.length > 0) {
    console.log('Schema columns:', Object.keys(peek[0]).join(', '));
    console.log('');
  }

  const { data: ch1, error: e1 } = await sb.from('hrd_ch1_responses').select('*');
  if (e1) { console.error('ERROR:', e1.message); return; }

  console.log(`Total records: ${ch1.length}`);
  console.log('');

  const codeMap = new Map(CANONICAL_ORGS.map(o => [o.code, o.name]));
  const nameSet = new Set(CANONICAL_ORGS.map(o => o.name));

  const results = ch1.map(row => {
    const fd = row.form_data || {};
    const orgCode = String(row.org_code || fd.org_code || '').toLowerCase();
    const orgName = row.organization || row.org_name_th || row.agency_name
                 || fd.agency_name || fd.organization || fd.org_name || fd.org_name_th || '—';
    const isTest = orgCode === 'test-org' || orgName.includes('ทดสอบระบบ');
    const nameMatch = nameSet.has(orgName);
    const codeMatch = codeMap.has(orgCode);
    const resolvedName = nameMatch ? orgName : (codeMap.get(orgCode) || 'NO_MATCH');
    return { id: String(row.id).slice(0,8), orgCode, orgName, isTest, nameMatch, codeMatch, resolvedName };
  });

  console.log(`${'ID'.padEnd(10)} ${'org_code'.padEnd(12)} ${'orgName'.padEnd(55)} ${'resolved'.padEnd(20)} match`);
  console.log('─'.repeat(110));
  results.forEach(r => {
    const flag = r.isTest ? 'TEST' : r.resolvedName === 'NO_MATCH' ? '❌' : '✅';
    console.log(`${r.id.padEnd(10)} ${r.orgCode.padEnd(12)} ${r.orgName.slice(0,53).padEnd(55)} ${r.resolvedName.slice(0,18).padEnd(20)} ${flag}`);
  });

  const realRows = results.filter(r => !r.isTest);
  const matched  = realRows.filter(r => r.resolvedName !== 'NO_MATCH');
  const unmatched = realRows.filter(r => r.resolvedName === 'NO_MATCH');
  console.log(`\nReal rows (excl. test): ${realRows.length}`);
  console.log(`Matched to catalog:     ${matched.length}`);
  console.log(`UNMATCHED (จะไม่นับ):    ${unmatched.length}`);
  if (unmatched.length) {
    console.log('\nUnmatched:');
    unmatched.forEach(r => console.log(`  org_code="${r.orgCode}"  orgName="${r.orgName}"`));
  }

  const orgsWithCh1 = new Set(matched.map(r => r.resolvedName));
  console.log(`\nOrgs with Ch1: ${orgsWithCh1.size} / ${CANONICAL_ORGS.length}`);
  console.log('\nMissing (ยังไม่ส่ง):');
  CANONICAL_ORGS.forEach(o => {
    if (!orgsWithCh1.has(o.name)) console.log(`  ❌ ${o.name} (${o.code})`);
  });
}

main();
