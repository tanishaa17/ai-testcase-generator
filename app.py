import os
import uvicorn
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import shutil
from datetime import datetime

# Import the shared logic
from core.logic import (
    configure_ai,
    read_requirement_file,
    generate_test_cases,
    configure_jira,
    create_jira_issues,
    configure_azure_devops,
    create_azure_devops_work_items,
    configure_polarion,
    create_polarion_test_cases,
    generate_traceability_matrix
)
from core.context_manager import get_context_manager
from core.feature_analyzer import analyze_feature_gaps, export_analysis_report
from core.export_manager import ExportManager

# --- Pydantic Models for Request Bodies ---

class JiraCredentials(BaseModel):
    server: Optional[str] = None
    user: Optional[str] = None
    api_token: Optional[str] = Field(None, alias='apiToken')
    project_key: Optional[str] = Field(None, alias='projectKey')

class AzureDevOpsCredentials(BaseModel):
    organization: Optional[str] = None
    personal_access_token: Optional[str] = Field(None, alias='pat')
    project: Optional[str] = None

class PolarionCredentials(BaseModel):
    url: Optional[str] = None
    user: Optional[str] = None
    password: Optional[str] = None
    project_id: Optional[str] = Field(None, alias='projectId')

class JiraRequest(BaseModel):
    test_cases: List[Dict[str, Any]]
    credentials: JiraCredentials

class AzureDevOpsRequest(BaseModel):
    test_cases: List[Dict[str, Any]]
    credentials: AzureDevOpsCredentials

class PolarionRequest(BaseModel):
    test_cases: List[Dict[str, Any]]
    credentials: PolarionCredentials

class FeedbackRequest(BaseModel):
    context_id: str
    feedback: Dict[str, Any]

class ExportRequest(BaseModel):
    test_cases: List[Dict[str, Any]]
    format: str = "json"
    output_path: Optional[str] = None

class TextGenerationRequest(BaseModel):
    requirement_text: str
    domain: Optional[str] = "General"
    include_traceability: Optional[bool] = False
    create_context: Optional[bool] = False
    analyze_gaps: Optional[bool] = False

# --- FastAPI Application ---

app = FastAPI(
    title="AI Test Case Generator API",
    description="An API to generate test cases from requirement documents with multi-platform ALM integration (Jira, Azure DevOps, Polarion).",
    version="1.0.0"
)

# Configure CORS to be more permissive for development and extension use
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.post("/api/generate")
async def generate_api_from_file(domain: str = Form("healthcare software"), requirement_file: UploadFile = File(...)):
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

@app.post("/api/generate-from-text")
async def generate_api_from_text(request: TextGenerationRequest):
    """
    Receives raw requirement text and domain, then generates test cases. For Chrome Extension.
    Enhanced with context management and feature gap analysis.
    """
    try:
        configure_ai()
        
        # Create context if requested
        context_id = None
        if request.create_context:
            ctx_manager = get_context_manager()
            context_id = ctx_manager.create_context(request.requirement_text, request.domain)
        
        # Generate test cases
        test_data = generate_test_cases(request.requirement_text, request.domain)
        if "error" in test_data:
            raise HTTPException(status_code=500, detail=test_data["error"])
        
        # Add traceability matrix if requested
        if request.include_traceability:
            traceability = generate_traceability_matrix(request.requirement_text, test_data.get('test_cases', []))
            test_data['traceability_matrix'] = traceability
        
        # Analyze feature gaps if requested
        if request.analyze_gaps and test_data.get('test_cases'):
            gaps = analyze_feature_gaps(request.requirement_text, test_data['test_cases'], request.domain)
            test_data['feature_gap_analysis'] = gaps
            
            # Store in context if context was created
            if context_id:
                ctx_manager = get_context_manager()
                ctx_manager.build_context(context_id, {"gap_analysis": gaps})
        
        # Add context ID to response if context was created
        if context_id:
            test_data['context_id'] = context_id
        
        return test_data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'An unexpected error occurred: {e}')

