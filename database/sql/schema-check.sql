SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict YqdP75OIzmP7DFmQPRDzZ8QS1xeoD0CA96qSUCbAvpK4lfvwmY8b2wDwp7RFSQI

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: admin_audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."organizations" ("id", "org_code", "org_name_th", "org_name_en", "org_type", "contact_email", "is_active", "logo_url", "settings", "created_at", "updated_at", "is_test", "ministry", "salutation", "saraban_email", "coordinator_name", "coordinator_position", "coordinator_contact_line", "coordinator_email", "display_order", "show_in_dashboard", "sort_order", "abbr_th", "abbr_en") VALUES
	('c38b75dc-3508-44de-805e-1c216aab39bd', 'rid', 'กรมชลประทาน', 'Royal Irrigation Department', 'government', NULL, true, NULL, '{}', '2026-03-21 03:13:35.849673+00', '2026-03-21 03:13:35.849673+00', false, 'เกษตรฯ', 'อธิบดีกรมชลประทาน', 'saraban@rid.go.th', 'นายสมบุญ ศรีเมือง', 'ผู้อำนวยการส่วนสวัสดิการและพัฒนาคุณภาพชีวิต', '0851146480 / sombun76', 'sombun76@gmail.com', 3, true, 14, 'ชป.', 'RID'),
	('f295f731-1416-47dc-b5bc-5a786ec95c5e', 'dcy', 'กรมกิจการเด็กและเยาวชน', 'Department of Children and Youth', 'government', NULL, true, NULL, '{}', '2026-03-21 03:13:35.849673+00', '2026-03-21 03:13:35.849673+00', false, 'พม.', 'อธิบดีกรมกิจการเด็กและเยาวชน', 'saraban@dcy.go.th', 'นายภาณุวัฒน์ ดีเลิศ', 'เจ้าพนักงานธุรการปฏิบัติงาน', 'bombayfc606', 'pattanahrd@gmail.com', 1, true, 15, 'ดย.', 'DCY'),
	('48ac3fe0-1205-413c-bcb5-47bd90ffeb75', 'tpso', 'สำนักงานนโยบายและยุทธศาสตร์การค้า', 'Trade Policy and Strategy Office', 'government', NULL, true, NULL, '{}', '2026-03-21 03:13:35.849673+00', '2026-03-21 03:13:35.849673+00', false, 'พาณิชย์', 'ผู้อำนวยการสำนักงานนโยบายและยุทธศาสตร์การค้า', 'saraban-tpso@moc.go.th', 'นางสาวเพ็ญวนา ปรานสุจริต', 'นักวิชาการพาณิชย์ชำนาญการ', '0864155818, penvana', 'penvana.p@gmail.com', 12, true, 2, 'สนค.', 'TPSO'),
	('c584868c-e7f4-4ebd-9b39-f73a5810af86', 'mots', 'สำนักงานปลัดกระทรวงการท่องเที่ยวและกีฬา', 'Office of the Permanent Secretary Ministry of Tourism and Sports', 'government', NULL, true, NULL, '{}', '2026-03-21 03:13:35.849673+00', '2026-03-21 03:13:35.849673+00', false, 'ท่องเที่ยวฯ', 'ปลัดกระทรวงการท่องเที่ยวและกีฬา', 'saraban@mots.go.th', 'นางสาวสุวรรณา หาญชนะ', 'นักทรัพยากรบุคคลชำนาญการ', '089-8473149', 'hrd@mots.go.th', 13, true, 8, 'สป.กก.', 'MOTS'),
	('82001920-068b-45a7-b9fc-88e44b79573d', 'onep', 'สำนักงานนโยบายและแผนทรัพยากรธรรมชาติและสิ่งแวดล้อม', 'Office of Natural Resources and Environmental Policy and Planning', 'government', NULL, true, NULL, '{}', '2026-03-21 03:13:35.849673+00', '2026-03-21 03:13:35.849673+00', false, 'ทรัพยากรฯ', 'เลขาธิการสำนักงานนโยบายและแผนทรัพยากรธรรมชาติและสิ่งแวดล้อม', 'saraban@onep.go.th', 'นางสาวอักษิพร จันทร์เทวี', 'นักทรัพยากรบุคคลปฏิบัติการ', '02-2656524', 'hronep@gmail.com', 11, true, 10, 'สผ.', 'ONEP'),
	('0450ca60-f4d4-44f1-8687-c5575434965c', 'acfs', 'สำนักงานมาตรฐานสินค้าเกษตรและอาหารแห่งชาติ', 'National Bureau of Agricultural Commodity and Food Standards', 'government', NULL, true, NULL, '{}', '2026-03-21 03:13:35.849673+00', '2026-03-21 03:13:35.849673+00', false, 'เกษตรฯ', 'เลขาธิการสำนักงานมาตรฐานสินค้าเกษตรและอาหารแห่งชาติ', 'saraban@acfs.go.th', 'นายอนุวัตร วิสุทธิสมาจาร', 'นักทรัพยากรบุคคลปฏิบัติการ', '086-4107372', 'hrd.acfs@gmail.com', 14, true, 12, 'มกอช.', 'ACFS'),
	('d46edda4-d874-4ff3-ac10-5f1a8ce241ae', 'test-org', 'องค์กรทดสอบระบบ', 'Test Organization', 'government', NULL, true, NULL, '{"description": "องค์กรสำหรับทดสอบระบบ ไม่นับรวมในรายงานทางการ", "created_reason": "system_test"}', '2026-03-17 15:55:58.611672+00', '2026-03-19 17:49:06.203919+00', true, NULL, NULL, NULL, NULL, NULL, NULL, 'hr-test@tst.go.th', 99, false, 99, 'ทดสอบ', 'test'),
	('6cac540c-e218-4497-8043-0e6627445f0e', 'dop', 'กรมคุมประพฤติ', 'Department of Probation', 'government', NULL, true, NULL, '{}', '2026-03-21 03:13:35.849673+00', '2026-03-21 03:13:35.849673+00', false, 'ยุติธรรม', 'อธิบดีกรมคุมประพฤติ', 'saraban@probation.mail.go.th', 'นางสาวจิรา มณเฑียร', 'นักทรัพยากรบุคคลชำนาญการพิเศษ', '0818085635 / poundboy', 'jmonthen@gmail.com', 2, true, 7, 'คป.', 'DOP'),
	('b97e24d0-7423-42a2-b3ab-f06d4a233d42', 'dcp', 'กรมส่งเสริมวัฒนธรรม', 'Department of Cultural Promotion', 'government', NULL, true, NULL, '{}', '2026-03-21 03:13:35.849673+00', '2026-03-21 03:13:35.849673+00', false, 'วัฒนธรรม', 'อธิบดีกรมส่งเสริมวัฒนธรรม', 'saraban@culture.mail.go.th', 'พิชชาภา เจริญพระ', 'นักวิชาการวัฒนธรรมปฏิบัติการ', 'pitchapap_', 'hrd.dcp2023@gmail.com', 5, true, 6, 'สวธ.', 'DCP'),
	('7664e8af-1c52-493d-875b-6c2e171a5a6a', 'dss', 'กรมวิทยาศาสตร์บริการ', 'Department of Science Service', 'government', NULL, true, NULL, '{}', '2026-03-21 03:13:35.849673+00', '2026-03-21 03:13:35.849673+00', false, 'อว.', 'อธิบดีกรมวิทยาศาสตร์บริการ', 'saraban@dss.go.th', 'ดร.จิราภรณ์ บุราคร', 'นักวิทยาศาสตร์เชี่ยวชาญ', '0659875854', 'juntarama@yahoo.com', 4, true, 3, 'วศ.', 'DSS'),
	('48998f7b-9bb2-4042-a2f4-94b1ce173e5b', 'dmh', 'กรมสุขภาพจิต', 'Department of Mental Health', 'government', NULL, true, NULL, '{}', '2026-03-21 03:13:35.849673+00', '2026-03-21 03:13:35.849673+00', false, 'สาธารณสุข', 'อธิบดีกรมสุขภาพจิต', 'saraban@dmh.mail.go.th', 'นางสาววธัญญา สนธิพันธ์', 'นักทรัพยากรบุคคล', '090-2854793', 'ya.watanya@gmail.com', 6, true, 9, 'สจ.', 'DMH'),
	('b2a42948-9398-4600-bfe1-14c60ac99682', 'nrct', 'สำนักงานการวิจัยแห่งชาติ', 'National Research Council of Thailand', 'government', NULL, true, NULL, '{}', '2026-03-21 03:13:35.849673+00', '2026-03-21 03:13:35.849673+00', false, 'อว.', 'ผู้อำนวยการสำนักงานการวิจัยแห่งชาติ', 'saraban@nrct.go.th', 'นายศุภกร มณีนิล', 'นักวิเคราะห์นโยบายและแผนชำนาญการพิเศษ', 'artnrct28', 'subhakorn.m@nrct.go.th', 10, true, 11, 'วช.', 'NRCT'),
	('9ceba9e7-4f04-41a3-9446-2476b39b8de9', 'dhss', 'กรมสนับสนุนบริการสุขภาพ', 'Department of Health Service Support', 'government', NULL, true, NULL, '{}', '2026-03-21 03:13:35.849673+00', '2026-03-21 03:13:35.849673+00', false, 'สาธารณสุข', 'อธิบดีกรมสนับสนุนบริการสุขภาพ', 'saraban@dhss.go.th', 'นายเฉลิมพงษ์ ขวดแก้ว', 'นักทรัพยากรบุคคลชำนาญการ', '02-2787-000 ต่อ 1121 / id line guggsan', 'chalermpong.k@dhss.go.th', 8, true, 4, 'สบส.', 'DHSS'),
	('c2eb9364-b828-4319-89ea-492bf0d33822', 'opdc', 'สำนักงานคณะกรรมการพัฒนาระบบราชการ', 'Office of the Civil Service Commission', 'government', NULL, true, NULL, '{}', '2026-03-21 03:13:35.849673+00', '2026-03-21 03:13:35.849673+00', false, 'สำนักนายกฯ', 'เลขาธิการคณะกรรมการพัฒนาระบบราชการ', 'saraban@opdc.go.th', 'ณพฤธ วีระกรพานิช', 'นักพัฒนาระบบราชการปฏิบัติการ', '0 2356 9999 ต่อ 8796', 'napruet.v@opdc.go.th', 9, true, 13, 'สำนักงาน ก.พ.ร.', 'OPDC'),
	('b8a3a3a4-115c-49f4-b24f-a651b27491fa', 'tmd', 'กรมอุตุนิยมวิทยา', 'Thai Meteorological Department', 'government', NULL, true, NULL, '{}', '2026-03-21 03:13:35.849673+00', '2026-03-21 03:13:35.849673+00', false, 'ดิจิทัลฯ', 'อธิบดีกรมอุตุนิยมวิทยา', 'saraban@tmd.mail.go.th', 'นางภานุมาศ ลิ่วเจริญทรัพย์', 'นักทรัพยากรบุคคลชำนาญการพิเศษ', '086-9828347', 'phanumat.lew@gmail.com', 7, true, 5, 'อต.', 'TMD'),
	('5c89e903-b63e-425d-97f7-4304b04f1fdb', 'nesdc', 'สำนักงานสภาพัฒนาการเศรษฐกิจและสังคมแห่งชาติ', 'National Economic and Social Development Council', 'government', NULL, true, NULL, '{}', '2026-03-21 03:13:35.849673+00', '2026-03-21 03:13:35.849673+00', false, 'สำนักนายกฯ', 'เลขาธิการสภาพัฒนาการเศรษฐกิจและสังคมแห่งชาติ', 'saraban@nesdc.go.th', 'นางสาวณัฐติยาภรณ์ พันธนาม', 'นักวิเคราะห์นโยบายและแผนปฏิบัติการ', '02 280 4085 ต่อ 5442 / n-kate', 'natthiyaporn.ph@gmail.com', 15, true, 1, 'สศช.', 'NESDC');


--
-- Data for Name: admin_user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."admin_user_roles" ("id", "email", "role", "org_name", "is_active", "created_at", "updated_at", "org_code", "display_name", "created_by", "last_login_at", "initial_password") VALUES
	('921660f9-8c40-4407-ab5c-a09ebeb8fcea', 'admin@gmail.com', 'super_admin', 'Super Admin', true, '2026-03-14 03:08:53.368595+00', '2026-03-23 12:08:27.326762+00', NULL, 'Super Admin', NULL, NULL, 'admin'),
	('b78135ae-1cf9-4a7d-a7f2-b849d945c06e', 'hrdplan.wellbeing@gmail.com', 'admin', 'Admin Hrd', true, '2026-03-14 03:08:53.368595+00', '2026-03-23 12:08:32.448617+00', NULL, 'Admin Hrd', NULL, NULL, 'wellbeing2025'),
	('3941e390-0703-4ae3-9fe3-ff75bb46299b', 'hr@dcy.go.th', 'org_hr', 'กรมกิจการเด็กและเยาวชน', true, '2026-03-21 03:16:33.711139+00', '2026-03-23 12:06:32.850921+00', 'dcy', 'HR กรมกิจการเด็กและเยาวชน', NULL, NULL, 'DcyHR2569'),
	('edff89df-cbdc-4acd-9fe4-96c9b9c55c61', 'hr@rid.go.th', 'org_hr', 'กรมชลประทาน', true, '2026-03-21 03:16:33.711139+00', '2026-03-23 12:06:32.850921+00', 'rid', 'HR กรมชลประทาน', NULL, NULL, 'RidHR2569'),
	('c55f24f3-58d3-4f07-8ce8-d8043e1ca6de', 'hr@dss.go.th', 'org_hr', 'กรมวิทยาศาสตร์บริการ', true, '2026-03-21 03:16:33.711139+00', '2026-03-23 12:06:32.850921+00', 'dss', 'HR กรมวิทยาศาสตร์บริการ', NULL, NULL, 'DssHR2569'),
	('edca2ede-9454-4cbe-a014-eed963a605b8', 'hr@dcp.go.th', 'org_hr', 'กรมส่งเสริมวัฒนธรรม', true, '2026-03-21 03:16:33.711139+00', '2026-03-23 12:06:32.850921+00', 'dcp', 'HR กรมส่งเสริมวัฒนธรรม', NULL, NULL, 'DcpHR2569'),
	('79437bc6-b5e1-44f2-abbc-b20d34029e62', 'hr@dmh.go.th', 'org_hr', 'กรมสุขภาพจิต', true, '2026-03-21 03:16:33.711139+00', '2026-03-23 12:06:32.850921+00', 'dmh', 'HR กรมสุขภาพจิต', NULL, NULL, 'DmhHR2569'),
	('8133d18f-4609-4161-bd44-f7db7ea08f3c', 'hr@tmd.go.th', 'org_hr', 'กรมอุตุนิยมวิทยา', true, '2026-03-21 03:16:33.711139+00', '2026-03-23 12:06:32.850921+00', 'tmd', 'HR กรมอุตุนิยมวิทยา', NULL, NULL, 'TmdHR2569'),
	('16b03205-287c-442a-9e2c-a8e0ed1b3c64', 'hr@nrct.go.th', 'org_hr', 'สำนักงานการวิจัยแห่งชาติ', true, '2026-03-21 03:16:33.711139+00', '2026-03-23 12:06:32.850921+00', 'nrct', 'HR สำนักงานการวิจัยแห่งชาติ', NULL, NULL, 'NrctHR2569'),
	('7617b558-c282-4639-b1b9-838cd9148d01', 'hr@onep.go.th', 'org_hr', 'สำนักงานนโยบายและแผนทรัพยากรธรรมชาติและสิ่งแวดล้อม', true, '2026-03-21 03:16:33.711139+00', '2026-03-23 12:06:32.850921+00', 'onep', 'HR สำนักงานนโยบายฯ ทรัพยากรธรรมชาติ', NULL, NULL, 'OnepHR2569'),
	('5d5bb6f2-ef4d-466b-b86c-fb2e11f82c37', 'hr@tpso.go.th', 'org_hr', 'สำนักงานนโยบายและยุทธศาสตร์การค้า', true, '2026-03-21 03:16:33.711139+00', '2026-03-23 12:06:32.850921+00', 'tpso', 'HR สำนักงานนโยบายฯ การค้า', NULL, NULL, 'TpsoHR2569'),
	('00216558-9c70-4c45-8542-6ea580974d87', 'hr@dop.go.th', 'org_hr', 'กรมคุมประพฤติ', true, '2026-03-21 03:16:33.711139+00', '2026-03-23 12:06:32.850921+00', 'dop', 'HR กรมคุมประพฤติ', NULL, NULL, 'DopHR2569'),
	('8f08d1b1-0205-4e83-86a5-31926c99e74b', 'hr@mots.go.th', 'org_hr', 'สำนักงานปลัดกระทรวงการท่องเที่ยวและกีฬา', true, '2026-03-21 03:16:33.711139+00', '2026-03-23 12:06:32.850921+00', 'mots', 'HR สำนักงานปลัดกระทรวงฯ ท่องเที่ยว', NULL, NULL, 'MotsHR2569'),
	('fd2a01fb-6100-4066-ae40-cb0f1f0f4394', 'hr@nesdc.go.th', 'org_hr', 'สำนักงานสภาพัฒนาการเศรษฐกิจและสังคมแห่งชาติ', true, '2026-03-21 03:16:33.711139+00', '2026-03-23 12:06:32.850921+00', 'nesdc', 'HR สำนักงานสภาพัฒนาเศรษฐกิจฯ', NULL, NULL, 'NesdcHR2569'),
	('18cb4117-6955-47fc-8b00-822401b54180', 'hr@acfs.go.th', 'org_hr', 'สำนักงานมาตรฐานสินค้าเกษตรและอาหารแห่งชาติ', true, '2026-03-21 03:16:33.711139+00', '2026-03-23 12:06:32.850921+00', 'acfs', 'HR สำนักงานมาตรฐานสินค้าเกษตรฯ', NULL, NULL, 'AcfsHR2569'),
	('1c145f88-876e-4bee-9882-157bdd69305b', 'hr@dhss.go.th', 'org_hr', 'กรมสนับสนุนบริการสุขภาพ', true, '2026-03-21 03:16:33.711139+00', '2026-03-23 12:06:32.850921+00', 'dhss', 'HR กรมสนับสนุนบริการสุขภาพ', NULL, NULL, 'DhssHR2569'),
	('0fff11b8-aed1-4d19-8765-78a96ea3c56d', 'hr@opdc.go.th', 'org_hr', 'สำนักงานคณะกรรมการพัฒนาระบบราชการ', true, '2026-03-21 03:16:33.711139+00', '2026-03-23 12:06:32.850921+00', 'opdc', 'HR สำนักงาน กพร.', NULL, NULL, 'OpdcHR2569'),
	('5c7fbe3b-2d64-41f5-ad04-5f8a42fb5003', 'hr-test@tst.go.th', 'org_hr', 'องค์กรทดสอบระบบ', true, '2026-03-23 14:16:37.851696+00', '2026-03-23 14:29:07.691093+00', NULL, 'HR องค์กรทดสอบระบบ', NULL, NULL, 'TstHR2569');


--
-- Data for Name: form_configs; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."form_configs" ("id", "form_id", "form_name", "config_json", "updated_at", "updated_by") VALUES
	('65b806ed-d1b8-4e79-8dc0-74489768cf5e', 'ch1', 'ฟอร์ม Ch1 (ข้อมูลองค์กร)', '{}', '2026-03-15 04:14:14.34073+00', NULL),
	('24da3f75-e5cf-449e-8cf7-71cbcdc7db3b', 'wellbeing', 'Wellbeing Survey (รายบุคคล)', '{}', '2026-03-15 04:14:14.34073+00', NULL);


--
-- Data for Name: form_question_overrides; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: form_sections; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."form_sections" ("id", "form_code", "section_key", "section_order", "title_th", "description") VALUES
	('7da11543-ea28-4848-8fa7-1513f4895e72', 'wellbeing', 'personal', 1, 'ส่วนที่ 1 ข้อมูลส่วนบุคคล และการตรวจวัดร่างกาย', 'ข้อมูลทั่วไปและสุขภาพเบื้องต้น'),
	('d88740c4-03b3-4fde-8a76-a1170c1cf848', 'wellbeing', 'consumption', 2, 'การบริโภคยาสูบและแอลกอฮอล์', 'พฤติกรรมเสี่ยงด้านสุขภาพ'),
	('cd8f42ea-0784-45d2-8581-eef9fd7b827e', 'wellbeing', 'nutrition', 3, 'พฤติกรรมการบริโภค', 'ประเมินการกิน หวาน มัน เค็ม'),
	('b229f100-afd8-4ab4-8f2e-a6283242a614', 'wellbeing', 'activity', 4, 'กิจกรรมทางกาย (TPAX)', 'การเคลื่อนไหวร่างกายในชีวิตประจำวัน'),
	('200d92fe-e743-4e47-8ecd-f8b9c7ad8f0e', 'wellbeing', 'mental', 5, 'สุขภาพจิต (TMHI-15)', 'วัดสุขภาพจิตคนไทยฉบับสั้น'),
	('7b95ee9c-edad-455b-ac4e-63d9e18f2500', 'wellbeing', 'loneliness', 6, 'แบบสำรวจความเหงา (UCLA Loneliness Scale)', 'การมีปฏิสัมพันธ์กับผู้อื่นในที่ทำงาน'),
	('0631e848-c75d-4e34-8919-93ca635feb46', 'wellbeing', 'safety', 7, 'อุบัติเหตุและความปลอดภัย', 'พฤติกรรมความปลอดภัย'),
	('b98f74d6-6794-4bb5-b3d7-b4ca1d8590bb', 'wellbeing', 'environment', 8, 'สิ่งแวดล้อมและโรคอุบัติใหม่', 'สภาพแวดล้อมและผลกระทบ'),
	('69f5d65f-e8fd-4dbd-8759-e86db73f0c3c', 'ch1', 'ch1_basic', 1, 'ข้อมูลเบื้องต้นของส่วนราชการ', NULL),
	('520f30ad-f7db-4e28-9469-f09fe6df1a07', 'ch1', 'ch1_policy', 2, 'นโยบายและบริบทภายนอก', NULL),
	('c042d376-cbcf-482d-9d5d-c04f83f617f5', 'ch1', 'ch1_wellbeing', 3, 'ข้อมูลสุขภาวะ', NULL),
	('fb189245-f608-4905-8bcc-59a19ac0497f', 'ch1', 'ch1_system', 4, 'ระบบการบริหารและสภาพแวดล้อมการทำงาน', NULL),
	('982758e8-4392-4357-9e10-43eb1ace55ef', 'ch1', 'ch1_goal', 5, 'ทิศทาง เป้าหมาย และข้อเสนอแนะ', NULL);


