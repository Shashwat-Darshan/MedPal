import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Mic, Send, Brain, Activity, CheckCircle, AlertTriangle, RotateCcw, Stethoscope, Target, Sparkles, Heart, MessageSquare, Shield, Zap, Clock } from 'lucide-react';
import { useDiagnosticFlow, Disease, DiagnosticQuestion } from '@/hooks/useDiagnosticFlow';
import { generateDiagnosisFromSymptoms, generateFollowUpQuestion } from '@/services/geminiService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useUserHistory } from '@/hooks/useUserHistory';
import { selectDiagnosisReport } from '@/lib/reportStorage';

const ProcessingOverlay = () => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-2xl max-w-sm w-full border border-gray-200 dark:border-gray-700">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
          <Brain className="h-8 w-8 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            AI Processing...
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Please wait while we analyze your symptoms
          </p>
        </div>
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  </div>
);

const InitialStep: React.FC<{ onStart: () => void; isProcessing: boolean }> = ({ onStart, isProcessing }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-gray-900/50 dark:to-gray-800/50"></div>
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-3xl p-8 shadow-2xl">
            <div className="text-center space-y-6">
              <div className="relative inline-block">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <Stethoscope className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  AI Health Assistant
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Get instant, personalized health insights powered by advanced medical AI
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl border border-green-200 dark:border-green-700 flex items-center justify-center mx-auto mb-2">
                    <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-xs text-green-700 dark:text-green-300 font-medium">Instant</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl border border-purple-200 dark:border-purple-700 flex items-center justify-center mx-auto mb-2">
                    <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">AI Powered</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-700 flex items-center justify-center mx-auto mb-2">
                    <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">Secure</p>
                </div>
              </div>

              <Button 
                onClick={onStart}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white py-3 px-6 font-semibold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 border-0"
              >
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  <span>Start Assessment</span>
                  <Send className="h-5 w-5" />
                </div>
              </Button>

              <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>2-3 min</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  <span>Private</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  <span>Trusted</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed px-4">
              This AI assessment provides educational insights only. Always consult healthcare professionals for medical concerns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const SymptomsStep: React.FC<{
  symptoms: string;
  setSymptoms: React.Dispatch<React.SetStateAction<string>>;
  severityValue: number[];
  setSeverityValue: React.Dispatch<React.SetStateAction<number[]>>;
  onSubmit: () => void;
  isAnalyzing: boolean;
  isProcessing: boolean;
  progress: number;
}> = ({ symptoms, setSymptoms, severityValue, setSeverityValue, onSubmit, isAnalyzing, isProcessing, progress }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Progress Header */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Health Assessment</h2>
            <span className="text-sm text-gray-600 dark:text-gray-400">{Math.round(progress)}% Complete</span>
          </div>
          <Progress 
            value={progress} 
            className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
          />
        </div>

        {/* Main Content */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 shadow-lg">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
              <Activity className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Describe Your Symptoms</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Be as detailed as possible for better assessment</p>
            </div>
          </div>

          <div className="space-y-6 mt-8">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tell us about your symptoms</label>
              <Textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Example: I've been experiencing persistent headaches for 3 days, along with fatigue and mild nausea..."
                className="min-h-[120px] bg-white/50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-xl resize-none"
                rows={4}
                disabled={isProcessing}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Duration</label>
                <select 
                  disabled={isProcessing}
                  className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400"
                >
                  <option>Select duration</option>
                  <option>Less than 1 day</option>
                  <option>1-3 days</option>
                  <option>1 week</option>
                  <option>More than 1 week</option>
                </select>
              </div>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Severity: {severityValue[0]}/10</label>
                <div className="px-2 py-3">
                  <Slider
                    value={severityValue}
                    onValueChange={setSeverityValue}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                    disabled={isProcessing}
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                    <span>Mild</span>
                    <span>Severe</span>
                  </div>
                </div>
              </div>
            </div>

            <Button 
              onClick={onSubmit}
              disabled={!symptoms.trim() || isAnalyzing || isProcessing}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Send className="h-5 w-5 mr-2" />
              {isAnalyzing || isProcessing ? 'Analyzing Symptoms...' : 'Start Analysis'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AnalysisStep: React.FC<{ progress: number }> = ({ progress }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
    <div className="max-w-md w-full text-center space-y-6">
      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto">
        <Activity className="h-10 w-10 text-white animate-pulse" />
      </div>
      
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analyzing Your Health</h1>
        <p className="text-gray-600 dark:text-gray-400">Processing symptoms with AI medical knowledge</p>
      </div>
      
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 shadow-lg">
        <Progress 
          value={progress} 
          className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3"
        />
        <p className="text-sm text-gray-600 dark:text-gray-400">Processing medical data...</p>
      </div>
    </div>
  </div>
);

const QuestionsStep: React.FC<{
  currentQuestion: DiagnosticQuestion | null;
  showCustomAnswer: boolean;
  setShowCustomAnswer: React.Dispatch<React.SetStateAction<boolean>>;
  customAnswer: string;
  setCustomAnswer: React.Dispatch<React.SetStateAction<string>>;
  handleAnswerQuestion: (answer: string) => void;
  handleCustomAnswerSubmit: () => void;
  restartDiagnosis: () => void;
  questionHistory: string[];
  diseases: Disease[];
  progress: number;
  isProcessing: boolean;
}> = ({
  currentQuestion,
  showCustomAnswer,
  setShowCustomAnswer,
  customAnswer,
  setCustomAnswer,
  handleAnswerQuestion,
  handleCustomAnswerSubmit,
  restartDiagnosis,
  questionHistory,
  diseases,
  progress,
  isProcessing
}) => {
  const viableDiseases = diseases.filter(d => d.confidence > 0).sort((a, b) => b.confidence - a.confidence);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Diagnostic Assessment</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Question {questionHistory.length + 1} • {viableDiseases.length} conditions</p>
          </div>
          <Button
            onClick={restartDiagnosis}
            variant="outline"
            size="sm"
            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            disabled={isProcessing}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-4 shadow-lg">
          <Progress 
            value={progress} 
            className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
          />
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 shadow-lg space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
              
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Follow-up Question</h2>
              
              <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-600">
                <p className="text-gray-900 dark:text-white leading-relaxed">{currentQuestion.text}</p>
              </div>
            </div>
            
            {!showCustomAnswer ? (
              <div className="space-y-4">
                {currentQuestion.type === 'yes_no' && (
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      onClick={() => handleAnswerQuestion('yes')}
                      className="bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 px-6 rounded-xl"
                      disabled={isProcessing}
                    >
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Yes
                    </Button>
                    <Button 
                      onClick={() => handleAnswerQuestion('no')}
                      className="bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white py-3 px-6 rounded-xl"
                      disabled={isProcessing}
                    >
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      No
                    </Button>
                  </div>
                )}
                
                <Button
                  onClick={() => setShowCustomAnswer(true)}
                  variant="outline"
                  className="w-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border-dashed py-3"
                  disabled={isProcessing}
                >
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Write detailed answer
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Textarea
                  value={customAnswer}
                  onChange={(e) => setCustomAnswer(e.target.value)}
                  placeholder="Please provide more details..."
                  className="min-h-[100px] bg-white/50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-xl resize-none"
                  rows={3}
                  disabled={isProcessing}
                />
                <div className="flex space-x-3">
                  <Button
                    onClick={handleCustomAnswerSubmit}
                    disabled={!customAnswer.trim() || isProcessing}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-xl"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Submit
                  </Button>
                  <Button
                    onClick={() => {
                      setShowCustomAnswer(false);
                      setCustomAnswer('');
                    }}
                    variant="outline"
                    className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    disabled={isProcessing}
                  >
                    Back
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Active Conditions */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Conditions</h3>
            <Badge variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">{viableDiseases.length}</Badge>
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {viableDiseases.map((disease, index) => (
              <div key={disease.id} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      index === 0 ? 'bg-green-500' :
                      index === 1 ? 'bg-yellow-500' :
                      'bg-gray-500'
                    }`}>
                      {index + 1}
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{disease.name}</h4>
                  </div>
                  <Badge className={`px-3 py-1 ${
                    disease.confidence >= 60 ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'
                  }`}>
                    {Math.round(disease.confidence)}%
                  </Badge>
                </div>
                <Progress 
                  value={disease.confidence} 
                  className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ResultsStep: React.FC<{
  diseases: Disease[];
  restartDiagnosis: () => void;
}> = ({ diseases, restartDiagnosis }) => {
  const sortedDiseases = diseases.sort((a, b) => b.confidence - a.confidence);
  const topDisease = sortedDiseases[0];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Assessment Complete</h1>
            <p className="text-gray-600 dark:text-gray-400">Based on your symptoms and responses</p>
          </div>
        </div>

        {/* Main Result */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700/50 rounded-2xl p-8 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
              <h2 className="text-xl font-semibold text-green-900 dark:text-green-100">Most Likely:</h2>
            </div>
            <Badge className="bg-green-600 text-white px-4 py-2">
              {Math.round(topDisease?.confidence || 0)}% Confidence
            </Badge>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-green-900 dark:text-white mb-3">{topDisease?.name}</h3>
            <p className="text-green-800 dark:text-green-200 leading-relaxed">{topDisease?.description}</p>
          </div>
        </div>

        {/* Complete Results */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Complete Assessment Results:</h3>
          <div className="space-y-3">
            {sortedDiseases.map((disease, index) => (
              <div key={disease.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    index === 0 ? 'bg-green-500' :
                    index === 1 ? 'bg-yellow-500' :
                    'bg-gray-500'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">{disease.name}</span>
                </div>
                <Badge variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                  {Math.round(disease.confidence)}%
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700/50 rounded-2xl p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-orange-900 dark:text-orange-200 mb-2">Important Medical Disclaimer</h4>
              <p className="text-orange-800 dark:text-orange-300 text-sm leading-relaxed">
                This AI assessment is for informational purposes only. Always consult with a qualified healthcare professional for proper diagnosis and treatment.
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={restartDiagnosis}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <RotateCcw className="h-5 w-5 mr-2" />
          Start New Assessment
        </Button>
      </div>
    </div>
  );
};

const DiagnosticFlow = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { addHistoryItem, addDiagnosisReport } = useUserHistory();
  const {
    currentStep,
    setCurrentStep,
    symptoms,
    setSymptoms,
    diseases,
    setDiseases,
    currentQuestion,
    setCurrentQuestion,
    questionHistory,
    setQuestionHistory,
    answerHistory,
    setAnswerHistory,
    progress,
    isAnalyzing,
    setIsAnalyzing,
    restartDiagnosis,
    saveSessionData,
    getViableDiseases
  } = useDiagnosticFlow();

  const [severityValue, setSeverityValue] = useState([3]);
  const [showCustomAnswer, setShowCustomAnswer] = useState(false);
  const [customAnswer, setCustomAnswer] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const saveCompletedDiagnosisToHistory = (results: Disease[]) => {
    if (!user?.email || results.length === 0) {
      return;
    }

    try {
      const sortedResults = [...results].sort((a, b) => b.confidence - a.confidence);
      const topResult = sortedResults[0];

      if (!topResult) {
        return;
      }

      const reportId = `report_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const storedSession = JSON.parse(localStorage.getItem('diagnosisSession') || '{}');
      const questionAnswerPairs = Array.isArray(storedSession.questionAnswerPairs) ? storedSession.questionAnswerPairs : [];
      const nextEntry = addHistoryItem({
        symptoms,
        diagnosis: topResult.name,
        confidence: Math.round(topResult.confidence),
        status: 'completed' as const,
        reportId,
      });

      if (!nextEntry) {
        return;
      }

      const report = {
        reportId,
        historyId: nextEntry.id,
        patientEmail: user.email.toLowerCase(),
        createdAt: storedSession.createdAt || nextEntry.date,
        completedAt: new Date().toISOString(),
        symptoms,
        topDiagnosis: topResult.name,
        confidence: Math.round(topResult.confidence),
        status: 'completed' as const,
        finalResults: sortedResults,
        questionAnswerPairs,
      };

      addDiagnosisReport(report);
      selectDiagnosisReport(reportId);
    } catch (historyError) {
      console.error('Failed to save diagnosis history:', historyError);
    }
  };

  const normalizeQuestionText = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const questionSimilarity = (left: string, right: string) => {
    const leftTokens = new Set(normalizeQuestionText(left).split(' ').filter(token => token.length > 2));
    const rightTokens = new Set(normalizeQuestionText(right).split(' ').filter(token => token.length > 2));

    if (leftTokens.size === 0 || rightTokens.size === 0) {
      return 0;
    }

    let overlap = 0;
    leftTokens.forEach((token) => {
      if (rightTokens.has(token)) {
        overlap += 1;
      }
    });

    const denominator = Math.max(leftTokens.size, rightTokens.size);
    return overlap / denominator;
  };

  const applyConfidenceUpdate = (baseDiseases: Disease[], answer: string, question: DiagnosticQuestion): Disease[] => {
    return baseDiseases.map((disease) => {
      const impact = question.diseaseImpact[disease.id] || 0;
      let change = 0;

      if (question.type === 'yes_no') {
        if (answer.toLowerCase() === 'yes') {
          change = impact;
        } else if (answer.toLowerCase() === 'no') {
          change = -impact;
        } else {
          change = impact * 0.6;
        }
      } else if (question.type === 'severity') {
        const severity = parseInt(answer, 10) || 1;
        change = (impact * severity) / 5;
      }

      const newConfidence = Math.max(0, Math.min(100, disease.confidence + change));
      return { ...disease, confidence: newConfidence };
    });
  };

  const shouldEndDiagnosisFor = (snapshotDiseases: Disease[], askedQuestionCount: number) => {
    const viableDiseases = snapshotDiseases.filter(d => d.confidence > 0);

    if (viableDiseases.length === 0) return true;
    if (viableDiseases.length === 1) return true;

    const sortedDiseases = [...viableDiseases].sort((a, b) => b.confidence - a.confidence);
    const highest = sortedDiseases[0];
    const secondHighest = sortedDiseases[1];

    if (highest.confidence >= 85) return true;

    if (
      secondHighest &&
      highest.confidence - secondHighest.confidence >= 30 &&
      highest.confidence >= 70
    ) {
      return true;
    }

    if (askedQuestionCount >= 15) return true;

    return false;
  };

  const handleStartDiagnosis = () => {
    setCurrentStep('symptoms');
  };

  const handleSymptomsSubmit = async () => {
    if (!symptoms.trim()) {
      toast({
        title: "Missing Information",
        description: "Please describe your symptoms",
        variant: "destructive",
      });
      return;
    }

    setCurrentStep('analysis');
    setIsAnalyzing(true);
    setIsProcessing(true);

    try {
      console.log('Generating diagnosis from symptoms:', symptoms);
      const diagnosisResults = await generateDiagnosisFromSymptoms(symptoms);
      
      const formattedDiseases: Disease[] = diagnosisResults.map((result: any, index: number) => ({
        id: (index + 1).toString(),
        name: result.name,
        confidence: result.confidence,
        description: result.description,
        symptoms: result.symptoms || []
      }));

      console.log('Generated diseases:', formattedDiseases);
      setDiseases(formattedDiseases);
      setCurrentStep('questions');
      
      await generateNextQuestion(formattedDiseases, [], []);
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze symptoms. Please try again.",
        variant: "destructive",
      });
      setCurrentStep('symptoms');
    } finally {
      setIsAnalyzing(false);
      setIsProcessing(false);
    }
  };

  const generateNextQuestion = async (currentDiseases: Disease[], history: string[], previousAnswers: string[]) => {
    setIsProcessing(true);
    try {
      console.log('Generating next question for diseases:', currentDiseases.map(d => `${d.name}: ${d.confidence}%`));
      
      const viableDiseases = currentDiseases.filter(d => d.confidence > 0);
      
      if (viableDiseases.length === 0) {
        setCurrentStep('results');
        return;
      }
      
      const top3Diseases = viableDiseases
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 3);

      const lastQuestionText = history.length > 0 ? history[history.length - 1] : '';
      
      let questionData = await generateFollowUpQuestion(
        top3Diseases, 
        symptoms, 
        history, 
        previousAnswers,
        lastQuestionText || currentQuestion?.text || ''
      );

      const normalizedNewQuestion = questionData.question?.trim().toLowerCase();
      const normalizedLastQuestion = lastQuestionText.trim().toLowerCase();
      const isNearDuplicate = !!(questionData.question && lastQuestionText) && questionSimilarity(questionData.question, lastQuestionText) >= 0.75;

      if ((normalizedNewQuestion && normalizedLastQuestion && normalizedNewQuestion === normalizedLastQuestion) || isNearDuplicate) {
        const retryQuestionData = await generateFollowUpQuestion(
          top3Diseases,
          symptoms,
          history,
          previousAnswers,
          lastQuestionText
        );

        const normalizedRetryQuestion = retryQuestionData.question?.trim().toLowerCase();
        const retryNearDuplicate = !!(retryQuestionData.question && lastQuestionText) && questionSimilarity(retryQuestionData.question, lastQuestionText) >= 0.75;

        if (normalizedRetryQuestion && normalizedRetryQuestion !== normalizedLastQuestion && !retryNearDuplicate) {
          questionData = retryQuestionData;
        } else {
          questionData = {
            ...questionData,
            question: 'Is there anything new since your symptoms started, such as pain location, intensity, or timing?'
          };
        }
      }
      
      const question: DiagnosticQuestion = {
        id: `q_${Date.now()}`,
        text: questionData.question,
        type: 'yes_no',
        diseaseImpact: {}
      };

      if (questionData.diseaseImpacts) {
        currentDiseases.forEach(disease => {
          const impact = questionData.diseaseImpacts[disease.name];
          if (impact !== undefined) {
            question.diseaseImpact[disease.id] = impact;
          }
        });
      }

      console.log('Generated question:', question);
      setCurrentQuestion(question);
    } catch (error) {
      console.error('Error generating question:', error);
      
      const viableDiseases = currentDiseases.filter(d => d.confidence > 0);
      const fallbackQuestion: DiagnosticQuestion = {
        id: `fallback_${Date.now()}`,
        text: "Are you experiencing any fever or elevated body temperature?",
        type: 'yes_no',
        diseaseImpact: viableDiseases.reduce((acc, disease, index) => {
          acc[disease.id] = index === 0 ? 15 : index === 1 ? -10 : 5;
          return acc;
        }, {} as Record<string, number>)
      };
      setCurrentQuestion(fallbackQuestion);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAnswerQuestion = async (answer: string) => {
    if (!currentQuestion) return;

    setIsProcessing(true);
    console.log('Answer received:', answer, 'for question:', currentQuestion.text);

    const updatedDiseases = applyConfidenceUpdate(diseases, answer, currentQuestion);
    setDiseases(updatedDiseases);
    
    const newQuestionHistory = [...questionHistory, currentQuestion.text];
    const newAnswerHistory = [...answerHistory, answer];
    
    setQuestionHistory(newQuestionHistory);
    setAnswerHistory(newAnswerHistory);
    
    saveSessionData({
      question: currentQuestion.text,
      answer: answer,
      timestamp: new Date().toISOString()
    });
    
    setShowCustomAnswer(false);
    setCustomAnswer('');
    
    setTimeout(async () => {
      if (shouldEndDiagnosisFor(updatedDiseases, newQuestionHistory.length)) {
        setCurrentStep('results');
        const finalResults = [...updatedDiseases].sort((a, b) => b.confidence - a.confidence);
        saveSessionData({
          finalResults,
          completedAt: new Date().toISOString()
        });
        saveCompletedDiagnosisToHistory(finalResults);
        setIsProcessing(false);
      } else {
        await generateNextQuestion(updatedDiseases, newQuestionHistory, newAnswerHistory);
      }
    }, 1000);
  };

  const handleCustomAnswerSubmit = () => {
    if (customAnswer.trim()) {
      handleAnswerQuestion(customAnswer.trim());
    }
  };

  return (
    <div className="w-full">
      {isProcessing && <ProcessingOverlay />}
      {currentStep === 'initial' && <InitialStep onStart={handleStartDiagnosis} isProcessing={isProcessing} />}
      {currentStep === 'symptoms' && (
        <SymptomsStep
          symptoms={symptoms}
          setSymptoms={setSymptoms}
          severityValue={severityValue}
          setSeverityValue={setSeverityValue}
          onSubmit={handleSymptomsSubmit}
          isAnalyzing={isAnalyzing}
          isProcessing={isProcessing}
          progress={progress}
        />
      )}
      {currentStep === 'analysis' && <AnalysisStep progress={progress} />}
      {currentStep === 'questions' && (
        <QuestionsStep
          currentQuestion={currentQuestion}
          showCustomAnswer={showCustomAnswer}
          setShowCustomAnswer={setShowCustomAnswer}
          customAnswer={customAnswer}
          setCustomAnswer={setCustomAnswer}
          handleAnswerQuestion={handleAnswerQuestion}
          handleCustomAnswerSubmit={handleCustomAnswerSubmit}
          restartDiagnosis={restartDiagnosis}
          questionHistory={questionHistory}
          diseases={diseases}
          progress={progress}
          isProcessing={isProcessing}
        />
      )}
      {currentStep === 'results' && (
        <ResultsStep
          diseases={diseases}
          restartDiagnosis={restartDiagnosis}
        />
      )}
    </div>
  );
};

export default DiagnosticFlow;
