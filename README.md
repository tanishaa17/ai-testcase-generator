# 🏥 Gen-AI Test Case Auditor for Healthcare

**AI-Powered Test Case Generation with Healthcare Compliance (FDA, HIPAA, GDPR, ISO 13485)**

An enterprise-grade system that automatically converts healthcare software requirements into compliant, traceable test cases with seamless integration to Jira, Azure DevOps, GitHub Issues, and GitLab Issues.

---

## 🚀 Live Demo

**Deployed Application**: [https://ai-testcase-generator-umber.vercel.app/](https://ai-testcase-generator-umber.vercel.app/)

---

## 📋 Table of Contents

- [Problem Statement](#problem-statement)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Complete Installation Guide](#complete-installation-guide)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Running the Application](#running-the-application)
- [ALM Platform Integration](#alm-platform-integration)
  - [Jira Setup](#jira-setup)
  - [Azure DevOps Setup](#azure-devops-setup)
  - [GitHub Issues Setup](#github-issues-setup)
  - [GitLab Issues Setup](#gitlab-issues-setup)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Healthcare Compliance](#healthcare-compliance)
- [Troubleshooting](#troubleshooting)
- [Deployment](#deployment)

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
- **Jira**: Create test cases as tickets (Free tier available)
- **Azure DevOps**: Create work items automatically (Free tier available)
- **GitHub Issues**: Create issues in GitHub repositories (Free, most accessible)
- **GitLab Issues**: Create issues in GitLab projects (Free tier available)

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
│     Jira   │  Azure DevOps  │   GitHub    │  GitLab    │
└────────────┼───────────────┼────────────┼──────────────┘
             │               │            │
             └───────────────┴────────────┘
                             │
      ┌──────────────────────▼───────────────────────┐
      │         REST API Layer (FastAPI)             │
      │  • Multi-format support • CORS handling      │
      └──────────────────────┬───────────────────────┘
                             │
      ┌──────────────────────▼───────────────────────┐
      │          Application Layer                   │
      │  • Context Manager  • Feature Analyzer       │
      │  • Export Manager   • Traceability Engine     │
      └──────────────────────┬───────────────────────┘
                             │
      ┌──────────────────────▼───────────────────────┐
      │         Business Logic (core/)                │
      │  • AI Test Generation • Compliance Audit      │
      │  • Risk Assessment   • ALM Integration        │
      └──────────────────────┬───────────────────────┘
                             │
      ┌──────────────────────▼───────────────────────┐
      │         AI Layer (Google Gemini 2.5)         │
      │  • Healthcare domain knowledge                 │
      │  • Regulatory compliance expertise            │
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
| **ALM Integration** | Jira API, Azure DevOps API, GitHub API, GitLab API |
| **File Processing** | PyPDF, python-docx, XML parser |
| **Deployment** | Docker-ready, Cloud-compatible |

---

## 📦 Complete Installation Guide

### Prerequisites
- **Python 3.9+** ([Download](https://www.python.org/downloads/))
- **Node.js 16+** and npm ([Download](https://nodejs.org/))
- **Google Gemini API key** ([Get one here](https://makersuite.google.com/app/apikey))

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd ai-testcase-generator
```

---

## 🔧 Backend Setup

### Step 1: Install Python Dependencies

```bash
# Install all required packages
pip install -r requirements.txt
```

**If you get permission errors on Windows:**
```bash
pip install --user -r requirements.txt
```

### Step 2: Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Required: Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: ALM credentials (can also be configured via UI)
# Jira
JIRA_SERVER=https://your-domain.atlassian.net
JIRA_USER=your-email@example.com
JIRA_API_TOKEN=your_jira_token
JIRA_PROJECT_KEY=PROJ

# Azure DevOps
AZURE_DEVOPS_ORGANIZATION=myorg
AZURE_DEVOPS_PAT=your_pat
AZURE_DEVOPS_PROJECT=TestProject

# GitHub (can use classic token for easier setup)
GITHUB_TOKEN=your_github_token
GITHUB_OWNER=your-username
GITHUB_REPO=test-cases-repo

# GitLab
GITLAB_URL=https://gitlab.com
GITLAB_TOKEN=your_gitlab_token
GITLAB_PROJECT_ID=12345678
```

**Note**: ALM credentials can be configured via the web UI (Settings), so you don't need to set them in `.env` if you prefer.

### Step 3: Verify Backend Setup

```bash
# Test if dependencies are installed correctly
python -c "import fastapi; print('FastAPI installed')"
python -c "import google.generativeai; print('Gemini SDK installed')"
```

---

## 🎨 Frontend Setup

### Step 1: Navigate to Frontend Directory

```bash
cd frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

**If you get errors:**
```bash
# Clear cache and retry
npm cache clean --force
npm install
```

### Step 3: Verify Frontend Setup

```bash
# Check if React is installed
npm list react
```

### Step 4: Configure API Endpoint

The frontend is already configured to use `http://localhost:5000` for local development. No changes needed!

---

## 🚀 Running the Application

### Start the Backend Server

**Terminal 1:**
```bash
# From root directory
python app.py
```

**Expected output:**
```
INFO:     Started server process [xxxx]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:5000 (Press CTRL+C to quit)
```

**Server is now running at:** `http://localhost:5000`

**API Documentation:** `http://localhost:5000/docs` (Swagger UI)

### Start the Frontend Development Server

**Terminal 2:**
```bash
# From root directory (or navigate to frontend/)
cd frontend
npm start
```

**Expected output:**
```
Compiled successfully!

You can now view the app in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

**Frontend is now running at:** `http://localhost:3000`

### Verify Both Servers Are Running

1. **Backend Health Check:**
   ```bash
   curl http://localhost:5000/api/health
   # Or visit: http://localhost:5000/api/health
   ```

2. **Frontend:**
   - Open browser: `http://localhost:3000`
   - You should see the application interface

---

## 🔌 ALM Platform Integration

The system supports 4 ALM platforms. Configure credentials via the web UI (Settings ⚙️) or `.env` file.

---

### 📌 Jira Setup

#### Step 1: Get Jira Account
1. Go to: https://www.atlassian.com/try/cloud/signup
2. Choose **"Jira"** (Free tier available for up to 10 users)
3. Complete signup and create your site (e.g., `yourcompany.atlassian.net`)

#### Step 2: Create API Token
1. Go to: https://id.atlassian.com/manage-profile/security/api-tokens
2. Click **"Create API token"**
3. Name it: `Test Case Generator`
4. Click **"Create"**
5. **Copy the token immediately!** (You won't see it again)

#### Step 3: Create a Project
1. In Jira, click **"Projects"** → **"Create project"**
2. Choose template (e.g., "Basic")
3. Name your project (e.g., `Healthcare Test Cases`)
4. **Note the Project Key** (e.g., `PROJ`, `TEST`)

#### Step 4: Configure in Our System

**Via Web UI (Recommended):**
1. Open `http://localhost:3000`
2. Click Settings icon (⚙️)
3. Select **"Jira"**
4. Enter:
   ```
   Server URL: https://yourcompany.atlassian.net
   Email: your-email@example.com
   API Token: [paste your token]
   Project Key: PROJ
   ```
5. Click **"Save"**

**Via .env file:**
```env
JIRA_SERVER=https://yourcompany.atlassian.net
JIRA_USER=your-email@example.com
JIRA_API_TOKEN=your_api_token_here
JIRA_PROJECT_KEY=PROJ
```

#### Step 5: Test Integration
1. Generate test cases
2. Select **"Jira"** from dropdown
3. Click **"Create in Jira"**
4. Check your Jira project's backlog!

---

### 📌 Azure DevOps Setup

#### Step 1: Get Azure DevOps Account
1. Go to: https://azure.microsoft.com/services/devops/
2. Sign up for free (5 users free forever)
3. Create an organization (e.g., `myorg`)

#### Step 2: Create Personal Access Token (PAT)
1. Go to: https://dev.azure.com/your-org/_usersSettings/tokens
   (Or: Azure DevOps → User Settings → Personal Access Tokens)
2. Click **"New Token"**
3. Fill in:
   - **Name**: `Test Case Generator`
   - **Organization**: Select your org
   - **Expiration**: 90 days
   - **Scopes**: Check **"Work items: Read & write"**
4. Click **"Create"**
5. **Copy the token immediately!**

#### Step 3: Create a Project
1. In Azure DevOps, click **"New project"**
2. Name: `Healthcare Test Cases`
3. Visibility: Private or Public
4. Click **"Create"**

#### Step 4: Configure in Our System

**Via Web UI:**
1. Click Settings (⚙️)
2. Select **"Azure DevOps"**
3. Enter:
   ```
   Organization: myorg
   Personal Access Token: [paste your PAT]
   Project: Healthcare Test Cases
   ```
4. Click **"Save"**

**Via .env file:**
```env
AZURE_DEVOPS_ORGANIZATION=myorg
AZURE_DEVOPS_PAT=your_pat_here
AZURE_DEVOPS_PROJECT=Healthcare Test Cases
```

#### Step 5: Test Integration
1. Generate test cases
2. Select **"Azure DevOps"**
3. Click **"Create in Azure DevOps"**
4. Check your Azure DevOps project's Work Items!

---

### 📌 GitHub Issues Setup

**GitHub is the easiest to set up! Perfect for demos.**

#### Step 1: Get GitHub Token (Classic Token - Recommended)

**Why Classic Token?** Simpler setup, works immediately, no repository selection needed.

1. Go to: https://github.com/settings/tokens
2. Click **"Tokens (classic)"** tab (top right)
3. Click **"Generate new token"** → **"Generate new token (classic)"**
4. Fill in:
   - **Note**: `Test Case Generator`
   - **Expiration**: 90 days (or custom)
   - **Scopes**: ✅ Check **"repo"** (Full control of private repositories)
     - This automatically includes everything needed!
5. Click **"Generate token"**
6. **Copy the token immediately!** (starts with `ghp_...`)

**Alternative: Fine-Grained Token (Advanced)**
If you prefer fine-grained tokens:
1. Go to: https://github.com/settings/tokens/new
2. **Repository access**: Select "Only select repositories" → Add your repository
3. **Repository permissions**: Set "Issues" to **"Read and write"**
4. Generate and copy token

#### Step 2: Create a Repository
1. Go to: https://github.com/new
2. Repository name: `healthcare-test-cases` (or any name)
3. Choose: Public or Private
4. Click **"Create repository"**

#### Step 3: Configure in Our System

**Via Web UI (Easiest):**
1. Open `http://localhost:3000`
2. Click Settings (⚙️)
3. Select **"GitHub Issues"**
4. Enter:
   ```
   Personal Access Token: [paste your token]
   Repository Owner: your-username
   Repository Name: healthcare-test-cases
   ```
5. Click **"Save"**

**Via .env file:**
```env
GITHUB_TOKEN=ghp_your_token_here
GITHUB_OWNER=your-username
GITHUB_REPO=healthcare-test-cases
```

#### Step 4: Test Integration
1. Generate test cases
2. Select **"GitHub Issues"** from dropdown
3. Click **"Create in GitHub Issues"**
4. Visit: `https://github.com/your-username/healthcare-test-cases/issues`
5. See your test cases as GitHub Issues! 🎉

#### Troubleshooting GitHub Token Issues

**Error: "Resource not accessible by personal access token" (403)**
- Token doesn't have "repo" scope
- Solution: Create a new classic token with "repo" scope checked ✅

**Error: "Bad credentials" (401)**
- Token is invalid or expired
- Solution: Generate a new token at https://github.com/settings/tokens

**Error: "Not found" (404)**
- Repository doesn't exist or name is wrong
- Solution: Verify repository exists and names are correct (case-sensitive)

---

### 📌 GitLab Issues Setup

#### Step 1: Get GitLab Token
1. Go to: https://gitlab.com/-/user_settings/personal_access_tokens
   (Or: GitLab → Profile → Access Tokens)
2. Fill in:
   - **Token name**: `Test Case Generator`
   - **Expiration date**: Set if needed
   - **Scopes**: Check **"api"**
3. Click **"Create personal access token"**
4. **Copy the token!**

#### Step 2: Create a Project
1. Go to: https://gitlab.com/projects/new
2. Click **"Create blank project"**
3. Fill in:
   - **Project name**: `Healthcare Test Cases`
   - **Visibility**: Public or Private
4. Click **"Create project"**

#### Step 3: Get Project ID
1. Open your project
2. Go to: **Settings** → **General**
3. Scroll to **"Project ID"** (it's a number like `12345678`)
4. **Copy this number**

#### Step 4: Configure in Our System

**Via Web UI:**
1. Click Settings (⚙️)
2. Select **"GitLab Issues"**
3. Enter:
   ```
   GitLab URL: https://gitlab.com
   Personal Access Token: [paste your token]
   Project ID: 12345678
   ```
4. Click **"Save"**

**Via .env file:**
```env
GITLAB_URL=https://gitlab.com
GITLAB_TOKEN=your_token_here
GITLAB_PROJECT_ID=12345678
```

**For Self-Hosted GitLab:**
- Use your GitLab server URL instead of `https://gitlab.com`

#### Step 5: Test Integration
1. Generate test cases
2. Select **"GitLab Issues"**
3. Click **"Create in GitLab Issues"**
4. Check your GitLab project's Issues tab!

---

## 💡 Usage

### Web Application

#### Generate Test Cases
1. Open `http://localhost:3000`
2. Select domain (e.g., "Healthcare")
3. **Option A**: Upload requirement file (PDF, DOCX, XML, TXT)
4. **Option B**: Enter/paste requirement text directly
5. Click **"Generate Test Cases"**
6. Review generated test cases with compliance status

#### Configure ALM Integration
1. Click the Settings icon (⚙️)
2. Select platform (Jira/Azure DevOps/GitHub/GitLab)
3. Enter credentials (see setup guides above)
4. Click **"Save"**
5. Generate test cases
6. Select your ALM platform from dropdown
7. Click **"Create in [Platform]"** to sync test cases

#### Review Compliance
Each test case shows:
- **Compliance Status**: Compliant/Non-Compliant
- **Risk Score**: 1-10 (with color coding)
- **Compliance Tags**: FDA, HIPAA, GDPR, ISO 13485, etc.
- **Detailed Reasoning**: Why it's compliant or not

#### Export Test Cases
1. After generating test cases
2. Click **"Export"** button
3. Choose format: JSON, Gherkin, XML, or DOCX
4. Download file

### Chrome Extension (Optional)
1. Open Chrome and navigate to `chrome://extensions`
2. Enable **"Developer mode"** (top right)
3. Click **"Load unpacked"**
4. Select the `chrome-extension` folder
5. Right-click on any webpage text → **"Generate AI Test Cases"**

### CLI Usage
```bash
python src/main.py -i requirements.txt -o output.feature --domain "Healthcare" --jira
```

---

## 📡 API Reference

### Health Check
```bash
GET http://localhost:5000/api/health
```

**Response:**
```json
{
  "status": "healthy",
  "version": "2.0.0",
  "features": ["Test case generation", "Jira integration", "GitHub integration", ...]
}
```

### Generate Test Cases
```bash
POST http://localhost:5000/api/generate-from-text
Content-Type: application/json

{
  "requirement_text": "Patient portal login system with encryption",
  "domain": "Healthcare",
  "create_context": true,
  "analyze_gaps": true,
  "include_traceability": false
}
```

**Response:**
```json
{
  "test_cases": [
    {
      "test_id": "TC-001",
      "requirement_source": "...",
      "gherkin_feature": "Feature: ...",
      "compliance_tags": ["HIPAA", "GDPR"],
      "compliance_assessment": {
        "status": "Compliant",
        "reasoning": "..."
      },
      "risk_and_priority": {
        "score": 9,
        "reasoning": "..."
      }
    }
  ],
  "context_id": "ctx_abc123",
  "traceability_matrix": {...}
}
```

### Export Test Cases
```bash
POST http://localhost:5000/api/export
Content-Type: application/json

{
  "test_cases": [...],
  "format": "xml",
  "output_path": "export.xml"
}
```

### ALM Integration

**Jira:**
```bash
POST http://localhost:5000/api/jira
Content-Type: application/json

{
  "test_cases": [...],
  "credentials": {
    "server": "https://yourcompany.atlassian.net",
    "user": "your-email@example.com",
    "api_token": "your_token",
    "project_key": "PROJ"
  }
}
```

**Azure DevOps:**
```bash
POST http://localhost:5000/api/azure-devops
Content-Type: application/json

{
  "test_cases": [...],
  "credentials": {
    "organization": "myorg",
    "pat": "your_pat",
    "project": "TestProject"
  }
}
```

**GitHub:**
```bash
POST http://localhost:5000/api/github
Content-Type: application/json

{
  "test_cases": [...],
  "credentials": {
    "token": "ghp_your_token",
    "owner": "your-username",
    "repo": "your-repo"
  }
}
```

**GitLab:**
```bash
POST http://localhost:5000/api/gitlab
Content-Type: application/json

{
  "test_cases": [...],
  "credentials": {
    "url": "https://gitlab.com",
    "token": "your_token",
    "project_id": "12345678"
  }
}
```

### Submit Feedback
```bash
POST http://localhost:5000/api/feedback
Content-Type: application/json

{
  "context_id": "ctx_abc123",
  "feedback": {
    "rating": 5,
    "comments": "Tests are comprehensive"
  }
}
```

**Full API Documentation**: Visit `http://localhost:5000/docs` for interactive Swagger UI

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

## 🐛 Troubleshooting

### Backend Issues

#### Issue: "404 models/gemini-2.5-flash not found"
**Solution**: 
1. Verify your `GEMINI_API_KEY` is set correctly in `.env`
2. Check API key is valid at: https://makersuite.google.com/app/apikey
3. Clear Python cache and restart:
   ```bash
   rm -rf __pycache__ core/__pycache__
   python app.py
   ```

#### Issue: "ModuleNotFoundError: No module named 'X'"
**Solution**: Install missing dependencies
```bash
pip install -r requirements.txt
```

#### Issue: "Error loading ASGI app. Could not import module 'app.main'"
**Solution**: You're using the wrong command. Use:
```bash
python app.py
```
NOT: `uvicorn app.main:app --reload`

#### Issue: Port 5000 already in use
**Solution**: 
```bash
# Windows: Find and kill process
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change port in app.py
```

### Frontend Issues

#### Issue: Frontend can't connect to backend
**Solution**: 
1. Verify backend is running on `http://localhost:5000`
2. Check `frontend/src/App.js` has:
   ```javascript
   const API_BASE_URL = 'http://localhost:5000';
   ```
3. Clear browser cache and reload

#### Issue: CORS errors
**Solution**: Backend already configured for CORS. If issues persist:
- Ensure backend is running
- Check firewall isn't blocking connections
- Try accessing API docs: `http://localhost:5000/docs`

#### Issue: npm install fails
**Solution**:
```bash
# Clear cache and retry
npm cache clean --force
npm install

# Or delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### ALM Integration Issues

#### Jira: "Unauthorized" or "Forbidden"
**Solution**:
- Verify API token is correct
- Check server URL format: `https://yourcompany.atlassian.net` (not trailing slash)
- Ensure email matches your Jira account
- Verify project key exists

#### Azure DevOps: "401 Unauthorized"
**Solution**:
- Verify PAT is correct (regenerate if needed)
- Check organization name is correct
- Ensure PAT has "Work items: Read & write" scope
- Verify project name matches exactly

#### GitHub: "Resource not accessible" (403)
**Solution**:
- Token doesn't have "repo" scope
- Create new classic token with "repo" scope: https://github.com/settings/tokens
- Use classic token (easier) instead of fine-grained

#### GitHub: "Bad credentials" (401)
**Solution**:
- Token is invalid or expired
- Generate new token: https://github.com/settings/tokens
- Verify token starts with `ghp_`

#### GitHub: "Not found" (404)
**Solution**:
- Repository doesn't exist
- Check owner and repo names are correct (case-sensitive)
- Verify you have access to the repository

#### GitLab: "401 Unauthorized"
**Solution**:
- Verify token is correct
- Check token has "api" scope
- For self-hosted: verify URL is correct

#### GitLab: "Project not found"
**Solution**:
- Verify Project ID is correct (numeric, found in Settings → General)
- Check token has access to the project

### General Issues

#### Issue: Generated test cases seem incorrect
**Solution**:
- Provide more detailed requirement text
- Specify domain explicitly
- Enable gap analysis: `"analyze_gaps": true`

#### Issue: Slow test case generation
**Solution**:
- Normal: AI processing takes 10-30 seconds
- Check internet connection (uses Google Gemini API)
- Reduce number of requirements if batch processing

---

## 🚀 Deployment

### Docker Deployment

**Dockerfile:**
```dockerfile
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "5000"]
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "5000:5000"
    environment:
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    volumes:
      - ./uploads:/app/uploads
```

### Cloud Deployment

**Backend:**
- **Render**: Upload and set environment variables
- **Heroku**: Add `Procfile`: `web: uvicorn app:app --host 0.0.0.0 --port $PORT`
- **AWS EC2**: Install dependencies, run `python app.py`
- **GCP Cloud Run**: Package as container, deploy

**Frontend:**
- **Vercel**: Connect GitHub repo, auto-deploys
- **Netlify**: Build command: `npm run build`, publish directory: `build`
- **AWS S3 + CloudFront**: Static hosting

### Environment Variables

Set these in your deployment platform:
```env
GEMINI_API_KEY=your_key_here
JIRA_SERVER=https://...
JIRA_USER=...
# etc.
```

---

## 📈 Roadmap

- [ ] BigQuery integration for analytics dashboard
- [ ] Firebase for data persistence
- [ ] Vector database for semantic context retrieval
- [ ] Support for more ALM platforms (ServiceNow, Rally, Linear)
- [ ] Automated compliance reporting
- [ ] Machine learning model fine-tuning
- [ ] PDF export for formal reports
- [ ] Multi-language support

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
