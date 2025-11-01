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
  Chip,
  Alert,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { UploadFile, ConfirmationNumber, Settings, Upload, Dashboard, Add, ArrowUpward, Edit, ExpandMore } from '@mui/icons-material';

// API Base URL - Uses environment variable with fallback to production URL
// For local development: Create a .env.local file with REACT_APP_API_BASE_URL=http://localhost:5000
// For production: Uses the deployed backend URL by default
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://ai-testcase-generator-583h.onrender.com';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#32CD32',
    },
    secondary: {
      main: '#1a9c6b',
    },
    background: {
      default: '#1A1A1A',
      paper: '#1A1A1A',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#AAAAAA',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
      color: '#FFFFFF',
    },
    body1: {
      color: '#FFFFFF',
    },
    body2: {
      color: '#AAAAAA',
    },
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          backgroundColor: '#1A1A1A',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#2C2C2C',
            color: '#FFFFFF',
            '& fieldset': {
              borderColor: '#2C2C2C',
            },
            '&:hover fieldset': {
              borderColor: '#2C2C2C',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#2C2C2C',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#AAAAAA',
          },
          '& .MuiInputBase-input::placeholder': {
            color: '#AAAAAA',
            opacity: 1,
            fontStyle: 'italic',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1A1A1A',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          borderBottom: 'none',
        },
        indicator: {
          backgroundColor: '#FFFFFF',
          height: 2,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: '#AAAAAA',
          '&.Mui-selected': {
            color: '#FFFFFF',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#2C2C2C',
          color: '#FFFFFF',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          backgroundColor: '#2C2C2C',
          color: '#FFFFFF',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: '#2C2C2C',
          color: '#FFFFFF',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          backgroundColor: '#2C2C2C',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#3C3C3C',
          },
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          color: '#FFFFFF',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          color: '#FFFFFF',
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          '& .MuiInputLabel-root': {
            color: '#AAAAAA',
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#AAAAAA',
          '&.Mui-focused': {
            color: '#AAAAAA',
          },
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          backgroundColor: '#2C2C2C',
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          backgroundColor: '#2C2C2C',
          color: '#FFFFFF',
          '&:before': {
            display: 'none',
          },
          '&.Mui-expanded': {
            margin: '16px 0',
          },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          backgroundColor: '#2C2C2C',
          color: '#FFFFFF',
          padding: '16px 24px',
          minHeight: 'auto',
          '&.Mui-expanded': {
            minHeight: 'auto',
          },
          '& .MuiAccordionSummary-content': {
            margin: '12px 0',
            '&.Mui-expanded': {
              margin: '12px 0',
            },
          },
        },
        expandIconWrapper: {
          color: '#FFFFFF',
        },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          padding: '16px 24px 24px 24px',
          backgroundColor: '#2C2C2C',
        },
      },
    },
  },
});

