
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import {
  createHistoryItem,
  getDiagnosisReport,
  getHistoryStorageKey,
  getLatestDiagnosisReport,
  getSelectedDiagnosisReport,
  loadHistoryItems,
  saveDiagnosisReport,
  saveHistoryItems,
  selectDiagnosisReport,
  type DiagnosisReport,
  type HistoryItem,
} from '@/lib/reportStorage';

export const useUserHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const loadHistory = useCallback(() => {
    if (!user?.email) {
      setHistory([]);
      return [];
    }

    const loadedHistory = loadHistoryItems(user.email);
    setHistory(loadedHistory);
    return loadedHistory;
  }, [user?.email]);

  const addHistoryItem = useCallback((item: Omit<HistoryItem, 'id' | 'date' | 'reportId'> & { reportId?: string }) => {
    if (!user?.email) {
      return null;
    }

    const nextItem = createHistoryItem({
      ...item,
      reportId: item.reportId || `report_${Date.now()}`,
    });

    const updatedHistory = [nextItem, ...history];
    setHistory(updatedHistory);
    saveHistoryItems(user.email, updatedHistory);
    return nextItem;
  }, [history, user?.email]);

  const clearHistory = useCallback(() => {
    if (!user?.email) return;

    setHistory([]);
    localStorage.removeItem(getHistoryStorageKey(user.email));
  }, [user?.email]);

  const addDiagnosisReport = useCallback((report: DiagnosisReport) => {
    return saveDiagnosisReport(report);
  }, []);

  const linkHistoryItemToReport = useCallback((historyId: string, reportId: string) => {
    if (!user?.email) {
      return null;
    }

    let updatedItem: HistoryItem | null = null;

    const updatedHistory = history.map((item) => {
      if (item.id !== historyId) {
        return item;
      }

      const nextItem = {
        ...item,
        reportId,
      };

      updatedItem = nextItem;
      return nextItem;
    });

    setHistory(updatedHistory);
    saveHistoryItems(user.email, updatedHistory);
    return updatedItem;
  }, [history, user?.email]);

  const getDiagnosisReportById = useCallback((reportId: string) => getDiagnosisReport(reportId), []);

  const getLatestReportForUser = useCallback(() => getLatestDiagnosisReport(user?.email), [user?.email]);

  const setSelectedReport = useCallback((reportId: string) => selectDiagnosisReport(reportId), []);

  const getSelectedReport = useCallback(() => getSelectedDiagnosisReport(), []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return {
    history,
    addHistoryItem,
    clearHistory,
    loadHistory,
    addDiagnosisReport,
    linkHistoryItemToReport,
    getDiagnosisReportById,
    getLatestReportForUser,
    setSelectedReport,
    getSelectedReport,
  };
};
