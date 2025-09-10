import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv
import docx
from pypdf import PdfReader
import xml.etree.ElementTree as ET

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
            "error": "Failed to decode AI response",
            "raw_response": response.text
        }

# --- Flask API Application ---

app = Flask(__name__)
CORS(app)  # Initialize CORS

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/api/generate', methods=['POST'])
def generate_api():
    if 'requirement_file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['requirement_file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    domain = request.form.get('domain', 'healthcare software').strip()
    if not domain:
        domain = 'healthcare software'

    if file:
        try:
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
            file.save(file_path)

            configure_ai()
            requirement_text = read_requirement_file(file_path)
            test_data = generate_test_cases(requirement_text, domain)

            os.remove(file_path)

            # Check if the AI returned an error
            if "error" in test_data:
                return jsonify(test_data), 500
            
            return jsonify(test_data)

        except ValueError as e:
            return jsonify({"error": str(e)}), 400
        except Exception as e:
            return jsonify({"error": f'An unexpected error occurred: {e}'}), 500

    return jsonify({"error": "Invalid request"}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)
