import { getChatResponseFromGemini } from './apiService';
import { getLastDiagnosisAgentMeta, runDiagnosisAgent, runFollowUpAgent } from './agentService';

export interface Disease {
  id: string;
  name: string;
  domain?: string;
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

export const generateDiagnosisFromSymptoms = async (symptoms: string): Promise<Disease[]> => {
  const isFastMode = localStorage.getItem('medpal_fast_mode') === 'true';

  if (!isFastMode) {
    console.log('?? Generating diagnosis for:', symptoms);
  }

  try {
    const result = await runDiagnosisAgent(symptoms);
    const formattedDiseases = result.diseases as Disease[];

    if (!isFastMode) {
      console.log('? Diagnoses:', formattedDiseases.map((d) => `${d.name} (${d.confidence}%)`));
    }

    return formattedDiseases;
  } catch (error) {
    console.error('?? Error generating diagnosis:', error);
    return generateFallbackDiagnosis(symptoms);
  }
};

const generateFallbackDiagnosis = (symptoms: string): Disease[] => {
  console.log('?? Using fallback diagnosis for:', symptoms);
  return [
    {
      id: 'disease_1',
      name: 'General Health Concern',
      domain: 'general-internal',
      confidence: 50,
      description: 'Based on the symptoms provided, this appears to be a general health concern that should be evaluated by a healthcare professional.',
      symptoms: [symptoms],
    },
    {
      id: 'disease_2',
      name: 'Stress-Related Condition',
      domain: 'mental-health',
      confidence: 35,
      description: 'Symptoms may be related to stress or lifestyle factors.',
      symptoms: [symptoms],
    },
    {
      id: 'disease_3',
      name: 'Minor Infection',
      domain: 'infectious',
      confidence: 30,
      description: 'Could be related to a minor viral or bacterial infection.',
      symptoms: [symptoms],
    },
    {
      id: 'disease_4',
      name: 'Allergic Reaction',
      domain: 'general-internal',
      confidence: 25,
      description: 'May be an allergic response to environmental factors.',
      symptoms: [symptoms],
    },
    {
      id: 'disease_5',
      name: 'Fatigue Syndrome',
      domain: 'general-internal',
      confidence: 20,
      description: 'Could be related to fatigue or sleep-related issues.',
      symptoms: [symptoms],
    },
  ];
};

export const generateFollowUpQuestion = async (
  diseases: Disease[],
  symptoms: string,
  questionHistory: string[],
  answerHistory: string[],
  previousQuestion: string = ''
): Promise<{ question: string; diseaseImpacts: Record<string, number> }> => {
  const topDiseases = diseases
    .filter((d) => d.confidence > 10)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);

  if (topDiseases.length < 2) {
    return generateTargetedFallback(diseases, symptoms, questionHistory);
  }

  try {
    return await runFollowUpAgent(topDiseases, symptoms, questionHistory, answerHistory, previousQuestion);
  } catch (error) {
    console.error('Follow-up agent failed:', error);
  }

  return generateTargetedFallback(diseases, symptoms, questionHistory);
};

const generateTargetedFallback = (
  diseases: Disease[],
  symptoms: string,
  questionHistory: string[]
): { question: string; diseaseImpacts: Record<string, number> } => {
  console.log('?? Using fallback question');

  const medicalQuestions = [
    {
      question: 'Have you noticed specific triggers that make your symptoms worse?',
      category: 'triggers',
      impacts: [8, -4, 6],
    },
    {
      question: 'Are your symptoms constant throughout the day, or do they come and go?',
      category: 'pattern',
      impacts: [10, -6, 8],
    },
    {
      question: 'Have you had fever, night sweats, or unexplained weight changes recently?',
      category: 'systemic',
      impacts: [12, -8, 4],
    },
    {
      question: 'Do you have any family history of similar health conditions?',
      category: 'family_history',
      impacts: [6, 8, -4],
    },
    {
      question: 'Have you traveled anywhere recently or been exposed to anyone who was sick?',
      category: 'exposure',
      impacts: [15, -5, 10],
    },
    {
      question: 'Are you currently taking medications or supplements, or do you have known allergies?',
      category: 'medications',
      impacts: [-2, 12, -6],
    },
    {
      question: 'Have your sleep quality or stress levels worsened recently?',
      category: 'lifestyle',
      impacts: [4, -8, 12],
    },
    {
      question: 'Have you noticed changes in appetite, energy, or mood?',
      category: 'general_health',
      impacts: [6, 5, -10],
    },
  ];

  const usedCategories: string[] = questionHistory
    .map((q) => {
      if (q.includes('trigger')) return 'triggers';
      if (q.includes('constant') || q.includes('come and go')) return 'pattern';
      if (q.includes('fever') || q.includes('weight')) return 'systemic';
      if (q.includes('family')) return 'family_history';
      if (q.includes('travel') || q.includes('exposed')) return 'exposure';
      if (q.includes('medication') || q.includes('allergies')) return 'medications';
      if (q.includes('sleep') || q.includes('stress')) return 'lifestyle';
      if (q.includes('appetite') || q.includes('energy')) return 'general_health';
      return '';
    })
    .filter((cat) => cat !== '');

  const availableQuestions = medicalQuestions.filter((q) => !usedCategories.includes(q.category));
  const selectedQuestion =
    availableQuestions.length > 0
      ? availableQuestions[Math.floor(Math.random() * availableQuestions.length)]
      : medicalQuestions[Math.floor(Math.random() * medicalQuestions.length)];

  const diseaseImpacts: Record<string, number> = {};
  const topDiseases = diseases.slice(0, 3);

  topDiseases.forEach((disease, index) => {
    diseaseImpacts[disease.name] = selectedQuestion.impacts[index] || 0;
  });

  return {
    question: selectedQuestion.question,
    diseaseImpacts,
  };
};

export const chatAboutDiagnosis = async (
  diagnosisContext: string,
  userMessage: string,
  chatHistory: ChatMessage[]
): Promise<string> => {
  const history = chatHistory
    .slice(-6)
    .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
    .join('\n');

  const prompt = `You are a helpful AI health assistant. Respond naturally in plain text without any JSON formatting.\n\nContext: ${diagnosisContext}\n\nRecent conversation:\n${history}\n\nUser question: ${userMessage}\n\nProvide a concise, helpful, and supportive response in plain conversational text. Always recommend consulting healthcare professionals for medical advice.`;

  try {
    const response = await getChatResponseFromGemini(prompt);
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

export const geminiService = {
  chatAboutDiagnosis,
  generateDiagnosisFromSymptoms,
  generateFollowUpQuestion,
};

export { getLastDiagnosisAgentMeta };
