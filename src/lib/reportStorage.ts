import type { Disease } from '@/hooks/useDiagnosticFlow';

export interface HistoryItem {
  id: string;
  reportId: string;
  date: string;
  symptoms: string;
  diagnosis: string;
  confidence: number;
  status: 'completed' | 'pending';
}

export interface ReportQuestionAnswer {
  question: string;
  answer: string;
  timestamp?: string;
}

export interface DiagnosisReport {
  reportId: string;
  historyId: string;
  patientEmail: string;
  createdAt: string;
  completedAt: string;
  symptoms: string;
  topDiagnosis: string;
  confidence: number;
  status: 'completed' | 'pending';
  finalResults: Disease[];
  questionAnswerPairs: ReportQuestionAnswer[];
}

export interface SelectedReportContext {
  reportId: string;
  loadedAt: string;
}

const HISTORY_PREFIX = 'medpal_history_';
const REPORTS_KEY = 'medpal_reports_v1';
const SELECTED_REPORT_KEY = 'medpal_selected_report_v1';

const normalizeEmail = (email: string) => email.trim().toLowerCase();

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

const emitReportStorageChange = () => {
  window.dispatchEvent(new Event('medpal-report-storage-change'));
};

export const getHistoryStorageKey = (email?: string | null) => {
  if (!email) {
    return `${HISTORY_PREFIX}anonymous`;
  }

  return `${HISTORY_PREFIX}${normalizeEmail(email)}`;
};

export const loadHistoryItems = (email?: string | null): HistoryItem[] => {
  if (!email) {
    return [];
  }

  return readJson<HistoryItem[]>(getHistoryStorageKey(email), []);
};

export const saveHistoryItems = (email: string, items: HistoryItem[]) => {
  writeJson(getHistoryStorageKey(email), items);
  emitReportStorageChange();
};

export const createHistoryItem = (input: Omit<HistoryItem, 'id' | 'date' | 'reportId'> & { reportId: string }): HistoryItem => ({
  ...input,
  id: `history_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  date: new Date().toISOString(),
});

export const loadReports = (): DiagnosisReport[] => readJson<DiagnosisReport[]>(REPORTS_KEY, []);

export const saveReports = (reports: DiagnosisReport[]) => {
  writeJson(REPORTS_KEY, reports);
  emitReportStorageChange();
};

export const saveDiagnosisReport = (report: DiagnosisReport) => {
  const reports = loadReports();
  const nextReports = [report, ...reports.filter((existing) => existing.reportId !== report.reportId)];
  saveReports(nextReports);
  return report;
};

export const getDiagnosisReport = (reportId: string) => {
  const reports = loadReports();
  return reports.find((report) => report.reportId === reportId) || null;
};

export const getLatestDiagnosisReport = (email?: string | null) => {
  if (!email) {
    return null;
  }

  const normalizedEmail = normalizeEmail(email);
  const reports = loadReports();
  return reports.find((report) => report.patientEmail === normalizedEmail) || null;
};

export const selectDiagnosisReport = (reportId: string) => {
  const selection: SelectedReportContext = {
    reportId,
    loadedAt: new Date().toISOString(),
  };

  writeJson(SELECTED_REPORT_KEY, selection);
  emitReportStorageChange();
  return selection;
};

export const clearSelectedDiagnosisReport = () => {
  localStorage.removeItem(SELECTED_REPORT_KEY);
  emitReportStorageChange();
};

export const getSelectedDiagnosisReport = () => readJson<SelectedReportContext | null>(SELECTED_REPORT_KEY, null);
