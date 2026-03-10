// ========================================
// Admin Dashboard Core Functions
// ========================================

// Split from admin.html for better performance
class AdminDashboard {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.dataCache = new Map();
        this.charts = new Map();
    }

    // Authentication
    async authenticate(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;
            
            this.isAuthenticated = true;
            this.currentUser = data.user;
            return true;
        } catch (error) {
            console.error('Authentication failed:', error);
            return false;
        }
    }

    // Data Management
    async loadSurveyData() {
        try {
            const { data, error } = await supabase
                .from('hrd_ch1_responses')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            this.dataCache.set('surveyData', data);
            return data;
        } catch (error) {
            console.error('Failed to load survey data:', error);
            return [];
        }
    }

    // Chart Management
    createChart(canvasId, type, data, options = {}) {
        const ctx = document.getElementById(canvasId)?.getContext('2d');
        if (!ctx) return null;

        const chart = new Chart(ctx, {
            type: type,
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                ...options
            }
        });

        this.charts.set(canvasId, chart);
        return chart;
    }

    // Export Functions
    exportToExcel(data, filename) {
        if (typeof XLSX === 'undefined') {
            console.error('XLSX library not loaded');
            return;
        }

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Survey Data');
        XLSX.writeFile(wb, filename);
    }

    exportToPDF(data, filename) {
        if (typeof jspdf === 'undefined') {
            console.error('PDF library not loaded');
            return;
        }

        const doc = new jspdf.jsPDF();
        doc.text('Well-being Survey Report', 20, 20);
        
        // Add data to PDF
        let yPosition = 40;
        data.forEach(item => {
            doc.text(`${item.organization}: ${item.submitted_at}`, 20, yPosition);
            yPosition += 10;
        });

        doc.save(filename);
    }

    // Cleanup
    destroy() {
        this.charts.forEach(chart => chart.destroy());
        this.charts.clear();
        this.dataCache.clear();
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminDashboard;
}
