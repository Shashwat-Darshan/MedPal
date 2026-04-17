import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getChatResponseFromGemini } from '@/services/apiService';
import { Loader2, CheckCircle, XCircle, Send } from 'lucide-react';

const ApiTest = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [response, setResponse] = useState<string>('');
  const { toast } = useToast();

  const testApiConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    setResponse('');

    try {
      const result = await getChatResponseFromGemini(
        'Hello! This is a test message. Please respond with "API connection successful" if you can read this.'
      );
      
      setResponse(result);
      setTestResult('success');
      toast({
        title: "API Test Successful",
        description: "Your active provider is working correctly!",
      });
    } catch (error) {
      console.error('API test failed:', error);
      setResponse(error instanceof Error ? error.message : 'Unknown error occurred');
      setTestResult('error');
      toast({
        title: "API Test Failed",
        description: "Please check your Mistral API key configuration.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const hasApiKey = !!(localStorage.getItem('mistral_api_key') || import.meta.env.VITE_MISTRAL_API_KEY);

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5 text-blue-600" />
          <span>API Connection Test</span>
          {hasApiKey ? (
            <Badge variant="outline" className="text-xs">Key Configured</Badge>
          ) : (
            <Badge variant="destructive" className="text-xs">No Key</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Test your Mistral API connection to ensure everything is working properly.
          </p>
          <Button 
            onClick={testApiConnection} 
            disabled={isTesting || !hasApiKey}
            className="flex items-center gap-2"
          >
            {isTesting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Test Connection
              </>
            )}
          </Button>
        </div>

        {testResult && (
          <div className={`p-4 rounded-lg border ${
            testResult === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
          }`}>
            <div className="flex items-start gap-3">
              {testResult === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <h4 className={`font-medium mb-2 ${
                  testResult === 'success' ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                }`}>
                  {testResult === 'success' ? 'Connection Successful' : 'Connection Failed'}
                </h4>
                {response && (
                  <p className={`text-sm ${
                    testResult === 'success' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                  }`}>
                    {response}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {!hasApiKey && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Please configure your Mistral API key in the settings above before testing the connection.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApiTest; 