--
-- Data for Name: form_questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."form_questions" ("id", "form_code", "section_key", "question_key", "question_order", "label_th", "help_text", "input_type", "options_json", "is_required", "placeholder", "unit", "validation_json", "is_active") VALUES
	('29976970-302b-4359-89e7-c20244ae8875', 'wellbeing', 'personal', 'title', 1, 'คำนำหน้า', NULL, 'radio', '["นาย", "นาง", "นางสาว", "อื่นๆ"]', true, NULL, NULL, NULL, true),
	('39e87f7d-5eb7-42d4-b159-e420ac95d484', 'wellbeing', 'personal', 'name', 2, 'ชื่อ-สกุล', NULL, 'text', NULL, true, NULL, NULL, NULL, true),
	('25083198-844c-4b23-bd7c-2f0b9bec7dfd', 'wellbeing', 'personal', 'gender', 3, 'เพศ', NULL, 'radio', '["ชาย", "หญิง", "LGBTQ+"]', true, NULL, NULL, NULL, true),
	('d3eb76dd-7a61-48b4-a3c8-365e02f8bc0d', 'wellbeing', 'personal', 'age', 4, 'อายุ (ปี)', NULL, 'number', NULL, true, NULL, NULL, NULL, true),
	('638d8897-87af-4c99-939c-ad956e8bb45e', 'wellbeing', 'personal', 'org_type', 5, 'ประเภทหน่วยงาน', NULL, 'radio', '["นโยบาย", "ปฏิบัติการ", "สนับสนุน"]', true, NULL, NULL, NULL, true),
	('fd57798f-0db5-4b32-a912-92fb38cb377e', 'wellbeing', 'personal', 'job', 6, 'ตำแหน่งงานปัจจุบัน', NULL, 'radio', '["ปฏิบัติการ", "ปฏิบัติงาน", "ชำนาญการ", "ชำนาญงาน", "ชำนาญการพิเศษ", "หัวหน้า", "ผู้บริหารระดับกลาง"]', true, NULL, NULL, NULL, true),
	('d6a4bc53-df1f-42f2-9325-db1db837bc1a', 'wellbeing', 'personal', 'job_duration', 7, 'ระยะเวลาที่ทำงานในตำแหน่งปัจจุบัน (ปี)', NULL, 'number', NULL, true, NULL, NULL, NULL, true),
	('15986d99-c22e-4a69-a205-ee6f62e6c28e', 'wellbeing', 'personal', 'activity_org', 8, 'ท่านเคยเข้ารับกิจกรรมส่งเสริมสุขภาพของพนักงานในองค์กรหรือไม่', NULL, 'radio', '["เคย", "ไม่เคย"]', true, NULL, NULL, NULL, true),
	('ec22290b-800d-4238-8fc5-597765a8257b', 'wellbeing', 'personal', 'activity_thaihealth', 9, 'ท่านเคยเข้ารับกิจกรรมส่งเสริมสุขภาพจาก สสส. หรือไม่', NULL, 'radio', '["เคย", "ไม่เคย"]', true, NULL, NULL, NULL, true),
	('24e69e26-6238-400b-ae30-cb9ad0e38193', 'wellbeing', 'personal', 'diseases', 10, 'ท่านมีปัญหาสุขภาพเหล่านี้หรือไม่', NULL, 'checkbox', '["เบาหวาน", "ความดันโลหิตสูง", "โรคหัวใจและหลอดเลือด", "โรคไต", "โรคตับ", "มะเร็ง", "ไม่มี"]', true, NULL, NULL, NULL, true),
	('f6948072-d33f-4912-a4e8-a9dca18c513c', 'wellbeing', 'personal', 'height', 11, 'ส่วนสูง (เซนติเมตร)', NULL, 'number', NULL, true, NULL, NULL, NULL, true),
	('80441996-c15c-4b16-927e-9a005836e6a4', 'wellbeing', 'personal', 'weight', 12, 'น้ำหนัก (กิโลกรัม)', NULL, 'number', NULL, true, NULL, NULL, NULL, true),
	('3095d425-ab5f-4e28-9332-d793bf899933', 'wellbeing', 'personal', 'waist', 13, 'เส้นรอบเอว (เซนติเมตร)', NULL, 'number', NULL, true, NULL, NULL, NULL, true),
	('6d32956b-9cf9-4382-9d96-f6d2d3448912', 'wellbeing', 'consumption', 'q2001', 1, 'ท่านเคยสูบบุหรี่หรือไม่', NULL, 'radio', '["ไม่เคยสูบ", "สูบเป็นประจำทุกวัน", "สูบ 2-3 ครั้งต่อสัปดาห์", "สูบบางโอกาส"]', true, NULL, NULL, NULL, true),
	('8174503a-0362-4556-9d39-50f801a0116d', 'wellbeing', 'consumption', 'q2002', 2, 'ท่านเคยสูบบุหรี่ไฟฟ้าหรือไม่', NULL, 'radio', '["ไม่เคยสูบ", "สูบเป็นประจำทุกวัน", "สูบ 2-3 ครั้งต่อสัปดาห์", "สูบบางโอกาส"]', true, NULL, NULL, NULL, true),
	('fff3b4fd-6e02-4653-8a52-4fb0551562bd', 'wellbeing', 'consumption', 'q2003', 3, 'ท่านเคยดื่มสุราหรือเครื่องดื่มผสมแอลกอฮอล์หรือไม่', NULL, 'radio', '["ไม่เคยดื่ม", "ดื่มเป็นประจำทุกวัน", "ดื่ม 2-3 ครั้งต่อสัปดาห์", "ดื่มบางโอกาส"]', true, NULL, NULL, NULL, true),
	('3e8b2285-b13c-480d-bcc5-36c7d2cb4969', 'wellbeing', 'consumption', 'q2004', 4, 'ท่านเคยดื่มเครื่องดื่มที่มีส่วนผสมของกัญชาหรือไม่', NULL, 'radio', '["ไม่เคยดื่ม", "ดื่มเป็นประจำทุกวัน", "ดื่ม 2-3 ครั้งต่อสัปดาห์", "ดื่มบางโอกาส"]', true, NULL, NULL, NULL, true),
	('baf1b88b-29c4-443b-a055-967940a437fb', 'wellbeing', 'consumption', 'q2005_drug', 5, 'ท่านเคยใช้สารเสพติดอื่นๆ หรือไม่', NULL, 'radio', '["ไม่เคยเสพ", "เสพเป็นประจำทุกวัน", "เสพ 2-3 ครั้งต่อสัปดาห์", "เสพบางโอกาส"]', true, NULL, NULL, NULL, true),
	('3d9e619c-ffad-461c-a205-fa7013ba7277', 'wellbeing', 'nutrition', 'sweet_1', 1, 'ดื่มน้ำเปล่า/กาแฟดำ/ชาไม่ใส่น้ำตาล', 'รสหวาน', 'radio', '["ทุกวัน/เกือบทุกวัน", "3-4 ครั้งต่อสัปดาห์", "แทบไม่ทำ/ไม่ทำเลย"]', true, NULL, NULL, NULL, true),
	('f6baaa95-954b-4c21-b886-a85b3ac133a3', 'wellbeing', 'nutrition', 'sweet_2', 2, 'ดื่มน้ำอัดลม/กาแฟ 3in1/เครื่องดื่มชง/น้ำหวาน', 'รสหวาน', 'radio', '["ทุกวัน/เกือบทุกวัน", "3-4 ครั้งต่อสัปดาห์", "แทบไม่ทำ/ไม่ทำเลย"]', true, NULL, NULL, NULL, true),
	('983f948d-b1bf-4f73-bbe5-14eceba10afe', 'wellbeing', 'nutrition', 'sweet_3', 3, 'ดื่มน้ำผัก/ผลไม้สำเร็จรูป', 'รสหวาน', 'radio', '["ทุกวัน/เกือบทุกวัน", "3-4 ครั้งต่อสัปดาห์", "แทบไม่ทำ/ไม่ทำเลย"]', true, NULL, NULL, NULL, true),
	('329dfbae-2f17-4a75-9360-748506be108a', 'wellbeing', 'nutrition', 'sweet_4', 4, 'กินไอศกรีม/เบเกอรี่หรือขนมหวานไทย', 'รสหวาน', 'radio', '["ทุกวัน/เกือบทุกวัน", "3-4 ครั้งต่อสัปดาห์", "แทบไม่ทำ/ไม่ทำเลย"]', true, NULL, NULL, NULL, true),
	('969a8c5d-12a0-4f0c-a49a-5c1a31714175', 'wellbeing', 'nutrition', 'sweet_5', 5, 'เติมน้ำตาล/น้ำผึ้ง/น้ำเชื่อมลงในอาหาร', 'รสหวาน', 'radio', '["ทุกวัน/เกือบทุกวัน", "3-4 ครั้งต่อสัปดาห์", "แทบไม่ทำ/ไม่ทำเลย"]', true, NULL, NULL, NULL, true),
	('0cd0abe1-0881-4b75-a86e-4401118d4b63', 'wellbeing', 'nutrition', 'fat_1', 6, 'กินเนื้อสัตว์ติดมัน ติดหนัง มีไขมันแทรก', 'ไขมัน', 'radio', '["ทุกวัน/เกือบทุกวัน", "3-4 ครั้งต่อสัปดาห์", "แทบไม่ทำ/ไม่ทำเลย"]', true, NULL, NULL, NULL, true),
	('fbc955fb-8ea1-4af9-8ce4-bb1b49085d3c', 'wellbeing', 'nutrition', 'fat_2', 7, 'กินอาหารทอด อาหารฟาสต์ฟู้ด อาหารผัดน้ำมัน', 'ไขมัน', 'radio', '["ทุกวัน/เกือบทุกวัน", "3-4 ครั้งต่อสัปดาห์", "แทบไม่ทำ/ไม่ทำเลย"]', true, NULL, NULL, NULL, true),
	('69fe3c6e-ea89-4e65-9836-31ed02a83b1d', 'wellbeing', 'nutrition', 'fat_3', 8, 'กินอาหารแกงกะทิ/ไขมันสูง', 'ไขมัน', 'radio', '["ทุกวัน/เกือบทุกวัน", "3-4 ครั้งต่อสัปดาห์", "แทบไม่ทำ/ไม่ทำเลย"]', true, NULL, NULL, NULL, true),
	('7a97b68f-13c4-474a-980d-a80e658c04ee', 'wellbeing', 'nutrition', 'fat_4', 9, 'ดื่มเครื่องดื่มผสมนมข้นหวาน/ครีมเทียม', 'ไขมัน', 'radio', '["ทุกวัน/เกือบทุกวัน", "3-4 ครั้งต่อสัปดาห์", "แทบไม่ทำ/ไม่ทำเลย"]', true, NULL, NULL, NULL, true),
	('464a98d8-b5a5-4a97-afb7-c36dc45560ce', 'wellbeing', 'nutrition', 'fat_5', 10, 'ซดน้ำผัด/น้ำแกงลงในข้าว', 'ไขมัน', 'radio', '["ทุกวัน/เกือบทุกวัน", "3-4 ครั้งต่อสัปดาห์", "แทบไม่ทำ/ไม่ทำเลย"]', true, NULL, NULL, NULL, true),
	('5e53ae30-8119-4b9a-bfd7-7000b35f84ed', 'wellbeing', 'nutrition', 'salt_1', 11, 'ชิมอาหารก่อนปรุง/ปรุงน้อยหรือไม่ปรุงเพิ่ม', 'โซเดียม', 'radio', '["ทุกวัน/เกือบทุกวัน", "3-4 ครั้งต่อสัปดาห์", "แทบไม่ทำ/ไม่ทำเลย"]', true, NULL, NULL, NULL, true),
	('03eef813-813a-4a1a-9106-cd79bde47228', 'wellbeing', 'nutrition', 'salt_2', 12, 'ใช้สมุนไพร/เครื่องเทศแทนเครื่องปรุง', 'โซเดียม', 'radio', '["ทุกวัน/เกือบทุกวัน", "3-4 ครั้งต่อสัปดาห์", "แทบไม่ทำ/ไม่ทำเลย"]', true, NULL, NULL, NULL, true),
	('ec96eb19-8c1d-49c4-9124-24ecb8c0df89', 'wellbeing', 'nutrition', 'salt_3', 13, 'กินเนื้อสัตว์แปรรูป ไส้กรอก ปลาเค็ม', 'โซเดียม', 'radio', '["ทุกวัน/เกือบทุกวัน", "3-4 ครั้งต่อสัปดาห์", "แทบไม่ทำ/ไม่ทำเลย"]', true, NULL, NULL, NULL, true),
	('d74e43d2-b242-4c42-bd78-f3ef2b2d381d', 'wellbeing', 'nutrition', 'salt_4', 14, 'กินบะหมี่/โจ๊กกึ่งสำเร็จรูป', 'โซเดียม', 'radio', '["ทุกวัน/เกือบทุกวัน", "3-4 ครั้งต่อสัปดาห์", "แทบไม่ทำ/ไม่ทำเลย"]', true, NULL, NULL, NULL, true),
	('1d1a56e5-4d3e-405d-afe4-a5059e3e31e1', 'wellbeing', 'nutrition', 'salt_5', 15, 'กินผักผลไม้ดอง/จิ้มพริกเกลือ', 'โซเดียม', 'radio', '["ทุกวัน/เกือบทุกวัน", "3-4 ครั้งต่อสัปดาห์", "แทบไม่ทำ/ไม่ทำเลย"]', true, NULL, NULL, NULL, true),
	('b6d25e64-d7e3-4841-998c-3d8615b2ed60', 'wellbeing', 'activity', 'act_work_days', 1, 'กิจกรรมทางกายขณะทำงาน (วัน/สัปดาห์)', 'การทำงาน', 'number', NULL, true, NULL, NULL, NULL, true),
	('5db1a6f2-9224-4b67-afbd-88e93e71aa03', 'wellbeing', 'activity', 'act_work_dur', 2, 'ระยะเวลาเฉลี่ยต่อวัน (นาที)', 'การทำงาน', 'number', NULL, true, NULL, NULL, NULL, true),
	('263b138b-0111-4134-a289-a4492f29bdd2', 'wellbeing', 'activity', 'act_commute_days', 3, 'เดินทางด้วยเท้า/จักรยาน (วัน/สัปดาห์)', 'การเดินทาง', 'number', NULL, true, NULL, NULL, NULL, true),
	('43424e4a-5ad2-47cf-b577-998f80c08891', 'wellbeing', 'activity', 'act_commute_dur', 4, 'ระยะเวลาเฉลี่ยต่อวัน (นาที)', 'การเดินทาง', 'number', NULL, true, NULL, NULL, NULL, true),
	('f8d1d6f9-3411-402e-b925-1a1cf93c9dc7', 'wellbeing', 'activity', 'act_rec_days', 5, 'ออกกำลังกาย/นันทนาการ (วัน/สัปดาห์)', 'นันทนาการ', 'number', NULL, true, NULL, NULL, NULL, true),
	('f88e30cf-99d6-403a-962d-93dc7e356174', 'wellbeing', 'activity', 'act_rec_dur', 6, 'ระยะเวลาเฉลี่ยต่อวัน (นาที)', 'นันทนาการ', 'number', NULL, true, NULL, NULL, NULL, true),
	('1f1a38df-48ac-454c-bcbd-602432c32ab9', 'wellbeing', 'activity', 'sedentary_dur', 7, 'เวลานั่ง/เอนกาย (ชม./วัน)', 'พฤติกรรมเนือยนิ่ง', 'number', NULL, true, NULL, NULL, NULL, true),
	('50dce82c-0ed5-489f-89bf-11f94bf5bae1', 'wellbeing', 'activity', 'screen_entertain', 8, 'เวลาหน้าจอเพื่อความบันเทิง (ชม./วัน)', 'พฤติกรรมเนือยนิ่ง', 'number', NULL, true, NULL, NULL, NULL, true),
	('6d034216-6a85-41a5-a7f4-7e11a50e4ff9', 'wellbeing', 'activity', 'screen_work', 9, 'เวลาหน้าจอเพื่อการทำงาน (ชม./วัน)', 'พฤติกรรมเนือยนิ่ง', 'number', NULL, true, NULL, NULL, NULL, true),
	('44b359dc-95db-4628-9251-fe30355e77ee', 'wellbeing', 'mental', 'tmhi_1', 1, 'ท่านรู้สึกพึงพอใจในชีวิต', NULL, 'radio', '["ไม่เลย", "เล็กน้อย", "มาก", "มากที่สุด"]', true, NULL, NULL, NULL, true),
	('bab53d2b-8a79-43e0-8801-811c03f68ef4', 'wellbeing', 'mental', 'tmhi_2', 2, 'ท่านรู้สึกสบายใจ', NULL, 'radio', '["ไม่เลย", "เล็กน้อย", "มาก", "มากที่สุด"]', true, NULL, NULL, NULL, true),
	('b066ae31-db42-4388-9487-47cd7be00ab1', 'wellbeing', 'mental', 'tmhi_3', 3, 'ท่านรู้สึกภูมิใจในตนเอง', NULL, 'radio', '["ไม่เลย", "เล็กน้อย", "มาก", "มากที่สุด"]', true, NULL, NULL, NULL, true),
	('888de887-bfae-4110-ae97-1715debf608c', 'wellbeing', 'mental', 'tmhi_4', 4, 'ท่านรู้สึกเบื่อหน่ายท้อแท้กับการดำเนินชีวิตประจำวัน', NULL, 'radio', '["ไม่เลย", "เล็กน้อย", "มาก", "มากที่สุด"]', true, NULL, NULL, NULL, true),
	('a3e34d33-68b4-448e-a71d-b17ed344c79c', 'wellbeing', 'mental', 'tmhi_5', 5, 'ท่านรู้สึกผิดหวังในตนเอง', NULL, 'radio', '["ไม่เลย", "เล็กน้อย", "มาก", "มากที่สุด"]', true, NULL, NULL, NULL, true),
	('acef22be-23a5-49f5-aa27-ec2b0ffe4089', 'wellbeing', 'mental', 'tmhi_6', 6, 'ท่านรู้สึกว่าชีวิตมีแต่ความทุกข์', NULL, 'radio', '["ไม่เลย", "เล็กน้อย", "มาก", "มากที่สุด"]', true, NULL, NULL, NULL, true),
	('e99af51b-e82c-4585-99d7-7e3539199228', 'wellbeing', 'mental', 'tmhi_7', 7, 'ท่านสามารถทำใจยอมรับได้สำหรับปัญหาที่ยากจะแก้ไข', NULL, 'radio', '["ไม่เลย", "เล็กน้อย", "มาก", "มากที่สุด"]', true, NULL, NULL, NULL, true),
	('8b785153-c044-4767-b2e9-337c0acf1a0d', 'wellbeing', 'mental', 'tmhi_8', 8, 'ท่านมั่นใจว่าจะสามารถควบคุมอารมณ์ได้', NULL, 'radio', '["ไม่เลย", "เล็กน้อย", "มาก", "มากที่สุด"]', true, NULL, NULL, NULL, true),
	('662f7d39-d248-4b50-a4ca-b0302635ca05', 'wellbeing', 'mental', 'tmhi_9', 9, 'ท่านมั่นใจที่จะเผชิญกับเหตุการณ์ร้ายแรง', NULL, 'radio', '["ไม่เลย", "เล็กน้อย", "มาก", "มากที่สุด"]', true, NULL, NULL, NULL, true),
	('eb8dc7b8-cefe-4926-8964-858083568a89', 'wellbeing', 'mental', 'tmhi_10', 10, 'ท่านรู้สึกเห็นอกเห็นใจเมื่อผู้อื่นมีความทุกข์', NULL, 'radio', '["ไม่เลย", "เล็กน้อย", "มาก", "มากที่สุด"]', true, NULL, NULL, NULL, true),
	('38f55c99-5f3d-46cf-87ae-3f3fe0d29daa', 'wellbeing', 'mental', 'tmhi_11', 11, 'ท่านรู้สึกเป็นสุขในการช่วยเหลือผู้อื่น', NULL, 'radio', '["ไม่เลย", "เล็กน้อย", "มาก", "มากที่สุด"]', true, NULL, NULL, NULL, true),
	('f5fab3f3-1043-4d7f-aec1-9c4208d51237', 'wellbeing', 'mental', 'tmhi_12', 12, 'ท่านให้ความช่วยเหลือแก่ผู้อื่นเมื่อมีโอกาส', NULL, 'radio', '["ไม่เลย", "เล็กน้อย", "มาก", "มากที่สุด"]', true, NULL, NULL, NULL, true),
	('5aa576b3-c934-42e1-b671-be87bae43924', 'wellbeing', 'mental', 'tmhi_13', 13, 'ท่านรู้สึกมั่นคงปลอดภัยเมื่ออยู่ในครอบครัว', NULL, 'radio', '["ไม่เลย", "เล็กน้อย", "มาก", "มากที่สุด"]', true, NULL, NULL, NULL, true),
	('fc390e50-28da-4454-b96d-85820f785bc1', 'wellbeing', 'mental', 'tmhi_14', 14, 'หากท่านป่วยหนัก คนในครอบครัวจะดูแลท่านเป็นอย่างดี', NULL, 'radio', '["ไม่เลย", "เล็กน้อย", "มาก", "มากที่สุด"]', true, NULL, NULL, NULL, true),
	('41e2824b-5842-4788-b9fb-8a4602817f2a', 'wellbeing', 'mental', 'tmhi_15', 15, 'สมาชิกในครอบครัวมีความรักและผูกพันต่อกัน', NULL, 'radio', '["ไม่เลย", "เล็กน้อย", "มาก", "มากที่สุด"]', true, NULL, NULL, NULL, true),
	('526c9f41-3e41-4ff5-8bf1-7b74f92ccd3c', 'wellbeing', 'loneliness', 'lonely_1', 1, 'ฉันไม่มีความสุขที่ต้องทำหลายสิ่งหลายอย่างคนเดียว', NULL, 'radio', '["0", "1", "2", "3"]', true, NULL, NULL, NULL, true),
	('0ff91891-6de5-4694-b94d-71876466ba08', 'wellbeing', 'loneliness', 'lonely_2', 2, 'ฉันไม่มีใครคุยด้วย', NULL, 'radio', '["0", "1", "2", "3"]', true, NULL, NULL, NULL, true),
	('a0eccf75-e1ac-4999-bc61-2166a0fda6f7', 'wellbeing', 'loneliness', 'lonely_3', 3, 'ฉันทนไม่ได้ที่จะอยู่คนเดียวอย่างนี้', NULL, 'radio', '["0", "1", "2", "3"]', true, NULL, NULL, NULL, true),
	('5004eb01-c33f-4977-ac82-0ca6951dff7f', 'wellbeing', 'loneliness', 'lonely_4', 4, 'ฉันขาดมิตรภาพ', NULL, 'radio', '["0", "1", "2", "3"]', true, NULL, NULL, NULL, true),
	('62fecfb5-0b5e-4ab5-a1be-e66d752083c8', 'wellbeing', 'loneliness', 'lonely_5', 5, 'ฉันรู้สึกราวกับว่าไม่มีใครเข้าใจฉันจริงๆ', NULL, 'radio', '["0", "1", "2", "3"]', true, NULL, NULL, NULL, true),
	('ccb1a9a5-4d56-4328-b961-4777c22d441a', 'wellbeing', 'loneliness', 'lonely_6', 6, 'ฉันพบว่าตัวเองรอคนโทรหา', NULL, 'radio', '["0", "1", "2", "3"]', true, NULL, NULL, NULL, true),
	('8601bbc0-fa49-45db-a8ea-85329cb896ed', 'wellbeing', 'loneliness', 'lonely_7', 7, 'ฉันไม่มีใครให้พึ่ง', NULL, 'radio', '["0", "1", "2", "3"]', true, NULL, NULL, NULL, true),
	('704734d4-6deb-4bf3-a9bb-840273bc2644', 'wellbeing', 'loneliness', 'lonely_8', 8, 'ฉันไม่สนิทกับใคร', NULL, 'radio', '["0", "1", "2", "3"]', true, NULL, NULL, NULL, true),
	('d97329f4-b699-4910-ae68-0d9bc69d7e1f', 'wellbeing', 'loneliness', 'lonely_9', 9, 'ความเห็นจากคนอื่นไม่มีผลต่อแนวคิดของฉัน', NULL, 'radio', '["0", "1", "2", "3"]', true, NULL, NULL, NULL, true),
	('290aa785-d870-4177-a9ac-c0f612eb14b6', 'wellbeing', 'loneliness', 'lonely_10', 10, 'ฉันรู้สึกถูกทอดทิ้ง', NULL, 'radio', '["0", "1", "2", "3"]', true, NULL, NULL, NULL, true),
	('28dff831-4562-4501-84b8-158c7d52e539', 'wellbeing', 'loneliness', 'lonely_11', 11, 'ฉันรู้สึกโดดเดี่ยว', NULL, 'radio', '["0", "1", "2", "3"]', true, NULL, NULL, NULL, true),
	('86045a39-c982-4943-9a8d-1e60b8a50f0a', 'wellbeing', 'loneliness', 'lonely_12', 12, 'ฉันไม่สามารถติดต่อสื่อสารกับคนรอบข้างได้', NULL, 'radio', '["0", "1", "2", "3"]', true, NULL, NULL, NULL, true),
	('ce81743d-6d98-4a92-94bd-4b354441a466', 'wellbeing', 'loneliness', 'lonely_13', 13, 'ความสัมพันธ์ทางสังคมของฉันเป็นเพียงผิวเผิน', NULL, 'radio', '["0", "1", "2", "3"]', true, NULL, NULL, NULL, true),
	('a6dcf799-c105-41e1-98c7-eb6f1c393766', 'wellbeing', 'loneliness', 'lonely_14', 14, 'ฉันโหยหาการมีเพื่อนพ้อง', NULL, 'radio', '["0", "1", "2", "3"]', true, NULL, NULL, NULL, true),
	('d9cc23a5-86ee-4923-8a20-af82964695ff', 'wellbeing', 'loneliness', 'lonely_15', 15, 'ไม่มีใครรู้จักฉันดีพอ', NULL, 'radio', '["0", "1", "2", "3"]', true, NULL, NULL, NULL, true),
	('0af8f8db-99ec-4fa3-8762-7a0e483cdd4a', 'wellbeing', 'loneliness', 'lonely_16', 16, 'ฉันรู้สึกถูกแยกออกจากคนอื่นๆ', NULL, 'radio', '["0", "1", "2", "3"]', true, NULL, NULL, NULL, true),
	('de183477-fc78-4f75-8a0e-74aac93bfa65', 'wellbeing', 'loneliness', 'lonely_17', 17, 'ฉันรู้สึกไม่มีความสุขเมื่อต้องออกห่างจากบางสิ่ง', NULL, 'radio', '["0", "1", "2", "3"]', true, NULL, NULL, NULL, true),
	('1f3784a2-1eb6-4687-8b01-03ded1190f21', 'wellbeing', 'loneliness', 'lonely_18', 18, 'เป็นการยากสำหรับฉันที่จะหาเพื่อน', NULL, 'radio', '["0", "1", "2", "3"]', true, NULL, NULL, NULL, true),
	('97eb0528-52d9-48e5-9c4d-250c5db247f1', 'wellbeing', 'loneliness', 'lonely_19', 19, 'ฉันรู้สึกถูกกีดกัน และถูกตัดขาดออกจากผู้อื่น', NULL, 'radio', '["0", "1", "2", "3"]', true, NULL, NULL, NULL, true),
	('d86c9d19-5846-455e-9974-81728178c0d8', 'wellbeing', 'loneliness', 'lonely_20', 20, 'แม้มีคนมากมายอยู่รอบตัวแต่ฉันก็ยังรู้สึกโดดเดี่ยว', NULL, 'radio', '["0", "1", "2", "3"]', true, NULL, NULL, NULL, true),
	('2faec836-24df-4579-8edc-759221276edb', 'wellbeing', 'safety', 'helmet_driver', 1, 'สวมหมวกนิรภัยขณะขับขี่รถจักรยานยนต์', NULL, 'radio', '["ใช้ทุกครั้ง", "ใช้บางครั้ง", "ไม่เคยใช้", "ไม่เคยขี่"]', true, NULL, NULL, NULL, true),
	('ab451892-b6cb-4bec-b4b8-3274507e2594', 'wellbeing', 'safety', 'helmet_passenger', 2, 'สวมหมวกนิรภัยขณะโดยสารรถจักรยานยนต์', NULL, 'radio', '["ใช้ทุกครั้ง", "ใช้บางครั้ง", "ไม่เคยใช้", "ไม่เคยนั่งซ้อนท้าย"]', true, NULL, NULL, NULL, true),
	('f0b07387-7b75-4460-bab8-1f970e6768f6', 'wellbeing', 'safety', 'seatbelt_driver', 3, 'ใช้เข็มขัดนิรภัยขณะขับรถยนต์', NULL, 'radio', '["ใช้ทุกครั้ง", "ใช้บางครั้ง", "ไม่เคยใช้", "ไม่เคยขับ"]', true, NULL, NULL, NULL, true),
	('7c54cc31-df13-41a0-8d6e-d9038566bdff', 'wellbeing', 'safety', 'seatbelt_passenger', 4, 'ใช้เข็มขัดนิรภัยขณะเป็นผู้โดยสาร', NULL, 'radio', '["ใช้ทุกครั้ง", "ใช้บางครั้ง", "ไม่เคยใช้", "ไม่เคยนั่งข้างคนขับ"]', true, NULL, NULL, NULL, true),
	('bdd6b439-fdd2-48ee-9652-b440473d4432', 'wellbeing', 'safety', 'accident_hist', 5, 'เคยประสบอุบัติเหตุจราจร (12 เดือนที่ผ่านมา)', NULL, 'checkbox', '["คนขับรถยนต์", "ผู้โดยสารรถยนต์", "คนขี่จักรยานยนต์", "ผู้โดยสารจักรยานยนต์", "คนขี่จักรยาน", "คนเดินเท้า", "ไม่เคย"]', true, NULL, NULL, NULL, true),
	('509e42a9-be7f-40c8-b396-2d13f6fe01f5', 'wellbeing', 'safety', 'drunk_drive', 6, 'เคยขับขี่หลังดื่มแอลกอฮอล์', NULL, 'radio', '["ไม่เคย", "เคย 1 ครั้ง/เดือน", "เคย 2-3 ครั้ง/เดือน", "เคย > 3 ครั้ง/เดือน", "ไม่เคยขับขี่"]', true, NULL, NULL, NULL, true),
	('925ba979-a75a-4616-87ed-5977737b460c', 'wellbeing', 'environment', 'env_satisfaction', 1, 'ความพึงพอใจในสิ่งแวดล้อมที่ทำงาน', NULL, 'radio', '["แย่มาก", "แย่", "ปานกลาง", "ดี", "ดีมาก"]', true, NULL, NULL, NULL, true),
	('25a206d9-1cff-43f6-9cca-d3aa9bfbbf37', 'wellbeing', 'environment', 'env_glare', 2, 'แสงจ้า/ทำงานกลางแดด', NULL, 'radio', '["ใช่ (มีผลต่อสุขภาพ)", "ใช่ (ไม่มีผล)", "ไม่ใช่"]', true, NULL, NULL, NULL, true),
	('6ac92573-4325-453f-8f23-780cdf704ddb', 'wellbeing', 'environment', 'env_noise', 3, 'เสียงดัง/แรงสั่นสะเทือน', NULL, 'radio', '["ใช่ (มีผลต่อสุขภาพ)", "ใช่ (ไม่มีผล)", "ไม่ใช่"]', true, NULL, NULL, NULL, true),
	('9de3531d-aa5b-48db-976f-cb44d319f915', 'wellbeing', 'environment', 'env_smell', 4, 'กลิ่นเหม็น/สารเคมี', NULL, 'radio', '["ใช่ (มีผลต่อสุขภาพ)", "ใช่ (ไม่มีผล)", "ไม่ใช่"]', true, NULL, NULL, NULL, true),
	('9af7c426-5623-432b-92a2-43f9453a86fa', 'wellbeing', 'environment', 'env_smoke', 5, 'ควัน/ไอระเหย', NULL, 'radio', '["ใช่ (มีผลต่อสุขภาพ)", "ใช่ (ไม่มีผล)", "ไม่ใช่"]', true, NULL, NULL, NULL, true),
	('29964b4a-37d6-4f7d-891d-0767eebf0e67', 'wellbeing', 'environment', 'env_posture', 6, 'ท่าทางเดิมนานๆ/ก้มเงย', NULL, 'radio', '["ใช่ (มีผลต่อสุขภาพ)", "ใช่ (ไม่มีผล)", "ไม่ใช่"]', true, NULL, NULL, NULL, true),
	('fdd3293e-2815-4524-83cc-1c6cece86fc4', 'wellbeing', 'environment', 'env_awkward', 7, 'ท่าทางฝืนธรรมชาติ (ยกของ/เขย่ง)', NULL, 'radio', '["ใช่ (มีผลต่อสุขภาพ)", "ใช่ (ไม่มีผล)", "ไม่ใช่"]', true, NULL, NULL, NULL, true),
	('4ceeece2-0c61-440b-bfbf-aca545ef296f', 'wellbeing', 'environment', 'pm25_impact', 8, 'ปัญหา PM 2.5 ในพื้นที่ (1 ปีที่ผ่านมา)', NULL, 'radio', '["ไม่มีเลย", "น้อย", "ปานกลาง", "มาก", "รุนแรงมาก"]', true, NULL, NULL, NULL, true),
	('8ec31e76-57d7-4760-843e-009ddcc8d6e3', 'wellbeing', 'environment', 'pm25_symptom', 9, 'อาการเจ็บป่วยจาก PM 2.5', NULL, 'checkbox', '["ไม่มี", "ไอ/คัดจมูก/แสบคอ", "หายใจไม่เต็มอิ่ม", "แสบตา", "ปวดศีรษะ"]', true, NULL, NULL, NULL, true),
	('bdfd27bb-2435-48d0-acab-248cb280b87c', 'wellbeing', 'environment', 'life_quality', 10, 'คุณภาพชีวิตโดยรวม', NULL, 'radio', '["แย่มาก", "แย่", "ปานกลาง", "ดี", "ดีมาก"]', true, NULL, NULL, NULL, true),
	('4e8c159a-aa0e-4c5d-b86e-8f36406c849c', 'wellbeing', 'environment', 'emerging_known', 11, 'รู้จัก "โรคอุบัติใหม่" หรือไม่', NULL, 'radio', '["เคยได้ยิน", "ไม่เคย"]', true, NULL, NULL, NULL, true),
	('d7bd48a5-2d24-488d-a182-b1ec4e72ddb2', 'wellbeing', 'environment', 'emerging_list', 12, 'โรคอุบัติใหม่ที่รู้จัก', NULL, 'checkbox', '["COVID-19", "ไข้หวัดนก", "ไข้ซิกา", "อื่นๆ"]', true, NULL, NULL, NULL, true),
	('9da9dba1-29f8-4084-bc3c-1e98812d0de7', 'wellbeing', 'environment', 'climate_impact', 13, 'ผลกระทบจากโลกร้อนต่อสุขภาพ', NULL, 'radio', '["ไม่มีเลย", "น้อย", "ปานกลาง", "มาก", "รุนแรงมาก"]', true, NULL, NULL, NULL, true),
	('34859f4b-4bdd-4895-8daa-b4ce8fd46396', 'wellbeing', 'environment', 'covid_history', 14, 'ติด COVID-19 ใน 6 เดือนที่ผ่านมา', NULL, 'radio', '["ไม่เคย", "1 ครั้ง", "> 1 ครั้ง"]', true, NULL, NULL, NULL, true),
	('391b40e4-8a3c-4c7c-8a56-03e9a227c9c8', 'ch1', 'ch1_basic', 'org_code', 1, 'รหัสองค์กร', 'กรอกอัตโนมัติจากบัญชีผู้ใช้', 'text', NULL, true, NULL, NULL, NULL, true),
	('52730020-0e04-419f-a16e-384923e27143', 'ch1', 'ch1_basic', 'organization', 2, 'ชื่อหน่วยงาน / ส่วนราชการ', NULL, 'text', NULL, true, NULL, NULL, NULL, true),
	('59c1f824-a4c2-4229-b15f-c2918e15e301', 'ch1', 'ch1_basic', 'total_staff', 3, 'จำนวนบุคลากรทั้งหมด', NULL, 'number', NULL, true, NULL, 'คน', '{"max": 999999, "min": 1}', true),
	('a213d3bb-1b0d-412a-8133-2d8b2f476f3a', 'ch1', 'ch1_basic', 'strategic_overview', 4, 'ภาพรวมยุทธศาสตร์ขององค์กร', 'อธิบายทิศทางเชิงยุทธศาสตร์หลักขององค์กร', 'textarea', NULL, false, NULL, NULL, NULL, true),
	('44a776bc-bac8-4149-b9e4-93b3a7c270b8', 'ch1', 'ch1_basic', 'org_structure', 5, 'โครงสร้างองค์กร', NULL, 'textarea', NULL, false, NULL, NULL, NULL, true),
	('e1cdeaa8-3287-4fdb-b67e-a1ce095beac4', 'ch1', 'ch1_basic', '_h_age', 10, '— การกระจายตามช่วงอายุ —', NULL, 'heading', NULL, false, NULL, NULL, NULL, true),
	('c850fc6b-ba54-4091-bbb2-93f58e663cc9', 'ch1', 'ch1_basic', 'age_u30', 11, 'อายุต่ำกว่า 30 ปี', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 99999, "min": 0}', true),
	('b45fa381-6768-4d36-90cd-0ab0dad4fec5', 'ch1', 'ch1_basic', 'age_31_40', 12, 'อายุ 31–40 ปี', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 99999, "min": 0}', true),
	('868c2a5a-1266-46ef-bd0c-816bf3b344df', 'ch1', 'ch1_basic', 'age_41_50', 13, 'อายุ 41–50 ปี', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 99999, "min": 0}', true),
	('33781520-a4ae-4ec6-b6c2-786c958956d6', 'ch1', 'ch1_basic', 'age_51_60', 14, 'อายุ 51–60 ปี', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 99999, "min": 0}', true),
	('1a7cc641-cfd8-4b93-95cc-0f87af4c56e7', 'ch1', 'ch1_basic', '_h_service', 20, '— อายุราชการ (ปี) —', NULL, 'heading', NULL, false, NULL, NULL, NULL, true),
	('d8fc8d83-debc-48a4-bacd-8198db996837', 'ch1', 'ch1_basic', 'service_u1', 21, 'น้อยกว่า 1 ปี', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 99999, "min": 0}', true),
	('ed73361e-ea51-472f-afcc-63c51922c62f', 'ch1', 'ch1_basic', 'service_1_5', 22, '1–5 ปี', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 99999, "min": 0}', true),
	('fd0a013d-dd6c-4256-9eee-3c8da1b6baf4', 'ch1', 'ch1_basic', 'service_6_10', 23, '6–10 ปี', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 99999, "min": 0}', true),
	('f95447c1-6347-47a8-bb0e-2cc6cc5f73c0', 'ch1', 'ch1_basic', 'service_11_15', 24, '11–15 ปี', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 99999, "min": 0}', true),
	('fe6416ec-f877-4d45-bbc2-ddec534f9c35', 'ch1', 'ch1_basic', 'service_16_20', 25, '16–20 ปี', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 99999, "min": 0}', true),
	('c34826f7-9049-4300-92f5-4fc562d03609', 'ch1', 'ch1_basic', 'service_21_25', 26, '21–25 ปี', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 99999, "min": 0}', true),
	('d4b80513-b3b0-45d9-b9c1-8a45ec1d099b', 'ch1', 'ch1_basic', 'service_26_30', 27, '26–30 ปี', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 99999, "min": 0}', true),
	('9c023d70-c27d-4ace-b207-ca269cc20bdf', 'ch1', 'ch1_basic', 'service_over30', 28, 'มากกว่า 30 ปี', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 99999, "min": 0}', true),
	('e36d47d5-3bb0-4642-afab-c08d178d76b7', 'ch1', 'ch1_basic', '_h_pos_o', 30, '— ประเภทตำแหน่ง: อำนวยการ/บริหาร (O) —', NULL, 'heading', NULL, false, NULL, NULL, NULL, true),
	('2ce09b32-2f46-4e3e-9945-85071870ea10', 'ch1', 'ch1_basic', 'pos_o1', 31, 'ระดับ O1 (ปฏิบัติการ)', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 99999, "min": 0}', true),
	('bb9b4c9b-11ad-411f-80b8-0bd9ea8666bb', 'ch1', 'ch1_basic', 'pos_o2', 32, 'ระดับ O2 (ชำนาญการ)', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 99999, "min": 0}', true),
	('b3f664a9-00be-43d9-bc5e-45ba7087dd6e', 'ch1', 'ch1_basic', 'pos_o3', 33, 'ระดับ O3 (ชำนาญการพิเศษ)', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 99999, "min": 0}', true),
	('27268b83-a020-4564-bcad-08ee153de660', 'ch1', 'ch1_basic', 'pos_o4', 34, 'ระดับ O4 (เชี่ยวชาญ)', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 99999, "min": 0}', true),
	('b019d2b5-6c46-49f2-8788-fc6914a7b1e7', 'ch1', 'ch1_basic', '_h_pos_k', 40, '— ประเภทตำแหน่ง: วิชาการ (K) —', NULL, 'heading', NULL, false, NULL, NULL, NULL, true),
	('c48edf3b-3081-4a3e-8879-27dedbd5782e', 'ch1', 'ch1_basic', 'pos_k1', 41, 'ระดับ K1 (ปฏิบัติการ)', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 99999, "min": 0}', true),
	('0af7c242-4422-4776-a62e-a21eb06954b4', 'ch1', 'ch1_basic', 'pos_k2', 42, 'ระดับ K2 (ชำนาญการ)', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 99999, "min": 0}', true),
	('9922d85e-baa8-4991-a412-c03c73c5d3f2', 'ch1', 'ch1_basic', 'pos_k3', 43, 'ระดับ K3 (ชำนาญการพิเศษ)', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 99999, "min": 0}', true),
	('5f317edf-ea24-4b95-ac39-21333a060db7', 'ch1', 'ch1_basic', 'pos_k4', 44, 'ระดับ K4 (เชี่ยวชาญ)', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 99999, "min": 0}', true),
	('7a1c95c4-3a1e-40b9-9352-7faa97a43bec', 'ch1', 'ch1_basic', 'pos_k5', 45, 'ระดับ K5 (ทรงคุณวุฒิ)', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 99999, "min": 0}', true),
	('797f261a-f26b-4469-bfae-dc97e0b9806b', 'ch1', 'ch1_basic', '_h_pos_m', 50, '— ประเภทตำแหน่ง: ทั่วไป (M) —', NULL, 'heading', NULL, false, NULL, NULL, NULL, true),
	('54538896-6820-4857-8707-fd9df22917b5', 'ch1', 'ch1_basic', 'pos_m1', 51, 'ระดับ M1 (ปฏิบัติงาน)', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 99999, "min": 0}', true),
	('60d131dd-003b-4918-90fe-c8534cabf051', 'ch1', 'ch1_basic', 'pos_m2', 52, 'ระดับ M2 (ชำนาญงาน)', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 99999, "min": 0}', true),
	('c85802c9-e8d6-4808-a589-d1be89fa26e7', 'ch1', 'ch1_basic', '_h_pos_s', 55, '— ประเภทตำแหน่ง: เชี่ยวชาญเฉพาะ (S) —', NULL, 'heading', NULL, false, NULL, NULL, NULL, true),
	('0f2ca31c-0b87-458a-8d7c-ed1a3ce8223d', 'ch1', 'ch1_basic', 'pos_s1', 56, 'ระดับ S1', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 99999, "min": 0}', true),
	('4b607dec-365d-4948-81e2-1198393ef101', 'ch1', 'ch1_basic', 'pos_s2', 57, 'ระดับ S2', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 99999, "min": 0}', true),
	('d3087182-42c8-4e30-806c-54b344ef9978', 'ch1', 'ch1_basic', '_h_type', 60, '— ประเภทบุคลากร —', NULL, 'heading', NULL, false, NULL, NULL, NULL, true),
	('4b6cda69-6691-4923-83f1-1ef419e7f46e', 'ch1', 'ch1_basic', 'type_official', 61, 'ข้าราชการ', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 99999, "min": 0}', true),
	('f031cd75-6a15-477d-bb85-7c1685754994', 'ch1', 'ch1_basic', 'type_employee', 62, 'พนักงานราชการ', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 99999, "min": 0}', true),
	('147e3da8-53af-4bb2-b371-35d1470834ea', 'ch1', 'ch1_basic', 'type_contract', 63, 'ลูกจ้างประจำ/ชั่วคราว', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 99999, "min": 0}', true),
	('b51d79b2-9aaa-4f2e-902b-014b3decf804', 'ch1', 'ch1_basic', 'type_other', 64, 'อื่นๆ', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 99999, "min": 0}', true),
	('0625e21b-9107-47d4-a20d-e14f45877a91', 'ch1', 'ch1_basic', '_h_turnover', 70, '— การลาออกและโอนย้าย (ภาพรวม) —', NULL, 'heading', NULL, false, NULL, NULL, NULL, true),
	('3a8242ce-8fdc-4ee9-b632-2dc58d1904b4', 'ch1', 'ch1_basic', 'turnover_count', 71, 'จำนวนลาออก/ปี (รวม)', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 99999, "min": 0}', true),
	('2be458b8-d2e9-4ad4-a962-b9e3c2a5eb54', 'ch1', 'ch1_basic', 'turnover_rate', 72, 'อัตราการลาออก', NULL, 'number', NULL, false, NULL, '%', '{"max": 100, "min": 0, "step": 0.01}', true),
	('a16e1ba7-4b31-4137-8a4d-f53c43f9b226', 'ch1', 'ch1_basic', 'transfer_count', 73, 'จำนวนโอนย้าย/ปี (รวม)', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 99999, "min": 0}', true),
	('1535cf70-a996-4947-9f89-4570a101c19a', 'ch1', 'ch1_basic', 'transfer_rate', 74, 'อัตราการโอนย้าย', NULL, 'number', NULL, false, NULL, '%', '{"max": 100, "min": 0, "step": 0.01}', true),
	('e33ef326-5ba8-4987-8bf2-c6ba3fe272e5', 'ch1', 'ch1_basic', '_h_annual', 80, '— ข้อมูลบุคลากรรายปี (ย้อนหลัง 5 ปี) —', 'จำนวนบุคลากรต้นปี ปลายปี และจำนวนลาออก', 'heading', NULL, false, NULL, NULL, NULL, true),
	('235f3265-c615-4822-abc2-abc6fd2219d4', 'ch1', 'ch1_basic', 'begin_2564', 81, 'จำนวนต้นปี 2564 (ปีงบ 64)', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 999999, "min": 0}', true),
	('0b91b214-f5be-4a1f-91aa-4fa6a38af9d5', 'ch1', 'ch1_basic', 'begin_2565', 82, 'จำนวนต้นปี 2565 (ปีงบ 65)', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 999999, "min": 0}', true),
	('1dccfe29-01cc-426d-9d9d-13ad0d5aae2d', 'ch1', 'ch1_basic', 'begin_2566', 83, 'จำนวนต้นปี 2566 (ปีงบ 66)', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 999999, "min": 0}', true),
	('bf3fe657-92ec-4bc0-94f7-93b230b1a242', 'ch1', 'ch1_basic', 'begin_2567', 84, 'จำนวนต้นปี 2567 (ปีงบ 67)', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 999999, "min": 0}', true),
	('cf1452fe-3419-4da6-90b5-c6e6ee4c6d1a', 'ch1', 'ch1_basic', 'begin_2568', 85, 'จำนวนต้นปี 2568 (ปีงบ 68)', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 999999, "min": 0}', true),
	('10ef60cb-dd27-48a9-aa91-929dd5a36fbf', 'ch1', 'ch1_basic', 'end_2564', 86, 'จำนวนปลายปี 2564', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 999999, "min": 0}', true),
	('873bfe6c-3f9b-4380-9139-200f5bdba23f', 'ch1', 'ch1_basic', 'end_2565', 87, 'จำนวนปลายปี 2565', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 999999, "min": 0}', true),
	('3c0c95c3-9c7d-458a-b6cc-b22c97cd7b1e', 'ch1', 'ch1_basic', 'end_2566', 88, 'จำนวนปลายปี 2566', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 999999, "min": 0}', true),
	('f6f28edd-dbd7-4c32-8364-eb05f8d575e9', 'ch1', 'ch1_basic', 'end_2567', 89, 'จำนวนปลายปี 2567', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 999999, "min": 0}', true),
	('394d30a5-271a-4b09-b48b-c54b75c2b219', 'ch1', 'ch1_basic', 'end_2568', 90, 'จำนวนปลายปี 2568', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 999999, "min": 0}', true),
	('b9d0df52-1e34-4b76-9a4a-fc7481d304d0', 'ch1', 'ch1_basic', 'leave_2564', 91, 'จำนวนลาออกปี 2564', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 99999, "min": 0}', true),
	('4a0cbf3c-fc17-4ac0-b4c1-acce8fee23f6', 'ch1', 'ch1_basic', 'leave_2565', 92, 'จำนวนลาออกปี 2565', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 99999, "min": 0}', true),
	('4cc66ef3-26d6-4577-a383-4ba279f37a65', 'ch1', 'ch1_basic', 'leave_2566', 93, 'จำนวนลาออกปี 2566', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 99999, "min": 0}', true),
	('d3df281b-332e-4e67-b228-3584ae9222c9', 'ch1', 'ch1_basic', 'leave_2567', 94, 'จำนวนลาออกปี 2567', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 99999, "min": 0}', true),
	('209feb66-0d97-409d-8f08-51bda1e4e13d', 'ch1', 'ch1_basic', 'leave_2568', 95, 'จำนวนลาออกปี 2568', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 99999, "min": 0}', true),
	('d6b3c87b-c164-42cb-946a-eec134071504', 'ch1', 'ch1_policy', 'related_policies', 1, 'นโยบายที่เกี่ยวข้อง', 'ระบุนโยบาย พ.ร.บ. หรือยุทธศาสตร์ที่องค์กรต้องดำเนินการ', 'textarea', NULL, false, NULL, NULL, NULL, true),
	('812f0bb2-297b-438d-bcac-4272da1ad238', 'ch1', 'ch1_policy', 'context_challenges', 2, 'บริบทและความท้าทายขององค์กร', 'อธิบายสภาพแวดล้อมและปัจจัยความท้าทายที่ส่งผลต่อบุคลากร', 'textarea', NULL, false, NULL, NULL, NULL, true),
	('d9a58b35-a56a-463f-81d7-9048fedadf7f', 'ch1', 'ch1_wellbeing', 'disease_report_type', 1, 'รูปแบบข้อมูลโรค NCD', 'เลือกว่าข้อมูลโรคด้านล่างเป็นข้อมูลจริงหรือประมาณการ', 'radio', '[{"label": "ข้อมูลจริง (จากเวชระเบียน)", "value": "actual"}, {"label": "ประมาณการ", "value": "estimated"}, {"label": "ไม่มีข้อมูล", "value": "none"}]', false, NULL, NULL, NULL, true),
	('a130c80c-bbfd-4dce-a2e1-a7ec3010c50c', 'ch1', 'ch1_wellbeing', 'disease_diabetes', 2, 'โรคเบาหวาน', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 99999, "min": 0}', true),
	('987df474-9b49-46be-9c3d-38fb9ea8876b', 'ch1', 'ch1_wellbeing', 'disease_hypertension', 3, 'โรคความดันโลหิตสูง', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 99999, "min": 0}', true),
	('bcf1cb69-5002-4120-bb4a-aa69530a33d0', 'ch1', 'ch1_wellbeing', 'disease_cardiovascular', 4, 'โรคหัวใจและหลอดเลือด', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 99999, "min": 0}', true),
	('c9054053-98e8-4eb7-827d-89d610595151', 'ch1', 'ch1_wellbeing', 'disease_kidney', 5, 'โรคไต', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 99999, "min": 0}', true),
	('b86f3945-16dd-4b23-a210-ac9b55ea4b35', 'ch1', 'ch1_wellbeing', 'disease_liver', 6, 'โรคตับ', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 99999, "min": 0}', true),
	('0d6d4422-f5b0-42e4-baaf-8a34afe2a1f5', 'ch1', 'ch1_wellbeing', 'disease_cancer', 7, 'โรคมะเร็ง', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 99999, "min": 0}', true),
	('82e82be7-a5dc-453e-bad7-fdd21fef1af7', 'ch1', 'ch1_wellbeing', 'disease_obesity', 8, 'โรคอ้วน (BMI≥30)', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 99999, "min": 0}', true),
	('f3133434-16c5-4957-9200-e2202e7f2b07', 'ch1', 'ch1_wellbeing', 'disease_other_count', 9, 'โรคอื่นๆ (จำนวน)', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 99999, "min": 0}', true),
	('d0e09eee-b2db-4319-994c-2c8424b877c6', 'ch1', 'ch1_wellbeing', 'disease_other_detail', 10, 'โรคอื่นๆ (ระบุชื่อโรค)', NULL, 'textarea', NULL, false, NULL, NULL, NULL, true),
	('2da2ff0d-c271-4f76-981a-f067f26646c4', 'ch1', 'ch1_wellbeing', 'sick_leave_report_type', 11, 'รูปแบบข้อมูลการลาป่วย', NULL, 'radio', '[{"label": "ข้อมูลจริง", "value": "actual"}, {"label": "ประมาณการ", "value": "estimated"}, {"label": "ไม่มีข้อมูล", "value": "none"}]', false, NULL, NULL, NULL, true),
	('95242c85-7876-41d9-9b2b-1e804984d845', 'ch1', 'ch1_wellbeing', 'sick_leave_days', 12, 'วันลาป่วยรวมทั้งหมด/ปี', NULL, 'number', NULL, false, NULL, 'วัน', '{"max": 999999, "min": 0}', true),
	('6fc62385-4611-4663-aabd-e1f801d98cc5', 'ch1', 'ch1_wellbeing', 'sick_leave_avg', 13, 'วันลาป่วยเฉลี่ย/คน/ปี', NULL, 'number', NULL, false, NULL, 'วัน', '{"max": 365, "min": 0, "step": 0.1}', true),
	('dddd766e-e791-478a-94f4-36facc6e1a1f', 'ch1', 'ch1_wellbeing', 'clinic_report_type', 14, 'รูปแบบข้อมูลคลินิก/สถานพยาบาล', NULL, 'radio', '[{"label": "ข้อมูลจริง", "value": "actual"}, {"label": "ประมาณการ", "value": "estimated"}, {"label": "ไม่มีคลินิก/ไม่มีข้อมูล", "value": "none"}]', false, NULL, NULL, NULL, true),
	('62e4e0c7-97ee-477d-bbd8-b124133894d6', 'ch1', 'ch1_wellbeing', 'clinic_users_per_year', 15, 'จำนวนผู้ใช้บริการคลินิก/ปี', NULL, 'number', NULL, false, NULL, 'คน', '{"max": 99999, "min": 0}', true),
	('809fe381-6ef2-4ba5-bbaa-0cb4b4ba0743', 'ch1', 'ch1_wellbeing', 'clinic_top_symptoms', 16, 'อาการ/โรคที่พบบ่อยสุด 3 อันดับ', NULL, 'textarea', NULL, false, NULL, NULL, NULL, true),
	('b4108148-013c-4b53-a980-6e0e684be10e', 'ch1', 'ch1_wellbeing', 'clinic_top_medications', 17, 'ยาที่ใช้บ่อยสุด 3 อันดับ', NULL, 'textarea', NULL, false, NULL, NULL, NULL, true),
	('ca6539ff-c980-444b-ab16-94ba2e84a239', 'ch1', 'ch1_wellbeing', 'mental_health_report_type', 18, 'รูปแบบข้อมูลสุขภาพจิต', NULL, 'radio', '[{"label": "ข้อมูลจริง", "value": "actual"}, {"label": "ประมาณการ", "value": "estimated"}, {"label": "ไม่มีข้อมูล", "value": "none"}]', false, NULL, NULL, NULL, true),
	('0db97e5b-0b6e-4b7b-b81d-42660354835e', 'ch1', 'ch1_wellbeing', 'mental_stress', 19, 'ความเครียดในการทำงาน', 'ระบุจำนวนหรืออธิบายสถานการณ์', 'textarea', NULL, false, NULL, NULL, NULL, true),
	('2bfe9501-4cd6-4e32-84ab-491af8f044f0', 'ch1', 'ch1_wellbeing', 'mental_anxiety', 20, 'ภาวะวิตกกังวล', NULL, 'textarea', NULL, false, NULL, NULL, NULL, true),
	('e1d82de3-0ff7-4475-9e20-2dabe77ec032', 'ch1', 'ch1_wellbeing', 'mental_sleep', 21, 'ปัญหาการนอนหลับ', NULL, 'textarea', NULL, false, NULL, NULL, NULL, true),
	('df2271f5-a2bf-4a76-a869-7566c97a2399', 'ch1', 'ch1_wellbeing', 'mental_burnout', 22, 'ภาวะหมดไฟ (Burnout)', NULL, 'textarea', NULL, false, NULL, NULL, NULL, true),
	('07c1c2c3-ccbc-46cd-831b-4031c1bffd3f', 'ch1', 'ch1_wellbeing', 'mental_depression', 23, 'ภาวะซึมเศร้า', NULL, 'textarea', NULL, false, NULL, NULL, NULL, true),
	('6e19031a-dbf5-4a18-b7fd-a442def8c307', 'ch1', 'ch1_wellbeing', '_h_engagement', 24, '— Engagement Score รายปี —', 'คะแนน 0–100 หากไม่มีข้อมูลปีใดให้เว้นว่าง', 'heading', NULL, false, NULL, NULL, NULL, true),
	('5383aed5-2610-4107-a5e0-ad9443b355cf', 'ch1', 'ch1_wellbeing', 'engagement_score_2568', 25, 'Engagement Score ปี 2568', NULL, 'number', NULL, false, NULL, 'คะแนน', '{"max": 100, "min": 0, "step": 0.1}', true),
	('fdca050f-539a-47e3-80f5-e1e5438fde10', 'ch1', 'ch1_wellbeing', 'engagement_score_2567', 26, 'Engagement Score ปี 2567', NULL, 'number', NULL, false, NULL, 'คะแนน', '{"max": 100, "min": 0, "step": 0.1}', true),
	('b6aadfd8-11c5-48fd-a4af-ed55fce26c1c', 'ch1', 'ch1_wellbeing', 'engagement_score_2566', 27, 'Engagement Score ปี 2566', NULL, 'number', NULL, false, NULL, 'คะแนน', '{"max": 100, "min": 0, "step": 0.1}', true),
	('4c1c8716-096c-4b15-8423-1027934795c6', 'ch1', 'ch1_wellbeing', 'engagement_score_2565', 28, 'Engagement Score ปี 2565', NULL, 'number', NULL, false, NULL, 'คะแนน', '{"max": 100, "min": 0, "step": 0.1}', true),
	('0f2424ed-adb1-4ceb-ab10-0f5744d27350', 'ch1', 'ch1_wellbeing', 'engagement_score_2564', 29, 'Engagement Score ปี 2564', NULL, 'number', NULL, false, NULL, 'คะแนน', '{"max": 100, "min": 0, "step": 0.1}', true),
	('0d4eb520-1b1c-415a-bc69-ed9e72a31c59', 'ch1', 'ch1_wellbeing', 'engagement_low_areas', 30, 'ด้านที่มีคะแนน Engagement ต่ำ', 'ระบุประเด็นหรือหน่วยงานที่มีความผูกพันต่ำ', 'textarea', NULL, false, NULL, NULL, NULL, true),
	('24f4d472-5d17-40e7-bef5-b9921a2b8116', 'ch1', 'ch1_wellbeing', 'other_wellbeing_surveys', 31, 'การสำรวจสุขภาวะอื่นๆ ที่ดำเนินการ', 'เช่น Happy Workplace, PHQ-9, ฯลฯ', 'textarea', NULL, false, NULL, NULL, NULL, true),
	('ee2d426c-08d9-4238-9c1a-295acbd32314', 'ch1', 'ch1_system', 'mentoring_system', 1, 'ระบบพี่เลี้ยง (Mentoring)', NULL, 'radio', '[{"label": "มีระบบ", "value": "yes"}, {"label": "มีบางส่วน", "value": "partial"}, {"label": "ยังไม่มี", "value": "no"}]', false, NULL, NULL, NULL, true),
	('859cd492-d308-4a77-8aa6-ff2aec668088', 'ch1', 'ch1_system', 'job_rotation', 2, 'ระบบสับเปลี่ยนหมุนเวียนงาน (Job Rotation)', NULL, 'radio', '[{"label": "มีระบบ", "value": "yes"}, {"label": "มีบางส่วน", "value": "partial"}, {"label": "ยังไม่มี", "value": "no"}]', false, NULL, NULL, NULL, true),
	('722be886-9066-4238-9d2b-374cb61cc088', 'ch1', 'ch1_system', 'idp_system', 3, 'แผนพัฒนารายบุคคล (IDP)', NULL, 'radio', '[{"label": "มีระบบ", "value": "yes"}, {"label": "มีบางส่วน", "value": "partial"}, {"label": "ยังไม่มี", "value": "no"}]', false, NULL, NULL, NULL, true),
	('7c87e805-8478-42f8-a2d2-aea2cf7c8202', 'ch1', 'ch1_system', 'career_path_system', 4, 'เส้นทางความก้าวหน้าในสายอาชีพ (Career Path)', NULL, 'radio', '[{"label": "มีระบบ", "value": "yes"}, {"label": "มีบางส่วน", "value": "partial"}, {"label": "ยังไม่มี", "value": "no"}]', false, NULL, NULL, NULL, true),
	('773a179a-ad31-4b4e-9a77-96a316138f9f', 'ch1', 'ch1_system', '_h_training', 5, '— ชั่วโมงฝึกอบรม/พัฒนา —', NULL, 'heading', NULL, false, NULL, NULL, NULL, true),
	('b55eecbe-c081-4f48-8e33-5c775f56b81f', 'ch1', 'ch1_system', 'training_hours', 6, 'ชั่วโมงอบรม/คน/ปี (ภาพรวม)', 'ใส่ตัวเลขหรือช่วง เช่น "20" หรือ "15-25"', 'text', NULL, false, NULL, NULL, NULL, true),
	('59700094-7cf5-410c-91bd-eaf4106326ea', 'ch1', 'ch1_system', 'training_hours_2568', 7, 'ชั่วโมงอบรม/คน ปี 2568', NULL, 'number', NULL, false, NULL, 'ชม.', '{"max": 9999, "min": 0, "step": 0.5}', true),
	('b5927d88-8ad1-4a94-89ef-094fb325e533', 'ch1', 'ch1_system', 'training_hours_2567', 8, 'ชั่วโมงอบรม/คน ปี 2567', NULL, 'number', NULL, false, NULL, 'ชม.', '{"max": 9999, "min": 0, "step": 0.5}', true),
	('891cb874-d683-429a-810f-bef2fec7757b', 'ch1', 'ch1_system', 'training_hours_2566', 9, 'ชั่วโมงอบรม/คน ปี 2566', NULL, 'number', NULL, false, NULL, 'ชม.', '{"max": 9999, "min": 0, "step": 0.5}', true),
	('99b0c8e6-7859-43d5-a2e3-51edd0c16e3a', 'ch1', 'ch1_system', 'training_hours_2565', 10, 'ชั่วโมงอบรม/คน ปี 2565', NULL, 'number', NULL, false, NULL, 'ชม.', '{"max": 9999, "min": 0, "step": 0.5}', true),
	('b503f570-268e-4670-b056-8794dfb01277', 'ch1', 'ch1_system', 'training_hours_2564', 11, 'ชั่วโมงอบรม/คน ปี 2564', NULL, 'number', NULL, false, NULL, 'ชม.', '{"max": 9999, "min": 0, "step": 0.5}', true),
	('0ce236fc-52f2-4966-be88-bdfcdfc88bf7', 'ch1', 'ch1_system', 'digital_systems', 12, 'ระบบดิจิทัลที่ใช้ในองค์กร', 'เลือกทุกระบบที่ใช้งานจริง', 'checkbox', '[{"label": "ระบบสารบรรณอิเล็กทรอนิกส์", "value": "e_doc"}, {"label": "ลายเซ็นดิจิทัล", "value": "e_sign"}, {"label": "Cloud Storage/Drive", "value": "cloud"}, {"label": "ระบบ HR ดิจิทัล", "value": "hr_digital"}, {"label": "ฐานข้อมูลสุขภาพบุคลากร", "value": "health_db"}, {"label": "ยังไม่มีระบบดิจิทัล", "value": "none"}]', false, NULL, NULL, NULL, true),
	('84a1bbda-46cf-4d8f-bdd6-f927e598b1d3', 'ch1', 'ch1_system', 'ergonomics_status', 13, 'สถานะการยศาสตร์สถานที่ทำงาน (Ergonomics)', NULL, 'radio', '[{"label": "ยังไม่ได้ดำเนินการ", "value": "none"}, {"label": "มีแผนดำเนินการ", "value": "planned"}, {"label": "กำลังดำเนินการ", "value": "in_progress"}, {"label": "ดำเนินการแล้ว", "value": "done"}]', false, NULL, NULL, NULL, true),
	('00289357-8fff-4de1-a53e-39d2295c6c93', 'ch1', 'ch1_system', 'ergonomics_detail', 14, 'รายละเอียดการดำเนินการด้านการยศาสตร์', 'กรอกเฉพาะกรณีที่มีแผน/กำลังดำเนินการ/เสร็จแล้ว', 'textarea', NULL, false, NULL, NULL, NULL, true),
	('ce369772-b5ad-4d44-ad15-8ab52dd89e49', 'ch1', 'ch1_goal', '_h_priority', 1, '— ลำดับความสำคัญเชิงยุทธศาสตร์ด้านสุขภาวะ —', 'ระบุหัวข้อที่ต้องการพัฒนาสูงสุด 3 อันดับแรก', 'heading', NULL, false, NULL, NULL, NULL, true),
	('408f91b1-acc1-40dd-b683-0cfb22f873c9', 'ch1', 'ch1_goal', 'strategic_priority_rank1', 2, 'อันดับ 1 — ด้านที่ต้องการพัฒนามากที่สุด', NULL, 'text', NULL, false, NULL, NULL, NULL, true),
	('5becfc61-917c-4ab5-8528-826a026c163d', 'ch1', 'ch1_goal', 'strategic_priority_rank2', 3, 'อันดับ 2', NULL, 'text', NULL, false, NULL, NULL, NULL, true),
	('b30f20db-f680-42a3-b74b-4596956f9a9a', 'ch1', 'ch1_goal', 'strategic_priority_rank3', 4, 'อันดับ 3', NULL, 'text', NULL, false, NULL, NULL, NULL, true),
	('948f28ba-b53a-400c-8558-08e216972a8d', 'ch1', 'ch1_goal', 'strategic_priority_other', 5, 'ด้านอื่นๆ ที่ต้องการพัฒนา (ระบุเพิ่มเติม)', NULL, 'textarea', NULL, false, NULL, NULL, NULL, true),
	('f90bf751-d655-4d07-ab7e-0a0f8cb22cc5', 'ch1', 'ch1_goal', 'intervention_packages_feedback', 6, 'ข้อเสนอแนะต่อชุดกิจกรรม/โปรแกรมสุขภาวะ', 'ความคิดเห็นเกี่ยวกับโปรแกรม intervention ที่ต้องการจาก NIDA', 'textarea', NULL, false, NULL, NULL, NULL, true),
	('63a40bf3-a626-4fb5-9afe-8639e1f868d3', 'ch1', 'ch1_goal', '_h_hrd', 7, '— แผนพัฒนาทรัพยากรมนุษย์ (HRD Plan) —', NULL, 'heading', NULL, false, NULL, NULL, NULL, true),
	('e7713c83-06d2-4485-987a-c6840ad8aaf0', 'ch1', 'ch1_goal', 'hrd_plan_url', 8, 'ลิงก์แผน HRD (ถ้ามี)', 'URL ไปยังเอกสารแผน HRD ขององค์กร', 'text', NULL, false, NULL, NULL, NULL, true),
	('2f3fe419-5ada-41e8-acbc-ca54f0314082', 'ch1', 'ch1_goal', 'hrd_plan_results', 9, 'ผลการดำเนินงานตามแผน HRD', 'สรุปผลลัพธ์หลักจากการดำเนินงานพัฒนาบุคลากรในช่วงที่ผ่านมา', 'textarea', NULL, false, NULL, NULL, NULL, true);


