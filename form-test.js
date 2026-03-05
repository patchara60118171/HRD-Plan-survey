// Simple test to check form submission
console.log('Form test script loaded');

// Test function to verify data collection
window.testFormCollection = function() {
    console.log('Testing form data collection...');
    
    // Check if collectAllData function exists
    if (typeof collectAllData === 'function') {
        const data = collectAllData();
        console.log('Collected data:', data);
        
        // Check key fields
        console.log('Form version:', data.form_version);
        console.log('Organization:', data.organization);
        console.log('Ranking 1:', data.strategic_priority_rank1);
        console.log('Ranking 2:', data.strategic_priority_rank2);
        console.log('Ranking 3:', data.strategic_priority_rank3);
        console.log('Intervention feedback:', data.intervention_packages_feedback);
        
        // Check staff types
        console.log('Type official:', data.type_official);
        console.log('Type employee:', data.type_employee);
        
        return data;
    } else {
        console.error('collectAllData function not found');
        return null;
    }
};

// Test database connection
window.testDatabaseConnection = async function() {
    console.log('Testing database connection...');
    
    try {
        const { data, error } = await window.supabase
            .from('hrd_ch1_responses')
            .select('id, form_version, organization')
            .limit(1);
            
        if (error) {
            console.error('Database error:', error);
            return false;
        }
        
        console.log('Database connection successful');
        console.log('Sample data:', data);
        return true;
    } catch (e) {
        console.error('Connection test failed:', e);
        return false;
    }
};

// Auto-run tests when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            console.log('Running auto-tests...');
            window.testFormCollection();
            window.testDatabaseConnection();
        }, 2000);
    });
} else {
    setTimeout(() => {
        console.log('Running auto-tests...');
        window.testFormCollection();
        window.testDatabaseConnection();
    }, 2000);
}
