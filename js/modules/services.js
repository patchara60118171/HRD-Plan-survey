// ========================================
// Services Module - Supabase + API + PDF Upload
// ========================================

// ========================================
// Supabase Configuration (from supabase-config.js)
// ========================================

const SUPABASE_URL = 'https://fgdommhiqhzvsedfzyrr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZG9tbWhpcWh6dnNlZGZ6eXJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMzY2MzUsImV4cCI6MjA4NDkxMjYzNX0.GFMOeDArhq-9lPt39OizkBOFFgK4TDpVDJrk_HRQ6Xc';

// Create Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========================================
// PDF Upload Handler (from pdf-upload.js)
// ========================================

const MAX_FILE_SIZE = 512 * 1024; // 512 KB in bytes
const BUCKET_NAME = 'hrd-documents';

// Store uploaded file paths for cleanup
const uploadedFiles = new Set();

class PDFUploadHandler {
    constructor() {
        this.uploadQueue = [];
        this.isUploading = false;
    }

    // File Validation
    validateFile(file) {
        const errors = [];
        
        // Check MIME type — must be PDF only
        if (file.type !== 'application/pdf') {
            errors.push('กรุณาอัปโหลดไฟล์ PDF เท่านั้น');
        }
        
        // Check file size — max 512 KB
        if (file.size > MAX_FILE_SIZE) {
            const fileSizeKB = (file.size / 1024).toFixed(1);
            errors.push(`ขนาดไฟล์ (${fileSizeKB} KB) เกินกำหนด กรุณาใช้ไฟล์ขนาดไม่เกิน 512 KB`);
        }
        
        return errors; // Return [] means valid
    }

    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    // Drag & Drop Handlers
    handleFileDragOver(event, fieldType) {
        event.preventDefault();
        event.stopPropagation();
        const zone = document.getElementById(`upload-zone-${fieldType}`);
        if (zone && !zone.classList.contains('uploading')) {
            zone.classList.add('drag-over');
        }
    }

    handleFileDragLeave(event, fieldType) {
        event.preventDefault();
        event.stopPropagation();
        const zone = document.getElementById(`upload-zone-${fieldType}`);
        if (zone) {
            zone.classList.remove('drag-over');
        }
    }