--
-- Data for Name: form_windows; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."form_windows" ("id", "form_code", "round_code", "org_code", "opens_at", "closes_at", "edit_until", "is_active", "created_by", "created_at", "updated_at", "is_open") VALUES
	('51730c3d-78bc-4921-8907-e6cc7637913d', 'ch1', 'round_2569', 'dcy', '2025-01-01 00:00:00+00', '2026-12-31 00:00:00+00', '2026-12-31 00:00:00+00', true, NULL, '2026-03-21 03:14:21.990558+00', '2026-03-21 03:14:21.990558+00', true),
	('f54aa29f-2715-4765-a47a-d2eb9d70a60a', 'ch1', 'round_2569', 'rid', '2025-01-01 00:00:00+00', '2026-12-31 00:00:00+00', '2026-12-31 00:00:00+00', true, NULL, '2026-03-21 03:14:21.990558+00', '2026-03-21 03:14:21.990558+00', true),
	('aec791c5-c30d-403e-a10f-ee9cf9833bde', 'ch1', 'round_2569', 'dss', '2025-01-01 00:00:00+00', '2026-12-31 00:00:00+00', '2026-12-31 00:00:00+00', true, NULL, '2026-03-21 03:14:21.990558+00', '2026-03-21 03:14:21.990558+00', true),
	('c5389f31-e87b-4adc-9541-301cb9fe41c2', 'ch1', 'round_2569', 'dcp', '2025-01-01 00:00:00+00', '2026-12-31 00:00:00+00', '2026-12-31 00:00:00+00', true, NULL, '2026-03-21 03:14:21.990558+00', '2026-03-21 03:14:21.990558+00', true),
	('09fb51f7-ad37-4dbf-8369-414c63b24161', 'ch1', 'round_2569', 'dmh', '2025-01-01 00:00:00+00', '2026-12-31 00:00:00+00', '2026-12-31 00:00:00+00', true, NULL, '2026-03-21 03:14:21.990558+00', '2026-03-21 03:14:21.990558+00', true),
	('d3350192-aaa6-4307-afd5-1f171b230c4b', 'ch1', 'round_2569', 'tmd', '2025-01-01 00:00:00+00', '2026-12-31 00:00:00+00', '2026-12-31 00:00:00+00', true, NULL, '2026-03-21 03:14:21.990558+00', '2026-03-21 03:14:21.990558+00', true),
	('47ced226-e30c-4a76-a6c8-efa92ccab58d', 'ch1', 'round_2569', 'nrct', '2025-01-01 00:00:00+00', '2026-12-31 00:00:00+00', '2026-12-31 00:00:00+00', true, NULL, '2026-03-19 17:15:31.887367+00', '2026-03-19 17:49:06.203919+00', false),
	('baf73bf9-4ba9-41e3-b6a6-8885c686f0c5', 'ch1', 'round_2569', 'onep', '2025-01-01 00:00:00+00', '2026-12-31 00:00:00+00', '2026-12-31 00:00:00+00', true, NULL, '2026-03-21 03:14:21.990558+00', '2026-03-21 03:14:21.990558+00', true),
	('315776ab-e190-4f7e-b1d1-904b3e0d0c04', 'ch1', 'round_2569', 'tpso', '2025-01-01 00:00:00+00', '2026-12-31 00:00:00+00', '2026-12-31 00:00:00+00', true, NULL, '2026-03-21 03:14:21.990558+00', '2026-03-21 03:14:21.990558+00', true),
	('60639146-83dd-43b4-95c5-19155623ecf6', 'ch1', 'round_2569', 'mots', '2025-01-01 00:00:00+00', '2026-12-31 00:00:00+00', '2026-12-31 00:00:00+00', true, NULL, '2026-03-21 03:14:21.990558+00', '2026-03-21 03:14:21.990558+00', true),
	('046d7e9b-78b8-4b4d-939e-9450f188d033', 'ch1', 'round_2569', 'acfs', '2025-01-01 00:00:00+00', '2026-12-31 00:00:00+00', '2026-12-31 00:00:00+00', true, NULL, '2026-03-21 03:14:21.990558+00', '2026-03-21 03:14:21.990558+00', true),
	('5631fa45-f066-46b1-bb1f-01cf54771803', 'ch1', 'round_2569', 'nesdc', '2025-01-01 00:00:00+00', '2026-12-31 00:00:00+00', '2026-12-31 00:00:00+00', true, NULL, '2026-03-19 17:15:31.887367+00', '2026-03-19 17:49:06.203919+00', false),
	('922c2ba9-13d8-4ea7-9adf-d3f63a0ec5bc', 'wellbeing', 'round_2569', 'dcy', '2025-01-01 00:00:00+00', '2026-12-31 00:00:00+00', '2026-12-31 00:00:00+00', true, NULL, '2026-03-21 03:14:21.990558+00', '2026-03-21 03:14:21.990558+00', true),
	('5baace69-55f4-4e7c-b7c1-8778f4e64bf7', 'wellbeing', 'round_2569', 'rid', '2025-01-01 00:00:00+00', '2026-12-31 00:00:00+00', '2026-12-31 00:00:00+00', true, NULL, '2026-03-21 03:14:21.990558+00', '2026-03-21 03:14:21.990558+00', true),
	('c9d2328f-15d0-483d-97ae-8bb8f17f1c91', 'wellbeing', 'round_2569', 'dss', '2025-01-01 00:00:00+00', '2026-12-31 00:00:00+00', '2026-12-31 00:00:00+00', true, NULL, '2026-03-21 03:14:21.990558+00', '2026-03-21 03:14:21.990558+00', true),
	('c4977fd9-eb23-4b1c-88c9-7b4ed0c7142e', 'ch1', 'round_2569', 'dhss', '2025-01-01 00:00:00+00', '2026-12-31 00:00:00+00', '2026-12-31 00:00:00+00', true, NULL, '2026-03-21 03:14:21.990558+00', '2026-03-21 03:14:21.990558+00', true),
	('85ab2e91-6edc-42c8-8c17-1594a312fbc5', 'ch1', 'round_2569', 'dop', '2025-01-01 00:00:00+00', '2026-12-31 00:00:00+00', '2026-12-31 00:00:00+00', true, NULL, '2026-03-21 03:14:21.990558+00', '2026-03-21 03:14:21.990558+00', true),
	('1519c420-a8d7-4c1f-bdcb-24db38cbc9a7', 'wellbeing', 'round_2569', 'dop', '2025-01-01 00:00:00+00', '2026-12-31 00:00:00+00', '2026-12-31 00:00:00+00', true, NULL, '2026-03-21 03:14:21.990558+00', '2026-03-21 03:14:21.990558+00', true),
	('5fb4f738-50a4-4ae6-9e6b-8dc63b485e27', 'ch1', 'round_2569', 'opdc', '2025-01-01 00:00:00+00', '2026-12-31 00:00:00+00', '2026-12-31 00:00:00+00', true, NULL, '2026-03-21 03:14:21.990558+00', '2026-03-21 03:14:21.990558+00', true),
	('4b7a76fb-8e8c-457b-b475-91460dfd565a', 'wellbeing', 'round_2569', 'dcp', '2025-01-01 00:00:00+00', '2026-12-31 00:00:00+00', '2026-12-31 00:00:00+00', true, NULL, '2026-03-21 03:14:21.990558+00', '2026-03-21 03:14:21.990558+00', true),
	('89a80596-8a63-4b4e-b657-98bd7aecec30', 'wellbeing', 'round_2569', 'dmh', '2025-01-01 00:00:00+00', '2026-12-31 00:00:00+00', '2026-12-31 00:00:00+00', true, NULL, '2026-03-21 03:14:21.990558+00', '2026-03-21 03:14:21.990558+00', true),
	('819e6aa3-6e7b-4b49-bf23-5a9f879fde1b', 'wellbeing', 'round_2569', 'tmd', '2025-01-01 00:00:00+00', '2026-12-31 00:00:00+00', '2026-12-31 00:00:00+00', true, NULL, '2026-03-21 03:14:21.990558+00', '2026-03-21 03:14:21.990558+00', true),
	('a78ec739-a3de-4e83-8bc1-d5799cd50113', 'wellbeing', 'round_2569', 'nrct', '2025-01-01 00:00:00+00', '2026-12-31 00:00:00+00', '2026-12-31 00:00:00+00', true, NULL, '2026-03-19 17:15:31.887367+00', '2026-03-19 17:15:31.887367+00', true),
	('ed764c52-a536-42a4-836d-82831d96c27c', 'wellbeing', 'round_2569', 'onep', '2025-01-01 00:00:00+00', '2026-12-31 00:00:00+00', '2026-12-31 00:00:00+00', true, NULL, '2026-03-21 03:14:21.990558+00', '2026-03-21 03:14:21.990558+00', true),
	('75370c89-e123-45dc-a51a-9036d9e1a5bb', 'wellbeing', 'round_2569', 'tpso', '2025-01-01 00:00:00+00', '2026-12-31 00:00:00+00', '2026-12-31 00:00:00+00', true, NULL, '2026-03-21 03:14:21.990558+00', '2026-03-21 03:14:21.990558+00', true),
	('c98d0cc7-20ba-4476-b3b7-ccedb5213905', 'wellbeing', 'round_2569', 'mots', '2025-01-01 00:00:00+00', '2026-12-31 00:00:00+00', '2026-12-31 00:00:00+00', true, NULL, '2026-03-21 03:14:21.990558+00', '2026-03-21 03:14:21.990558+00', true),
	('4f2f0b1c-806f-47f1-9356-7a7500163128', 'wellbeing', 'round_2569', 'acfs', '2025-01-01 00:00:00+00', '2026-12-31 00:00:00+00', '2026-12-31 00:00:00+00', true, NULL, '2026-03-21 03:14:21.990558+00', '2026-03-21 03:14:21.990558+00', true),
	('4a3ff766-e4d0-4150-86a7-0346261e5295', 'wellbeing', 'round_2569', 'nesdc', '2025-01-01 00:00:00+00', '2026-12-31 00:00:00+00', '2026-12-31 00:00:00+00', true, NULL, '2026-03-19 17:15:31.887367+00', '2026-03-19 17:15:31.887367+00', true),
	('d56457ec-33cd-44e6-b658-88a36fe9bf43', 'ch1', 'round_2569', 'test-org', '2025-01-01 00:00:00+00', '2027-12-31 00:00:00+00', '2027-12-31 00:00:00+00', true, NULL, '2026-03-19 17:15:31.887367+00', '2026-03-19 17:49:06.203919+00', false),
	('866c9264-3b26-4451-935c-b83a0136c43a', 'wellbeing', 'round_2569', 'test-org', '2025-01-01 00:00:00+00', '2027-12-31 00:00:00+00', '2027-12-31 00:00:00+00', true, NULL, '2026-03-19 17:15:31.887367+00', '2026-03-19 17:15:31.887367+00', true),
	('35e67238-2ca1-4e0c-9a6e-4197a5061def', 'wellbeing', 'round_2569', 'dhss', '2025-01-01 00:00:00+00', '2026-12-31 00:00:00+00', '2026-12-31 00:00:00+00', true, NULL, '2026-03-21 03:14:21.990558+00', '2026-03-21 03:14:21.990558+00', true),
	('9657ef98-2ff0-453b-99ab-2c5f69f2c424', 'wellbeing', 'round_2569', 'opdc', '2025-01-01 00:00:00+00', '2026-12-31 00:00:00+00', '2026-12-31 00:00:00+00', true, NULL, '2026-03-21 03:14:21.990558+00', '2026-03-21 03:14:21.990558+00', true);


