# Clinical Decision Support API Documentation

## Endpoints Overview

### 1. Clinical Decision Support (`/cdsHelper`)
Provides comprehensive clinical analysis with differential diagnoses and follow-up questions.

#### Request
```json
POST /cdsHelper
{
  "transcript": "Patient has a history of shortness of breath and fatigue."
}
```

#### Response
```json
{
  "response": {
    "response": {
      "Differential Diagnosis": [
        {
          "diagnosis": "Anemia",
          "confidence": "70"
        },
        {
          "diagnosis": "Chronic Obstructive Pulmonary Disease (COPD)",
          "confidence": "60"
        }
      ],
      "Questions to Ask": [
        "When did the fatigue and breathing difficulty begin?",
        "Have you noticed any other symptoms, such as chest pain or swelling in your legs?"
      ]
    }
  }
}
```

### 2. Clinical Note Analysis (`/clinicalNote`)
Analyzes clinical notes and provides diagnostic insights.

#### Request
```json
POST /clinicalNote
{
  "transcript": "The patient is suffering from chronic headaches.",
  "input": "Please provide possible diagnoses."
}
```

#### Response
```json
{
  "response": {
    "response": {
      "Differential Diagnosis": [
        {
          "diagnosis": "Tension-Type Headache",
          "confidence": "75"
        },
        {
          "diagnosis": "Migraine",
          "confidence": "60"
        }
      ],
      "Questions to Ask": [
        "When did the headaches start?",
        "Have you experienced any visual disturbances or nausea?"
      ]
    }
  }
}
```

### 3. Differential Diagnosis (`/cdsHelperddx`)
Generates differential diagnoses based on symptoms.

#### Request
```json
POST /cdsHelperddx
{
  "transcript": "The patient complains of chest pain and dizziness."
}
```

#### Response
```json
{
  "response": {
    "response": {
      "Differential Diagnosis": [
        {
          "diagnosis": "Acute Myocardial Infarction",
          "confidence": "80"
        },
        {
          "diagnosis": "Angina",
          "confidence": "65"
        }
      ],
      "Questions to Ask": [
        "Can you describe the pain? Is it sharp or dull?",
        "Do you have a history of heart disease?"
      ]
    }
  }
}
```

### 4. Question Generation (`/cdsHelperQA`)
Generates relevant clinical questions.

#### Request
```json
POST /cdsHelperQA
{
  "transcript": "The patient has been experiencing unexplained weight loss."
}
```

#### Response
```json
{
  "response": {
    "response": {
      "Questions to Ask": [
        "How much weight have you lost in the past month?",
        "Are you experiencing any changes in appetite?"
      ]
    }
  }
}
```

### 5. Patient Instructions (`/PatientInstruction`)
Generates detailed patient care instructions.

#### Request
```json
POST /PatientInstruction
{
  "history": "The patient has a medical history of hypertension and diabetes.",
  "input": "Provide detailed instructions for managing these conditions.",
  "doc_summary": "The patient is currently on medication for both hypertension and diabetes."
}
```

#### Response
```json
{
  "response": {
    "response": {
      "Instructions": [
        "Monitor your blood pressure regularly and take your prescribed medication.",
        "Follow a low-sodium diet to help manage hypertension.",
        "Maintain a balanced diet and monitor blood sugar levels for diabetes management."
      ]
    }
  }
}
```

## Making API Requests

### Using JavaScript (Axios)

```javascript
const axios = require('axios');

// Example request to cdsHelper endpoint
const response1 = await axios.post('http://localhost:3000/api/llm/cdsHelper', {
  transcript: 'Patient has a history of shortness of breath and fatigue.'
});

// Example request to clinicalNote endpoint
const response2 = await axios.post('http://localhost:3000/api/llm/clinicalNote', {
  transcript: 'The patient is suffering from chronic headaches.',
  input: 'Please provide possible diagnoses.'
});

// Example request to cdsHelperddx endpoint
const response3 = await axios.post('http://localhost:3000/api/llm/cdsHelperddx', {
  transcript: 'The patient complains of chest pain and dizziness.'
});

// Example request to cdsHelperQA endpoint
const response4 = await axios.post('http://localhost:3000/api/llm/cdsHelperQA', {
  transcript: 'The patient has been experiencing unexplained weight loss.'
});

// Example request to PatientInstruction endpoint
const response5 = await axios.post('http://localhost:3000/api/llm/PatientInstruction', {
  history: 'The patient has a medical history of hypertension and diabetes.',
  input: 'Provide detailed instructions for managing these conditions.',
  doc_summary: 'The patient is currently on medication for both hypertension and diabetes.'
});

console.log(response1.data);
console.log(response2.data);
console.log(response3.data);
console.log(response4.data);
console.log(response5.data);

```

## Error Handling

The API uses standard HTTP response codes:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 500: Internal Server Error

## Authentication

All endpoints require valid authentication headers. Contact the API administrator for credentials.

## Rate Limiting

API requests are subject to rate limiting. Please refer to the API documentation for current limits.