    handleFileDrop(event, fieldType) {
        event.preventDefault();
        event.stopPropagation();
        
        const zone = document.getElementById(`upload-zone-${fieldType}`);
        if (zone) {
            zone.classList.remove('drag-over');
        }
        
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            this.handleFileSelect({ target: { files } }, fieldType);
        }
    }

    // File Selection Handler
    async handleFileSelect(event, fieldType) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Validate file
        const errors = this.validateFile(file);
        if (errors.length > 0) {
            this.showUploadError(fieldType, errors.join(', '));
            return;
        }
        
        // Show uploading state
        this.showUploadingState(fieldType, true);
        
        try {
            // Upload to Supabase Storage
            const uploadResult = await this.uploadFile(file, fieldType);
            
            // Show preview
            this.showFilePreview(fieldType, uploadResult);
            
            // Store file metadata
            this.storeFileMetadata(fieldType, uploadResult);
            
            // Add to cleanup queue
            uploadedFiles.add(uploadResult.path);
            
        } catch (error) {
            console.error('Upload failed:', error);
            this.showUploadError(fieldType, 'การอัปโหลดไฟล์ล้มเหลว กรุณาลองใหม่');
        } finally {
            this.showUploadingState(fieldType, false);
        }
    }

    // Upload File to Supabase Storage
    async uploadFile(file, fieldType) {
        const fileName = `${fieldType}_${Date.now()}_${file.name}`;
        const filePath = `${fieldType}/${fileName}`;
        
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });
        
        if (error) throw error;
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(filePath);
        
        return {
            path: data.path,
            url: publicUrl,
            name: file.name,
            size: file.size
        };
    }

    // Show Uploading State
    showUploadingState(fieldType, isUploading) {
        const zone = document.getElementById(`upload-zone-${fieldType}`);
        const content = document.getElementById(`upload-content-${fieldType}`);
        const errorDiv = document.getElementById(`upload-error-${fieldType}`);
        
        if (isUploading) {
            zone.classList.add('uploading');
            content.innerHTML = `
                <div class="upload-spinner"></div>
                <p class="text-sm text-slate-600">กำลังอัปโหลด...</p>
            `;
            errorDiv.classList.add('hidden');
        } else {
            zone.classList.remove('uploading');
            // Reset content (will be replaced by preview or error)
        }
    }

    // Show File Preview
    showFilePreview(fieldType, uploadResult) {
        const preview = document.getElementById(`file-preview-${fieldType}`);
        const nameEl = document.getElementById(`preview-name-${fieldType}`);
        const sizeEl = document.getElementById(`preview-size-${fieldType}`);
        const linkEl = document.getElementById(`preview-link-${fieldType}`);
        
        if (preview && nameEl && sizeEl && linkEl) {
            nameEl.textContent = uploadResult.name;
            sizeEl.textContent = this.formatFileSize(uploadResult.size);
            linkEl.href = uploadResult.url;
            preview.classList.remove('hidden');
        }
    }

    // Show Upload Error
    showUploadError(fieldType, message) {
        const errorDiv = document.getElementById(`upload-error-${fieldType}`);
        const errorText = errorDiv.querySelector('p');
        
        if (errorDiv && errorText) {
            errorText.textContent = message;
            errorDiv.classList.remove('hidden');
        }
    }

    // Store File Metadata
    storeFileMetadata(fieldType, uploadResult) {
        const inputs = {
            path: document.getElementById(`${fieldType}_file_path`),
            url: document.getElementById(`${fieldType}_file_url`),
            name: document.getElementById(`${fieldType}_file_name`)
        };
        
        Object.keys(inputs).forEach(key => {
            if (inputs[key]) {
                inputs[key].value = uploadResult[key.split('_').pop()] || uploadResult[key];
            }
        });
    }

    // Remove File
    async removeFile(fieldType) {
        const pathInput = document.getElementById(`${fieldType}_file_path`);
        const preview = document.getElementById(`file-preview-${fieldType}`);
        
        if (!pathInput || !pathInput.value) return;
        
        try {
            // Delete from Supabase Storage
            const { error } = await supabase.storage
                .from(BUCKET_NAME)
                .remove([pathInput.value]);
            
            if (error) throw error;
            
            // Clear metadata
            Object.keys({
                path: `${fieldType}_file_path`,
                url: `${fieldType}_file_url`,
                name: `${fieldType}_file_name`
            }).forEach(key => {
                const input = document.getElementById(key);
                if (input) input.value = '';
            });
            
            // Hide preview
            if (preview) {
                preview.classList.add('hidden');
            }
            
            // Remove from cleanup queue
            uploadedFiles.delete(pathInput.value);
            
        } catch (error) {
            console.error('Failed to remove file:', error);
        }
    }

    // Cleanup Temporary Files
    async cleanupTemporaryFiles() {
        if (uploadedFiles.size === 0) return;
        
        try {
            const { error } = await supabase.storage
                .from(BUCKET_NAME)
                .remove(Array.from(uploadedFiles));
            
            if (error) {
                console.error('Failed to cleanup temporary files:', error);
            } else {
                console.log('Cleaned up temporary files:', uploadedFiles.size);
                uploadedFiles.clear();
            }
        } catch (error) {
            console.error('Cleanup error:', error);
        }
    }
}

