import os
import json
import re
import google.generativeai as genai
from dotenv import load_dotenv
from jira import JIRA
import docx
from pypdf import PdfReader
import xml.etree.ElementTree as ET

# Load environment variables from the .env file
load_dotenv(encoding="utf-8")

# --- AI Configuration ---

def configure_ai():
    """Configures the Gemini AI with the API key."""
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key or api_key == 'YOUR_API_KEY_HERE':
        raise ValueError("GEMINI_API_KEY not found or is a placeholder. Check your .env file.")
    genai.configure(api_key=api_key)

# --- Jira Configuration ---

def configure_jira(server=None, user=None, api_token=None):
    """Connects to Jira using provided credentials, falling back to environment variables."""
    # Prioritize provided arguments, fall back to environment variables
    final_server = server or os.environ.get("JIRA_SERVER")
    final_user = user or os.environ.get("JIRA_USER")
    final_token = api_token or os.environ.get("JIRA_API_TOKEN")

    if not all([final_server, final_user, final_token]):
        raise ValueError("Jira credentials are not fully configured or provided.")

    try:
        jira_client = JIRA(server=final_server, basic_auth=(final_user, final_token))
        # Test connection
        jira_client.server_info()
        return jira_client
    except Exception as e:
        raise Exception(f"Jira connection failed: {e}")

# --- File Processing ---

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

# --- AI Test Case Generation ---

def generate_test_cases(requirement_text, domain="healthcare software"):
    """
    Generates structured test cases with a compliance audit using the Gemini AI.
    """
    prompt = f"""You are a world-class QA expert and compliance auditor specializing in {domain} (e.g., regulated standards like FDA, IEC 62304 for healthcare, or PCI-DSS for finance).
Analyze the provided software requirement and generate a comprehensive set of test cases.
Your output MUST be a single, valid JSON object. Do not include any other text or markdown formatting.
The JSON object should have a single key: 'test_cases'.
The value should be a list of test case objects, where each object has the following keys:
  - "test_id": A unique identifier for the test case (e.g., "TC-001").
  - "requirement_source": The specific requirement sentence or phrase this test case validates.
  - "gherkin_feature": The full, complete Gherkin text for the test case, starting with "Feature:".
  - "compliance_tags": A list of strings identifying relevant compliance standards for the specified domain (e.g., ["ISO 13485", "GDPR"]).
  - "compliance_assessment": An object containing an AI-powered audit of the test case. It must have two keys:
    - "status": A string, either "Compliant" or "Non-Compliant".
    - "reasoning": A detailed string explaining *why* the test case is or is not compliant with the specified standards, referencing the requirement.

--- REQUIREMENT TEXT ---
{requirement_text}
--- END REQUIREMENT TEXT ---
Produce the JSON output now.
"""

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

# --- Output & Jira Handling ---

def save_output_to_file(content, file_path):
    """Saves the given content to a file, creating the directory if needed."""
    try:
        output_dir = os.path.dirname(file_path)
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
    except Exception as e:
        raise Exception(f"An error occurred while saving the file: {e}")

def create_jira_issues(jira_client, gherkin_text, project_key=None, parent_issue_key=None):
    """Parses Gherkin text and creates Jira issues, falling back to env for project key."""
    final_project_key = project_key or os.environ.get("JIRA_PROJECT_KEY")
    if not final_project_key:
        raise ValueError("JIRA_PROJECT_KEY is not configured or provided.")

    scenarios = re.split(r'(?=Scenario:|Scenario Outline:)', gherkin_text)
    if len(scenarios) < 2:
        print("No scenarios found in the generated text. Skipping Jira creation.")
        return []

    feature_header = scenarios[0]
    created_issues = []
    
    for scenario_text in scenarios[1:]:
        try:
            title = scenario_text.splitlines()[0].strip()
            
            issue_dict = {
                'project': {'key': final_project_key},
                'summary': title,
                'description': f"{{code:gherkin}}\n{feature_header}\n{scenario_text}{{code}}",
            }

            if parent_issue_key:
                issue_dict['parent'] = {'key': parent_issue_key}
                issue_dict['issuetype'] = {'name': 'Sub-task'}
            else:
                issue_dict['issuetype'] = {'name': 'Task'}
            
            new_issue = jira_client.create_issue(fields=issue_dict)
            print(f"Successfully created Jira issue: {new_issue.key} - '{title}'")
            created_issues.append(new_issue.key)

        except Exception as e:
            print(f"Failed to create Jira issue for scenario: '{title}'. Error: {e}")
    
    return created_issues
