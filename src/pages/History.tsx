
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, FileText, Stethoscope, TrendingUp, Brain, Sparkles, Filter, Search, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserHistory } from '@/hooks/useUserHistory';
import Navbar from '@/components/Navbar';
import type { DiagnosisReport, HistoryItem } from '@/lib/reportStorage';

const History = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { history, loadHistory, getDiagnosisReportById, setSelectedReport, addDiagnosisReport, linkHistoryItemToReport } = useUserHistory();

  useEffect(() => {
    const handleStorageChange = () => {
      loadHistory();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('medpal-report-storage-change', handleStorageChange);
    handleStorageChange();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('medpal-report-storage-change', handleStorageChange);
    };
  }, [loadHistory]);

  const getConfidenceBadgeColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (confidence >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return {
        date: date.toLocaleDateString(),
        time: date.toLocaleTimeString()
      };
    } catch (error) {
      return {
        date: 'Invalid Date',
        time: 'Invalid Time'
      };
    }
  };

  const handleAddToChat = (item: HistoryItem) => {
    const existingReport = item.reportId ? getDiagnosisReportById(item.reportId) : null;

    if (!existingReport) {
      const fallbackReport: DiagnosisReport = {
        reportId: item.reportId || `legacy_report_${item.id}`,
        historyId: item.id,
        patientEmail: user?.email?.toLowerCase() || 'unknown',
        createdAt: item.date,
        completedAt: item.date,
        symptoms: item.symptoms,
        topDiagnosis: item.diagnosis,
        confidence: item.confidence,
        status: item.status,
        finalResults: [
          {
            id: item.id,
            name: item.diagnosis,
            confidence: item.confidence,
            description: 'Historical diagnosis summary',
            symptoms: [],
          },
        ],
        questionAnswerPairs: [],
      };

      const storedReport = addDiagnosisReport(fallbackReport);
      linkHistoryItemToReport(item.id, storedReport.reportId);
      setSelectedReport(storedReport.reportId);
      navigate('/chat');
      return;
    }

    setSelectedReport(existingReport.reportId);
    navigate('/chat');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Consultation History
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Your complete medical consultation records and analytics</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <Stethoscope className="h-4 w-4 text-blue-500" />
              <span>{history.length} Total Consultations</span>
            </div>
            <div className="flex items-center space-x-2">
              <Brain className="h-4 w-4 text-purple-500" />
              <span>AI-Powered Analysis</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span>Health Trends</span>
            </div>
          </div>
        </div>

        {history.length === 0 ? (
          <Card className="glass-light dark:glass-card dark:border-gray-700 text-center py-16">
            <CardContent className="space-y-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                <FileText className="h-10 w-10 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">No consultation history</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Start your first AI diagnosis to see your comprehensive health history and analytics here.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => navigate('/diagnosis')} className="medical-gradient text-white hover:opacity-90">
                  <Stethoscope className="h-4 w-4 mr-2" />
                  Start New Consultation
                </Button>
                <Button variant="outline" onClick={() => navigate('/dashboard')} className="dark:border-gray-600 dark:text-gray-300">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* History Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="stat-card floating-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total Consultations</p>
                      <p className="text-2xl font-bold text-white">{history.length}</p>
                      <p className="text-blue-200 text-xs">All time</p>
                    </div>
                    <FileText className="h-6 w-6 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white floating-card glass-stats">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Avg Confidence</p>
                      <p className="text-2xl font-bold">
                        {history.length > 0 ? Math.round(history.reduce((acc, item) => acc + item.confidence, 0) / history.length) : 0}%
                      </p>
                      <p className="text-green-200 text-xs">High accuracy</p>
                    </div>
                    <Brain className="h-6 w-6 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white floating-card glass-stats">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">This Month</p>
                      <p className="text-2xl font-bold">
                        {history.filter(item => {
                          const itemDate = new Date(item.date);
                          const now = new Date();
                          return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
                        }).length}
                      </p>
                      <p className="text-purple-200 text-xs">Recent activity</p>
                    </div>
                    <Calendar className="h-6 w-6 text-purple-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Controls */}
            <Card className="glass-light dark:glass-card dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center space-x-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Your Consultations</h2>
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {history.length} Records
                    </Badge>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                    <Button onClick={() => navigate('/diagnosis')} className="medical-gradient text-white hover:opacity-90">
                      <Stethoscope className="h-4 w-4 mr-2" />
                      New Consultation
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* History List */}
            <div className="space-y-4">
              {history.map((item) => {
                const { date, time } = formatDate(item.date);
                const report = getDiagnosisReportById(item.reportId);
                return (
                  <Card key={item.id} className="glass-light dark:glass-card dark:border-gray-700 hover:shadow-lg transition-all duration-300 floating-card">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <Stethoscope className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg text-gray-900 dark:text-gray-100">{item.diagnosis}</CardTitle>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-2">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{date}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{time}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <Badge className={getConfidenceBadgeColor(item.confidence)}>
                          {item.confidence}% confidence
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Symptoms Reported:</h4>
                          <p className="text-gray-700 dark:text-gray-300 text-sm break-words">{item.symptoms}</p>
                        </div>
                        
                        <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center space-x-2">
                            <Badge variant={item.status === 'completed' ? 'default' : 'outline'} className="dark:bg-gray-700 dark:text-gray-300">
                              {item.status}
                            </Badge>
                            <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                              <Sparkles className="h-3 w-3" />
                              <span>AI Analysis</span>
                            </div>
                            {report && (
                              <Badge variant="outline" className="border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300">
                                Report ready
                              </Badge>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                              <FileText className="h-4 w-4 mr-1" />
                              Export
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="dark:border-gray-600 dark:text-gray-300"
                              onClick={() => handleAddToChat(item)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add to Chat
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default History;
