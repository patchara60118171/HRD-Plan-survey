// =============================================
// js/pdf-upload.js — PDF Upload Handler for Section 1
// Handles file validation, upload to Supabase Storage, and preview
// =============================================

const MAX_FILE_SIZE = 512 * 1024; // 512 KB in bytes
const BUCKET_NAME = 'hrd-documents';

// Store uploaded file paths for cleanup (if user leaves without saving)
const uploadedFiles = new Set();

// =============================================
// FILE VALIDATION
// =============================================
function validateFile(file) {
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

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// =============================================
// DRAG & DROP HANDLERS
// =============================================
function handleFileDragOver(event, fieldType) {
    event.preventDefault();
    event.stopPropagation();
    const zone = document.getElementById(`upload-zone-${fieldType}`);
    if (zone && !zone.classList.contains('uploading')) {
        zone.classList.add('drag-over');
    }
}

function handleFileDragLeave(event, fieldType) {
    event.preventDefault();
    event.stopPropagation();
    const zone = document.getElementById(`upload-zone-${fieldType}`);
    if (zone) {
        zone.classList.remove('drag-over');
    }
}

function handleFileDrop(event, fieldType) {
    event.preventDefault();
    event.stopPropagation();
    
    const zone = document.getElementById(`upload-zone-${fieldType}`);
    if (zone) {
        zone.classList.remove('drag-over');
    }
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0], fieldType);
    }
}

function handleFileSelect(event, fieldType) {
    const files = event.target.files;
    if (files.length > 0) {
        processFile(files[0], fieldType);
    }
}

// =============================================
// FILE PROCESSING
// =============================================
async function processFile(file, fieldType) {
    // Clear previous errors
    showUploadError(fieldType, '');
    
    // Validate file
    const errors = validateFile(file);
    if (errors.length > 0) {
        showUploadError(fieldType, errors.join('\n'));
        return;
    }
    
    // Check if file already exists (prompt for replacement)
    const existingPath = document.getElementById(`${getFieldId(fieldType)}_file_path`)?.value;
    if (existingPath) {
        if (!confirm('มีไฟล์ที่อัปโหลดอยู่แล้ว ต้องการแทนที่ด้วยไฟล์ใหม่หรือไม่?')) {
            return;
        }
        // Delete old file first
        try {
            await deleteFileFromSupabase(existingPath);
        } catch (e) {
            console.warn('Failed to delete old file:', e);
        }
    }
    
    // Start upload
    setUploadingState(fieldType, true);
    
    try {
        const result = await uploadPDFToSupabase(file, fieldType);
        
        // Store file metadata in hidden inputs
        document.getElementById(`${getFieldId(fieldType)}_file_path`).value = result.path;
        document.getElementById(`${getFieldId(fieldType)}_file_url`).value = result.publicUrl;
        document.getElementById(`${getFieldId(fieldType)}_file_name`).value = result.fileName;
        
        // Track for cleanup
        uploadedFiles.add(result.path);
        
        // Show preview
        showFilePreview(fieldType, result);
        
        showToast('อัปโหลดไฟล์สำเร็จ', 'success');
        
    } catch (error) {
        console.error('Upload error:', error);
        showUploadError(fieldType, 'เกิดข้อผิดพลาดในการอัปโหลด กรุณาลองใหม่อีกครั้ง');
    } finally {
        setUploadingState(fieldType, false);
    }
}

function getFieldId(fieldType) {
    if (fieldType === 'strategy') return 'strategy';
    if (fieldType === 'org') return 'org_structure';
    if (fieldType === 'hrd') return 'hrd_plan';
    return 'org_structure';
}

// =============================================
// SUPABASE STORAGE UPLOAD
// =============================================
async function uploadPDFToSupabase(file, fieldType) {
    const agencyId = document.getElementById('organization')?.value || 'unknown';
    const timestamp = Date.now();
    const safeFileName = `${agencyId}_${timestamp}.pdf`;
    
    // Determine folder based on field type
    let folderName;
    if (fieldType === 'strategy') {
        folderName = 'strategy';
    } else if (fieldType === 'org') {
        folderName = 'org-structure';
    } else if (fieldType === 'hrd') {
        folderName = 'hrd-plan';
    } else {
        folderName = 'other';
    }
    
    const filePath = `section1/${folderName}/${safeFileName}`;
    
    // Get Supabase client from ch1-form.js (ch1Sb)
    const supabaseClient = window.ch1Sb || (typeof ch1Sb !== 'undefined' ? ch1Sb : null);
    
    if (!supabaseClient) {
        throw new Error('Supabase client not initialized');
    }
    
    // Upload file
    const { data, error } = await supabaseClient.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
            contentType: 'application/pdf',
            upsert: false
        });
    
    if (error) throw error;
    
    // Get public URL
    const { data: urlData } = supabaseClient.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);
    
    return {
        path: filePath,
        publicUrl: urlData.publicUrl,
        fileName: file.name,
        fileSize: file.size
    };
}

