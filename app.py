from flask import Flask, request, send_file, jsonify, render_template
import PyPDF2
import io
import os
from werkzeug.utils import secure_filename
import tempfile
import uuid

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size

# Ensure upload directory exists
UPLOAD_FOLDER = 'temp_uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/merge', methods=['POST'])
def merge_pdfs():
    try:
        if 'files[]' not in request.files:
            return jsonify({'error': 'No files uploaded'}), 400
        
        files = request.files.getlist('files[]')
        
        if len(files) < 2:
            return jsonify({'error': 'At least 2 PDF files are required for merging'}), 400
        
        # Validate that all files are PDFs
        for file in files:
            if not file.filename.lower().endswith('.pdf'):
                return jsonify({'error': f'{file.filename} is not a PDF file'}), 400
        
        # Create a PDF merger object
        merger = PyPDF2.PdfMerger()
        temp_files = []
        
        try:
            # Process each uploaded file
            for file in files:
                if file and file.filename:
                    # Create a temporary file
                    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
                    temp_files.append(temp_file.name)
                    
                    # Save the uploaded file
                    file.save(temp_file.name)
                    
                    # Add to merger
                    merger.append(temp_file.name)
            
            # Create output buffer
            output_buffer = io.BytesIO()
            merger.write(output_buffer)
            merger.close()
            output_buffer.seek(0)
            
            # Generate unique filename
            output_filename = f"merged_pdf_{uuid.uuid4().hex[:8]}.pdf"
            
            # Clean up temporary files
            for temp_file in temp_files:
                try:
                    os.unlink(temp_file)
                except:
                    pass
            
            return send_file(
                output_buffer,
                as_attachment=True,
                download_name=output_filename,
                mimetype='application/pdf'
            )
            
        except Exception as e:
            # Clean up temporary files in case of error
            for temp_file in temp_files:
                try:
                    os.unlink(temp_file)
                except:
                    pass
            raise e
            
    except Exception as e:
        return jsonify({'error': f'Error merging PDFs: {str(e)}'}), 500

@app.errorhandler(413)
def too_large(e):
    return jsonify({'error': 'File too large. Maximum size is 50MB.'}), 413

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)