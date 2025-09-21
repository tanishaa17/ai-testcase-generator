# Gen-AI Test Case Auditor

---

## 🚀 Live Demo

**You can view the live, deployed application here:**

### [https://ai-testcase-generator-umber.vercel.app/](https://ai-testcase-generator-umber.vercel.app/)

---

A sophisticated, AI-powered system that automatically converts software requirements from multiple formats into compliant, traceable, and audit-ready test cases, complete with risk analysis and seamless integration with enterprise toolchains like Jira.

---

## The Challenge

In highly regulated industries like healthcare and finance, QA teams spend enormous time manually converting complex requirement documents into test cases, ensuring compliance, and maintaining traceability. This project was built to solve that problem by automating the most tedious and critical parts of the QA lifecycle.

## Key Features

This isn't just a simple script; it's a feature-rich platform built with a modern, scalable architecture.

- **AI-Powered Audit & Risk Analysis**: This is the core innovation. For every generated test case, the AI also provides:
    - A **Compliance Audit** that reasons about how the test meets regulatory standards (e.g., FDA, HIPAA).
    - A **Risk & Priority Score** that assesses the business impact of a potential failure, allowing teams to prioritize testing efforts intelligently.

- **Flexible Requirement Input**: Handles requirements from multiple sources to fit any workflow:
    - **File Upload**: PDF, DOCX, XML, and TXT.
    - **Direct Text Entry**: A text area to type or paste requirements directly.
    - **In-Context Generation**: A Chrome Extension to generate tests from highlighted text on any webpage.

- **True Jira Integration**: Go beyond simple exports. Create test cases as actual tickets in any Jira project directly via the API.

- **Dynamic, User-Specific Configuration**: A user-friendly settings panel allows users to connect their own Jira instance. The system intelligently falls back to default `.env` credentials if none are provided.

- **Asynchronous & Scalable Backend**: Built with **FastAPI**, the backend is asynchronous and can handle multiple concurrent requests without blocking, making it highly performant and scalable.

- **Modern & Responsive Frontend**: The user interface is a professional-grade **React + MUI** single-page application (SPA), offering a smooth user experience.

## Architecture

The project uses a modern, decoupled architecture:

- **Backend**: A powerful and scalable API server built with Python and FastAPI.
- **Frontend**: A dynamic and responsive user interface built with React and Material-UI (MUI).
- **Core Logic Module**: A centralized, shared module contains all the business logic for AI interaction, file processing, and Jira integration, ensuring the codebase is clean, professional, and easy to maintain (DRY principle).

## Tech Stack

- **Backend**: Python, FastAPI, Uvicorn
- **Frontend**: React, Material-UI (MUI), Axios
- **Core AI**: Google Gemini
- **Integrations**: Jira API

---

## Local Setup and Running the Project

Follow these steps to run the complete application on your local machine.

### 1. One-Time Setup

- **Configure Credentials**: In the root `ai-testcase-generator` folder, create or edit the `.env` file. It must contain your credentials:
  ```
  GEMINI_API_KEY=your_gemini_key_here
  JIRA_SERVER=https://your-domain.atlassian.net
  JIRA_USER=your-jira-email@example.com
  JIRA_API_TOKEN=your_jira_api_token_here
  JIRA_PROJECT_KEY=PROJ # Your default Jira Project Key
  ```

- **Install Backend Dependencies**: Open a terminal in the `ai-testcase-generator` folder and run:
  ```bash
  pip install -r requirements.txt
  ```

- **Install Frontend Dependencies**: In the same terminal, navigate to the frontend folder (`cd frontend`) and run:
  ```bash
  npm install
  ```

### 2. Running the Application

You need **two terminals** running simultaneously.

- **Terminal 1 (Backend)**:
  - Navigate to the `ai-testcase-generator` folder.
  - Run the command: `python app.py`
  - Leave this running. It will serve the API at `http://localhost:5000`.

- **Terminal 2 (Frontend)**:
  - Navigate to the `ai-testcase-generator/frontend` folder.
  - Run the command: `npm start`
  - This will automatically open the web application in your browser at `http://localhost:3000`.

### 3. Loading the Chrome Extension

- Open Google Chrome and navigate to `chrome://extensions`.
- Turn on **"Developer mode"** in the top-right corner.
- Click **"Load unpacked"** and select the entire `ai-testcase-generator/chrome-extension` folder.
- The extension will now be active.

---

## How to Use

### Web Application

1.  **Generate Tests**: Select a domain, then either **upload a requirement document** or **type the requirement** into the text box, and click "Generate Test Cases".
2.  **Create Jira Tickets**: 
    - To use the default credentials from your `.env` file, simply click "Create in Jira".
    - To use custom credentials, click the **Settings icon (⚙️)**, enter the details for another Jira instance, click "Save", and then click "Create in Jira".

### Chrome Extension

1.  Ensure the backend server is running.
2.  Go to any webpage and highlight a block of text.
3.  **Right-click** the highlighted text and select "Generate AI Test Cases for Selected Text".
4.  A new tab will open with the generated test cases.

---

## Future Roadmap

