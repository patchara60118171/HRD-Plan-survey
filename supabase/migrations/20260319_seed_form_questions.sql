-- ================================================================
-- Migration: Seed form_sections + form_questions
-- Converts questions.js (wellbeing) + hrd-ch1-fields.js (ch1) to DB
-- Date: 2026-03-19
-- ================================================================

-- ----------------------------------------------------------------
-- WELLBEING FORM — sections
-- ----------------------------------------------------------------
INSERT INTO public.form_sections (form_code, section_key, section_order, title_th, description) VALUES
  ('wellbeing','personal',  1,'ส่วนที่ 1 ข้อมูลส่วนบุคคล และการตรวจวัดร่างกาย','ข้อมูลทั่วไปและสุขภาพเบื้องต้น'),
  ('wellbeing','consumption',2,'การบริโภคยาสูบและแอลกอฮอล์','พฤติกรรมเสี่ยงด้านสุขภาพ'),
  ('wellbeing','nutrition',  3,'พฤติกรรมการบริโภค','ประเมินการกิน หวาน มัน เค็ม'),
  ('wellbeing','activity',   4,'กิจกรรมทางกาย (TPAX)','การเคลื่อนไหวร่างกายในชีวิตประจำวัน'),
  ('wellbeing','mental',     5,'สุขภาพจิต (TMHI-15)','วัดสุขภาพจิตคนไทยฉบับสั้น'),
  ('wellbeing','loneliness', 6,'แบบสำรวจความเหงา (UCLA Loneliness Scale)','การมีปฏิสัมพันธ์กับผู้อื่นในที่ทำงาน'),
  ('wellbeing','safety',     7,'อุบัติเหตุและความปลอดภัย','พฤติกรรมความปลอดภัย'),
  ('wellbeing','environment',8,'สิ่งแวดล้อมและโรคอุบัติใหม่','สภาพแวดล้อมและผลกระทบ')
ON CONFLICT (form_code, section_key) DO NOTHING;

-- ----------------------------------------------------------------
-- WELLBEING FORM — questions: personal
-- ----------------------------------------------------------------
INSERT INTO public.form_questions (form_code, section_key, question_key, question_order, label_th, input_type, options_json, is_required) VALUES
  ('wellbeing','personal','title',      1,'คำนำหน้า',       'radio',    '["นาย","นาง","นางสาว","อื่นๆ"]', true),
  ('wellbeing','personal','name',       2,'ชื่อ-สกุล',       'text',     NULL, true),
  ('wellbeing','personal','gender',     3,'เพศ',             'radio',    '["ชาย","หญิง","LGBTQ+"]', true),
  ('wellbeing','personal','age',        4,'อายุ (ปี)',        'number',   NULL, true),
  ('wellbeing','personal','org_type',   5,'ประเภทหน่วยงาน', 'radio',    '["นโยบาย","ปฏิบัติการ","สนับสนุน"]', true),
  ('wellbeing','personal','job',        6,'ตำแหน่งงานปัจจุบัน','radio',  '[{"label":"ปฏิบัติการ","value":"ปฏิบัติการ"},{"label":"ปฏิบัติงาน","value":"ปฏิบัติงาน"},{"label":"ชำนาญการ","value":"ชำนาญการ"},{"label":"ชำนาญงาน","value":"ชำนาญงาน"},{"label":"ชำนาญการพิเศษ","value":"ชำนาญการพิเศษ"},{"label":"หัวหน้า","value":"หัวหน้า"},{"label":"ผู้บริหารระดับกลาง","value":"ผู้บริหารระดับกลาง"},{"label":"อื่นๆ","value":"other","hasInput":true}]', true),
  ('wellbeing','personal','job_duration',7,'ระยะเวลาที่ทำงานในตำแหน่งปัจจุบัน (ปี)','number',NULL, true),
  ('wellbeing','personal','activity_org',8,'ท่านเคยเข้ารับกิจกรรมส่งเสริมสุขภาพของพนักงานในองค์กรหรือไม่','radio','["เคย","ไม่เคย"]', true),
  ('wellbeing','personal','activity_thaihealth',9,'ท่านเคยเข้ารับกิจกรรมส่งเสริมสุขภาพจาก สสส. หรือไม่','radio','["เคย","ไม่เคย"]', true),
  ('wellbeing','personal','diseases',  10,'ท่านมีปัญหาสุขภาพเหล่านี้หรือไม่','checkbox','["เบาหวาน","ความดันโลหิตสูง","โรคหัวใจและหลอดเลือด","โรคไต","โรคตับ","มะเร็ง","ไม่มี"]', true),
  ('wellbeing','personal','height',    11,'ส่วนสูง (เซนติเมตร)','number',  NULL, true),
  ('wellbeing','personal','weight',    12,'น้ำหนัก (กิโลกรัม)','number',   NULL, true),
  ('wellbeing','personal','waist',     13,'เส้นรอบเอว (เซนติเมตร)','number',NULL, true)
