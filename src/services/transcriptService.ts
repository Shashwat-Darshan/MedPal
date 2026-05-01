import {
  getAllSessions as getMockSessions,
  getSession as getMockSession,
  type TranscriptLine,
  type TranscriptSession as MockTranscriptSession,
} from './mockTranscriptService';

export type TranscriptStatus = 'draft' | 'live' | 'completed';

export interface TranscriptSummary {
  chiefComplaint: string;
  keyObservations: string;
  diagnoses: string;
  medications: string;
  tests: string;
  followUp: string;
}

export interface TranscriptSession {
  id: string;
  title: string;
  when: string;
  specialty: string;
  status: TranscriptStatus;
  duration: string;
  patient: string;
  doctor: string;
  date: string;
  lines: TranscriptLine[];
  summary: TranscriptSummary;
  visitReason?: string;
  appointmentType?: string;
  notes?: string;
  consented?: boolean;
  startedAt?: string;
  endedAt?: string;
}

export interface SelectedTranscriptContext {
  sessionId: string;
  loadedAt: string;
}

const SESSION_STORAGE_KEY = 'medpal_transcript_sessions_v1';
const ACTIVE_SESSION_KEY = 'medpal_transcript_active_session_v1';
const SELECTED_TRANSCRIPT_KEY = 'medpal_selected_transcript_v1';

const emptySummary = (): TranscriptSummary => ({
  chiefComplaint: '',
  keyObservations: '',
  diagnoses: '',
  medications: '',
  tests: '',
  followUp: '',
});

const readJson = <T,>(key: string, fallback: T): T => {
  try {
    const rawValue = localStorage.getItem(key);

    if (!rawValue) {
      return fallback;
    }

    return JSON.parse(rawValue) as T;
  } catch {
    return fallback;
  }
};

const writeJson = (key: string, value: unknown) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const emitTranscriptStorageChange = () => {
  window.dispatchEvent(new Event('medpal-transcript-storage-change'));
};

const cloneLine = (line: TranscriptLine): TranscriptLine => ({
  ...line,
  tags: [...line.tags],
});

const normalizeSummary = (summary?: Partial<TranscriptSummary> | null): TranscriptSummary => ({
  ...emptySummary(),
  ...(summary || {}),
});

const normalizeSession = (session: MockTranscriptSession | TranscriptSession): TranscriptSession => ({
  id: session.id,
  title: session.title,
  when: session.when,
  specialty: session.specialty,
  status: session.status === 'completed' ? 'completed' : session.status === 'draft' ? 'draft' : 'live',
  duration: session.duration,
  patient: session.patient,
  doctor: session.doctor,
  date: typeof session.date === 'string' ? session.date : session.date.toISOString(),
  lines: session.lines.map(cloneLine),
  summary: normalizeSummary(session.summary),
  visitReason: session.visitReason,
  appointmentType: session.appointmentType,
  notes: session.notes,
  consented: session.consented,
  startedAt: session.startedAt,
  endedAt: session.endedAt,
});

const getSeedSessions = (): TranscriptSession[] => getMockSessions().map(normalizeSession);

const loadStoredSessions = (): TranscriptSession[] => readJson<TranscriptSession[]>(SESSION_STORAGE_KEY, []);

const saveStoredSessions = (sessions: TranscriptSession[]) => {
  writeJson(SESSION_STORAGE_KEY, sessions);
  emitTranscriptStorageChange();
};

const mergeSessions = (storedSessions: TranscriptSession[], seedSessions: TranscriptSession[]) => {
  const sessionMap = new Map<string, TranscriptSession>();

  seedSessions.forEach((session) => {
    sessionMap.set(session.id, session);
  });

  storedSessions.forEach((session) => {
    sessionMap.set(session.id, session);
  });

  return Array.from(sessionMap.values()).sort((left, right) => Date.parse(right.date) - Date.parse(left.date));
};

const loadAllSessions = () => mergeSessions(loadStoredSessions(), getSeedSessions());

const uniqueValues = (values: string[]) => Array.from(new Set(values.filter(Boolean)));