// Helper function to extract feature and scenario from Gherkin text
const extractGherkinInfo = (gherkinText) => {
  if (!gherkinText) return { feature: '', scenario: '' };

  const lines = gherkinText.split('\n').map(line => line.trim()).filter(line => line);
  let feature = '';
  let scenario = '';

  for (const line of lines) {
    if (line.toLowerCase().startsWith('feature:')) {
      feature = line.substring(8).trim();
    } else if (line.toLowerCase().startsWith('scenario:') || line.toLowerCase().startsWith('scenario outline:')) {
      scenario = line.substring(line.indexOf(':') + 1).trim();
      break; // Take first scenario
    }
  }

  return { feature, scenario };
};

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
  const [githubSettings, setGithubSettings] = useState({ token: '', owner: '', repo: '' });
  const [gitlabSettings, setGitlabSettings] = useState({ url: 'https://gitlab.com', token: '', projectId: '' });

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
    const savedGithubSettings = localStorage.getItem('githubSettings');
    if (savedGithubSettings) {
      setGithubSettings(JSON.parse(savedGithubSettings));
    }
    const savedGitlabSettings = localStorage.getItem('gitlabSettings');
    if (savedGitlabSettings) {
      setGitlabSettings(JSON.parse(savedGitlabSettings));
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
    } else if (selectedPlatform === 'GitHub') {
      const { token, owner, repo } = githubSettings;
      valid = token.trim() && owner.trim() && repo.trim();
    } else if (selectedPlatform === 'GitLab') {
      const { url, token, projectId } = gitlabSettings;
      valid = url.trim() && token.trim() && projectId.trim();
    }
    setIsSettingsValid(valid);
  }, [jiraSettings, azureSettings, githubSettings, gitlabSettings, selectedPlatform]);

  const handleSettingsChange = (e, settingsType) => {
    const { name, value } = e.target;
    if (settingsType === 'jira') {
      setJiraSettings(prev => ({ ...prev, [name]: value }));
    } else if (settingsType === 'azure') {
      setAzureSettings(prev => ({ ...prev, [name]: value }));
    } else if (settingsType === 'github') {
      setGithubSettings(prev => ({ ...prev, [name]: value }));
    } else if (settingsType === 'gitlab') {
      setGitlabSettings(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveSettings = () => {
    localStorage.setItem('jiraSettings', JSON.stringify(jiraSettings));
    localStorage.setItem('azureSettings', JSON.stringify(azureSettings));
    localStorage.setItem('githubSettings', JSON.stringify(githubSettings));
    localStorage.setItem('gitlabSettings', JSON.stringify(gitlabSettings));
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
      } else if (selectedPlatform === 'GitHub') {
        const payload = { test_cases: testData.test_cases, credentials: githubSettings };
        response = await axios.post(`${API_BASE_URL}/api/github`, payload);
        setIntegrationSuccess(`${response.data.message} - Issues: #${response.data.issues.join(', #')}`);
      } else if (selectedPlatform === 'GitLab') {
        const payload = { test_cases: testData.test_cases, credentials: gitlabSettings };
        response = await axios.post(`${API_BASE_URL}/api/gitlab`, payload);
        setIntegrationSuccess(`${response.data.message} - Issues: !${response.data.issues.join(', !')}`);
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
      <Box sx={{ minHeight: '100vh', backgroundColor: '#1A1A1A', py: 4 }}>
        <Container maxWidth="lg">
          {/* Header Section */}
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            {/* Domain Tag - Editable */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                background: 'linear-gradient(90deg, #00CED1 0%, #8A2BE2 100%)',
                borderRadius: '4px',
                px: 2,
                py: 0.5,
                mb: 2,
                cursor: 'pointer',
                position: 'relative',
              }}
              onClick={() => {
                const newDomain = prompt('Enter domain name:', domain);
                if (newDomain && newDomain.trim()) {
                  setDomain(newDomain.trim());
                }
              }}
            >
              <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 400 }}>
                {domain}
              </Typography>
              <Edit sx={{ color: '#FFFFFF', fontSize: '14px' }} />
            </Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#FFFFFF', fontWeight: 600, mb: 1 }}>
              Gen-AI Test Case Auditor
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#AAAAAA', fontWeight: 400 }}>
              AI-Powered Test Case Generation with Enterprise ALM Integration (Jira, Azure DevOps, GitHub, GitLab)
            </Typography>
          </Box>

          {/* Navigation Bar */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, borderBottom: 'none' }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ borderBottom: 'none' }}>
              <Tab
                icon={<Upload />}
                iconPosition="start"
                label="Generate Test Cases"
                sx={{
                  color: tabValue === 0 ? '#FFFFFF' : '#AAAAAA',
                  textTransform: 'none',
                  fontWeight: 400,
                }}
              />
              <Tab
                icon={<Dashboard />}
                iconPosition="start"
                label="Analytics"
                disabled
                sx={{
                  color: '#AAAAAA',
                  textTransform: 'none',
                  fontWeight: 400,
                }}
              />
            </Tabs>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: '#AAAAAA',
                cursor: 'pointer',
                '&:hover': {
                  color: '#FFFFFF',
                },
              }}
              onClick={() => setSettingsOpen(true)}
            >
              <Typography variant="body1" sx={{ color: 'inherit', fontWeight: 400 }}>
                ALM Settings
              </Typography>
              <Settings sx={{ color: '#FFFFFF' }} />
            </Box>
          </Box>

          <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} fullWidth maxWidth="md">
            <DialogTitle>ALM Platform Configuration</DialogTitle>
            <DialogContent>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Configure credentials for your chosen ALM platform. Settings are saved in your browser's local storage.
              </Typography>

              <FormControl fullWidth margin="normal">
                <InputLabel>Select Platform</InputLabel>
                <Select value={selectedPlatform} onChange={(e) => setSelectedPlatform(e.target.value)}>
                  <MenuItem value="Jira">Jira</MenuItem>
                  <MenuItem value="Azure DevOps">Azure DevOps</MenuItem>
                  <MenuItem value="GitHub">GitHub Issues</MenuItem>
                  <MenuItem value="GitLab">GitLab Issues</MenuItem>
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

              {selectedPlatform === 'GitHub' && (
                <>
                  <TextField name="token" label="GitHub Personal Access Token" value={githubSettings.token} onChange={(e) => handleSettingsChange(e, 'github')} fullWidth margin="normal" type="password" helperText="Create token at: https://github.com/settings/tokens" />
                  <TextField name="owner" label="Repository Owner (username)" value={githubSettings.owner} onChange={(e) => handleSettingsChange(e, 'github')} fullWidth margin="normal" placeholder="your-username" />
                  <TextField name="repo" label="Repository Name" value={githubSettings.repo} onChange={(e) => handleSettingsChange(e, 'github')} fullWidth margin="normal" placeholder="test-cases" />
                </>
              )}

              {selectedPlatform === 'GitLab' && (
                <>
                  <TextField name="url" label="GitLab URL" value={gitlabSettings.url} onChange={(e) => handleSettingsChange(e, 'gitlab')} fullWidth margin="normal" placeholder="https://gitlab.com" helperText="Use https://gitlab.com for public GitLab" />
                  <TextField name="token" label="GitLab Personal Access Token" value={gitlabSettings.token} onChange={(e) => handleSettingsChange(e, 'gitlab')} fullWidth margin="normal" type="password" helperText="Create token at: GitLab Settings > Access Tokens" />
                  <TextField name="projectId" label="Project ID (Numeric)" value={gitlabSettings.projectId} onChange={(e) => handleSettingsChange(e, 'gitlab')} fullWidth margin="normal" placeholder="12345678" helperText="Found in project Settings > General" />
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setSettingsOpen(false)}
                sx={{ color: '#FFFFFF' }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveSettings}
                variant="contained"
                disabled={!isSettingsValid}
                sx={{
                  background: 'linear-gradient(90deg, #00CED1 0%, #8A2BE2 100%)',
                  color: '#FFFFFF',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #00B8BB 0%, #7A1AD2 100%)',
                  },
                  '&:disabled': {
                    background: '#2C2C2C',
                    color: '#AAAAAA',
                  },
                }}
              >
                Save
              </Button>
            </DialogActions>
          </Dialog>

          {tabValue === 0 && (
            <>
              <Box sx={{ mb: 4 }}>
                <Box component="form" noValidate autoComplete="off">
                  <TextField
                    fullWidth
                    placeholder="Type here..."
                    variant="outlined"
                    multiline
                    rows={8}
                    value={requirementText}
                    onChange={handleTextChange}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#2C2C2C',
                        borderRadius: '8px',
                        color: '#FFFFFF',
                        '& fieldset': {
                          borderColor: '#2C2C2C',
                          borderWidth: '1px',
                        },
                        '&:hover fieldset': {
                          borderColor: '#2C2C2C',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#2C2C2C',
                        },
                        '& textarea::placeholder': {
                          color: '#AAAAAA',
                          fontStyle: 'italic',
                          opacity: 1,
                        },
                      },
                    }}
                  />

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, position: 'relative', alignItems: 'center' }}>
                    {/* File Upload Button */}
                    <Button
                      component="label"
                      variant="contained"
                      size="large"
                      sx={{
                        background: 'linear-gradient(90deg, #00CED1 0%, #8A2BE2 100%)',
                        color: '#FFFFFF',
                        borderRadius: '8px',
                        px: file ? 2 : 1.5,
                        py: 1.5,
                        minWidth: file ? 'auto' : '48px',
                        minHeight: '48px',
                        '&:hover': {
                          background: 'linear-gradient(90deg, #00B8BB 0%, #7A1AD2 100%)',
                        },
                      }}
                    >
                      <input type="file" hidden onChange={handleFileChange} accept=".pdf,.docx,.xml,.txt" />
                      {file ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <UploadFile sx={{ fontSize: '18px' }} />
                          <Typography variant="body2" sx={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {file.name}
                          </Typography>
                        </Box>
                      ) : (
                        <Add sx={{ color: '#FFFFFF', fontSize: '24px' }} />
                      )}
                    </Button>

                    {/* Generate Button */}
                    <Button
                      variant="contained"
                      size="large"
                      onClick={handleGenerateSubmit}
                      disabled={loading}
                      startIcon={<Add sx={{ color: '#FFFFFF' }} />}
                      endIcon={<ArrowUpward sx={{ color: '#FFFFFF' }} />}
                      sx={{
                        background: 'linear-gradient(90deg, #00CED1 0%, #8A2BE2 100%)',
                        color: '#FFFFFF',
                        borderRadius: '8px',
                        px: 3,
                        py: 1.5,
                        textTransform: 'none',
                        fontWeight: 400,
                        fontSize: '1rem',
                        '&:hover': {
                          background: 'linear-gradient(90deg, #00B8BB 0%, #7A1AD2 100%)',
                        },
                        '&:disabled': {
                          background: '#2C2C2C',
                          color: '#AAAAAA',
                        },
                      }}
                    >
                      Generate Test Cases
                    </Button>
                    {loading && <CircularProgress size={24} sx={{ position: 'absolute', top: '50%', right: '20px', color: '#00CED1' }} />}
                  </Box>
                </Box>
              </Box>

              {error && <Alert severity="error" sx={{ mb: 4, backgroundColor: '#2C2C2C', color: '#FFFFFF' }}>{error}</Alert>}

              {testData && testData.test_cases && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" gutterBottom component="div" sx={{ color: '#FFFFFF' }}>Generated Test Cases</Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <FormControl size="small" sx={{ minWidth: 150 }}>
                        <Select
                          value={selectedPlatform}
                          onChange={(e) => setSelectedPlatform(e.target.value)}
                          sx={{
                            backgroundColor: '#2C2C2C',
                            color: '#FFFFFF',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#2C2C2C',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#2C2C2C',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#2C2C2C',
                            },
                            '& .MuiSvgIcon-root': {
                              color: '#FFFFFF',
                            },
                          }}
                        >
                          <MenuItem value="Jira" sx={{ backgroundColor: '#2C2C2C', color: '#FFFFFF' }}>Jira</MenuItem>
                          <MenuItem value="Azure DevOps" sx={{ backgroundColor: '#2C2C2C', color: '#FFFFFF' }}>Azure DevOps</MenuItem>
                          <MenuItem value="GitHub" sx={{ backgroundColor: '#2C2C2C', color: '#FFFFFF' }}>GitHub Issues</MenuItem>
                          <MenuItem value="GitLab" sx={{ backgroundColor: '#2C2C2C', color: '#FFFFFF' }}>GitLab Issues</MenuItem>
                        </Select>
                      </FormControl>
                      <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<ConfirmationNumber />}
                        onClick={handleIntegrationSubmit}
                        disabled={integrationLoading}
                        sx={{
                          background: 'linear-gradient(90deg, #00CED1 0%, #8A2BE2 100%)',
                          color: '#FFFFFF',
                          '&:hover': {
                            background: 'linear-gradient(90deg, #00B8BB 0%, #7A1AD2 100%)',
                          },
                          '&:disabled': {
                            background: '#2C2C2C',
                            color: '#AAAAAA',
                          },
                        }}
                      >
                        Create in {selectedPlatform}
                      </Button>
                    </Box>
                  </Box>
                  {integrationLoading && <CircularProgress sx={{ mb: 2, color: '#00CED1' }} />}
                  {integrationError && <Alert severity="error" sx={{ mb: 2, backgroundColor: '#2C2C2C', color: '#FFFFFF' }}>{integrationError}</Alert>}
                  {integrationSuccess && <Alert severity="success" sx={{ mb: 2, backgroundColor: '#2C2C2C', color: '#FFFFFF' }}>{integrationSuccess}</Alert>}
                  <Divider sx={{ mb: 2, borderColor: '#2C2C2C' }} />
                  {testData.test_cases.map((test, index) => {
                    const { scenario } = extractGherkinInfo(test.gherkin_feature);
                    return (
                      <Accordion key={index} sx={{ mb: 1, boxShadow: 1, backgroundColor: '#2C2C2C' }}>
                        <AccordionSummary
                          expandIcon={<ExpandMore sx={{ color: '#FFFFFF' }} />}
                          aria-controls={`test-case-${index}-content`}
                          id={`test-case-${index}-header`}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', pr: 2 }}>
                            {/* Ticket number on the left */}
                            <Chip
                              label={test.test_id}
                              size="small"
                              sx={{
                                backgroundColor: '#1A1A1A',
                                color: '#FFFFFF',
                                fontWeight: 600,
                                fontSize: '0.75rem'
                              }}
                            />

                            {/* Scenario in the middle */}
                            {scenario && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>

                                <Typography variant="body2" sx={{ color: '#FFFFFF', fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {scenario}
                                </Typography>
                              </Box>
                            )}

                            {/* Compliance and Risk chips aligned to the right */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {test.compliance_assessment && (
                                <Chip
                                  label={test.compliance_assessment.status}
                                  color={test.compliance_assessment.status === 'Compliant' ? 'success' : 'error'}
                                  size="small"
                                />
                              )}
                              {test.risk_and_priority && (
                                <Chip
                                  label={`Risk: ${test.risk_and_priority.score}/10`}
                                  color={test.risk_and_priority.score >= 7 ? 'error' : test.risk_and_priority.score >= 4 ? 'warning' : 'success'}
                                  size="small"
                                />
                              )}
                            </Box>
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Box>
                            <Typography variant="subtitle2" sx={{ color: '#FFFFFF', mb: 1, fontWeight: 600 }}>
                              Gherkin Feature:
                            </Typography>
                            <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', bgcolor: '#1A1A1A', color: '#FFFFFF', p: 2, borderRadius: 1, mb: 2 }}>
                              <code>{test.gherkin_feature}</code>
                            </Typography>

                            {test.compliance_tags && test.compliance_tags.length > 0 && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" sx={{ color: '#FFFFFF', mb: 1, fontWeight: 600 }}>
                                  Compliance Tags:
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                  {test.compliance_tags.map((tag, i) => (
                                    <Chip
                                      key={i}
                                      label={tag}
                                      sx={{ backgroundColor: '#1A1A1A', color: '#FFFFFF' }}
                                      size="small"
                                    />
                                  ))}
                                </Box>
                              </Box>
                            )}

                            {test.compliance_assessment && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" sx={{ color: '#FFFFFF', mb: 1, fontWeight: 600 }}>
                                  Compliance Assessment:
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#AAAAAA', lineHeight: 1.6 }}>
                                  {test.compliance_assessment.reasoning}
                                </Typography>
                              </Box>
                            )}

                            {test.risk_and_priority && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" sx={{ color: '#FFFFFF', mb: 1, fontWeight: 600 }}>
                                  Risk Assessment:
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#AAAAAA', lineHeight: 1.6 }}>
                                  {test.risk_and_priority.reasoning}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </AccordionDetails>
                      </Accordion>
                    );
                  })}
                </Box>
              )}
            </>
          )}

          {tabValue === 1 && (
            <Card sx={{ p: 3, backgroundColor: '#1A1A1A' }}>
              <Typography variant="h5" gutterBottom sx={{ color: '#FFFFFF' }}>Analytics Dashboard</Typography>
              <Typography sx={{ color: '#AAAAAA' }}>Coming soon: Real-time compliance metrics, test coverage, and integration analytics powered by BigQuery.</Typography>
            </Card>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
