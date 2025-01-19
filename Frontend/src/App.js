import React, { useState } from 'react';
import { Container, Box, Typography, Paper, ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import ClinicalAnalysisForm from './components/ClinicalAnalysisForm';
import AnalysisResults from './components/AnalysisResults';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleAnalysisSubmit = async (transcript) => {
    try {
      const apiUrl = 'http://localhost:3000/api/llm/cdsHelper';
      const requestBody = {
        transcript: transcript
      };
      
      // Log outgoing request
      console.log('Outgoing Request:', {
        url: apiUrl,
        method: 'POST',
        body: requestBody
      });

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Log incoming response
      console.log('Incoming Response:', data);
      console.log('Parsed Response:', JSON.parse(data.response.response));
      
      setAnalysisResult(data);
    } catch (error) {
      console.error('Error:', error);
      // Log more details about the error
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom align="center">
            MedPal Clinical Decision Support
          </Typography>
          <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
            <ClinicalAnalysisForm onSubmit={handleAnalysisSubmit} />
          </Paper>
          {analysisResult && (
            <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
              <AnalysisResults results={analysisResult} />
            </Paper>
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
