import csv
import re

def translate_status(en_text):
    text = en_text.lower()
    
    if text.startswith('feat'):
        prefix = 'เพิ่มความสามารถ: '
        content = text.split(':', 1)[1].strip() if ':' in text else text[4:].strip()
    elif text.startswith('fix'):
        prefix = 'แก้ไขปัญหา: '
        content = text.split(':', 1)[1].strip() if ':' in text else text[3:].strip()
    elif text.startswith('chore'):
        prefix = 'จัดการระบบหลังบ้าน: '
        content = text.split(':', 1)[1].strip() if ':' in text else text[5:].strip()
    elif text.startswith('docs'):
        prefix = 'อัปเดตเอกสาร: '
        content = text.split(':', 1)[1].strip() if ':' in text else text[4:].strip()
    elif text.startswith('refactor'):
        prefix = 'ปรับปรุงโครงสร้างระบบ: '
        content = text.split(':', 1)[1].strip() if ':' in text else text[8:].strip()
    elif text.startswith('security'):
        prefix = 'ความปลอดภัย: '
        content = text.split(':', 1)[1].strip() if ':' in text else text[8:].strip()
    elif 'merge' in text:
        return 'รวมชุดคำสั่งและอัปเดตโค้ดของระบบเข้าด้วยกันเป็นเวอร์ชันล่าสุด'
    elif 'clean up' in text or 'cleanup' in text:
        return 'จัดระเบียบไฟล์และลบไฟล์ขยะในระบบเพื่อให้เว็บทำงานเร็วขึ้น'
    elif 'trigger' in text and 'deploy' in text:
        return 'อัปเดตระบบบนเซิร์ฟเวอร์เพื่อให้ผู้ใช้งานเข้าถึงเวอร์ชันล่าสุด'
    elif 'update project with latest' in text:
        return 'อัปเดตระบบให้เป็นข้อมูลล่าสุด'
    elif 'initial plan' in text:
        return 'จุดเริ่มต้นโครงสร้างระบบ'
    else:
        prefix = 'อัปเดตระบบ: '
        content = text
        
    replacements = {
        'google sheets data collection': 'ระบบบันทึกข้อมูลแบบสอบถามลงตาราง Google Sheets',
        'history view': 'หน้าดูประวัติข้อมูล',
        'enforce login check': 'บังคับตรวจสอบสถานะการเข้าสู่ระบบแบบปลอดภัย',
        'add admin dashboard': 'เพิ่มหน้าแดชบอร์ดสรุปสถิติสำหรับผู้ดูแลระบบ',
        'loneliness scale survey': 'แบบสำรวจสุขภาพและสังคม (UCLA Loneliness)',
        'tmhi-15 scoring': 'ระบบคำนวณคะแนนประเมินสุขภาพจิต TMHI-15',
        'progress bar': 'แถบแสดงความคืบหน้าการตอบแบบสอบถาม',
        'draft sync': 'ระบบบันทึกข้อมูลร่างอัตโนมัติกันข้อมูลผู้ใช้หาย',
        'time input': 'ช่องกรอกเวลา',
        'offline fallback': 'ระบบรองรับการทําแบบสำรวจต่อตอนอินเทอร์เน็ตใช้งานไม่ได้',
        'hrd ch1': 'แบบฟอร์มรายงาน CH1 สำหรับองค์กร',
        'landing page': 'หน้าแรกก่อนเข้าทำแบบสำรวจ',
        'ci/cd': 'ระบบอัปเดตเวอร์ชันบนเซิร์ฟเวอร์แบบอัตโนมัติ',
        'smart spreadsheet': 'ระบบตารางวิเคราะห์ฐานข้อมูลแบบ NocoDB',
        'printable form': 'หน้าจอแบบฟอร์มที่รองรับการปรินต์ออกมาเป็น PDF',
        'turnover rate': 'ระบบคำนวณอัตราการลาออกและโอนย้ายของบุคลากรรายปี',
        'ranking system': 'ระบบการคลิกจัดอันดับจุดเน้นสำคัญในการพัฒนา',
        'interactive': 'โต้ตอบได้',
        'pdf upload': 'ปุ่มอัปโหลดและแนบไฟล์เอกสาร PDF รองรับ 1MB',
        'centralized question management': 'คลังระบบจัดการคำถามทั้งหมดแบบรวมศูนย์',
        'rls': 'ระบบล็อกความเป็นส่วนตัว (Row Level Security) กันข้อมูลข้ามองค์กร',
        'anti-replay': 'การป้องกันระบบจากการโจมตีด้วยการส่งข้อมูลซ้ำแป้น',
        'edge function': 'ฟังก์ชั่นความปลอดภัยระดับสูงทำงานบนคลาวด์',
        'org-portal': 'พอร์ทัลทางเข้าเฉพาะละองค์กรและหน่วยงาน',
        'google sign-in': 'ระบบลงชื่อเข้าใช้งานที่เชื่อถือได้ผ่านบัญชี Google',
        'ios': 'อุปกรณ์ตระกูล Apple (iPhone/iPad)',
        'safari': 'เซิร์ฟเวอร์บนเบราว์เซอร์ Safari',
        'excel export': 'ปุ่มดาวน์โหลดข้อมูลทั้งหมดออกมาตราง Excel (CSV)',
        'export': 'การดาวน์โหลดไฟล์รายงาน',
        'chart.js': 'การแสดงผลตารางกราฟและแผนภูมิข้อมูลภาพรวม',
        'supabase': 'ระบบโครงสร้างฐานข้อมูลความปลอดภัย',
        'database': 'ฐานข้อมูลระบบผู้ตอบทั้งหมด',
        'responsive': 'รองรับการแสดงผลทุกหน้าจอมือถือและไอแพด',
        'ui': 'หน้าการแสดงผล',
        'bug': 'ข้อบกพร่องเล็กน้อย',
        'css': 'การตกแต่งสีสันเว็บไซต์',
    }
    
    for en_word, th_word in replacements.items():
        if en_word in content.lower():
            # simple replace ignoring case
            pattern = re.compile(re.escape(en_word), re.IGNORECASE)
            content = pattern.sub(th_word, content)
            
    return prefix + content

input_file = 'Roadmap การพัฒนาโปรเจค.csv'

with open(input_file, encoding='utf-8') as f:
    reader = csv.reader(f)
    header = next(reader)
    rows = list(reader)

for row in rows:
    en_desc = row[2]
    thai_desc = translate_status(en_desc)
    row[3] = thai_desc
    
with open(input_file, mode='w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f, quoting=csv.QUOTE_ALL)
    writer.writerow(header)
    writer.writerows(rows)

print('Successfully translated CSV rows')
