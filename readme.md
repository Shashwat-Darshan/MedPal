# Clinical Decision Support API Documentation

## Overview
This API provides various endpoints for clinical decision support, helping healthcare providers with diagnosis suggestions, patient instructions, and relevant medical questions.

## Endpoints

### 1. `/cdsHelper`
Provides differential diagnoses and suggested questions based on patient symptoms.

#### Request
```json
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

### 2. `/clinicalNote`
Analyzes clinical notes and provides diagnostic suggestions.

#### Request
```json
{
  "transcript": "The patient is suffering from chronic headaches.",
  "input": "Please provide possible diagnoses."
}
```

### 3. `/cdsHelperddx`
Focuses specifically on differential diagnosis generation.

#### Request
```json
{
  "transcript": "The patient complains of chest pain and dizziness."
}
```

### 4. `/cdsHelperQA`
Generates relevant clinical questions based on patient symptoms.

#### Request
```json
{
  "transcript": "The patient has been experiencing unexplained weight loss."
}
```

### 5. `/PatientInstruction`
Provides patient care instructions based on medical history and current conditions.

#### Request
```json
{
  "history": "The patient has a medical history of hypertension and diabetes.",
  "input": "Provide detailed instructions for managing these conditions.",
  "doc_summary": "The patient is currently on medication for both hypertension and diabetes."
}
```

## Usage Example
```javascript
const response = await axios.post('http://your-api-endpoint/cdsHelper', {
  transcript: 'Patient has a history of shortness of breath and fatigue.'
});
console.log(response.data);
```

## Response Format
All endpoints return JSON responses with a nested structure containing either differential diagnoses, questions to ask, patient instructions, or a combination of these elements. Diagnostic suggestions include confidence scores where applicable.