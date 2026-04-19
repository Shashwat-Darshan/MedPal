import { getChatResponseFromGemini } from './apiService';

export interface AgentDisease {
  id: string;
  name: string;
  domain: string;
  confidence: number;
  description: string;
  symptoms: string[];
}

export interface AgentDecisionMeta {
  provider: string;
  fallbackUsed: boolean;
  lowCertainty: boolean;
  emergencyFlag: boolean;
  tokenOptimized: boolean;
}

export interface DiagnosisAgentResult {
  diseases: AgentDisease[];
  meta: AgentDecisionMeta;
}

export interface FollowUpAgentResult {
  question: string;
  diseaseImpacts: Record<string, number>;
}

let lastDiagnosisAgentMeta: AgentDecisionMeta | null = null;

export const getLastDiagnosisAgentMeta = (): AgentDecisionMeta | null =>
  lastDiagnosisAgentMeta ? { ...lastDiagnosisAgentMeta } : null;

const EMERGENCY_SIGNAL_PATTERNS = [
  /chest pain/i,
  /shortness of breath/i,
  /difficulty breathing/i,
  /faint(ing)?/i,
  /seizure/i,
  /stroke/i,
  /one-sided weakness/i,
  /slurred speech/i,
  /severe bleeding/i,
  /vomiting blood/i,
  /suicidal/i,
  /self-harm/i,
  /pregnan(t|cy).*(pain|bleeding)/i,
  /high fever/i,
  /stiff neck/i,
];

const ILLNESS_DOMAINS = [
  'cardiovascular',
  'respiratory',
  'neurological',
  'gastrointestinal',
  'endocrine-metabolic',
  'infectious',
  'musculoskeletal',
  'mental-health',
  'dermatological',
  'general-internal',
  'urgent-emergency',
] as const;

const DOMAIN_KEYWORDS: Array<{ domain: string; patterns: RegExp[] }> = [
  { domain: 'urgent-emergency', patterns: [/emergency|urgent|critical|911|er/i] },
  { domain: 'cardiovascular', patterns: [/heart|cardiac|angina|myocard|hypertension|blood pressure|chest pain/i] },
  { domain: 'respiratory', patterns: [/breath|respir|asthma|lung|cough|wheeze|pulmonary/i] },
  { domain: 'neurological', patterns: [/headache|migraine|seizure|stroke|dizzy|vertigo|neurolog/i] },
  { domain: 'gastrointestinal', patterns: [/abdominal|stomach|nausea|vomit|diarrhea|constipation|gi|gastro/i] },
  { domain: 'endocrine-metabolic', patterns: [/diabet|thyroid|metabolic|glucose|hormone/i] },
  { domain: 'infectious', patterns: [/infection|viral|bacterial|fever|flu|covid|sepsis/i] },
  { domain: 'musculoskeletal', patterns: [/joint|muscle|back pain|arthritis|sprain|bone/i] },
  { domain: 'mental-health', patterns: [/anxiety|panic|depress|stress|mental|insomnia/i] },
  { domain: 'dermatological', patterns: [/rash|skin|eczema|dermat|itch|hives/i] },
];

const FALLBACK_DISEASES = (symptoms: string): AgentDisease[] => [
  {
    id: 'condition_1',
    name: 'General health concern',
    domain: 'general-internal',
    confidence: 42,
    description: 'Symptoms are non-specific and need clinician assessment. This is a preliminary possibility, not a diagnosis.',
    symptoms: extractSymptomHints(symptoms),
  },
  {
    id: 'condition_2',
    name: 'Mild self-limiting condition',
    domain: 'infectious',
    confidence: 30,
    description: 'A temporary condition is possible, but symptom progression should be monitored. This is not a confirmed diagnosis.',
    symptoms: extractSymptomHints(symptoms),
  },
  {
    id: 'condition_3',
    name: 'Stress or lifestyle related factors',
    domain: 'mental-health',
    confidence: 24,
    description: 'Stress, sleep, or routine factors may contribute. Please seek professional advice for persistent symptoms.',
    symptoms: extractSymptomHints(symptoms),
  },
];