--
-- Data for Name: hrd_ch1_responses; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."hrd_ch1_responses" ("id", "created_at", "submitted_at", "respondent_email", "organization", "form_version", "strategic_overview", "org_structure", "total_staff", "age_u30", "age_31_40", "age_41_50", "age_51_60", "service_u1", "service_1_5", "service_6_10", "service_11_15", "service_16_20", "service_21_25", "service_26_30", "service_over30", "pos_o1", "pos_o2", "pos_o3", "pos_o4", "pos_k1", "pos_k2", "pos_k3", "pos_k4", "pos_k5", "pos_m1", "pos_m2", "pos_s1", "pos_s2", "turnover_count", "turnover_rate", "transfer_count", "transfer_rate", "related_policies", "context_challenges", "disease_diabetes", "disease_hypertension", "disease_cardiovascular", "disease_kidney", "disease_liver", "disease_cancer", "disease_obesity", "disease_other_count", "disease_other_detail", "ncd_count", "ncd_ratio_pct", "sick_leave_days", "sick_leave_avg", "clinic_users_per_year", "clinic_top_symptoms", "clinic_top_medications", "mental_stress", "mental_anxiety", "mental_sleep", "mental_burnout", "mental_depression", "engagement_score", "engagement_low_areas", "other_wellbeing_surveys", "mentoring_system", "job_rotation", "idp_system", "career_path_system", "training_hours", "ergonomics_status", "ergonomics_detail", "wellbeing_analysis", "strategic_priorities", "strategic_priority_other", "intervention_suggestions", "hrd_plan_url", "hrd_plan_results", "strategy_file_path", "strategy_file_url", "strategy_file_name", "org_structure_file_path", "org_structure_file_url", "org_structure_file_name", "hrd_plan_file_path", "hrd_plan_file_url", "hrd_plan_file_name", "strategic_priority_rank1", "strategic_priority_rank2", "strategic_priority_rank3", "intervention_packages_feedback", "support_systems", "ergonomics_planned_detail", "ergonomics_in_progress_detail", "ergonomics_done_detail", "type_official", "type_employee", "type_contract", "type_other", "digital_systems", "rate_2564", "rate_2565", "rate_2566", "rate_2567", "rate_2568", "is_test", "submission_mode", "test_run_id", "begin_2564", "begin_2565", "begin_2566", "begin_2567", "begin_2568", "end_2564", "end_2565", "end_2566", "end_2567", "end_2568", "leave_2564", "leave_2565", "leave_2566", "leave_2567", "leave_2568", "disease_report_type", "sick_leave_report_type", "clinic_report_type", "mental_health_report_type", "engagement_score_2564", "engagement_score_2565", "engagement_score_2566", "engagement_score_2567", "engagement_score_2568", "google_sync_status", "google_sync_attempts", "google_sync_error", "google_sync_requested_at", "google_synced_at", "google_sheet_row_number", "google_drive_sync_status", "google_drive_synced_at", "google_drive_error", "google_drive_files", "training_hours_2564", "training_hours_2565", "training_hours_2566", "training_hours_2567", "training_hours_2568", "round_code", "status", "last_saved_at", "reopened_at", "locked_at", "updated_by", "org_code") VALUES
	('1454aef6-91d0-4440-87b5-f6cb119ad3d3', '2026-03-17 16:10:15.402476+00', NULL, 'hr@test-org.local', 'องค์กรทดสอบระบบ', 'ch1-v3.0', 'ข้อมูลทดสอบระบบ — ยุทธศาสตร์องค์กรทดสอบ', 'โครงสร้างองค์กรทดสอบ', 50, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, 0, 0, 0, 0, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, true, 'test', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'draft', 0, NULL, '2026-03-17 16:10:15.402476+00', NULL, NULL, 'draft', NULL, NULL, '[]', NULL, NULL, NULL, NULL, NULL, 'round_2569', 'draft', '2026-03-17 16:10:15.402476+00', NULL, NULL, 'smoke-test', 'test-org'),
	('9b363e19-e108-4ff1-864a-d90fc997343f', '2026-03-18 06:43:10.249422+00', '2026-03-18 06:43:08.706+00', 'hrd.acfs@gmail.com', 'สำนักงานมาตรฐานสินค้าเกษตรและอาหารแห่งชาติ', 'ch1-v4.0', '๑) วิสัยทัศน์
เป็นองค์กรนำด้านการมาตรฐานสินค้าเกษตรและอาหารที่เป็นที่ยอมรับระดับสากล
และยกระดับการผลิตสินค้าเกษตรและอาหารของประเทศให้ได้มาตรฐานและสร้างมูลค่าเพิ่ม
๒) พันธกิจ
๑. กำหนดมาตรฐานสินค้าเกษตรและอาหารตามความต้องการ และสอดคล้องกับ
ภาวะตลาดและแนวทางสากล
๒. จัดทำและพัฒนาการรับรองระบบงานมาตรฐานสินค้าเกษตรและอาหาร
ตามความต้องการและสอดคล้องกับภาวะตลาดและแนวทางสากล
๓. พัฒนาระบบงานและสร้างเครือข่ายในการกำกับดูแลให้เป็นไปตามกฎหมาย
๔. ส่งเสริมและผลักดันอย่างมีส่วนร่วมในการนำมาตรฐานสู่การปฏิบัติตลอดห่วงโซ่คุณค่า
๕. กำหนดกลยุทธ์การเจรจา เปิดตลาด แก้ไขปัญหา และจัดทำความตกลงระหว่าง
ประเทศด้านมาตรการสุขอนามัยและสุขอนามัยพืช มาตรการที่ไม่ใช่ภาษีอื่น ๆ และด้านมาตรฐานระหว่างประเทศ
๖. พัฒนาระบบการบริหารจัดการภาครัฐ
๓) เป้าหมายเชิงนโยบาย
๑. ผลักดันให้มูลค่าสินค้าเกษตรปลอดภัยขยายตัวอย่างน้อยร้อยละ ๓.๐ ต่อปี ระหว่าง
ปี ๒๕๖๖ - ๒๕๗๐
๒. ยกระดับความเชื่อมั่นผู้บริโภคด้านคุณภาพและความปลอดภัยอาหารให้อยู่ในระดับดี
ภายในปี ๒๕๗๐

แนวทางการดำเนินการ/พัฒนา
แนวทางที่ ๑ : กำหนดมาตรฐานสินค้าเกษตรและอาหารตามความต้องการ และ
สอดคล้องกับภาวะตลาดและแนวทางสากล
แนวทางที่ ๒ : จัดทำและพัฒนาการรับรองระบบงานมาตรฐานสินค้าเกษตรและ
อาหารตามความต้องการและสอดคล้องกับภาวะตลาดและแนวทางสากล
แนวทางที่ ๒ : จัดทำและพัฒนาการรับรองระบบงานมาตรฐานสินค้าเกษตรและ
อาหารตามความต้องการและสอดคล้องกับภาวะตลาดและแนวทางสากล
แนวทางที่ ๔ : ส่งเสริมและผลักดันอย่างมีส่วนร่วมในการนำมาตรฐานสู่การปฏิบัติ
ตลอดห่วงโซ่คุณค่า
 แนวทางที่ ๕: กำหนดกลยุทธ์การเจรจา เปิดตลาด แก้ไขปัญหา และจัดทำความตกลง