// ========================================
// API Integration (from api-integration.js)
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
                    host: '',
                    port: 587,
                    username: '',
                    password: '',
                    from: ''
                }
            }
        };
        
        this.loadIntegrations();
    }

    loadIntegrations() {
        const saved = localStorage.getItem('api_integrations');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                Object.assign(this.integrations, parsed);
            } catch (error) {
                console.error('Failed to load integrations:', error);
            }
        }
    }

    saveIntegrations() {
        localStorage.setItem('api_integrations', JSON.stringify(this.integrations));
    }

    // Slack Integration
    async sendSlackNotification(message, channel = null) {
        const integration = this.integrations.slack;
        if (integration.status !== 'connected' || !integration.config.webhookUrl) {
            throw new Error('Slack integration not configured');
        }

        const payload = {
            text: message,
            channel: channel || integration.config.channel,
            username: 'Well-being Survey Bot',
            icon_emoji: ':herb:'
        };

        try {
            const response = await fetch(integration.config.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Slack API error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Failed to send Slack notification:', error);
            throw error;
        }
    }

    // Google Sheets Integration
    async syncToGoogleSheets(data, spreadsheetId = null) {
        const integration = this.integrations.google_sheets;
        const sheetId = spreadsheetId || integration.config.spreadsheetId;
        
        if (integration.status !== 'connected' || !sheetId || !integration.config.apiKey) {
            throw new Error('Google Sheets integration not configured');
        }

        try {
            // This would require Google Sheets API client
            // For now, just log the action
            console.log('Would sync data to Google Sheets:', {
                spreadsheetId: sheetId,
                dataCount: Array.isArray(data) ? data.length : 1
            });

            // Placeholder implementation
            return { success: true, message: 'Data synced to Google Sheets' };
        } catch (error) {
            console.error('Failed to sync to Google Sheets:', error);
            throw error;
        }
    }

    // Custom Webhook
    async sendWebhook(event, data) {
        const integration = this.integrations.webhook;
        if (integration.status !== 'connected' || !integration.config.url) {
            throw new Error('Webhook integration not configured');
        }

        if (!integration.config.events.includes(event)) {
            return; // Event not configured for this webhook
        }

        const payload = {
            event,
            timestamp: new Date().toISOString(),
            data
        };

        try {
            const response = await fetch(integration.config.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...integration.config.headers
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Webhook error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Failed to send webhook:', error);
            throw error;
        }
    }

    // Email Service (using EmailJS or similar)
    async sendEmail(to, subject, body) {
        const integration = this.integrations.email;
        if (integration.status !== 'connected') {
            throw new Error('Email integration not configured');
        }

        try {
            // This would require an email service like EmailJS, SendGrid, etc.
            // For now, just log the action
            console.log('Would send email:', { to, subject, bodyLength: body.length });

            // Placeholder implementation
            return { success: true, message: 'Email sent successfully' };
        } catch (error) {
            console.error('Failed to send email:', error);
            throw error;
        }
    }

    // Configure Integration
    configureIntegration(platform, config) {
        if (!this.integrations[platform]) {
            throw new Error(`Unknown integration platform: ${platform}`);
        }

        Object.assign(this.integrations[platform].config, config);
        this.integrations[platform].status = 'connected';
        this.saveIntegrations();

        console.log(`Configured ${platform} integration`);
    }

    // Disconnect Integration
    disconnectIntegration(platform) {
        if (!this.integrations[platform]) {
            throw new Error(`Unknown integration platform: ${platform}`);
        }

        this.integrations[platform].status = 'disconnected';
        this.integrations[platform].config = {
            webhookUrl: '',
            channel: '#wellbeing-updates',
            spreadsheetId: '',
            apiKey: '',
            url: '',
            headers: {},
            events: ['survey.completed', 'user.registered']
        };
        
        this.saveIntegrations();
        console.log(`Disconnected ${platform} integration`);
    }

    // Get Integration Status
    getIntegrationStatus(platform) {
        return this.integrations[platform] || null;
    }

    // Get All Integrations
    getAllIntegrations() {
        return this.integrations;
    }

    // Test Integration
    async testIntegration(platform) {
        const integration = this.integrations[platform];
        if (integration.status !== 'connected') {
            throw new Error(`${platform} integration not connected`);
        }

        switch (platform) {
            case 'slack':
                return await this.sendSlackNotification('Test message from Well-being Survey');
            case 'google_sheets':
                return await this.syncToGoogleSheets([{ test: 'data' }]);
            case 'webhook':
                return await this.sendWebhook('test', { message: 'Test webhook' });
            case 'email':
                return await this.sendEmail('test@example.com', 'Test Subject', 'Test body');
            default:
                throw new Error(`Test not implemented for ${platform}`);
        }
    }
}

// ========================================
// EXPORTS
// ========================================

window.ServicesModule = {
    supabase,
    PDFUploadHandler,
    APIIntegration,
    // Constants
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    MAX_FILE_SIZE,
    BUCKET_NAME
};

// Initialize instances
window.pdfUploadHandler = new PDFUploadHandler();
window.apiIntegration = new APIIntegration();