const normalizeText = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const tokenize = (value: string): string[] => normalizeText(value).split(' ').filter((token) => token.length > 2);

const extractJsonFromResponse = (response: string): any => {
  const jsonMatch = response.match(/\[[\s\S]*\]/) || response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return null;
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return null;
  }
};

const isEmergencySignal = (symptoms: string): boolean =>
  EMERGENCY_SIGNAL_PATTERNS.some((pattern) => pattern.test(symptoms));

const extractSymptomHints = (symptoms: string): string[] => {
  const phrases = symptoms
    .split(/[,.\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);

  if (phrases.length > 0) {
    return phrases;
  }

  return tokenize(symptoms).slice(0, 3);
};

const normalizeConditionName = (name: unknown, fallback: string): string => {
  if (typeof name !== 'string') {
    return fallback;
  }

  const cleaned = name
    .replace(/[^a-zA-Z0-9\s\-()/]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 72);

  return cleaned || fallback;
};

const normalizeDescription = (description: unknown): string => {
  const base = typeof description === 'string' ? description.trim() : '';
  const safe = base || 'Possible condition based on limited symptom details.';

  if (/not a diagnosis|preliminary|consult|uncertain/i.test(safe)) {
    return safe;
  }

  return `${safe} This is a preliminary possibility, not a confirmed diagnosis.`;
};

const boundedImpact = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(-15, Math.min(15, Math.round(value)));
};

const ensureShortQuestion = (value: string): string => {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 22) {
    return value.trim();
  }

  return `${words.slice(0, 22).join(' ')}?`;
};

const isYesNoQuestion = (value: string): boolean => {
  const normalized = normalizeText(value);
  if (!normalized) return false;

  // Reject open-ended interrogatives for yes/no mode.
  if (/^(how|what|which|when|why|who)\b/.test(normalized)) {
    return false;
  }

  // Accept common auxiliary-led yes/no structure.
  return /^(do|does|did|is|are|was|were|have|has|had|can|could|would|will|should)\b/.test(normalized);
};

const normalizeDomain = (value: unknown): string => {
  if (typeof value !== 'string') {
    return 'general-internal';
  }

  const normalized = normalizeText(value).replace(/\s+/g, '-');

  if (ILLNESS_DOMAINS.includes(normalized as (typeof ILLNESS_DOMAINS)[number])) {
    return normalized;
  }

  if (normalized.includes('cardio') || normalized.includes('heart')) return 'cardiovascular';
  if (normalized.includes('respir')) return 'respiratory';
  if (normalized.includes('neuro')) return 'neurological';
  if (normalized.includes('gastro')) return 'gastrointestinal';
  if (normalized.includes('endo') || normalized.includes('metab')) return 'endocrine-metabolic';
  if (normalized.includes('infect')) return 'infectious';
  if (normalized.includes('musculo') || normalized.includes('ortho')) return 'musculoskeletal';
  if (normalized.includes('mental') || normalized.includes('psych')) return 'mental-health';
  if (normalized.includes('dermat') || normalized.includes('skin')) return 'dermatological';
  if (normalized.includes('urgent') || normalized.includes('emerg')) return 'urgent-emergency';
  return 'general-internal';
};

const inferDomainFromText = (name: string, description: string, symptoms: string[]): string => {
  const source = `${name} ${description} ${symptoms.join(' ')}`;
  for (const entry of DOMAIN_KEYWORDS) {
    if (entry.patterns.some((pattern) => pattern.test(source))) {
      return entry.domain;
    }
  }
  return 'general-internal';
};

const diversifyDomains = (diseases: AgentDisease[], symptoms: string): AgentDisease[] => {
  if (diseases.length < 2) {
    return diseases;
  }

  const distinctDomains = new Set(diseases.map((disease) => disease.domain));
  if (distinctDomains.size >= 2) {
    return diseases;
  }

  const symptomDrivenDomain = inferDomainFromText(symptoms, symptoms, []);
  const fallbackDomainOrder = [
    symptomDrivenDomain,
    'general-internal',
    'infectious',
    'mental-health',
    'neurological',
    'gastrointestinal',
    'musculoskeletal',
    'respiratory',
    'cardiovascular',
  ];

  const secondDomain = fallbackDomainOrder.find((domain) => domain !== diseases[0].domain) || 'general-internal';

  const nextDiseases = [...diseases];
  nextDiseases[1] = { ...nextDiseases[1], domain: secondDomain };
  return nextDiseases;
};

