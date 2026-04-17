import { getChatResponseFromGemini } from './apiService';
// Add imports for Groq and Mistral provider logic
import { groqProvider, mistralProvider, geminiProvider } from './apiService';

export interface Disease {
  id: string;
  name: string;
  confidence: number;
  description: string;
  symptoms: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Export the function from apiService for backward compatibility
export { getChatResponseFromGemini };

const extractJsonFromResponse = (response: string): any => {
  const isFastMode = localStorage.getItem('medpal_fast_mode') === 'true';
  
  if (!isFastMode) {
    console.log('🔍 Extracting JSON from response:', response);
  }
  
  // Try to find JSON in the response
  const jsonMatch = response.match(/\[[\s\S]*\]/) || response.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    if (!isFastMode) {
      console.log('📋 Found JSON match:', jsonMatch[0]);
    }
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (!isFastMode) {
        console.log('✅ Successfully parsed JSON:', parsed);
      }
      return parsed;
    } catch (e) {
      console.error('❌ Failed to parse JSON:', e);
      console.error('Raw JSON string:', jsonMatch[0]);
    }
  } else {
    if (!isFastMode) {
      console.warn('⚠️ No JSON pattern found in response');
    }
  }
  return null;
};

export const generateDiagnosisFromSymptoms = async (symptoms: string): Promise<Disease[]> => {
  const isFastMode = localStorage.getItem('medpal_fast_mode') === 'true';
  
  if (!isFastMode) {
    console.log('🏥 Generating diagnosis for:', symptoms);
  }

  const prompt = `Analyze symptoms: "${symptoms}"

Provide 5 possible conditions in JSON format:
[
  {
    "name": "Condition Name",
    "confidence": 65,
    "description": "Brief medical explanation",
    "symptoms": ["symptom1", "symptom2"]
  }
]

Order by likelihood, confidence 30-70%, common conditions first.`;

  try {
    const response = await getChatResponseFromGemini(prompt);
    const parsed = extractJsonFromResponse(response);
    if (parsed && Array.isArray(parsed)) {
      const formattedDiseases = parsed.map((disease: any, index: number) => ({
        id: `condition_${index + 1}`,
        name: disease.name || `Condition ${index + 1}`,
        confidence: Math.min(85, Math.max(15, disease.confidence || 30)),
        description: disease.description || 'Medical condition requiring further evaluation',
        symptoms: Array.isArray(disease.symptoms) ? disease.symptoms : [symptoms]
      }));
      
      if (!isFastMode) {
        console.log('✅ Diagnoses:', formattedDiseases.map(d => `${d.name} (${d.confidence}%)`));
      }
      return formattedDiseases;
    }
    
    return generateFallbackDiagnosis(symptoms);
  } catch (error) {
    console.error('💥 Error generating diagnosis:', error);
    return generateFallbackDiagnosis(symptoms);
  }
};

const generateFallbackDiagnosis = (symptoms: string): Disease[] => {
  console.log('🔄 Using fallback diagnosis for:', symptoms);
  return [
    {
      id: 'disease_1',
      name: 'General Health Concern',
      confidence: 50,
      description: 'Based on the symptoms provided, this appears to be a general health concern that should be evaluated by a healthcare professional.',
      symptoms: [symptoms]
    },
    {
      id: 'disease_2',
      name: 'Stress-Related Condition',
      confidence: 35,
      description: 'Symptoms may be related to stress or lifestyle factors.',
      symptoms: [symptoms]
    },
    {
      id: 'disease_3',
      name: 'Minor Infection',
      confidence: 30,
      description: 'Could be related to a minor viral or bacterial infection.',
      symptoms: [symptoms]
    },
    {
      id: 'disease_4',
      name: 'Allergic Reaction',
      confidence: 25,
      description: 'May be an allergic response to environmental factors.',
      symptoms: [symptoms]
    },
    {
      id: 'disease_5',
      name: 'Fatigue Syndrome',
      confidence: 20,
      description: 'Could be related to fatigue or sleep-related issues.',
      symptoms: [symptoms]
    }
  ];
};

