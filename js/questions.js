// ========================================
// Survey Questions Data (Updated)
// ========================================

const SECTIONS_ORDER = ['personal', 'consumption', 'mental', 'nutrition', 'safety', 'activity', 'environment'];

const SURVEY_DATA = {
    // ----------------------------------------
    // Part 1: Personal Info & Body
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
                        options: ['ชาย', 'หญิง', 'อื่นๆ'],
                        required: true
                    },
                    { id: 'age', text: 'อายุ (ปี)', type: 'number', required: true },
                    {
                        id: 'status',
                        text: 'สถานภาพสมรสปัจจุบัน',
                        type: 'radio',
                        options: ['โสด', 'สมรส', 'หม้าย', 'หย่า/เลิก', 'อื่นๆ'],
                        required: true
                    },
                    {
                        id: 'region',
                        text: 'ภูมิภาคที่ท่านอาศัยอยู่',
                        type: 'radio',
                        options: ['กรุงเทพฯ', 'ภาคกลาง', 'ภาคเหนือ', 'ภาคตะวันออกเฉียงเหนือ', 'ภาคใต้'],
                        required: true
                    },
                    {
                        id: 'education',
                        text: 'ระดับการศึกษาสูงสุด',
                        type: 'radio',
                        options: ['มัธยมศึกษาตอนต้น หรือต่ำกว่า', 'มัธยมศึกษาตอนปลาย/ปวช.', 'ปวส./อนุปริญญา', 'ปริญญาตรีและสูงกว่า'],
                        required: true
                    },
                    {
                        id: 'religion',
                        text: 'ศาสนา',
                        type: 'radio',
                        options: ['พุทธ', 'คริสต์', 'อิสลาม', 'อื่นๆ'],
                        required: true
                    },
                    {
                        id: 'job',
                        text: 'ตำแหน่งงานปัจจุบัน',
                        type: 'radio',
                        options: ['ไม่ได้ทำงาน', 'พนักงานปฏิบัติการ', 'พนักงานสำนักงาน', 'หัวหน้าฝ่าย/แผนก', 'ผู้จัดการ / ผู้บริหาร', { label: 'อื่นๆ', value: 'other', hasInput: true }], // Simplify other input for now or just text
                        required: true
                    },
                    { id: 'job_duration', text: 'ระยะเวลาที่ทำงานในตำแหน่งปัจจุบัน (ปี)', type: 'number', required: true },
                    {
                        id: 'income',
                        text: 'รายได้เฉลี่ยต่อเดือน',
                        type: 'radio',
                        options: ['ต่ำกว่า 15,000', '15,000-25,000', '25,001-35,000', '35,001-50,000', 'มากกว่า 50,000'],
                        required: true
                    },
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
    // Part 2: Consumption (Smoke/Alcohol)
    // ----------------------------------------
    consumption: {
        title: 'การบริโภคยาสูบและแอลกอฮอล์',
        type: 'physical',
        description: 'พฤติกรรมเสี่ยงด้านสุขภาพ',
        subsections: [
            {
                title: 'ในระยะเวลา 2 เดือนที่ผ่านมา',
                questions: [
                    {
                        id: 'q2001',
                        text: 'ท่านเคยสูบบุหรี่หรือไม่',
                        type: 'radio',
                        options: ['ไม่เคยสูบ', 'สูบเป็นประจำทุกวัน', 'สูบ 2 – 3 ครั้งต่อสัปดาห์', 'สูบบางโอกาส/นานๆสูบที'],
                        required: true
                    },
                    {
                        id: 'q2002',
                        text: 'ท่านเคยสูบบุหรี่ไฟฟ้าหรือไม่',
                        type: 'radio',
                        options: ['ไม่เคยสูบ', 'สูบเป็นประจำทุกวัน', 'สูบ 2 – 3 ครั้งต่อสัปดาห์', 'สูบบางโอกาส/นานๆสูบที'],
                        required: true
                    },
                    {
                        id: 'q2003',
                        text: 'ท่านเคยดื่มสุราหรือเครื่องดื่มผสมแอลกอฮอล์หรือไม่',
                        type: 'radio',
                        options: ['ไม่เคยดื่ม', 'ดื่มเป็นประจำทุกวัน', 'ดื่ม 2 – 3 ครั้งต่อสัปดาห์', 'ดื่มบางโอกาส/นานๆดื่มที'],
                        required: true
                    },
                    {
                        id: 'q2004',
                        text: 'ท่านเคยดื่มเครื่องดื่มที่มีส่วนผสมของกัญชาหรือไม่',
                        type: 'radio',
                        options: ['ไม่เคยดื่ม', 'ดื่มเป็นประจำทุกวัน', 'ดื่ม 2 – 3 ครั้งต่อสัปดาห์', 'ดื่มบางโอกาส/นานๆดื่มที'],
                        required: true
                    },
                    {
                        id: 'q2005_drug', // Renamed from q2005 to avoid conflict
                        text: 'ท่านเคยใช้สารเสพติดอื่นๆ เช่น ยาบ้า กัญชา หรือไม่',
                        type: 'radio',
                        options: ['ไม่เคยเสพ', 'เสพเป็นประจำทุกวัน', 'เสพ 2 – 3 ครั้งต่อสัปดาห์', 'เสพบางโอกาส/นานๆเสพที'],
                        required: true
                    }
                ]
            }
        ]
    },

    // ----------------------------------------
    // Part 3: Mental Health (TMHI-15)
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
                    { id: 'tmhi_7', text: 'ท่านสามารถทำใจยอมรับได้สำหรับปัญหาที่ยากจะแก้ไข', type: 'scale', labels: ['ไม่เลย', 'เล็กน้อย', 'มาก', 'มากที่สุด'], required: true },
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
    // Part 4: Nutrition (Sweet/Fat/Salt)
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
                    { id: 'sweet_2', text: 'ดื่มน้ำอัดลม / กาแฟ 3 in 1 / กาแฟเป็น / กาแฟปั่น / เครื่องดื่มชง / น้ำหวาน / นมเปรี้ยว', type: 'radio', options: ['ทุกวัน / เกือบทุกวัน', '3-4 ครั้งต่อสัปดาห์', 'แทบไม่ทำ / ไม่ทำเลย'], required: true },
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
    // Part 5: Safety
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
                        text: 'ในช่วง 12 เดือนที่ผ่านมา ท่านเคยประสบอุบัติเหตุจราจรในลักษณะใดบ้าง (เลือกได้มากกว่า 1 ข้อ)',
                        type: 'checkbox',
                        options: ['คนขับรถยนต์', 'ผู้โดยสารรถยนต์', 'คนขี่จักรยานยนต์', 'ผู้โดยสารจักรยานยนต์', 'คนขี่จักรยาน', 'คนเดินเท้า', 'ไม่เคย'],
                        required: true
                    },
                    {
                        id: 'drunk_drive',
                        text: 'ในช่วง 12 เดือนที่ผ่านมา เคยขับขี่หลังดื่มแอลกอฮอล์หรือไม่',
                        type: 'radio',
                        options: ['ไม่เคย', 'เคย 1 ครั้ง/เดือนหรือน้อยกว่า', 'เคย 2-3 ครั้ง/เดือน', 'เคย > 3 ครั้ง/เดือน', 'ไม่เคยขับขี่'],
                        required: true
                    }
                ]
            }
        ]
    },

    // ----------------------------------------
    // Part 6: Physical Activity
    // ----------------------------------------
    activity: {
        title: 'กิจกรรมทางกาย (TPAX)',
        type: 'physical',
        description: 'การเคลื่อนไหวร่างกายในชีวิตประจำวัน',
        subsections: [
            {
                title: 'การทำงาน',
                questions: [
                    { id: 'act_work_days', text: 'กิจกรรมทางกายขณะทำงาน (วัน/สัปดาห์)', type: 'number', required: true },
                    { id: 'act_work_dur', text: 'ระยะเวลาเฉลี่ยต่อวัน', type: 'time', required: true }
                ]
            },
            {
                title: 'การเดินทาง',
                questions: [
                    { id: 'act_commute_days', text: 'เดินทางด้วยเท้า/จักรยาน (วัน/สัปดาห์)', type: 'number', required: true },
                    { id: 'act_commute_dur', text: 'ระยะเวลาเฉลี่ยต่อวัน', type: 'time', required: true }
                ]
            },
            {
                title: 'นันทนาการ/ออกกำลังกาย',
                questions: [
                    { id: 'act_rec_days', text: 'ออกกำลังกาย/นันทนาการ (วัน/สัปดาห์)', type: 'number', required: true },
                    { id: 'act_rec_dur', text: 'ระยะเวลาเฉลี่ยต่อวัน', type: 'time', required: true }
                ]
            },
            {
                title: 'พฤติกรรมเนือยนิ่ง/หน้าจอ',
                questions: [
                    { id: 'sedentary_dur', text: 'เวลานั่ง/เอนกาย (ไม่รวมนอนหลับ) ต่อวัน', type: 'time', required: true },
                    { id: 'screen_entertain', text: 'เวลาหน้าจอเพื่อความบันเทิงต่อวัน', type: 'time', required: true },
                    { id: 'screen_work', text: 'เวลาหน้าจอเพื่อการทำงานต่อวัน', type: 'time', required: true }
                ]
            }
        ]
    },

    // ----------------------------------------
    // Part 7: Environment
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
                    { id: 'env_glare', text: 'แสงจ้า/ทำงานกลางแดด', type: 'radio', options: ['ใช่ (มีผลต่อสุขภาพ)', 'ใช่ (ไม่มีผล)', 'ไม่ใช่'], required: true },
                    { id: 'env_noise', text: 'เสียงดัง/แรงสั่นสะเทือน', type: 'radio', options: ['ใช่ (มีผลต่อสุขภาพ)', 'ใช่ (ไม่มีผล)', 'ไม่ใช่'], required: true },
                    { id: 'env_smell', text: 'กลิ่นเหม็น/สารเคมี', type: 'radio', options: ['ใช่ (มีผลต่อสุขภาพ)', 'ใช่ (ไม่มีผล)', 'ไม่ใช่'], required: true },
                    { id: 'env_smoke', text: 'ควัน/ไอระเหย', type: 'radio', options: ['ใช่ (มีผลต่อสุขภาพ)', 'ใช่ (ไม่มีผล)', 'ไม่ใช่'], required: true },
                    { id: 'env_posture', text: 'ท่าทางเดิมนานๆ/ก้มเงย', type: 'radio', options: ['ใช่ (มีผลต่อสุขภาพ)', 'ใช่ (ไม่มีผล)', 'ไม่ใช่'], required: true },
                    { id: 'env_awkward', text: 'ท่าทางฝืนธรรมชาติ (ยกของ/เขย่ง)', type: 'radio', options: ['ใช่ (มีผลต่อสุขภาพ)', 'ใช่ (ไม่มีผล)', 'ไม่ใช่'], required: true }
                ]
            },
            {
                title: 'มลพิษและโรคอุบัติใหม่',
                questions: [
                    { id: 'pm25_impact', text: 'ปัญหา PM 2.5 ในพื้นที่ (1 ปีที่ผ่านมา)', type: 'radio', options: ['ไม่มีเลย', 'น้อย', 'ปานกลาง', 'มาก', 'รุนแรงมาก'], required: true },
                    { id: 'pm25_symptom', text: 'อาการเจ็บป่วยจาก PM 2.5', type: 'checkbox', options: ['ไม่มี', 'ไอ/คัดจมูก/แสบคอ', 'หายใจไม่เต็มอิ่ม', 'แสบตา', 'ปวดศีรษะ'], required: true },
                    { id: 'life_quality', text: 'คุณภาพชีวิตโดยรวม', type: 'scale', labels: ['แย่มาก', 'แย่', 'ปานกลาง', 'ดี', 'ดีมาก'], required: true },
                    { id: 'emerging_known', text: 'รู้จัก "โรคอุบัติใหม่" หรือไม่', type: 'radio', options: ['เคยได้ยิน', 'ไม่เคย'], required: true },
                    { id: 'emerging_list', text: 'โรคอุบัติใหม่ที่รู้จัก', type: 'checkbox', options: ['COVID-19', 'ไข้หวัดนก', 'ไข้ซิกา', 'อื่นๆ'], required: true },
                    { id: 'climate_impact', text: 'ผลกระทบจากโลกร้อนต่อสุขภาพ', type: 'radio', options: ['ไม่มีเลย', 'น้อย', 'ปานกลาง', 'มาก', 'รุนแรงมาก'], required: true },
                    { id: 'covid_history', text: 'ติด COVID-19 ใน 6 เดือนที่ผ่านมา', type: 'radio', options: ['ไม่เคย', '1 ครั้ง', '> 1 ครั้ง'], required: true }
                ]
            }
        ]
    }
};