ระหว่างประเทศด้านมาตรการสุขอนามัยและสุขอนามัยพืช มาตรการที่ไม่ใช่ภาษีอื่น ๆ และด้านมาตรฐาน
ระหว่างประเทศ
แนวทางที่ ๖ : พัฒนาระบบการบริหารจัดการภาครัฐ', 'ให้สํานักงานมาตรฐานสินค้าเกษตรและอาหารแห่งชาติ มีภารกิจเป็นหน่วยงานกลาง
ด้านมาตรฐานสินค้าเกษตรและอาหาร โดยกําหนด ตรวจสอบรับรอง ควบคุม และส่งเสริมมาตรฐาน
สินค้าเกษตรตั้งแต่ระดับไร่นาจนถึงผู้บริโภค ตลอดจนการเจรจาแก้ไขปัญหาทางการค้าเชิงเทคนิคเพื่อปรับปรุง
และยกระดับคุณภาพสินค้าเกษตรและอาหารของไทยให้ได้มาตรฐาน รวมทั้งเพื่อให้มีคุณภาพและ
ความปลอดภัยตามมาตรฐานสากล สามารถแข่งขันได้ในเวทีโลก โดยให้มีอํานาจหน้าที่ดังต่อไปนี้
(๑) ดําเนินการตามกฎหมายว่าด้วยมาตรฐานสินค้าเกษตรและกฎหมายอื่นที่เกี่ยวข้อง
(๒) เสนอแนะนโยบาย แนวทาง และมาตรการในการกําหนด การตรวจสอบรับรอง การควบคุม
การวิจัย การพัฒนา การประเมินความเสี่ยง การถ่ายทอด การส่งเสริม และการพัฒนามาตรฐาน
สินค้าเกษตรและอาหารของประเทศ
(๓) กําหนดยุทธศาสตร์ด้านความปลอดภัยสินค้าเกษตรและอาหาร รวมทั้งกํากับดูแล
เฝ้าระวัง และเตือนภัย
(๔) ประสานงาน กําหนดท่าที และร่วมเจรจาแก้ไขปัญหาด้านเทคนิค ด้านมาตรการที่มิใช่ภาษี
และด้านการกําหนดมาตรฐานระหว่างประเทศในส่วนที่เกี่ยวข้องกับสินค้าเกษตรและอาหาร
(๕) เป็นหน่วยงานกลางในการประสานงานกับองค์การมาตรฐานระหว่างประเทศด้านคุณภาพ
และความปลอดภัยของสินค้าเกษตรและอาหาร รวมทั้งการดําเนินการภายใต้ความตกลงว่าด้วยการบังคับใช้มาตรการสุขอนามัยและสุขอนามัยพืช และในส่วนที่เกี่ยวข้องกับสินค้าเกษตรและอาหาร
ภายใต้ความตกลงว่าด้วยอุปสรรคทางเทคนิคต่อการค้า
(๖) เป็นหน่วยรับรองระบบงานของหน่วยตรวจสอบรับรองและเป็นหน่วยรับรองผู้ประกอบการ
ตรวจสอบมาตรฐานด้านสินค้าเกษตรและอาหารของประเทศ
(๗) เป็นศูนย์กลางข้อมูลสารสนเทศด้านการมาตรฐานสินค้าเกษตรและอาหาร
(๘) ปฏิบัติการอื่นใดตามที่กฎหมายกําหนดให้เป็นอํานาจหน้าที่ของสํานักงานหรือตามที่รัฐมนตรี
หรือคณะรัฐมนตรีมอบหมาย
ข้อ ๓ ให้แบ่งส่วนราชการสํานักงานมาตรฐานสินค้าเกษตรและอาหารแห่งชาติ ดังต่อไปนี้
(๑) สํานักงานเลขานุการกรม
(๒) กองควบคุมมาตรฐาน
(๓) กองนโยบายมาตรฐานสินค้าเกษตรและอาหาร
(๔) กองรับรองมาตรฐาน
(๕) ศูนย์เทคโนโลยีสารสนเทศและการสื่อสาร
(๖) สํานักกําหนดมาตรฐาน', 298, 17, 59, 87, 33, 16, 37, 40, 23, 35, 29, 11, 5, 10, 7, 0, 0, 54, 68, 44, 5, 0, 2, 3, 2, 1, NULL, NULL, NULL, NULL, '1. แผนปฏิบัติการด้านการพัฒนาทรัพยากรบุคคลสำนักงานมาตรฐานสินค้าเกษตรและอาหารแห่งชาติ

2. แผนพัฒนารายบุคคล (IDP)', '-', 15, 0, 0, 0, 0, 0, 71, 0, NULL, 86, 28.86, 1551, 7.88, NULL, NULL, NULL, '-', '-', '-', '-', '-', NULL, 'สุขภาพและความเป็นอยู่ที่ดี,ผู้บริหาร,โอกาสในการเรียนรู้และพัฒนา', '-', 'none', 'none', 'full', 'full', NULL, 'none', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ch1-uploads/section1/org-structure/agency_1773815537953.pdf', 'https://fgdommhiqhzvsedfzyrr.supabase.co/storage/v1/object/public/hrd-documents/ch1-uploads/section1/org-structure/agency_1773815537953.pdf', 'กฎกระทรวงแบ่งส่วนราชการ.pdf', NULL, NULL, NULL, 'การพัฒนาศักยภาพด้านดิจิทัล', 'การพัฒนาผู้นำรุ่นใหม่', 'การเพิ่มประสิทธิภาพการให้บริการประชาชน', NULL, NULL, NULL, NULL, NULL, 209, 89, 0, 0, '{e_doc,e_sign,cloud,hr_digital}', 6.09, 9.26, 5.29, 6.74, 10.69, false, 'live', NULL, 180, 178, 187, 191, 196, 181, 189, 191, 195, 197, 11, 17, 10, 13, 21, 'all_staff', 'all_staff', NULL, NULL, NULL, 75.66, 85.56, 81.10, 84.00, 'pending', 0, NULL, '2026-03-18 06:43:10.249422+00', NULL, NULL, 'pending', NULL, NULL, '[]', NULL, NULL, NULL, NULL, NULL, 'round_2569', 'submitted', NULL, NULL, NULL, NULL, 'acfs'),
	('514ef38d-da96-4f60-8b7f-b3c22793f8d7', '2026-03-16 08:50:04.92783+00', '2026-03-16 08:50:04.449+00', 'jburakorn@gmail.com', 'กรมวิทยาศาสตร์บริการ', 'ch1-v4.0', 'วิสัยทัศน์ : เป็นองค์กรหลักในการนำวิทยาศาสตร์สู่การดูแลประชาชน เพื่อขับเคลื่อนเศรษฐกิจและสังคมอย่างยั่งยืน 
ประเด็นยุทธศาสตร์ :
1. การพัฒนาและยกระดับโครงสร้างพื้นฐานทางคุณภาพของประเทศ เพื่อเพิ่มขีดความสามารถในการแข่งขัน
 ของประเทศ
2. ส่งเสริมและพัฒนาผลิตภัณฑ์สินค้าและบริการในอุตสาหกรรมเป้าหมาย ด้วย วทน. สู่เชิงพาณิชย์
3. สร้างโอกาสความเสมอภาคทางการแข่งขันของประเทศด้วย วทน. เพื่อยกระดับเศรษฐกิจอย่างยั่งยืน
4. การบริหารจัดการองค์กรที่มีประสิทธิภาพตามหลักธรรมภิบาลอย่างยั่งยืน', 'พันธกิจ :
1. บริการตรวจสอบและรับรอง และรับรองระบบงานห้องปฏิบัติการให้เป็นที่ยอมรับตามมาตรฐานระดับสากล
2. พัฒนาโครงสร้างพื้นฐานทางคุณภาพด้านวิทยาศาสตร์ เทคโนโลยีและนวัตกรรม
3 ส่งเสริมและพัฒนางานวิจัย ถ่ายทอดเทคโนโลยี ยกระดับอุตสาหกรรม และเศรษฐกิจฐานราก เพื่อสร้าง
 เศรษฐกิจมูลค่าสูง และคุณภาพสังคมในทุกมิติ
4. พัฒนาเกณฑ์กำหนดและมาตรฐานเพื่อรับรองคุณภาพผลิตภัณฑ์ให้ได้มาตรฐานสากล', 507, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL, NULL, NULL, NULL, 'นโยบบายค่านิยมองค์กร สุข สามัคคี รับผิดชอบต่อหน้าที่', 'นโยบายของกรมวิทยาศาสตร์บริการในการเปลี่ยนแปลงองค์กรแบบพลิกโฉม โดยให้ลดบทบาทการให้บริการทางวิทยาศาสตร์ลง ไปทำภารกิจการกำกับดูแลและพัฒนาห้องปฏิบัติการทั่วประเทศ ทำให้บุคลากรจำเป็นต้องมีการปรับภารกิจ และอาจจะมีการปรับโครงสร้างองค์กรอีก', 0, 0, 0, 0, 0, 0, 0, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'none', 'none', 'none', 'none', NULL, 'none', NULL, NULL, NULL, NULL, NULL, NULL, '1. กำหนดมาตรฐานความรู้ ทักษะ และสมรรถนะสำหรับตำแหน่งข้าราชการ
2. จัดทำเส้นทางการพัฒนาข้าราชการตามกลุ่มเป้าหมาย (Development Roadmap)
3. พัฒนาทักษะดิจิทัลที่จำเป็นสำหรับบุคลากร
4. พัฒนาเจ้าหน้าที่เทคนิคหรือผู้ปฏิบัติงานเฉพาะด้าน
5. ส่งเสริมการใช้ทักษะดิจิทัลสำหรับการปฏิบัติงาน
6. ส่งเสริมคุณธรรม จริยธรรม และป้องกันการทุจริตประพฤติมิชอบ
7. พัฒนาองค์กรคุณธรรมและความโปร่งใสในการดำเนินงาน
8. ส่งเสริมสุขภาพกายและใจ
9. โครงการ “ชมเชย ชื่นชม เชิดชู คนดี” ยกย่องบุคลากรผู้มีพฤติกรรมดีเด่น', 'ch1-uploads/section1/strategy/agency_1773649847830.pdf', 'https://fgdommhiqhzvsedfzyrr.supabase.co/storage/v1/object/public/hrd-documents/ch1-uploads/section1/strategy/agency_1773649847830.pdf', 'ยุทธศาสตร์ วศ.ปี69.pdf', 'ch1-uploads/section1/org-structure/agency_1773649603918.pdf', 'https://fgdommhiqhzvsedfzyrr.supabase.co/storage/v1/object/public/hrd-documents/ch1-uploads/section1/org-structure/agency_1773649603918.pdf', 'โครงสร้าง วศ.ปี69 pdf.pdf', 'ch1-uploads/section1/hrd-plan/agency_1773650999593.pdf', 'https://fgdommhiqhzvsedfzyrr.supabase.co/storage/v1/object/public/hrd-documents/ch1-uploads/section1/hrd-plan/agency_1773650999593.pdf', 'HRD Plan วศ. ส่งนิด้า 1.pdf', 'การลดอัตราการลาออก', 'การเพิ่มประสิทธิภาพการให้บริการประชาชน', 'การพัฒนาผู้นำรุ่นใหม่', NULL, NULL, NULL, NULL, NULL, 307, 173, 27, 0, '{e_doc,e_sign}', NULL, NULL, NULL, NULL, NULL, false, 'live', NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'pending', 0, NULL, '2026-03-16 08:50:04.92783+00', NULL, NULL, 'pending', NULL, NULL, '[]', NULL, NULL, NULL, NULL, NULL, 'round_2569', 'submitted', '2026-03-16 08:50:04.449+00', NULL, NULL, 'system-backfill-2026-03-18', 'dss'),
	('56ce4610-a8bf-4276-821f-70f864c6d937', '2026-03-19 08:28:01.505312+00', '2026-03-19 08:28:00.224+00', 'pattanahrd@gmail.com', 'กรมกิจการเด็กและเยาวชน', 'ch1-v4.0', 'ยุทธศาสตร์กรมกิจการเด็กและเยาวชน (พ.ศ. 2566–2570) มุ่งพัฒนาเด็กและเยาวชนให้เติบโตอย่างมีคุณภาพและพร้อมรับโลกยุคใหม่ โดยเริ่มจากการเสริมสร้างทักษะ ความรู้ และศักยภาพให้เป็นพลเมืองที่ดีในศตวรรษที่ 21 ควบคู่กับการสร้างระบบคุ้มครองที่เข้มแข็ง เพื่อให้เด็กและเยาวชนได้รับการดูแลและปลอดภัยจากความเสี่ยงต่าง ๆ อีกทั้งยังพัฒนาระบบสวัสดิการให้ครอบคลุม เข้าถึงง่าย และเชื่อมโยงกับทุกภาคส่วน เพื่อยกระดับคุณภาพชีวิตของเด็ก เยาวชน และครอบครัว สุดท้ายคือการพัฒนาองค์กรให้มีการบริหารจัดการที่โปร่งใส มีประสิทธิภาพ ใช้เทคโนโลยีและนวัตกรรม พร้อมบุคลากรที่มีความสามารถ เพื่อขับเคลื่อนงานให้ทันต่อการเปลี่ยนแปลงในอนาคต
ยุทธศาสตร์ที่ 1: เสริมสร้างศักยภาพเด็กและเยาวชน
พัฒนาให้เด็กและเยาวชนมีความรู้ ทักษะชีวิต และสมรรถนะที่จำเป็น เติบโตเป็นพลเมืองคุณภาพในศตวรรษที่ 21
ยุทธศาสตร์ที่ 2: เสริมสร้างระบบคุ้มครองเด็กและเยาวชน
จัดให้มีระบบดูแล คุ้มครอง และช่วยเหลือเด็กอย่างทั่วถึง ปลอดภัย และเข้าถึงได้จริง
ยุทธศาสตร์ที่ 3: พัฒนาระบบสวัสดิการเด็ก เยาวชน และครอบครัว
ส่งเสริมให้เข้าถึงสวัสดิการที่เหมาะสม ครอบคลุม และเชื่อมโยงทุกภาคส่วน เพื่อคุณภาพชีวิตที่ดี
ยุทธศาสตร์ที่ 4: ยกระดับการบริหารจัดการองค์กร
พัฒนาองค์กรให้ทันสมัย โปร่งใส ใช้เทคโนโลยี มีบุคลากรคุณภาพ และบริหารงานอย่างมีประสิทธิภาพ', NULL, 466, 45, 161, 133, 107, 35, 101, 87, 57, 42, 31, 44, 49, 45, 74, 3, 0, 69, 163, 67, 0, 0, 17, 5, 2, 1, NULL, NULL, NULL, NULL, 'การดำเนินโครงการ เสริมสร้างสุขภาวะองค์กร สู่องค์กรสร้างสุขของกรมกิจการเด็กและเยาวชน ที่ขับเคลื่อนโดยนักสร้างสุของค์กร', NULL, 0, 0, 0, 0, 0, 0, 0, 0, NULL, 0, NULL, 2687, 5.39, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'partial', 'none', 'full', 'full', NULL, 'none', NULL, NULL, NULL, 'การสร้างวัฒนธรรมองคืกร', NULL, NULL, NULL, 'ch1-uploads/section1/strategy/agency_1773906920291.pdf', 'https://fgdommhiqhzvsedfzyrr.supabase.co/storage/v1/object/public/hrd-documents/ch1-uploads/section1/strategy/agency_1773906920291.pdf', '1773803022704.pdf', NULL, NULL, NULL, NULL, NULL, NULL, 'การพัฒนาผู้นำรุ่นใหม่', 'การสร้างวัฒนธรรมองคืกร', 'การลดอัตราการลาป่วย', NULL, NULL, NULL, NULL, NULL, 446, 1530, 762, 15, '{e_doc,e_sign,cloud}', 5.56, 8.55, 11.31, 7.87, 10.96, false, 'live', NULL, 434, 436, 429, 443, 451, 430, 429, 420, 446, 461, 24, 37, 48, 35, 50, NULL, 'official_only', NULL, NULL, NULL, 77.74, 64.97, 78.59, 81.00, 'pending', 0, NULL, '2026-03-19 08:28:01.505312+00', NULL, NULL, 'pending', NULL, NULL, '[]', NULL, NULL, NULL, 20542, 25033.5, 'round_2569', 'submitted', NULL, NULL, NULL, NULL, 'dcy'),
	('784915ad-f349-4573-ba41-7de9b8c1b754', '2026-03-18 02:33:01.717296+00', '2026-03-18 02:33:07.132+00', 'hrd.dcp2023@gmail.com', 'กรมส่งเสริมวัฒนธรรม', 'ch1-v4.0', 'เป็นองค์กรหลักในการส่งเสริมและรักษามรดกภูมิปัญญาทางวัฒนธรรม เพื่อนำพาสังคมไทยไปสู่การพัฒนาอย่างยั่งยืน', '1) ดำเนินการตามกฎหมายว่าด้วยวัฒนธรรมแห่งชาติกฎหมายว่าด้วยภาพยนตร์และวีดิทัศน์ และกฎหมายส่งเสริมและรักษามรดกภูมิปัญญาทางวัฒนธรรม
2) ศึกษา วิจัย และเผยแพร่องค์ความรู้ทางวัฒนธรรม
3) ส่งเสริม สนับสนุน และพัฒนาศักยภาพการดำเนินงานของสภาวัฒนธรรม เครือข่ายวัฒนธรรม และแหล่งเรียนรู้ทางวัฒนธรรม
4) เป็นศูนย์กลางในการศึกษา รวบรวม เผยแพร่ และให้บริการสารสนเทศและกิจกรรมทางวัฒนธรรม
5) ส่งเสริมกระบวนการถ่ายทอดและเรียนรู้คุณค่าทางวัฒนธรรม
6) สนับสนุน ส่งเสริม และประสานการดำเนินงานทางวัฒนธรรม
7) ส่งเสริมและดำเนินการปกป้องคุ้มครองมรดกภูมิปัญญาทางวัฒนธรรม ทั้งในระดับท้องถิ่นระดับชาติและระดับนานาชาติ
8) ส่งเสริม ดำเนินการยกย่องเชิดชูเกียรติ และสนับสนุนการดำเนินงานของศิลปินแห่งชาติ ผู้ทรงคุณวุฒิทางวัฒนธรรม และบุคคลที่มีผลงานดีเด่นทางวัฒนธรรม
9) เสริมสร้างค่านิยมอันดีงามและเหมาะสมกับสังคมไทย
10) จัดทำโครงการและแผนปฏิบัติงานส่งเสริม พัฒนา ป้องกัน และแก้ไขปัญหาทางวัฒนธรรม
11) ระดมทรัพยากรเพื่อส่งเสริมการดำเนินงานทางวัฒนธรรม
12) ปฏิบัติการอื่นใดตามที่กฎหมายกำหนดให้เป็นอำนาจหน้าที่ของกรม หรือตามที่รัฐมนตรีหรือคณะรัฐมนตรีมอบหมาย', 288, 6, 53, 106, 83, 0, 0, 0, 0, 0, 0, 0, 0, 8, 34, 3, 0, 31, 123, 40, 3, 0, 2, 1, 0, 1, NULL, NULL, NULL, NULL, '2.1 นโยบายระดับชาติ
2.1.1 ยุทธศาสตร์ชาติ 20 ปี (พ.ศ. 2561 - 2580)
กรมส่งเสริมวัฒนธรรมรับผิดชอบหลักในยุทธศาสตร์ด้าน “การพัฒนาและเสริมสร้างศักยภาพทรัพยากรมนุษย์” มีประเด็นย่อยที่สำคัญ คือ
1) การปรับเปลี่ยนค่านิยมและวัฒนธรรม มุ่งเน้นให้คนไทยมีคุณธรรม จริยธรรม และจิตสาธารณะ ภายใต้คุณธรรม 5 ประการ พอเพียง วินัย สุจริต จิตอาสา กตัญญู
2) สถาบันครอบครัวและชุมชน ในการส่งเสริมให้ชุมชนมีความเข้มแข็งผ่านกระบวนการทางวัฒนธรรม
2.1.2 แผนแม่บทภายใต้ยุทธศาสตร์ชาติ ประเด็น (10) การปรับเปลี่ยนค่านิยมและวัฒนธรรม
การสร้าง “คนไทยที่เป็นมนุษย์ที่สมบูรณ์” ทั้งนี้ กรมฯ มีตัวชี้วัดในความรับผิดชอบตามเอกสาร ขาวคาดแดง ได้แก่
1) คนไทยมีคุณธรรม จริยธรรม เข้าใจในการปฏิบัติตนตามค่านิยมความเป็นไทย
2) ประชาชนได้รับการให้บริการด้านศิลปวัฒนธรรม
3) ประชาชนชาวไทยมีส่วนร่วมในการพัฒนาทุนทางวัฒนธรรมส่งเสริมอุตสาหกรรมซอฟต์พาวเวอร์ไทย', '1. พ.ร.บ.ภาพยนตร์และวีดิทัศน์ พ.ศ. 2551 เพื่อกำกับดูแลการประกอบกิจการด้านภาพยนตร์และวีดิทัศน์ นำมาสู่การศึกษา ทบทวนเนื้อหาด้านเกม และปรับปรุงแก้ไขกฎหมายเป็น (ร่าง) พ.ร.บ.ภาพยนตร์ พ.ศ.... เป็นผลมาจากการเปลี่ยนแปลงของเทคโนโลยี การสื่อสารออนไลน์ รูปแบบการเข้าถึงภาพยนตร์และวีดิทัศน์ที่เปลี่ยนแปลงไป 
	2. พ.ร.บ.วัฒนธรรมแห่งชาติ พ.ศ. 2553 นำมาสู่การศึกษา ทบทวน และปรับปรุงแก้ไขกฎหมาย 
ที่เกี่ยวข้อง ได้แก่ 
-	เพื่อขับเคลื่อนการดำเนินงานของกองทุนส่งเสริมงานวัฒนธรรม 
-	เพื่อดำเนินการคัดเลือกศิลปินแห่งชาติ และการจัดสรรสวัสดิการต่าง ๆ 
-	เพื่อให้ได้มาซึ่งคณะกรรมการสภาวัฒนธรรมในแต่ละระดับ
-	เพื่อออกระเบียบคณะกรรมการวัฒนธรรมแห่งชาติ ให้ครอบคลุม ชัดเจน เป็นไปตามสถานการณ์ปัจจุบัน
	3. เพื่อตอบสนองพันธกิจหลักที่เกี่ยวข้องและกิจกรรม/การดำเนินงานด้านมรดกภูมิปัญญาทางวัฒนธรรมอย่างมีประสิทธิภาพ มีกระบวนการที่ชัดเจนในการคุ้มครองมรดกทางวัฒนธรรมที่จับต้องไม่ได้สอดคล้องกับอนุสัญญาของ UNESCO


 ความเสี่ยงของหน่วยงาน
	1. สภาพแวดล้อมการแข่งขัน : การปรับปรุงการดำเนินแผนงาน/โครงการ/กิจกรรม/บริการงานทางวัฒนธรรมให้สอดคล้องกับสถานการณ์ของสังคมไทยและสังคมโลก เช่น Technology disruption นโยบาย Soft Power รวมถึง การวางกลยุทธ์มุ่งเน้นการนำเทคโนโลยีสารสนเทศ ระบบออนไลน์มาใช้ในการทำงาน เพื่อให้การขับเคลื่อนงานวัฒนธรรมต่อเนื่อง น่าสนใจ สร้างกระแสตื่นรู้ เข้าถึงกลุ่มเป้าหมายได้ทุกกลุ่ม ทั้งในประเทศและต่างประเทศ เช่น การใช้สื่อออนไลน์ Reel/Short/TikTok การสร้างกิจกรรมโหวตให้ประชาชนมีส่วนร่วม การสร้างเครือข่าย Influencer ทั้งชาวไทยและต่างชาติ การสร้างสื่อในภาษาต่างประเทศ เป็นต้น
