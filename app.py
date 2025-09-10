import os
import uvicorn
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import shutil

# Import the shared logic
from core.logic import (
    configure_ai,
    read_requirement_file,
    generate_test_cases,
    configure_jira,
    create_jira_issues
)

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
        # Save the uploaded file temporarily
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(requirement_file.file, buffer)

        # Call functions from the core module
        configure_ai()
        requirement_text = read_requirement_file(file_path)
        test_data = generate_test_cases(requirement_text, domain)

        if "error" in test_data:
            raise HTTPException(status_code=500, detail=test_data["error"])
        
        return test_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=f'An unexpected error occurred: {e}')
    finally:
        # Clean up the uploaded file
        if os.path.exists(file_path):
            os.remove(file_path)

@app.post("/api/jira")
async def jira_api(test_data: dict):
    """
    Receives test case data and creates corresponding issues in Jira.
    """
    if not test_data or 'test_cases' not in test_data:
        raise HTTPException(status_code=400, detail="Invalid or missing test case data")

    try:
        # Extract Gherkin text from the test cases
        gherkin_texts = [tc['gherkin_feature'] for tc in test_data['test_cases']]
        full_gherkin_output = "\n\n".join(gherkin_texts)

        if not full_gherkin_output.strip():
            raise HTTPException(status_code=400, detail="No Gherkin content found to create issues from")

        # Configure Jira and create issues
        jira_client = configure_jira()
        created_issues = create_jira_issues(jira_client, full_gherkin_output)
        
        return {"message": "Jira issues created successfully", "issues": created_issues}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f'An unexpected error occurred during Jira integration: {e}')


if __name__ == '__main__':
    uvicorn.run(app, host="0.0.0.0", port=5000)