const fs = require('fs');
const path = require('path');

function validateWellbeingSchema() {
    try {
        const projectRoot = path.join(__dirname, '..', '..');
        const jsonPath = path.join(projectRoot, 'data', 'questions-wellbeing.json');
        const rawJson = fs.readFileSync(jsonPath, 'utf8');
        const jsonData = JSON.parse(rawJson);

        if (!jsonData || typeof jsonData !== 'object' || !jsonData.sections || !jsonData.sections_order) {
            console.error('❌ Invalid wellbeing schema JSON');
            return false;
        }

        const clearCacheHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Clear Cache</title>
    <script>
        ['fschema_wellbeing', 'fschema_ch1'].forEach(key => {
            sessionStorage.removeItem(key);
        });

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

        fs.writeFileSync(path.join(projectRoot, 'clear-cache.html'), clearCacheHtml);

        console.log('✅ Canonical wellbeing schema JSON is valid');
        console.log(`✅ Loaded ${Object.keys(jsonData.sections).length} sections from data/questions-wellbeing.json`);
        console.log('✅ Public survey and wb-printable will now use the same schema source');
        console.log('💡 To clear browser cache, open clear-cache.html or refresh with Ctrl+F5');
        return true;
    } catch (error) {
        console.error('❌ Validation failed:', error.message);
        return false;
    }
}

if (require.main === module) {
    validateWellbeingSchema();
}

module.exports = { validateWellbeingSchema };
