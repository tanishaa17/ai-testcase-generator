import os
import json
import re
import google.generativeai as genai
from dotenv import load_dotenv
from jira import JIRA
import docx
from pypdf import PdfReader
import xml.etree.ElementTree as ET
from azure.devops.connection import Connection
from msrest.authentication import BasicAuthentication
import requests
from datetime import datetime
import base64

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

# --- Azure DevOps Configuration ---

def configure_azure_devops(organization=None, personal_access_token=None):
    """Connects to Azure DevOps using provided credentials."""
    final_org = organization or os.environ.get("AZURE_DEVOPS_ORGANIZATION")
    final_token = personal_access_token or os.environ.get("AZURE_DEVOPS_PAT")

    if not all([final_org, final_token]):
        raise ValueError("Azure DevOps credentials are not fully configured or provided.")

    try:
        credentials = BasicAuthentication('', final_token)
        connection = Connection(base_url=f"https://dev.azure.com/{final_org}", creds=credentials)
        return connection
    except Exception as e:
        raise Exception(f"Azure DevOps connection failed: {e}")

def create_azure_devops_work_items(connection, gherkin_text, project=None):
    """Creates work items in Azure DevOps from Gherkin scenarios."""
    final_project = project or os.environ.get("AZURE_DEVOPS_PROJECT")
    if not final_project:
        raise ValueError("Azure DevOps project is not configured.")

    scenarios = re.split(r'(?=Scenario:|Scenario Outline:)', gherkin_text)
    if len(scenarios) < 2:
        print("No scenarios found in the generated text. Skipping Azure DevOps creation.")
        return []

    feature_header = scenarios[0]
    created_items = []
    
    try:
        wit_client = connection.clients.get_work_item_tracking_client()
        
        for scenario_text in scenarios[1:]:
            title = scenario_text.splitlines()[0].strip()
            description = f"```gherkin\n{feature_header}\n{scenario_text}\n```"
            
            # Create work item document
            work_item = {
                "op": "add",
                "path": "/fields/System.Title",
                "value": title
            }
            
            work_item_body = {
                "op": "add",
                "path": "/fields/System.Description",
                "value": description
            }
            
            work_item_additional = {
                "op": "add",
                "path": "/fields/System.WorkItemType",
                "value": "Test Case"
            }
            
            document = [work_item, work_item_body, work_item_additional]
            
            result = wit_client.create_work_item(document=document, project=final_project, type="Test Case")
            created_items.append(result.id)
            print(f"Successfully created Azure DevOps work item: {result.id} - '{title}'")
    except Exception as e:
        print(f"Failed to create Azure DevOps work item: {e}")
    
    return created_items

# --- GitHub Issues Configuration ---

def configure_github(token=None):
    """Configures GitHub API authentication."""
    final_token = token or os.environ.get("GITHUB_TOKEN")
    if not final_token:
        raise ValueError("GitHub token is not configured or provided.")
    return {"token": final_token}

