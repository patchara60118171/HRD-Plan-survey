// ========================================
// Survey Questions Data (Updated)
// ========================================

// Alias — authoritative list lives in PROJECT_SSOT (js/project-ssot.js)
const SECTIONS_ORDER = PROJECT_SSOT.wellbeing.sectionsOrder;

const SURVEY_DATA = {
    // ----------------------------------------
    // Part 1: Personal Info & Body (Physical)
    // ----------------------------------------
    personal: {
        title: 'ส่วนที่ 1 ข้อมูลส่วนบุคคล และการตรวจวัดร่างกาย',
        type: 'physical', // Using generic type for icon
        description: 'ข้อมูลทั่วไปและสุขภาพเบื้องต้น',
        subsections: [
            {
                title: 'ข้อมูลส่วนบุคคล',
                questions: [
                    {
                        id: 'title',
                        text: 'คำนำหน้า',
                        type: 'radio',
                        options: ['นาย', 'นาง', 'นางสาว', 'อื่นๆ'],
                        required: true
                    },
                    { id: 'name', text: 'ชื่อ-สกุล', type: 'text', placeholder: 'ระบุชื่อและนามสกุล', required: true },
                    {
                        id: 'gender',
                        text: 'เพศ',
                        type: 'radio',
                        options: ['ชาย', 'หญิง', 'LGBTQ+'],
                        required: true
                    },
                    { id: 'age', text: 'อายุ (ปี)', type: 'number', required: true },
                    {
                        id: 'org_type',
                        text: 'ประเภทหน่วยงาน',
                        type: 'radio',
                        options: ['นโยบาย', 'ปฏิบัติการ', 'สนับสนุน'],
                        required: true
                    },
                    {
                        id: 'job',
                        text: 'ระดับตำแหน่งงานปัจจุบัน',
                        type: 'radio',
                        options: [
                            'บริหาร: ระดับต้น',
                            'บริหาร: ระดับสูง',
                            'อำนวยการ: ระดับต้น',
                            'อำนวยการ: ระดับสูง',
                            'วิชาการ: ระดับปฏิบัติการ',
                            'วิชาการ: ระดับชำนาญการ',
                            'วิชาการ: ระดับชำนาญการพิเศษ',
                            'วิชาการ: ระดับเชี่ยวชาญ',
                            'วิชาการ: ระดับทรงคุณวุฒิ',
                            'ทั่วไป: ระดับปฏิบัติงาน',
                            'ทั่วไป: ระดับชำนาญงาน',
                            'ทั่วไป: ระดับอาวุโส',
                            'ทั่วไป: ระดับทักษะพิเศษ'
                        ],
                        required: true
                    },
                    { id: 'job_duration', text: 'ระยะเวลาที่ทำงานในตำแหน่งปัจจุบัน (ปี)', type: 'number', required: true },
                    {
                        id: 'activity_org',
                        text: 'ท่านเคยเข้ารับกิจกรรมส่งเสริมสุขภาพของพนักงานในองค์กรหรือไม่',
                        type: 'radio',
                        options: ['เคย', 'ไม่เคย'],
                        required: true
                    },
                    {
                        id: 'activity_thaihealth',
                        text: 'ท่านเคยเข้ารับกิจกรรมส่งเสริมสุขภาพจาก สสส. หรือไม่',
                        type: 'radio',
                        options: ['เคย', 'ไม่เคย'],
                        required: true
                    },
                    {
                        id: 'diseases',
                        text: 'ท่านมีปัญหาสุขภาพเหล่านี้หรือไม่',
                        type: 'checkbox',
                        options: ['เบาหวาน', 'ความดันโลหิตสูง', 'โรคหัวใจและหลอดเลือด', 'โรคไต', 'โรคตับ', 'มะเร็ง', 'ไม่มี'],
                        required: true
                    }
                ]
            },
            {
                title: 'ข้อมูลร่างกายเบื้องต้น',
                questions: [
                    { id: 'height', text: 'ส่วนสูง (เซนติเมตร)', type: 'number', required: true },
                    { id: 'weight', text: 'น้ำหนัก (กิโลกรัม)', type: 'number', required: true },
                    { id: 'waist', text: 'เส้นรอบเอว (เซนติเมตร)', type: 'number', required: true }
                ]
            }
        ]
    },

    // ----------------------------------------
    // Part 2: Consumption (Smoke/Alcohol) (Physical)
    // ----------------------------------------
    consumption: {
        title: 'การบริโภคยาสูบ และการบริโภคแอลกอฮอล์ สิ่งเสพติด',
        type: 'physical',
        description: 'พฤติกรรมเสี่ยงด้านสุขภาพ',
        subsections: [
            {
                title: 'ในระยะเวลา 2 เดือนที่ผ่านมา',
                questions: [
                    {
                        id: 'q2001',
                        text: 'ในระยะเวลา 2 เดือนที่ผ่านมา ท่านเคยสูบบุหรี่หรือไม่',
                        type: 'radio',
                        options: ['ไม่เคยสูบ', 'สูบเป็นประจำทุกวัน', 'สูบ 2 – 3 ครั้งต่อสัปดาห์', 'สูบบางโอกาส/นานๆสูบที'],
                        required: true
                    },
                    {
                        id: 'q2002',
                        text: 'ในระยะเวลา 2 เดือนที่ผ่านมา ท่านเคยสูบบุหรี่ไฟฟ้าหรือไม่',
                        type: 'radio',
                        options: ['ไม่เคยสูบ', 'สูบเป็นประจำทุกวัน', 'สูบ 2 – 3 ครั้งต่อสัปดาห์', 'สูบบางโอกาส/นานๆสูบที'],
                        required: true
                    },
                    {
                        id: 'q2003',
                        text: 'ในระยะเวลา 2 เดือนที่ผ่านมา ท่านเคยดื่มสุราหรือเครื่องดื่มผสมแอลกอฮอล์หรือไม่',
                        type: 'radio',
                        options: ['ไม่เคยดื่ม', 'ดื่มเป็นประจำทุกวัน', 'ดื่ม 2 – 3 ครั้งต่อสัปดาห์', 'ดื่มบางโอกาส/นานๆดื่มที'],
                        required: true
                    },
                    {
                        id: 'q2004',
                        text: 'ในระยะเวลา 2 เดือนที่ผ่านมา ท่านเคยดื่มเครื่องดื่มที่มีส่วนผสมของกัญชาหรือไม่',
                        type: 'radio',
                        options: ['ไม่เคยดื่ม', 'ดื่มเป็นประจำทุกวัน', 'ดื่ม 2 – 3 ครั้งต่อสัปดาห์', 'ดื่มบางโอกาส/นานๆดื่มที'],
                        required: true
                    },
                    {
                        id: 'q2005_drug',
                        text: 'ในระยะเวลา 2 เดือนที่ผ่านมา ท่านเคยใช้สารเสพติดอื่นๆ เช่น ยาบ้า กัญชา หรือไม่',
                        type: 'radio',
                        options: ['ไม่เคยเสพ', 'เสพเป็นประจำทุกวัน', 'เสพ 2 – 3 ครั้งต่อสัปดาห์', 'เสพบางโอกาส/นานๆเสพที'],
                        required: true
                    }
                ]
            }
        ]
    },

    // ----------------------------------------
    // Part 3: Nutrition (Sweet/Fat/Salt) (Physical)
    // ----------------------------------------
    nutrition: {
        title: 'พฤติกรรมการบริโภค',
        type: 'physical',
        description: 'ประเมินการกิน หวาน มัน เค็ม',
        subsections: [
            {
                title: 'รสหวาน',
                hint: 'ความถี่: ทุกวัน, 3-4 ครั้ง/สัปดาห์, แทบไม่ทำ',
                questions: [
                    { id: 'sweet_1', text: 'ดื่มน้ำเปล่า / กาแฟดำ / ชาไม่ใส่น้ำตาล / โซดา', type: 'radio', options: ['ทุกวัน / เกือบทุกวัน', '3-4 ครั้งต่อสัปดาห์', 'แทบไม่ทำ / ไม่ทำเลย'], required: true },
                    { id: 'sweet_2', text: 'ดื่มน้ำอัดลม / กาแฟ 3 in 1 / กาแฟเย็น / กาแฟปั่น / เครื่องดื่มชง / น้ำหวาน / นมเปรี้ยว', type: 'radio', options: ['ทุกวัน / เกือบทุกวัน', '3-4 ครั้งต่อสัปดาห์', 'แทบไม่ทำ / ไม่ทำเลย'], required: true },
                    { id: 'sweet_3', text: 'ดื่มน้ำผัก / ผลไม้สำเร็จรูป', type: 'radio', options: ['ทุกวัน / เกือบทุกวัน', '3-4 ครั้งต่อสัปดาห์', 'แทบไม่ทำ / ไม่ทำเลย'], required: true },
                    { id: 'sweet_4', text: 'กินไอศกรีม / เบเกอรี่ หรือขนมหวานไทย', type: 'radio', options: ['ทุกวัน / เกือบทุกวัน', '3-4 ครั้งต่อสัปดาห์', 'แทบไม่ทำ / ไม่ทำเลย'], required: true },
                    { id: 'sweet_5', text: 'เติมน้ำตาล / น้ำผึ้ง / น้ำเชื่อมลงในอาหาร', type: 'radio', options: ['ทุกวัน / เกือบทุกวัน', '3-4 ครั้งต่อสัปดาห์', 'แทบไม่ทำ / ไม่ทำเลย'], required: true }
                ]
            },
            {
                title: 'ไขมัน',
                questions: [
                    { id: 'fat_1', text: 'เลือกกินเนื้อสัตว์ติดมัน ติดหนัง มีไขมันแทรก', type: 'radio', options: ['ทุกวัน / เกือบทุกวัน', '3-4 ครั้งต่อสัปดาห์', 'แทบไม่ทำ / ไม่ทำเลย'], required: true },
                    { id: 'fat_2', text: 'กินอาหารทอด อาหารฟาสต์ฟู้ด อาหารผัดน้ำมัน', type: 'radio', options: ['ทุกวัน / เกือบทุกวัน', '3-4 ครั้งต่อสัปดาห์', 'แทบไม่ทำ / ไม่ทำเลย'], required: true },
                    { id: 'fat_3', text: 'กินอาหารจานเดียว ไขมันสูง หรืออาหารประเภทแกงกะทิ', type: 'radio', options: ['ทุกวัน / เกือบทุกวัน', '3-4 ครั้งต่อสัปดาห์', 'แทบไม่ทำ / ไม่ทำเลย'], required: true },
                    { id: 'fat_4', text: 'ดื่มเครื่องดื่มชงผสมนมข้นหวาน ครีมเทียม วิปปิ้งครีม ครีม', type: 'radio', options: ['ทุกวัน / เกือบทุกวัน', '3-4 ครั้งต่อสัปดาห์', 'แทบไม่ทำ / ไม่ทำเลย'], required: true },
                    { id: 'fat_5', text: 'ซดน้ำผัด น้ำแกง หรือราดน้ำผัดน้ำแกง ลงในข้าว', type: 'radio', options: ['ทุกวัน / เกือบทุกวัน', '3-4 ครั้งต่อสัปดาห์', 'แทบไม่ทำ / ไม่ทำเลย'], required: true }
                ]
            },
            {
                title: 'โซเดียม (เค็ม)',
                questions: [
                    { id: 'salt_1', text: 'ชิมอาหารก่อนปรุง / น้ำปลา ซีอิ๊ว ซอส ปรุงน้อย หรือไม่ปรุงเพิ่ม', type: 'radio', options: ['ทุกวัน / เกือบทุกวัน', '3-4 ครั้งต่อสัปดาห์', 'แทบไม่ทำ / ไม่ทำเลย'], required: true },
                    { id: 'salt_2', text: 'ใช้สมุนไพร หรือเครื่องเทศเป็นส่วนประกอบอาหาร แทนเครื่องปรุง', type: 'radio', options: ['ทุกวัน / เกือบทุกวัน', '3-4 ครั้งต่อสัปดาห์', 'แทบไม่ทำ / ไม่ทำเลย'], required: true },
                    { id: 'salt_3', text: 'กินเนื้อสัตว์แปรรูป ไส้กรอก หมูยอ แฮม ปลาเค็ม กุ้งแห้ง ปลาร้า', type: 'radio', options: ['ทุกวัน / เกือบทุกวัน', '3-4 ครั้งต่อสัปดาห์', 'แทบไม่ทำ / ไม่ทำเลย'], required: true },
                    { id: 'salt_4', text: 'กินบะหมี่ โจ๊กกึ่งสำเร็จรูป หรืออาหารกล่องแช่แข็ง', type: 'radio', options: ['ทุกวัน / เกือบทุกวัน', '3-4 ครั้งต่อสัปดาห์', 'แทบไม่ทำ / ไม่ทำเลย'], required: true },
                    { id: 'salt_5', text: 'กินผักผลไม้ดอง หรือผลไม้แช่อิ่ม จิ้มพริกเกลือ น้ำปลาหวาน', type: 'radio', options: ['ทุกวัน / เกือบทุกวัน', '3-4 ครั้งต่อสัปดาห์', 'แทบไม่ทำ / ไม่ทำเลย'], required: true }
                ]
            }
        ]
    },

    // ----------------------------------------
    // Part 4: Physical Activity (Physical)
    // ----------------------------------------
    activity: {
        title: 'กิจกรรมทางกาย (TPAX)',
        type: 'physical',
        description: 'การเคลื่อนไหวร่างกายในชีวิตประจำวัน',
        subsections: [
            {
                title: 'การทำงาน',
                questions: [
                    { id: 'act_work_days', text: 'ท่านปฏิบัติกิจกรรมทางกายในหมวดของการทำงาน ใน 1 สัปดาห์ ……………. วัน', type: 'number', required: true },
                    { id: 'act_work_dur', text: 'โดยเฉลี่ยต่อวันที่ท่านปฏิบัติกิจกรรมทางกายในหมวดของการทำงาน', type: 'time', required: true }
                ]
            },
            {
                title: 'การเดินทาง',
                questions: [
                    { id: 'act_commute_days', text: 'ท่านปฏิบัติกิจกรรมทางกายในหมวดของการเดินทางสัญจรด้วยเท้า/ปั่นจักรยาน ใน 1 สัปดาห์ ……………. วัน', type: 'number', required: true },
                    { id: 'act_commute_dur', text: 'โดยเฉลี่ยต่อวันที่ท่านปฏิบัติกิจกรรมทางกายในหมวดของการเดินทางสัญจรด้วยเท้า/ปั่นจักรยาน', type: 'time', required: true }
                ]
            },
            {
                title: 'นันทนาการ/ออกกำลังกาย',
                questions: [
                    { id: 'act_rec_days', text: 'ท่านปฏิบัติกิจกรรมทางกายในหมวดของกิจกรรมนัทนาการ/ออกกำลังกาย ใน 1 สัปดาห์ ……….. วัน', type: 'number', required: true },
                    { id: 'act_rec_dur', text: 'โดยเฉลี่ยต่อวันที่ท่านปฏิบัติกิจกรรมทางกายในหมวดของกิจกรรมนัทนาการ/ออกกำลังกาย', type: 'time', required: true }
                ]
            },
            {
                title: 'พฤติกรรมเนือยนิ่ง/หน้าจอ',
                questions: [
                    { id: 'sedentary_dur', text: 'โดยปกติ ใน 1 วันท่านนั่งหรือเอนกายหรือเคลื่อนไหวน้อย ๆซึ่งไม่รวมถึงการนอนหลับพักผ่อน โดยเฉลี่ยต่อวันที่ท่านปฏิบัติ', type: 'time', required: true },
                    { id: 'screen_entertain', text: 'ท่านใช้เวลาดูทีวี ใช้โทรศัพท์มือถือ เล่นคอมพิวเตอร์เพื่อความบันเทิง โดยเฉลี่ยต่อวันที่ท่านปฏิบัติ', type: 'time', required: true },
                    { id: 'screen_work', text: 'ท่านใช้คอมพิวเตอร์ หรืออุปกรณ์อิเล็กทรอนิกส์หน้าจอต่างๆ เพื่อทำงาน หรือการเรียนรู้ โดยเฉลี่ยต่อวันที่ท่านปฏิบัติ', type: 'time', required: true }
                ]
            }
        ]
    },

    // ----------------------------------------
    // Part 5: Mental Health (TMHI-15) (Mental)
    // ----------------------------------------
    mental: {
        title: 'สุขภาพจิต (TMHI-15)',
        type: 'mental',
        description: 'วัดสุขภาพจิตคนไทยฉบับสั้น',
        subsections: [
            {
                title: 'ความรู้สึกในช่วง 1 เดือนที่ผ่านมา',
                hint: 'ระดับ: ไม่เลย, เล็กน้อย, มาก, มากที่สุด',
                questions: [
                    { id: 'tmhi_1', text: 'ท่านรู้สึกพึงพอใจในชีวิต', type: 'scale', labels: ['ไม่เลย', 'เล็กน้อย', 'มาก', 'มากที่สุด'], required: true },
                    { id: 'tmhi_2', text: 'ท่านรู้สึกสบายใจ', type: 'scale', labels: ['ไม่เลย', 'เล็กน้อย', 'มาก', 'มากที่สุด'], required: true },
                    { id: 'tmhi_3', text: 'ท่านรู้สึกภูมิใจในตนเอง', type: 'scale', labels: ['ไม่เลย', 'เล็กน้อย', 'มาก', 'มากที่สุด'], required: true },
                    { id: 'tmhi_4', text: 'ท่านรู้สึกเบื่อหน่ายท้อแท้กับการดำเนินชีวิตประจำวัน', type: 'scale', labels: ['ไม่เลย', 'เล็กน้อย', 'มาก', 'มากที่สุด'], required: true },
                    { id: 'tmhi_5', text: 'ท่านรู้สึกผิดหวังในตนเอง', type: 'scale', labels: ['ไม่เลย', 'เล็กน้อย', 'มาก', 'มากที่สุด'], required: true },
                    { id: 'tmhi_6', text: 'ท่านรู้สึกว่าชีวิตมีแต่ความทุกข์', type: 'scale', labels: ['ไม่เลย', 'เล็กน้อย', 'มาก', 'มากที่สุด'], required: true },
                    { id: 'tmhi_7', text: 'ท่านสามารถทำใจยอมรับได้สำหรับปัญหาที่ยากจะแก้ไข (เมื่อมีปัญหา)', type: 'scale', labels: ['ไม่เลย', 'เล็กน้อย', 'มาก', 'มากที่สุด'], required: true },
                    { id: 'tmhi_8', text: 'ท่านมั่นใจว่าจะสามารถควบคุมอารมณ์ได้เมื่อมีเหตุการณ์คับขัน', type: 'scale', labels: ['ไม่เลย', 'เล็กน้อย', 'มาก', 'มากที่สุด'], required: true },
                    { id: 'tmhi_9', text: 'ท่านมั่นใจที่จะเผชิญกับเหตุการณ์ร้ายแรงที่เกิดขึ้นในชีวิต', type: 'scale', labels: ['ไม่เลย', 'เล็กน้อย', 'มาก', 'มากที่สุด'], required: true },
                    { id: 'tmhi_10', text: 'ท่านรู้สึกเห็นอกเห็นใจเมื่อผู้อื่นมีความทุกข์', type: 'scale', labels: ['ไม่เลย', 'เล็กน้อย', 'มาก', 'มากที่สุด'], required: true },
                    { id: 'tmhi_11', text: 'ท่านรู้สึกเป็นสุขในการช่วยเหลือผู้อื่นที่มีปัญหา', type: 'scale', labels: ['ไม่เลย', 'เล็กน้อย', 'มาก', 'มากที่สุด'], required: true },
                    { id: 'tmhi_12', text: 'ท่านให้ความช่วยเหลือแก่ผู้อื่นเมื่อมีโอกาส', type: 'scale', labels: ['ไม่เลย', 'เล็กน้อย', 'มาก', 'มากที่สุด'], required: true },
                    { id: 'tmhi_13', text: 'ท่านรู้สึกมั่นคงปลอดภัยเมื่ออยู่ในครอบครัว', type: 'scale', labels: ['ไม่เลย', 'เล็กน้อย', 'มาก', 'มากที่สุด'], required: true },
                    { id: 'tmhi_14', text: 'หากท่านป่วยหนัก ท่านเชื่อว่าคนในครอบครัวจะดูแลท่านเป็นอย่างดี', type: 'scale', labels: ['ไม่เลย', 'เล็กน้อย', 'มาก', 'มากที่สุด'], required: true },
                    { id: 'tmhi_15', text: 'สมาชิกในครอบครัวมีความรักและผูกพันต่อกัน', type: 'scale', labels: ['ไม่เลย', 'เล็กน้อย', 'มาก', 'มากที่สุด'], required: true }
                ]
            }
        ]
    },

    // ----------------------------------------
    // Part 6: Social Dimension (Loneliness) (Social)
    // ----------------------------------------
    loneliness: {
        title: 'แบบสำรวจความเหงา (UCLA Loneliness Scale)',
        type: 'social',
        description: 'การมีปฏิสัมพันธ์กับผู้อื่นในที่ทำงาน ความสัมพันธ์และการติดต่อสื่อสารกับเพื่อนร่วมงาน',
        subsections: [
            {
                title: 'ความรู้สึกโดดเดี่ยว',
                hint: '3 = ฉันรู้สึกเช่นนี้บ่อยครั้ง, 2 = ฉันรู้สึกเช่นนี้เป็นบางครั้ง, 1 = ฉันแทบไม่เคยรู้สึกเช่นนี้, 0 = ฉันไม่เคยรู้สึกเช่นนี้เลย',
                questions: [
                    { id: 'lonely_1', text: 'ฉันไม่มีความสุขที่ต้องทำหลายสิ่งหลายอย่างคนเดียว', type: 'scale', labels: ['0', '1', '2', '3'], required: true },
                    { id: 'lonely_2', text: 'ฉันไม่มีใครคุยด้วย', type: 'scale', labels: ['0', '1', '2', '3'], required: true },
                    { id: 'lonely_3', text: 'ฉันทนไม่ได้ที่จะอยู่คนเดียวอย่างนี้', type: 'scale', labels: ['0', '1', '2', '3'], required: true },
                    { id: 'lonely_4', text: 'ฉันขาดมิตรภาพ', type: 'scale', labels: ['0', '1', '2', '3'], required: true },
                    { id: 'lonely_5', text: 'ฉันรู้สึกราวกับว่าไม่มีใครเข้าใจฉันจริงๆ', type: 'scale', labels: ['0', '1', '2', '3'], required: true }
                ]
            },
            {
                title: 'ความสัมพันธ์ทางสังคม',
                hint: '3 = ฉันรู้สึกเช่นนี้บ่อยครั้ง, 2 = ฉันรู้สึกเช่นนี้เป็นบางครั้ง, 1 = ฉันแทบไม่เคยรู้สึกเช่นนี้, 0 = ฉันไม่เคยรู้สึกเช่นนี้เลย',
                questions: [
                    { id: 'lonely_6', text: 'ฉันพบว่าตัวเองรอคนโทรหา', type: 'scale', labels: ['0', '1', '2', '3'], required: true },
                    { id: 'lonely_7', text: 'ฉันไม่มีใครให้พึ่ง', type: 'scale', labels: ['0', '1', '2', '3'], required: true },
                    { id: 'lonely_8', text: 'ฉันไม่สนิทกับใคร', type: 'scale', labels: ['0', '1', '2', '3'], required: true },
                    { id: 'lonely_9', text: 'ความเห็นจากคนอื่นไม่มีผลต่อความสนใจหรือแนวคิดของฉัน', type: 'scale', labels: ['0', '1', '2', '3'], required: true },
                    { id: 'lonely_10', text: 'ฉันรู้สึกถูกทอดทิ้ง', type: 'scale', labels: ['0', '1', '2', '3'], required: true }
                ]
            },
            {
                title: 'ความรู้สึกเกี่ยวกับตนเอง',
                hint: '3 = ฉันรู้สึกเช่นนี้บ่อยครั้ง, 2 = ฉันรู้สึกเช่นนี้เป็นบางครั้ง, 1 = ฉันแทบไม่เคยรู้สึกเช่นนี้, 0 = ฉันไม่เคยรู้สึกเช่นนี้เลย',
                questions: [
                    { id: 'lonely_11', text: 'ฉันรู้สึกโดดเดี่ยว', type: 'scale', labels: ['0', '1', '2', '3'], required: true },
                    { id: 'lonely_12', text: 'ฉันไม่สามารถติดต่อสื่อสารกับคนรอบข้างได้', type: 'scale', labels: ['0', '1', '2', '3'], required: true },
                    { id: 'lonely_13', text: 'ความสัมพันธ์ทางสังคมของฉันเป็นเพียงผิวเผิน', type: 'scale', labels: ['0', '1', '2', '3'], required: true },
                    { id: 'lonely_14', text: 'ฉันโหยหาการมีเพื่อนพ้อง', type: 'scale', labels: ['0', '1', '2', '3'], required: true },
                    { id: 'lonely_15', text: 'ไม่มีใครรู้จักฉันดีพอ', type: 'scale', labels: ['0', '1', '2', '3'], required: true }
                ]
            },
            {
                title: 'พฤติกรรมทางสังคม',
                hint: '3 = ฉันรู้สึกเช่นนี้บ่อยครั้ง, 2 = ฉันรู้สึกเช่นนี้เป็นบางครั้ง, 1 = ฉันแทบไม่เคยรู้สึกเช่นนี้, 0 = ฉันไม่เคยรู้สึกเช่นนี้เลย',
                questions: [
                    { id: 'lonely_16', text: 'ฉันรู้สึกถูกแยกออกจากคนอื่นๆ', type: 'scale', labels: ['0', '1', '2', '3'], required: true },
                    { id: 'lonely_17', text: 'ฉันรู้สึกไม่มีความสุขเมื่อต้องเริ่มออกห่างจากบางสิ่งบางอย่าง', type: 'scale', labels: ['0', '1', '2', '3'], required: true },
                    { id: 'lonely_18', text: 'เป็นการยากสำหรับฉันที่จะหาเพื่อน', type: 'scale', labels: ['0', '1', '2', '3'], required: true },
                    { id: 'lonely_19', text: 'ฉันรู้สึกถูกกีดกัน และถูกตัดขาดออกจากผู้อื่น', type: 'scale', labels: ['0', '1', '2', '3'], required: true },
                    { id: 'lonely_20', text: 'แม้มีคนมากมายอยู่รอบตัวแต่ฉันก็ยังรู้สึกโดดเดี่ยว', type: 'scale', labels: ['0', '1', '2', '3'], required: true }
                ]
            }
        ]
    },

    // ----------------------------------------
    // Part 7: Safety (Environment)
    // ----------------------------------------
    safety: {
        title: 'อุบัติเหตุและความปลอดภัย',
        type: 'environment',
        description: 'พฤติกรรมความปลอดภัย',
        subsections: [
            {
                title: 'การขับขี่และการเดินทาง',
                questions: [
                    { id: 'helmet_driver', text: 'ในช่วง 30 วันที่ผ่านมา ท่านสวมหมวกนิรภัยขณะขับขี่รถจักรยานยนต์หรือไม่', type: 'radio', options: ['ใช้ทุกครั้ง', 'ใช้บางครั้ง', 'ไม่เคยใช้', 'ไม่เคยขี่'], required: true },
                    { id: 'helmet_passenger', text: 'ในช่วง 30 วันที่ผ่านมา ท่านสวมหมวกนิรภัยขณะโดยสารรถจักรยานยนต์หรือไม่', type: 'radio', options: ['ใช้ทุกครั้ง', 'ใช้บางครั้ง', 'ไม่เคยใช้', 'ไม่เคยนั่งซ้อนท้าย'], required: true },
                    { id: 'seatbelt_driver', text: 'ในช่วง 30 วันที่ผ่านมา ท่านใช้เข็มขัดนิรภัยขณะขับรถยนต์หรือไม่', type: 'radio', options: ['ใช้ทุกครั้ง', 'ใช้บางครั้ง', 'ไม่เคยใช้', 'ไม่เคยขับ'], required: true },
                    { id: 'seatbelt_passenger', text: 'ในช่วง 30 วันที่ผ่านมา ท่านใช้เข็มขัดนิรภัยขณะเป็นผู้โดยสารข้างคนขับหรือไม่', type: 'radio', options: ['ใช้ทุกครั้ง', 'ใช้บางครั้ง', 'ไม่เคยใช้', 'ไม่เคยนั่งข้างคนขับ'], required: true },
                    {
                        id: 'accident_hist',
                        text: 'ในช่วง 12 เดือนที่ผ่านมา ท่านเคยประสบอุบัติภัยจราจร ในฐานะคนขับขี่ /ผู้โดยสาร/ ขี่จักรยาน หรือขณะอยู่ข้างถนนหรือไม่ (เลือกตอบได้มากกว่า 1 ข้อ)',
                        type: 'checkbox',
                        options: [
                            'ไม่เคย',
                            'เคยในฐานะคนขับรถยนต์',
                            'เคยในฐานะคนขี่จักรยานยนต์',
                            'เคยในฐานะผู้โดยสารรถยนต์',
                            'เคยในฐานะผู้โดยสารรถจักรยานยนต์',
                            'เคยในฐานะคนขี่จักรยาน',
                            'เคยในฐานะคนที่ยืน / เดิน อยู่ข้างถนน'
                            
                        ],
                        required: true
                    },
                    {
                        id: 'drunk_drive',
                        text: 'ในช่วง 12 เดือนที่ผ่านมา ท่านเคยขับรถยนต์หรือขี่จักรยานยนต์หลังจากดื่มเครื่องดื่มแอลกอฮอล์หรือไม่',
                        type: 'radio',
                        options: [
                            'ไม่เคย',
                            'เคย 1 ครั้งหรือน้อยกว่าต่อเดือน',
                            'เคย 2-3 ครั้งต่อเดือน',
                            'เคย มากกว่า 3 ครั้งต่อเดือน',
                            'ไม่เคยขี่รถจักรยานยนต์, ไม่เคยขับรถยนต์'
                        ],
                        required: true
                    }
                ]
            }
        ]
    },

    // ----------------------------------------
    // Part 8: Environment (Environment)
    // ----------------------------------------
    environment: {
        title: 'สิ่งแวดล้อมและโรคอุบัติใหม่',
        type: 'environment',
        description: 'สภาพแวดล้อมและผลกระทบ',
        subsections: [
            {
                title: 'สภาพแวดล้อมในที่ทำงาน',
                questions: [
                    { id: 'env_satisfaction', text: 'ความพึงพอใจในสิ่งแวดล้อมที่ทำงาน', type: 'scale', labels: ['แย่มาก', 'แย่', 'ปานกลาง', 'ดี', 'ดีมาก'], required: true },
                    { id: 'env_glare', text: 'ท่านทำงานกลางแดดอย่างต่อเนื่อง ทำงานในที่มีแสงจ้า', type: 'radio', options: ['ใช่', 'ไม่ใช่'], required: true },
                    { id: 'env_noise', text: 'การทำงานของท่านมีเครื่องจักร หรือลักษณะการทำงานที่ก่อให้เกิดเสียงดัง หรือมีแรงสั่นสะเทือนหรือไม่', type: 'radio', options: ['ใช่', 'ไม่ใช่'], required: true },
                    { id: 'env_smell', text: 'การทำงานของท่านมีกลิ่นเหม็นของสารเคมี', type: 'radio', options: ['ใช่', 'ไม่ใช่'], required: true },
                    { id: 'env_smoke', text: 'การทำงานของท่านมีควัน ไอระเหย', type: 'radio', options: ['ใช่', 'ไม่ใช่'], required: true },
                    { id: 'env_posture', text: 'ทำงานท่านต้องนั่ง/ยืนในท่าทางเดิม ๆ หรือก้ม ๆ เงย ๆ เป็นเวลานานกว่าชั่วโมงครึ่งโดยไม่ได้พัก', type: 'radio', options: ['ใช่', 'ไม่ใช่'], required: true },
                    { id: 'env_awkward', text: 'การทำงานท่านต้องอยู่ในท่าทางที่ฝืนธรรมชาติ เช่น การยกแขนเหนือศีรษะ การยืนเขย่ง หรือไม่', type: 'radio', options: ['ใช่', 'ไม่ใช่'], required: true }
                ]
            },
            {
                title: 'มลพิษและโรคอุบัติใหม่',
                questions: [
                    { id: 'pm25_impact', text: 'ในพื้นที่ที่ท่านอยู่อาศัยในช่วง 1 ปีที่ผ่านมา มีปัญหามลพิษทางอากาศ ได้แก่ ฝุ่นพีเอ็ม 2.5 ในระดับใด', type: 'radio', options: ['ไม่มีเลย', 'น้อย', 'ปานกลาง', 'มาก', 'รุนแรงมาก'], required: true },
                    { id: 'pm25_symptom', text: 'ในช่วงที่มีปัญหามลพิษทางอากาศ ได้แก่ ฝุ่นพีเอ็ม 2.5 ดังกล่าว ท่านมีอาการเจ็บป่วยมีอาการเหล่านี้หรือไม่', type: 'checkbox', options: ['ไม่มี', 'อาการ ไอ คัดจมูก น้ำมูก แสบคอ', 'หายใจไม่เต็มอิ่ม', 'แสบตา', 'ปวดศีรษะ'], required: true },
                    { id: 'life_quality', text: 'ท่านจัดอันดับคุณภาพชีวิตของท่านโดยรวมว่าอยู่ในระดับใด', type: 'scale', labels: ['ดีมาก', 'ดี', 'ปานกลาง', 'แย่', 'แย่มาก'], required: true },
                    { id: 'emerging_known', text: 'ท่านเคยได้ยินคำว่า "โรคอุบัติใหม่" หรือไม่', type: 'radio', options: ['เคย', 'ไม่เคย'], required: true },
                    { id: 'emerging_list', text: 'โรคอุบัติใหม่ที่ท่านรู้จัก (เลือกได้หลายข้อ)', type: 'checkbox', options: ['COVID-19', 'ไข้หวัดนก', 'ไข้ซิกา', 'อื่น ๆ (ระบุ)'], required: true },
                    { id: 'climate_impact', text: 'ท่านคิดว่าการเปลี่ยนแปลงของสภาพภูมิอากาศส่งผลกระทบต่อสุขภาพของท่านหรือไม่', type: 'radio', options: ['ไม่มีเลย', 'น้อย', 'ปานกลาง', 'มาก', 'รุนแรงมาก'], required: true },
                    { id: 'covid_history', text: 'ช่วง 6 เดือนที่ผ่านมา คุณติด COVID-19 หรือไม่?', type: 'radio', options: ['ไม่เคยติด', 'ติด 1 ครั้ง', 'ติดมากกว่า 1 ครั้ง'], required: true }
                ]
            }
        ]
    }
};

