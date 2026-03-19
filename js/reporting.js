// ========================================
// Advanced Reporting Dashboard
// ========================================

class ReportingDashboard {
    constructor() {
        this.data = null;
        this.filters = {
            dateRange: 'all',
            department: 'all',
            gender: 'all',
            ageGroup: 'all'
        };
        this.charts = {};
    }

    async init() {
        try {
            await this.loadData();
            this.renderDashboard();
            this.setupEventListeners();
        } catch (error) {
            console.error('Failed to initialize reporting dashboard:', error);
            this.showError(i18n.t('errors.load_failed'));
        }
    }

    async loadData() {
        // Load data from Supabase or local storage
        if (window.supabaseClient) {
            const { data, error } = await supabaseClient
                .from('survey_responses')
                .select('*')
                .eq('is_draft', false)
                .order('submitted_at', { ascending: false });
            
            if (error) throw error;
            this.data = data;
        } else {
            // Fallback to local storage for demo
            this.data = this.getMockData();
        }
    }

    getMockData() {
        // Generate mock data for demonstration
        const mockData = [];
        for (let i = 0; i < 100; i++) {
            mockData.push({
                id: i + 1,
                email: `user${i + 1}@example.com`,
                name: `User ${i + 1}`,
                gender: ['ชาย', 'หญิง', 'LGBTQ+'][Math.floor(Math.random() * 3)],
                age: Math.floor(Math.random() * 40) + 20,
                org_type: ['นโยบาย', 'ปฏิบัติการ', 'สนับสนุน'][Math.floor(Math.random() * 3)],
                bmi: Math.random() * 15 + 15,
                tmhi_score: Math.floor(Math.random() * 60) + 20,
                submitted_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
            });
        }
        return mockData;
    }

    renderDashboard() {
        const container = document.getElementById('main-content');
        if (!container) return;

        container.innerHTML = `
            <div class="dashboard-container">
                <div class="dashboard-header">
                    <div>
                        <h1 class="dashboard-title" data-i18n="reporting.title">รายงานข้อมูลสำรวจ</h1>
                        <p class="text-secondary">${i18n.t('reporting.overview')} - ${this.data.length} ${i18n.t('reporting.total_responses')}</p>
                    </div>
                    <div class="dashboard-controls">
                        <select class="form-input" id="date-filter" onchange="reportingDashboard.filterData()">
                            <option value="all">${i18n.t('reporting.date_range')}: ${i18n.t('common.all')}</option>
                            <option value="7days">7 ${i18n.t('common.days')}</option>
                            <option value="30days">30 ${i18n.t('common.days')}</option>
                            <option value="90days">90 ${i18n.t('common.days')}</option>
                        </select>
                        <button class="btn btn-primary" onclick="reportingDashboard.exportReport()">
                            <span class="btn-icon">📊</span> ${i18n.t('reporting.export_report')}
                        </button>
                    </div>
                </div>

                <div class="dashboard-grid">
                    ${this.renderStatCards()}
                </div>

                <div class="chart-container">
                    <div class="chart-header">
                        <h3 class="chart-title" data-i18n="reporting.demographics">ข้อมูลประชากร</h3>
                        <select class="form-input" onchange="reportingDashboard.updateDemographicsChart(this.value)">
                            <option value="gender">${i18n.t('common.gender')}</option>
                            <option value="ageGroup">${i18n.t('common.age')} Group</option>
                            <option value="org_type">Organization Type</option>
                        </select>
                    </div>
                    <div class="chart-wrapper">
                        <canvas id="demographics-chart"></canvas>
                    </div>
                </div>

                <div class="dashboard-grid">
                    <div class="chart-container">
                        <div class="chart-header">
                            <h3 class="chart-title" data-i18n="reporting.health_metrics">ตัวชี้วัดสุขภาพ</h3>
                        </div>
                        <div class="chart-wrapper">
                            <canvas id="bmi-chart"></canvas>
                        </div>
                    </div>
                    <div class="chart-container">
                        <div class="chart-header">
                            <h3 class="chart-title">TMHI Score Distribution</h3>
                        </div>
                        <div class="chart-wrapper">
                            <canvas id="tmhi-chart"></canvas>
                        </div>
                    </div>
                </div>

                <div class="chart-container">
                    <div class="chart-header">
                        <h3 class="chart-title" data-i18n="reporting.trends">แนวโน้มการตอบแบบสำรวจ</h3>
                    </div>
                    <div class="chart-wrapper">
                        <canvas id="trends-chart"></canvas>
                    </div>
                </div>
            </div>
        `;

        // Apply translations
        i18n.translateDOM();

        // Initialize charts
        this.initializeCharts();
    }

