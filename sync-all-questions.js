// Comprehensive sync system for all question files
// Syncs from main js/questions.js to all other locations
const fs = require('fs');
const path = require('path');

function syncAllQuestions() {
    console.log('🔄 Starting comprehensive questions sync...\n');
    
    try {
        // 1. Load the main source of truth
        const mainQuestionsPath = path.join(__dirname, 'js', 'questions.js');
        const mainQuestionsContent = fs.readFileSync(mainQuestionsPath, 'utf8');
        
        // Extract SURVEY_DATA
        const surveyDataMatch = mainQuestionsContent.match(/const SURVEY_DATA = ({[\s\S]*?});/);
        if (!surveyDataMatch) {
            console.error('❌ Could not find SURVEY_DATA in main questions.js');
            return false;
        }
        
        // 2. Sync to wb-printable JSON
        console.log('📄 Syncing to wb-printable JSON...');
        const SURVEY_DATA = eval('(' + surveyDataMatch[1] + ')');
        const jsonData = {
            form_id: "wellbeing",
            form_version: "wb-v1.0",
            form_title: "แบบสำรวจสุขภาวะบุคลากร",
            form_title_en: "Individual Well-being Survey",
            dimensions: ["physical", "mental", "social", "environment"],
            sections_order: ["personal", "consumption", "nutrition", "activity", "mental", "loneliness", "safety", "environment"],
            sections: SURVEY_DATA
        };
        
        const jsonPath = path.join(__dirname, 'data', 'questions-wellbeing.json');
        fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));
        console.log('✅ Updated data/questions-wellbeing.json');
        
        // 3. Skip apps/public-survey sync (deleted)
        console.log('⚠️  Skipping apps/public-survey sync - folder deleted');
        
        // 4. Create cache clearing HTML
        console.log('🧹 Creating cache clearer...');
        const clearCacheHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Clear All Question Caches</title>
    <script>
        // Clear form schema cache
        ['fschema_wellbeing', 'fschema_ch1'].forEach(key => {
            sessionStorage.removeItem(key);
        });
        
        // Clear any app-related cache
        localStorage.clear();
        sessionStorage.clear();
        
        // Clear service worker cache if exists
        if ('caches' in window) {
            caches.keys().then(cacheNames => {
                return Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
            });
        }
        
        alert('✅ All question caches cleared!\\n\\nThe survey will now load the latest questions from all sources.');
        window.close();
    </script>
</head>
<body>
    <h1>🧹 Clearing All Question Caches...</h1>
    <p>This window should close automatically.</p>
    <p>If not, please refresh all survey pages manually.</p>
</body>
</html>`;
        
        fs.writeFileSync(path.join(__dirname, 'clear-all-caches.html'), clearCacheHtml);
        
        // 5. Create sync report
        console.log('📊 Creating sync report...');
        const report = {
            timestamp: new Date().toISOString(),
            synced_files: [
                'data/questions-wellbeing.json'
            ],
            sections_updated: Object.keys(SURVEY_DATA).length,
            total_questions: Object.values(SURVEY_DATA).reduce((total, section) => {
                return total + (section.subsections || []).reduce((subTotal, sub) => {
                    return subTotal + (sub.questions || []).length;
                }, 0);
            }, 0)
        };
        
        fs.writeFileSync(path.join(__dirname, 'sync-report.json'), JSON.stringify(report, null, 2));
        
        console.log('\n🎉 Sync completed successfully!');
        console.log('📊 Updated ' + report.sections_updated + ' sections with ' + report.total_questions + ' total questions');
        console.log('📄 Files updated:');
        report.synced_files.forEach(file => console.log('   - ' + file));
        console.log('\n💡 To clear browser cache, open clear-all-caches.html');
        console.log('💡 Or refresh all survey pages with Ctrl+F5');
        
        return true;
        
    } catch (error) {
        console.error('❌ Sync failed:', error.message);
        return false;
    }
}

// Run sync if called directly
if (require.main === module) {
    syncAllQuestions();
}

module.exports = { syncAllQuestions };