2. การเปลี่ยนแปลงความสามารถในการแข่งขัน : การเปลี่ยนแปลงที่สำคัญที่มีผลต่อสถานการณ์แข่งขัน รวมถึงการเปลี่ยนแปลงที่สร้างโอกาสในการสร้างนวัตกรรมและความร่วมมือ คือ
1)	รายการมรดกภูมิปัญญาทางวัฒนธรรมของไทยได้รับการขึ้นทะเบียนโดย UNSECO ในสาขาหรือประเภทที่เกี่ยวข้อง
2)	รายการ Soft Power ไทย ปรากฏอยู่ในการจัดลำดับของผลสำรวจต่าง ๆ ของนานาชาติมากขึ้น และมีแนวโน้มในทางที่ดี (บวก)
3)	การสร้างความร่วมมือกับหน่วยงานต่างประเทศ/บุคคลที่มีชื่อเสียง กลุ่มเป้าหมายใหม่ ๆ นำมาสู่การสร้างสื่อใหม่ สื่อประชาสัมพันธ์ในภาษาต่างประเทศหรือภาษาชาติพันธุ์ กลุ่มผู้รับบริการใหม่', 0, 0, 0, 0, 0, 0, 0, 0, NULL, 0, NULL, 3840, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'full', 'full', 'full', 'full', NULL, 'none', NULL, NULL, NULL, 'พัฒนาสุขภาพและคุณภาพชีวิตที่ดี', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'การพัฒนาศักยภาพด้านดิจิทัล', 'การพัฒนาผู้นำรุ่นใหม่', NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, 0, '{e_doc,e_sign}', NULL, NULL, NULL, NULL, NULL, false, 'live', NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 17, 29, 19, 'official_only', 'official_only', NULL, NULL, NULL, NULL, NULL, 78.81, NULL, 'pending', 0, NULL, '2026-03-18 02:33:01.717296+00', NULL, NULL, 'not_applicable', NULL, NULL, '[]', NULL, NULL, NULL, NULL, NULL, 'round_2569', 'submitted', NULL, NULL, NULL, NULL, 'dcp'),
	('b876b21e-b5f9-4d98-836b-5a37bb2b8a7b', '2026-03-19 02:02:00.10912+00', '2026-03-19 02:02:00.251+00', 'ya.watanya@gmail.com', 'กรมสุขภาพจิต', 'ch1-v4.0', 'แผนปฏิบัติราชการระยะ 5 ปี (พ.ศ.2566-2570) ของกรมสุขภาพจิต ระยะครึ่งแผนฯ พ.ศ. 2569 - 2570
วิสัยทัศน์ “กรมสุขภาพจิต เป็นองค์การหลักด้านสุขภาพจิต และสารเสพติดของประเทศ
เพื่อประชาชนสุขภาพจิตดี สู่สังคมและเศรษฐกิจมูลค่าสูง”
ตัวชี้วัดผลกระทบที่เกิดจากการดำเนินงานเมื่อสิ้นแผนปฏิบัติราชการฯ
1. เด็กไทยมีระดับสติปัญญา (IQ) เฉลี่ยไม่ต่ากว่า 103
2. เด็กไทยมีความฉลาดทางอารมณ์ (EQ) อยู่ในเกณฑ์ปกติข้ึนไป รอ้ ยละ 85
3. อัตราการฆ่าตัวตายส าเร็จ ไม่เกิน 7.8 ต่อประชากรแสนคน
4. คนไทยมีสุขภาพจิตดี ร้อยละ 90 
พันธกิจ 
1) พัฒนาและเผยแพร่องค์ความรู้ เทคโนโลยี และนวัตกรรมด้านสุขภาพจิตและสารเสพติด โดยใช้หลักฐานเชิงประจักษ์ เพื่อให้เกิดการนำไปใช้ประโยชน์
2) สนับสนุนการพัฒนาระบบงานสุขภาพจิตและสารเสพติด ให้ครอบคลุมทุกระดับอย่างครบวงจร
3) สร้างการมีส่วนร่วมเพื่อให้ประชาชนในทุกกลุ่มวัยสามารถดูแลด้านสุขภาพจิตและสารเสพติดของตนเอง ครอบครัว ชุมชน สังคมในทุกมิติ
4) พัฒนากลไกและกำหนดทิศทาง การดำเนินงานสุขภาพจิตและสารเสพติดของประเทศ', 'ภารกิจ และหน้าที่รับผิดชอบของหน่วยงาน
กรมสุขภาพจิตมีภารกิจเกี่ยวกับการส่งเสริมและพัฒนาวิชาการและบริการด้านสุขภาพจิต โดยมีการศึกษา วิจัย พัฒนา และถ่ายทอดองค์ความรู้และเทคโนโลยี ดำเนินการส่งเสริม ป้องกัน บำบัดรักษา และฟื้นฟูสมรรถภาพด้านสุขภาพจิต เพื่อให้ประชาชนมีความตระหนักและสามารถดูแลสุขภาพจิตของตนเอง ครอบครัว และชุมชนได้ รวมทั้งสามารถเข้าถึงบริการด้านสุขภาพจิตที่มีคุณภาพ มาตรฐาน และเป็นธรรม โดยมีหน้าที่และอำนาจ ดังต่อไปนี้
(1) ดำเนินการและพัฒนาระบบและกลไกการดำเนินงานตามกฎหมายว่าด้วยสุขภาพจิตและกฎหมายอื่นที่เกี่ยวข้อง
(2) จัดทำและพัฒนานโยบายและยุทธศาสตร์ด้านสุขภาพจิตระดับประเทศ
(3) ศึกษา วิเคราะห์ วิจัย และพัฒนาองค์ความรู้และเทคโนโลยีด้านการส่งเสริม ป้องกัน บำบัดรักษาและฟื้นฟูสมรรถภาพด้านสุขภาพจิตของประชาชน
(4) กำหนดและพัฒนาคุณภาพมาตรฐานในการส่งเสริม ป้องกัน บำบัดรักษา และฟื้นฟูสมรรถภาพด้านสุขภาพจิตของประชาชน
(5) ถ่ายทอดองค์ความรู้และเทคโนโลยีด้านสุขภาพจิตให้แก่หน่วยงานอื่นที่เกี่ยวข้องทั้งภาครัฐ ภาคเอกชน และประชาชน ตลอดจนประเมินการใช้องค์ความรู้และเทคโนโลยีอย่างเหมาะสม มีประสิทธิภาพ และคุ้มค่า
(6) พัฒนาระบบเฝ้าระวังโรคและปัญหาด้านสุขภาพจิตและจิตเวช ตลอดจนส่งเสริมสุขภาพจิตและป้องกันปัญหาสุขภาพจิตของประชาชน
(7) ส่งเสริม สนับสนุน และประสานการพัฒนาระบบบริการสุขภาพจิตและจิตเวช เพื่อให้ประชาชนเข้าถึงบริการได้อย่างทั่วถึง เท่าเทียม และเป็นธรรม
(8) จัดให้มีบริการเพื่อรองรับการส่งต่อผู้ป่วยด้านสุขภาพจิตที่มีปัญหารุนแรง ยุ่งยาก และซับซ้อน
(9) จัดให้มีการเพิ่มพูนความรู้และทักษะการปฏิบัติงานด้านสุขภาพจิตและจิตเวชแก่บุคลากรทางการแพทย์และสาธารณสุข รวมทั้งบุคลากรอื่นของภาครัฐและภาคเอกชน
(10) ส่งเสริม ป้องกัน บำบัดรักษา และฟื้นฟูสมรรถภาพผู้ป่วยสารเสพติดที่มีโรคจิตเวชร่วม
(11) ประสานความร่วมมือทางวิชาการด้านสุขภาพจิตกับองค์กรที่เกี่ยวข้องทั้งในประเทศและต่างประเทศ
(12) ปฏิบัติการอื่นใดตามที่กฎหมายกำหนดให้เป็นหน้าที่และอำนาจของกรมหรือตามที่รัฐมนตรีหรือคณะรัฐมนตรีมอบหมาย', 7023, 223, 2011, 1194, 0, 0, 0, 0, 0, 0, 0, 0, 0, 48, 200, 8, 0, 1305, 1405, 357, 66, 7, 15, 13, 3, 1, NULL, NULL, NULL, NULL, 'ประเด็นยุทธศาสตร์ที่4 สร้างมูลค่างานสุขภาพจิตผ่านกลไกเศรษฐศาสตร์สุขภาพ และกำลังคนสมรรถนะสูง
กลยุทธ์ที่ 4.3 พัฒนาบุคลากรให้มีความเชี่ยวชาญมีสมรรถนะสูง มีความสุขและความผูกพันต่อองค์กร ตัวชี้วัด 4.3.3 ร้อยละของบุคลากรกรมสุขภาพจิตที่มีความสุขและความผูกพันต่อองค์กร แนวทางการดำเนินงานที่ 3 บริหารจัดการองค์กรอย่างมีธรรมาภิบาลเสริมสร้างขวัญกำลังใจ ความสุข และความกพัน
ของบุคลากรและสร้างแรงดึงดูดกำลังคนคุณภาพให้เข้ามาร่วมปฏิบัติงาน กับกรมสุขภาพจิตด้วยความภาคภูมิใจ', 'กรมสุขภาพจิต ได้กำหนด ตัวชี้วัดที่ 28 ร้อยละของบุคลากรกรมสุขภาพจิตที่มีความสุขและความผูกพันต่อองค์กร เพื่อดำเนินการขับเคลื่อนการทำงานตามตัวชี้วัดกระทรวงสาธารณสุข ให้บรรลุเป้าหมาย "เจ้าหน้าที่มีความสุข" เพื่อขับเคลื่อนการดำเนินงานองค์กรแห่งความสุขที่เป็นรูปธรรม  และร้อยละ 70 ของบุคลากรในหน่วยงานมีการประเมินความสุข และยกระดับเป็นองค์กรแห่งความสุขที่มีคุณภาพ', 0, 0, 0, 0, 0, 0, 0, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ด้านโอกาสและความก้าวหน้าทางอาชีพในองค์กร ร้อยละ 82.13', '- แบบประเมินความสุขของบุคลากร Happinometer 
- แบบประเมินความผูกพันของบุคลากรต่อองค์กร', 'full', 'full', 'full', 'full', NULL, 'none', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'การพัฒนาศักยภาพด้านดิจิทัล', 'การพัฒนาผู้นำรุ่นใหม่', NULL, NULL, NULL, NULL, NULL, NULL, 3428, 1126, 325, 2144, '{e_doc,health_db}', 2.45, 4.65, 5.61, 5.29, 4.99, false, 'live', NULL, 3799, 3482, 3423, 3443, 3428, 3799, 3482, 3423, 3443, 3428, 93, 162, 192, 182, 171, 'all_staff', NULL, NULL, NULL, 88.72, 90.65, 83.02, 83.98, 84.58, 'pending', 0, NULL, '2026-03-19 02:02:00.10912+00', NULL, NULL, 'not_applicable', NULL, NULL, '[]', NULL, 172, NULL, 33000, 35, 'round_2569', 'submitted', NULL, NULL, NULL, NULL, 'dmh'),
	('be19f5fe-c64f-411d-a4da-a6d05ab2aaf0', '2026-03-18 07:26:55.386304+00', '2026-03-18 07:26:52.932+00', 'pokchonnanee@gmail.com', 'สำนักงานการวิจัยแห่งชาติ', 'ch1-v4.0', 'วช. ได้มีการจัดทำแผนปฏิบัติราชการ ระยะ 5 ปี (พ.ศ. 2566 – 2570) ของสำนักงานการวิจัยแห่งชาติ เพื่อให้สอดคล้องกับยุทธศาสตร์ชาติ แผนแม่บทภายใต้ยุทธศาสตร์ชาติ แผนปฏิรูปประเทศ แผนพัฒนาเศรษฐกิจและสังคมแห่งชาติ นโยบายของคณะรัฐมนตรีที่แถลงต่อรัฐสภา รวมทั้ง กรอบและนโยบายยุทธศาสตร์การอุดมศึกษา วิทยาศาสตร์ วิจัยและนวัตกรรม พ.ศ. 2566 - 2570 ดังนั้นมีความจำเป็นต้องทบทวน ปรับปรุงและจัดทำแผนปฏิบัติราชการ แผนบริหารและพัฒนาทรัพยากรบุคคล และแผนปฏิบัติการดิจิทัลของสำนักงานการวิจัยแห่งชาติ และเพื่อให้การดำเนินงานเป็นไป ด้วยความเรียบร้อยมีประสิทธิภาพ และบรรลุวัตถุประสงค์ เพื่อให้สอดรับกับสถานการณ์ที่เปลี่ยนไป โดยแผนปฏิบัติราชการ ระยะ 5 ปี (พ.ศ. 2566 – 2570) ของสำนักงานการวิจัยแห่งชาติ (ฉบับปรับปรุง) ฉบับนี้จะช่วยให้บุคลากรของ วช. ได้ใช้เป็นแนวทางในการปฏิบัติงานให้มีทิศทางเดียวกัน และอยู่ภายใต้ การปฏิบัติงานที่ทุกคนมีส่วนร่วมของทุกคน ตามวิสัยทัศน์ พันธกิจ ยุทธศาสตร์ เป้าประสงค์และตัวชี้วัด ของแผนปฏิบัติราชการสำนักงานการวิจัยแห่งชาติ', 'มีหน้าที่และอำนาจเกี่ยวกับการให้ทุน วิจัยและนวัตกรรม การจัดทำฐานข้อมูลและดัชนีด้านวิทยาศาสตร์ วิจัยและนวัตกรรมของประเทศ การริเริ่ม ขับเคลื่อนและประสานการดำเนินงานโครงการวิจัยและนวัตกรรมที่สำคัญของประเทศ การจัดทำมาตรฐานและจริยธรรมการวิจัย การส่งเสริมและถ่ายทอดความรู้เพื่อใช้ประโยชน์ การส่งเสริมและสนับสนุนการพัฒนาบุคลากรด้านการวิจัยและนวัตกรรมและการให้รางวัล ประกาศ เกียรติคุณ หรือยกย่องบุคคลหรือ หน่วยงานด้านการวิจัยและนวัตกรรม', 192, 31, 58, 59, 44, 25, 62, 18, 36, 14, 3, 21, 13, 20, 11, 5, 0, 63, 25, 56, 3, 0, 0, 6, 2, 1, NULL, NULL, NULL, NULL, 'ยุทธศาสตร์ชาติ 
ข้อ3ยุทธศาสตร์ชาติด้านการพัฒนาและเสริมสร้างศักยภาพทรัพยากรมนุษย์
ข้อ4 ยุทธศาสตร์ชาติด้านการสร้างโอกาสและความเสมอภาคทางสังคม
ข้อ5 ยุทธศาสตร์ชาติด้านการสร้างการเติบโตบนคุณภาพชีวิตที่เป็นมิตรต่อสิ่งแวดล้อม
ข้อ6 ยุทธศาสตร์ชาติด้านการปรับสมดุลและพัฒนาระบบการบริหารจัดการภาครัฐ
แผนด้านวิทยาศาสตร์ วิจัยและนวัตกรรมของประเทศ พ.ศ. 2566 – 2570
ยุทธศาสตร์ที่ 2 การยกระดับสังคมและสิ่งแวดล้อมให้มีการพัฒนาอย่างยั่งยืน
สามารถแก้ไขปัญหาท้าทายและปรับตัวได้ทันต่อพลวัตการเปลี่ยนแปลงของโลก โดยใช้วิทยาศาสตร์
การวิจัยและนวัตกรรม', 'วช. เตรียมขับเคลื่อนยุทธศาสตร์ตามแผนพัฒนาเศรษฐกิจและสังคมแห่งชาติ (ฉบับที่ 14 ) เพื่อการพัฒนาประเทศอย่างมั่นคงและยั่งยืน', 0, 0, 0, 0, 0, 0, 0, 0, NULL, 0, NULL, 659, 3.74, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ประเด็นที่ได้คะแนนต่ำสุดคือ มีความสมดุลระหว่างชีวิตการทำงานและชีวิตส่วนตัว (work life balance)', NULL, 'partial', 'partial', 'full', 'full', NULL, 'none', NULL, NULL, NULL, 'ความผาสุขและความผูกพันต่อองค์กร', NULL, NULL, 'HRD PLAN ดังไฟล์แนบ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'การพัฒนาศักยภาพด้านดิจิทัล', 'การพัฒนาผู้นำรุ่นใหม่', NULL, NULL, NULL, NULL, NULL, NULL, 192, 101, 109, 15, '{e_doc,e_sign,cloud,hr_digital}', NULL, NULL, NULL, NULL, NULL, false, 'live', NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 11, 5, 9, 2, NULL, 'all_staff', NULL, NULL, NULL, 76.78, 83.68, 80.78, 84.70, 'pending', 0, NULL, '2026-03-18 07:26:55.386304+00', NULL, NULL, 'not_applicable', NULL, NULL, '[]', NULL, NULL, NULL, 9, 28, 'round_2569', 'submitted', NULL, NULL, NULL, NULL, 'nrct'),
	('49c61a64-a445-4b17-b461-38e19b662b1d', '2026-03-18 06:55:07.58149+00', '2026-03-18 06:55:06.971+00', 'hronep@gmail.com', 'สำนักงานนโยบายและแผนทรัพยากรธรรมชาติและสิ่งแวดล้อม', 'ch1-v4.0', 'สำนักงานนโยบายและแผนทรัพยากรธรรมชาติและสิ่งแวดล้อม (สผ.) มุ่งขับเคลื่อนการพัฒนาประเทศให้เกิดความสมดุลระหว่างการพัฒนาเศรษฐกิจ สังคม และสิ่งแวดล้อม โดยเน้นบทบาทของ สผ. ในการเป็นหน่วยงานหลักด้านการกำหนดนโยบาย แผน และมาตรการในการอนุรักษ์และบริหารจัดการทรัพยากรธรรมชาติและสิ่งแวดล้อมของประเทศ เพื่อสนับสนุนการพัฒนาที่ยั่งยืนของประเทศไทย ภายใต้วิสัยทัศน์  “ประเทศไทยเติบโตอย่างยั่งยืนด้วยการบริหารจัดการทรัพยากรธรรมชาติและสิ่งแวดล้อมเพื่อประชาชน”  นอกจากนี้ ยังให้ความสำคัญกับการพัฒนาระบบการทำงานขององค์กรให้มีประสิทธิภาพมากขึ้น ทั้งด้านการกำกับ ติดตาม และประเมินผลการดำเนินงาน การพัฒนาระบบข้อมูลและเทคโนโลยีดิจิทัล รวมถึงการเสริมสร้างศักยภาพบุคลากร เพื่อให้การบริหารจัดการด้านสิ่งแวดล้อมของประเทศมีความทันสมัย โปร่งใส และสามารถรองรับการเปลี่ยนแปลงในอนาคตได้อย่างมีประสิทธิภาพและยั่งยืน', 'สำนักงานนโยบายและแผนทรัพยากรธรรมชาติและสิ่งแวดล้อม (สผ.) มีกรอบอัตรากำลัง ณ วันที่ 1 มีนาคม 2569  รวมทั้งสิ้น จำนวน 455 คน ประกอบด้วย ข้าราชการ จำนวน 267 คน ลูกจ้างประจำ จำนวน 3 คน พนักงานราชการ จำนวน 154 คน พนักงานกองทุนสิ่งแวดล้อม จำนวน 31 คน โดยแบ่งส่วนราชการตามภารกิจ เป็น 1 สำนัก 8 กอง และ 4 กลุ่มอิสระ (รายละเอียดตามไฟล์แนบ)

บทบาทหน้าที่หลัก : สผ. เป็นหน่วยงานในสังกัดกระทรวงทรัพยากรธรรมชาติและสิ่งแวดล้อม มีภารกิจหลัก 4 ด้าน คือ
	1. กำหนดนโยบายและแผนการส่งเสริมและรักษาคุณภาพสิ่งแวดล้อม โดยจัดทำนโยบายและแผนการอนุรักษ์และบริหารจัดการทรัพยากรธรรมชาติและสิ่งแวดล้อม เช่น แผนจัดการคุณภาพสิ่งแวดล้อม แผนปฏิบัติการด้านความหลากหลายทางชีวภาพระดับชาติ และแผนผังภูมินิเวศ เป็นต้น
	2. กำกับ ควบคุม และติดตาม ทั้งในส่วนของงานด้านการประเมินผลกระทบสิ่งแวดล้อม และรายงานสถานการณ์คุณภาพสิ่งแวดล้อม
	3. ส่งเสริม และสนับสนุนการดำเนินงานด้านทรัพยากรธรรมชาติและสิ่งแวดล้อม ผ่านกองทุนสิ่งแวดล้อม และแผนปฎิบัติการจัดการคุณภาพสิ่งแวดล้อมในระดับจังหวัด
	4. ดำเนินงานตามพันธกรณีอนุสัญญาระหว่างประเทศ โดยสำนักงานนโยบายฯ เป็นหน่วยประสานงานกลางระดับชาติของ 2 อนุสัญญา คือ อนุสัญญาคุ้มครองมรดกโลก และอนุสัญญาว่าด้วยความหลากหลายทางชีวภาพ รวมทั้งความตกลงระหว่างประเทศที่เกี่ยวข้อง', 455, 14, 80, 100, 59, 6, 39, 62, 55, 20, 19, 33, 19, 2, 10, 3, 0, 61, 97, 64, 3, 0, 1, 8, 3, 1, NULL, NULL, NULL, NULL, '1. สำนักงานนโยบายฯ  มีนโยบายการบริหารทรัพยากรบุคคล สผ. โดยกำหนดนโยบายด้านการพัฒนาคุณภาพชีวิต ส่งเสริมให้มีการจัดกิจกรรมการพัฒนาบุคลากรด้านการทำงาน ด้านชีวิตส่วนตัว ด้านสังคมและเศรษฐกิจ เพื่อให้บุคลากรรู้สึกเกิดความมั่นคง ได้รับขวัญกำลังใจและมีคุณภาพที่ดี เพื่อรักษาคนดี คนเก่งไว้กับหน่วยงาน
2. สำนักงานนโยบายฯ กำหนดประเด็นยุทธศาสตร์ภายใต้แผนยุทธศาสตร์การบริหารและการพัฒนาทรัพยากรบุคคล 3 ปี (พ.ศ. 2568 – 2570) คือ พัฒนาคุภาพชีวิตของบุคลากรและสร้างองค์การแห่งความสุข โดยมีเป้าประสงค์ (1) เพื่อยกระดับความผาสุกและความผูกพันของบุคลากรที่มีต่อองค์กร (2) เพื่อส่งเสริมให้บุคลากรมีพฤติกรรมที่สอดคล้องต่อค่านิยม และวัฒนธรรมองค์กร และ (3) การสร้างวัฒนธรรมในการเปิดรับฟังความคิดเห็น ส่งวเริมความร่วมมือ การเรียนรู้ และความเคารพซึ่งกันและกันในบุคลากรทุกระดับ', '1. บริบทด้านนโยบายระดับชาติ
สำนักงานนโยบายฯ มีภารกิจในการขับเคลื่อนและบูรณาการการดำเนินงานให้สอดคล้องกับนโยบายและยุทธศาสตร์ระดับชาติด้านการบริหารจัดการทรัพยากรธรรมชาติและสิ่งแวดล้อม รวมถึงแผนการพัฒนาประเทศที่มุ่งเน้นการเติบโตอย่างสมดุลและยั่งยืน โดยต้องจัดทำแผนงานและนโยบายด้านสิ่งแวดล้อมที่เชื่อมโยงกัน และแปลงนโยบายสู่การปฏิบัติให้เกิดผลสัมฤทธิ์อย่างเป็นรูปธรรม ตลอดจนสนับสนุนการกำหนดทิศทางการพัฒนาเชิงพื้นที่และการยกระดับคุณภาพสิ่งแวดล้อมของประเทศ
2. บริบทด้านกฎหมายและกลไกกำกับดูแล
การดำเนินงานของหน่วยงานอยู่ภายใต้กรอบกฎหมาย มาตรการ และเครื่องมือด้านสิ่งแวดล้อมที่ต้องมีการปรับปรุงให้ทันต่อสถานการณ์และบริบทการพัฒนา เช่น ระบบการประเมินผลกระทบสิ่งแวดล้อม 
การรายงานสถานการณ์คุณภาพสิ่งแวดล้อม และมาตรการกำกับดูแลเชิงนโยบาย ซึ่งจำเป็นต้องพัฒนาให้มีประสิทธิภาพ โปร่งใส และตอบสนองต่อความคาดหวังของสังคม
3. บริบทด้านเทคโนโลยีและการพัฒนาองค์กร
สำนักงานนโยบายฯ มีการปรับตัวสู่การเป็นองค์กรดิจิทัล โดยพัฒนาระบบฐานข้อมูล เทคโนโลยีสารสนเทศภายในองค์กร และรูปแบบการให้บริการภาครัฐให้มีความทันสมัย สะดวก รวดเร็ว และเข้าถึงได้ ทั้งการจัดทำระบบสารบรรณอิเล็กทรอนิกส์ ระบบ SMART EIA Plus ระบบคลังข้อมูลความหลากหลายทางชีวภาพ ระบบ E-Fund ตลอดจนพัฒนาศักยภาพบุคลากรและระบบบริหารจัดการองค์กรเพื่อรองรับการเปลี่ยนแปลงในอนาคตและเพิ่มประสิทธิภาพการปฏิบัติงาน
4. บริบทด้านความเสี่ยงและความท้าทาย
หน่วยงานต้องเผชิญกับความเสี่ยงจากปัจจัยภายนอก อาทิ 
4.1 ความเสี่ยงด้านนโยบายและยุทธศาสตร์ที่เปลี่ยนแปลง เช่น การเปลี่ยนแปลงนโยบายรัฐบาล การเปลี่ยนแปลงสภาพภูมิอากาศ ความเสื่อมโทรมของทรัพยากรธรรมชาติ การเปลี่ยนแปลงนโยบายและพันธกรณีระหว่างประเทศ ส่งผลให้การดำเนินงานไม่ต่อเนื่อง 
4.2 ความเสี่ยงด้านข้อมูลและสารสนเทศ จากการเข้าถึงข้อมูลหน่วยงานที่เกี่ยวข้องมีจำกัดหรือข้อมูลไม่เป็นปัจจุบัน อาจส่งผลต่อการวิเคราะห์นโยบายและการกำหนดมาตรการกำกับ ดูแล คลาดเคลื่อน  
4.3 ความเสี่ยงจากวิกฤตสถานการณ์โลก ซึ่งอาจส่งผลกระทบสิ่งแวดล้อม หรืองบประมาณที่หน่วยงานได้รับ อาจมีความต้องการใช้พลังงานฟอสซิลเพิ่มขึ้นส่งผลต่อมลภาวะ หรือหน่วยงานได้รับงบประมาณไม่เพียงพอในการปฏิบัติงาน', 0, 16, 0, 0, 0, 0, 95, 0, NULL, 111, 24.40, 1400, 6.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'อันดับ 1 ด้านสุขภาพและความเป็นอยู่ที่ดี 
อันดับ 2 ด้านโอกาสในการเรียนรู้และพัฒนา 
อันดับ 3 ด้านการทำงานในรูปแบบชีวิตวิถีใหม่', NULL, 'full', 'full', 'full', 'full', NULL, 'none', NULL, NULL, NULL, NULL, NULL, NULL, 'รายละเอียดตามไฟล์', NULL, NULL, NULL, 'ch1-uploads/section1/org-structure/agency_1773655548251.pdf', 'https://fgdommhiqhzvsedfzyrr.supabase.co/storage/v1/object/public/hrd-documents/ch1-uploads/section1/org-structure/agency_1773655548251.pdf', 'โครงสร้าง สผ..pdf', NULL, NULL, NULL, 'การพัฒนาศักยภาพด้านดิจิทัล', 'การพัฒนาผู้นำรุ่นใหม่', 'การลดอัตราการลาป่วย', NULL, NULL, NULL, NULL, NULL, 253, 152, 3, 31, '{e_doc,e_sign,cloud,hr_digital}', 3.00, 7.14, 4.67, 7.09, 4.86, false, 'live', NULL, 263, 266, 262, 255, 247, 271, 266, 252, 253, 247, 8, 19, 12, 18, 12, 'all_staff', 'official_only', NULL, NULL, 86.80, 81.87, 85.89, 81.12, 83.54, 'pending', 0, NULL, '2026-03-18 06:55:07.58149+00', NULL, NULL, 'pending', NULL, NULL, '[]', 7, 7, 30, 30, 17, 'round_2569', 'submitted', NULL, NULL, NULL, NULL, 'onep'),
	('e7c6057d-8832-4d3d-9fb3-93203979faca', '2026-03-19 11:28:08.795479+00', '2026-03-19 11:28:08.037+00', 'penvana.p@gmail.com', 'สำนักงานนโยบายและยุทธศาสตร์การค้า', 'ch1-v4.0', 'ยุทธศาสตร์สำนักงานนโยบายและยุทธศาสตร์การค้า
ประเด็นยุทธศาสตร์ที่ 1
จัดทำ/เสนอแนะ และขับเคลื่อนนโยบายและยุทธศาสตร์การค้าแห่งชาติ เพื่อรองรับเศรษฐกิจใหม่
เป้าประสงค์
•	เศรษฐกิจการค้าไทยมีความสามารถในการแข่งขันสูงขึ้น
กลยุทธ์
1.1 ศึกษาโอกาสจากแนวโน้มตลาดโลกและประเด็นทางการค้าใหม่ เพื่อเพิ่มมูลค่าทางเศรษฐกิจ
1.2 สร้างมูลค่าเพิ่มทางเศรษฐกิจโดยใช้แนวคิดเศรษฐกิจสร้างสรรค์และนวัตกรรมเชิงพาณิชย์
1.3 เสริมสร้างศักยภาพธุรกิจบริการ
1.4 สร้างความเข้มแข็งเศรษฐกิจฐานรากไทย
1.5 สร้างกลไกในการขับเคลื่อนยุทธศาสตร์การค้าสู่การปฏิบัติอย่างมีประสิทธิภาพ
________________________________________
ประเด็นยุทธศาสตร์ที่ 2
เป็นศูนย์ความเป็นเลิศด้านข้อมูลเศรษฐกิจการค้าของประเทศ
เป้าประสงค์
•	มีข้อมูลเศรษฐกิจการค้าและเครื่องชี้วัดที่ถูกต้อง ทันสมัย เพื่อประกอบการจัดทำยุทธศาสตร์การค้า รวมทั้งสนับสนุนการวางแผนและการตัดสินใจเชิงนโยบายของภาครัฐและเอกชน
กลยุทธ์
2.1 บริหารจัดการและพัฒนาระบบเทคโนโลยีสารสนเทศด้านเศรษฐกิจการค้าให้ทันสมัยและมีประสิทธิภาพ
2.2 จัดทำและพัฒนาเครื่องชี้วัดด้านเศรษฐกิจการค้าให้ถูกต้อง ทันสมัย และเป็นไปตามมาตรฐานสากลอย่างต่อเนื่อง
2.3 สร้างและพัฒนาเครือข่ายในการแลกเปลี่ยนและเชื่อมโยงข้อมูล
________________________________________
ประเด็นยุทธศาสตร์ที่ 3
สร้างองค์กรให้เป็นที่ยอมรับด้านวิชาการและมีธรรมาภิบาล
เป้าประสงค์
•	ผลงานเป็นที่ยอมรับและมีการนำไปใช้ประโยชน์
กลยุทธ์
3.1 พัฒนากระบวนการบริหารจัดการองค์กรให้มีประสิทธิภาพ
3.2 เปิดโอกาสให้ทุกภาคส่วนเข้ามามีส่วนร่วมในการทำงาน
3.3 พัฒนาขีดความสามารถของบุคลากร
3.4 สร้างความเป็นธรรม ขวัญกำลังใจ และบรรยากาศที่ดีในการทำงาน
3.5 สร้างองค์ความรู้และกระบวนการถ่ายทอดความรู้อย่างเป็นระบบ', 'สำนักงานนโยบายและยุทธศาสตร์การค้า มีโครงสร้างแบ่งออกเป็น 2 ส่วน ได้แก่
1) โครงสร้างตามกฎหมาย
เป็นหน่วยงานหลักที่กำหนดไว้ตามกฎหมาย ประกอบด้วย
•	ผู้บริหารระดับสูง (ผู้อำนวยการ และรองผู้อำนวยการ)
•	หน่วยงานสนับสนุน ได้แก่ กลุ่มตรวจสอบภายใน และกลุ่มพัฒนาระบบบริหาร
•	หน่วยงานหลัก (กอง/สำนักงาน) เช่น
o	สำนักงานเลขานุการกรม
o	กองนโยบายและยุทธศาสตร์การค้าสินค้าเกษตร
o	กองนโยบายและยุทธศาสตร์การค้าสินค้าอุตสาหกรรมและธุรกิจบริการ
o	กองยุทธศาสตร์การพัฒนาความสามารถทางการแข่งขัน
o	กองดัชนีเศรษฐกิจการค้า
________________________________________
2) โครงสร้างภายใน
เป็นการจัดหน่วยงานเพิ่มเติมเพื่อเพิ่มประสิทธิภาพการทำงาน ได้แก่
•	ศูนย์ข้อมูลเศรษฐกิจการค้า
•	การจัดกลุ่มงานย่อยภายในกองต่าง ๆ เช่น งานวิเคราะห์ข้อมูล งานดัชนี งานสารสนเทศ และงานนโยบายเฉพาะด้าน

หน้าที่และอำนาจของสำนักงานนโยบายและยุทธศาสตร์การค้า
สำนักงานนโยบายและยุทธศาสตร์การค้า มีภารกิจเกี่ยวกับการเสนอแนะในการกำหนดและจัดทำนโยบายและยุทธศาสตร์การค้าของประเทศ เพื่อให้การพัฒนาเศรษฐกิจการค้าของประเทศให้เจริญเติบโตอย่างมั่นคงและยั่งยืน และขับเคลื่อนยุทธศาสตร์ไปสู่การปฏิบัติให้บรรลุผลสัมฤทธิ์ วางแผนกลยุทธ์เชิงรุกด้านการค้าให้กับกระทรวงพาณิชย์และรัฐบาล ตลอดจนพัฒนาและสร้างเครื่องชี้วัดเศรษฐกิจการค้า วิเคราะห์ พยากรณ์ และเตือนภัยภาวะเศรษฐกิจทั้งภายในและภายนอกที่มีผลกระทบต่อเศรษฐกิจของประเทศ เพื่อให้การปฏิบัติงานด้านนโยบายและยุทธศาสตร์การค้าของประเทศเป็นไปอย่างมีประสิทธิภาพ บรรลุเป้าประสงค์ของการเป็นชาติการค้า และเศรษฐกิจการค้าของประเทศพัฒนาอย่างมั่นคงและยั่งยืน โดยให้มีหน้าที่ดังต่อไปนี้
1.	วางแผน จัดทำ ประสาน และบูรณาการนโยบายและยุทธศาสตร์การค้าของประเทศ รวมถึงยุทธศาสตร์อื่นที่เกี่ยวข้อง เพื่อให้มีทิศทางการดำเนินงานและเป็นเอกภาพ
2.	จัดทำและพัฒนาเครื่องชี้วัดและพยากรณ์เศรษฐกิจการค้า ที่เป็นเครื่องมือประกอบการกำหนดทิศทางการบริหารเศรษฐกิจของประเทศ ตลอดจนการเตือนภัยทางการค้า
3.	ศึกษา วิเคราะห์ และติดตามสถานการณ์การค้าการลงทุน เพื่อนำเสนอประเด็นสำคัญและกำหนดแนวทางในการสร้างโอกาสและช่องทางการค้าให้กับผู้ประกอบการไทยในการพัฒนาการค้า
4.	วิเคราะห์และกำหนดกลุ่มสินค้าและบริการสำคัญ เพื่อนำเสนอนโยบายและยุทธศาสตร์การค้าภาพรวม และนโยบายและยุทธศาสตร์การค้าในแต่ละกลุ่มสินค้าและบริการที่สำคัญ สำหรับใช้เป็นแนวทางในการดำเนินงานในการแก้ไขปัญหาอุปสรรคทางการค้าไปปฏิบัติได้อย่างมีประสิทธิภาพ และมีขีดความสามารถในการแข่งขันตลอดห่วงโซ่คุณค่า
5.	ประสานความร่วมมือและขับเคลื่อนการดำเนินงานภายใต้นโยบายและยุทธศาสตร์การค้าของประเทศ ตลอดจนการติดตามผลการดำเนินงานด้านเศรษฐกิจการค้าอย่างต่อเนื่อง
6.	เป็นศูนย์กลางระบบข้อมูลสารสนเทศเชิงลึกด้านเศรษฐกิจการค้าและพัฒนาเทคโนโลยีและระบบสารสนเทศให้มีความทันสมัย รวมถึงสร้างเครือข่ายการแลกเปลี่ยนข้อมูลสารสนเทศเศรษฐกิจการค้า ทั้งภายในประเทศและต่างประเทศ ตลอดจนเผยแพร่และให้คำปรึกษาด้านข้อมูล
7.	ดำเนินการเกี่ยวกับงานกฎหมายของคณะกรรมการนโยบายเศรษฐกิจระหว่างประเทศ
8.	ปฏิบัติการอื่นตามที่กฎหมายกำหนดให้เป็นอำนาจหน้าที่ของสำนักงานหรือ ตามที่รัฐมนตรีหรือคณะรัฐมนตรีมอบหมาย', 163, 14, 53, 41, 20, 17, 43, 45, 18, 17, 7, 8, 8, 0, 10, 0, 0, 33, 50, 28, 0, 0, 2, 3, 1, 1, NULL, NULL, NULL, NULL, '1.แนวทางการพัฒนาบุคลากรภาครัฐ พ.ศ. 2566 - 2570 (สำนักงาน ก.พ.)
2.แผนกลยุทธ์ทรัพยากรบุคคล ระยะ 5 ปี (พ.ศ. 2565 - 2569) 
3.Action Plan (พ.ศ.2566-2569)
4.โครงการพัฒนานักยุทธศาสตร์การค้าของสำนักงานนโยบายและยุทธศาสตร์การค้า ประจำปีงบประมาณ', '1.การเปลี่ยนแปลงด้านกฎหมาย/เทคโนโลยี
2.ไม่มี IDP', 0, 0, 0, 0, 0, 0, 0, 0, NULL, 0, NULL, 708, 6.87, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'สวัสดิการ และ Work Life Balance', 'จากผลที่ได้ ==>เครื่องมือที่ใช้
ปี 2565-2566 ใช้ Happy 8
ปี 2567 ใช้ของสำนักงาน ก.พ.
ปี 2568 ใช้ของกระทรวงพาณิชย์', 'full', 'full', 'none', 'none', NULL, 'none', NULL, NULL, NULL, 'แผนพัฒนารายบุคคล IDP', NULL, NULL, 'สำนักงานนโยบายและยุทธศาสตร์การค้า ภายใต้แผนกลยุทธ์ทรัพยากรบุคคล ระยะ 5 ปี (พ.ศ. 2565 - 2569) ประกอบกับพิจารณาเห็นถึงความสำคัญในการพัฒนาทรัพยากรบุคคลในทุกด้าน อาทิ การเตรียมความพร้อมสำหรับผู้นำ
การเปลี่ยนแปลง การพัฒนาความเชี่ยวชาญเฉพาะรองรับธุรกิจใหม่ การพัฒนาตามช่วงวัย (Generation) อย่างเหมาะสม อีกทั้งเพื่อสนับสนุนทิศทางการพัฒนาประเทศ ประกอบกับแนวทางการพัฒนาบุคลากรภาครัฐ พ.ศ. 2566 - 2570 ตามข้อ 1.1 จึงเห็นควรจัดทำโครงการพัฒนานักยุทธศาสตร์การค้าของสำนักงานนโยบายและยุทธศาสตร์การค้า ประจำปีงบประมาณ พ.ศ. 2569 ตามแผนยุทธศาสตร์ 4 ด้าน ดังนี้ 1) พัฒนาทักษะเชิงยุทธศาสตร์และภาวะผู้นำ (เก่งนำองค์กร) 2) พัฒนาสมรรถนะสู่ความเป็นเลิศด้านนโยบายและยุทธศาสตร์เศรษฐกิจไทยก้าวสู่ยุคเศรษฐกิจใหม่ (เก่งตามสายวิชาชีพ) 3) พัฒนาทักษะพื้นฐานและดิจิทัลเพื่อรองรับการปฏิบัติงานของภาครัฐยุคใหม่ (เก่งทันการเปลี่ยนแปลง) และ 4) พัฒนาและส่งเสริมจิตสำนึกด้านคุณธรรมจริยธรรม และเสริมสร้างองค์กรแห่งความสุข (เก่งและเป็นคนดี)