ON CONFLICT (form_code, question_key) DO NOTHING;

-- consumption
INSERT INTO public.form_questions (form_code, section_key, question_key, question_order, label_th, input_type, options_json, is_required) VALUES
  ('wellbeing','consumption','q2001',1,'ท่านเคยสูบบุหรี่หรือไม่','radio','["ไม่เคยสูบ","สูบเป็นประจำทุกวัน","สูบ 2 – 3 ครั้งต่อสัปดาห์","สูบบางโอกาส/นานๆสูบที"]',true),
  ('wellbeing','consumption','q2002',2,'ท่านเคยสูบบุหรี่ไฟฟ้าหรือไม่','radio','["ไม่เคยสูบ","สูบเป็นประจำทุกวัน","สูบ 2 – 3 ครั้งต่อสัปดาห์","สูบบางโอกาส/นานๆสูบที"]',true),
  ('wellbeing','consumption','q2003',3,'ท่านเคยดื่มสุราหรือเครื่องดื่มผสมแอลกอฮอล์หรือไม่','radio','["ไม่เคยดื่ม","ดื่มเป็นประจำทุกวัน","ดื่ม 2 – 3 ครั้งต่อสัปดาห์","ดื่มบางโอกาส/นานๆดื่มที"]',true),
  ('wellbeing','consumption','q2004',4,'ท่านเคยดื่มเครื่องดื่มที่มีส่วนผสมของกัญชาหรือไม่','radio','["ไม่เคยดื่ม","ดื่มเป็นประจำทุกวัน","ดื่ม 2 – 3 ครั้งต่อสัปดาห์","ดื่มบางโอกาส/นานๆดื่มที"]',true),
  ('wellbeing','consumption','q2005_drug',5,'ท่านเคยใช้สารเสพติดอื่นๆ เช่น ยาบ้า กัญชา หรือไม่','radio','["ไม่เคยเสพ","เสพเป็นประจำทุกวัน","เสพ 2 – 3 ครั้งต่อสัปดาห์","เสพบางโอกาส/นานๆเสพที"]',true)
ON CONFLICT (form_code, question_key) DO NOTHING;