    renderStatCards() {
        const stats = this.calculateStats();
        
        return `
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-title" data-i18n="reporting.total_responses">จำนวนผู้ตอบทั้งหมด</span>
                    <span style="color: var(--color-physical);">👥</span>
                </div>
                <div class="stat-card-value">${stats.totalResponses}</div>
                <div class="stat-card-change positive">+${stats.newResponses} ${i18n.t('common.this_week')}</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-title" data-i18n="reporting.completion_rate">อัตราการตอบแบบสำรวจ</span>
                    <span style="color: var(--color-mental);">📈</span>
                </div>
                <div class="stat-card-value">${stats.completionRate}%</div>
                <div class="stat-card-change positive">+${stats.completionChange}%</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-title" data-i18n="reporting.average_score">คะแนนเฉลี่ย</span>
                    <span style="color: var(--color-social);">⭐</span>
                </div>
                <div class="stat-card-value">${stats.averageTMHI}</div>
                <div class="stat-card-change positive">+${stats.tmhiChange}</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-title">Average BMI</span>
                    <span style="color: var(--color-environment);">⚖️</span>
                </div>
                <div class="stat-card-value">${stats.averageBMI}</div>
                <div class="stat-card-change negative">-${stats.bmiChange}</div>
            </div>
        `;
    }

    calculateStats() {
        const totalResponses = this.data.length;
        const completionRate = 85; // Mock calculation
        const averageTMHI = this.data.reduce((sum, item) => sum + (item.tmhi_score || 0), 0) / totalResponses;
        const averageBMI = (this.data.reduce((sum, item) => sum + (item.bmi || 0), 0) / totalResponses).toFixed(1);

        return {
            totalResponses,
            completionRate,
            averageTMHI: averageTMHI.toFixed(1),
            averageBMI,
            newResponses: Math.floor(Math.random() * 20) + 5,
            completionChange: (Math.random() * 5).toFixed(1),
            tmhiChange: (Math.random() * 3).toFixed(1),
            bmiChange: (Math.random() * 2).toFixed(1)
        };
    }

    initializeCharts() {
        this.renderDemographicsChart();
        this.renderBMIChart();
        this.renderTMHIChart();
        this.renderTrendsChart();
    }

