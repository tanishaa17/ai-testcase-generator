import os
import json
import io
import csv
from flask import Flask, render_template, request, flash, session, make_response, redirect, url_for
import google.generativeai as genai
from dotenv import load_dotenv
import docx
from pypdf import PdfReader
import xml.etree.ElementTree as ET
import secrets

# Load environment variables
load_dotenv(encoding="utf-8")

# --- Core Logic ---

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
        print(f"Error reading file: {e}")
        raise

def generate_test_cases(requirement_text, domain="healthcare software"):
    """
    Generates structured test cases using the Gemini AI, focusing on compliance
    and traceability for the specified domain.
    """
    prompt = (
        f"You are a world-class QA expert specializing in {domain} (e.g., regulated standards like FDA, IEC 62304 for healthcare, or PCI-DSS for finance)."
        "Analyze the provided software requirement and generate a comprehensive set of test cases."
        "Your output MUST be a single, valid JSON object. Do not include any other text or markdown formatting."
        "The JSON object should have a single key: 'test_cases'."
        "The value should be a list of test case objects, where each object has the following keys:"
        '  - \"test_id\": A unique identifier for the test case (e.g., \"TC-001\").' 
        '  - \"requirement_source\": The specific requirement sentence or phrase this test case validates.'
        '  - \"gherkin_feature\": The full, complete Gherkin text for the test case, starting with \"Feature:\".' 
        '  - \"compliance_tags\": A list of strings identifying relevant compliance standards for the specified domain (e.g., [\"ISO 13485\", \"GDPR\"] for healthcare).' 
        "\n--- REQUIREMENT TEXT ---"
        f"{requirement_text}"
        "\n--- END REQUIREMENT TEXT ---"
        "Produce the JSON output now."
    )
    
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content(prompt)
    
    try:
        cleaned_response = response.text.strip().replace("```json", "").replace("```", "").strip()
        return json.loads(cleaned_response)
    except (json.JSONDecodeError, AttributeError) as e:
        print(f"Error decoding AI response: {e}\nRaw response: {response.text}")
        return {
            "test_cases": [{
                "test_id": "ERR-001",
                "requirement_source": "N/A",
                "gherkin_feature": "Feature: AI Response Error...",
                "compliance_tags": []
            }]
        }

# --- Flask Web Application ---

app = Flask(__name__)
app.config['SECRET_KEY'] = secrets.token_hex(16)
app.config['UPLOAD_FOLDER'] = 'uploads'

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

@app.route('/', methods=['GET', 'POST'])
def index():
    test_data = None
    if request.method == 'POST':
        if 'requirement_file' not in request.files:
            flash('No file part')
            return render_template('index.html', test_data=test_data)
        
        file = request.files['requirement_file']
        if file.filename == '':
            flash('No selected file')
            return render_template('index.html', test_data=test_data)

        if file:
            try:
                # Get the domain from the form, default to 'healthcare software'
                domain = request.form.get('domain', 'healthcare software').strip()
                if not domain:
                    domain = 'healthcare software'

                file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
                file.save(file_path)

                configure_ai()
                requirement_text = read_requirement_file(file_path)
                test_data = generate_test_cases(requirement_text, domain)
                
                # Store the generated data in the session for later export
                session['last_test_data'] = test_data
                
                os.remove(file_path)

            except ValueError as e:
                flash(str(e))
            except Exception as e:
                flash(f'An error occurred: {e}')


    return render_template('index.html', test_data=test_data)

@app.route('/export/jira')
def export_to_jira():
    test_data = session.get('last_test_data')
    if not test_data or not test_data.get('test_cases'):
        flash("No test data available to export. Please generate tests first.")
        return redirect(url_for('index'))

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['Summary', 'Description', 'Issue Type'])

    for test in test_data['test_cases']:
        summary = f"{test.get('test_id', 'N/A')}: {test.get('requirement_source', 'N/A')}"
        
        # Using a multiline f-string for clarity and safety
        description = f"""*Requirement Source:*
{test.get('requirement_source', 'N/A')}

*Gherkin Test Case:*
{{code}}
{test.get('gherkin_feature', 'N/A')}
{{code}}

*Compliance Tags:*
{', '.join(test.get('compliance_tags', [])) if test.get('compliance_tags') else 'None'}"""
        
        issue_type = 'Test'
        writer.writerow([summary, description, issue_type])

    output.seek(0)

    response = make_response(output.getvalue())
    response.headers["Content-Disposition"] = "attachment; filename=jira_import.csv"
    response.headers["Content-type"] = "text/csv"

    return response

if __name__ == '__main__':
    app.run(debug=True)
