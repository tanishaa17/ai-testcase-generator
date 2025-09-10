import os
import uvicorn
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import shutil

# Import the shared logic
from core.logic import (
    configure_ai,
    read_requirement_file,
    generate_test_cases,
    configure_jira,
    create_jira_issues
)

# --- Pydantic Models for Request Bodies ---

class JiraCredentials(BaseModel):
    server: Optional[str] = None
    user: Optional[str] = None
    api_token: Optional[str] = Field(None, alias='apiToken') # Allow frontend to use camelCase
    project_key: Optional[str] = Field(None, alias='projectKey') # Allow frontend to use camelCase

class JiraRequest(BaseModel):
    test_cases: List[Dict[str, Any]]
    credentials: JiraCredentials

# --- FastAPI Application ---

app = FastAPI(
    title="AI Test Case Generator API",
    description="An API to generate test cases from requirement documents and create Jira tickets.",
    version="1.0.0"
)

# Configure CORS
origins = [
    "http://localhost:3000",  # The address of our React frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.post("/api/generate")
async def generate_api(domain: str = Form("healthcare software"), requirement_file: UploadFile = File(...)):
    """
    Receives a requirement file and domain, then generates test cases using AI.
    """
    file_path = os.path.join(UPLOAD_FOLDER, requirement_file.filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(requirement_file.file, buffer)

        configure_ai()
        requirement_text = read_requirement_file(file_path)
        test_data = generate_test_cases(requirement_text, domain)

        if "error" in test_data:
            raise HTTPException(status_code=500, detail=test_data["error"])
        
        return test_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=f'An unexpected error occurred: {e}')
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

@app.post("/api/jira")
async def jira_api(request_data: JiraRequest):
    """
    Receives test case data and optional credentials, then creates issues in Jira.
    """
    try:
        creds = request_data.credentials
        
        # Extract Gherkin text from the test cases
        gherkin_texts = [tc['gherkin_feature'] for tc in request_data.test_cases]
        full_gherkin_output = "\n\n".join(gherkin_texts)

        if not full_gherkin_output.strip():
            raise HTTPException(status_code=400, detail="No Gherkin content found to create issues from")

        # Configure Jira with provided credentials (will fall back to .env if None)
        jira_client = configure_jira(server=creds.server, user=creds.user, api_token=creds.api_token)
        
        # Create issues with provided project key (will fall back to .env if None)
        created_issues = create_jira_issues(jira_client, full_gherkin_output, project_key=creds.project_key)
        
        return {"message": "Jira issues created successfully", "issues": created_issues}

    except Exception as e:
        # Catch exceptions from configure_jira or create_jira_issues
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == '__main__':
    uvicorn.run(app, host="0.0.0.0", port=5000)