export const generateFollowUpQuestion = async (
  diseases: Disease[],
  symptoms: string,
  questionHistory: string[],
  answerHistory: string[],
  previousQuestion: string = ''
): Promise<{ question: string; diseaseImpacts: Record<string, number> }> => {
  const isFastMode = localStorage.getItem('medpal_fast_mode') === 'true';
  
  if (!isFastMode) {
    console.log('❓ Generating follow-up question...');
  }
  
  const topDiseases = diseases
    .filter(d => d.confidence > 10)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);

  if (topDiseases.length < 2) {
    return generateTargetedFallback(diseases, symptoms, questionHistory);
  }

  const conversationContext = questionHistory.length > 0 
    ? `\nPrevious questions asked: ${questionHistory.join(', ')}\nPrevious answers: ${answerHistory.join(', ')}`
    : '';

  const antiRepeatRule = previousQuestion.trim()
    ? `\nDo NOT repeat this previous question verbatim: "${previousQuestion.trim()}".`
    : '';

  const prompt = `Symptoms: "${symptoms}"
Top conditions: ${topDiseases.map(d => `${d.name} (${d.confidence}%)`).join(', ')}
${conversationContext}
${antiRepeatRule}

Generate ONE follow-up question to distinguish between these conditions.

Return JSON:
{
  "question": "Your question?",
  "diseaseImpacts": {
    "${topDiseases[0].name}": 10,
    "${topDiseases[1].name}": -8,
    "${topDiseases[2]?.name || 'Other'}": 10
  }
}`;

  // Fast mode: use Gemini directly
  if (isFastMode) {
    try {
      const response = await getChatResponseFromGemini(prompt);
      const parsed = extractJsonFromResponse(response);
      if (parsed?.question && parsed?.diseaseImpacts) {
        if (!isFastMode) {
          console.log('✅ Question:', parsed.question);
        }
        return {
          question: parsed.question,
          diseaseImpacts: parsed.diseaseImpacts
        };
      }
    } catch (error) {
      console.error('Error generating follow-up question (fast mode):', error);
    }
    return generateTargetedFallback(diseases, symptoms, questionHistory);
  }

  // Multi-provider: try Groq, then Mistral, fallback to Gemini
  const providers = [groqProvider, mistralProvider];
  let lastError: Error | null = null;
  for (const provider of providers) {
    if (!provider.getApiKey()) continue;
    try {
      const response = await provider.makeRequest(prompt, 0.35);
      const parsed = extractJsonFromResponse(response);
      if (parsed?.question && parsed?.diseaseImpacts) {
        console.log(`✅ Question from ${provider.name}:`, parsed.question);
        return {
          question: parsed.question,
          diseaseImpacts: parsed.diseaseImpacts
        };
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.warn(`⚠️ ${provider.name} failed for follow-up question:`, lastError.message);
    }
  }
  // Fallback to Gemini if both fail
  try {
    const response = await geminiProvider.makeRequest(prompt, 0.35);
    const parsed = extractJsonFromResponse(response);
    if (parsed?.question && parsed?.diseaseImpacts) {
      console.log('✅ Question from Gemini (fallback):', parsed.question);
      return {
        question: parsed.question,
        diseaseImpacts: parsed.diseaseImpacts
      };
    }
  } catch (error) {
    console.error('Gemini fallback failed for follow-up question:', error);
  }
  return generateTargetedFallback(diseases, symptoms, questionHistory);
};

