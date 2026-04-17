
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Key, Save, Eye, EyeOff, CheckCircle, AlertCircle, ExternalLink, Zap, Brain, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAvailableProviders, testGeminiConnection, testGroqConnection, testMistralConnection } from '@/services/apiService';

interface ApiKeyConfig {
  key: string;
  showKey: boolean;
  isValid: boolean;
  isTesting: boolean;
}

const ApiKeyInput = () => {
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<Record<string, ApiKeyConfig>>({
    gemini: {
      key: localStorage.getItem('gemini_api_key') || '',
      showKey: false,
      isValid: false,
      isTesting: false
    },
    groq: {
      key: localStorage.getItem('groq_api_key') || '',
      showKey: false,
      isValid: false,
      isTesting: false
    },
    mistral: {
      key: localStorage.getItem('mistral_api_key') || '',
      showKey: false,
      isValid: false,
      isTesting: false
    }
  });

  const availableProviders = getAvailableProviders();

  const validateApiKey = (provider: string, key: string): boolean => {
    switch (provider) {
      case 'gemini':
        return key.startsWith('AIza') && key.length >= 35;
      case 'groq':
        return key.startsWith('gsk_') && key.length >= 20;
      case 'mistral':
        return key.startsWith('mist-') && key.length >= 20;
      default:
        return false;
    }
  };

  const updateApiKey = (provider: string, key: string) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        key,
        isValid: validateApiKey(provider, key)
      }
    }));
  };

  const toggleKeyVisibility = (provider: string) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        showKey: !prev[provider].showKey
      }
    }));
  };

  const handleSave = (provider: string) => {
    const config = apiKeys[provider];
    const trimmedKey = config.key.trim();
    
    if (!trimmedKey) {
      toast({
        title: "Invalid API Key",
        description: `Please enter a valid ${provider.charAt(0).toUpperCase() + provider.slice(1)} API key`,
        variant: "destructive",
      });
      return;
    }

    if (!config.isValid) {
      toast({
        title: "Invalid API Key Format",
        description: `Please check the format of your ${provider.charAt(0).toUpperCase() + provider.slice(1)} API key`,
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem(`${provider}_api_key`, trimmedKey);
    toast({
      title: "API Key Saved",
      description: `Your ${provider.charAt(0).toUpperCase() + provider.slice(1)} API key has been saved successfully`,
    });
  };

  const handleClear = (provider: string) => {
    localStorage.removeItem(`${provider}_api_key`);
    updateApiKey(provider, '');
    toast({
      title: "API Key Cleared",
      description: `Your ${provider.charAt(0).toUpperCase() + provider.slice(1)} API key has been removed`,
    });
  };

  const handleTestKey = async (provider: string) => {
    const config = apiKeys[provider];
    if (!config.key.trim() || !config.isValid) {
      toast({
        title: "Invalid API Key",
        description: `Please enter a valid ${provider.charAt(0).toUpperCase() + provider.slice(1)} API key first`,
        variant: "destructive",
      });
      return;
    }

    setApiKeys(prev => ({
      ...prev,
      [provider]: { ...prev[provider], isTesting: true }
    }));

    try {
      let testFunction;
      switch (provider) {
        case 'gemini':
          testFunction = testGeminiConnection;
          break;
        case 'groq':
          testFunction = testGroqConnection;
          break;
        case 'mistral':
          testFunction = testMistralConnection;
          break;
        default:
          throw new Error('Unknown provider');
      }

      await testFunction();
      toast({
        title: "API Key Valid",
        description: `Your ${provider.charAt(0).toUpperCase() + provider.slice(1)} API key is working correctly!`,
      });
    } catch (error) {
      toast({
        title: "API Key Test Failed",
        description: `The ${provider.charAt(0).toUpperCase() + provider.slice(1)} API key might be invalid or have insufficient permissions`,
        variant: "destructive",
      });
    } finally {
      setApiKeys(prev => ({
        ...prev,
        [provider]: { ...prev[provider], isTesting: false }
      }));
    }
  };

  const getProviderInfo = (provider: string) => {
    switch (provider) {
      case 'gemini':
        return {
          name: 'Google Gemini',
          icon: Brain,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          description: 'Google\'s most advanced AI model',
          placeholder: 'AIzaSy... (Get from Google AI Studio)',
          link: 'https://aistudio.google.com/app/apikey'
        };
      case 'groq':
        return {
          name: 'Groq',
          icon: Zap,
          color: 'text-green-600',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          description: 'Ultra-fast inference API',
          placeholder: 'gsk_... (Get from Groq Console)',
          link: 'https://console.groq.com/keys'
        };
      case 'mistral':
        return {
          name: 'Mistral AI',
          icon: Sparkles,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50 dark:bg-purple-900/20',
          description: 'European AI powerhouse',
          placeholder: 'mist-... (Get from Mistral AI)',
          link: 'https://console.mistral.ai/api-keys/'
        };
      default:
        return {
          name: provider,
          icon: Key,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          description: 'AI provider',
          placeholder: 'Enter API key...',
          link: '#'
        };
    }
  };

  const totalConfigured = availableProviders.filter(p => p.hasKey).length;

  return (
    <Card className="glass-light dark:glass-card dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
          <Key className="h-5 w-5 text-blue-600" />
          <span>Multi-Provider AI Configuration</span>
          <Badge variant="outline" className="text-xs">
            {totalConfigured}/3 Configured
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Overview */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <div className="flex items-center space-x-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-gray-700 dark:text-gray-300">
              Multi-provider system active with {totalConfigured} configured APIs
            </span>
          </div>
          <div className="flex items-center space-x-2 text-sm mt-1">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-gray-700 dark:text-gray-300">
              Automatic failover when rate limits are hit
            </span>
          </div>
        </div>

        {/* Provider Tabs */}
        <Tabs defaultValue="gemini" className="w-full">
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
            const config = apiKeys[provider];
            const info = getProviderInfo(provider);
            const IconComponent = info.icon;

            return (
              <TabsContent key={provider} value={provider} className="space-y-4">
                <div className={`${info.bgColor} p-4 rounded-lg`}>
                  <div className="flex items-center gap-2 mb-2">
                    <IconComponent className={`h-5 w-5 ${info.color}`} />
                    <h3 className="font-semibold text-gray-900 dark:text-white">{info.name}</h3>
                    {config.isValid ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : config.key ? (
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{info.description}</p>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`${provider}Key`} className="text-gray-700 dark:text-gray-300">
                      {info.name} API Key
                    </Label>
                    <div className="relative">
                      <Input
                        id={`${provider}Key`}
                        type={config.showKey ? "text" : "password"}
                        placeholder={info.placeholder}
                        value={config.key}
                        onChange={(e) => updateApiKey(provider, e.target.value)}
                        className="pr-12"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => toggleKeyVisibility(provider)}
                      >
                        {config.showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 mt-3">
                    <Button 
                      onClick={() => handleSave(provider)} 
                      className="flex items-center space-x-2"
                      disabled={!config.isValid}
                    >
                      <Save className="h-4 w-4" />
                      <span>Save</span>
                    </Button>
                    <Button 
                      onClick={() => handleTestKey(provider)} 
                      variant="outline" 
                      className="flex items-center space-x-2"
                      disabled={config.isTesting || !config.isValid}
                    >
                      {config.isTesting ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Test
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => handleClear(provider)}>
                      Clear
                    </Button>
                  </div>

                  <div className="mt-3">
                    <a 
                      href={info.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs text-blue-600 hover:underline flex items-center space-x-1"
                    >
                      Get API key from {info.name} <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Help Information */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-medium mb-1">Multi-Provider Benefits:</p>
              <ul className="text-xs space-y-1">
                <li>• Automatic failover when one provider hits rate limits</li>
                <li>• Better reliability and uptime</li>
                <li>• Configure as many providers as you want</li>
                <li>• System automatically chooses the best available provider</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p>• API keys are stored locally in your browser</p>
          <p>• Never share your API keys with others</p>
          <p>• At least one API key is required for AI features to work</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiKeyInput;