-- nutrition — sweet/fat/salt
INSERT INTO public.form_questions (form_code, section_key, question_key, question_order, label_th, input_type, options_json, is_required, help_text) VALUES
  ('wellbeing','nutrition','sweet_1',1,'ดื่มน้ำเปล่า / กาแฟดำ / ชาไม่ใส่น้ำตาล / โซดา','radio','["ทุกวัน / เกือบทุกวัน","3-4 ครั้งต่อสัปดาห์","แทบไม่ทำ / ไม่ทำเลย"]',true,'รสหวาน'),
  ('wellbeing','nutrition','sweet_2',2,'ดื่มน้ำอัดลม / กาแฟ 3 in 1 / กาแฟเย็น / เครื่องดื่มชง / น้ำหวาน / นมเปรี้ยว','radio','["ทุกวัน / เกือบทุกวัน","3-4 ครั้งต่อสัปดาห์","แทบไม่ทำ / ไม่ทำเลย"]',true,'รสหวาน'),
  ('wellbeing','nutrition','sweet_3',3,'ดื่มน้ำผัก / ผลไม้สำเร็จรูป','radio','["ทุกวัน / เกือบทุกวัน","3-4 ครั้งต่อสัปดาห์","แทบไม่ทำ / ไม่ทำเลย"]',true,'รสหวาน'),
  ('wellbeing','nutrition','sweet_4',4,'กินไอศกรีม / เบเกอรี่ หรือขนมหวานไทย','radio','["ทุกวัน / เกือบทุกวัน","3-4 ครั้งต่อสัปดาห์","แทบไม่ทำ / ไม่ทำเลย"]',true,'รสหวาน'),
  ('wellbeing','nutrition','sweet_5',5,'เติมน้ำตาล / น้ำผึ้ง / น้ำเชื่อมลงในอาหาร','radio','["ทุกวัน / เกือบทุกวัน","3-4 ครั้งต่อสัปดาห์","แทบไม่ทำ / ไม่ทำเลย"]',true,'รสหวาน'),
  ('wellbeing','nutrition','fat_1',  6,'เลือกกินเนื้อสัตว์ติดมัน ติดหนัง มีไขมันแทรก','radio','["ทุกวัน / เกือบทุกวัน","3-4 ครั้งต่อสัปดาห์","แทบไม่ทำ / ไม่ทำเลย"]',true,'ไขมัน'),
  ('wellbeing','nutrition','fat_2',  7,'กินอาหารทอด อาหารฟาสต์ฟู้ด อาหารผัดน้ำมัน','radio','["ทุกวัน / เกือบทุกวัน","3-4 ครั้งต่อสัปดาห์","แทบไม่ทำ / ไม่ทำเลย"]',true,'ไขมัน'),
  ('wellbeing','nutrition','fat_3',  8,'กินอาหารจานเดียว ไขมันสูง หรืออาหารประเภทแกงกะทิ','radio','["ทุกวัน / เกือบทุกวัน","3-4 ครั้งต่อสัปดาห์","แทบไม่ทำ / ไม่ทำเลย"]',true,'ไขมัน'),
  ('wellbeing','nutrition','fat_4',  9,'ดื่มเครื่องดื่มชงผสมนมข้นหวาน ครีมเทียม วิปปิ้งครีม','radio','["ทุกวัน / เกือบทุกวัน","3-4 ครั้งต่อสัปดาห์","แทบไม่ทำ / ไม่ทำเลย"]',true,'ไขมัน'),
  ('wellbeing','nutrition','fat_5', 10,'ซดน้ำผัด น้ำแกง หรือราดน้ำผัดน้ำแกงลงในข้าว','radio','["ทุกวัน / เกือบทุกวัน","3-4 ครั้งต่อสัปดาห์","แทบไม่ทำ / ไม่ทำเลย"]',true,'ไขมัน'),
  ('wellbeing','nutrition','salt_1',11,'ชิมอาหารก่อนปรุง / น้ำปลา ซีอิ๊ว ซอส ปรุงน้อย หรือไม่ปรุงเพิ่ม','radio','["ทุกวัน / เกือบทุกวัน","3-4 ครั้งต่อสัปดาห์","แทบไม่ทำ / ไม่ทำเลย"]',true,'โซเดียม (เค็ม)'),
  ('wellbeing','nutrition','salt_2',12,'ใช้สมุนไพร หรือเครื่องเทศเป็นส่วนประกอบอาหาร แทนเครื่องปรุง','radio','["ทุกวัน / เกือบทุกวัน","3-4 ครั้งต่อสัปดาห์","แทบไม่ทำ / ไม่ทำเลย"]',true,'โซเดียม (เค็ม)'),
  ('wellbeing','nutrition','salt_3',13,'กินเนื้อสัตว์แปรรูป ไส้กรอก หมูยอ แฮม ปลาเค็ม กุ้งแห้ง ปลาร้า','radio','["ทุกวัน / เกือบทุกวัน","3-4 ครั้งต่อสัปดาห์","แทบไม่ทำ / ไม่ทำเลย"]',true,'โซเดียม (เค็ม)'),
  ('wellbeing','nutrition','salt_4',14,'กินบะหมี่ โจ๊กกึ่งสำเร็จรูป หรืออาหารกล่องแช่แข็ง','radio','["ทุกวัน / เกือบทุกวัน","3-4 ครั้งต่อสัปดาห์","แทบไม่ทำ / ไม่ทำเลย"]',true,'โซเดียม (เค็ม)'),
  ('wellbeing','nutrition','salt_5',15,'กินผักผลไม้ดอง หรือผลไม้แช่อิ่ม จิ้มพริกเกลือ น้ำปลาหวาน','radio','["ทุกวัน / เกือบทุกวัน","3-4 ครั้งต่อสัปดาห์","แทบไม่ทำ / ไม่ทำเลย"]',true,'โซเดียม (เค็ม)')
ON CONFLICT (form_code, question_key) DO NOTHING;

