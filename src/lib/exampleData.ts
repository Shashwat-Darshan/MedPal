import {
  saveDiagnosisReport,
  saveHistoryItems,
  type DiagnosisReport,
  type HistoryItem,
} from '@/lib/reportStorage';

const SEED_KEY_PREFIX = 'medpal_seed_examples_v1:';

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const seededKeyForEmail = (email: string) => `${SEED_KEY_PREFIX}${normalizeEmail(email)}`;

const daysAgoIso = (daysAgo: number) => {
  const now = new Date();
  now.setDate(now.getDate() - daysAgo);
  return now.toISOString();
};

const buildDemoReport = (input: {
  reportId: string;
  historyId: string;
  patientEmail: string;
  createdAt: string;
  completedAt: string;
  symptoms: string;
  topDiagnosis: string;
  confidence: number;
  finalResults: DiagnosisReport['finalResults'];
  questionAnswerPairs?: DiagnosisReport['questionAnswerPairs'];
  agentMeta?: DiagnosisReport['agentMeta'];
}): DiagnosisReport => ({
  reportId: input.reportId,
  historyId: input.historyId,
  patientEmail: normalizeEmail(input.patientEmail),
  createdAt: input.createdAt,
  completedAt: input.completedAt,
  symptoms: input.symptoms,
  topDiagnosis: input.topDiagnosis,
  confidence: Math.max(0, Math.min(100, Math.round(input.confidence))),
  status: 'completed',
  finalResults: input.finalResults,
  questionAnswerPairs: input.questionAnswerPairs || [],
  agentMeta: input.agentMeta,
});