- **AI-Powered Refinement**: Add a feature to allow users to give feedback to the AI (e.g., "make this test more security-focused") to regenerate and improve a specific test case.
- **Support for More ALM Tools**: Expand the API integration to support other platforms like Azure DevOps and Polarion.
- **Advanced Analytics**: Create a dashboard to track metrics like the number of test cases generated, compliance coverage, and integration success rates.



<!-- # AI-Powered Test Case Generator

A sophisticated, AI-powered system that automatically converts software requirements from multiple formats into compliant, traceable test cases and seamlessly integrates with enterprise toolchains like Jira.

---

## The Challenge

In highly regulated industries like healthcare and finance, QA teams spend enormous time manually converting complex requirement documents into test cases, ensuring compliance, and maintaining traceability. This project was built to solve that problem by automating the most tedious parts of the QA lifecycle.

## Key Features

This isn't just a simple script; it's a feature-rich platform built with a modern, scalable architecture.

- **Multi-Format Requirement Ingestion**: Handles requirements from various document formats, including **PDF, DOCX, XML, and TXT**.
- **Domain-Agnostic AI**: The AI's expertise can be dynamically configured via the UI to generate relevant test cases for any domain (e.g., Healthcare, Finance, E-commerce).
- **True Jira Integration**: Go beyond simple exports. Create test cases as actual tickets in any Jira project directly via the API.
- **Dynamic, User-Specific Configuration**: A user-friendly settings panel allows users to connect their own Jira instance. The system intelligently falls back to default `.env` credentials if none are provided.
- **Asynchronous & Scalable Backend**: Built with **FastAPI**, the backend is asynchronous and can handle multiple concurrent requests without blocking, making it highly performant and scalable.
- **Modern & Responsive Frontend**: The user interface is a professional-grade **React + MUI** single-page application (SPA), offering a smooth user experience.
- **Browser Extension for In-Context Generation**: A fully functional **Chrome Extension** allows users to generate test cases from highlighted text on *any* webpage, seamlessly integrating the tool into their existing workflows.

## Architecture

The project uses a modern, decoupled architecture:

- **Backend**: A powerful and scalable API server built with Python and FastAPI.
- **Frontend**: A dynamic and responsive user interface built with React and Material-UI (MUI).
- **Core Logic Module**: A centralized, shared module contains all the business logic for AI interaction, file processing, and Jira integration, ensuring the codebase is clean, professional, and easy to maintain (DRY principle).

## Tech Stack

- **Backend**: Python, FastAPI, Uvicorn
- **Frontend**: React, Material-UI (MUI), Axios
- **Core AI**: Google Gemini
- **Integrations**: Jira API

---

## Local Setup and Running the Project

Follow these steps to run the complete application on your local machine.

### 1. One-Time Setup

- **Configure Credentials**: In the root `hackathon-project` folder, create or edit the `.env` file. It must contain your credentials:
  ```
  GEMINI_API_KEY=your_gemini_key_here
  JIRA_SERVER=https://your-domain.atlassian.net
  JIRA_USER=your-jira-email@example.com
  JIRA_API_TOKEN=your_jira_api_token_here
  JIRA_PROJECT_KEY=PROJ # Your default Jira Project Key
  ```

- **Install Backend Dependencies**: Open a terminal in the `hackathon-project` folder and run:
  ```bash
  pip install -r requirements.txt
  ```

- **Install Frontend Dependencies**: In the same terminal, navigate to the frontend folder (`cd frontend`) and run:
  ```bash
  npm install
  ```

### 2. Running the Application

You need **two terminals** running simultaneously.

- **Terminal 1 (Backend)**:
  - Navigate to the `hackathon-project` folder.
  - Run the command: `python app.py`
  - Leave this running. It will serve the API at `https://ai-testcase-generator-583h.onrender.com`.

- **Terminal 2 (Frontend)**:
  - Navigate to the `hackathon-project/frontend` folder.
  - Run the command: `npm start`
  - This will automatically open the web application in your browser at `https://ai-testcase-generator-umber.vercel.app/`.

### 3. Loading the Chrome Extension

- Open Google Chrome and navigate to `chrome://extensions`.
- Turn on **"Developer mode"** in the top-right corner.
- Click **"Load unpacked"** and select the entire `hackathon-project/chrome-extension` folder.
- The extension will now be active.

---

## How to Use

### Web Application

1.  **Generate Tests**: Select a domain, upload a requirement document, and click "Generate Test Cases".
2.  **Create Jira Tickets**:
    - To use the default credentials from your `.env` file, simply click "Create in Jira".
    - To use custom credentials, click the **Settings icon (⚙️)**, enter the details for another Jira instance, click "Save", and then click "Create in Jira".

### Chrome Extension

1.  Ensure the backend server is running.
2.  Go to any webpage and highlight a block of text.
3.  **Right-click** the highlighted text and select "Generate AI Test Cases for Selected Text".
4.  A new tab will open with the generated test cases.

---

## Future Roadmap

- **AI-Powered Refinement**: Add a feature to allow users to give feedback to the AI (e.g., "make this test more security-focused") to regenerate and improve a specific test case.
- **Support for More ALM Tools**: Expand the API integration to support other platforms like Azure DevOps and Polarion.
- **Advanced Analytics**: Create a dashboard to track metrics like the number of test cases generated, compliance coverage, and integration success rates. -->