ไฟล์ PDF รายงานผลประจำปี (ขนาดเกินอัพโหลดไม่ได้ค่ะ)
สามารถดูได้จากลิงค์นี้  https://www.tpso.go.th/CategoryDocument-fhgn1', 'ch1-uploads/section1/strategy/agency_1773917862557.pdf', 'https://fgdommhiqhzvsedfzyrr.supabase.co/storage/v1/object/public/hrd-documents/ch1-uploads/section1/strategy/agency_1773917862557.pdf', 'ยุทธศาสตร์สำนักงานนโยบายและยุทธศาสตร์การค้า.pdf', 'ch1-uploads/section1/org-structure/agency_1773917990821.pdf', 'https://fgdommhiqhzvsedfzyrr.supabase.co/storage/v1/object/public/hrd-documents/ch1-uploads/section1/org-structure/agency_1773917990821.pdf', 'โครงสร้างและอำนาจหน้าที่.pdf', NULL, NULL, NULL, 'แผนพัฒนารายบุคคล IDP', 'การพัฒนาศักยภาพด้านดิจิทัล', 'การพัฒนาผู้นำรุ่นใหม่', NULL, NULL, NULL, NULL, NULL, 128, 35, 0, 0, '{e_doc,e_sign,cloud,hr_digital}', 11.56, 12.93, 10.79, 8.66, 10.32, false, 'live', NULL, 112, 113, 119, 128, 125, 113, 119, 122, 126, 127, 13, 15, 13, 11, 13, NULL, 'official_only', NULL, NULL, NULL, 71.23, 70.22, 76.08, 78.59, 'pending', 0, NULL, '2026-03-19 11:28:08.795479+00', NULL, NULL, 'pending', NULL, NULL, '[]', NULL, NULL, 33, 38, 31, 'round_2569', 'submitted', NULL, NULL, NULL, NULL, 'tpso'),
	('6d62c51d-1690-4051-9979-93e466550632', '2026-03-19 07:06:20.033174+00', '2026-03-19 07:06:19.657+00', 'hrme@mots.go.th', 'สำนักงานปลัดกระทรวงการท่องเที่ยวและกีฬา', 'ch1-v4.0', 'https://secretary.mots.go.th/download/article/article_20250313105257.pdf', '1. https://secretary.mots.go.th/news/3554
2. อำนาจหน้าที่ของสำนักงานปลัดกระทรวงการท่องเที่ยวและกีฬา
กฎกระทรวงแบ่งส่วนราชการสำนักงานปลัดกระทรวง กระทรวงการท่องเที่ยวและกีฬา พ.ศ. 2568 ที่ประกาศในราชกิจจานุเบกษา เล่มที่ 142 ตอนที่ 41 ก วันที่ 19 มิถุนายน 2568 ให้สำนักงานปลัดกระทรวง กระทรวงการท่องเที่ยวและกีฬา มีภารกิจเกี่ยวกับการเป็นศูนย์กลางการบริหารของกระทรวงในการพัฒนายุทธศาสตร์และแปลงนโยบายของกระทรวงเป็นแผนปฏิบัติราชการ จัดสรรทรัพยากร และบริหารราชการทั่วไปของกระทรวงให้บรรลุเป้าหมายและเกิดผลสัมฤทธิ์ตามภารกิจของกระทรวง โดยให้มีหน้าที่และอำนาจ ดังต่อไปนี้
(1) ศึกษา วิเคราะห์ เสนอแนะนโยบาย แผนหรือมาตรการต่อคณะกรรมการนโยบาย การท่องเที่ยวแห่งชาติ และคณะกรรมการนโยบายการกีฬาแห่งชาติ รวมทั้งดำเนินการเกี่ยวกับ งานเลขานุการของคณะกรรมการนโยบายการท่องเที่ยวแห่งชาติ และคณะกรรมการนโยบายการกีฬาแห่งชาติ
(2) ศึกษา วิเคราะห์ จัดทำข้อมูลเพื่อเสนอแนะรัฐมนตรีสำหรับใช้ในการกำหนดนโยบาย เป้าหมาย และผลสัมฤทธิ์ของกระทรวง รวมทั้งการแปลงนโยบายเป็นแนวทางและแผปฏิบัติราชการ
(3) จัดทำและพัฒนาแผนยุทธทธศาสตร์อันเป็นแผนแม่บทของกระทรวงในการพัฒนาการท่องเที่ยว กีฬา และนันทนาการ ตามนโยบายของกระทรวงให้สอดคล้องกับนโยบายของรัฐบาล และแผนปฏิบัติ ราชการของกระทรวง รวมทั้งเสนอแนะนโยบายในการตั้งและจัดสรรงบประมาณประจำปี
(4) ดำเนินการเกี่ยวกับการบริหารงานของคณะกรรมการบริหารกองทุนเพื่อส่งเสริม การท่องเที่ยวไทย รวมทั้งช่วยเหลือและสนับสนุนการบริหารและพัฒนาการท่องเที่ยว และการบริหาร จัดการกองทุนเพื่อส่งเสริมการท่องเที่ยวไทย
(5) จัดเก็บค่าธรรมเนียมการท่องเที่ยวภายในประเทศของนักท่องเที่ยวชาวต่างชาติ และจัดให้มี การประกันภัยแก่นักท่องเที่ยวชาวต่างชาติ
(6) จัดทำ พัฒนา และกำหนดนดมาตรฐานความปลอดภัยด้านการท่องเที่ยว รวมทั้งรวบรวม สถิติข้อมูลที่เกี่ยวข้องกับความปลอดภัยด้านการท่องเที่ยว
(7) จัดสรรและบริหารทรัพยากรของกระทรวงเพื่อให้เกิดการประหยัด คุ้มค่า และสมประโยชน์
(8) ดำเนินการเกี่ยวกับการประชาสัมพันธ์และเผยแพร่กิจกรรม ตลอดจนผลงานของกระทรวง
(9) กำกับ เร่งรัด ติดตาม ประเมินผล และประสานการปฏิบัติราชการของหน่วยงาน
ในสังกัดกระทรวง
(10) พัฒนาระบบเทคโนโลยีและสารสนเทศเพื่อการบริหารและการให้บริการของหน่วยงาน ในสังกัดกระทรวงและเป็นศูนย์กลางในการบูรณาการข้อมูลสารสนเทศด้านการท่องเที่ยวและการกีฬา
(11) พัฒนาระบบและบริหารจัดการผู้มูลด้านเศรษฐกิจการท่องเที่ยวและก็หา
(12) ประสานความร่วมมือกับต่างประเทศและองค์การระหว่างประเทศ ด้านการท่องเที่ยวกีฬา และนันทนาการ
(13) ดำเนินการตามกฎหมายว่าด้วยนโยบายการท่องเที่ยวแห่งชาติ กฎหมายว่าด้วยนโยบายการกีฬาแห่งชาติรวมทั้งกฎหมายและระเบียบที่อยู่ในความรับผิดชอบของกระทรวง และกฎหมายอื่นที่เกี่ยวข้อง
(14) ปฏิบัติการอื่นใดตามที่กฎหมายกำหนดให้เป็นหน้าที่และอำนาจของสำนักงานปลัดกระทรวงหรือตามที่รัฐมนตรีหรือคณะรัฐมนตรีมอบหมาย
กฎกระทรวงแบ่งส่วนราชการสำนักงานปลัดกระทรวง กระทรวงการท่องเที่ยวและกีฬา พ.ศ. ๒๕๖๘', 570, 52, 173, 142, 52, 0, 41, 72, 83, 55, 55, 45, 68, 0, 26, 0, 0, 0, 235, 56, 5, 0, 14, 63, 1, 5, NULL, NULL, NULL, NULL, 'https://secretary.mots.go.th/download/article/article_20250313105257.pdf', 'https://secretary.mots.go.th/download/article/article_20250313105257.pdf', 0, 0, 0, 0, 0, 0, 0, 0, NULL, 0, NULL, 462, 1.10, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ข้อจำกัดของพื้นที่อาคารสำนักงาน', '- ไม่มี', 'partial', 'partial', 'partial', 'partial', NULL, 'none', NULL, NULL, NULL, NULL, NULL, NULL, 'https://secretary.mots.go.th/images/v2022_1a3ecb50-b22b-4ad4-9b1e-4964d2910151.pdf', 'ch1-uploads/section1/strategy/agency_1773829735081.pdf', 'https://fgdommhiqhzvsedfzyrr.supabase.co/storage/v1/object/public/hrd-documents/ch1-uploads/section1/strategy/agency_1773829735081.pdf', 'แผนปฏิบัติราชการ สป.กก. 2570.pdf', NULL, NULL, NULL, NULL, NULL, NULL, 'การพัฒนาผู้นำรุ่นใหม่', 'การพัฒนาศักยภาพด้านดิจิทัล', 'การลดอัตราการลาป่วย', NULL, NULL, NULL, NULL, NULL, 419, 121, 30, 0, '{e_doc,e_sign,cloud,hr_digital}', NULL, NULL, NULL, NULL, NULL, false, 'live', NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'all_staff', 'official_only', NULL, 'official_only', NULL, NULL, 76.47, 78.00, 78.57, 'pending', 0, NULL, '2026-03-19 07:06:20.033174+00', NULL, NULL, 'pending', NULL, NULL, '[]', NULL, NULL, NULL, NULL, NULL, 'round_2569', 'submitted', NULL, NULL, NULL, NULL, 'mots'),
	('2d0ead37-2ab2-4fde-88e9-74bba621658f', '2026-03-19 08:21:15.908642+00', '2026-03-19 08:21:14.269+00', 'natthiyaporn@nesdc.go.th', 'สำนักงานสภาพัฒนาการเศรษฐกิจและสังคมแห่งชาติ', 'ch1-v4.0', 'วิสัยทัศน์
องค์กรประสิทธิภาพสูงเชิงรุก

ค่านิยมองค์กร
มุ่งมั่น ทุ่มเท เพื่อพัฒนาประเทศและประโยชน์สุขแก่สังคม ด้วยคุณธรรม ตามหลักวิชาการอย่างมืออาชีพ

วัฒนธรรมองค์การ
- เป็นองค์กรที่มุ่งสู่ความเป็นเลิศทางด้านวิชาการ 
- เป็นองค์กรที่มีความรับผิดชอบต่อสาธารณะและสังคม 
- มีระบบธรรมาภิบาล 
- บุคลากรของสำนักงานฯ เป็นทรัพยากรอันมีค่าที่สุดขององค์กร

พันธกิจ 5 ประการ ดังนี้
พันธกิจที่ 1 จัดทำและบูรณาการแผนพัฒนาประเทศ เพื่อการพัฒนากรอบทิศทางการพัฒนาประเทศ
ที่ครอบคลุมทุกประเด็นที่สำคัญ โดยมุ่งให้แผนพัฒนามีความสอดคล้องกับบริบทของพื้นที่และประเทศ รวมถึงการวิเคราะห์และประเมินผลเพื่อปรับปรุงแผนพัฒนาอย่างต่อเนื่อง

พันธกิจที่ 2 ประสานขับเคลื่อนการพัฒนาประเทศ  เป็นการดำเนินการตามแผนและนโยบายที่กำหนดไว้ในระดับต่าง ๆ โดยการนำเสนอโครงการที่สอดคล้องกับเป้าหมายการพัฒนาภายใต้แผนทั้ง 3 ระดับ รวมถึง
การประสานงานกับหน่วยงานที่เกี่ยวข้องเพื่อให้การพัฒนาประเทศ เป็นไปอย่างราบรื่นและบรรลุเป้าหมายที่กำหนดไว้

พันธกิจที่ 3 ติดตามและประเมินผลการพัฒนาประเทศ เป็นการดำเนินการที่เกี่ยวข้องกับการวิเคราะห์และประเมินผลลัพธ์ของแผนพัฒนาเศรษฐกิจและสังคมแห่งชาติในทุกระดับ เพื่อให้สามารถปรับปรุงและขับเคลื่อนแผนพัฒนาได้อย่างมีประสิทธิภาพ รวมถึงการสร้างเครือข่ายและเครื่องมือในการติดตามประเมินผลที่มีประสิทธิภาพ

พันธกิจที่ 4 หน่วยงานข้อมูลและองค์ความรู้ในการพัฒนาประเทศ เพื่อการสร้างและจัดหาข้อมูล
ที่เชื่อถือได้และเป็นประโยชน์สำหรับการพัฒนาประเทศ รวมถึงการพัฒนาชุดข้อมูลและองค์ความรู้ที่สามารถนำไปใช้ในงานวิเคราะห์และการตัดสินใจเพื่อการพัฒนาประเทศอย่างต่อเนื่องและครอบคลุม

พันธกิจที่ 5 หน่วยงานบริหารจัดการภายในองค์กรที่มีประสิทธิภาพ  เป็นการพัฒนาระบบการจัดการภายในองค์กรให้สามารถสนับสนุนการดำเนินงานต่าง ๆ ได้อย่างมีประสิทธิภาพ และสอดคล้องกับพันธกิจอื่น ๆ รวมถึงการพัฒนาบุคลากรและระบบการทำงานที่มีมาตรฐานสูง', 'โครงสร้างการแบ่งส่วนราชการภายในสำนักงานสภาพัฒนาการเศรษฐกิจและสังคมแห่งชาติ
	สศช. มีเลขาธิการสภาพัฒนาการเศรษฐกิจและสังคมแห่งชาติเป็นผู้บริหารสูงสุด มีผู้บริหาร ระดับรองลงมา ได้แก่ รองเลขาธิการฯ ที่ปรึกษาด้านนโยบายและแผนงาน ผู้อำนวยการสำนัก/กอง มีบุคลากรรวมประมาณ 600 คน แบ่งส่วนราชการ ตามกฎกระทรวง แบ่งส่วนราชการสำนักงานสภาพัฒนาการเศรษฐกิจและสังคมแห่งชาติ สำนักนายกรัฐมนตรี พ.ศ. 2562 เป็น 5 สำนักงาน 14 กอง และ 1 ศูนย์
 
อำนาจหน้าที่
•	ดำเนินงานในฐานะเจ้าหน้าที่ฝ่ายเลขานุการของสภาพัฒนาการเศรษฐกิจและสังคมแห่งชาติ
•	ศึกษา วิเคราะห์ วิจัย และติดตามภาวะเศรษฐกิจและสังคมของประเทศและของโลก รวมทั้งปัญหาและโอกาสทางเศรษฐกิจและสังคม และคาดการณ์แนวโน้มการเปลี่ยนแปลงที่สำคัญทั้งในบริบทประเทศและโลก เพื่อจัดทำข้อเสนอในเชิงนโยบายและมาตรการการพัฒนาประเทศหรือรองรับผลกระทบต่อภาวะเศรษฐกิจและสังคมของประเทศเพื่อนำเสนอคณะรัฐมนตรี นายกรัฐมนตรี หรือสภาพัฒนาการเศรษฐกิจและสังคมแห่งชาติพิจารณา 
•	ประสานงานกับหน่วยงานของรัฐและประชาชนภาคส่วนต่าง ๆ เกี่ยวกับการจัดทำร่างแผนพัฒนาเศรษฐกิจและสังคมแห่งชาติ
•	ดำเนินการในส่วนที่เกี่ยวข้องกับยุทธศาสตร์ชาติและแผนการปฏิรูปประเทศ 
•	จัดทำฐานข้อมูลเศรษฐกิจและสังคม บัญชีประชาชาติของประเทศตามระบบสากล เพื่อประกอบการจัดทำนโยบายการพัฒนาประเทศ และรายงานภาวะเศรษฐกิจและสังคมของประเทศเสนอคณะรัฐมนตรีเพื่อทราบ และเผยแพร่ให้ประชาชนทราบ 
•	จัดทำกรอบการลงทุนประจำปีของรัฐวิสาหกิจในภาพรวม 
•	จัดทำข้อเสนองบประมาณประจำปีของรัฐวิสาหกิจ ซึ่งมิใช่บริษัทมหาชนจำกัดสำหรับสินทรัพย์ถาวรที่เพิ่มขึ้นเพื่อใช้ในการพัฒนาเศรษฐกิจและสังคม รวมทั้งจำนวนเงินที่ใช้จ่ายเพื่อการนี้ และเสนอสภาเพื่อพิจารณา 
•	พิจารณาแผนงานและโครงการพัฒนาของกระทรวง ทบวง กรม หรือส่วนราชการที่เรียกเชื่ออย่างอื่น
ที่มีฐานะเป็นกรม และของรัฐวิสาหกิจที่มีมูลค่าตามที่คณะรัฐมนตรีกำหนด รวมทั้งประสานแผนงานและโครงการพัฒนาดังกล่าว เพื่อวางแผนส่วนรวมให้สอดคล้องกับแผนพัฒนาเศรษฐกิจและสังคมแห่งชาติ 
•	สนับสนุนและประสานงานกับส่วนราชการ รัฐวิสาหกิจ และภาคีที่เกี่ยวข้องในการจัดทำแผน แผนงาน และโครงการพัฒนา และการขับเคลื่อนการปฏิบัติงานตามแผน 
•	ติดตามและประเมินผลการดำเนินการตามแผนพัฒนาเศรษฐกิจและสังคมแห่งชาติ นโยบาย แผน แผนงาน และโครงการพัฒนาที่มีผลกระทบในวงกว้างต่อการพัฒนาประเทศในภาพรวม รวมทั้งให้คำแนะนำเกี่ยวกับการเร่งรัด ปรับปรุง หรือเลิกล้มโครงการพัฒนาอันหนึ่งอันใดเมื่อเห็นสมควร 
•	ขอให้หน่วยงานของรัฐเสนอแผนงานและโครงการพัฒนา ข้อเท็จจริง ตลอดจนรายละเอียดที่จำเป็นแก่การศึกษาภาวะเศรษฐกิจและสังคมของประเทศหรือการพิจารณาผลงานของโครงการพัฒนาที่กำลังดำเนินการอยู่ หรือเชิญบุคคลหนึ่งบุคคลใดมาให้ข้อเท็จจริง คำอธิบาย ความเห็น หรือคำแนะนำได้เมื่อเห็นสมควร 
•	ปฏิบัติการอื่นตามที่บัญญัติไว้ในพระราชบัญญัตินี้ กฎหมายอื่น หรือตามที่คณะรัฐมนตรีนายกรัฐมนตรี หรือสภามอบหมาย รวมทั้งออกระเบียบในส่วนที่เกี่ยวข้องตามความจำเป็น', 666, 147, 152, 124, 106, 47, 129, 105, 56, 73, 39, 48, 32, 11, 39, 0, 0, 185, 132, 109, 21, 4, 0, 21, 0, 7, NULL, NULL, NULL, NULL, 'สศช. ได้จัดทำแผนพัฒนาบุคลากร พ.ศ. 2566 – 2570 โดยกำหนดบทบาทการขับเคลื่อนการดำเนินการให้เป็นไปตามที่สำนักงาน ก.พ. กำหนด ดังนี้
- สนับสนุนให้เกิดสภาพแวดล้อมองค์กรที่ส่งเสริมการเรียนรู้และพัฒนา และการแลกเปลี่ยนเรียนรู้
- กำหนดให้มีรูปแบบการพัฒนาที่หลากหลายและยืดหยุ่น เพื่อให้บุคลากรทุกหน่วยงานได้รับการพัฒนาในทักษะและความรู้ที่จำเป็นต่อการปฏิบัติงานอย่างเพียงพอและต่อเนื่อง
- เปิดรับฟังความคิดเห็นจากบุคลากรเกี่ยวกับความต้องการพัฒนา เพื่อนำข้อมูลไปใช้ในการปรับปรุงแผนพัฒนาบุคลากรอย่างต่อเนื่อง
- กำหนดกรอบความสามารถในแต่ละด้านที่แตกต่างกันตามบทบาทหน้าที่และความรับผิดชอบของบุคลากรแต่ละกลุ่ม ทั้งกรอบความคิด (Mindsets) และทักษะ (Skills) ตามภารกิจของหน่วยงานเพื่อการปฏิบัติงานที่มีประสิทธิภาพสูง
- สนับสนุนให้บุคลากรมีความพร้อมในการเปิดรับสิ่งใหม่ พัฒนา Growth Mindset มีความฉลาดทางอารมณ์ และมีความกระตือรือร้นในการเรียนรู้ตลอดชีวิต เพื่อให้สามารถขับเคลื่อนองค์กรสู่การเป็นคลังสมองเชิงยุทธศาสตร์ที่ทันสมัยและตอบโจทย์การพัฒนาประเทศในระยะยาว', '- สศช. ต้องเผชิญกับความเปลี่ยนแปลงที่ไม่สามารถคาดการณ์ได้ล่วงหน้า ทำให้การดำเนินงานจำเป็นต้องมีเป้าหมายที่ชัดเจนเพื่อสร้างความสมดุลและความยั่งยืน 
- สศช. ต้องทำงานต้องเชื่อมโยงในหลายมิติ ทั้งด้านเศรษฐกิจ สังคม และสิ่งแวดล้อม รวมถึงเสริมสร้างเครือข่ายความร่วมมือที่มีประสิทธิภาพทั้งในระดับพื้นที่และระดับประเทศ โดยบุคลากรของ สศช. ต้องมีความรู้เชิงลึกและเชิงกว้างเพื่อรองรับภารกิจที่ซับซ้อน
- สศช. เผชิญกับปัญหาด้านกำลังคนที่มีสมรรถนะไม่เพียงพอ ทำให้ภาระงานกระจุกตัวอยู่กับบุคลากรบางกลุ่ม นอกจากนี้ การทำงานระหว่างกองและสำนักยังขาดการบูรณาการ ขณะที่อัตราการลาออกของบุคลากรระดับปฏิบัติการที่สูง รวมถึงความไม่สมดุลระหว่างงานและชีวิต ส่งผลกระทบต่อประสิทธิภาพขององค์กรในระยะยาว
- สศช. ต้องเผชิญกับอุปสรรคสำคัญ ได้แก่ ความไม่แน่นอนทางการเมืองที่ทำให้การขับเคลื่อนนโยบายขาดความต่อเนื่อง ปัจจัยด้านภูมิรัฐศาสตร์ที่เปลี่ยนแปลงอย่างรวดเร็ว รวมถึงข้อจำกัดด้านกฎระเบียบราชการที่ส่งผลต่อการจัดสรรกำลังคนและงบประมาณ 
- สศช. ต้องเผชิญกับปัญหาสิ่งแวดล้อม เช่น การเปลี่ยนแปลงสภาพภูมิอากาศและมลพิษ เป็นปัจจัยที่ต้องเตรียมรับมือ 

สศช. จำเป็นต้องเร่งพัฒนาระบบการบริหารทรัพยากรบุคคลที่มีประสิทธิภาพ ส่งเสริมการเรียนรู้ดิจิทัล และเสริมสร้างขีดความสามารถของบุคลากร เพื่อให้สามารถตอบสนองต่อความท้าทายและขับเคลื่อนนโยบายแห่งชาติได้อย่างยั่งยืน', 0, 0, 0, 0, 0, 0, 0, 0, NULL, 0, NULL, 1284, 1.93, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'full', 'full', 'none', 'full', NULL, 'done', 'มีห้อง co-working space ที่ทำให้บุคลากรสามารถทำงานในสถานที่ที่ผ่อนคลายมากขึ้น', NULL, NULL, NULL, NULL, NULL, NULL, 'ch1-uploads/section1/strategy/agency_1773907252369.pdf', 'https://fgdommhiqhzvsedfzyrr.supabase.co/storage/v1/object/public/hrd-documents/ch1-uploads/section1/strategy/agency_1773907252369.pdf', '1. ข้อมูลองค์กร วิสัยทัศน์ ค่านิยม วัฒนธรรมองค์กร พันธกิจ.pdf', 'ch1-uploads/section1/org-structure/agency_1773907258653.pdf', 'https://fgdommhiqhzvsedfzyrr.supabase.co/storage/v1/object/public/hrd-documents/ch1-uploads/section1/org-structure/agency_1773907258653.pdf', '2. โครงสร้างการแบ่งส่วนราชการภายในสำนักงานสภาพัฒนาการเศรษฐกิจและสังคมแห่งชาติ.pdf', NULL, NULL, NULL, 'การพัฒนาผู้นำรุ่นใหม่', 'การลดอัตราการลาออก', 'การพัฒนาศักยภาพด้านดิจิทัล', NULL, NULL, NULL, NULL, NULL, 529, 94, 18, 25, '{e_doc,e_sign}', 10.38, 9.05, 8.03, 10.37, 7.45, false, 'live', NULL, 555, 510, 537, 539, 545, 524, 551, 559, 560, 529, 56, 48, 44, 57, 40, NULL, 'all_staff', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'pending', 0, NULL, '2026-03-19 08:21:15.908642+00', NULL, NULL, 'pending', NULL, NULL, '[]', NULL, NULL, NULL, NULL, 21, 'round_2569', 'submitted', NULL, NULL, NULL, NULL, 'nesdc'),
	('ca651efe-25bb-449a-8250-17c3d9129825', '2026-03-19 03:18:05.469209+00', '2026-03-19 03:18:04.971+00', 'napruet.v@opdc.go.th', 'สำนักงาน กพร.', 'ch1-v4.0', '1.1 วิสัยทัศน์
“พัฒนาระบบราชการตามหลักธรรมาภิบาลให้เกิดผลอย่างเป็นรูปธรรม เพื่อคุณภาพชีวิตที่ดีขึ้นของประชาชนและการพัฒนาประเทศอย่างยั่งยืน”
1.2 พันธกิจและภารกิจ
 		สำนักงานคณะกรรมการพัฒนาระบบราชการ (สำนักงาน ก.พ.ร.) มีภารกิจเกี่ยวกับการศึกษา วิเคราะห์ เสนอแนะนโยบาย และให้คําปรึกษาเกี่ยวกับการพัฒนาระบบราชการแก่คณะรัฐมนตรี ส่วนราชการ และหน่วยงานอื่นของรัฐ ทั้งนี้ เพื่อให้ระบบราชการมีความเข้มแข็ง ทันสมัย และสอดรับกับการบริหารภาครัฐ
แนวใหม่ที่เน้นเรื่องผลสัมฤทธิ์ของงาน โดยมีหน้าที่และอำนาจ ดังต่อไปนี้
1.2.1 รับผิดชอบงานธุรการและงานวิชาการของ ก.พ.ร. คณะกรรมการพัฒนาและส่งเสริมองค์การมหาชน และหน้าที่อื่นตามที่กฎหมายกำหนด หรือตามที่ได้รับมอบหมาย
1.2.2 ศึกษา วิเคราะห์ และเสนอความเห็นเกี่ยวกับการแบ่งส่วนราชการและการกำหนดหน้าที่และอำนาจของส่วนราชการ รวมทั้งตรวจสอบดูแลการปฏิบัติตามกฎหมายว่าด้วยระเบียบบริหารราชการแผ่นดิน
1.2.3. ส่งเสริม สนับสนุน ชี้แจง ทำความเข้าใจ แนะนำ และฝึกอบรมเกี่ยวกับการพัฒนาระบบราชการ
1.2.4. ดำเนินการ ติดตาม และประเมินผลการปฏิบัติตามกฎหมายว่าด้วยระเบียบริหารราชการแผ่นดิน กฎหมายว่าด้วยการปรับปรุงกระทรวง ทบวง กรม กฎหมายว่าด้วยการปฏิบัติราชการ
ทางอิเล็กทรอนิกส์ กฎหมายว่าด้วยการอำนวยความสะดวกในการพิจารณาอนุญาตของทางราชการ และกฎหมายอื่นที่เกี่ยวข้อง เพื่อเสนอต่อ ก.พ.ร.
1.2.5. ขับเคลื่อนการอำนวยความสะดวกในการพิจารณาอนุญาตของทางราชการและการให้บริการแก่ประชาชน
1.2.6. จัดทำรายงานประจำปีเกี่ยวกับการพัฒนาและจัดระบบราชการและงานของรัฐอย่างอื่นเสนอต่อ ก.พ.ร. เพื่อนำเสนอต่อคณะรัฐมนตรี สภาผู้แทนราษฎร และวุฒิสภาต่อไป          
1.2.7. ปฏิบัติการอื่นใดตามที่กฎหมายกำหนดให้เป็นหน้าที่และอำนาจของสำนักงาน หรือตามที่นายกรัฐมนตรีหรือคณะรัฐมนตรีมอบหมาย
 
1.3	ค่านิยม
	คิดริเริ่มและเรียนรู้ 
	มองไปข้างหน้าและสามารถปรับตัวทันต่อการเปลี่ยนแปลง
	ทำงานแบบเครือข่าย
	มีขีดสมรรถนะสูง
	ยึดมั่นในสิ่งที่ถูกต้องและชอบธรรม
1.4 อำนาจหน้าที่ตามกฎหมาย/ระเบียบ
  	การปฏิรูประบบราชการเมื่อปี พ.ศ. 2545 ส่งผลให้มีการปรับเปลี่ยนกระบวนการบริหารงานและการปรับปรุงโครงสร้างส่วนราชการในทุกกระทรวง ทบวง กรม ครั้งใหญ่ ซึ่งเป็นผลมาจากพระราชบัญญัติระเบียบบริหารราชการแผ่นดิน (ฉบับที่ 5) พ.ศ. 2545 และ พระราชบัญญัติปรับปรุงกระทรวง ทบวง กรม 
พ.ศ. 2545 ที่มีผลบังคับใช้เมื่อวันที่ 3 ตุลาคม พ.ศ.2545 โดยมาตรา 3/1 แห่งพระราชบัญญัติระเบียบบริหารราชการแผ่นดิน (ฉบับที่ 5) พ.ศ. 2545 ได้มุ่งเน้นให้การบริหารราชการแผ่นดินต้องเป็นไปเพื่อประโยชน์สุขของประชาชนและเกิดผลสัมฤทธิ์ต่อภารกิจของรัฐ และกำหนดให้มีคณะกรรมการพัฒนาระบบราชการ (ก.พ.ร.) เป็นกลไกขับเคลื่อนให้เกิดผลสัมฤทธิ์ดังกล่าว โดยมีสำนักงานคณะกรรมการพัฒนาระบบราชการ 
(สำนักงาน ก.พ.ร.) เป็นหน่วยงานหลักในการพัฒนาระบบราชการ ทำหน้าที่สนับสนุนการทำงานของคณะกรรมการพัฒนาระบบราชการ ในการเสนอแนะและให้คำปรึกษาแก่คณะรัฐมนตรีเกี่ยวกับการพัฒนาระบบราชการและงานของรัฐอย่างอื่นซึ่งรวมถึงโครงสร้างระบบราชการ ระบบงบประมาณ ระบบบุคลากร มาตรฐานทางคุณธรรมและจริยธรรม ค่าตอบแทน และวิธีปฏิบัติราชการอื่น ให้เป็นไปตามเจตนารมณ์ของพระราชบัญญัติระเบียบบริหารราชการแผ่นดิน (ฉบับที่ 5) พ.ศ. 2545 และพระราชกฤษฎีกาว่าด้วยหลักเกณฑ์และวิธีการบริหารกิจการบ้านเมืองที่ดี พ.ศ. 2546', 'สำนักงานคณะกรรมการพัฒนาระบบราชการ (สำนักงาน ก.พ.ร.) มีเลขาธิการ ก.พ.ร. 
เป็นผู้บังคับบัญชาสูงสุดของส่วนราชการ โดยมีคณะผู้บริหารประกอบด้วย รองเลขาธิการ ก.พ.ร. 
ผู้ช่วยเลขาธิการ ก.พ.ร. ที่ปรึกษาการพัฒนาระบบราชการ และผู้เชี่ยวชาญเฉพาะด้านการพัฒนาระบบราชการ ทำหน้าที่สนับสนุนการบริหารราชการและขับเคลื่อนภารกิจของสำนักงานให้บรรลุผลสัมฤทธิ์ตามนโยบายและยุทธศาสตร์ที่กำหนดในการดำเนินงานตามพันธกิจ โดยมีหน่วยงานภายในรวม 10 กอง และ 3 กลุ่มงาน ได้แก่
1.	สำนักงานเลขาธิการ
2.	กองกฎหมายและระเบียบราชการ
3.	กองกิจการองค์การมหาชนและหน่วยงานของรัฐรูปแบบอื่น
4.	กองขับเคลื่อนรัฐบาลดิจิทัล
5.	กองติดตาม ตรวจสอบ และประเมินผลการพัฒนาระบบราชการ
6.	กองนวัตกรรมบริการภาครัฐ
7.	กองพัฒนาระบบบริหารงานส่วนภูมิภาคและส่วนท้องถิ่น
8.	กองพัฒนาระบบราชการ
9.	กองยุทธศาสตร์การพัฒนาระบบราชการ
10.	กองส่งเสริมอำนวยความสะดวกบริการภาครัฐ

รวมทั้งหน่วยงานในลักษณะกลุ่มงาน ได้แก่
1.	กลุ่มตรวจสอบภายใน
2.	กลุ่มพัฒนาระบบบริหาร
3.	ศูนย์ปฏิบัติการต่อต้านการทุจริต
		นอกจากนี้ ยังมีสถาบันส่งเสริมการบริหารกิจการบ้านเมืองที่ดี ทำหน้าที่สนับสนุนการพัฒนาองค์ความเสริมสร้างสมรรถนะ และยกระดับมาตรฐานการบริหารจัดการภาครัฐให้สอดคล้องกับหลักธรรมาภิบาลและการพัฒนาระบบราชการสมัยใหม่อย่างยั่งยืน', 217, 32, 72, 79, 34, 27, 33, 50, 20, 49, 19, 11, 8, 8, 16, 1, 0, 57, 39, 65, 15, 0, 0, 10, 1, 5, NULL, NULL, NULL, NULL, '1. นโยบาย WFH
2. นโยบาย Flexible-Time
3. สวัสดิการห้อง fitness สำหรับการออกกำลังกาย
4. กิจกรรม CSR
5. กิจกรรม Townhall แลกเปลี่ยนความคิดเห็นระหว่างผู้บริหารและบุคลากร
6. สวัสดิการรถรับส่งบุคลากรไปปฏิบัติงานนอกสถานที่
7. กิจกรรมงานวิ่งประจำปี
8. การตรวจสุขภาพประจำปี
9. กิจกรรมส่งเสริมการลดไขมันภายในหน่วยงาน', 'ข้อมูลบริบทและความท้าทาย
	1. นโยบายระดับชาติที่เกี่ยวข้อง	
1.1 ยุทธศาสตร์ชาติด้านการปรับสมดุลและพัฒนาระบบการบริหารจัดการภาครัฐ
1.2 แผนแม่บทภายใต้ยุทธศาสตร์ชาติ ประเด็นที่ 20 การบริการประชาชนและประสิทธิภาพภาครัฐ
1.3 แผนพัฒนาเศรษฐกิจและสังคมแห่งชาติฉบับที่ 13 หมุดหมายที่ 13 ไทยมีภาครัฐ
ที่ทันสมัย มีประสิทธิภาพ และตอบโจทย์ประชาชน
	2. ประเด็นมุ่งเน้นเพื่อรองรับความท้าทายในโลกยุค VUCA
		2.1 ยกระดับบริการภาครัฐโดยยึดผู้รับบริการเป็นศูนย์กลาง โดยมีเป้าหมายเพื่อให้ประชาชนได้รับบริการที่สะดวก ประหยัด ตอบโจทย์ มีทางเลือกในการรับบริการที่หลากหลาย ทั่วถึง ครอบคลุมความต้องการของประชาชนทุกกลุ่ม
		2.2 ลดบทบาทภาครัฐและเปิดการมีส่วนร่วมกับภาคส่วนอื่น โดยมีเป้าหมายเพื่อให้ภาครัฐ
มีขนาดที่เหมาะสมกับบทบาท ภารกิจ ลดบทบาทภาครัฐส่วนกลาง กระจายอำนาจการบริหารในระดับพื้นที่ และเชื่อมต่อการทำงานร่วมกับภาคส่วนอื่น
		2.3 ขับเคลื่อนผลิตภาพภาครัฐด้วยนวัตกรรมและดิจิทัล โดยมีเป้าหมายเพื่อให้ภาครัฐ
มีความทันสมัย สามารถใช้นวัตกรรม และเทคโนโลยีดิจิทัลในการพัฒนาการทำงาน และการให้บริการประชาชนได้อย่างมีประสิทธิภาพ
		3. ผู้มีส่วนได้ส่วนเสียสำคัญ
		3.1 ผู้กำหนดนโยบายระดับชาติ
        3.2 หน่วยงานภาครัฐส่วนกลางและส่วนภูมิภาคและส่วนท้องถิ่น
		3.3 ภาคเอกชนและผู้ประกอบการ
		3.4 หน่วยงานด้านดิจิทัลและข้อมูลภาครัฐ
		3.5 ภาคประชาชนและภาคประชาสังคม', 0, 0, 0, 0, 0, 0, 0, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'สุขภาพและความเป็นอยู่', NULL, 'full', 'full', 'full', 'full', NULL, 'in_progress', NULL, NULL, NULL, 'การพัฒนาด้านสุ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ch1-uploads/section1/hrd-plan/agency_1773889836519.pdf', 'https://fgdommhiqhzvsedfzyrr.supabase.co/storage/v1/object/public/hrd-documents/ch1-uploads/section1/hrd-plan/agency_1773889836519.pdf', 'รายงานผลการบริหารและพัฒนาทรัพยากรบุคคล-ปี-2567.pdf', 'การพัฒนาด้านสุขภาพและความเป็นอยู่', 'การพัฒนาศักยภาพด้านดิจิทัล', 'การลดอัตราการลาป่วย', NULL, NULL, NULL, NULL, NULL, 217, 0, 0, 0, '{e_doc,e_sign,cloud,hr_digital}', NULL, NULL, NULL, NULL, NULL, false, 'live', NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'official_only', 'official_only', NULL, 'official_only', NULL, NULL, NULL, 73.89, NULL, 'pending', 0, NULL, '2026-03-19 03:18:05.469209+00', NULL, NULL, 'pending', NULL, NULL, '[]', NULL, NULL, NULL, NULL, NULL, 'round_2569', 'submitted', NULL, NULL, NULL, NULL, 'opdc');


--
-- Data for Name: survey_forms; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."survey_forms" ("id", "form_key", "form_name", "form_url_path", "description", "is_active", "created_at", "allow_label_edit_by_admin", "allow_structure_edit_by_admin") VALUES
	('f281e40b-9801-4924-b993-b13cab605607', 'wellbeing', 'Wellbeing Survey', '/', 'แบบสำรวจรายบุคคล', true, '2026-03-03 17:40:28.864018+00', true, false),
	('f0ed6c59-3e2d-4ae9-9ff3-a92d978b2a90', 'ch1', 'บทที่ 1', '/ch1', 'แบบสำรวจข้อมูลเพื่อจัดทำแผนการพัฒนาองค์กรสุขภาวะข้าราชการพลเรือน', true, '2026-03-03 17:48:09.497685+00', true, false);


--
-- Data for Name: org_form_links; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."org_form_links" ("id", "org_id", "form_id", "full_url", "is_active", "created_at") VALUES
	('faa6e507-929c-4d7e-93bf-2d7e3094e2ce', 'd46edda4-d874-4ff3-ac10-5f1a8ce241ae', 'f281e40b-9801-4924-b993-b13cab605607', 'https://nidawellbeing.vercel.app/?org=test-org', true, '2026-03-17 15:55:58.611672+00'),
	('a4ecd56b-f605-4f4d-8996-3688054ad491', 'd46edda4-d874-4ff3-ac10-5f1a8ce241ae', 'f0ed6c59-3e2d-4ae9-9ff3-a92d978b2a90', 'https://nidawellbeing.vercel.app/ch1?org=test-org', true, '2026-03-17 22:28:11.924705+00');


--
-- Data for Name: survey_responses; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."survey_responses" ("id", "email", "timestamp", "name", "title", "gender", "age", "height", "weight", "waist", "bmi", "bmi_category", "tmhi_score", "tmhi_level", "raw_responses", "is_draft", "submitted_at", "org_type", "organization", "job", "job_duration", "org_code", "activity_org", "activity_thaihealth", "diseases", "q2001", "q2002", "q2003", "q2004", "q2005_drug", "sweet_1", "sweet_2", "sweet_3", "sweet_4", "sweet_5", "fat_1", "fat_2", "fat_3", "fat_4", "fat_5", "salt_1", "salt_2", "salt_3", "salt_4", "salt_5", "act_work_days", "act_work_dur", "act_commute_days", "act_commute_dur", "act_rec_days", "act_rec_dur", "sedentary_dur", "screen_entertain", "screen_work", "tmhi_1", "tmhi_2", "tmhi_3", "tmhi_4", "tmhi_5", "tmhi_6", "tmhi_7", "tmhi_8", "tmhi_9", "tmhi_10", "tmhi_11", "tmhi_12", "tmhi_13", "tmhi_14", "tmhi_15", "lonely_1", "lonely_2", "lonely_3", "lonely_4", "lonely_5", "lonely_6", "lonely_7", "lonely_8", "lonely_9", "lonely_10", "lonely_11", "lonely_12", "lonely_13", "lonely_14", "lonely_15", "lonely_16", "lonely_17", "lonely_18", "lonely_19", "lonely_20", "ucla_score", "helmet_driver", "helmet_passenger", "seatbelt_driver", "seatbelt_passenger", "accident_hist", "drunk_drive", "env_satisfaction", "env_glare", "env_noise", "env_smell", "env_smoke", "env_posture", "env_awkward", "pm25_impact", "pm25_symptom", "life_quality", "emerging_known", "emerging_list", "climate_impact", "covid_history") VALUES
	('d2514ef8-e9ff-46ab-889e-8237bc090528', 'cowork.test.1774253379925@wellbeing.test', '2026-03-23 08:09:40.260676+00', 'ทดสอบ Cowork Fix', 'นักวิชาการ', 'female', 30, 162, 55, 72, 20.9, 'ปกติ', 48, 'ปกติ', '{"name": "ทดสอบ Cowork Fix", "test": true, "timestamp": 1774253379925}', false, '2026-03-23 08:09:39.925+00', 'หน่วยงานหลัก', 'สำนักงานสภาพัฒนาการเศรษฐกิจและสังคมแห่งชาติ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	('897c1182-665f-4d99-a2e8-2e2d13b3c31b', 'hrdplan.wellbeing@gmail.com', '2026-03-23 12:36:05.45759+00', 'นายทดสอบ ระบบ', 'นาย', 'ชาย', 55, 175, 75, 36, 24.5, 'น้ำหนักปกติ', 40, 'ต่ำกว่าเกณฑ์เฉลี่ย (ควรดูแลใจ)', '{"age": "55", "bmi": "24.5", "job": "หัวหน้า", "name": "นายทดสอบ ระบบ", "fat_1": "3-4 ครั้งต่อสัปดาห์", "fat_2": "3-4 ครั้งต่อสัปดาห์", "fat_3": "3-4 ครั้งต่อสัปดาห์", "fat_4": "3-4 ครั้งต่อสัปดาห์", "fat_5": "3-4 ครั้งต่อสัปดาห์", "q2001": "สูบ 2 – 3 ครั้งต่อสัปดาห์", "q2002": "สูบ 2 – 3 ครั้งต่อสัปดาห์", "q2003": "ดื่ม 2 – 3 ครั้งต่อสัปดาห์", "q2004": "ดื่ม 2 – 3 ครั้งต่อสัปดาห์", "title": "นาย", "waist": "36", "gender": "ชาย", "height": "175", "salt_1": "3-4 ครั้งต่อสัปดาห์", "salt_2": "3-4 ครั้งต่อสัปดาห์", "salt_3": "3-4 ครั้งต่อสัปดาห์", "salt_4": "3-4 ครั้งต่อสัปดาห์", "salt_5": "3-4 ครั้งต่อสัปดาห์", "tmhi_1": "2", "tmhi_2": "2", "tmhi_3": "2", "tmhi_4": "3", "tmhi_5": "2", "tmhi_6": "3", "tmhi_7": "3", "tmhi_8": "3", "tmhi_9": "3", "weight": "75", "sweet_1": "3-4 ครั้งต่อสัปดาห์", "sweet_2": "3-4 ครั้งต่อสัปดาห์", "sweet_3": "3-4 ครั้งต่อสัปดาห์", "sweet_4": "3-4 ครั้งต่อสัปดาห์", "sweet_5": "3-4 ครั้งต่อสัปดาห์", "tmhi_10": "3", "tmhi_11": "3", "tmhi_12": "3", "tmhi_13": "3", "tmhi_14": "3", "tmhi_15": "3", "diseases": ["มะเร็ง", "โรคตับ", "โรคไต", "โรคหัวใจและหลอดเลือด", "ความดันโลหิตสูง", "เบาหวาน"], "lonely_1": "3", "lonely_2": "2", "lonely_3": "2", "lonely_4": "1", "lonely_5": "0", "lonely_6": "0", "lonely_7": "1", "lonely_8": "2", "lonely_9": "3", "org_type": "ปฏิบัติการ", "env_glare": "ใช่ (ไม่มีผล)", "env_noise": "ไม่ใช่", "env_smell": "ใช่ (มีผลต่อสุขภาพ)", "env_smoke": "ใช่ (มีผลต่อสุขภาพ)", "lonely_10": "2", "lonely_11": "1", "lonely_12": "2", "lonely_13": "1", "lonely_14": "3", "lonely_15": "1", "lonely_16": "3", "lonely_17": "2", "lonely_18": "1", "lonely_19": "0", "lonely_20": "1", "q2005_drug": "เสพ 2 – 3 ครั้งต่อสัปดาห์", "tmhi_level": "ต่ำกว่าเกณฑ์เฉลี่ย (ควรดูแลใจ)", "tmhi_score": 40, "act_rec_dur": "04:00", "drunk_drive": "เคย > 3 ครั้ง/เดือน", "env_awkward": "ไม่ใช่", "env_posture": "ใช่ (ไม่มีผล)", "pm25_impact": "มาก", "screen_work": "06:00", "act_rec_days": "5", "act_work_dur": "02:00", "activity_org": "ไม่เคย", "bmi_category": "น้ำหนักปกติ", "job_duration": "30", "life_quality": "3", "pm25_symptom": ["ไม่มี"], "accident_hist": ["คนขับรถยนต์"], "act_work_days": "5", "covid_history": "1 ครั้ง", "emerging_list": ["COVID-19", "ไข้ซิกา", "ไข้หวัดนก"], "helmet_driver": "ใช้บางครั้ง", "sedentary_dur": "09:00", "climate_impact": "ปานกลาง", "emerging_known": "ไม่เคย", "act_commute_dur": "04:00", "seatbelt_driver": "ไม่เคยขับ", "act_commute_days": "5", "env_satisfaction": "3", "helmet_passenger": "ไม่เคยนั่งซ้อนท้าย", "screen_entertain": "08:00", "seatbelt_passenger": "ใช้ทุกครั้ง", "activity_thaihealth": "ไม่เคย"}', false, '2026-03-23 12:36:05.437+00', 'ปฏิบัติการ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);


--
-- Name: admin_audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."admin_audit_logs_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

-- \unrestrict YqdP75OIzmP7DFmQPRDzZ8QS1xeoD0CA96qSUCbAvpK4lfvwmY8b2wDwp7RFSQI

RESET ALL;
