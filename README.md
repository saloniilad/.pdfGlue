## 📎 .pdfGlue – Merge Multiple PDFs Online

> A sleek, fast, and secure web-based tool built with Flask that allows users to merge multiple PDF files effortlessly with a modern drag-and-drop UI.



## 🚀 Features

- 🖱️ Drag & drop interface with live file preview
- 📂 Upload and merge multiple PDF files in one go
- ⚡ Lightning-fast PDF merging using `PyPDF2`
- 🛡️ Secure file handling – all files deleted after processing
- 📱 Fully responsive UI – works on desktop, tablet, and mobile
- 🔒 Client-side validation for PDF type & minimum 2 files
- 💾 Auto-download of merged PDFs with unique file names



## 🛠️ Tech Stack

- **Frontend**: HTML, CSS, JavaScript, Font Awesome
- **Backend**: Flask (Python), PyPDF2
- **File Handling**: Temporary storage using `tempfile`, UUID-based output names
- **Security**: 50MB file size limit, file type validation, auto cleanup



## 📦 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/pdfglue.git
cd pdfglue
pip install -r requirements.txt
python app.py
```

## ✨ How It Works
- Upload: Select or drag and drop multiple PDF files
- Validate: Client-side script ensures file types and count
- Merge: Files are uploaded to Flask where PyPDF2 merges them
- Download: Merged PDF is sent back and auto-downloaded

## 💡 Future Enhancements
- Drag-and-drop file reorder before merging
- Cloud PDF storage or save to Google Drive
- Dark mode toggle
- Add password-protection for the output PDF

## Try it out
link