const generateTargetedFallback = (
  diseases: Disease[], 
  symptoms: string, 
  questionHistory: string[]
): { question: string; diseaseImpacts: Record<string, number> } => {
  console.log('🎯 Using fallback question');
  
  // Medical question banks based on common symptom patterns
  const medicalQuestions = [
    {
      question: "Have you noticed any specific triggers that make your symptoms worse or better?",
      category: "triggers",
      impacts: [8, -4, 6]
    },
    {
      question: "Are your symptoms constant throughout the day, or do they come and go?",
      category: "pattern",
      impacts: [10, -6, 8]
    },
    {
      question: "Have you experienced any fever, night sweats, or unexplained weight changes recently?",
      category: "systemic",
      impacts: [12, -8, 4]
    },
    {
      question: "Do you have any family history of similar health conditions?",
      category: "family_history",
      impacts: [6, 8, -4]
    },
    {
      question: "Have you traveled anywhere recently or been exposed to anyone who was sick?",
      category: "exposure",
      impacts: [15, -5, 10]
    },
    {
      question: "Are you currently taking any medications, supplements, or have any known allergies?",
      category: "medications",
      impacts: [-2, 12, -6]
    },
    {
      question: "How would you describe your sleep pattern and stress levels lately?",
      category: "lifestyle",
      impacts: [4, -8, 12]
    },
    {
      question: "Have you noticed any changes in your appetite, energy level, or mood?",
      category: "general_health",
      impacts: [6, 5, -10]
    }
  ];

  // Filter out questions we've already asked
  const usedCategories: string[] = questionHistory.map(q => {
    if (q.includes('trigger')) return 'triggers';
    if (q.includes('constant') || q.includes('come and go')) return 'pattern';
    if (q.includes('fever') || q.includes('weight')) return 'systemic';
    if (q.includes('family')) return 'family_history';
    if (q.includes('travel') || q.includes('exposed')) return 'exposure';
    if (q.includes('medication') || q.includes('allergies')) return 'medications';
    if (q.includes('sleep') || q.includes('stress')) return 'lifestyle';
    if (q.includes('appetite') || q.includes('energy')) return 'general_health';
    return '';
  }).filter(cat => cat !== '');

  const availableQuestions = medicalQuestions.filter(q => !usedCategories.includes(q.category));
  const selectedQuestion = availableQuestions.length > 0 
    ? availableQuestions[Math.floor(Math.random() * availableQuestions.length)]
    : medicalQuestions[Math.floor(Math.random() * medicalQuestions.length)];

  const diseaseImpacts: Record<string, number> = {};
  const topDiseases = diseases.slice(0, 3);
  
  topDiseases.forEach((disease, index) => {
    diseaseImpacts[disease.name] = selectedQuestion.impacts[index] || 0;
  });

  console.log('🎯 Question:', selectedQuestion.question);
  return {
    question: selectedQuestion.question,
    diseaseImpacts
  };
};

export const chatAboutDiagnosis = async (
  diagnosisContext: string,
  userMessage: string,
  chatHistory: ChatMessage[]
): Promise<string> => {
  const history = chatHistory
    .slice(-6) // Keep last 6 messages for context
    .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
    .join('\n');

  const prompt = `You are a helpful AI health assistant. Respond naturally in plain text without any JSON formatting.

Context: ${diagnosisContext}

Recent conversation:
${history}

User question: ${userMessage}

Provide a concise, helpful, and supportive response in plain conversational text. Always recommend consulting healthcare professionals for medical advice.`;

  try {
    const response = await getChatResponseFromGemini(prompt);
    // Ensure we return clean text, not JSON
    if (response.includes('"response":') || response.includes('{') || response.includes('}')) {
      try {
        const parsed = JSON.parse(response);
        return parsed.response || parsed.content || response;
      } catch {
        return response.replace(/[{}"\[\]]/g, '').replace(/response:|content:/g, '').trim();
      }
    }
    return response;
  } catch (error) {
    console.error('Error in chat about diagnosis:', error);
    return 'I apologize, but I encountered an error. Please try rephrasing your question, or consider consulting with a healthcare professional for personalized medical advice.';
  }
};

// Export geminiService object for backward compatibility
export const geminiService = {
  chatAboutDiagnosis,
  generateDiagnosisFromSymptoms,
  generateFollowUpQuestion
};
