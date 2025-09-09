import os
from flask import Flask, render_template, request, flash
import google.generativeai as genai
from dotenv import load_dotenv
import docx
from pypdf import PdfReader
import xml.etree.ElementTree as ET
import secrets

# Load environment variables
load_dotenv(encoding="utf-8")

# --- Core Logic from src/main.py ---

def configure_ai():
    """Configures the Gemini AI with the API key."""
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key or api_key == 'YOUR_API_KEY_HERE':
        raise ValueError("GEMINI_API_KEY not found. Check your .env file.")
    genai.configure(api_key=api_key)

def read_requirement_file(file_path):
    """Reads the content of various requirement file types."""
    try:
        if file_path.lower().endswith('.pdf'):
            reader = PdfReader(file_path)
            text = "".join(page.extract_text() or "" for page in reader.pages)
        elif file_path.lower().endswith('.docx'):
            doc = docx.Document(file_path)
            text = "\n".join(para.text for para in doc.paragraphs)
        elif file_path.lower().endswith('.xml'):
            tree = ET.parse(file_path)
            root = tree.getroot()
            text = "\n".join(elem.text.strip() for elem in root.iter() if elem.text and elem.text.strip())
        elif file_path.lower().endswith('.txt'):
            with open(file_path, 'r', encoding='utf-8') as f:
                text = f.read()
        else:
            raise ValueError("Unsupported file type")
        return text
    except Exception as e:
        print(f"Error reading file: {e}") # Log error
        raise

def generate_test_cases(requirement_text):
    """Generates test cases using the Gemini AI."""
    prompt = (
        "You are an expert QA Engineer. Analyze the provided software requirement "
        "and generate a comprehensive set of test cases in Gherkin format. "
        "The output must be only the Gherkin text, starting with a 'Feature' definition."
        "\n---\n{requirement}\n---"
    )
    model = genai.GenerativeModel('gemini-1.5-flash')
    full_prompt = prompt.format(requirement=requirement_text)
    response = model.generate_content(full_prompt)
    return response.text

# --- Flask Web Application ---

app = Flask(__name__)
app.config['SECRET_KEY'] = secrets.token_hex(16)
app.config['UPLOAD_FOLDER'] = 'uploads'

# Ensure the upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

@app.route('/', methods=['GET', 'POST'])
def index():
    gherkin_output = ""
    if request.method == 'POST':
        if 'requirement_file' not in request.files:
            flash('No file part')
            return render_template('index.html', gherkin_output=gherkin_output)
        
        file = request.files['requirement_file']
        if file.filename == '':
            flash('No selected file')
            return render_template('index.html', gherkin_output=gherkin_output)

        if file:
            try:
                # Save the file securely
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
                file.save(file_path)

                # Configure AI and process file
                configure_ai()
                requirement_text = read_requirement_file(file_path)
                gherkin_output = generate_test_cases(requirement_text)
                
                # Clean up the uploaded file
                os.remove(file_path)

            except ValueError as e:
                if "GEMINI_API_KEY" in str(e):
                    flash("AI is not configured. Please check your .env file for GEMINI_API_KEY.")
                else:
                    flash("Unsupported file type. Please upload .txt, .docx, .pdf, or .xml.")
            except Exception as e:
                flash(f'An error occurred: {e}')

    return render_template('index.html', gherkin_output=gherkin_output)

if __name__ == '__main__':
    app.run(debug=True)