const formatDuration = (milliseconds: number) => {
  const safeMilliseconds = Math.max(0, milliseconds);
  const totalSeconds = Math.floor(safeMilliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const findFirstLine = (lines: TranscriptLine[], role: TranscriptLine['role']) =>
  lines.find((line) => line.role === role)?.text || '';

export const tagTranscriptText = (text: string) => {
  const loweredText = text.toLowerCase();
  const tags: string[] = [];

  if (/(headache|headaches|migraine)/.test(loweredText)) tags.push('symptom: headaches');
  if (/(fatigue|tired|exhausted)/.test(loweredText)) tags.push('symptom: fatigue');
  if (/(fever|temperature)/.test(loweredText)) tags.push('symptom: fever');
  if (/(cough|coughing)/.test(loweredText)) tags.push('symptom: cough');
  if (/(nausea|vomit|vomiting)/.test(loweredText)) tags.push('symptom: nausea');
  if (/(metformin|lisinopril|amoxicillin|ibuprofen|acetaminophen)/.test(loweredText)) tags.push('medication mentioned');
  if (/(dose|dosage|mg|milligram|milligrams)/.test(loweredText)) tags.push('dose discussed');
  if (/(blood pressure|bp|a1c|hba1c|lab|labs|ekg)/.test(loweredText)) tags.push('test or vital mentioned');
  if (/(follow up|follow-up|return visit|recheck)/.test(loweredText)) tags.push('follow-up planned');
  if (/(urgent|emergency|chest pain|shortness of breath|faint|syncope)/.test(loweredText)) tags.push('risk flag');

  return uniqueValues(tags);
};

const buildSummaryFromLines = (lines: TranscriptLine[]): TranscriptSummary => {
  if (lines.length === 0) {
    return emptySummary();
  }

  const patientLines = lines.filter((line) => line.role === 'Patient').map((line) => line.text);
  const doctorLines = lines.filter((line) => line.role === 'Doctor').map((line) => line.text);
  const allTags = uniqueValues(lines.flatMap((line) => line.tags));

  const symptomTags = allTags.filter((tag) => tag.startsWith('symptom:'));
  const medicationTags = allTags.filter((tag) => tag.includes('medication'));
  const testTags = allTags.filter((tag) => tag.includes('test') || tag.includes('lab') || tag.includes('vital'));
  const planTags = allTags.filter((tag) => tag.includes('follow-up') || tag.includes('risk') || tag.includes('plan'));
  const diagnosisTags = allTags.filter((tag) => tag.includes('diagnosis') || tag.includes('risk'));

  return {
    chiefComplaint: symptomTags.length > 0
      ? uniqueValues(symptomTags).slice(0, 3).join(', ')
      : patientLines[0] || 'Live consultation transcript',
    keyObservations: doctorLines.length > 0
      ? doctorLines.slice(0, 2).join(' ')
      : 'Conversation captured in real time with clinician review pending.',
    diagnoses: diagnosisTags.length > 0
      ? uniqueValues(diagnosisTags).join('; ')
      : 'Pending final clinician review.',
    medications: medicationTags.length > 0
      ? uniqueValues(medicationTags).join('; ')
      : 'Medication discussion not yet finalized.',
    tests: testTags.length > 0
      ? uniqueValues(testTags).join('; ')
      : 'No tests captured yet.',
    followUp: planTags.length > 0
      ? uniqueValues(planTags).join('; ')
      : 'Follow-up plan to be finalized before sign-off.',
  };
};

const normalizeFromStored = (session: TranscriptSession | null | undefined): TranscriptSession | null => {
  if (!session) {
    return null;
  }

  return normalizeSession(session);
};

export const getSession = (sessionId: string): TranscriptSession | undefined => {
  return loadAllSessions().find((session) => session.id === sessionId);
};

export const getAllSessions = (): TranscriptSession[] => {
  return loadAllSessions();
};

export const getSessionsByStatus = (status: TranscriptStatus): TranscriptSession[] => {
  return loadAllSessions().filter((session) => session.status === status);
};

export const createNewSession = (data: Partial<TranscriptSession> & { status?: TranscriptStatus } = {}): TranscriptSession => {
  const now = new Date().toISOString();
  const nextStatus = data.status || 'draft';
  const titleFromReason = data.visitReason ? `${data.visitReason}${data.specialty ? `: ${data.specialty}` : ''}` : 'New Session';

  return normalizeSession({
    id: data.id || `ts${Date.now()}`,
    title: data.title || titleFromReason,
    when: data.when || (nextStatus === 'live' ? 'Now' : 'Today'),
    specialty: data.specialty || 'General',
    status: nextStatus,
    duration: data.duration || '00:00',
    patient: data.patient || 'Patient',
    doctor: data.doctor || 'Dr. Name',
    date: data.date || now,
    lines: data.lines || [],
    summary: data.summary || emptySummary(),
    visitReason: data.visitReason,
    appointmentType: data.appointmentType,
    notes: data.notes,
    consented: data.consented,
    startedAt: data.startedAt || now,
    endedAt: data.endedAt,
  });
};

export const saveSession = (session: TranscriptSession) => {
  const storedSessions = loadStoredSessions();
  const nextSessions = [...storedSessions.filter((existing) => existing.id !== session.id), normalizeSession(session)];
  saveStoredSessions(nextSessions);
  return session;
};

export const updateSession = (
  sessionId: string,
  updater: (session: TranscriptSession) => TranscriptSession | null | void,
): TranscriptSession | null => {
  const currentSession = getSession(sessionId);

  if (!currentSession) {
    return null;
  }

  const nextSession = updater(normalizeFromStored(currentSession) || currentSession);

  if (!nextSession) {
    return null;
  }

  return saveSession(normalizeSession(nextSession));
};

export const appendTranscriptLine = (sessionId: string, line: TranscriptLine) => {
  return updateSession(sessionId, (session) => ({
    ...session,
    status: session.status === 'completed' ? 'completed' : 'live',
    lines: [...session.lines, cloneLine(line)],
  }));
};

export const setActiveTranscriptSession = (sessionId: string) => {
  localStorage.setItem(ACTIVE_SESSION_KEY, sessionId);
  emitTranscriptStorageChange();
  return getSession(sessionId) || null;
};

export const getActiveTranscriptSession = () => {
  const activeSessionId = localStorage.getItem(ACTIVE_SESSION_KEY);

  if (!activeSessionId) {
    return null;
  }

  return getSession(activeSessionId) || null;
};

export const clearActiveTranscriptSession = () => {
  localStorage.removeItem(ACTIVE_SESSION_KEY);
  emitTranscriptStorageChange();
};

export const selectTranscriptSession = (sessionId: string) => {
  const selection: SelectedTranscriptContext = {
    sessionId,
    loadedAt: new Date().toISOString(),
  };

  writeJson(SELECTED_TRANSCRIPT_KEY, selection);
  emitTranscriptStorageChange();
  return selection;
};

export const getSelectedTranscriptSession = () => readJson<SelectedTranscriptContext | null>(SELECTED_TRANSCRIPT_KEY, null);

export const clearSelectedTranscriptSession = () => {
  localStorage.removeItem(SELECTED_TRANSCRIPT_KEY);
  emitTranscriptStorageChange();
};

export const finalizeTranscriptSession = (sessionId: string) => {
  const updatedSession = updateSession(sessionId, (session) => {
    const summary = buildSummaryFromLines(session.lines);
    const startedAt = session.startedAt ? Date.parse(session.startedAt) : Date.now();
    const endedAt = new Date().toISOString();

    return {
      ...session,
      status: 'completed',
      when: session.when || 'Today',
      duration: formatDuration(Date.now() - startedAt),
      summary,
      endedAt,
    };
  });

  if (updatedSession) {
    clearActiveTranscriptSession();
  }

  return updatedSession;
};

export const getLatestCompletedTranscriptSession = () => {
  return getAllSessions().find((session) => session.status === 'completed') || null;
};

export const createTranscriptSessionFromMock = (sessionId: string) => {
  const session = getMockSession(sessionId);

  return session ? normalizeSession(session) : null;
};

export const getTranscriptSummaryFromLines = buildSummaryFromLines;
export const formatTranscriptDuration = formatDuration;

export const getTranscriptContext = (lines: TranscriptLine[]) => {
  const tags = uniqueValues(lines.flatMap((line) => line.tags));
  const symptomTags = tags.filter((tag) => tag.startsWith('symptom:'));
  const medicationTags = tags.filter((tag) => tag.includes('medication'));
  const riskFlags = tags.filter((tag) => tag.includes('risk'));
  const nextSteps = tags.filter((tag) => tag.includes('follow-up') || tag.includes('test') || tag.includes('plan'));

  return {
    keyPoints: symptomTags.slice(0, 3).join(', ') || findFirstLine(lines, 'Patient') || 'Waiting for transcript content.',
    medicationMentions: medicationTags.join(', ') || 'No medications mentioned yet.',
    actionChecklist: nextSteps.join(', ') || 'No action items captured yet.',
    riskFlag: riskFlags[0] || 'No immediate risk flag detected.',
  };
};
