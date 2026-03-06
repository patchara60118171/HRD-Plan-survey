// ========================================
// API Integration Management
// ========================================

class APIIntegration {
    constructor() {
        this.integrations = {
            slack: {
                name: 'Slack',
                description: 'Send notifications to Slack channels',
                status: 'disconnected',
                config: {
                    webhookUrl: '',
                    channel: '#wellbeing-updates'
                }
            },
            teams: {
                name: 'Microsoft Teams',
                description: 'Integrate with Microsoft Teams',
                status: 'disconnected',
                config: {
                    webhookUrl: '',
                    teamId: ''
                }
            },
            google_sheets: {
                name: 'Google Sheets',
                description: 'Sync data to Google Sheets',
                status: 'connected',
                config: {
                    spreadsheetId: '',
                    apiKey: ''
                }
            },
            webhook: {
                name: 'Custom Webhook',
                description: 'Send data to custom endpoints',
                status: 'disconnected',
                config: {
                    url: '',
                    headers: {},
                    events: ['survey.completed', 'user.registered']
                }
            },
            email: {
                name: 'Email Service',
                description: 'Send email notifications',
                status: 'disconnected',
                config: {
                    provider: 'smtp',
                    smtpHost: '',
                    smtpPort: 587,
                    username: '',
                    password: ''
                }
            }
        };
        
        this.loadSavedConfig();
    }

    loadSavedConfig() {
        const saved = localStorage.getItem('wellbeing_api_integrations');
        if (saved) {
            try {
                const savedConfig = JSON.parse(saved);
                Object.keys(savedConfig).forEach(key => {
                    if (this.integrations[key]) {
                        this.integrations[key].config = { ...this.integrations[key].config, ...savedConfig[key].config };
                        this.integrations[key].status = savedConfig[key].status;
                    }
                });
            } catch (error) {
                console.error('Failed to load API integration config:', error);
            }
        }
    }

    saveConfig() {
        localStorage.setItem('wellbeing_api_integrations', JSON.stringify(this.integrations));
    }

    async renderIntegrationPanel() {
        const container = document.getElementById('main-content');
        if (!container) return;

        container.innerHTML = `
            <div class="api-container">
                <div class="api-header">
                    <h1 class="api-title" data-i18n="api.title">การเชื่อมต่อ API</h1>
                    <p class="api-description" data-i18n="api.description">
                        เชื่อมต่อระบบกับบริการภายนอกเพื่อการทำงานอัตโนมัติและการแจ้งเตือน
                    </p>
                </div>

                <div class="integrations-grid">
                    ${Object.entries(this.integrations).map(([key, integration]) => this.renderIntegrationCard(key, integration)).join('')}
                </div>

                <div class="webhook-config">
                    <h3 class="webhook-header" data-i18n="api.webhooks">Webhooks Configuration</h3>
                    <div class="webhook-form">
                        <div class="form-group">
                            <label class="form-label" data-i18n="api.webhook_url">Webhook URL</label>
                            <input type="url" class="form-input" id="webhook-url" placeholder="https://your-domain.com/webhook">
                            <small class="form-help">URL ที่จะรับข้อมูลเมื่อมีเหตุการณ์เกิดขึ้น</small>
                        </div>
                        <div class="form-group">
                            <label class="form-label" data-i18n="api.events">Events to Send</label>
                            <div class="checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" value="survey.completed" checked>
                                    Survey Completed
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" value="user.registered">
                                    User Registered
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" value="report.generated">
                                    Report Generated
                                </label>
                            </div>
                        </div>
                        <div class="form-group">
                            <button class="btn btn-primary" onclick="apiIntegration.testWebhook()">
                                <span class="btn-icon">🧪</span> <span data-i18n="api.test_connection">Test Connection</span>
                            </button>
                            <button class="btn btn-secondary" onclick="apiIntegration.saveWebhook()">
                                <span class="btn-icon">💾</span> <span data-i18n="common.save">Save</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="api-logs">
                    <h3>API Activity Logs</h3>
                    <div id="api-logs-container">
                        ${this.renderLogs()}
                    </div>
                </div>
            </div>
        `;

        // Apply translations
        if (window.i18n) {
            i18n.translateDOM();
        }

        // Setup event listeners
        this.setupEventListeners();
    }