-- activity (TPAX)
INSERT INTO public.form_questions (form_code, section_key, question_key, question_order, label_th, input_type, is_required, help_text) VALUES
  ('wellbeing','activity','act_work_days',   1,'กิจกรรมทางกายขณะทำงาน (วัน/สัปดาห์)',          'number',true,'การทำงาน'),
  ('wellbeing','activity','act_work_dur',    2,'ระยะเวลาเฉลี่ยต่อวัน (นาที)',                     'number',true,'การทำงาน'),
  ('wellbeing','activity','act_commute_days',3,'เดินทางด้วยเท้า/จักรยาน (วัน/สัปดาห์)',          'number',true,'การเดินทาง'),
  ('wellbeing','activity','act_commute_dur', 4,'ระยะเวลาเฉลี่ยต่อวัน (นาที)',                     'number',true,'การเดินทาง'),
  ('wellbeing','activity','act_rec_days',    5,'ออกกำลังกาย/นันทนาการ (วัน/สัปดาห์)',            'number',true,'นันทนาการ/ออกกำลังกาย'),
  ('wellbeing','activity','act_rec_dur',     6,'ระยะเวลาเฉลี่ยต่อวัน (นาที)',                     'number',true,'นันทนาการ/ออกกำลังกาย'),
  ('wellbeing','activity','sedentary_dur',   7,'เวลานั่ง/เอนกาย (ไม่รวมนอนหลับ) ต่อวัน (ชม.)',   'number',true,'พฤติกรรมเนือยนิ่ง/หน้าจอ'),
  ('wellbeing','activity','screen_entertain',8,'เวลาหน้าจอเพื่อความบันเทิงต่อวัน (ชม.)',           'number',true,'พฤติกรรมเนือยนิ่ง/หน้าจอ'),
  ('wellbeing','activity','screen_work',     9,'เวลาหน้าจอเพื่อการทำงานต่อวัน (ชม.)',              'number',true,'พฤติกรรมเนือยนิ่ง/หน้าจอ')
ON CONFLICT (form_code, question_key) DO NOTHING;

-- mental (TMHI-15)
INSERT INTO public.form_questions (form_code, section_key, question_key, question_order, label_th, input_type, options_json, is_required) VALUES
  ('wellbeing','mental','tmhi_1', 1,'ท่านรู้สึกพึงพอใจในชีวิต',              'radio','["ไม่เลย","เล็กน้อย","มาก","มากที่สุด"]',true),
  ('wellbeing','mental','tmhi_2', 2,'ท่านรู้สึกสบายใจ',                      'radio','["ไม่เลย","เล็กน้อย","มาก","มากที่สุด"]',true),
  ('wellbeing','mental','tmhi_3', 3,'ท่านรู้สึกภูมิใจในตนเอง',              'radio','["ไม่เลย","เล็กน้อย","มาก","มากที่สุด"]',true),
  ('wellbeing','mental','tmhi_4', 4,'ท่านรู้สึกเบื่อหน่ายท้อแท้กับการดำเนินชีวิตประจำวัน','radio','["ไม่เลย","เล็กน้อย","มาก","มากที่สุด"]',true),
  ('wellbeing','mental','tmhi_5', 5,'ท่านรู้สึกผิดหวังในตนเอง',             'radio','["ไม่เลย","เล็กน้อย","มาก","มากที่สุด"]',true),
  ('wellbeing','mental','tmhi_6', 6,'ท่านรู้สึกว่าชีวิตมีแต่ความทุกข์',     'radio','["ไม่เลย","เล็กน้อย","มาก","มากที่สุด"]',true),
  ('wellbeing','mental','tmhi_7', 7,'ท่านสามารถทำใจยอมรับได้สำหรับปัญหาที่ยากจะแก้ไข','radio','["ไม่เลย","เล็กน้อย","มาก","มากที่สุด"]',true),
  ('wellbeing','mental','tmhi_8', 8,'ท่านมั่นใจว่าจะสามารถควบคุมอารมณ์ได้เมื่อมีเหตุการณ์คับขัน','radio','["ไม่เลย","เล็กน้อย","มาก","มากที่สุด"]',true),
  ('wellbeing','mental','tmhi_9', 9,'ท่านมั่นใจที่จะเผชิญกับเหตุการณ์ร้ายแรงที่เกิดขึ้นในชีวิต','radio','["ไม่เลย","เล็กน้อย","มาก","มากที่สุด"]',true),
  ('wellbeing','mental','tmhi_10',10,'ท่านรู้สึกเห็นอกเห็นใจเมื่อผู้อื่นมีความทุกข์','radio','["ไม่เลย","เล็กน้อย","มาก","มากที่สุด"]',true),
  ('wellbeing','mental','tmhi_11',11,'ท่านรู้สึกเป็นสุขในการช่วยเหลือผู้อื่นที่มีปัญหา','radio','["ไม่เลย","เล็กน้อย","มาก","มากที่สุด"]',true),
  ('wellbeing','mental','tmhi_12',12,'ท่านให้ความช่วยเหลือแก่ผู้อื่นเมื่อมีโอกาส','radio','["ไม่เลย","เล็กน้อย","มาก","มากที่สุด"]',true),
  ('wellbeing','mental','tmhi_13',13,'ท่านรู้สึกมั่นคงปลอดภัยเมื่ออยู่ในครอบครัว','radio','["ไม่เลย","เล็กน้อย","มาก","มากที่สุด"]',true),
  ('wellbeing','mental','tmhi_14',14,'หากท่านป่วยหนัก ท่านเชื่อว่าคนในครอบครัวจะดูแลท่านเป็นอย่างดี','radio','["ไม่เลย","เล็กน้อย","มาก","มากที่สุด"]',true),
  ('wellbeing','mental','tmhi_15',15,'สมาชิกในครอบครัวมีความรักและผูกพันต่อกัน','radio','["ไม่เลย","เล็กน้อย","มาก","มากที่สุด"]',true)