@app.post("/api/jira")
async def jira_api(request_data: JiraRequest):
    """
    Receives test case data and optional credentials, then creates issues in Jira.
    """
    try:
        creds = request_data.credentials
        gherkin_texts = [tc['gherkin_feature'] for tc in request_data.test_cases]
        full_gherkin_output = "\n\n".join(gherkin_texts)
        if not full_gherkin_output.strip():
            raise HTTPException(status_code=400, detail="No Gherkin content found to create issues from")
        jira_client = configure_jira(server=creds.server, user=creds.user, api_token=creds.api_token)
        created_issues = create_jira_issues(jira_client, full_gherkin_output, project_key=creds.project_key)
        return {"message": "Jira issues created successfully", "issues": created_issues}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/azure-devops")
async def azure_devops_api(request_data: AzureDevOpsRequest):
    """
    Receives test case data and optional credentials, then creates work items in Azure DevOps.
    """
    try:
        creds = request_data.credentials
        gherkin_texts = [tc['gherkin_feature'] for tc in request_data.test_cases]
        full_gherkin_output = "\n\n".join(gherkin_texts)
        if not full_gherkin_output.strip():
            raise HTTPException(status_code=400, detail="No Gherkin content found to create work items from")
        connection = configure_azure_devops(organization=creds.organization, personal_access_token=creds.personal_access_token)
        created_items = create_azure_devops_work_items(connection, full_gherkin_output, project=creds.project)
        return {"message": "Azure DevOps work items created successfully", "items": created_items}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/polarion")
async def polarion_api(request_data: PolarionRequest):
    """
    Receives test case data and optional credentials, then creates test cases in Polarion.
    """
    try:
        creds = request_data.credentials
        gherkin_texts = [tc['gherkin_feature'] for tc in request_data.test_cases]
        full_gherkin_output = "\n\n".join(gherkin_texts)
        if not full_gherkin_output.strip():
            raise HTTPException(status_code=400, detail="No Gherkin content found to create test cases from")
        polarion_config = configure_polarion(url=creds.url, user=creds.user, password=creds.password)
        created_items = create_polarion_test_cases(polarion_config, full_gherkin_output, project_id=creds.project_id)
        return {"message": "Polarion test cases created successfully", "items": created_items}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    """Health check endpoint for monitoring and deployment verification."""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0.0",
        "features": [
            "Test case generation",
            "Jira integration",
            "Azure DevOps integration",
            "Polarion integration",
            "GDPR compliance",
            "Traceability matrix",
            "Context management",
            "Feature gap analysis",
            "Multi-format export"
        ]
    }

@app.post("/api/feedback")
async def submit_feedback(request: FeedbackRequest):
    """
    Submit feedback for continuous improvement.
    Implements the feedback loop from the architecture.
    """
    try:
        ctx_manager = get_context_manager()
        updated_context = ctx_manager.add_feedback(request.context_id, request.feedback)
        return {
            "message": "Feedback submitted successfully",
            "context_id": request.context_id,
            "version": updated_context.get("version")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze-gaps")
async def analyze_gaps(requirement_text: str, test_cases: List[Dict[str, Any]], domain: str = "Healthcare"):
    """Standalone feature gap analysis endpoint."""
    try:
        analysis = analyze_feature_gaps(requirement_text, test_cases, domain)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/export")
async def export_test_cases(request: ExportRequest):
    """Export test cases in multiple formats."""
    try:
        export_mgr = ExportManager()
        result = export_mgr.export(request.test_cases, request.format, request.output_path)
        return {
            "message": "Export completed successfully",
            "format": request.format,
            "path": result if request.output_path else "returned_as_string",
            "content": result if not request.output_path else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/contexts")
async def list_contexts():
    """List all stored contexts."""
    try:
        ctx_manager = get_context_manager()
        contexts = ctx_manager.list_contexts()
        return {"contexts": contexts, "total": len(contexts)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/context/{context_id}")
async def get_context(context_id: str):
    """Retrieve a specific context."""
    try:
        ctx_manager = get_context_manager()
        context = ctx_manager.get_context(context_id)
        if not context:
            raise HTTPException(status_code=404, detail="Context not found")
        return context
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == '__main__':
    uvicorn.run(app, host="0.0.0.0", port=5000)