    renderDemographicsChart(filter = 'gender') {
        const canvas = document.getElementById('demographics-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const data = this.getDemographicsData(filter);

        // Simple canvas drawing (without external chart library)
        this.drawBarChart(ctx, data);
    }

    getDemographicsData(filter) {
        const counts = {};
        
        this.data.forEach(item => {
            let key;
            switch (filter) {
                case 'gender':
                    key = item.gender || 'Unknown';
                    break;
                case 'ageGroup':
                    const age = item.age || 0;
                    if (age < 30) key = '20-29';
                    else if (age < 40) key = '30-39';
                    else if (age < 50) key = '40-49';
                    else key = '50+';
                    break;
                case 'org_type':
                    key = item.org_type || 'Unknown';
                    break;
                default:
                    key = 'Unknown';
            }
            counts[key] = (counts[key] || 0) + 1;
        });

        return {
            labels: Object.keys(counts),
            values: Object.values(counts)
        };
    }

    drawBarChart(ctx, data) {
        const canvas = ctx.canvas;
        const width = canvas.width = canvas.offsetWidth;
        const height = canvas.height = canvas.offsetHeight;
        
        ctx.clearRect(0, 0, width, height);
        
        const padding = 40;
        const barWidth = (width - padding * 2) / data.labels.length;
        const maxValue = Math.max(...data.values);
        const scale = (height - padding * 2) / maxValue;

        // Draw bars
        data.values.forEach((value, index) => {
            const barHeight = value * scale;
            const x = padding + index * barWidth + barWidth * 0.1;
            const y = height - padding - barHeight;
            
            // Draw bar
            ctx.fillStyle = `hsl(${index * 60}, 70%, 50%)`;
            ctx.fillRect(x, y, barWidth * 0.8, barHeight);
            
            // Draw label
            ctx.fillStyle = '#333';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(data.labels[index], x + barWidth * 0.4, height - 20);
            
            // Draw value
            ctx.fillText(value.toString(), x + barWidth * 0.4, y - 5);
        });
    }

    renderBMIChart() {
        const canvas = document.getElementById('bmi-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const distribution = this.getBMIDistribution();
        
        this.drawPieChart(ctx, distribution);
    }

    getBMIDistribution() {
        const categories = {
            'Underweight': 0,
            'Normal': 0,
            'Overweight': 0,
            'Obese': 0
        };

        this.data.forEach(item => {
            const bmi = item.bmi || 0;
            if (bmi < 18.5) categories['Underweight']++;
            else if (bmi < 25) categories['Normal']++;
            else if (bmi < 30) categories['Overweight']++;
            else categories['Obese']++;
        });

        return {
            labels: Object.keys(categories),
            values: Object.values(categories),
            colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']
        };
    }

    drawPieChart(ctx, data) {
        const canvas = ctx.canvas;
        const width = canvas.width = canvas.offsetWidth;
        const height = canvas.height = canvas.offsetHeight;
        
        ctx.clearRect(0, 0, width, height);
        
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 3;
        
        const total = data.values.reduce((sum, val) => sum + val, 0);
        let currentAngle = -Math.PI / 2;

        data.values.forEach((value, index) => {
            const sliceAngle = (value / total) * 2 * Math.PI;
            
            // Draw slice
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.lineTo(centerX, centerY);
            ctx.fillStyle = data.colors[index];
            ctx.fill();
            
            // Draw label
            const labelAngle = currentAngle + sliceAngle / 2;
            const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
            const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
            
            ctx.fillStyle = 'white';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`${data.labels[index]}`, labelX, labelY);
            ctx.fillText(`${((value / total) * 100).toFixed(1)}%`, labelX, labelY + 15);
            
            currentAngle += sliceAngle;
        });
    }

    renderTMHIChart() {
        const canvas = document.getElementById('tmhi-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const distribution = this.getTMHIDistribution();
        
        this.drawBarChart(ctx, distribution);
    }

    getTMHIDistribution() {
        const ranges = {
            '20-30': 0,
            '31-40': 0,
            '41-50': 0,
            '51-60': 0,
            '61-70': 0,
            '71-80': 0
        };

        this.data.forEach(item => {
            const score = item.tmhi_score || 0;
            const range = Math.floor(score / 10) * 10;
            const key = `${range}-${range + 9}`;
            if (ranges[key] !== undefined) {
                ranges[key]++;
            }
        });

        return {
            labels: Object.keys(ranges),
            values: Object.values(ranges)
        };
    }

    renderTrendsChart() {
        const canvas = document.getElementById('trends-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const trends = this.getTrendsData();
        
        this.drawLineChart(ctx, trends);
    }

    getTrendsData() {
        const last30Days = {};
        const today = new Date();
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            last30Days[dateStr] = 0;
        }

        this.data.forEach(item => {
            const date = new Date(item.submitted_at).toISOString().split('T')[0];
            if (last30Days[date] !== undefined) {
                last30Days[date]++;
            }
        });

        return {
            labels: Object.keys(last30Days).slice(-7), // Last 7 days
            values: Object.values(last30Days).slice(-7)
        };
    }

    drawLineChart(ctx, data) {
        const canvas = ctx.canvas;
        const width = canvas.width = canvas.offsetWidth;
        const height = canvas.height = canvas.offsetHeight;
        
        ctx.clearRect(0, 0, width, height);
        
        const padding = 40;
        const pointSpacing = (width - padding * 2) / (data.labels.length - 1);
        const maxValue = Math.max(...data.values);
        const scale = (height - padding * 2) / maxValue;

        // Draw line
        ctx.beginPath();
        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 2;

        data.values.forEach((value, index) => {
            const x = padding + index * pointSpacing;
            const y = height - padding - (value * scale);
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();

        // Draw points and labels
        data.values.forEach((value, index) => {
            const x = padding + index * pointSpacing;
            const y = height - padding - (value * scale);
            
            // Draw point
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fillStyle = '#3B82F6';
            ctx.fill();
            
            // Draw date label
            ctx.fillStyle = '#666';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            const date = new Date(data.labels[index]);
            const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
            ctx.fillText(dateStr, x, height - 10);
            
            // Draw value
            ctx.fillText(value.toString(), x, y - 10);
        });
    }

    updateDemographicsChart(filter) {
        this.renderDemographicsChart(filter);
    }

    filterData() {
        const dateFilter = document.getElementById('date-filter').value;
        // Apply filtering logic here
        this.renderDashboard();
    }

    async exportReport() {
        try {
            const reportData = this.generateReportData();
            const blob = this.createExcelFile(reportData);
            this.downloadFile(blob, `wellbeing-report-${new Date().toISOString().split('T')[0]}.xlsx`);
            showToast(i18n.t('success.exported'), 'success');
        } catch (error) {
            console.error('Export failed:', error);
            showToast(i18n.t('errors.export_failed'), 'error');
        }
    }

    generateReportData() {
        return {
            summary: this.calculateStats(),
            demographics: this.getDemographicsData('gender'),
            bmiDistribution: this.getBMIDistribution(),
            tmhiDistribution: this.getTMHIDistribution(),
            trends: this.getTrendsData(),
            rawData: this.data
        };
    }

    createExcelFile(data) {
        // Create a simple CSV for now (would need SheetJS for Excel)
        const csvContent = this.convertToCSV(data);
        return new Blob([csvContent], { type: 'text/csv' });
    }

    convertToCSV(data) {
        const headers = ['Name', 'Email', 'Gender', 'Age', 'BMI', 'TMHI Score', 'Submitted At'];
        const rows = data.rawData.map(item => [
            item.name || '',
            item.email || '',
            item.gender || '',
            item.age || '',
            item.bmi || '',
            item.tmhi_score || '',
            item.submitted_at || ''
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    setupEventListeners() {
        // Add any additional event listeners
    }

    showError(message) {
        if (window.showToast) {
            showToast(message, 'error');
        } else {
            console.error(message);
        }
    }
}

// Global instance
const reportingDashboard = new ReportingDashboard();
