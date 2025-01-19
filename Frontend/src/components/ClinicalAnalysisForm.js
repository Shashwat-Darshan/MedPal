import React, { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

function ClinicalAnalysisForm({ onSubmit }) {
  const [transcript, setTranscript] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(transcript);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <TextField
        fullWidth
        multiline
        rows={4}
        variant="outlined"
        label="Clinical Transcript"
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        placeholder="Enter patient symptoms and clinical observations..."
        sx={{ mb: 2 }}
      />
      <Button
        type="submit"
        variant="contained"
        endIcon={<SendIcon />}
        disabled={!transcript.trim()}
        sx={{ float: 'right' }}
      >
        Analyze
      </Button>
    </Box>
  );
}

export default ClinicalAnalysisForm;