ON CONFLICT (form_code, question_key) DO NOTHING;

-- loneliness (UCLA 20-item)
INSERT INTO public.form_questions (form_code, section_key, question_key, question_order, label_th, input_type, options_json, is_required) VALUES
  ('wellbeing','loneliness','lonely_1', 1,'ฉันไม่มีความสุขที่ต้องทำหลายสิ่งหลายอย่างคนเดียว','radio','["0","1","2","3"]',true),
  ('wellbeing','loneliness','lonely_2', 2,'ฉันไม่มีใครคุยด้วย','radio','["0","1","2","3"]',true),
  ('wellbeing','loneliness','lonely_3', 3,'ฉันทนไม่ได้ที่จะอยู่คนเดียวอย่างนี้','radio','["0","1","2","3"]',true),
  ('wellbeing','loneliness','lonely_4', 4,'ฉันขาดมิตรภาพ','radio','["0","1","2","3"]',true),
  ('wellbeing','loneliness','lonely_5', 5,'ฉันรู้สึกราวกับว่าไม่มีใครเข้าใจฉันจริงๆ','radio','["0","1","2","3"]',true),
  ('wellbeing','loneliness','lonely_6', 6,'ฉันพบว่าตัวเองรอคนโทรหา','radio','["0","1","2","3"]',true),
  ('wellbeing','loneliness','lonely_7', 7,'ฉันไม่มีใครให้พึ่ง','radio','["0","1","2","3"]',true),
  ('wellbeing','loneliness','lonely_8', 8,'ฉันไม่สนิทกับใคร','radio','["0","1","2","3"]',true),
  ('wellbeing','loneliness','lonely_9', 9,'ความเห็นจากคนอื่นไม่มีผลต่อความสนใจหรือแนวคิดของฉัน','radio','["0","1","2","3"]',true),
  ('wellbeing','loneliness','lonely_10',10,'ฉันรู้สึกถูกทอดทิ้ง','radio','["0","1","2","3"]',true),
  ('wellbeing','loneliness','lonely_11',11,'ฉันรู้สึกโดดเดี่ยว','radio','["0","1","2","3"]',true),
  ('wellbeing','loneliness','lonely_12',12,'ฉันไม่สามารถติดต่อสื่อสารกับคนรอบข้างได้','radio','["0","1","2","3"]',true),
  ('wellbeing','loneliness','lonely_13',13,'ความสัมพันธ์ทางสังคมของฉันเป็นเพียงผิวเผิน','radio','["0","1","2","3"]',true),
  ('wellbeing','loneliness','lonely_14',14,'ฉันโหยหาการมีเพื่อนพ้อง','radio','["0","1","2","3"]',true),
  ('wellbeing','loneliness','lonely_15',15,'ไม่มีใครรู้จักฉันดีพอ','radio','["0","1","2","3"]',true),
  ('wellbeing','loneliness','lonely_16',16,'ฉันรู้สึกถูกแยกออกจากคนอื่นๆ','radio','["0","1","2","3"]',true),
  ('wellbeing','loneliness','lonely_17',17,'ฉันรู้สึกไม่มีความสุขเมื่อต้องเริ่มออกห่างจากบางสิ่งบางอย่าง','radio','["0","1","2","3"]',true),
  ('wellbeing','loneliness','lonely_18',18,'เป็นการยากสำหรับฉันที่จะหาเพื่อน','radio','["0","1","2","3"]',true),
  ('wellbeing','loneliness','lonely_19',19,'ฉันรู้สึกถูกกีดกัน และถูกตัดขาดออกจากผู้อื่น','radio','["0","1","2","3"]',true),
  ('wellbeing','loneliness','lonely_20',20,'แม้มีคนมากมายอยู่รอบตัวแต่ฉันก็ยังรู้สึกโดดเดี่ยว','radio','["0","1","2","3"]',true)
