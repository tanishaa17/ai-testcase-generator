# AI Test Case Generator - Frontend

A modern React application that leverages AI to automatically generate comprehensive, compliance-validated test cases from software requirements. Features seamless integration with enterprise ALM platforms including Jira, Azure DevOps, GitHub Issues, and GitLab Issues.

**Live Application**: [https://ai-testcase-generator-umber.vercel.app/](https://ai-testcase-generator-umber.vercel.app/)

---

## ✨ Features

- **AI-Powered Generation**: Automatically creates test cases from text or uploaded files (PDF, DOCX, XML, TXT)
- **Compliance Validation**: FDA, HIPAA, GDPR, ISO 13485, IEC 62304 compliance assessment with risk scoring
- **ALM Integration**: Direct export to Jira, Azure DevOps, GitHub Issues, and GitLab Issues
- **Modern UI**: Futuristic, minimalistic design with glass-morphism effects and smooth animations
- **Fully Responsive**: Optimized for mobile, tablet, and desktop devices

---

## 🛠 Tech Stack

- **React 19.1.1** with hooks and functional components
- **Material-UI (MUI) v7.3.2** with custom theme
- **Emotion** for CSS-in-JS styling
- **Axios** for API communication

---

## 📦 Installation

### Prerequisites
- Node.js 16.x or higher
- npm or yarn

### Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment** (Optional for local development)
   
   Create `.env.local` in the `frontend` directory:
   ```bash
   REACT_APP_API_BASE_URL=http://localhost:5000
   ```
   
   **Note**: If not set, defaults to production backend URL.

3. **Start development server**
   ```bash
   npm start
   ```
   
   Opens at `http://localhost:3000`

---

## 🌐 Environment Configuration

The application uses `REACT_APP_API_BASE_URL` environment variable:

- **Default**: `https://ai-testcase-generator-583h.onrender.com` (production)
- **Local Development**: Set `REACT_APP_API_BASE_URL=http://localhost:5000` in `.env.local`
- **Production**: Set in your deployment platform's environment variables

---

## 📜 Available Scripts

- `npm start` - Runs development server on `http://localhost:3000`
- `npm test` - Launches test runner
- `npm run build` - Creates production build in `build/` folder

---

## 🎯 Usage

### Generate Test Cases
1. Enter requirement text in the textarea or upload a file (PDF, DOCX, XML, TXT)
2. Click **"Generate"** button
3. Review generated test cases with compliance status and risk scores
4. Click anywhere on a test case card to view detailed information

### ALM Integration
1. Click **"ALM Settings"** (⚙️) in the header
2. Select platform and enter credentials
3. Click **"Save Configuration"** (settings saved in browser)
4. After generating test cases, select platform and click **"Create in [Platform]"**

---

## 🚀 Deployment

### Build
```bash
npm run build
```

### Environment Variable
Set `REACT_APP_API_BASE_URL` in your deployment platform's settings.

### Supported Platforms
Any static hosting platform (Vercel, Netlify, AWS S3, GitHub Pages, etc.)

---

## 🐛 Troubleshooting

**API Connection Errors**
- Verify backend is running (if local) or check `.env.local` file
- Check browser console for CORS errors

**Build Failures**
- Delete `node_modules` and `package-lock.json`, then run `npm install` again

**Port Already in Use**
- Kill process on port 3000 or set `PORT=3001` environment variable

---

## 📚 Resources

- [React Documentation](https://react.dev/)
- [Material-UI Documentation](https://mui.com/)

---

**Framework**: React 19.1.1 with Material-UI 7.3.2
