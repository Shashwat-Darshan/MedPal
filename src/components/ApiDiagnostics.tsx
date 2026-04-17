import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bug, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  RefreshCw,
  Info,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAvailableProviders, testGeminiConnection, testGroqConnection, testMistralConnection } from '@/services/apiService';

interface DiagnosticResult {
  provider: string;
  status: 'success' | 'error' | 'testing';
  error?: string;
  details?: any;
  timestamp: Date;
}

const ApiDiagnostics = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const { toast } = useToast();

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);
    
    const providers = getAvailableProviders();
    const newResults: DiagnosticResult[] = [];

    for (const provider of providers) {
      if (!provider.hasKey) {
        newResults.push({
          provider: provider.name,
          status: 'error',
          error: 'No API key configured',
          timestamp: new Date()
        });
        continue;
      }

      // Test each provider
      newResults.push({
        provider: provider.name,
        status: 'testing',
        timestamp: new Date()
      });
      setResults([...newResults]);

      try {
        let testFunction;
        switch (provider.name) {
          case 'Gemini':
            testFunction = testGeminiConnection;
            break;
          case 'Groq':
            testFunction = testGroqConnection;
            break;
          case 'Mistral':
            testFunction = testMistralConnection;
            break;
          default:
            throw new Error('Unknown provider');
        }

        await testFunction();
        
        // Update the result
        const resultIndex = newResults.findIndex(r => r.provider === provider.name);
        if (resultIndex !== -1) {
          newResults[resultIndex] = {
            provider: provider.name,
            status: 'success',
            timestamp: new Date()
          };
        }
      } catch (error) {
        const resultIndex = newResults.findIndex(r => r.provider === provider.name);
        if (resultIndex !== -1) {
          newResults[resultIndex] = {
            provider: provider.name,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
            details: error,
            timestamp: new Date()
          };
        }
      }
      
      setResults([...newResults]);
    }

    setIsRunning(false);
    
    const successCount = newResults.filter(r => r.status === 'success').length;
    if (successCount === 0) {
      toast({
        title: "All API providers failed",
        description: "Check your API keys and internet connection",
        variant: "destructive",
      });
    } else if (successCount < providers.length) {
      toast({
        title: "Some API providers failed",
        description: `${successCount}/${providers.length} providers working`,
        variant: "default",
      });
    } else {
      toast({
        title: "All API providers working",
        description: "Your setup is healthy!",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'testing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-700 dark:text-green-300';
      case 'error':
        return 'text-red-700 dark:text-red-300';
      case 'testing':
        return 'text-blue-700 dark:text-blue-300';
      default:
        return 'text-yellow-700 dark:text-yellow-300';
    }
  };

  const analyzeError = (error: string) => {
    const analysis = {
      type: 'unknown',
      message: '',
      solution: ''
    };

    if (error.includes('429') || error.includes('rate limit')) {
      analysis.type = 'rate_limit';
      analysis.message = 'Rate limit exceeded';
      analysis.solution = 'Wait a few minutes or add alternative API keys';
    } else if (error.includes('API key not found')) {
      analysis.type = 'no_key';
      analysis.message = 'API key missing';
      analysis.solution = 'Configure API key in Settings';
    } else if (error.includes('Network error')) {
      analysis.type = 'network';
      analysis.message = 'Network connectivity issue';
      analysis.solution = 'Check your internet connection';
    } else if (error.includes('quota') || error.includes('RESOURCE_EXHAUSTED')) {
      analysis.type = 'quota';
      analysis.message = 'Quota exceeded';
      analysis.solution = 'Check your API quota or upgrade plan';
    } else if (error.includes('invalid')) {
      analysis.type = 'invalid_key';
      analysis.message = 'Invalid API key';
      analysis.solution = 'Check your API key format and permissions';
    }

    return analysis;
  };

  return (
    <Card className="glass-light dark:glass-card dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
          <Bug className="h-5 w-5 text-purple-600" />
          <span>API Diagnostics</span>
          <Badge variant="outline" className="text-xs">
            {results.filter(r => r.status === 'success').length}/{results.length} Working
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Test all configured API providers and get detailed error analysis
          </p>
          <Button 
            onClick={runDiagnostics} 
            disabled={isRunning}
            className="flex items-center space-x-2"
          >
            {isRunning ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Run Diagnostics
              </>
            )}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-3">
            {results.map((result, index) => {
              const errorAnalysis = result.error ? analyzeError(result.error) : null;
              
              return (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.status === 'success' 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                      : result.status === 'error'
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                      : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <h4 className={`font-medium ${getStatusColor(result.status)}`}>
                          {result.provider}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {result.status === 'success' && 'Connection successful'}
                          {result.status === 'error' && errorAnalysis?.message}
                          {result.status === 'testing' && 'Testing connection...'}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {result.timestamp.toLocaleTimeString()}
                    </div>
                  </div>

                  {result.error && errorAnalysis && (
                    <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded border">
                      <div className="flex items-start space-x-2">
                        <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Error Analysis
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {errorAnalysis.message}
                          </p>
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            💡 Solution: {errorAnalysis.solution}
                          </p>
                          <details className="mt-2">
                            <summary className="text-xs text-gray-500 cursor-pointer">
                              Show error details
                            </summary>
                            <pre className="text-xs text-gray-600 dark:text-gray-400 mt-2 p-2 bg-gray-100 dark:bg-gray-900 rounded overflow-auto">
                              {result.error}
                            </pre>
                          </details>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {results.length === 0 && !isRunning && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Bug className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Click "Run Diagnostics" to test your API configuration</p>
          </div>
        )}

        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <div className="flex items-start space-x-2">
            <Info className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">What this tests:</p>
              <ul className="text-xs space-y-1">
                <li>• API key validity and format</li>
                <li>• Network connectivity to API endpoints</li>
                <li>• Rate limits and quota status</li>
                <li>• Response format compatibility</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiDiagnostics; 