ON CONFLICT (form_code, question_key) DO NOTHING;

-- safety
INSERT INTO public.form_questions (form_code, section_key, question_key, question_order, label_th, input_type, options_json, is_required) VALUES
  ('wellbeing','safety','helmet_driver',    1,'ในช่วง 30 วันที่ผ่านมา ท่านสวมหมวกนิรภัยขณะขับขี่รถจักรยานยนต์หรือไม่',   'radio','["ใช้ทุกครั้ง","ใช้บางครั้ง","ไม่เคยใช้","ไม่เคยขี่"]',true),
  ('wellbeing','safety','helmet_passenger', 2,'ในช่วง 30 วันที่ผ่านมา ท่านสวมหมวกนิรภัยขณะโดยสารรถจักรยานยนต์หรือไม่',  'radio','["ใช้ทุกครั้ง","ใช้บางครั้ง","ไม่เคยใช้","ไม่เคยนั่งซ้อนท้าย"]',true),
  ('wellbeing','safety','seatbelt_driver',  3,'ในช่วง 30 วันที่ผ่านมา ท่านใช้เข็มขัดนิรภัยขณะขับรถยนต์หรือไม่',          'radio','["ใช้ทุกครั้ง","ใช้บางครั้ง","ไม่เคยใช้","ไม่เคยขับ"]',true),
  ('wellbeing','safety','seatbelt_passenger',4,'ในช่วง 30 วันที่ผ่านมา ท่านใช้เข็มขัดนิรภัยขณะเป็นผู้โดยสารข้างคนขับหรือไม่','radio','["ใช้ทุกครั้ง","ใช้บางครั้ง","ไม่เคยใช้","ไม่เคยนั่งข้างคนขับ"]',true),
  ('wellbeing','safety','accident_hist',    5,'ในช่วง 12 เดือนที่ผ่านมา ท่านเคยประสบอุบัติเหตุจราจรในลักษณะใดบ้าง','checkbox','["คนขับรถยนต์","ผู้โดยสารรถยนต์","คนขี่จักรยานยนต์","ผู้โดยสารจักรยานยนต์","คนขี่จักรยาน","คนเดินเท้า","ไม่เคย"]',true),
  ('wellbeing','safety','drunk_drive',      6,'ในช่วง 12 เดือนที่ผ่านมา เคยขับขี่หลังดื่มแอลกอฮอล์หรือไม่',               'radio','["ไม่เคย","เคย 1 ครั้ง/เดือนหรือน้อยกว่า","เคย 2-3 ครั้ง/เดือน","เคย > 3 ครั้ง/เดือน","ไม่เคยขับขี่"]',true)
ON CONFLICT (form_code, question_key) DO NOTHING;

