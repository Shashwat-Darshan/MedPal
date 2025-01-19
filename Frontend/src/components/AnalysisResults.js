import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, Chip, Divider } from '@mui/material';

function AnalysisResults({ results }) {
  if (!results?.response?.response) {
    return null;
  }

  // Parse the stringified JSON response
  const parsedResponse = JSON.parse(results.response.response);
  const { "Differential Diagnosis": diagnoses, "Questions to Ask": questions } = parsedResponse;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Differential Diagnoses
      </Typography>
      <List>
        {diagnoses && diagnoses.map((diagnosis, index) => (
          <ListItem key={index}>
            <ListItemText
              primary={diagnosis.diagnosis}
              secondary={
                <Chip
                  label={`Confidence: ${diagnosis.confidence}%`}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              }
            />
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h5" gutterBottom>
        Follow-up Questions
      </Typography>
      <List>
        {questions && questions.map((question, index) => (
          <ListItem key={index}>
            <ListItemText primary={question} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default AnalysisResults;
