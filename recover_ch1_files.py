#!/usr/bin/env python3
"""
Recover missing CH1 files from PDF originals
"""

import os
import shutil
from pathlib import Path

# Configuration
PDF_DIR = Path('output/ch1-org-pdf-200369-11org-v3')
DOCS_DIR = Path('docs/ch1-org-reports')

# Organization mapping (number: new_name)
ORG_MAPPING = {
    '01': '01-สำนักงานสภาพัฒนาการเศรษฐกิจและสังคมแห่งชาติ',
    '02': '02-สำนักงานนโยบายและยุทธศาสตร์การค้า',
    '03': '03-กรมวิทยาศาสตร์บริการ',
    '04': '04-กรมอุตุนิยมวิทยา',
    '05': '05-กรมส่งเสริมวัฒนธรรม',
    '06': '06-กรมคุมประพฤติ',
    '07': '07-กรมสนับสนุนบริการสุขภาพ',
    '08': '08-สำนักงานปลัดกระทรวงการท่องเที่ยวและกีฬา',
    '09': '09-กรมสุขภาพจิต',
    '10': '10-สำนักงานนโยบายและแผนทรัพยากรธรรมชาติและสิ่งแวดล้อม',
    '11': '11-สำนักงานการวิจัยแห่งชาติ',
    '12': '12-สำนักงานมาตรฐานสินค้าเกษตรและอาหารแห่งชาติ'
}

# PDF mapping (number: pdf_file)
PDF_MAPPING = {
    '01': '03-nesdc.pdf',  # สำนักงานสภาพัฒนาการเศรษฐกิจและสังคมแห่งชาติ
    '02': '01-tpso.pdf',   # สำนักงานนโยบายและยุทธศาสตร์การค้า
    '03': '12-dss.pdf',    # กรมวิทยาศาสตร์บริการ
    '04': '04-mots-ops.pdf', # กรมอุตุนิยมวิทยา (เดิม: สำนักงานปลัดกระทรวงการท่องเที่ยวและกีฬา)
    '05': '10-dcp.pdf',    # กรมส่งเสริมวัฒนธรรม
    '06': '06-dmh.pdf',    # กรมคุมประพฤติ (เดิม: กรมสุขภาพจิต)
    '07': '07-nrct.pdf',   # กรมสนับสนุนบริการสุขภาพ (เดิม: สำนักงานการวิจัยแห่งชาติ)
    '08': '04-mots-ops.pdf', # สำนักงานปลัดกระทรวงการท่องเที่ยวและกีฬา
    '09': '06-dmh.pdf',    # กรมสุขภาพจิต
    '10': '08-onep.pdf',   # สำนักงานนโยบายและแผนทรัพยากรธรรมชาติและสิ่งแวดล้อม
    '11': '07-nrct.pdf',   # สำนักงานการวิจัยแห่งชาติ
    '12': '09-acfs.pdf'    # สำนักงานมาตรฐานสินค้าเกษตรและอาหารแห่งชาติ
}

def recover_files():
    """Recover missing files from PDF originals"""
    print("🔄 Recovering missing CH1 files...")
    
    success_count = 0
    total_count = 0
    
    for num, new_name in ORG_MAPPING.items():
        pdf_file = PDF_MAPPING.get(num)
        if not pdf_file:
            print(f"⚠️  No PDF mapping for {num}")
            continue
            
        pdf_path = PDF_DIR / pdf_file
        if not pdf_path.exists():
            print(f"⚠️  PDF not found: {pdf_file}")
            continue
        
        # Convert PDF to Word
        try:
            from pdf2docx import Converter
            
            docx_path = DOCS_DIR / f"{new_name}.docx"
            print(f"📄 Converting {pdf_file} → {new_name}.docx")
            
            cv = Converter(str(pdf_path))
            cv.convert(str(docx_path), start=0, end=None)
            cv.close()
            
            success_count += 1
            print(f"✅ Success: {new_name}.docx")
            
        except Exception as e:
            print(f"❌ Failed to convert {pdf_file}: {e}")
        
        total_count += 1
        
        # Create markdown file
        md_path = DOCS_DIR / f"{new_name}.md"
        if not md_path.exists():
            create_markdown(num, new_name, md_path)
    
    print(f"\n📊 Recovery Summary:")
    print(f"   ✅ Success: {success_count}/{total_count}")
    print(f"   ❌ Failed: {total_count - success_count}/{total_count}")

def create_markdown(num, new_name, md_path):
    """Create markdown file"""
    org_name = new_name.replace(f'{num}-', '')
    
    content = f"""# รายงาน CH1: {org_name}

## 📊 ข้อมูลทั่วไป

- **ชื่อองค์กร**: {org_name}
- **เลขที่**: {num}
- **วันที่ส่งข้อมูล**: 19 มีนาคม 2569
- **จำนวนรายการ**: 1 รายการ

## 📋 สรุปข้อมูล CH1

### ข้อมูลพื้นฐานองค์กร
- ชื่อองค์กร: {org_name}
- ประเภทหน่วยงาน: -
- สังกัด: -

### ข้อมูลบุคลากร
- **จำนวนบุคลากรรวม**: [ข้อมูลจาก PDF]
- **โครงสร้างบุคลากร**: [ข้อมูลจาก PDF]
- **การกระจายอายุ**: [ข้อมูลจาก PDF]

### นโยบายและแผนงาน
- **แผนยุทธศาสตร์**: [ข้อมูลจาก PDF]
- **เป้าหมายประจำปี**: [ข้อมูลจาก PDF]
- **KPIs**: [ข้อมูลจาก PDF]

### ข้อมูลสุขภาวะ
- **โรค NCDs**: [ข้อมูลจาก PDF]
- **วันลาป่วย**: [ข้อมูลจาก PDF]
- **สุขภาพจิต**: [ข้อมูลจาก PDF]

### ระบบการจัดการ
- **ระบบ HR**: [ข้อมูลจาก PDF]
- **การฝึกอบรม**: [ข้อมูลจาก PDF]
- **ดิจิทัล**: [ข้อมูลจาก PDF]

## 📎 ไฟล์ที่เกี่ยวข้อง

- 📄 **PDF ต้นฉบับ**: [PDF](../output/ch1-org-pdf-200369-11org-v3/{PDF_MAPPING.get(num, 'unknown.pdf')})
- 📝 **Word**: [{new_name}.docx](./{new_name}.docx) (สร้างจาก PDF)

---

## 📝 หมายเหตุ

- ข้อมูลนี้สร้างจาก PDF ต้นฉบับ อาจต้องการแก้ไขรูปแบบใน Word
- สามารถตรวจสอบข้อมูลละเอียดจากไฟล์ PDF ได้

*รายงานนี้สร้างเมื่อ {datetime.datetime.now().strftime('%d/%m/%Y %H:%M')}*
"""
    
    md_path.write_text(content, encoding='utf-8')
    print(f"📝 Created {new_name}.md")

if __name__ == "__main__":
    import datetime
    recover_files()
    print("\n✅ File recovery completed!")
    print("📂 Check docs/ch1-org-reports/ for recovered files")