-- environment
INSERT INTO public.form_questions (form_code, section_key, question_key, question_order, label_th, input_type, options_json, is_required) VALUES
  ('wellbeing','environment','env_satisfaction',1,'ความพึงพอใจในสิ่งแวดล้อมที่ทำงาน','radio','["แย่มาก","แย่","ปานกลาง","ดี","ดีมาก"]',true),
  ('wellbeing','environment','env_glare',  2,'แสงจ้า/ทำงานกลางแดด',   'radio','["ใช่ (มีผลต่อสุขภาพ)","ใช่ (ไม่มีผล)","ไม่ใช่"]',true),
  ('wellbeing','environment','env_noise',  3,'เสียงดัง/แรงสั่นสะเทือน','radio','["ใช่ (มีผลต่อสุขภาพ)","ใช่ (ไม่มีผล)","ไม่ใช่"]',true),
  ('wellbeing','environment','env_smell',  4,'กลิ่นเหม็น/สารเคมี',    'radio','["ใช่ (มีผลต่อสุขภาพ)","ใช่ (ไม่มีผล)","ไม่ใช่"]',true),
  ('wellbeing','environment','env_smoke',  5,'ควัน/ไอระเหย',           'radio','["ใช่ (มีผลต่อสุขภาพ)","ใช่ (ไม่มีผล)","ไม่ใช่"]',true),
  ('wellbeing','environment','env_posture',6,'ท่าทางเดิมนานๆ/ก้มเงย', 'radio','["ใช่ (มีผลต่อสุขภาพ)","ใช่ (ไม่มีผล)","ไม่ใช่"]',true),
  ('wellbeing','environment','env_awkward',7,'ท่าทางฝืนธรรมชาติ (ยกของ/เขย่ง)','radio','["ใช่ (มีผลต่อสุขภาพ)","ใช่ (ไม่มีผล)","ไม่ใช่"]',true),
  ('wellbeing','environment','pm25_impact',8,'ปัญหา PM 2.5 ในพื้นที่ (1 ปีที่ผ่านมา)','radio','["ไม่มีเลย","น้อย","ปานกลาง","มาก","รุนแรงมาก"]',true),
  ('wellbeing','environment','pm25_symptom',9,'อาการเจ็บป่วยจาก PM 2.5','checkbox','["ไม่มี","ไอ/คัดจมูก/แสบคอ","หายใจไม่เต็มอิ่ม","แสบตา","ปวดศีรษะ"]',true),
  ('wellbeing','environment','life_quality',10,'คุณภาพชีวิตโดยรวม','radio','["แย่มาก","แย่","ปานกลาง","ดี","ดีมาก"]',true),
  ('wellbeing','environment','emerging_known',11,'รู้จัก "โรคอุบัติใหม่" หรือไม่','radio','["เคยได้ยิน","ไม่เคย"]',true),
  ('wellbeing','environment','emerging_list',12,'โรคอุบัติใหม่ที่รู้จัก','checkbox','["COVID-19","ไข้หวัดนก","ไข้ซิกา","อื่นๆ"]',true),
  ('wellbeing','environment','climate_impact',13,'ผลกระทบจากโลกร้อนต่อสุขภาพ','radio','["ไม่มีเลย","น้อย","ปานกลาง","มาก","รุนแรงมาก"]',true),
  ('wellbeing','environment','covid_history',14,'ติด COVID-19 ใน 6 เดือนที่ผ่านมา','radio','["ไม่เคย","1 ครั้ง","> 1 ครั้ง"]',true)
ON CONFLICT (form_code, question_key) DO NOTHING;

-- ----------------------------------------------------------------
-- CH1 FORM — sections
-- ----------------------------------------------------------------
INSERT INTO public.form_sections (form_code, section_key, section_order, title_th, description) VALUES
  ('ch1','ch1_org_info',     1,'ข้อมูลองค์กร',                  'ชื่อ รหัส และโครงสร้างองค์กร'),
  ('ch1','ch1_workforce',    2,'ข้อมูลบุคลากร',                  'จำนวน ประเภท และอายุของบุคลากร'),
  ('ch1','ch1_turnover',     3,'การเปลี่ยนแปลงบุคลากร',          'อัตราลาออก โอนย้าย'),
  ('ch1','ch1_health',       4,'สุขภาพและโรคไม่ติดต่อ (NCD)',     'ข้อมูลโรคและการลาป่วย'),
  ('ch1','ch1_engagement',   5,'Engagement & พัฒนาบุคลากร',      'คะแนน engagement และระบบพัฒนา'),
  ('ch1','ch1_strategy',     6,'ยุทธศาสตร์และบริบทองค์กร',       'ภาพรวมยุทธศาสตร์และจุดเน้น'),
  ('ch1','ch1_docs',         7,'เอกสารแนบ',                      'ไฟล์ PDF ที่เกี่ยวข้อง')
ON CONFLICT (form_code, section_key) DO NOTHING;

