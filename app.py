import os
from flask import Flask, request, jsonify
from flask_cors import CORS

# Import the shared logic
from core.logic import (
    configure_ai,
    read_requirement_file,
    generate_test_cases,
    configure_jira,
    create_jira_issues
)

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

            if "error" in test_data:
                return jsonify(test_data), 500
            
            return jsonify(test_data)

        except ValueError as e:
            return jsonify({"error": str(e)}), 400
        except Exception as e:
            return jsonify({"error": f'An unexpected error occurred: {e}'}), 500

    return jsonify({"error": "Invalid request"}), 400

@app.route('/api/jira', methods=['POST'])
def jira_api():
    data = request.get_json()
    if not data or 'test_cases' not in data:
        return jsonify({"error": "Invalid or missing test case data"}), 400

    try:
        # Extract Gherkin text from the test cases
        gherkin_texts = [tc['gherkin_feature'] for tc in data['test_cases']]
        full_gherkin_output = "\n\n".join(gherkin_texts)

        if not full_gherkin_output.strip():
            return jsonify({"error": "No Gherkin content found to create issues from"}), 400

        # Configure Jira and create issues
        jira_client = configure_jira()
        created_issues = create_jira_issues(jira_client, full_gherkin_output)
        
        return jsonify({"message": "Jira issues created successfully", "issues": created_issues})

    except Exception as e:
        return jsonify({"error": f'An unexpected error occurred during Jira integration: {e}'}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
