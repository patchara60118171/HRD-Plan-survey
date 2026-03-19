// Generate Test PDF Files for Upload Testing
const fs = require('fs');
const path = require('path');

// Simple PDF generator (creates minimal valid PDF)
function generateMinimalPDF(content, filename) {
    const pdf = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
/MediaBox [0 0 595 842]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 100
>>
stream
BT
/F1 12 Tf
50 800 Td
(${content}) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000315 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
417
%%EOF`;

    const dir = path.join(__dirname, '..', 'test-pdfs');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const filePath = path.join(dir, filename);
    fs.writeFileSync(filePath, pdf);
    console.log(`✓ Created: ${filename} (${Buffer.from(pdf).length} bytes)`);
    return filePath;
}

// Generate 3 types of PDFs
console.log('Generating test PDF files...\n');

const pdfFiles = {
    strategy: generateMinimalPDF('Strategic Plan Document - Test Data', 'test-strategy.pdf'),
    orgStructure: generateMinimalPDF('Organization Structure - Test Data', 'test-org-structure.pdf'),
    hrdPlan: generateMinimalPDF('HRD Plan Document - Test Data', 'test-hrd-plan.pdf')
};

console.log('\n✅ All PDF files generated successfully!');
console.log('Location:', path.join(__dirname, '..', 'test-pdfs'));

module.exports = pdfFiles;
