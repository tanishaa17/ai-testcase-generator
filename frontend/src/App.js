import React, { useState } from 'react';
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
  createTheme
} from '@mui/material';
import { UploadFile, ArrowForward } from '@mui/icons-material';

// Create a simple theme for a professional look
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
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
  const [domain, setDomain] = useState('Healthcare');
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
    setTestData(null);
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a requirement file first.');
      return;
    }

    setLoading(true);
    setError('');
    setTestData(null);

    const formData = new FormData();
    formData.append('requirement_file', file);
    formData.append('domain', domain);

    try {
      const response = await axios.post('http://localhost:5000/api/generate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setTestData(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'An unexpected error occurred.';
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ my: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 5, p: 2, backgroundColor: 'white', borderRadius: 2, boxShadow: 1 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            AI-Powered Test Case Generator
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Automatically convert software requirements into compliant, traceable test cases.
          </Typography>
        </Box>

        <Card sx={{ mb: 4, p: 3, boxShadow: 1 }}>
          <Box component="form" noValidate autoComplete="off">
            <Typography variant="h6" gutterBottom>1. Specify Domain</Typography>
            <TextField
              fullWidth
              label="Domain"
              variant="outlined"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              sx={{ mb: 3 }}
            />
            <Typography variant="h6" gutterBottom>2. Upload Requirement</Typography>
            <Button
              variant="contained"
              component="label"
              startIcon={<UploadFile />}
            >
              {file ? file.name : 'Select File'}
              <input type="file" hidden onChange={handleFileChange} />
            </Button>
            <Box sx={{ mt: 4, position: 'relative', textAlign: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                endIcon={<ArrowForward />}
                onClick={handleSubmit}
                disabled={loading}
              >
                Generate Test Cases
              </Button>
              {loading && (
                <CircularProgress
                  size={24}
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    marginTop: '-12px',
                    marginLeft: '-12px',
                  }}
                />
              )}
            </Box>
          </Box>
        </Card>

        {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

        {testData && testData.test_cases && (
          <Box>
            <Typography variant="h5" gutterBottom>Generated Test Cases</Typography>
            {testData.test_cases.map((test, index) => (
              <Card key={index} sx={{ mb: 2, boxShadow: 1 }}>
                <CardHeader
                  title={`Test ID: ${test.test_id}`}
                  subheader={`Source: "${test.requirement_source}"`}
                  sx={{ bgcolor: '#eeeeee' }}
                />
                <CardContent>
                  <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', bgcolor: '#282c34', color: 'white', p: 2, borderRadius: 1 }}>
                    <code>{test.gherkin_feature}</code>
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">Compliance Tags:</Typography>
                    {test.compliance_tags && test.compliance_tags.length > 0 ? (
                      test.compliance_tags.map((tag, i) => (
                        <Chip key={i} label={tag} sx={{ mr: 1, mt: 1 }} />
                      ))
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