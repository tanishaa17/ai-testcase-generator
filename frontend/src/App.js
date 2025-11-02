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
  Chip,
  Alert,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton
} from '@mui/material';
import { UploadFile, ConfirmationNumber, Settings, Add, ExpandMore, AutoAwesome, ArrowBack } from '@mui/icons-material';
import './App.css';

// API Base URL - Uses environment variable with fallback to production URL
// For local development: Create a .env.local file with REACT_APP_API_BASE_URL=http://localhost:5000
// For production: Uses the deployed backend URL by default
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://ai-testcase-generator-583h.onrender.com';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3B82F6', // Neon blue
      light: '#60A5FA',
      dark: '#2563EB',
    },
    secondary: {
      main: '#9333EA', // Purple
      light: '#A855F7',
      dark: '#7E22CE',
    },
    background: {
      default: '#0A0A0F',
      paper: 'rgba(15, 15, 23, 0.6)',
    },
    text: {
      primary: '#FAFAFA',
      secondary: '#9CA3AF',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", "SF Pro Display", system-ui, sans-serif',
    h4: {
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    h5: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    body1: {
      fontWeight: 400,
      fontSize: '0.9375rem',
    },
    body2: {
      fontWeight: 400,
      fontSize: '0.875rem',
    },
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#FAFAFA',
            transition: 'all 0.3s ease',
            '& fieldset': {
              border: 'none',
            },
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(59, 130, 246, 0.3)',
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              borderColor: 'rgba(59, 130, 246, 0.6)',
              boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.1)',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#9CA3AF',
          },
          '& .MuiInputBase-input::placeholder': {
            color: '#6B7280',
            opacity: 1,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(10px)',
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
          backgroundColor: 'rgba(15, 15, 23, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          color: '#FAFAFA',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          color: '#FAFAFA',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          color: '#FAFAFA',
          borderRadius: '12px',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          color: '#FAFAFA',
          borderRadius: '8px',
          margin: '4px 8px',
          '&:hover': {
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            '&:hover': {
              backgroundColor: 'rgba(59, 130, 246, 0.25)',
            },
          },
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          color: '#FAFAFA',
          fontWeight: 600,
          fontSize: '1.25rem',
          letterSpacing: '-0.01em',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          color: '#FAFAFA',
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          '& .MuiInputLabel-root': {
            color: '#9CA3AF',
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#9CA3AF',
          '&.Mui-focused': {
            color: '#9CA3AF',
          },
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
          padding: '20px 24px',
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
          color: '#FAFAFA',
          boxShadow: 'none',
          '&:before': {
            display: 'none',
          },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
          color: '#FAFAFA',
          padding: 0,
          minHeight: 'auto',
          '&.Mui-expanded': {
            minHeight: 'auto',
          },
          '& .MuiAccordionSummary-content': {
            margin: 0,
            '&.Mui-expanded': {
              margin: 0,
            },
          },
        },
        expandIconWrapper: {
          color: '#9CA3AF',
        },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          padding: 0,
          backgroundColor: 'transparent !important',
          '&.Mui-expanded': {
            backgroundColor: 'transparent !important',
          },
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
  const [domain] = useState('Healthcare'); // Fixed domain value
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
  const [expandedAccordion, setExpandedAccordion] = useState(null);

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
      <Box sx={{ 
        minHeight: '100vh', 
        backgroundColor: '#0A0A0F',
        backgroundImage: 'radial-gradient(at 20% 30%, rgba(59, 130, 246, 0.1) 0px, transparent 50%), radial-gradient(at 80% 70%, rgba(147, 51, 234, 0.1) 0px, transparent 50%)',
        position: 'relative'
      }}>
        {/* Top Header */}
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(10, 10, 15, 0.8)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          px: 4,
          py: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 600, 
            color: '#FAFAFA',
            letterSpacing: '-0.02em',
            fontSize: '1.125rem'
          }}>
            AI Test Auditor
          </Typography>
          <IconButton
            onClick={() => setSettingsOpen(true)}
            sx={{
              color: '#9CA3AF',
              '&:hover': {
                color: '#FAFAFA',
                backgroundColor: 'rgba(255, 255, 255, 0.05)'
              }
            }}
          >
            <Settings />
          </IconButton>
        </Box>

        <Container maxWidth="md" sx={{ pt: 12, pb: 6 }}>

          <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} fullWidth maxWidth="md">
            <DialogTitle>ALM Platform Configuration</DialogTitle>
            <DialogContent>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Configure credentials for your chosen ALM platform. Settings are saved in your browser's local storage.
              </Typography>

              <FormControl fullWidth margin="dense" size="small">
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
                  <TextField name="server" label="Jira Server URL" value={jiraSettings.server} onChange={(e) => handleSettingsChange(e, 'jira')} fullWidth margin="dense" size="small" placeholder="https://your-domain.atlassian.net" />
                  <TextField name="user" label="Jira User Email" value={jiraSettings.user} onChange={(e) => handleSettingsChange(e, 'jira')} fullWidth margin="dense" size="small" />
                  <TextField name="apiToken" label="Jira API Token" value={jiraSettings.apiToken} onChange={(e) => handleSettingsChange(e, 'jira')} fullWidth margin="dense" size="small" type="password" />
                  <TextField name="projectKey" label="Jira Project Key" value={jiraSettings.projectKey} onChange={(e) => handleSettingsChange(e, 'jira')} fullWidth margin="dense" size="small" placeholder="PROJ" />
                </>
              )}

              {selectedPlatform === 'Azure DevOps' && (
                <>
                  <TextField name="organization" label="Organization Name" value={azureSettings.organization} onChange={(e) => handleSettingsChange(e, 'azure')} fullWidth margin="dense" size="small" placeholder="myorg" />
                  <TextField name="pat" label="Personal Access Token" value={azureSettings.pat} onChange={(e) => handleSettingsChange(e, 'azure')} fullWidth margin="dense" size="small" type="password" />
                  <TextField name="project" label="Project Name" value={azureSettings.project} onChange={(e) => handleSettingsChange(e, 'azure')} fullWidth margin="dense" size="small" />
                </>
              )}

              {selectedPlatform === 'GitHub' && (
                <>
                  <TextField name="token" label="GitHub Personal Access Token" value={githubSettings.token} onChange={(e) => handleSettingsChange(e, 'github')} fullWidth margin="dense" size="small" type="password" helperText="Create token at: https://github.com/settings/tokens" />
                  <TextField name="owner" label="Repository Owner (username)" value={githubSettings.owner} onChange={(e) => handleSettingsChange(e, 'github')} fullWidth margin="dense" size="small" placeholder="your-username" />
                  <TextField name="repo" label="Repository Name" value={githubSettings.repo} onChange={(e) => handleSettingsChange(e, 'github')} fullWidth margin="dense" size="small" placeholder="test-cases" />
                </>
              )}

              {selectedPlatform === 'GitLab' && (
                <>
                  <TextField name="url" label="GitLab URL" value={gitlabSettings.url} onChange={(e) => handleSettingsChange(e, 'gitlab')} fullWidth margin="dense" size="small" placeholder="https://gitlab.com" helperText="Use https://gitlab.com for public GitLab" />
                  <TextField name="token" label="GitLab Personal Access Token" value={gitlabSettings.token} onChange={(e) => handleSettingsChange(e, 'gitlab')} fullWidth margin="dense" size="small" type="password" helperText="Create token at: GitLab Settings > Access Tokens" />
                  <TextField name="projectId" label="Project ID (Numeric)" value={gitlabSettings.projectId} onChange={(e) => handleSettingsChange(e, 'gitlab')} fullWidth margin="dense" size="small" placeholder="12345678" helperText="Found in project Settings > General" />
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setSettingsOpen(false)}
                sx={{ 
                  color: '#9CA3AF',
                  borderRadius: '12px',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveSettings}
                variant="contained"
                disabled={!isSettingsValid}
                sx={{
                  background: 'linear-gradient(135deg, #3B82F6 0%, #9333EA 100%)',
                  color: '#FAFAFA',
                  borderRadius: '12px',
                  px: 3,
                  boxShadow: '0 4px 14px rgba(59, 130, 246, 0.2)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #2563EB 0%, #7E22CE 100%)',
                    boxShadow: '0 6px 20px rgba(59, 130, 246, 0.3)',
                    transform: 'translateY(-1px)',
                  },
                  '&:disabled': {
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#6B7280',
                    boxShadow: 'none',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                Save
              </Button>
            </DialogActions>
          </Dialog>

          {/* Main Content - Conditional Rendering */}
          {loading ? (
            // AI Thinking / Loader Screen
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              minHeight: '60vh',
              gap: 4
            }}>
              {/* Floating Sphere Animation */}
              <Box sx={{ position: 'relative', width: 120, height: 120 }}>
                <Box sx={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(147, 51, 234, 0.2) 100%)',
                  animation: 'float 3s ease-in-out infinite',
                  filter: 'blur(20px)'
                }} />
                <Box sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.6), rgba(147, 51, 234, 0.6))',
                  border: '2px solid rgba(59, 130, 246, 0.4)',
                  animation: 'pulse-glow 2s ease-in-out infinite'
                }} />
              </Box>
              
              <Typography variant="h5" sx={{ 
                color: '#FAFAFA', 
                fontWeight: 500,
                letterSpacing: '-0.01em',
                fontSize: '1.5rem'
              }}>
                Thinking…
              </Typography>
              
              <Typography variant="body2" sx={{ 
                color: '#9CA3AF',
                textAlign: 'center',
                maxWidth: 400,
                lineHeight: 1.6
              }}>
                Understanding logic, extracting scenarios, validating compliance…
              </Typography>
            </Box>
          ) : testData && testData.test_cases ? (
            // Results View
            <Box className="fade-in">
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <IconButton
                    onClick={() => {
                      setTestData(null);
                      setRequirementText('');
                      setFile(null);
                      setError('');
                      setIntegrationSuccess('');
                      setIntegrationError('');
                    }}
                    sx={{
                      color: '#9CA3AF',
                      '&:hover': {
                        color: '#FAFAFA',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)'
                      }
                    }}
                  >
                    <ArrowBack />
                  </IconButton>
                  <Typography variant="h5" sx={{ 
                    color: '#FAFAFA',
                    fontWeight: 600,
                    letterSpacing: '-0.01em'
                  }}>
                    Generated Test Cases
                  </Typography>
                </Box>
                
                {/* Export Actions */}
                <Box sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  mb: 4,
                  flexWrap: 'wrap'
                }}>
                  <FormControl size="small" sx={{ minWidth: 180 }}>
                    <Select
                      value={selectedPlatform}
                      onChange={(e) => setSelectedPlatform(e.target.value)}
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        color: '#FAFAFA',
                        borderRadius: '12px',
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(59, 130, 246, 0.3)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(59, 130, 246, 0.5)',
                        },
                      }}
                    >
                      <MenuItem value="Jira">Jira</MenuItem>
                      <MenuItem value="Azure DevOps">Azure DevOps</MenuItem>
                      <MenuItem value="GitHub">GitHub Issues</MenuItem>
                      <MenuItem value="GitLab">GitLab Issues</MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    startIcon={integrationLoading ? <CircularProgress size={16} sx={{ color: '#FAFAFA' }} /> : <ConfirmationNumber />}
                    onClick={handleIntegrationSubmit}
                    disabled={integrationLoading}
                    sx={{
                      background: 'linear-gradient(135deg, #3B82F6 0%, #9333EA 100%)',
                      color: '#FAFAFA',
                      borderRadius: '12px',
                      px: 3,
                      py: 1,
                      textTransform: 'none',
                      fontWeight: 500,
                      boxShadow: '0 4px 14px rgba(59, 130, 246, 0.2)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #2563EB 0%, #7E22CE 100%)',
                        boxShadow: '0 6px 20px rgba(59, 130, 246, 0.3)',
                        transform: 'translateY(-1px)',
                      },
                      '&:disabled': {
                        background: 'linear-gradient(135deg, #3B82F6 0%, #9333EA 100%)',
                        opacity: 0.7
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {integrationLoading ? 'Exporting...' : `Create in ${selectedPlatform}`}
                  </Button>
                </Box>
                {integrationError && (
                  <Alert severity="error" sx={{ 
                    mb: 3, 
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    color: '#FAFAFA',
                    borderRadius: '12px'
                  }}>
                    {integrationError}
                  </Alert>
                )}
                {integrationSuccess && (
                  <Alert severity="success" sx={{ 
                    mb: 3,
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.2)',
                    color: '#FAFAFA',
                    borderRadius: '12px'
                  }}>
                    {integrationSuccess}
                  </Alert>
                )}
              </Box>
              
              {/* Test Cases Cards */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {testData.test_cases && testData.test_cases.map((test, index) => {
                  const { scenario } = extractGherkinInfo(test?.gherkin_feature || '');
                  return (
                    <Card 
                      key={index} 
                      className="fade-in"
                      onClick={() => setExpandedAccordion(expandedAccordion === index ? null : index)}
                      sx={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          borderColor: 'rgba(59, 130, 246, 0.3)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                        }
                      }}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box>
                            <Typography variant="h6" sx={{ 
                              color: '#FAFAFA', 
                              fontWeight: 600,
                              mb: 0.5
                            }}>
                              {test.test_id}
                            </Typography>
                            {scenario && (
                              <Typography variant="body2" sx={{ 
                                color: '#9CA3AF',
                                fontSize: '0.875rem'
                              }}>
                                {scenario}
                              </Typography>
                            )}
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                            {test.compliance_assessment && (
                              <Chip
                                label={test.compliance_assessment.status}
                                color={test.compliance_assessment.status === 'Compliant' ? 'success' : 'error'}
                                size="small"
                                sx={{
                                  borderRadius: '8px',
                                  fontWeight: 500
                                }}
                              />
                            )}
                            {test.risk_and_priority && (
                              <Chip
                                label={`Risk: ${test.risk_and_priority.score}/10`}
                                color={test.risk_and_priority.score >= 7 ? 'error' : test.risk_and_priority.score >= 4 ? 'warning' : 'success'}
                                size="small"
                                sx={{
                                  borderRadius: '8px',
                                  fontWeight: 500
                                }}
                              />
                            )}
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedAccordion(expandedAccordion === index ? null : index);
                              }}
                              size="small"
                              sx={{
                                color: '#9CA3AF',
                                padding: '4px',
                                '&:hover': {
                                  color: '#FAFAFA',
                                  backgroundColor: 'rgba(255, 255, 255, 0.05)'
                                },
                                transform: expandedAccordion === index ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.3s ease'
                              }}
                            >
                              <ExpandMore />
                            </IconButton>
                          </Box>
                        </Box>
                        
                        <Accordion 
                          expanded={expandedAccordion === index}
                          sx={{ 
                            backgroundColor: 'transparent',
                            boxShadow: 'none',
                            '&:before': { display: 'none' },
                            '&.Mui-expanded': {
                              backgroundColor: 'transparent',
                              margin: 0
                            }
                          }}
                        >
                          <AccordionSummary
                            sx={{ 
                              display: 'none'
                            }}
                          >
                          </AccordionSummary>
                          <AccordionDetails sx={{ 
                            p: 2, 
                            backgroundColor: 'transparent !important',
                            '&.Mui-expanded': {
                              backgroundColor: 'transparent !important',
                            }
                          }}>
                            <Typography variant="subtitle2" sx={{ color: '#FAFAFA', mb: 1, fontWeight: 600 }}>
                              Gherkin Feature
                            </Typography>
                            <Box sx={{
                              p: 2,
                              borderRadius: '12px',
                              mb: 2
                            }}>
                              <Typography variant="body2" component="pre" sx={{ 
                                whiteSpace: 'pre-wrap', 
                                color: '#FAFAFA',
                                fontFamily: 'Monaco, Consolas, monospace',
                                fontSize: '0.8125rem',
                                lineHeight: 1.6,
                                margin: 0
                              }}>
                                {test.gherkin_feature}
                              </Typography>
                            </Box>
                            
                            {test.compliance_tags && test.compliance_tags.length > 0 && (
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ color: '#FAFAFA', mb: 1, fontWeight: 600 }}>
                                  Compliance Tags
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                  {test.compliance_tags && test.compliance_tags.map((tag, i) => (
                                    <Chip 
                                      key={i} 
                                      label={tag} 
                                      size="small"
                                      sx={{ 
                                        backgroundColor: 'rgba(59, 130, 246, 0.15)',
                                        color: '#60A5FA',
                                        border: '1px solid rgba(59, 130, 246, 0.2)',
                                        borderRadius: '8px'
                                      }}
                                    />
                                  ))}
                                </Box>
                              </Box>
                            )}
                            
                            {test.compliance_assessment && (
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ color: '#FAFAFA', mb: 1, fontWeight: 600 }}>
                                  Compliance Assessment
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#9CA3AF', lineHeight: 1.7 }}>
                                  {test.compliance_assessment.reasoning}
                                </Typography>
                              </Box>
                            )}
                            
                            {test.risk_and_priority && (
                              <Box>
                                <Typography variant="subtitle2" sx={{ color: '#FAFAFA', mb: 1, fontWeight: 600 }}>
                                  Risk Assessment
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#9CA3AF', lineHeight: 1.7 }}>
                                  {test.risk_and_priority.reasoning}
                                </Typography>
                              </Box>
                            )}
                          </AccordionDetails>
                        </Accordion>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            </Box>
          ) : (
            // Hero Input View
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '60vh',
              gap: 3
            }}>
              <TextField
                fullWidth
                placeholder="Describe a test scenario or requirement… 🚀"
                variant="outlined"
                multiline
                rows={10}
                value={requirementText}
                onChange={handleTextChange}
                className="ai-glow-border"
                sx={{
                  maxWidth: '800px',
                  '& .MuiOutlinedInput-root': {
                    fontSize: '1rem',
                    lineHeight: 1.6,
                    '& textarea': {
                      padding: '24px',
                    },
                    '& textarea::placeholder': {
                      fontSize: '1rem',
                    },
                  },
                }}
              />

              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                alignItems: 'center',
                maxWidth: '800px',
                width: '100%',
                justifyContent: 'flex-end'
              }}>
                <IconButton
                  component="label"
                  sx={{
                    color: '#9CA3AF',
                    width: 44,
                    height: 44,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: '#FAFAFA',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      borderColor: 'rgba(59, 130, 246, 0.3)',
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  <input type="file" hidden onChange={handleFileChange} accept=".pdf,.docx,.xml,.txt" />
                  {file ? (
                    <UploadFile sx={{ fontSize: '20px' }} />
                  ) : (
                    <Add sx={{ fontSize: '20px' }} />
                  )}
                </IconButton>

                <Button
                  variant="contained"
                  onClick={handleGenerateSubmit}
                  disabled={loading || (!requirementText.trim() && !file)}
                  endIcon={<AutoAwesome sx={{ fontSize: '18px' }} />}
                  sx={{
                    background: 'linear-gradient(135deg, #3B82F6 0%, #9333EA 100%)',
                    color: '#FAFAFA',
                    borderRadius: '12px',
                    px: 4,
                    py: 1.25,
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '0.9375rem',
                    boxShadow: '0 4px 14px rgba(59, 130, 246, 0.25)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #2563EB 0%, #7E22CE 100%)',
                      boxShadow: '0 6px 20px rgba(59, 130, 246, 0.35)',
                      transform: 'translateY(-1px)',
                    },
                    '&:disabled': {
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#6B7280',
                      boxShadow: 'none',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  Generate
                </Button>
              </Box>

              {error && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    maxWidth: '800px',
                    width: '100%',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    color: '#FAFAFA',
                    borderRadius: '12px'
                  }}
                >
                  {error}
                </Alert>
              )}
            </Box>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
