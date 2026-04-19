// Mock transcript data service - Simulates real session storage/retrieval
export interface TranscriptLine {
  speaker: string;
  role: 'Doctor' | 'Patient' | 'System';
  time: string;
  confidence: 'high' | 'medium' | 'low';
  text: string;
  tags: string[];
}

export interface TranscriptSession {
  id: string;
  title: string;
  when: string;
  specialty: string;
  status: 'draft' | 'completed';
  duration: string;
  patient: string;
  doctor: string;
  date: Date;
  lines: TranscriptLine[];
  summary: {
    chiefComplaint: string;
    keyObservations: string;
    diagnoses: string;
    medications: string;
    tests: string;
    followUp: string;
  };
}

const mockSessions: TranscriptSession[] = [
  {
    id: 'ts1',
    title: 'Follow-up: Type 2 Diabetes Management',
    when: 'Today',
    specialty: 'Endocrinology',
    status: 'completed',
    duration: '14:32',
    patient: 'Alex Morgan',
    doctor: 'Dr. Sarah Patel',
    date: new Date(),
    lines: [
      {
        speaker: 'Dr. Patel',
        role: 'Doctor',
        time: '00:00',
        confidence: 'high',
        text: 'Good morning Alex. How have you been feeling since our last visit three months ago?',
        tags: []
      },
      {
        speaker: 'Alex',
        role: 'Patient',
        time: '00:08',
        confidence: 'high',
        text: 'Mostly good, but I\'ve had some headaches in the afternoons and I feel tired by evening.',
        tags: ['symptom: headaches', 'symptom: fatigue']
      },
      {
        speaker: 'Dr. Patel',
        role: 'Doctor',
        time: '00:20',
        confidence: 'high',
        text: 'Are you still on metformin 500 milligrams twice daily?',
        tags: ['medication: metformin', 'dosage: 500mg BID']
      },
      {
        speaker: 'Alex',
        role: 'Patient',
        time: '00:28',
        confidence: 'medium',
        text: 'Yes, I take it with breakfast and dinner. I sometimes miss the evening dose on weekends.',
        tags: ['medication: adherence issue']
      },
      {
        speaker: 'Dr. Patel',
        role: 'Doctor',
        time: '00:42',
        confidence: 'high',
        text: 'That\'s helpful to know. Let me check your recent labs. Your HbA1c is 6.8%, which is down from 7.2% last time. That\'s excellent progress.',
        tags: ['lab: HbA1c', 'result: positive']
      },
      {
        speaker: 'Alex',
        role: 'Patient',
        time: '01:05',
        confidence: 'high',
        text: 'That\'s good to hear. Are my blood pressure and weight in better range?',
        tags: []
      },
      {
        speaker: 'Dr. Patel',
        role: 'Doctor',
        time: '01:15',
        confidence: 'high',
        text: 'Your BP is 128 over 82, which is good. Weight is holding steady at 185 pounds. We should continue the current regimen and focus on consistency with the evening doses.',
        tags: ['vital: BP 128/82', 'vital: weight 185 lbs']
      },
      {
        speaker: 'Alex',
        role: 'Patient',
        time: '01:38',
        confidence: 'high',
        text: 'I\'ll set a phone reminder for the evening dose. Should I be doing anything else for the headaches?',
        tags: ['intervention: reminder', 'symptom: headaches']
      },
      {
        speaker: 'Dr. Patel',
        role: 'Doctor',
        time: '01:55',
        confidence: 'high',
        text: 'Let me ask a few questions. Are the headaches associated with high blood sugar readings, or do they happen anytime?',
        tags: []
      },
      {
        speaker: 'Alex',
        role: 'Patient',
        time: '02:08',
        confidence: 'high',
        text: 'They seem to happen mostly in the afternoon, around 2 or 3 PM. I\'m usually at work then.',
        tags: ['symptom: timing, afternoon', 'context: work']
      }
    ],
    summary: {
      chiefComplaint: 'Afternoon headaches and fatigue; routine 3-month diabetes follow-up',
      keyObservations: 'Good medication adherence overall with occasional weekend missed doses. Headaches correlate with afternoon work schedule. Recent HbA1c improvement (7.2% → 6.8%) indicates improved glycemic control.',
      diagnoses: 'Type 2 Diabetes Mellitus (well-controlled); Tension headaches (likely work-related stress); Fatigue (possibly related to afternoon energy dip)',
      medications: 'Continue metformin 500mg BID. Consider adding evening phone reminder. No new medications at this time.',
      tests: 'HbA1c: 6.8% (improved). Continue monitoring: fasting glucose, lipid panel, renal function. Schedule repeat labs in 3 months.',
      followUp: '3-month follow-up appointment. Patient to set phone reminders for evening dose. Recommend afternoon break/hydration at work. Return if headaches increase or new symptoms develop.'
    }
  },
  {
    id: 'ts2',
    title: 'Initial Consultation: Hypertension Screening',
    when: 'Yesterday',
    specialty: 'Cardiology',
    status: 'completed',
    duration: '22:14',
    patient: 'Jordan Smith',
    doctor: 'Dr. James Kumar',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000),
    lines: [
      {
        speaker: 'Dr. Kumar',
        role: 'Doctor',
        time: '00:00',
        confidence: 'high',
        text: 'Welcome Jordan. I see from your intake form that you\'ve been experiencing occasional dizziness. Can you tell me more about that?',
        tags: []
      },
      {
        speaker: 'Jordan',
        role: 'Patient',
        time: '00:12',
        confidence: 'high',
        text: 'Yeah, it happens when I stand up quickly from my desk. It\'s been happening for about two weeks now.',
        tags: ['symptom: dizziness', 'symptom: orthostatic', 'duration: 2 weeks']
      },
      {
        speaker: 'Dr. Kumar',
        role: 'Doctor',
        time: '00:25',
        confidence: 'high',
        text: 'Does it resolve quickly, or does it persist?',
        tags: []
      },
      {
        speaker: 'Jordan',
        role: 'Patient',
        time: '00:31',
        confidence: 'high',
        text: 'It usually goes away in a few seconds. I haven\'t actually fainted, but it\'s concerning.',
        tags: ['symptom: brief dizziness', 'no: syncope']
      },
      {
        speaker: 'Dr. Kumar',
        role: 'Doctor',
        time: '00:45',
        confidence: 'high',
        text: 'Let me take your blood pressure sitting and standing. Currently, sitting BP is 158 over 95. Let me have you stand... now standing, it\'s 152 over 92.',
        tags: ['vital: sitting BP 158/95', 'vital: standing BP 152/92', 'finding: hypertension']
      },
      {
        speaker: 'Jordan',
        role: 'Patient',
        time: '01:20',
        confidence: 'high',
        text: 'Is that high? That sounds high to me.',
        tags: []
      },
      {
        speaker: 'Dr. Kumar',
        role: 'Doctor',
        time: '01:28',
        confidence: 'high',
        text: 'Your blood pressure is elevated, and I\'d like to investigate further. Have you noticed any other symptoms like chest discomfort, shortness of breath, or swelling in your legs?',
        tags: []
      },
      {
        speaker: 'Jordan',
        role: 'Patient',
        time: '01:45',
        confidence: 'high',
        text: 'No chest pain or breathing issues. My dad had a heart attack at 55, so I\'m a bit nervous.',
        tags: ['history: family history of MI', 'context: patient anxiety']
      },
      {
        speaker: 'Dr. Kumar',
        role: 'Doctor',
        time: '02:10',
        confidence: 'high',
        text: 'That\'s important context. Given your family history and current BP readings, I want to get an EKG today and schedule some blood work. Your dizziness could be related to the elevated BP. We\'ll also discuss lifestyle modifications.',
        tags: ['plan: EKG', 'plan: blood work', 'plan: lifestyle changes']
      }
    ],
    summary: {
      chiefComplaint: 'Dizziness on standing for 2 weeks; routine hypertension screening',
      keyObservations: 'Systolic BP elevated at 158/95 seated, 152/92 standing. Orthostatic dizziness resolves quickly. Strong family history of premature MI (father age 55). No chest pain, dyspnea, or edema reported. Patient appropriately concerned about cardiovascular risk.',
      diagnoses: 'Stage 1 Hypertension (requires pharmacotherapy); Orthostatic dizziness (likely secondary to hypertension); Increased cardiovascular risk (age + family Hx + HTN)',
      medications: 'Initiate lisinopril 5mg daily. Follow-up BP check in 1 week. Hydrochlorothiazide to be added if target not met in 4 weeks.',
      tests: 'EKG today (rule out structural cardiac disease). Labs: CBC, CMP, lipid panel, TSH, urinalysis. Repeat BP monitoring at home BID.',
      followUp: 'Return visit in 1 week for BP recheck and EKG results. Cardiology referral if EKG abnormal. Lifestyle: DASH diet, reduce sodium, increase exercise, stress management.'
    }
  },
  {
    id: 'ts3',
    title: 'Acute Visit: Sore Throat & Fever',
    when: '2 days ago',
    specialty: 'Internal Medicine',
    status: 'draft',
    duration: '08:45',
    patient: 'Casey Williams',
    doctor: 'Dr. Michael Chen',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    lines: [
      {
        speaker: 'Dr. Chen',
        role: 'Doctor',
        time: '00:00',
        confidence: 'high',
        text: 'Good afternoon Casey. What brings you in today?',
        tags: []
      },
      {
        speaker: 'Casey',
        role: 'Patient',
        time: '00:04',
        confidence: 'high',
        text: 'My throat has been killing me since yesterday morning, and I ran a fever last night—it was 102.',
        tags: ['symptom: sore throat', 'symptom: fever', 'fever: 102F', 'duration: 24 hours']
      },
      {
        speaker: 'Dr. Chen',
        role: 'Doctor',
        time: '00:18',
        confidence: 'high',
        text: 'Any cough, congestion, or body aches?',
        tags: []
      },
      {
        speaker: 'Casey',
        role: 'Patient',
        time: '00:24',
        confidence: 'high',
        text: 'Minimal cough, but my whole body aches and I feel tired. No nasal congestion though.',
        tags: ['symptom: myalgia', 'symptom: fatigue', 'no: congestion']
      },
      {
        speaker: 'Dr. Chen',
        role: 'Doctor',
        time: '00:38',
        confidence: 'high',
        text: 'Let me examine your throat. I see some redness and white patches on your tonsils. No significant lymph node enlargement. Based on your presentation, this is likely strep throat.',
        tags: ['finding: erythema', 'finding: exudate', 'diagnosis: likely strep']
      },
      {
        speaker: 'Casey',
        role: 'Patient',
        time: '01:05',
        confidence: 'high',
        text: 'Do I need antibiotics?',
        tags: []
      },
      {
        speaker: 'Dr. Chen',
        role: 'Doctor',
        time: '01:12',
        confidence: 'high',
        text: 'I\'m going to do a rapid strep test right now to confirm, and I\'ll prescribe amoxicillin if it\'s positive. In the meantime, rest, fluids, and acetaminophen for the fever and body aches.',
        tags: ['test: rapid strep', 'plan: amoxicillin pending result', 'plan: supportive care']
      }
    ],
    summary: {
      chiefComplaint: 'Sore throat with fever (102°F) and body aches × 24 hours',
      keyObservations: 'Fever 102°F last night. Erythematous pharynx with white patches on tonsils. Myalgias and fatigue without significant cough or congestion. No lymphadenopathy. Clinical presentation highly consistent with streptococcal pharyngitis.',
      diagnoses: 'Acute streptococcal pharyngitis (presumed, pending rapid test confirmation)',
      medications: 'Amoxicillin 500mg TID for 10 days (pending rapid strep confirmation). Acetaminophen 500mg Q6H PRN for fever/pain.',
      tests: 'Rapid strep antigen test ordered (results pending). If positive, no further testing needed. If negative, consider viral etiology.',
      followUp: 'Recheck in 3 days if symptoms don\'t improve. Patient to call with rapid strep results. Avoid close contact for first 24 hours after starting antibiotics. Return if fever persists >3 days or worsens.'
    }
  }
];

export const getSession = (sessionId: string): TranscriptSession | undefined => {
  return mockSessions.find(s => s.id === sessionId);
};

export const getAllSessions = (): TranscriptSession[] => {
  return mockSessions;
};

export const getSessionsByStatus = (status: 'draft' | 'completed'): TranscriptSession[] => {
  return mockSessions.filter(s => s.status === status);
};

export const createNewSession = (data: Partial<TranscriptSession>): TranscriptSession => {
  const id = `ts${Date.now()}`;
  return {
    id,
    title: data.title || 'New Session',
    when: 'Today',
    specialty: data.specialty || 'General',
    status: 'draft',
    duration: '00:00',
    patient: data.patient || 'Patient',
    doctor: data.doctor || 'Dr. Name',
    date: new Date(),
    lines: data.lines || [],
    summary: data.summary || {
      chiefComplaint: '',
      keyObservations: '',
      diagnoses: '',
      medications: '',
      tests: '',
      followUp: ''
    }
  };
};
