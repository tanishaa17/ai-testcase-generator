# 🏥 Gen-AI Test Case Auditor for Healthcare

**AI-Powered Test Case Generation with Healthcare Compliance (FDA, HIPAA, GDPR, ISO 13485)**

An enterprise-grade system that automatically converts healthcare software requirements into compliant, traceable test cases with seamless integration to Jira, Azure DevOps, and Polarion.

---

## 🚀 Live Demo

**Deployed Application**: [https://ai-testcase-generator-umber.vercel.app/](https://ai-testcase-generator-umber.vercel.app/)

---

## 📋 Table of Contents

- [Problem Statement](#problem-statement)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Healthcare Compliance](#healthcare-compliance)
- [Integration Guide](#integration-guide)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Problem Statement

Healthcare software development faces critical challenges:
- **Manual test creation** consuming 80% of QA time
- **Complex regulatory requirements** (FDA, HIPAA, GDPR, ISO 13485, IEC 62304)
- **Lack of traceability** making audits difficult
- **Limited integration** with existing enterprise ALM tools

**This system solves all of the above.**

---

## ✨ Key Features

### 🤖 AI-Powered Generation
- **Test Case Generation**: Automatically creates comprehensive test cases from requirements
- **Compliance Audit**: AI validates FDA, HIPAA, GDPR, ISO 13485, IEC 62304 compliance
- **Risk Assessment**: Priority scoring (1-10) based on business and compliance impact
- **GDPR Checks**: Data protection, consent management, right to erasure validation

### 🔗 Multi-Platform ALM Integration
- **Jira**: Create test cases as tickets
- **Azure DevOps**: Create work items automatically
- **Polarion**: Healthcare-specific ALM support

### 📊 Advanced Capabilities
- **Context Management**: Store and recall contextual information for continuous improvement
- **Feature Gap Analysis**: AI identifies missing test coverage
- **Traceability Matrix**: Automatic RTM for FDA/ISO 13485 audit readiness
- **Multi-Format Export**: JSON, Gherkin, XML, DOCX

### 📄 Flexible Input
- **File Upload**: PDF, DOCX, XML, TXT
- **Direct Text Entry**: Type or paste requirements
- **Chrome Extension**: Generate from any webpage

### 🏗️ Production-Ready
- **Scalable Architecture**: Horizontal scaling, stateless design
- **Error Handling**: Comprehensive error management
- **API-First**: Easy integration with any system
- **Health Monitoring**: Health check endpoint

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  EXTERNAL SYSTEMS                       │
│     Jira   │  Azure DevOps  │   Polarion  │  Custom    │
└────────────┼───────────────┼────────────┼──────────────┘
             │               │            │
             └───────────────┴────────────┘
                             │
      ┌──────────────────────▼───────────────────────┐
      │         REST API Layer (FastAPI)             │
      │  • Multi-format support • Rate limiting     │
      └──────────────────────┬───────────────────────┘
                             │
      ┌──────────────────────▼───────────────────────┐
      │          Application Layer                   │
      │  • Context Manager  • Feature Analyzer       │
      │  • Export Manager   • Traceability Engine    │
      └──────────────────────┬───────────────────────┘
                             │
      ┌──────────────────────▼───────────────────────┐
      │         Business Logic (core/)               │
      │  • AI Test Generation • Compliance Audit     │
      │  • Risk Assessment   • ALM Integration       │
      └──────────────────────┬───────────────────────┘
                             │
      ┌──────────────────────▼───────────────────────┐
      │         AI Layer (Google Gemini 2.5)         │
      │  • Healthcare domain knowledge               │
      │  • Regulatory compliance expertise           │
      └──────────────────────────────────────────────┘
```

### Core Modules

- **`core/logic.py`**: Test generation with compliance auditing
- **`core/context_manager.py`**: Context lifecycle management
- **`core/feature_analyzer.py`**: AI-powered gap analysis
- **`core/export_manager.py`**: Multi-format export
- **`app.py`**: FastAPI REST endpoints

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Python 3.9+, FastAPI, Uvicorn |
| **Frontend** | React 19, Material-UI (MUI) |
| **AI** | Google Gemini 2.5 Flash |
| **ALM Integration** | Jira API, Azure DevOps API, Polarion API |
| **File Processing** | PyPDF, python-docx, XML parser |
| **Deployment** | Docker-ready, Cloud-compatible |

---

## 📦 Installation

### Prerequisites
- Python 3.9 or higher
- Node.js 16+ and npm
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd ai-testcase-generator
```

### Step 2: Backend Setup
  ```bash
# Install dependencies
  pip install -r requirements.txt

# Configure environment variables
# Create .env file in root directory
```

**.env file**:
```env
GEMINI_API_KEY=your_gemini_api_key_here

# Optional - ALM credentials (can be configured via UI)
JIRA_SERVER=https://your-domain.atlassian.net
JIRA_USER=your-email@example.com
JIRA_API_TOKEN=your_jira_token
JIRA_PROJECT_KEY=PROJ

AZURE_DEVOPS_ORGANIZATION=myorg
AZURE_DEVOPS_PAT=your_pat
AZURE_DEVOPS_PROJECT=TestProject

POLARION_URL=https://polarion.example.com/polarion
POLARION_USER=username
POLARION_PASSWORD=password
POLARION_PROJECT_ID=HEALTHCARE
```

### Step 3: Frontend Setup
  ```bash
cd frontend
  npm install
  ```

### Step 4: Run the Application

**Terminal 1 - Backend**:
```bash
python app.py
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm start
# Opens http://localhost:3000
```

### Step 5: Chrome Extension (Optional)
1. Open Chrome and navigate to `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `chrome-extension` folder

---

## 💡 Usage

### Web Application

#### Generate Test Cases
1. Open `http://localhost:3000`
2. Select domain (e.g., "Healthcare")
3. Upload requirement file OR enter text
4. Click "Generate Test Cases"
5. Review generated test cases with compliance status

#### Configure ALM Integration
1. Click the Settings icon (⚙️)
2. Select platform (Jira/Azure DevOps/Polarion)
3. Enter credentials
4. Click "Save"
5. Click "Create in [Platform]" to sync test cases

#### Review Compliance
- Each test case shows:
  - **Compliance Status**: Compliant/Non-Compliant
  - **Risk Score**: 1-10 (with color coding)
  - **Compliance Tags**: FDA, HIPAA, GDPR, etc.
  - **Detailed Reasoning**: Why it's compliant or not

#### Enable Advanced Features
```bash
# Generate with context and gap analysis
POST /api/generate-from-text
{
  "requirement_text": "...",
  "domain": "Healthcare",
  "create_context": true,
  "analyze_gaps": true
}
```

### Chrome Extension
1. Ensure backend is running
2. Highlight text on any webpage
3. Right-click → "Generate AI Test Cases"
4. View generated test cases in new tab

### CLI Usage
```bash
python src/main.py -i requirements.txt -o output.feature --domain "Healthcare" --jira
```

---

## 📡 API Reference

### Health Check
```bash
GET /api/health
```

**Response**:
```json
{
  "status": "healthy",
  "version": "2.0.0",
  "features": ["Test case generation", "Jira integration", ...]
}
```

### Generate Test Cases
```bash
POST /api/generate-from-text
Content-Type: application/json

{
  "requirement_text": "Patient portal login system",
  "domain": "Healthcare",
  "create_context": true,
  "analyze_gaps": true,
  "include_traceability": false
}
```

### Export Test Cases
```bash
POST /api/export
Content-Type: application/json

{
  "test_cases": [...],
  "format": "xml",
  "output_path": "export.xml"
}
```

### Submit Feedback
```bash
POST /api/feedback
Content-Type: application/json

{
  "context_id": "ctx_abc123",
  "feedback": {
    "rating": 5,
    "comments": "Tests are comprehensive"
  }
```

### ALM Integration
```bash
POST /api/jira | /api/azure-devops | /api/polarion
Content-Type: application/json

{
  "test_cases": [...],
  "credentials": {...}
}
```

**Full API Documentation**: `http://localhost:5000/docs`

---

## 🏥 Healthcare Compliance

### Supported Standards

| Standard | Coverage | Implementation |
|----------|----------|----------------|
| **FDA 21 CFR 820** | Medical device regulations | Compliance tags, audit trails |
| **IEC 62304** | Medical device software | Traceability matrix |
| **ISO 13485** | Quality management | Test case validation |
| **HIPAA** | PHI protection | Data privacy checks |
| **GDPR** | Data protection | Consent, erasure, access rights |
| **ISO 27001** | Security | Risk assessment |

### Compliance Features
- ✅ **Automated Auditing**: AI validates compliance automatically
- ✅ **Risk Scoring**: 1-10 priority based on compliance impact
- ✅ **Traceability**: Requirements → Test Cases mapping
- ✅ **GDPR Validation**: Data protection checks built-in
- ✅ **Audit-Ready**: Complete documentation for regulatory audits

---

## 🔌 Integration Guide

### CI/CD Integration
```yaml
# .github/workflows/test-generation.yml
- name: Generate Test Cases
  run: |
    curl -X POST $API_URL/api/generate-from-text \
      -H "Content-Type: application/json" \
      -d '{"requirement_text": "${{ github.event.head_commit.message }}", 
           "domain": "Healthcare",
           "create_context": true,
           "analyze_gaps": true}'

- name: Create Jira Tickets
  run: |
    curl -X POST $API_URL/api/jira \
      -d @test_cases.json
```

### Webhook Integration
```python
# Send results to external system
@app.post("/webhook")
async def send_to_external_system(webhook_url: str, data: dict):
    async with aiohttp.ClientSession() as session:
        await session.post(webhook_url, json=data)
```

### Custom ALM Integration
```python
# Add your custom ALM platform
@app.post("/api/custom-alm")
async def custom_alm(request: CustomALMRequest):
    # Your integration logic
    pass
```

---

## 🐛 Troubleshooting

### Issue: "404 models/gemini-1.5-flash not found"
**Solution**: The model has been updated to `gemini-2.5-flash`. Clear cache and restart:
```bash
rm -rf __pycache__ core/__pycache__
python app.py
```

### Issue: Frontend hitting deployed URL instead of localhost
**Solution**: The frontend is configured for localhost. Verify `frontend/src/App.js`:
```javascript
const API_BASE_URL = 'http://localhost:5000';
```

### Issue: CORS errors
**Solution**: Backend already configured for CORS. If issues persist, check:
- Backend is running on port 5000
- Frontend is running on port 3000
- No firewall blocking connections

### Issue: "ModuleNotFoundError"
**Solution**: Install dependencies:
  ```bash
  pip install -r requirements.txt
cd frontend && npm install
```

### Issue: ALM integration failing
**Solution**: 
1. Verify credentials in Settings (⚙️)
2. Test connection with health endpoint
3. Check network connectivity to ALM platform

---

## 🚀 Deployment

### Docker
```dockerfile
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Cloud Deployment
- **GCP**: Vertex AI integration ready
- **AWS**: EC2, Lambda compatible
- **Azure**: Azure Functions ready

### Environment Variables
Set these in your deployment platform:
```env
GEMINI_API_KEY=...
JIRA_SERVER=...
JIRA_USER=...
# etc.
```

---

## 📈 Roadmap

- [ ] BigQuery integration for analytics dashboard
- [ ] Firebase for data persistence
- [ ] Vector database for semantic context retrieval
- [ ] Support for more ALM platforms (ServiceNow, Rally)
- [ ] Automated compliance reporting
- [ ] Machine learning model fine-tuning
- [ ] PDF export for formal reports

---

## 📄 License

MIT License

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📧 Contact

For questions or support, please open an issue in the repository.

---

**Built for Google AI Hackathon - Healthcare Challenge** 🏥🤖
