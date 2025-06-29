// Global variables
let selectedFiles = [];

// DOM elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const mergeBtn = document.getElementById('mergeBtn');
const progress = document.getElementById('progress');
const progressBar = document.getElementById('progressBar');
const status = document.getElementById('status');

// Initialize drag and drop
initializeDragAndDrop();

// File input change handler
fileInput.addEventListener('change', handleFileSelect);

// Initialize drag and drop functionality
function initializeDragAndDrop() {
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    uploadArea.addEventListener('click', () => fileInput.click());
}

// Handle drag over
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

// Handle drag leave
function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

// Handle file drop
function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
}

// Handle file selection
function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    addFiles(files);
}

// Add files to the list
function addFiles(files) {
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length !== files.length) {
        showStatus('Only PDF files are allowed!', 'error');
        return;
    }
    
    pdfFiles.forEach(file => {
        // Check if file already exists
        if (!selectedFiles.some(f => f.name === file.name && f.size === file.size)) {
            selectedFiles.push(file);
        }
    });
    
    updateFileList();
    updateMergeButton();
    
    // Clear the input
    fileInput.value = '';
}

// Update file list display
function updateFileList() {
    fileList.innerHTML = '';
    
    selectedFiles.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        fileItem.innerHTML = `
            <div class="file-info">
                <i class="fas fa-file-pdf file-icon"></i>
                <div>
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${formatFileSize(file.size)}</div>
                </div>
            </div>
            <button class="remove-btn" onclick="removeFile(${index})">
                <i class="fas fa-times"></i> Remove
            </button>
        `;
        
        fileList.appendChild(fileItem);
    });
}

// Remove file from list
function removeFile(index) {
    selectedFiles.splice(index, 1);
    updateFileList();
    updateMergeButton();
}

// Update merge button state
function updateMergeButton() {
    if (selectedFiles.length >= 2) {
        mergeBtn.disabled = false;
        mergeBtn.innerHTML = '<i class="fas fa-compress-alt"></i> Merge PDFs';
    } else {
        mergeBtn.disabled = true;
        mergeBtn.innerHTML = '<i class="fas fa-compress-alt"></i> Select at least 2 PDFs';
    }
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Merge PDFs
async function mergePDFs() {
    if (selectedFiles.length < 2) {
        showStatus('Please select at least 2 PDF files', 'error');
        return;
    }
    
    // Show progress
    showProgress();
    mergeBtn.disabled = true;
    mergeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Merging...';
    mergeBtn.classList.add('processing');
    
    // Create FormData
    const formData = new FormData();
    selectedFiles.forEach(file => {
        formData.append('files[]', file);
    });
    
    try {
        // Simulate progress
        let progressValue = 0;
        const progressInterval = setInterval(() => {
            progressValue += 10;
            updateProgress(progressValue);
            if (progressValue >= 90) {
                clearInterval(progressInterval);
            }
        }, 200);
        
        // Make request to Flask backend
        const response = await fetch('/merge', {
            method: 'POST',
            body: formData
        });
        
        clearInterval(progressInterval);
        updateProgress(100);
        
        if (response.ok) {
            // Get the blob data
            const blob = await response.blob();
            
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `merged_pdf_${new Date().getTime()}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            showStatus('PDFs merged successfully! Download started automatically.', 'success');
            
            // Reset after success
            setTimeout(() => {
                resetTool();
            }, 3000);
            
        } else {
            const errorData = await response.json();
            showStatus(`Error: ${errorData.error}`, 'error');
        }
        
    } catch (error) {
        console.error('Error:', error);
        showStatus('An error occurred while merging PDFs. Please try again.', 'error');
    } finally {
        hideProgress();
        mergeBtn.disabled = false;
        mergeBtn.innerHTML = '<i class="fas fa-compress-alt"></i> Merge PDFs';
        mergeBtn.classList.remove('processing');
        updateMergeButton();
    }
}

// Show progress bar
function showProgress() {
    progress.style.display = 'block';
    progressBar.style.width = '0%';
}

// Update progress
function updateProgress(percent) {
    progressBar.style.width = percent + '%';
}

// Hide progress bar
function hideProgress() {
    setTimeout(() => {
        progress.style.display = 'none';
    }, 1000);
}

// Show status message
function showStatus(message, type) {
    status.textContent = message;
    status.className = `status ${type}`;
    status.style.display = 'block';
    
    // Hide status after 5 seconds for success messages
    if (type === 'success') {
        setTimeout(() => {
            status.style.display = 'none';
        }, 5000);
    }
}

// Reset tool
function resetTool() {
    selectedFiles = [];
    updateFileList();
    updateMergeButton();
    status.style.display = 'none';
    progress.style.display = 'none';
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Mobile menu toggle (for future enhancement)
const mobileMenu = document.querySelector('.mobile-menu');
const navLinks = document.querySelector('.nav-links');

if (mobileMenu) {
    mobileMenu.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}