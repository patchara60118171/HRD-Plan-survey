require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const rows = [
  { org_code: 'DCY', org_name_th: 'กรมกิจการเด็กและเยาวชน', contact_email: 'pattanahrd@gmail.com', settings: { ministry: 'พม.', salutation: 'อธิบดีกรมกิจการเด็กและเยาวชน', saraban_email: 'saraban@dcy.go.th', coordinator_name: 'นายภาณุวัฒน์ ดีเลิศ', coordinator_position: 'เจ้าพนักงานธุรการปฏิบัติงาน', coordinator_contact_line: 'bombayfc606', coordinator_email: 'pattanahrd@gmail.com' } },
  { org_code: 'PROB', org_name_th: 'กรมคุมประพฤติ', contact_email: 'jmonthen@gmail.com', settings: { ministry: 'ยุติธรรม', salutation: 'อธิบดีกรมคุมประพฤติ', saraban_email: 'saraban@probation.mail.go.th', coordinator_name: 'นางสาวจิรา  มณเฑียร', coordinator_position: 'นักทรัพยากรบุคคลชำนาญการพิเศษ', coordinator_contact_line: '0818085635 / poundboy', coordinator_email: 'jmonthen@gmail.com' } },
  { org_code: 'RID', org_name_th: 'กรมชลประทาน', contact_email: 'sombun76@gmail.com', settings: { ministry: 'เกษตรฯ', salutation: 'อธิบดีกรมชลประทาน', saraban_email: 'saraban@rid.go.th', coordinator_name: 'นายสมบุญ ศรีเมือง', coordinator_position: 'ผู้อำนวยการส่วนสวัสดิการและพัฒนาคุณภาพชีวิต', coordinator_contact_line: '0851146480 / sombun76', coordinator_email: 'sombun76@gmail.com' } },
  { org_code: 'DSS', org_name_th: 'กรมวิทยาศาสตร์บริการ', contact_email: 'juntarama@yahoo.com', settings: { ministry: 'อว.', salutation: 'อธิบดีกรมวิทยาศาสตร์บริการ', saraban_email: 'saraban@dss.go.th', coordinator_name: 'ดร.จิราภรณ์  บุราคร', coordinator_position: 'นักวิทยาศาสตร์เชี่ยวชาญ', coordinator_contact_line: '0659875854 / 0659875854', coordinator_email: 'juntarama@yahoo.com' } },
  { org_code: 'DCP', org_name_th: 'กรมส่งเสริมวัฒนธรรม', contact_email: 'hrd.dcp2023@gmail.com', settings: { ministry: 'วัฒนธรรม', salutation: 'อธิบดีกรมส่งเสริมวัฒนธรรม', saraban_email: 'saraban@culture.mail.go.th', coordinator_name: 'พิชชาภา เจริญพระ', coordinator_position: 'นักวิชาการวัฒนธรรมปฏิบัติการ', coordinator_contact_line: 'pitchapap_', coordinator_email: 'hrd.dcp2023@gmail.com' } },
  { org_code: 'DMH', org_name_th: 'กรมสุขภาพจิต', contact_email: 'ya.watanya@gmail.com', settings: { ministry: 'สาธารณสุข', salutation: 'อธิบดีกรมสุขภาพจิต', saraban_email: 'saraban@dmh.mail.go.th', coordinator_name: 'นางสาววธัญญา สนธิพันธ์', coordinator_position: 'นักทรัพยากรบุคคล', coordinator_contact_line: '090-2854793', coordinator_email: 'ya.watanya@gmail.com' } },
  { org_code: 'TMD', org_name_th: 'กรมอุตุนิยมวิทยา', contact_email: 'phanumat.lew@gmail.com', settings: { ministry: 'ดิจิทัลฯ', salutation: 'อธิบดีกรมอุตุนิยมวิทยา', saraban_email: 'saraban@tmd.mail.go.th', coordinator_name: 'นางภานุมาศ ลิ่วเจริญทรัพย์', coordinator_position: 'นักทรัพยากรบุคคลชำนาญการพิเศษ', coordinator_contact_line: '086-9828347', coordinator_email: 'phanumat.lew@gmail.com' } },
  { org_code: 'BOB', org_name_th: 'สำนักงบประมาณ', contact_email: 'chalermpong.k@bb.go.th', settings: { ministry: 'สำนักนายกฯ', salutation: 'ผู้อำนวยการสำนักงบประมาณ', saraban_email: 'saraban@bb.go.th', coordinator_name: 'นายเฉลิมพงษ์ ขวดแก้ว', coordinator_position: 'นักทรัพยากรบุคคลชำนาญการ', coordinator_contact_line: '02-2787-000 ต่อ 1121 / id line guggsan', coordinator_email: 'chalermpong.k@bb.go.th' } },
  { org_code: 'OPDC', org_name_th: 'สำนักงาน กพร.', contact_email: 'napruet.v@opdc.go.th', settings: { ministry: 'สำนักนายกฯ', salutation: 'เลขาธิการคณะกรรมการพัฒนาระบบราชการ', saraban_email: 'saraban@opdc.go.th', coordinator_name: 'ณพฤธ วีระกรพานิช', coordinator_position: 'นักพัฒนาระบบราชการปฏิบัติการ', coordinator_contact_line: '0 2356 9999 ต่อ 8796', coordinator_email: 'napruet.v@opdc.go.th' } },
  { org_code: 'NRCT', org_name_th: 'สำนักงานการวิจัยแห่งชาติ', contact_email: 'subhakorn.m@nrct.go.th', settings: { ministry: 'อว.', salutation: 'ผู้อำนวยการสำนักงานการวิจัยแห่งชาติ', saraban_email: 'saraban@nrct.go.th', coordinator_name: 'นายศุภกร มณีนิล', coordinator_position: 'นักวิเคราะห์นโยบายและแผนชำนาญการพิเศษ', coordinator_contact_line: 'artnrct28', coordinator_email: 'subhakorn.m@nrct.go.th' } },
  { org_code: 'ONEP', org_name_th: 'สำนักงานนโยบายและแผนทรัพยากรธรรมชาติและสิ่งแวดล้อม', contact_email: 'hronep@gmail.com', settings: { ministry: 'ทรัพยากรฯ', salutation: 'เลขาธิการสำนักงานนโยบายและแผนทรัพยากรธรรมชาติและสิ่งแวดล้อม', saraban_email: 'saraban@onep.go.th', coordinator_name: 'นางสาวอักษิพร จันทร์เทวี', coordinator_position: 'นักทรัพยากรบุคคลปฏิบัติการ', coordinator_contact_line: '02-2656524', coordinator_email: 'hronep@gmail.com' } },
  { org_code: 'TPSO', org_name_th: 'สำนักงานนโยบายและยุทธศาสตร์การค้า', contact_email: 'penvana.p@gmail.com', settings: { ministry: 'พาณิชย์', salutation: 'ผู้อำนวยการสำนักงานนโยบายและยุทธศาสตร์การค้า', saraban_email: 'saraban-tpso@moc.go.th', coordinator_name: 'นางสาวเพ็ญวนา ปรานสุจริต', coordinator_position: 'นักวิชาการพาณิชย์ชำนาญการ', coordinator_contact_line: '0864155818, penvana', coordinator_email: 'penvana.p@gmail.com' } },
  { org_code: 'MOTS', org_name_th: 'สำนักงานปลัดกระทรวงการท่องเที่ยวและกีฬา', contact_email: 'hrd@mots.go.th', settings: { ministry: 'ท่องเที่ยวฯ', salutation: 'ปลัดกระทรวงการท่องเที่ยวและกีฬา', saraban_email: 'saraban@mots.go.th', coordinator_name: 'นางสาวสุวรรณา หาญชนะ', coordinator_position: 'นักทรัพยากรบุคคลชำนาญการ', coordinator_contact_line: '089-8473149', coordinator_email: 'hrd@mots.go.th' } },
  { org_code: 'ACFS', org_name_th: 'สำนักงานมาตรฐานสินค้าเกษตรและอาหารแห่งชาติ', contact_email: 'hrd.acfs@gmail.com', settings: { ministry: 'เกษตรฯ', salutation: 'เลขาธิการสำนักงานมาตรฐานสินค้าเกษตรและอาหารแห่งชาติ', saraban_email: 'saraban@acfs.go.th', coordinator_name: 'นายอนุวัตร วิสุทธิสมาจาร', coordinator_position: 'นักทรัพยากรบุคคลปฏิบัติการ', coordinator_contact_line: '086-4107372', coordinator_email: 'hrd.acfs@gmail.com' } },
  { org_code: 'NESDC', org_name_th: 'สำนักงานสภาพัฒนาการเศรษฐกิจและสังคมแห่งชาติ', contact_email: 'natthiyaporn.ph@gmail.com', settings: { ministry: 'สำนักนายกฯ', salutation: 'เลขาธิการสภาพัฒนาการเศรษฐกิจและสังคมแห่งชาติ', saraban_email: 'saraban@nesdc.go.th', coordinator_name: 'นางสาวณัฐติยาภรณ์  พันธนาม', coordinator_position: 'นักวิเคราะห์นโยบายและแผนปฏิบัติการ', coordinator_contact_line: '02 280 4085 ต่อ 5442 / n-kate', coordinator_email: 'natthiyaporn.ph@gmail.com' } },
];

async function main() {
  for (const row of rows) {
    const { data: existing, error: findError } = await supabase
      .from('organizations')
      .select('id')
      .eq('org_name_th', row.org_name_th)
      .maybeSingle();

    if (findError) throw findError;

    if (existing?.id) {
      const { error } = await supabase
        .from('organizations')
        .update({
          org_code: row.org_code,
          contact_email: row.contact_email,
          org_type: 'government',
          is_active: true,
          settings: row.settings,
        })
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('organizations')
        .insert({
          org_code: row.org_code,
          org_name_th: row.org_name_th,
          org_type: 'government',
          contact_email: row.contact_email,
          is_active: true,
          settings: row.settings,
        });
      if (error) throw error;
    }
  }

  const { count, error } = await supabase
    .from('organizations')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  if (error) throw error;
  console.log(`ORG_SEED_OK: active organizations=${count}`);
}

main().catch((error) => {
  console.error('ORG_SEED_ERROR:', error.message);
  process.exit(1);
});