export const runDiagnosisAgent = async (symptoms: string): Promise<DiagnosisAgentResult> => {
  const emergency = isEmergencySignal(symptoms);
  const symptomHints = extractSymptomHints(symptoms);
  const symptomTokenSet = new Set(tokenize(symptoms));

  const prompt = `You are a cautious health triage assistant.
Symptoms: "${symptoms}"
Return strict JSON array only. Max 3 items.
Each item: name, domain, confidence(15-65), description, symptoms.
Domain must be exactly one of: ${ILLNESS_DOMAINS.join(', ')}.
Rules: common conditions only, conservative language, no certainty, no treatment plan.
Try to cover multiple plausible illness domains when clinically reasonable.
JSON format:
[{"name":"","domain":"general-internal","confidence":40,"description":"","symptoms":["..."]}]`;

  try {
    const raw = await getChatResponseFromGemini(prompt);
    const parsed = extractJsonFromResponse(raw);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      const fallbackDiseases = FALLBACK_DISEASES(symptoms);
      const result: DiagnosisAgentResult = {
        diseases: fallbackDiseases,
        meta: {
          provider: 'mistral',
          fallbackUsed: true,
          lowCertainty: true,
          emergencyFlag: emergency,
          tokenOptimized: true,
        },
      };
      lastDiagnosisAgentMeta = result.meta;
      return result;
    }

    const normalized = parsed.slice(0, 3).map((item: any, index: number): AgentDisease => {
      const itemSymptoms = Array.isArray(item?.symptoms)
        ? item.symptoms.filter((entry: unknown) => typeof entry === 'string').map((entry: string) => entry.trim()).filter(Boolean)
        : [];

      const description = normalizeDescription(item?.description);
      const overlapEvidence = [...tokenize(description), ...itemSymptoms.flatMap((entry: string) => tokenize(entry))];
      const overlapCount = overlapEvidence.filter((token) => symptomTokenSet.has(token)).length;

      const baseConfidence = Number.isFinite(item?.confidence) ? Number(item.confidence) : 30;
      let confidence = Math.max(15, Math.min(65, baseConfidence));

      // Damp confidence when evidence does not overlap with user symptoms.
      if (overlapCount === 0) {
        confidence = Math.min(confidence, 28);
      } else if (overlapCount === 1) {
        confidence = Math.min(confidence, 42);
      }

      return {
        id: `condition_${index + 1}`,
        name: normalizeConditionName(item?.name, `Possible condition ${index + 1}`),
        domain: normalizeDomain(item?.domain || inferDomainFromText(String(item?.name || ''), description, itemSymptoms)),
        confidence,
        description,
        symptoms: (itemSymptoms.length > 0 ? itemSymptoms : symptomHints).slice(0, 4),
      };
    }).sort((left, right) => right.confidence - left.confidence);

    const domainAware = diversifyDomains(normalized, symptoms);

    if (emergency) {
      domainAware.unshift({
        id: 'condition_0',
        name: 'Urgent medical evaluation needed',
        domain: 'urgent-emergency',
        confidence: 58,
        description: 'Some reported symptoms may indicate an emergency. Seek immediate in-person care or emergency services now.',
        symptoms: symptomHints,
      });
    }

    const topConfidence = domainAware[0]?.confidence || 0;

    const result: DiagnosisAgentResult = {
      diseases: domainAware.slice(0, 3),
      meta: {
        provider: 'mistral',
        fallbackUsed: false,
        lowCertainty: topConfidence < 55,
        emergencyFlag: emergency,
        tokenOptimized: true,
      },
    };
    lastDiagnosisAgentMeta = result.meta;
    return result;
  } catch {
    const fallbackDiseases = FALLBACK_DISEASES(symptoms);
    const result: DiagnosisAgentResult = {
      diseases: fallbackDiseases,
      meta: {
        provider: 'mistral',
        fallbackUsed: true,
        lowCertainty: true,
        emergencyFlag: emergency,
        tokenOptimized: true,
      },
    };
    lastDiagnosisAgentMeta = result.meta;
    return result;
  }
};