def create_github_issues(github_config, test_cases, owner=None, repo=None):
    """Creates GitHub issues from test cases."""
    final_owner = owner or os.environ.get("GITHUB_OWNER")
    final_repo = repo or os.environ.get("GITHUB_REPO")
    
    if not all([final_owner, final_repo]):
        raise ValueError("GitHub owner and repo are not configured or provided.")
    
    headers = {
        "Authorization": f"Bearer {github_config['token']}",
        "Accept": "application/vnd.github.v3+json"
    }
    base_url = "https://api.github.com"
    created_issues = []
    
    for tc in test_cases:
        try:
            title = f"Test Case: {tc.get('test_id', 'TC')}"
            body = f"""## Test Case: {tc.get('test_id')}

**Requirement Source**: {tc.get('requirement_source', '')}

### Gherkin Feature
```gherkin
{tc.get('gherkin_feature', '')}
```

### Compliance
**Status**: {tc.get('compliance_assessment', {}).get('status', 'Unknown')}
**Risk Score**: {tc.get('risk_and_priority', {}).get('score', 0)}/10

### Compliance Tags
{', '.join(tc.get('compliance_tags', []))}
"""
            
            issue_data = {
                "title": title,
                "body": body,
                "labels": ["test-case", "generated"] + tc.get('compliance_tags', [])
            }
            
            response = requests.post(
                f"{base_url}/repos/{final_owner}/{final_repo}/issues",
                json=issue_data,
                headers=headers
            )
            
            if response.status_code == 201:
                issue = response.json()
                created_issues.append(issue['number'])
                print(f"Successfully created GitHub issue: #{issue['number']} - '{title}'")
            elif response.status_code == 401:
                error_msg = response.json().get('message', 'Bad credentials')
                raise Exception(f"GitHub authentication failed: {error_msg}. Please check your token at https://github.com/settings/tokens")
            elif response.status_code == 403:
                error_msg = response.json().get('message', 'Access denied')
                raise Exception(f"GitHub access denied: {error_msg}. Token needs 'repo' scope. Update token at https://github.com/settings/tokens")
            elif response.status_code == 404:
                raise Exception(f"Repository not found: {final_owner}/{final_repo}. Check owner and repo name are correct.")
            else:
                error_text = response.text[:200]
                print(f"Failed to create GitHub issue: '{title}'. Error: {error_text}")
                
        except Exception as e:
            # Re-raise critical errors
            if "authentication" in str(e).lower() or "access denied" in str(e).lower() or "not found" in str(e).lower():
                raise
            print(f"Failed to create GitHub issue: '{title}'. Error: {e}")
    
    if len(created_issues) == 0 and len(test_cases) > 0:
        raise Exception("No issues were created. Please check your GitHub token permissions and repository access.")
    
    return created_issues

# --- GitLab Issues Configuration ---

def configure_gitlab(url=None, token=None):
    """Configures GitLab API authentication."""
    final_url = url or os.environ.get("GITLAB_URL", "https://gitlab.com")
    final_token = token or os.environ.get("GITLAB_TOKEN")
    
    if not final_token:
        raise ValueError("GitLab token is not configured or provided.")
    
    return {"url": final_url.rstrip('/'), "token": final_token}

def create_gitlab_issues(gitlab_config, test_cases, project_id=None):
    """Creates GitLab issues from test cases."""
    final_project_id = project_id or os.environ.get("GITLAB_PROJECT_ID")
    
    if not final_project_id:
        raise ValueError("GitLab project ID is not configured or provided.")
    
    headers = {
        "PRIVATE-TOKEN": gitlab_config['token'],
        "Content-Type": "application/json"
    }
    base_url = gitlab_config['url']
    created_issues = []
    
    for tc in test_cases:
        try:
            title = f"Test Case: {tc.get('test_id', 'TC')}"
            description = f"""## Test Case: {tc.get('test_id')}

**Requirement Source**: {tc.get('requirement_source', '')}

### Gherkin Feature

```gherkin
{tc.get('gherkin_feature', '')}
```

### Compliance
**Status**: {tc.get('compliance_assessment', {}).get('status', 'Unknown')}
**Risk Score**: {tc.get('risk_and_priority', {}).get('score', 0)}/10

### Compliance Tags
{', '.join(tc.get('compliance_tags', []))}
"""
            
            labels = ["test-case", "generated"] + tc.get('compliance_tags', [])
            
            issue_data = {
                "title": title,
                "description": description,
                "labels": ",".join(labels)
            }
            
            response = requests.post(
                f"{base_url}/api/v4/projects/{final_project_id}/issues",
                json=issue_data,
                headers=headers
            )
            
            if response.status_code == 201:
                issue = response.json()
                created_issues.append(issue['iid'])
                print(f"Successfully created GitLab issue: !{issue['iid']} - '{title}'")
            else:
                print(f"Failed to create GitLab issue: '{title}'. Error: {response.text}")
                
        except Exception as e:
            print(f"Failed to create GitLab issue: '{title}'. Error: {e}")
    
    return created_issues

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
    Generates structured test cases with a compliance audit and risk score using the Gemini AI.
    Enhanced with GDPR compliance checks and deeper regulatory analysis.
    """
    prompt = f"""You are a world-class QA expert, compliance auditor, and risk assessor specializing in {domain} (e.g., regulated standards like FDA, IEC 62304 for healthcare, HIPAA, ISO 13485, GDPR, or PCI-DSS for finance).
