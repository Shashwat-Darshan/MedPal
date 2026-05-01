import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Send, Bot, User, History, Clock, Brain, X } from 'lucide-react';
import { getChatResponseFromGemini } from '@/services/geminiService';
import {
  clearSelectedDiagnosisReport,
  getDiagnosisReport,
  getLatestDiagnosisReport,
  getSelectedDiagnosisReport,
  selectDiagnosisReport,
  type DiagnosisReport,
} from '@/lib/reportStorage';
import {
  clearSelectedTranscriptSession,
  getLatestCompletedTranscriptSession,
  getSelectedTranscriptSession,
  getSession as getTranscriptSession,
  selectTranscriptSession,
  type TranscriptSession,
} from '@/services/transcriptService';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface SimpleChatInterfaceProps {
  onHistoryContext?: (messages: Message[]) => void;
}

type ChatMode = 'general' | 'doctor' | 'patient';

const SimpleChatInterface: React.FC<SimpleChatInterfaceProps> = ({ onHistoryContext }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm your AI health assistant. I can help answer your health-related questions and provide general medical information. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>('general');
  const [diagnosisContext, setDiagnosisContext] = useState<string>('');
  const [activeReport, setActiveReport] = useState<DiagnosisReport | null>(null);
  const [activeTranscript, setActiveTranscript] = useState<TranscriptSession | null>(null);
  const [transcriptContext, setTranscriptContext] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load chat history from localStorage
    const savedMessages = localStorage.getItem('healthChatHistory');
    if (savedMessages) {
      try {
        const parsedMessages: unknown = JSON.parse(savedMessages);

        if (!Array.isArray(parsedMessages)) {
          return;
        }

        // Convert timestamp strings back to Date objects (and validate shape)
        const messagesWithDates: Message[] = parsedMessages
          .filter((msg): msg is { id: unknown; type: unknown; content: unknown; timestamp: unknown } => {
            return typeof msg === 'object' && msg !== null;
          })
          .map((msg) => {
            const safe = msg as { id?: unknown; type?: unknown; content?: unknown; timestamp?: unknown };
            const id = typeof safe.id === 'string' ? safe.id : `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
            const type = safe.type === 'user' || safe.type === 'assistant' ? safe.type : 'user';
            const content = typeof safe.content === 'string' ? safe.content : '';
            const timestampValue = safe.timestamp;
            const timestamp = typeof timestampValue === 'string' ? new Date(timestampValue) : timestampValue instanceof Date ? timestampValue : new Date();
            return { id, type, content, timestamp };
          })
          .filter((msg) => msg.content.trim().length > 0);
        
        // Only load if we have more than just the initial message
        if (messagesWithDates.length > 0) {
          setMessages(prevMessages => [prevMessages[0], ...messagesWithDates]);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    }
  }, []);

  useEffect(() => {
    const buildTranscriptContext = (session: TranscriptSession) => {
      const lines = session.lines.slice(-12).map((line) => `${line.speaker}: ${line.text}`).join('\n');
      const contextParts = [
        `Transcript session: ${session.title} (${session.when})`,
        `Participants: ${session.doctor} and ${session.patient}`,
        lines ? `Recent transcript lines:\n${lines}` : '',
      ].filter(Boolean);

      setTranscriptContext(contextParts.join('\n'));
      setActiveTranscript(session);
    };

    const buildContext = (report: DiagnosisReport) => {
      const topResults = [...report.finalResults]
        .sort((left, right) => right.confidence - left.confidence)
        .slice(0, 3)
        .map((entry) => `${entry.name} (${Math.round(entry.confidence)}%)`)
        .join(', ');

      const recentQna = report.questionAnswerPairs.slice(-3).map((pair) => `${pair.question}: ${pair.answer}`).join('\n');

      const contextParts = [
        `Recent symptoms: ${report.symptoms}`,
        `Most likely diagnosis: ${report.topDiagnosis} (${Math.round(report.confidence)}% confidence)`,
        topResults ? `Differential summary: ${topResults}` : '',
        recentQna ? `Recent Q&A:\n${recentQna}` : '',
      ].filter(Boolean);

      setDiagnosisContext(contextParts.join('\n'));
      setActiveReport(report);
    };

    // Prefer an explicitly selected transcript OR report. Do not mix contexts.
    try {
      const selectedTranscript = getSelectedTranscriptSession();
      if (selectedTranscript?.sessionId) {
        const storedTranscript = getTranscriptSession(selectedTranscript.sessionId);
        if (storedTranscript) {
          clearSelectedDiagnosisReport();
          setDiagnosisContext('');
          setActiveReport(null);
          buildTranscriptContext(storedTranscript);
          return;
        }
      }

      const selectedReport = getSelectedDiagnosisReport();
      if (selectedReport?.reportId) {
        const storedReport = getDiagnosisReport(selectedReport.reportId);
        if (storedReport) {
          clearSelectedTranscriptSession();
          setTranscriptContext('');
          setActiveTranscript(null);
          buildContext(storedReport);
          return;
        }
      }

      const latestReport = getLatestDiagnosisReport(user?.email);
      if (latestReport) {
        setTranscriptContext('');
        setActiveTranscript(null);
        buildContext(latestReport);
        return;
      }

      const rawSession = localStorage.getItem('diagnosisSession');
      if (!rawSession) {
        return;
      }

      const session = JSON.parse(rawSession);
      const finalResults = Array.isArray(session.finalResults) ? session.finalResults : [];
      const topResult = finalResults[0];

      if (!session.symptoms && !topResult) {
        return;
      }

      const summaryParts = [
        session.symptoms ? `Recent symptoms: ${session.symptoms}` : '',
        topResult ? `Most likely diagnosis: ${topResult.name} (${Math.round(topResult.confidence || 0)}% confidence)` : ''
      ].filter(Boolean);

      if (summaryParts.length > 0) {
        setTranscriptContext('');
        setActiveTranscript(null);
        setDiagnosisContext(summaryParts.join('\n'));
      }
    } catch (error) {
      console.error('Error loading diagnosis context for chat:', error);
    }
  }, [user?.email]);

  const clearReportContext = () => {
    clearSelectedDiagnosisReport();
    setActiveReport(null);
    setDiagnosisContext('');
    toast({
      title: 'Report cleared',
      description: 'Chat will use general context until another report is selected.',
    });
  };

  const clearTranscriptContext = () => {
    clearSelectedTranscriptSession();
    setActiveTranscript(null);
    setTranscriptContext('');
    toast({
      title: 'Transcript cleared',
      description: 'Chat will use general context until another transcript is selected.',
    });
  };

  const attachLatestTranscript = () => {
    try {
      const transcriptSession = getLatestCompletedTranscriptSession();
      if (!transcriptSession) {
        toast({ title: 'No transcript', description: 'No completed transcript session found.' });
        return;
      }

      // Behave like History's "Add to Chat": select it as context (do not paste into input).
      clearSelectedDiagnosisReport();
      setDiagnosisContext('');
      setActiveReport(null);
      selectTranscriptSession(transcriptSession.id);
      setActiveTranscript(transcriptSession);
      setTranscriptContext(
        [
          `Transcript session: ${transcriptSession.title} (${transcriptSession.when})`,
          `Participants: ${transcriptSession.doctor} and ${transcriptSession.patient}`,
          transcriptSession.lines.slice(-12).map((line) => `${line.speaker}: ${line.text}`).join('\n'),
        ].filter(Boolean).join('\n'),
      );
      toast({ title: 'Transcript attached', description: 'Transcript is now used as chat context.' });
      inputRef.current?.focus();
    } catch (err) {
      console.error('attachLatestTranscript', err);
      toast({ title: 'Error', description: 'Failed to attach transcript.', variant: 'destructive' });
    }
  };

  const attachLatestReport = () => {
    try {
      const report = activeReport || getLatestDiagnosisReport(user?.email);
      if (!report) {
        toast({ title: 'No diagnosis', description: 'No diagnosis report available to attach.' });
        return;
      }

      // Behave like History's "Add to Chat": select it as context (do not paste into input).
      clearSelectedTranscriptSession();
      setTranscriptContext('');
      setActiveTranscript(null);
      selectDiagnosisReport(report.reportId);
      setDiagnosisContext(
        [
          report.symptoms ? `Recent symptoms: ${report.symptoms}` : '',
          `Most likely diagnosis: ${report.topDiagnosis} (${Math.round(report.confidence || 0)}% confidence)`,
        ].filter(Boolean).join('\n'),
      );
      setActiveReport(report);
      toast({ title: 'Diagnosis attached', description: 'Diagnosis report is now used as chat context.' });
      inputRef.current?.focus();
    } catch (err) {
      console.error('attachLatestReport', err);
      toast({ title: 'Error', description: 'Failed to attach diagnosis report.', variant: 'destructive' });
    }
  };

  const download = (filename: string, blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const exportActiveReport = () => {
    const report = activeReport || getLatestDiagnosisReport(user?.email);
    if (!report) {
      toast({ title: 'No report', description: 'No diagnosis report available to export.' });
      return;
    }

    const payload = {
      meta: { reportId: report.reportId, patient: report.patientEmail, createdAt: report.createdAt },
      report,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    download(`${(report.reportId || 'diagnosis')}.json`, blob);
    toast({ title: 'Export started', description: 'Diagnosis report download started.' });
  };

  const saveToHistory = (newMessages: Message[]) => {
    try {
      const recentMessages = newMessages.slice(-20); // Keep last 20 messages
      localStorage.setItem('healthChatHistory', JSON.stringify(recentMessages.slice(1))); // Exclude initial message
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const modeInstruction =
        chatMode === 'doctor'
          ? 'Respond in a doctor-style tone: structured, clinical, and concise. Include when to seek urgent care.'
          : chatMode === 'patient'
            ? 'Respond in a patient-friendly tone: simple, reassuring language with practical next steps.'
            : 'Respond in a balanced health-assistant tone: clear and concise.';

      const contextInstruction = transcriptContext
        ? `\nTranscript context (selected session):\n${transcriptContext}\n`
        : diagnosisContext
          ? `\nDiagnosis context (${activeReport ? `report ${activeReport.reportId}` : 'session summary'}):\n${diagnosisContext}\n`
          : '';

      // Create context from recent messages for better responses
      const recentMessages = newMessages.slice(-6); // Last 6 messages for context
      const conversationContext = recentMessages
        .map(msg => `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');

      const contextPrompt = `${modeInstruction}
    ${contextInstruction}
Conversation:
${conversationContext}

Answer the latest user message with safe health guidance and remind them this is not a medical diagnosis.`;

      const response = await getChatResponseFromGemini(contextPrompt);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date()
      };

      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);
      saveToHistory(finalMessages);
      
      if (onHistoryContext) {
        onHistoryContext(finalMessages);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearHistory = () => {
    setMessages([messages[0]]); // Keep only initial message
    localStorage.removeItem('healthChatHistory');
    setShowHistory(false);
    toast({
      title: "History Cleared",
      description: "Chat history has been cleared successfully.",
    });
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Health Assistant</h1>
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Online</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <select
                value={chatMode}
                onChange={(e) => setChatMode(e.target.value as ChatMode)}
                className="h-9 rounded-md border border-gray-300 bg-white px-2 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
              >
                <option value="general">General Chat</option>
                <option value="doctor">Doctor Mode</option>
                <option value="patient">Patient Mode</option>
              </select>
              <Button
                onClick={() => setShowHistory(!showHistory)}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <History className="h-4 w-4" />
                <span>History</span>
              </Button>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => attachLatestTranscript()} className="flex items-center space-x-2">
                  <span>Add transcript</span>
                </Button>
                <Button variant="outline" size="sm" onClick={() => attachLatestReport()} className="flex items-center space-x-2">
                  <span>Add diagnosis</span>
                </Button>
                <Button variant="outline" size="sm" onClick={() => exportActiveReport()} className="flex items-center space-x-2">
                  <span>Export report</span>
                </Button>
              </div>
              {showHistory && (
                <Button
                  onClick={clearHistory}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          {(transcriptContext || diagnosisContext) && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {transcriptContext && (
                <>
                  <Badge variant="outline" className="text-xs">Selected transcript loaded</Badge>
                  {activeTranscript && (
                    <Badge variant="secondary" className="text-xs">{activeTranscript.title}</Badge>
                  )}
                  <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={clearTranscriptContext}>
                    <X className="h-3 w-3 mr-1" />
                    Clear transcript
                  </Button>
                </>
              )}

              {!transcriptContext && diagnosisContext && (
                <>
                  <Badge variant="outline" className="text-xs">
                    {activeReport ? 'Selected report loaded' : 'Diagnosis context loaded'}
                  </Badge>
                  {activeReport && (
                    <Badge variant="secondary" className="text-xs">{activeReport.topDiagnosis}</Badge>
                  )}
                  <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={clearReportContext}>
                    <X className="h-3 w-3 mr-1" />
                    Clear report
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex items-start space-x-4 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.type === 'user' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                  : 'bg-gradient-to-r from-green-500 to-emerald-600'
              }`}>
                {message.type === 'user' ? (
                  <User className="h-4 w-4 text-white" />
                ) : (
                  <Bot className="h-4 w-4 text-white" />
                )}
              </div>
              
              <div className={`flex-1 max-w-3xl ${message.type === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block p-4 rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
                }`}>
                  <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
                </div>
                <div className={`mt-2 flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}>
                  <Clock className="h-3 w-3" />
                  <span>
                    {message.timestamp instanceof Date 
                      ? message.timestamp.toLocaleTimeString()
                      : new Date(message.timestamp).toLocaleTimeString()
                    }
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="inline-block p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky bottom-0">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex space-x-3">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about symptoms, health tips, or medical questions..."
                className="pr-12 py-3 text-base border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl"
                disabled={isLoading}
              />
            </div>
            <Button 
              onClick={handleSendMessage} 
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Disclaimer */}
          <div className="mt-3 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              This AI provides general health information only. Always consult healthcare professionals for medical advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleChatInterface;