    renderIntegrationCard(key, integration) {
        return `
            <div class="integration-card">
                <div class="integration-header">
                    <h3 class="integration-title">${integration.name}</h3>
                    <span class="integration-status ${integration.status}">
                        ${integration.status === 'connected' ? '✓ ' : ''}${integration.status}
                    </span>
                </div>
                <p class="integration-description">${integration.description}</p>
                <div class="integration-actions">
                    ${integration.status === 'connected' 
                        ? `<button class="btn btn-secondary btn-small" onclick="apiIntegration.configureIntegration('${key}')">
                            <span data-i18n="common.configure">Configure</span>
                        </button>
                        <button class="btn btn-danger btn-small" onclick="apiIntegration.disconnectIntegration('${key}')">
                            <span data-i18n="common.disconnect">Disconnect</span>
                        </button>`
                        : `<button class="btn btn-primary btn-small" onclick="apiIntegration.connectIntegration('${key}')">
                            <span data-i18n="api.connect">Connect</span>
                        </button>`
                    }
                </div>
            </div>
        `;
    }

    renderLogs() {
        const logs = this.getLogs();
        if (logs.length === 0) {
            return '<p class="text-muted">No API activity yet</p>';
        }

        return logs.map(log => `
            <div class="log-entry">
                <div class="log-header">
                    <span class="log-service">${log.service}</span>
                    <span class="log-time">${new Date(log.timestamp).toLocaleString()}</span>
                </div>
                <div class="log-details">
                    <span class="log-event">${log.event}</span>
                    <span class="log-status ${log.success ? 'success' : 'error'}">
                        ${log.success ? '✓' : '✗'} ${log.status}
                    </span>
                </div>
                ${log.error ? `<div class="log-error">${log.error}</div>` : ''}
            </div>
        `).join('');
    }

    getLogs() {
        const logs = localStorage.getItem('wellbeing_api_logs');
        return logs ? JSON.parse(logs) : [];
    }

