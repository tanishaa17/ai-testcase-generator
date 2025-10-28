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
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab
} from '@mui/material';
import { UploadFile, ArrowForward, ConfirmationNumber, Settings, Upload, Dashboard } from '@mui/icons-material';

// API Base URL - Change this for local development
const API_BASE_URL = 'http://localhost:5000';
// For deployed version: const API_BASE_URL = 'https://ai-testcase-generator-583h.onrender.com';

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
  const [file, setFile] = useState(null);
  const [requirementText, setRequirementText] = useState('');
  const [domain, setDomain] = useState('Healthcare');
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [integrationLoading, setIntegrationLoading] = useState(false);
  const [integrationError, setIntegrationError] = useState('');
  const [integrationSuccess, setIntegrationSuccess] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('Jira');

  const [jiraSettings, setJiraSettings] = useState({ server: '', user: '', apiToken: '', projectKey: '' });
  const [azureSettings, setAzureSettings] = useState({ organization: '', pat: '', project: '' });
  const [polarionSettings, setPolarionSettings] = useState({ url: '', user: '', password: '', projectId: '' });

  const [isSettingsValid, setIsSettingsValid] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const savedJiraSettings = localStorage.getItem('jiraSettings');
    if (savedJiraSettings) {
      setJiraSettings(JSON.parse(savedJiraSettings));
    }
    const savedAzureSettings = localStorage.getItem('azureSettings');
    if (savedAzureSettings) {
      setAzureSettings(JSON.parse(savedAzureSettings));
    }
    const savedPolarionSettings = localStorage.getItem('polarionSettings');
    if (savedPolarionSettings) {
      setPolarionSettings(JSON.parse(savedPolarionSettings));
    }
  }, []);

  useEffect(() => {
    let valid = false;
    if (selectedPlatform === 'Jira') {
      const { server, user, apiToken, projectKey } = jiraSettings;
      valid = server.trim() && user.trim() && apiToken.trim() && projectKey.trim();
    } else if (selectedPlatform === 'Azure DevOps') {
      const { organization, pat, project } = azureSettings;
      valid = organization.trim() && pat.trim() && project.trim();
    } else if (selectedPlatform === 'Polarion') {
      const { url, user, password, projectId } = polarionSettings;
      valid = url.trim() && user.trim() && password.trim() && projectId.trim();
    }
    setIsSettingsValid(valid);
  }, [jiraSettings, azureSettings, polarionSettings, selectedPlatform]);

  const handleSettingsChange = (e, settingsType) => {
    const { name, value } = e.target;
    if (settingsType === 'jira') {
      setJiraSettings(prev => ({ ...prev, [name]: value }));
    } else if (settingsType === 'azure') {
      setAzureSettings(prev => ({ ...prev, [name]: value }));
    } else if (settingsType === 'polarion') {
      setPolarionSettings(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveSettings = () => {
    localStorage.setItem('jiraSettings', JSON.stringify(jiraSettings));
    localStorage.setItem('azureSettings', JSON.stringify(azureSettings));
    localStorage.setItem('polarionSettings', JSON.stringify(polarionSettings));
    setSettingsOpen(false);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setRequirementText('');
    setError('');
    setTestData(null);
    setIntegrationSuccess('');
    setIntegrationError('');
  };

  const handleTextChange = (e) => {
    setRequirementText(e.target.value);
    setFile(null);
  };

  const handleGenerateSubmit = async () => {
    if (!file && !requirementText.trim()) {
      setError('Please either upload a requirement file or type the requirement.');
      return;
    }
    setLoading(true);
    setError('');
    setTestData(null);
    setIntegrationSuccess('');
    setIntegrationError('');

    try {
      let response;
      if (requirementText.trim()) {
        const payload = { requirement_text: requirementText, domain: domain };
        response = await axios.post(`${API_BASE_URL}/api/generate-from-text`, payload);
      } else {
        const formData = new FormData();
        formData.append('requirement_file', file);
        formData.append('domain', domain);
        response = await axios.post(`${API_BASE_URL}/api/generate`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setTestData(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleIntegrationSubmit = async () => {
    if (!testData) {
      setIntegrationError('No test data available.');
      return;
    }
    setIntegrationLoading(true);
    setIntegrationError('');
    setIntegrationSuccess('');

    try {
      let response;
      if (selectedPlatform === 'Jira') {
        const payload = { test_cases: testData.test_cases, credentials: jiraSettings };
        response = await axios.post(`${API_BASE_URL}/api/jira`, payload);
        setIntegrationSuccess(`${response.data.message} - Issues: ${response.data.issues.join(', ')}`);
      } else if (selectedPlatform === 'Azure DevOps') {
        const payload = { test_cases: testData.test_cases, credentials: azureSettings };
        response = await axios.post(`${API_BASE_URL}/api/azure-devops`, payload);
        setIntegrationSuccess(`${response.data.message} - Work Items: ${response.data.items.join(', ')}`);
      } else if (selectedPlatform === 'Polarion') {
        const payload = { test_cases: testData.test_cases, credentials: polarionSettings };
        response = await axios.post(`${API_BASE_URL}/api/polarion`, payload);
        setIntegrationSuccess(`${response.data.message} - Test Cases: ${response.data.items.join(', ')}`);
      }
    } catch (err) {
      setIntegrationError(err.response?.data?.detail || 'An unexpected error occurred during integration.');
    } finally {
      setIntegrationLoading(false);
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
            AI-Powered Test Case Generation with Enterprise ALM Integration (Jira, Azure DevOps, Polarion)
          </Typography>
          <Tooltip title="Integration Settings">
            <IconButton onClick={() => setSettingsOpen(true)} sx={{ position: 'absolute', top: 8, right: 8 }}>
              <Settings />
            </IconButton>
          </Tooltip>
        </Box>

        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
          <Tab icon={<Upload />} iconPosition="start" label="Generate Test Cases" />
          <Tab icon={<Dashboard />} iconPosition="start" label="Analytics" disabled />
        </Tabs>

        <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} fullWidth maxWidth="md">
          <DialogTitle>ALM Platform Configuration</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{mb: 2}}>
              Configure credentials for your chosen ALM platform. Settings are saved in your browser's local storage.
            </Typography>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Select Platform</InputLabel>
              <Select value={selectedPlatform} onChange={(e) => setSelectedPlatform(e.target.value)}>
                <MenuItem value="Jira">Jira</MenuItem>
                <MenuItem value="Azure DevOps">Azure DevOps</MenuItem>
                <MenuItem value="Polarion">Polarion</MenuItem>
              </Select>
            </FormControl>

            {selectedPlatform === 'Jira' && (
              <>
                <TextField name="server" label="Jira Server URL" value={jiraSettings.server} onChange={(e) => handleSettingsChange(e, 'jira')} fullWidth margin="normal" placeholder="https://your-domain.atlassian.net" />
                <TextField name="user" label="Jira User Email" value={jiraSettings.user} onChange={(e) => handleSettingsChange(e, 'jira')} fullWidth margin="normal" />
                <TextField name="apiToken" label="Jira API Token" value={jiraSettings.apiToken} onChange={(e) => handleSettingsChange(e, 'jira')} fullWidth margin="normal" type="password" />
                <TextField name="projectKey" label="Jira Project Key" value={jiraSettings.projectKey} onChange={(e) => handleSettingsChange(e, 'jira')} fullWidth margin="normal" placeholder="PROJ" />
              </>
            )}

            {selectedPlatform === 'Azure DevOps' && (
              <>
                <TextField name="organization" label="Organization Name" value={azureSettings.organization} onChange={(e) => handleSettingsChange(e, 'azure')} fullWidth margin="normal" placeholder="myorg" />
                <TextField name="pat" label="Personal Access Token" value={azureSettings.pat} onChange={(e) => handleSettingsChange(e, 'azure')} fullWidth margin="normal" type="password" />
                <TextField name="project" label="Project Name" value={azureSettings.project} onChange={(e) => handleSettingsChange(e, 'azure')} fullWidth margin="normal" />
              </>
            )}

            {selectedPlatform === 'Polarion' && (
              <>
                <TextField name="url" label="Polarion URL" value={polarionSettings.url} onChange={(e) => handleSettingsChange(e, 'polarion')} fullWidth margin="normal" placeholder="https://polarion.example.com/polarion" />
                <TextField name="user" label="Username" value={polarionSettings.user} onChange={(e) => handleSettingsChange(e, 'polarion')} fullWidth margin="normal" />
                <TextField name="password" label="Password" value={polarionSettings.password} onChange={(e) => handleSettingsChange(e, 'polarion')} fullWidth margin="normal" type="password" />
                <TextField name="projectId" label="Project ID" value={polarionSettings.projectId} onChange={(e) => handleSettingsChange(e, 'polarion')} fullWidth margin="normal" />
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSettingsOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveSettings} variant="contained" disabled={!isSettingsValid}>Save</Button>
          </DialogActions>
        </Dialog>

        {tabValue === 0 && (
          <>
            <Card sx={{ mb: 4, p: 3, boxShadow: 1 }}>
              <Box component="form" noValidate autoComplete="off">
                <Typography variant="h6" gutterBottom>1. Specify Domain</Typography>
                <TextField fullWidth label="Domain" variant="outlined" value={domain} onChange={(e) => setDomain(e.target.value)} sx={{ mb: 3 }} />
                
                <Typography variant="h6" gutterBottom>2. Provide Requirement</Typography>
                <Button variant="contained" component="label" startIcon={<UploadFile />}>
                  {file ? file.name : 'Select File'}
                  <input type="file" hidden onChange={handleFileChange} accept=".pdf,.docx,.xml,.txt" />
                </Button>
                <Typography color="text.secondary" sx={{ my: 1, textAlign: 'center' }}>OR</Typography>
                <TextField
                  fullWidth
                  label="Type or paste requirement here"
                  variant="outlined"
                  multiline
                  rows={4}
                  value={requirementText}
                  onChange={handleTextChange}
                />

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
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <Select value={selectedPlatform} onChange={(e) => setSelectedPlatform(e.target.value)}>
                        <MenuItem value="Jira">Jira</MenuItem>
                        <MenuItem value="Azure DevOps">Azure DevOps</MenuItem>
                        <MenuItem value="Polarion">Polarion</MenuItem>
                      </Select>
                    </FormControl>
                    <Button variant="contained" color="secondary" startIcon={<ConfirmationNumber />} onClick={handleIntegrationSubmit} disabled={integrationLoading}>
                      Create in {selectedPlatform}
                    </Button>
                  </Box>
                </Box>
                {integrationLoading && <CircularProgress sx={{mb: 2}}/>}
                {integrationError && <Alert severity="error" sx={{ mb: 2 }}>{integrationError}</Alert>}
                {integrationSuccess && <Alert severity="success" sx={{ mb: 2 }}>{integrationSuccess}</Alert>}
                <Divider sx={{ mb: 2 }} />
                {testData.test_cases.map((test, index) => (
                  <Card key={index} sx={{ mb: 2, boxShadow: 1 }}>
                    <CardHeader 
                      title={`Test ID: ${test.test_id}`} 
                      subheader={
                        <>
                          <div>Source: "{test.requirement_source}"</div>
                          {test.compliance_assessment && (
                            <Chip 
                              label={test.compliance_assessment.status} 
                              color={test.compliance_assessment.status === 'Compliant' ? 'success' : 'error'}
                              size="small"
                              sx={{ mt: 0.5 }}
                            />
                          )}
                          {test.risk_and_priority && (
                            <Chip 
                              label={`Risk Score: ${test.risk_and_priority.score}/10`}
                              color={test.risk_and_priority.score >= 7 ? 'error' : test.risk_and_priority.score >= 4 ? 'warning' : 'success'}
                              size="small"
                              sx={{ mt: 0.5, ml: 1 }}
                            />
                          )}
                        </>
                      }
                      sx={{ bgcolor: '#eeeeee' }} 
                    />
                    <CardContent>
                      <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', bgcolor: '#282c34', color: 'white', p: 2, borderRadius: 1 }}>
                        <code>{test.gherkin_feature}</code>
                      </Typography>
                      {test.compliance_tags && test.compliance_tags.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2">Compliance Tags:</Typography>
                          {test.compliance_tags.map((tag, i) => <Chip key={i} label={tag} sx={{ mr: 1, mt: 1 }} />)}
                        </Box>
                      )}
                      {test.compliance_assessment && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2">Compliance Assessment:</Typography>
                          <Typography variant="body2" color="text.secondary">{test.compliance_assessment.reasoning}</Typography>
                        </Box>
                      )}
                      {test.risk_and_priority && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2">Risk Assessment:</Typography>
                          <Typography variant="body2" color="text.secondary">{test.risk_and_priority.reasoning}</Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </>
        )}

        {tabValue === 1 && (
          <Card sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>Analytics Dashboard</Typography>
            <Typography color="text.secondary">Coming soon: Real-time compliance metrics, test coverage, and integration analytics powered by BigQuery.</Typography>
          </Card>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;