Analyze the provided software requirement and generate a comprehensive set of test cases.

IMPORTANT: For healthcare domains, ensure GDPR and data privacy compliance is thoroughly addressed.

Your output MUST be a single, valid JSON object. Do not include any other text or markdown formatting.
The JSON object should have a single key: 'test_cases'.
The value should be a list of test case objects, where each object has the following keys:
  - "test_id": A unique identifier for the test case (e.g., "TC-001").
  - "requirement_source": The specific requirement sentence or phrase this test case validates.
  - "gherkin_feature": The full, complete Gherkin text for the test case, starting with "Feature:".
  - "compliance_tags": A list of strings identifying relevant compliance standards. MUST include GDPR for any data processing, ISO 13485/62304 for medical devices, HIPAA for US healthcare data, etc.
  - "compliance_assessment": An object containing an AI-powered audit of the test case. It must have two keys:
    - "status": A string, either "Compliant" or "Non-Compliant".
    - "reasoning": A detailed string explaining *why* the test case is or is not compliant with the specified standards, including specific GDPR considerations like data minimization, purpose limitation, user consent, and right to erasure where applicable.
  - "risk_and_priority": An object containing an AI-powered risk assessment. It must have two keys:
    - "score": An integer from 1 (lowest priority) to 10 (highest priority).
    - "reasoning": A detailed string explaining the score, based on the potential business, user, compliance (GDPR violations can result in fines up to 4% of global revenue), or patient safety impact if the feature fails.
  - "gdpr_compliance": An object (OPTIONAL, but MUST be included if the requirement involves any personal data). It contains:
    - "applies": A boolean indicating if GDPR applies to this test case.
    - "checks": An array of specific GDPR compliance checks being validated (e.g., ["Right to Access", "Data Minimization", "Consent Management"]).
    - "risks": An array of potential GDPR violation risks (e.g., ["Unauthorized access to personal data", "Insufficient consent mechanisms"]).

--- REQUIREMENT TEXT ---
{requirement_text}
--- END REQUIREMENT TEXT ---

Produce the JSON output now with comprehensive compliance analysis.
"""

    # Use the latest available model
    model = genai.GenerativeModel('gemini-2.5-flash')
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

# --- Requirements Traceability Matrix Generation ---

def generate_traceability_matrix(requirement_text, test_cases):
    """
    Generates a Requirements Traceability Matrix (RTM) that maps requirements to test cases.
    This is critical for FDA, IEC 62304, and ISO 13485 compliance.
    """
    matrix = {
        "requirement_text": requirement_text,
        "generation_timestamp": datetime.now().isoformat(),
        "total_test_cases": len(test_cases),
        "traceability_mapping": []
    }
    
    # Extract key requirements from the requirement text
    # Simple approach: split by sentences
    requirements = [req.strip() for req in requirement_text.split('.') if len(req.strip()) > 50]
    
    for i, requirement in enumerate(requirements[:20], 1):  # Limit to 20 requirements
        requirement_id = f"REQ-{i:03d}"
        
        # Find related test cases by checking requirement_source
        related_tests = [
            {
                "test_id": tc.get("test_id", ""),
                "compliance_status": tc.get("compliance_assessment", {}).get("status", "Unknown"),
                "risk_score": tc.get("risk_and_priority", {}).get("score", 0)
            }
            for tc in test_cases 
            if requirement_id in tc.get("requirement_source", "")[:100]  # Simple matching
        ]
        
        matrix["traceability_mapping"].append({
            "requirement_id": requirement_id,
            "requirement_text": requirement[:200] + "..." if len(requirement) > 200 else requirement,
            "related_test_cases": related_tests if related_tests else [{"test_id": "No direct mapping", "note": "Requirement not directly mapped to test cases"}],
            "coverage_status": "Covered" if related_tests else "Not Covered"
        })
    
    return matrix