const fallbackFollowUpQuestion = (questionHistory: string[]): string => {
  const fallbackPool = [
    'Are your symptoms getting worse compared with when they started?',
    'Do your symptoms come and go during the day?',
    'Did a specific trigger make your symptoms start or worsen?',
    'Have you noticed fever, breathing changes, or worsening pain since this began?',
    'Do your symptoms interfere with normal daily activities?',
  ];

  const normalizedHistory = new Set(questionHistory.map((item) => normalizeText(item)));
  const candidate = fallbackPool.find((question) => !normalizedHistory.has(normalizeText(question)));
  return candidate || fallbackPool[0];
};

export const runFollowUpAgent = async (
  diseases: AgentDisease[],
  symptoms: string,
  questionHistory: string[],
  answerHistory: string[],
  previousQuestion: string
): Promise<FollowUpAgentResult> => {
  const topDiseases = [...diseases].sort((a, b) => b.confidence - a.confidence).slice(0, 3);

  if (topDiseases.length < 2) {
    return {
      question: fallbackFollowUpQuestion(questionHistory),
      diseaseImpacts: topDiseases.reduce((accumulator, disease, index) => {
        accumulator[disease.name] = index === 0 ? 8 : index === 1 ? -6 : 4;
        return accumulator;
      }, {} as Record<string, number>),
    };
  }

  const compactHistory = questionHistory.slice(-3);
  const compactAnswers = answerHistory.slice(-3);

  const prompt = `Symptoms: "${symptoms}"
Top: ${topDiseases.map((item) => `${item.name} (${Math.round(item.confidence)}%)`).join(', ')}
Previous questions: ${compactHistory.join(' | ') || 'none'}
Previous answers: ${compactAnswers.join(' | ') || 'none'}
Do not repeat this: "${previousQuestion || 'none'}"
Return strict JSON object only:
{"question":"short follow-up question under 22 words","diseaseImpacts":{"${topDiseases[0].name}":8,"${topDiseases[1].name}":-6,"${topDiseases[2].name}":4}}
Rules: ask only ONE yes/no question about symptom detail/timeline/severity/trigger; no treatment advice; do not ask open-ended questions.`;

  try {
    const raw = await getChatResponseFromGemini(prompt);
    const parsed = extractJsonFromResponse(raw);

    if (!parsed || typeof parsed !== 'object' || typeof parsed.question !== 'string') {
      throw new Error('Invalid follow-up agent response');
    }

    const impacts: Record<string, number> = {};
    topDiseases.forEach((disease, index) => {
      const value = parsed?.diseaseImpacts?.[disease.name];
      impacts[disease.name] = boundedImpact(typeof value === 'number' ? value : (index === 0 ? 8 : index === 1 ? -6 : 4));
    });

    const nextQuestion = ensureShortQuestion(parsed.question);
    const normalizedNext = normalizeText(nextQuestion);
    const normalizedPrevious = normalizeText(previousQuestion || '');
    const yesNoCompatible = isYesNoQuestion(nextQuestion);

    if (!normalizedNext || (normalizedPrevious && normalizedNext === normalizedPrevious) || !yesNoCompatible) {
      return {
        question: fallbackFollowUpQuestion(questionHistory),
        diseaseImpacts: impacts,
      };
    }

    return {
      question: nextQuestion,
      diseaseImpacts: impacts,
    };
  } catch {
    return {
      question: fallbackFollowUpQuestion(questionHistory),
      diseaseImpacts: topDiseases.reduce((accumulator, disease, index) => {
        accumulator[disease.name] = index === 0 ? 8 : index === 1 ? -6 : 4;
        return accumulator;
      }, {} as Record<string, number>),
    };
  }
};
