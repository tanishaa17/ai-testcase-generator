import os
import re
import google.generativeai as genai
from dotenv import load_dotenv
import argparse
from jira import JIRA
import docx
from pypdf import PdfReader
import xml.etree.ElementTree as ET

# Load environment variables from the .env file
load_dotenv(encoding="utf-8")

def configure_ai():
    """Configures the Gemini AI with the API key."""
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key or api_key == 'YOUR_API_KEY_HERE':
        raise ValueError("GEMINI_API_KEY not found or is a placeholder. Check your .env file.")
    genai.configure(api_key=api_key)

def configure_jira():
    """Connects to Jira using credentials from environment variables."""
    server = os.environ.get("JIRA_SERVER")
    user = os.environ.get("JIRA_USER")
    api_token = os.environ.get("JIRA_API_TOKEN")

    if not all([server, user, api_token]) or "your-domain" in server or "your-email" in user or "your_api_token" in api_token:
        raise ValueError("Jira credentials are not fully configured in .env file. Please check JIRA_SERVER, JIRA_USER, and JIRA_API_TOKEN.")

    print(f"Connecting to Jira server at: {server}")
    try:
        jira_client = JIRA(server=server, basic_auth=(user, api_token))
        jira_client.server_info()
        print("Jira connection successful.")
        return jira_client
    except Exception as e:
        raise Exception(f"Jira connection failed: {e}")


def read_requirement_file(file_path):
    """Reads the content of the requirement file, supporting .txt, .pdf, .docx, and .xml."""
    try:
        if file_path.lower().endswith('.pdf'):
            reader = PdfReader(file_path)
            text = ""
            for page in reader.pages:
                text += page.extract_text() or ""
            return text
        elif file_path.lower().endswith('.docx'):
            doc = docx.Document(file_path)
            text = ""
            for para in doc.paragraphs:
                text += para.text + '\n'
            return text
        elif file_path.lower().endswith('.xml'):
            tree = ET.parse(file_path)
            root = tree.getroot()
            text = ""
            for elem in root.iter():
                if elem.text and elem.text.strip():
                    text += elem.text.strip() + '\n'
            return text
        elif file_path.lower().endswith('.txt'):
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        else:
            raise ValueError(f"Unsupported file type: {file_path}. Only .txt, .pdf, .docx, and .xml are supported.")
    except FileNotFoundError:
        raise FileNotFoundError(f"Error: Requirement file not found at {file_path}")
    except Exception as e:
        raise Exception(f"An error occurred while reading the file: {e}")

def generate_test_cases(requirement_text):
    """Generates test cases using the Gemini AI."""
    prompt = (
        "You are an expert QA Engineer specializing in healthcare software compliance and testing.\n"
        "Your task is to analyze the provided software requirement and generate a comprehensive set of test cases.\n\n"
        "The output must be in Gherkin format, starting with a 'Feature' definition.\n"
        "Each scenario must start with the keyword 'Scenario:' or 'Scenario Outline:'.\n"
        "The test cases should cover:\n"
        "1.  Positive scenarios (happy paths).\n"
        "2.  Negative scenarios (error conditions, invalid inputs).\n"
        "3.  Security aspects mentioned in the requirement (e.g., masking sensitive data).\n\n"
        "Here is the requirement:\n"
        "---\n"
        "{requirement}\n"
        "---\n"
    )
    model = genai.GenerativeModel('gemini-1.5-flash')
    full_prompt = prompt.format(requirement=requirement_text)
    print("Sending requirement to Gemini AI...")
    response = model.generate_content(full_prompt)
    print("...Response received.")
    return response.text

def save_output_to_file(content, file_path):
    """Saves the given content to a file, creating the directory if needed."""
    try:
        output_dir = os.path.dirname(file_path)
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"\nSuccessfully saved test cases to: {file_path}")
    except Exception as e:
        raise Exception(f"An error occurred while saving the file: {e}")

def create_jira_issues(jira_client, gherkin_text, parent_issue_key=None):
    """Parses Gherkin text and creates Jira issues, optionally as sub-tasks."""
    project_key = os.environ.get("JIRA_PROJECT_KEY")
    if not project_key or "PROJ" in project_key:
        raise ValueError("JIRA_PROJECT_KEY is not configured in .env file.")

    print(f"\n--- Creating Jira Issues in Project: {project_key} ---")
    if parent_issue_key:
        print(f"Linking new issues to parent: {parent_issue_key}")

    scenarios = re.split(r'(?=Scenario:|Scenario Outline:)', gherkin_text)
    if len(scenarios) < 2:
        print("No scenarios found in the generated text. Skipping Jira creation.")
        return

    feature_header = scenarios[0]
    
    for scenario_text in scenarios[1:]:
        try:
            title = scenario_text.splitlines()[0].strip()
            
            issue_dict = {
                'project': {'key': project_key},
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

        except Exception as e:
            print(f"Failed to create Jira issue for scenario: '{title}'. Error: {e}")

def main():
    """Wraps the main execution logic."""
    parser = argparse.ArgumentParser(description="Generate AI-powered test cases from requirement files.")
    parser.add_argument("-i", "--input", required=True, help="Path to the input requirement file.")
    parser.add_argument("-o", "--output", required=True, help="Path for the generated output Gherkin file.")
    parser.add_argument("--jira", action='store_true', help="If set, create issues in Jira for each test scenario.")
    parser.add_argument("--parent-issue", help="Jira key of the parent issue for sub-tasks.")
    args = parser.parse_args()

    try:
        configure_ai()
        print("AI configuration successful.")
        
        print(f"Reading requirement from: {args.input}")
        requirement_text = read_requirement_file(args.input)
        
        print("\n--- Generating Test Cases ---")
        generated_tests = generate_test_cases(requirement_text)
        
        save_output_to_file(generated_tests, args.output)

        if args.jira:
            jira_client = configure_jira()
            create_jira_issues(jira_client, generated_tests, args.parent_issue)

    except Exception as e:
        print(f"\nAn error occurred during execution: {e}")


if __name__ == "__main__":
    main()
