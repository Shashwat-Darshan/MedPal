import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ApiKeyInput from '@/components/ApiKeyInput';
import ApiTest from '@/components/ApiTest';
import ApiDiagnostics from '@/components/ApiDiagnostics';
import PerformanceMonitor from '@/components/PerformanceMonitor';
import EnvDebugger from '@/components/EnvDebugger';
import RateLimitStatus from '@/components/RateLimitStatus';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { getAvailableProviders, setFastMode } from '@/services/apiService';
import { 
  Settings as SettingsIcon, 
  Key, 
  Shield, 
  Info,
  CheckCircle,
  AlertCircle,
  Zap,
  Brain
} from 'lucide-react';

const Settings = () => {
  const hasApiKey = localStorage.getItem('gemini_api_key');
  const [fastMode, setFastModeState] = useState(false);

  useEffect(() => {
    // Load fast mode preference from localStorage
    const savedFastMode = localStorage.getItem('medpal_fast_mode') === 'true';
    setFastModeState(savedFastMode);
    setFastMode(savedFastMode);
  }, []);

  const handleFastModeToggle = (enabled: boolean) => {
    setFastModeState(enabled);
    setFastMode(enabled);
    localStorage.setItem('medpal_fast_mode', enabled.toString());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Navbar />
      
      <div className="container-responsive py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="flex-container mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex-1">
              <h1 className="text-responsive-2xl font-bold text-gray-900 dark:text-white mb-1">
                Settings
              </h1>
              <p className="text-responsive-sm text-gray-600 dark:text-gray-300">
                Configure your MedPal experience
              </p>
            </div>
            <div className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-gray-500" />
              <Badge variant="outline" className="text-xs">
                {hasApiKey ? 'Configured' : 'Setup Required'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Performance Mode Section */}
        <div className="mb-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                <span>Performance Mode</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="fast-mode" className="text-sm font-medium">
                    Fast Mode (Python-like Speed)
                  </Label>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Bypass multi-provider logic for maximum speed. Similar to Python script performance.
                  </p>
                </div>
                <Switch
                  id="fast-mode"
                  checked={fastMode}
                  onCheckedChange={handleFastModeToggle}
                />
              </div>
              {fastMode && (
                <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Brain className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div className="text-xs text-gray-700 dark:text-gray-300">
                      <p className="font-medium mb-1">Fast Mode Active:</p>
                      <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                        <li>• Direct Gemini API calls (no provider switching)</li>
                        <li>• Minimal error handling and logging</li>
                        <li>• Reduced token limits for faster responses</li>
                        <li>• No performance monitoring overhead</li>
                        <li>• Similar speed to Python script</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* API Configuration Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Key className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Configuration
            </h2>
            {hasApiKey ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            )}
          </div>
          <ApiKeyInput />
        </div>

        {/* API Test Section */}
        <div className="mb-6">
          <ApiTest />
        </div>

        {/* API Diagnostics Section */}
        <div className="mb-6">
          <ApiDiagnostics />
        </div>

        {/* Performance Monitor */}
        <div className="mb-6">
          <PerformanceMonitor />
        </div>

        {/* Rate Limit Status */}
        <div className="mb-6">
          <RateLimitStatus />
        </div>

        {/* Environment Debugger (Temporary) */}
        <div className="mb-6">
          <EnvDebugger />
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-green-600" />
                <span>Security Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">API Key</span>
                  <Badge variant={hasApiKey ? "default" : "destructive"} className="text-xs">
                    {hasApiKey ? 'Configured' : 'Missing'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Data Storage</span>
                  <Badge variant="outline" className="text-xs">Local Only</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Encryption</span>
                  <Badge variant="outline" className="text-xs">HTTPS</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Info className="h-4 w-4 text-blue-600" />
                <span>System Info</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">AI Model</span>
                  <Badge variant="outline" className="text-xs">Gemini 1.5 Pro</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Version</span>
                  <Badge variant="outline" className="text-xs">1.0.0</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                  <Badge variant="default" className="text-xs">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Information Section */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              <span>About MedPal</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                AI-Powered Health Assistant
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                MedPal uses Google's Gemini AI to provide intelligent health insights and diagnostic assistance. 
                Your conversations are processed securely and your data remains private.
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p>• All AI interactions are processed through Google's secure API</p>
                <p>• Your health data is stored locally in your browser</p>
                <p>• No personal information is shared with third parties</p>
                <p>• This is not a substitute for professional medical advice</p>
              </div>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Important Disclaimer
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                MedPal provides general health information and suggestions only. Always consult with qualified 
                healthcare professionals for medical advice, diagnosis, or treatment. In case of emergency, 
                contact emergency services immediately.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings; 