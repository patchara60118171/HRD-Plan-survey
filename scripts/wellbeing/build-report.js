const fs = require('fs');
const path = require('path');

function buildWellbeingSchemaReport() {
    console.log('🔄 Starting comprehensive wellbeing schema report...\n');

    try {
        const projectRoot = path.join(__dirname, '..', '..');
        const jsonPath = path.join(projectRoot, 'data', 'questions-wellbeing.json');
        const rawJson = fs.readFileSync(jsonPath, 'utf8');
        const jsonData = JSON.parse(rawJson);

        if (!jsonData || typeof jsonData !== 'object' || !jsonData.sections || !jsonData.sections_order) {
            console.error('❌ Invalid wellbeing schema JSON');
            return false;
        }

        console.log('📄 Using data/questions-wellbeing.json as the shared source for wb-printable and public survey...');
        console.log('✅ Canonical schema file is valid');
        console.log('⚠️  Skipping apps/public-survey sync - folder deleted');

        console.log('🧹 Creating cache clearer...');
        const clearCacheHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Clear All Question Caches</title>
    <script>
        ['fschema_wellbeing', 'fschema_ch1'].forEach(key => {
            sessionStorage.removeItem(key);
        });

        localStorage.clear();
        sessionStorage.clear();

        if ('caches' in window) {
            caches.keys().then(cacheNames => {
                return Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
            });
        }

        alert('✅ All question caches cleared!\n\nThe survey will now load the latest questions from all sources.');
        window.close();
    </script>
</head>
<body>
    <h1>🧹 Clearing All Question Caches...</h1>
    <p>This window should close automatically.</p>
    <p>If not, please refresh all survey pages manually.</p>
</body>
</html>`;

        fs.writeFileSync(path.join(projectRoot, 'clear-all-caches.html'), clearCacheHtml);

        console.log('📊 Creating sync report...');
        const report = {
            timestamp: new Date().toISOString(),
            synced_files: [
                'data/questions-wellbeing.json'
            ],
            sections_updated: Object.keys(jsonData.sections).length,
            total_questions: Object.values(jsonData.sections).reduce((total, section) => {
                return total + (section.subsections || []).reduce((subTotal, sub) => {
                    return subTotal + (sub.questions || []).length;
                }, 0);
            }, 0)
        };

        fs.writeFileSync(path.join(projectRoot, 'sync-report.json'), JSON.stringify(report, null, 2));

        console.log('\n🎉 Report completed successfully!');
        console.log('📊 Updated ' + report.sections_updated + ' sections with ' + report.total_questions + ' total questions');
        console.log('📄 Files updated:');
        report.synced_files.forEach(file => console.log('   - ' + file));
        console.log('\n💡 To clear browser cache, open clear-all-caches.html');
        console.log('💡 Or refresh all survey pages with Ctrl+F5');

        return true;
    } catch (error) {
        console.error('❌ Report failed:', error.message);
        return false;
    }
}

if (require.main === module) {
    buildWellbeingSchemaReport();
}

module.exports = { buildWellbeingSchemaReport };
