// Sync questions from js/questions.js to data/questions-wellbeing.json
// Run this after making changes to js/questions.js
const fs = require('fs');
const path = require('path');

function syncQuestions() {
    try {
        // Load the questions.js file
        const questionsJsPath = path.join(__dirname, 'js', 'questions.js');
        const questionsJsContent = fs.readFileSync(questionsJsPath, 'utf8');

        // Extract SURVEY_DATA (simple extraction)
        const surveyDataMatch = questionsJsContent.match(/const SURVEY_DATA = ({[\s\S]*?});/);
        if (!surveyDataMatch) {
            console.error('❌ Could not find SURVEY_DATA in questions.js');
            return false;
        }

        // Evaluate the SURVEY_DATA object
        const surveyDataCode = surveyDataMatch[1];
        const SURVEY_DATA = eval(`(${surveyDataCode})`);

        // Convert to JSON format for wb-printable
        const jsonData = {
            form_id: "wellbeing",
            form_version: "wb-v1.0",
            form_title: "แบบสำรวจสุขภาวะบุคลากร",
            form_title_en: "Individual Well-being Survey",
            dimensions: ["physical", "mental", "social", "environment"],
            sections_order: ["personal", "consumption", "nutrition", "activity", "mental", "loneliness", "safety", "environment"],
            sections: SURVEY_DATA
        };

        // Write to JSON file
        const jsonPath = path.join(__dirname, 'data', 'questions-wellbeing.json');
        fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));

        // Create a simple HTML file to clear cache
        const clearCacheHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Clear Cache</title>
    <script>
        // Clear form schema cache
        ['fschema_wellbeing', 'fschema_ch1'].forEach(key => {
            sessionStorage.removeItem(key);
        });
        
        // Also clear any app-related cache
        localStorage.clear();
        sessionStorage.clear();
        
        alert('Cache cleared! The survey will now load the latest questions.');
        window.close();
    </script>
</head>
<body>
    <h1>Clearing cache...</h1>
    <p>This window should close automatically.</p>
</body>
</html>`;
        
        fs.writeFileSync(path.join(__dirname, 'clear-cache.html'), clearCacheHtml);

        console.log('✅ Synced questions from js/questions.js to data/questions-wellbeing.json');
        console.log(`✅ Updated ${Object.keys(SURVEY_DATA).length} sections`);
        console.log('✅ wb-printable.html will now show the latest questions');
        console.log('💡 To clear browser cache, open clear-cache.html or refresh with Ctrl+F5');
        return true;
    } catch (error) {
        console.error('❌ Sync failed:', error.message);
        return false;
    }
}

// Run sync if called directly
if (require.main === module) {
    syncQuestions();
}

module.exports = { syncQuestions };