// ========================================
// Form Config Overrides
// Applies admin-configured text overrides from form_configs table.
// Key format:
//   "sectionKey.title"           → SURVEY_DATA[sectionKey].title
//   "sectionKey.sub.N.title"     → SURVEY_DATA[sectionKey].subsections[N].title
//   "sectionKey.q.questionId"    → question.text for matching id in any subsection
// ========================================
function applyWellbeingFormConfig(configJson) {
    if (!configJson || typeof configJson !== 'object') return;
    Object.entries(configJson).forEach(([key, value]) => {
        if (!value || !value.trim()) return;
        const parts = key.split('.');
        const sectionKey = parts[0];
        const section = SURVEY_DATA[sectionKey];
        if (!section) return;

        if (parts.length === 2 && parts[1] === 'title') {
            // e.g. "mental.title"
            section.title = value.trim();
        } else if (parts.length === 4 && parts[1] === 'sub' && parts[3] === 'title') {
            // e.g. "mental.sub.0.title"
            const idx = parseInt(parts[2], 10);
            if (section.subsections && section.subsections[idx]) {
                section.subsections[idx].title = value.trim();
            }
        } else if (parts.length === 3 && parts[1] === 'q') {
            // e.g. "mental.q.tmhi_1"
            const qId = parts[2];
            if (section.subsections) {
                for (const sub of section.subsections) {
                    if (!sub.questions) continue;
                    const q = sub.questions.find(q => q.id === qId);
                    if (q) { q.text = value.trim(); break; }
                }
            }
        }
    });
}

if (typeof PROJECT_SSOT !== 'undefined') {
    if (typeof PROJECT_SSOT.setWellbeingSurveyData === 'function') {
        PROJECT_SSOT.setWellbeingSurveyData(SECTIONS_ORDER, SURVEY_DATA);
    } else {
        PROJECT_SSOT.wellbeing = {
            sectionsOrder: SECTIONS_ORDER,
            surveyData: SURVEY_DATA
        };
    }
}
