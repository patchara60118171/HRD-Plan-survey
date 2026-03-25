// Watch for changes in js/questions.js and auto-sync to data/questions-wellbeing.json
const fs = require('fs');
const path = require('path');

const { syncQuestions } = require('./sync-questions.js');

function watchQuestions() {
    const questionsPath = path.join(__dirname, 'js', 'questions.js');
    
    console.log('👀 Watching js/questions.js for changes...');
    console.log('📝 Any changes will be automatically synced to data/questions-wellbeing.json');
    console.log('🔄 Press Ctrl+C to stop watching\n');
    
    // Initial sync
    console.log('🚀 Initial sync...');
    syncQuestions();
    
    // Watch for changes
    fs.watchFile(questionsPath, (curr, prev) => {
        if (curr.mtime > prev.mtime) {
            console.log('\n📝 Detected changes to js/questions.js');
            console.log('🔄 Syncing to data/questions-wellbeing.json...');
            
            if (syncQuestions()) {
                console.log('✅ Sync completed! wb-printable.html is now up to date.\n');
            } else {
                console.log('❌ Sync failed! Please check the error above.\n');
            }
        }
    });
}

// Run watcher if called directly
if (require.main === module) {
    watchQuestions();
}

module.exports = { watchQuestions };
