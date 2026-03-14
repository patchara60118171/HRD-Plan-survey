-- =====================================================
-- Organization master profiles for admin organization page
-- Date: 2026-03-14
-- =====================================================

create table if not exists public.organization_profiles (
    id uuid primary key default gen_random_uuid(),
    organization_name text not null unique,
    ministry text,
    org_code text,
    salutation text not null,
    saraban_email text not null,
    coordinator_name text not null,
    coordinator_position text not null,
    coordinator_contact_line text not null,
    coordinator_email text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_organization_profiles_name on public.organization_profiles(organization_name);

insert into public.organization_profiles (
    organization_name, ministry, org_code, salutation, saraban_email,
    coordinator_name, coordinator_position, coordinator_contact_line, coordinator_email
)
values
    ('กรมกิจการเด็กและเยาวชน', 'พม.', 'DCY', 'อธิบดีกรมกิจการเด็กและเยาวชน', 'saraban@dcy.go.th', 'นายภาณุวัฒน์ ดีเลิศ', 'เจ้าพนักงานธุรการปฏิบัติงาน', 'bombayfc606', 'pattanahrd@gmail.com'),
    ('กรมคุมประพฤติ', 'ยุติธรรม', 'PROB', 'อธิบดีกรมคุมประพฤติ', 'saraban@probation.mail.go.th', 'นางสาวจิรา  มณเฑียร', 'นักทรัพยากรบุคคลชำนาญการพิเศษ', '0818085635 / poundboy', 'jmonthen@gmail.com'),
    ('กรมชลประทาน', 'เกษตรฯ', 'RID', 'อธิบดีกรมชลประทาน', 'saraban@rid.go.th', 'นายสมบุญ ศรีเมือง', 'ผู้อำนวยการส่วนสวัสดิการและพัฒนาคุณภาพชีวิต', '0851146480 / sombun76', 'sombun76@gmail.com'),
    ('กรมวิทยาศาสตร์บริการ', 'อว.', 'DSS', 'อธิบดีกรมวิทยาศาสตร์บริการ', 'saraban@dss.go.th', 'ดร.จิราภรณ์  บุราคร', 'นักวิทยาศาสตร์เชี่ยวชาญ', '0659875854 / 0659875854', 'juntarama@yahoo.com'),
    ('กรมส่งเสริมวัฒนธรรม', 'วัฒนธรรม', 'DCP', 'อธิบดีกรมส่งเสริมวัฒนธรรม', 'saraban@culture.mail.go.th', 'พิชชาภา เจริญพระ', 'นักวิชาการวัฒนธรรมปฏิบัติการ', 'pitchapap_', 'hrd.dcp2023@gmail.com'),
    ('กรมสุขภาพจิต', 'สาธารณสุข', 'DMH', 'อธิบดีกรมสุขภาพจิต', 'saraban@dmh.mail.go.th', 'นางสาววธัญญา สนธิพันธ์', 'นักทรัพยากรบุคคล', '090-2854793', 'ya.watanya@gmail.com'),
    ('กรมอุตุนิยมวิทยา', 'ดิจิทัลฯ', 'TMD', 'อธิบดีกรมอุตุนิยมวิทยา', 'saraban@tmd.mail.go.th', 'นางภานุมาศ ลิ่วเจริญทรัพย์', 'นักทรัพยากรบุคคลชำนาญการพิเศษ', '086-9828347', 'phanumat.lew@gmail.com'),
    ('สำนักงบประมาณ', 'สำนักนายกฯ', 'BOB', 'ผู้อำนวยการสำนักงบประมาณ', 'saraban@bb.go.th', 'นายเฉลิมพงษ์ ขวดแก้ว', 'นักทรัพยากรบุคคลชำนาญการ', '02-2787-000 ต่อ 1121 / id line guggsan', 'chalermpong.k@bb.go.th'),
    ('สำนักงาน กพร.', 'สำนักนายกฯ', 'OPDC', 'เลขาธิการคณะกรรมการพัฒนาระบบราชการ', 'saraban@opdc.go.th', 'ณพฤธ วีระกรพานิช', 'นักพัฒนาระบบราชการปฏิบัติการ', '0 2356 9999 ต่อ 8796', 'napruet.v@opdc.go.th'),
    ('สำนักงานการวิจัยแห่งชาติ', 'อว.', 'NRCT', 'ผู้อำนวยการสำนักงานการวิจัยแห่งชาติ', 'saraban@nrct.go.th', 'นายศุภกร มณีนิล', 'นักวิเคราะห์นโยบายและแผนชำนาญการพิเศษ', 'artnrct28', 'subhakorn.m@nrct.go.th'),
    ('สำนักงานนโยบายและแผนทรัพยากรธรรมชาติและสิ่งแวดล้อม', 'ทรัพยากรฯ', 'ONEP', 'เลขาธิการสำนักงานนโยบายและแผนทรัพยากรธรรมชาติและสิ่งแวดล้อม', 'saraban@onep.go.th', 'นางสาวอักษิพร จันทร์เทวี', 'นักทรัพยากรบุคคลปฏิบัติการ', '02-2656524', 'hronep@gmail.com'),
    ('สำนักงานนโยบายและยุทธศาสตร์การค้า', 'พาณิชย์', 'TPSO', 'ผู้อำนวยการสำนักงานนโยบายและยุทธศาสตร์การค้า', 'saraban-tpso@moc.go.th', 'นางสาวเพ็ญวนา ปรานสุจริต', 'นักวิชาการพาณิชย์ชำนาญการ', '0864155818, penvana', 'penvana.p@gmail.com'),
    ('สำนักงานปลัดกระทรวงการท่องเที่ยวและกีฬา', 'ท่องเที่ยวฯ', 'MOTS', 'ปลัดกระทรวงการท่องเที่ยวและกีฬา', 'saraban@mots.go.th', 'นางสาวสุวรรณา หาญชนะ', 'นักทรัพยากรบุคคลชำนาญการ', '089-8473149', 'hrd@mots.go.th'),
    ('สำนักงานมาตรฐานสินค้าเกษตรและอาหารแห่งชาติ', 'เกษตรฯ', 'ACFS', 'เลขาธิการสำนักงานมาตรฐานสินค้าเกษตรและอาหารแห่งชาติ', 'saraban@acfs.go.th', 'นายอนุวัตร วิสุทธิสมาจาร', 'นักทรัพยากรบุคคลปฏิบัติการ', '086-4107372', 'hrd.acfs@gmail.com'),
    ('สำนักงานสภาพัฒนาการเศรษฐกิจและสังคมแห่งชาติ', 'สำนักนายกฯ', 'NESDC', 'เลขาธิการสภาพัฒนาการเศรษฐกิจและสังคมแห่งชาติ', 'saraban@nesdc.go.th', 'นางสาวณัฐติยาภรณ์  พันธนาม', 'นักวิเคราะห์นโยบายและแผนปฏิบัติการ', '02 280 4085 ต่อ 5442 / n-kate', 'natthiyaporn.ph@gmail.com')
on conflict (organization_name) do update
set
    ministry = excluded.ministry,
    org_code = excluded.org_code,
    salutation = excluded.salutation,
    saraban_email = excluded.saraban_email,
    coordinator_name = excluded.coordinator_name,
    coordinator_position = excluded.coordinator_position,
    coordinator_contact_line = excluded.coordinator_contact_line,
    coordinator_email = excluded.coordinator_email,
    updated_at = now();

alter table public.organization_profiles enable row level security;

grant select, insert, update, delete on public.organization_profiles to authenticated;

drop policy if exists "Read organization profiles authenticated" on public.organization_profiles;
drop policy if exists "Manage organization profiles admins" on public.organization_profiles;

create policy "Read organization profiles authenticated"
on public.organization_profiles
for select
to authenticated
using (true);

create policy "Manage organization profiles admins"
on public.organization_profiles
for all
to authenticated
using (public.requester_is_admin())
with check (public.requester_is_admin());

comment on table public.organization_profiles is
'Organization directory master used by admin organizations page (view/edit/add).';
