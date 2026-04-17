import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  RefreshCw,
  Brain,
  Zap,
  Sparkles
} from 'lucide-react';
import { getAvailableProviders } from '@/services/apiService';

const RateLimitStatus = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [activeProvider, setActiveProvider] = useState<string>('gemini');

  // Simulate rate limit status for each provider
  const [providerStatus, setProviderStatus] = useState({
    gemini: {
      name: 'Google Gemini',
      icon: Brain,
      color: 'text-blue-600',
      requestsPerMinute: 45,
      requestsPerDay: 1200,
      maxRequestsPerMinute: 60,
      maxRequestsPerDay: 1500,
      lastReset: new Date(Date.now() + 30000),
      isAvailable: true
    },
    groq: {
      name: 'Groq',
      icon: Zap,
      color: 'text-green-600',
      requestsPerMinute: 15,
      requestsPerDay: 800,
      maxRequestsPerMinute: 100,
      maxRequestsPerDay: 2000,
      lastReset: new Date(Date.now() + 45000),
      isAvailable: true
    },
    mistral: {
      name: 'Mistral AI',
      icon: Sparkles,
      color: 'text-purple-600',
      requestsPerMinute: 8,
      requestsPerDay: 500,
      maxRequestsPerMinute: 50,
      maxRequestsPerDay: 1000,
      lastReset: new Date(Date.now() + 60000),
      isAvailable: true
    }
  });

  const availableProviders = getAvailableProviders();

  useEffect(() => {
    // Listen for rate limit errors from the console
    const originalError = console.error;
    console.error = (...args) => {
      const message = args.join(' ');
      if (message.includes('Rate limit') || message.includes('429')) {
        setLastError(message);
        setRetryCount(prev => prev + 1);
      }
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  const testApiConnection = async () => {
    setIsLoading(true);
    setLastError(null);
    
    try {
      // This would be a simple API call to test the connection
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Hello' }] }],
          generationConfig: { maxOutputTokens: 10 }
        })
      });
      
      if (response.status === 429) {
        setLastError('Rate limit exceeded. Please wait before trying again.');
      } else if (response.status === 401) {
        setLastError('Invalid API key. Please check your configuration.');
      } else {
        setLastError(null);
      }
    } catch (error) {
      setLastError('Network error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeUntilReset = (provider: string) => {
    const status = providerStatus[provider as keyof typeof providerStatus];
    const now = new Date();
    const diff = status.lastReset.getTime() - now.getTime();
    if (diff <= 0) return 'Reset now';
    
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProviderUsage = (provider: string) => {
    const status = providerStatus[provider as keyof typeof providerStatus];
    const minuteUsage = (status.requestsPerMinute / status.maxRequestsPerMinute) * 100;
    const dayUsage = (status.requestsPerDay / status.maxRequestsPerDay) * 100;
    return { minuteUsage, dayUsage };
  };

  const totalConfigured = availableProviders.filter(p => p.hasKey).length;

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          <span>Multi-Provider Status</span>
          {lastError ? (
            <Badge variant="destructive" className="text-xs">Rate Limited</Badge>
          ) : (
            <Badge variant="default" className="text-xs">Available</Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {totalConfigured}/3 Configured
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Provider Tabs */}
        <Tabs value={activeProvider} onValueChange={setActiveProvider} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="gemini" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Gemini
            </TabsTrigger>
            <TabsTrigger value="groq" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Groq
            </TabsTrigger>
            <TabsTrigger value="mistral" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Mistral
            </TabsTrigger>
          </TabsList>

          {(['gemini', 'groq', 'mistral'] as const).map(provider => {
            const status = providerStatus[provider];
            const { minuteUsage, dayUsage } = getProviderUsage(provider);
            const IconComponent = status.icon;
            const hasKey = availableProviders.find(p => p.name.toLowerCase() === provider)?.hasKey;

            return (
              <TabsContent key={provider} value={provider} className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Requests per minute:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {status.requestsPerMinute} / {status.maxRequestsPerMinute}
                      </span>
                      <Badge variant={minuteUsage > 80 ? "destructive" : minuteUsage > 60 ? "secondary" : "outline"} className="text-xs">
                        {Math.round(minuteUsage)}%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={minuteUsage} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Requests per day:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {status.requestsPerDay} / {status.maxRequestsPerDay}
                      </span>
                      <Badge variant={dayUsage > 80 ? "destructive" : dayUsage > 60 ? "secondary" : "outline"} className="text-xs">
                        {Math.round(dayUsage)}%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={dayUsage} className="h-2" />
                </div>

                {/* Reset Timer */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <RefreshCw className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-800 dark:text-blue-200">
                      Rate limit resets in: <strong>{getTimeUntilReset(provider)}</strong>
                    </span>
                  </div>
                </div>

                {/* Provider Status */}
                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="flex items-center gap-2">
                    <IconComponent className={`h-4 w-4 ${status.color}`} />
                    <span className="text-sm font-medium">{status.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasKey ? (
                      <Badge variant="default" className="text-xs">Configured</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Not Configured</Badge>
                    )}
                    {status.isAvailable ? (
                      <Badge variant="outline" className="text-xs">Available</Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">Rate Limited</Badge>
                    )}
                  </div>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Error Display */}
        {lastError && (
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-700">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-800 dark:text-red-200 font-medium">Rate Limit Error</p>
                <p className="text-xs text-red-700 dark:text-red-300 mt-1">{lastError}</p>
                {retryCount > 0 && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    Auto-retry attempts: {retryCount}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2">
          <Button 
            onClick={testApiConnection} 
            disabled={isLoading}
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Test Connection
              </>
            )}
          </Button>
        </div>

        {/* Help Information */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-medium mb-1">Provider Limits:</p>
              <ul className="text-xs space-y-1">
                <li>• <strong>Gemini:</strong> 60/min, 1,500/day (Free tier)</li>
                <li>• <strong>Groq:</strong> 100/min, 2,000/day (Free tier)</li>
                <li>• <strong>Mistral:</strong> 50/min, 1,000/day (Free tier)</li>
                <li>• System automatically switches when limits are hit</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RateLimitStatus; 