const fs = require('fs');
const path = require('path');

const { validateWellbeingSchema } = require('./validate-schema.js');

function watchWellbeingSchema() {
    const projectRoot = path.join(__dirname, '..', '..');
    const questionsPath = path.join(projectRoot, 'data', 'questions-wellbeing.json');

    console.log('👀 Watching data/questions-wellbeing.json for changes...');
    console.log('📝 Any changes will be automatically validated and cache helpers refreshed');
    console.log('🔄 Press Ctrl+C to stop watching\n');

    console.log('🚀 Initial validation...');
    validateWellbeingSchema();

    fs.watchFile(questionsPath, (curr, prev) => {
        if (curr.mtime > prev.mtime) {
            console.log('\n📝 Detected changes to data/questions-wellbeing.json');
            console.log('🔄 Validating canonical schema and refreshing cache helpers...');

            if (validateWellbeingSchema()) {
                console.log('✅ Validation completed! Public survey and wb-printable remain aligned.\n');
            } else {
                console.log('❌ Validation failed! Please check the error above.\n');
            }
        }
    });
}

if (require.main === module) {
    watchWellbeingSchema();
}

module.exports = { watchWellbeingSchema };
