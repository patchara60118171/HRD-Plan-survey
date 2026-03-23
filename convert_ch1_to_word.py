#!/usr/bin/env python3
"""
Convert CH1 PDFs to Word documents
Requires: pip install pdf2docx python-docx
"""

import os
import sys
from pathlib import Path
from pdf2docx import Converter

# Configuration
PDF_DIR = Path('output/ch1-org-pdf-200369-11org-v3')
WORD_DIR = Path('docs/ch1-org-reports')
PDF_FILES = [
    '01-tpso.pdf',
    '02-dcy.pdf', 
    '03-nesdc.pdf',
    '04-mots-ops.pdf',
    '05-opdc.pdf',
    '06-dmh.pdf',
    '07-nrct.pdf',
    '08-onep.pdf',
    '09-acfs.pdf',
    '10-dcp.pdf',
    '11-test-org.pdf',
    '12-dss.pdf'
]

def convert_pdf_to_word(pdf_path, word_path):
    """Convert single PDF to Word document"""
    try:
        cv = Converter(str(pdf_path))
        cv.convert(str(word_path), start=0, end=None)
        cv.close()
        return True
    except Exception as e:
        print(f"❌ Error converting {pdf_path}: {e}")
        return False

def main():
    """Main conversion process"""
    print("🔄 Converting CH1 PDFs to Word documents...")
    
    # Ensure output directory exists
    WORD_DIR.mkdir(exist_ok=True)
    
    success_count = 0
    total_count = len(PDF_FILES)
    
    for pdf_file in PDF_FILES:
        pdf_path = PDF_DIR / pdf_file
        word_file = pdf_file.replace('.pdf', '.docx')
        word_path = WORD_DIR / word_file
        
        if not pdf_path.exists():
            print(f"⚠️  PDF not found: {pdf_path}")
            continue
            
        print(f"📄 Converting {pdf_file} → {word_file}")
        
        if convert_pdf_to_word(pdf_path, word_path):
            print(f"✅ Success: {word_file}")
            success_count += 1
        else:
            print(f"❌ Failed: {word_file}")
    
    print(f"\n📊 Conversion Summary:")
    print(f"   ✅ Success: {success_count}/{total_count}")
    print(f"   ❌ Failed: {total_count - success_count}/{total_count}")
    
    if success_count > 0:
        print(f"\n📁 Word files saved to: {WORD_DIR}")
        print(f"📂 Files created:")
        for pdf_file in PDF_FILES:
            word_file = pdf_file.replace('.pdf', '.docx')
            word_path = WORD_DIR / word_file
            if word_path.exists():
                size = word_path.stat().st_size / 1024  # KB
                print(f"   📝 {word_file} ({size:.1f} KB)")

if __name__ == "__main__":
    # Check dependencies
    try:
        import pdf2docx
    except ImportError:
        print("❌ pdf2docx not installed. Run:")
        print("   pip install pdf2docx")
        sys.exit(1)
    
    main()
