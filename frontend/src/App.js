import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Alert,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip
} from '@mui/material';
import { UploadFile, ArrowForward, ConfirmationNumber, Settings } from '@mui/icons-material';

// Create a simple theme for a professional look
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#1a9c6b',
    },
    background: {
      default: '#f4f6f8',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
  },
});

function App() {
  // UI State
  const [file, setFile] = useState(null);
  const [domain, setDomain] = useState('Healthcare');
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [jiraLoading, setJiraLoading] = useState(false);
  const [jiraError, setJiraError] = useState('');
  const [jiraSuccess, setJiraSuccess] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Settings State
  const [settings, setSettings] = useState({
    server: '',
    user: '',
    apiToken: '',
    projectKey: ''
  });
  const [isSettingsValid, setIsSettingsValid] = useState(false);

  // Load settings from localStorage on initial render
  useEffect(() => {
    const savedSettings = localStorage.getItem('jiraSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Validate settings whenever they change
  useEffect(() => {
    const { server, user, apiToken, projectKey } = settings;
    // Simple validation: check if all fields are non-empty and trimmed
    if (server.trim() && user.trim() && apiToken.trim() && projectKey.trim()) {
      setIsSettingsValid(true);
    } else {
      setIsSettingsValid(false);
    }
  }, [settings]);

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveSettings = () => {
    localStorage.setItem('jiraSettings', JSON.stringify(settings));
    setSettingsOpen(false);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
    setTestData(null);
    setJiraSuccess('');
    setJiraError('');
  };

  const handleGenerateSubmit = async () => {
    if (!file) {
      setError('Please select a requirement file first.');
      return;
    }
    setLoading(true);
    setError('');
    setTestData(null);
    setJiraSuccess('');
    setJiraError('');
    const formData = new FormData();
    formData.append('requirement_file', file);
    formData.append('domain', domain);
    try {
      const response = await axios.post('http://localhost:5000/api/generate', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setTestData(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleJiraSubmit = async () => {
    if (!testData) {
      setJiraError('No test data available to send to Jira.');
      return;
    }
    setJiraLoading(true);
    setJiraError('');
    setJiraSuccess('');
    const payload = {
      test_cases: testData.test_cases,
      credentials: settings
    };
    try {
      const response = await axios.post('http://localhost:5000/api/jira', payload);
      setJiraSuccess(`${response.data.message} - Issues: ${response.data.issues.join(', ')}`)
    } catch (err) {
      setJiraError(err.response?.data?.detail || 'An unexpected error occurred during Jira integration.');
    } finally {
      setJiraLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ my: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 5, p: 2, backgroundColor: 'white', borderRadius: 2, boxShadow: 1, position: 'relative' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Gen-AI Test Case Auditor
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            From Raw Requirements to Audit-Ready Test Cases with AI-Powered Risk Scoring.
          </Typography>
          <Tooltip title="Jira Settings">
            <IconButton onClick={() => setSettingsOpen(true)} sx={{ position: 'absolute', top: 8, right: 8 }}>
              <Settings />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Settings Dialog */}
        <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Jira Configuration</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{mb: 2}}>These settings override the default .env configuration. They are saved in your browser's local storage.</Typography>
            <TextField name="server" label="Jira Server URL" value={settings.server} onChange={handleSettingsChange} fullWidth margin="normal" placeholder="https://your-domain.atlassian.net" />
            <TextField name="user" label="Jira User Email" value={settings.user} onChange={handleSettingsChange} fullWidth margin="normal" />
            <TextField name="apiToken" label="Jira API Token" value={settings.apiToken} onChange={handleSettingsChange} fullWidth margin="normal" type="password" />
            <TextField name="projectKey" label="Jira Project Key" value={settings.projectKey} onChange={handleSettingsChange} fullWidth margin="normal" placeholder="PROJ" />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSettingsOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveSettings} variant="contained" disabled={!isSettingsValid}>Save</Button>
          </DialogActions>
        </Dialog>

        <Card sx={{ mb: 4, p: 3, boxShadow: 1 }}>
          <Box component="form" noValidate autoComplete="off">
            <Typography variant="h6" gutterBottom>1. Specify Domain</Typography>
            <TextField fullWidth label="Domain" variant="outlined" value={domain} onChange={(e) => setDomain(e.target.value)} sx={{ mb: 3 }} />
            <Typography variant="h6" gutterBottom>2. Upload Requirement</Typography>
            <Button variant="contained" component="label" startIcon={<UploadFile />}>
              {file ? file.name : 'Select File'}
              <input type="file" hidden onChange={handleFileChange} />
            </Button>
            <Box sx={{ mt: 4, position: 'relative', textAlign: 'center' }}>
              <Button variant="contained" color="primary" size="large" endIcon={<ArrowForward />} onClick={handleGenerateSubmit} disabled={loading}>
                Generate Test Cases
              </Button>
              {loading && <CircularProgress size={24} sx={{ position: 'absolute', top: '50%', left: '50%', marginTop: '-12px', marginLeft: '-12px' }} />}
            </Box>
          </Box>
        </Card>

        {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

        {testData && testData.test_cases && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" gutterBottom component="div">Generated Test Cases</Typography>
              <Button variant="contained" color="secondary" startIcon={<ConfirmationNumber />} onClick={handleJiraSubmit} disabled={jiraLoading}>
                Create in Jira
              </Button>
            </Box>
            {jiraLoading && <CircularProgress sx={{mb: 2}}/>}
            {jiraError && <Alert severity="error" sx={{ mb: 2 }}>{jiraError}</Alert>}
            {jiraSuccess && <Alert severity="success" sx={{ mb: 2 }}>{jiraSuccess}</Alert>}
            <Divider sx={{ mb: 2 }} />
            {testData.test_cases.map((test, index) => (
              <Card key={index} sx={{ mb: 2, boxShadow: 1 }}>
                <CardHeader title={`Test ID: ${test.test_id}`} subheader={`Source: "${test.requirement_source}"`} sx={{ bgcolor: '#eeeeee' }} />
                <CardContent>
                  <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', bgcolor: '#282c34', color: 'white', p: 2, borderRadius: 1 }}>
                    <code>{test.gherkin_feature}</code>
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">Compliance Tags:</Typography>
                    {test.compliance_tags && test.compliance_tags.length > 0 ? (
                      test.compliance_tags.map((tag, i) => <Chip key={i} label={tag} sx={{ mr: 1, mt: 1 }} />)
                    ) : (
                      <Typography variant="body2" color="text.secondary">None</Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;