async function deleteFileFromSupabase(filePath) {
    const supabaseClient = window.ch1Sb || (typeof ch1Sb !== 'undefined' ? ch1Sb : null);
    
    if (!supabaseClient) {
        throw new Error('Supabase client not initialized');
    }
    
    const { error } = await supabaseClient.storage
        .from(BUCKET_NAME)
        .remove([filePath]);
    
    if (error) throw error;
    
    // Remove from tracking
    uploadedFiles.delete(filePath);
}

// =============================================
// UI UPDATES
// =============================================
function setUploadingState(fieldType, isUploading) {
    const zone = document.getElementById(`upload-zone-${fieldType}`);
    const content = document.getElementById(`upload-content-${fieldType}`);
    
    if (zone) {
        zone.classList.toggle('uploading', isUploading);
    }
    
    if (content) {
        if (isUploading) {
            content.innerHTML = `
                <div class="spinner mx-auto mb-2"></div>
                <p class="text-sm text-slate-600">กำลังอัปโหลด...</p>
            `;
        } else {
            content.innerHTML = `
                <div class="text-3xl mb-2">📄</div>
                <p class="text-sm text-slate-600 font-medium">คลิกหรือลากไฟล์ PDF มาวางที่นี่</p>
                <p class="text-xs text-slate-400 mt-1">ไฟล์ PDF เท่านั้น | ขนาดไม่เกิน 512 KB</p>
            `;
        }
    }
}

function showUploadError(fieldType, message) {
    const errorDiv = document.getElementById(`upload-error-${fieldType}`);
    const errorText = errorDiv?.querySelector('p');
    
    if (errorDiv && errorText) {
        if (message) {
            errorText.textContent = message;
            errorDiv.classList.remove('hidden');
        } else {
            errorDiv.classList.add('hidden');
        }
    }
}

function showFilePreview(fieldType, result) {
    const previewDiv = document.getElementById(`file-preview-${fieldType}`);
    const nameEl = document.getElementById(`preview-name-${fieldType}`);
    const sizeEl = document.getElementById(`preview-size-${fieldType}`);
    const linkEl = document.getElementById(`preview-link-${fieldType}`);
    
    if (previewDiv) {
        previewDiv.classList.remove('hidden');
        previewDiv.classList.add('file-preview-enter');
    }
    
    if (nameEl) nameEl.textContent = result.fileName;
    if (sizeEl) sizeEl.textContent = formatFileSize(result.fileSize);
    if (linkEl) linkEl.href = result.publicUrl;
    
    // Hide upload zone
    const zone = document.getElementById(`upload-zone-${fieldType}`);
    if (zone) zone.classList.add('hidden');
}

function hideFilePreview(fieldType) {
    const previewDiv = document.getElementById(`file-preview-${fieldType}`);
    if (previewDiv) {
        previewDiv.classList.add('hidden');
        previewDiv.classList.remove('file-preview-enter');
    }
    
    // Show upload zone
    const zone = document.getElementById(`upload-zone-${fieldType}`);
    if (zone) zone.classList.remove('hidden');
    
    // Clear hidden inputs
    const fieldId = getFieldId(fieldType);
    const pathInput = document.getElementById(`${fieldId}_file_path`);
    const urlInput = document.getElementById(`${fieldId}_file_url`);
    const nameInput = document.getElementById(`${fieldId}_file_name`);
    
    if (pathInput) pathInput.value = '';
    if (urlInput) urlInput.value = '';
    if (nameInput) nameInput.value = '';
}

// =============================================
// FILE REMOVAL
// =============================================
async function removeFile(fieldType) {
    const fieldId = getFieldId(fieldType);
    const filePath = document.getElementById(`${fieldId}_file_path`)?.value;
    
    if (!filePath) {
        hideFilePreview(fieldType);
        return;
    }
    
    try {
        await deleteFileFromSupabase(filePath);
        hideFilePreview(fieldType);
        showToast('ลบไฟล์เรียบร้อย', 'success');
    } catch (error) {
        console.error('Delete error:', error);
        showToast('เกิดข้อผิดพลาดในการลบไฟล์', 'error');
    }
}

// =============================================
// CLEANUP (Remove orphaned files on page unload)
// =============================================
function cleanupUploadedFiles() {
    // This function will be called when user leaves without saving
    // Only files that are not saved to database will be removed
    uploadedFiles.forEach(async (filePath) => {
        try {
            await deleteFileFromSupabase(filePath);
            console.log('Cleaned up orphaned file:', filePath);
        } catch (e) {
            console.warn('Failed to cleanup file:', filePath, e);
        }
    });
}

// Setup cleanup on page unload (only for unsaved files)
window.addEventListener('beforeunload', (e) => {
    // Check if form is not submitted (we'll need to track this)
    if (uploadedFiles.size > 0 && !window.formSubmitted) {
        cleanupUploadedFiles();
    }
});

// =============================================
// EXPORTS (for global access)
// =============================================
window.handleFileDrop = handleFileDrop;
window.handleFileDragOver = handleFileDragOver;
window.handleFileDragLeave = handleFileDragLeave;
window.handleFileSelect = handleFileSelect;
window.removeFile = removeFile;
window.cleanupUploadedFiles = cleanupUploadedFiles;
window.uploadedFiles = uploadedFiles;
window.showFilePreview = showFilePreview;
window.setUploadingState = setUploadingState;
window.hideFilePreview = hideFilePreview;