-- ----------------------------------------------------------------
-- CH1 FORM — questions (from hrd-ch1-fields.js)
-- ----------------------------------------------------------------
INSERT INTO public.form_questions (form_code, section_key, question_key, question_order, label_th, input_type, is_required) VALUES
  -- org_info
  ('ch1','ch1_org_info','organization',        1,'หน่วยงาน',                'text',    true),
  ('ch1','ch1_org_info','org_code',            2,'รหัสหน่วยงาน',            'text',    true),
  ('ch1','ch1_org_info','strategic_overview',  3,'ภาพรวมยุทธศาสตร์',        'textarea',false),
  ('ch1','ch1_org_info','org_structure',       4,'โครงสร้างองค์กร',          'textarea',false),
  -- workforce
  ('ch1','ch1_workforce','total_staff',        1,'บุคลากรรวม',               'number',  true),
  ('ch1','ch1_workforce','type_official',      2,'ข้าราชการ',                'number',  false),
  ('ch1','ch1_workforce','type_employee',      3,'พนักงานราชการ',             'number',  false),
  ('ch1','ch1_workforce','type_contract',      4,'ลูกจ้าง',                  'number',  false),
  ('ch1','ch1_workforce','type_other',         5,'อื่นๆ',                    'number',  false),
  ('ch1','ch1_workforce','age_u30',            6,'อายุ ≤30 ปี',              'number',  false),
  ('ch1','ch1_workforce','age_31_40',          7,'อายุ 31-40 ปี',            'number',  false),
  ('ch1','ch1_workforce','age_41_50',          8,'อายุ 41-50 ปี',            'number',  false),
  ('ch1','ch1_workforce','age_51_60',          9,'อายุ 51-60 ปี',            'number',  false),
  -- turnover
  ('ch1','ch1_turnover','turnover_count',      1,'จำนวนลาออก',               'number',  false),
  ('ch1','ch1_turnover','turnover_rate',       2,'อัตราลาออก (%)',            'number',  false),
  ('ch1','ch1_turnover','transfer_count',      3,'จำนวนโอนย้าย',              'number',  false),
  ('ch1','ch1_turnover','transfer_rate',       4,'อัตราโอนย้าย (%)',          'number',  false),
  -- health
  ('ch1','ch1_health','ncd_count',             1,'NCD รวม',                  'number',  false),
  ('ch1','ch1_health','ncd_ratio_pct',         2,'NCD (%)',                   'number',  false),
  ('ch1','ch1_health','disease_diabetes',      3,'เบาหวาน',                  'number',  false),
  ('ch1','ch1_health','disease_hypertension',  4,'ความดันโลหิตสูง',           'number',  false),
  ('ch1','ch1_health','disease_cardiovascular',5,'โรคหัวใจและหลอดเลือด',     'number',  false),
  ('ch1','ch1_health','disease_kidney',        6,'โรคไต',                    'number',  false),
  ('ch1','ch1_health','disease_liver',         7,'โรคตับ',                   'number',  false),
  ('ch1','ch1_health','disease_cancer',        8,'มะเร็ง',                   'number',  false),
  ('ch1','ch1_health','disease_obesity',       9,'ภาวะอ้วน',                 'number',  false),
  ('ch1','ch1_health','sick_leave_days',      10,'วันลาป่วยรวม/ปี',           'number',  false),
  ('ch1','ch1_health','sick_leave_avg',       11,'วันลาป่วยเฉลี่ย/คน',        'number',  false),
  ('ch1','ch1_health','clinic_users_per_year',12,'ผู้ใช้บริการห้องพยาบาล/ปี', 'number',  false),
  -- engagement
  ('ch1','ch1_engagement','engagement_score',  1,'Engagement Score',         'number',  false),
  ('ch1','ch1_engagement','mentoring_system',  2,'ระบบพี่เลี้ยง',             'radio',   false),
  ('ch1','ch1_engagement','job_rotation',      3,'Job Rotation',              'radio',   false),
  ('ch1','ch1_engagement','idp_system',        4,'IDP',                       'radio',   false),
  ('ch1','ch1_engagement','career_path_system',5,'Career Path',               'radio',   false),
  ('ch1','ch1_engagement','training_hours',    6,'ชั่วโมงอบรม/คน/ปี',         'number',  false),
  -- strategy
  ('ch1','ch1_strategy','related_policies',    1,'นโยบายที่เกี่ยวข้อง',       'textarea', false),
  ('ch1','ch1_strategy','context_challenges',  2,'บริบทและความท้าทาย',        'textarea', false),
  ('ch1','ch1_strategy','strategic_priority_rank1',3,'จุดเน้น อันดับ 1',      'text',    false),
  ('ch1','ch1_strategy','strategic_priority_rank2',4,'จุดเน้น อันดับ 2',      'text',    false),
  ('ch1','ch1_strategy','strategic_priority_rank3',5,'จุดเน้น อันดับ 3',      'text',    false),
  -- docs
  ('ch1','ch1_docs','strategy_file_url',       1,'ไฟล์แผนยุทธศาสตร์ (PDF)',   'file',    false),
  ('ch1','ch1_docs','org_structure_file_url',  2,'ไฟล์โครงสร้างองค์กร (PDF)', 'file',    false),
  ('ch1','ch1_docs','hrd_plan_file_url',       3,'ไฟล์แผน HRD (PDF)',          'file',    false)
ON CONFLICT (form_code, question_key) DO NOTHING;

-- Update radio options for boolean-like fields in CH1
UPDATE public.form_questions
  SET options_json = '["มี","ไม่มี"]'
WHERE form_code = 'ch1'
  AND question_key IN ('mentoring_system','job_rotation','idp_system','career_path_system');