export const seedExampleDataForUser = (email: string, existingHistoryCount: number) => {
  if (!email) return false;
  if (existingHistoryCount > 0) return false;

  const normalizedEmail = normalizeEmail(email);
  const seedKey = seededKeyForEmail(normalizedEmail);

  if (localStorage.getItem(seedKey) === 'true') {
    return false;
  }

  const demoHistory: HistoryItem[] = [
    {
      id: 'history_demo_1',
      reportId: 'report_demo_1',
      date: daysAgoIso(0),
      symptoms: 'Persistent headache (afternoons), fatigue, screen strain; no fever.',
      diagnosis: 'Tension-type headache',
      confidence: 78,
      status: 'completed',
    },
    {
      id: 'history_demo_2',
      reportId: 'report_demo_2',
      date: daysAgoIso(2),
      symptoms: 'Dizziness when standing quickly; elevated home BP readings; family history of heart disease.',
      diagnosis: 'Hypertension (needs clinician confirmation)',
      confidence: 69,
      status: 'completed',
    },
    {
      id: 'history_demo_3',
      reportId: 'report_demo_3',
      date: daysAgoIso(6),
      symptoms: 'Sore throat, fever 102°F, body aches; minimal cough; no congestion.',
      diagnosis: 'Possible strep pharyngitis',
      confidence: 74,
      status: 'completed',
    },
  ];

  const demoReports: DiagnosisReport[] = [
    buildDemoReport({
      reportId: 'report_demo_1',
      historyId: 'history_demo_1',
      patientEmail: normalizedEmail,
      createdAt: demoHistory[0].date,
      completedAt: demoHistory[0].date,
      symptoms: demoHistory[0].symptoms,
      topDiagnosis: demoHistory[0].diagnosis,
      confidence: demoHistory[0].confidence,
      finalResults: [
        {
          id: 'tension_headache',
          name: 'Tension-type headache',
          confidence: 78,
          description: 'Often linked to stress, posture, dehydration, or eye strain; typically bilateral pressure-like pain.',
          symptoms: ['headache', 'fatigue', 'neck/shoulder tightness', 'screen strain'],
        },
        {
          id: 'migraine',
          name: 'Migraine',
          confidence: 41,
          description: 'Recurrent headaches often with nausea, light sensitivity, or aura; can be triggered by sleep changes or stress.',
          symptoms: ['headache', 'photophobia', 'nausea'],
        },
        {
          id: 'sinusitis',
          name: 'Sinusitis',
          confidence: 22,
          description: 'Sinus infection/inflammation can cause facial pressure and congestion; usually with nasal symptoms.',
          symptoms: ['facial pressure', 'nasal congestion'],
        },
      ],
      questionAnswerPairs: [
        { question: 'Any nausea or light sensitivity with the headache?', answer: 'No, mostly pressure and tightness.' },
        { question: 'Does hydration or taking breaks help?', answer: 'Sometimes. It’s worse after long screen time.' },
      ],
      agentMeta: { provider: 'example', tokenOptimized: true },
    }),
    buildDemoReport({
      reportId: 'report_demo_2',
      historyId: 'history_demo_2',
      patientEmail: normalizedEmail,
      createdAt: demoHistory[1].date,
      completedAt: demoHistory[1].date,
      symptoms: demoHistory[1].symptoms,
      topDiagnosis: demoHistory[1].diagnosis,
      confidence: demoHistory[1].confidence,
      finalResults: [
        {
          id: 'hypertension',
          name: 'Hypertension (elevated blood pressure)',
          confidence: 69,
          description: 'High blood pressure over time can increase cardiovascular risk and may be associated with headaches or dizziness.',
          symptoms: ['elevated BP readings', 'dizziness'],
        },
        {
          id: 'orthostatic',
          name: 'Orthostatic intolerance',
          confidence: 38,
          description: 'Lightheadedness on standing can relate to hydration status, medications, or autonomic factors.',
          symptoms: ['dizziness on standing'],
        },
        {
          id: 'anemia',
          name: 'Anemia',
          confidence: 21,
          description: 'Low hemoglobin can cause fatigue or dizziness; confirmation requires labs.',
          symptoms: ['fatigue', 'dizziness'],
        },
      ],
      questionAnswerPairs: [
        { question: 'Do you ever faint or have chest pain?', answer: 'No fainting and no chest pain.' },
        { question: 'Any recent medication changes?', answer: 'No.' },
      ],
      agentMeta: { provider: 'example', lowCertainty: true },
    }),
    buildDemoReport({
      reportId: 'report_demo_3',
      historyId: 'history_demo_3',
      patientEmail: normalizedEmail,
      createdAt: demoHistory[2].date,
      completedAt: demoHistory[2].date,
      symptoms: demoHistory[2].symptoms,
      topDiagnosis: demoHistory[2].diagnosis,
      confidence: demoHistory[2].confidence,
      finalResults: [
        {
          id: 'strep',
          name: 'Strep pharyngitis (possible)',
          confidence: 74,
          description: 'Bacterial sore throat can cause fever and body aches; confirmation typically involves a rapid test or culture.',
          symptoms: ['sore throat', 'fever', 'body aches'],
        },
        {
          id: 'viral_uri',
          name: 'Viral upper respiratory infection',
          confidence: 44,
          description: 'Viruses commonly cause sore throat and systemic symptoms; symptoms often improve with rest and fluids.',
          symptoms: ['sore throat', 'fatigue', 'cough'],
        },
        {
          id: 'mono',
          name: 'Infectious mononucleosis',
          confidence: 18,
          description: 'Can cause sore throat and fatigue; often with swollen lymph nodes; testing may be needed.',
          symptoms: ['sore throat', 'fatigue'],
        },
      ],
      questionAnswerPairs: [
        { question: 'Any cough or congestion?', answer: 'Minimal cough; no congestion.' },
        { question: 'How high was the fever?', answer: 'About 102°F last night.' },
      ],
      agentMeta: { provider: 'example' },
    }),
  ];

  // Persist demo history + reports.
  saveHistoryItems(normalizedEmail, demoHistory);
  demoReports.forEach((report) => saveDiagnosisReport(report));

  localStorage.setItem(seedKey, 'true');
  return true;
};