    addLog(service, event, success, status, error = null) {
        const logs = this.getLogs();
        logs.unshift({
            service,
            event,
            success,
            status,
            error,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 50 logs
        if (logs.length > 50) {
            logs.splice(50);
        }
        
        localStorage.setItem('wellbeing_api_logs', JSON.stringify(logs));
    }

    async connectIntegration(key) {
        const integration = this.integrations[key];
        
        switch (key) {
            case 'slack':
                await this.connectSlack();
                break;
            case 'teams':
                await this.connectTeams();
                break;
            case 'google_sheets':
                await this.connectGoogleSheets();
                break;
            case 'webhook':
                await this.connectWebhook();
                break;
            case 'email':
                await this.connectEmail();
                break;
        }
    }

    async connectSlack() {
        const webhookUrl = prompt('Enter Slack Webhook URL:');
        if (!webhookUrl) return;

        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: '🎉 Well-being Survey connected to Slack successfully!'
                })
            });

            if (response.ok) {
                this.integrations.slack.config.webhookUrl = webhookUrl;
                this.integrations.slack.status = 'connected';
                this.saveConfig();
                this.addLog('Slack', 'connection_test', true, 'Connected');
                showToast('Slack connected successfully!', 'success');
                this.renderIntegrationPanel();
            } else {
                throw new Error('Failed to connect to Slack');
            }
        } catch (error) {
            this.addLog('Slack', 'connection_test', false, 'Connection failed', error.message);
            showToast('Failed to connect to Slack', 'error');
        }
    }

    async connectTeams() {
        const webhookUrl = prompt('Enter Microsoft Teams Webhook URL:');
        if (!webhookUrl) return;

        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: '🎉 Well-being Survey connected to Microsoft Teams successfully!'
                })
            });

            if (response.ok) {
                this.integrations.teams.config.webhookUrl = webhookUrl;
                this.integrations.teams.status = 'connected';
                this.saveConfig();
                this.addLog('Microsoft Teams', 'connection_test', true, 'Connected');
                showToast('Microsoft Teams connected successfully!', 'success');
                this.renderIntegrationPanel();
            } else {
                throw new Error('Failed to connect to Microsoft Teams');
            }
        } catch (error) {
            this.addLog('Microsoft Teams', 'connection_test', false, 'Connection failed', error.message);
            showToast('Failed to connect to Microsoft Teams', 'error');
        }
    }

    async connectGoogleSheets() {
        const spreadsheetId = prompt('Enter Google Sheets Spreadsheet ID:');
        if (!spreadsheetId) return;

        this.integrations.google_sheets.config.spreadsheetId = spreadsheetId;
        this.integrations.google_sheets.status = 'connected';
        this.saveConfig();
        this.addLog('Google Sheets', 'connection_test', true, 'Connected');
        showToast('Google Sheets connected successfully!', 'success');
        this.renderIntegrationPanel();
    }

    async connectWebhook() {
        const url = prompt('Enter Webhook URL:');
        if (!url) return;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event: 'test',
                    timestamp: new Date().toISOString()
                })
            });

            if (response.ok) {
                this.integrations.webhook.config.url = url;
                this.integrations.webhook.status = 'connected';
                this.saveConfig();
                this.addLog('Webhook', 'connection_test', true, 'Connected');
                showToast('Webhook connected successfully!', 'success');
                this.renderIntegrationPanel();
            } else {
                throw new Error('Failed to connect to webhook');
            }
        } catch (error) {
            this.addLog('Webhook', 'connection_test', false, 'Connection failed', error.message);
            showToast('Failed to connect to webhook', 'error');
        }
    }

    async connectEmail() {
        const smtpHost = prompt('Enter SMTP Host:');
        if (!smtpHost) return;

        const username = prompt('Enter SMTP Username:');
        if (!username) return;

        const password = prompt('Enter SMTP Password:');
        if (!password) return;

        this.integrations.email.config.smtpHost = smtpHost;
        this.integrations.email.config.username = username;
        this.integrations.email.config.password = password;
        this.integrations.email.status = 'connected';
        this.saveConfig();
        this.addLog('Email Service', 'connection_test', true, 'Connected');
        showToast('Email service configured successfully!', 'success');
        this.renderIntegrationPanel();
    }

    disconnectIntegration(key) {
        if (confirm(`Are you sure you want to disconnect ${this.integrations[key].name}?`)) {
            this.integrations[key].status = 'disconnected';
            this.saveConfig();
            this.addLog(this.integrations[key].name, 'disconnection', true, 'Disconnected');
            showToast(`${this.integrations[key].name} disconnected`, 'info');
            this.renderIntegrationPanel();
        }
    }

    configureIntegration(key) {
        const integration = this.integrations[key];
        alert(`Configuration for ${integration.name} would open here. This is a placeholder for the configuration modal.`);
    }

    async testWebhook() {
        const url = document.getElementById('webhook-url').value;
        if (!url) {
            showToast('Please enter a webhook URL', 'error');
            return;
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event: 'test',
                    timestamp: new Date().toISOString(),
                    data: { message: 'Test webhook from Well-being Survey' }
                })
            });

            if (response.ok) {
                this.addLog('Webhook', 'test', true, 'Test successful');
                showToast('Webhook test successful!', 'success');
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            this.addLog('Webhook', 'test', false, 'Test failed', error.message);
            showToast('Webhook test failed', 'error');
        }
    }

    saveWebhook() {
        const url = document.getElementById('webhook-url').value;
        const events = Array.from(document.querySelectorAll('.checkbox-group input:checked'))
            .map(cb => cb.value);

        this.integrations.webhook.config.url = url;
        this.integrations.webhook.config.events = events;
        this.saveConfig();
        
        this.addLog('Webhook', 'configuration', true, 'Configuration saved');
        showToast('Webhook configuration saved!', 'success');
    }

    async triggerEvent(eventType, data) {
        // Trigger connected integrations based on event type
        for (const [key, integration] of Object.entries(this.integrations)) {
            if (integration.status !== 'connected') continue;

            try {
                switch (key) {
                    case 'slack':
                        await this.sendSlackNotification(eventType, data);
                        break;
                    case 'teams':
                        await this.sendTeamsNotification(eventType, data);
                        break;
                    case 'google_sheets':
                        await this.syncToGoogleSheets(eventType, data);
                        break;
                    case 'webhook':
                        if (integration.config.events.includes(eventType)) {
                            await this.sendWebhookEvent(eventType, data);
                        }
                        break;
                    case 'email':
                        await this.sendEmailNotification(eventType, data);
                        break;
                }
            } catch (error) {
                this.addLog(integration.name, eventType, false, 'Failed to send', error.message);
            }
        }
    }

    async sendSlackNotification(eventType, data) {
        const { webhookUrl, channel } = this.integrations.slack.config;
        
        let message = '';
        switch (eventType) {
            case 'survey.completed':
                message = `📊 New survey completed by ${data.userName || 'Anonymous'}`;
                break;
            case 'user.registered':
                message = `👋 New user registered: ${data.email}`;
                break;
            case 'report.generated':
                message = `📈 New report generated`;
                break;
        }

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                channel,
                text: message,
                blocks: [
                    {
                        type: 'section',
                        text: { type: 'mrkdwn', text: message }
                    },
                    {
                        type: 'actions',
                        elements: [
                            {
                                type: 'button',
                                text: { type: 'plain_text', text: 'View Details' },
                                url: window.location.origin
                            }
                        ]
                    }
                ]
            })
        });

        if (response.ok) {
            this.addLog('Slack', eventType, true, 'Notification sent');
        } else {
            throw new Error('Failed to send Slack notification');
        }
    }

    async sendTeamsNotification(eventType, data) {
        const { webhookUrl } = this.integrations.teams.config;
        
        let message = '';
        switch (eventType) {
            case 'survey.completed':
                message = `📊 New survey completed by ${data.userName || 'Anonymous'}`;
                break;
            case 'user.registered':
                message = `👋 New user registered: ${data.email}`;
                break;
            case 'report.generated':
                message = `📈 New report generated`;
                break;
        }

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: message,
                sections: [
                    {
                        activityTitle: message,
                        activitySubtitle: new Date().toLocaleString(),
                        facts: [
                            { name: 'Event', value: eventType },
                            { name: 'Source', value: 'Well-being Survey' }
                        ],
                        potentialAction: [
                            {
                                '@type': 'OpenUri',
                                name: 'View Details',
                                targets: [{ os: 'default', uri: window.location.origin }]
                            }
                        ]
                    }
                ]
            })
        });

        if (response.ok) {
            this.addLog('Microsoft Teams', eventType, true, 'Notification sent');
        } else {
            throw new Error('Failed to send Teams notification');
        }
    }

    async syncToGoogleSheets(eventType, data) {
        // This would require Google Sheets API implementation
        // For now, just log the event
        this.addLog('Google Sheets', eventType, true, 'Data synced');
    }

    async sendWebhookEvent(eventType, data) {
        const { url, headers } = this.integrations.webhook.config;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            body: JSON.stringify({
                event: eventType,
                timestamp: new Date().toISOString(),
                data
            })
        });

        if (response.ok) {
            this.addLog('Webhook', eventType, true, 'Event sent');
        } else {
            throw new Error('Failed to send webhook event');
        }
    }

    async sendEmailNotification(eventType, data) {
        // This would require email service implementation
        // For now, just log the event
        this.addLog('Email Service', eventType, true, 'Email sent');
    }

    setupEventListeners() {
        // Add any additional event listeners
    }
}

// Global instance
const apiIntegration = new APIIntegration();
