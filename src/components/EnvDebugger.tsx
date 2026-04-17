import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bug, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

const EnvDebugger = () => {
  const [showValues, setShowValues] = useState(false);

  const envVars = Object.keys(import.meta.env);
  const geminiKeys = envVars.filter(key => 
    key.toLowerCase().includes('gemini') || 
    key.toLowerCase().includes('google') ||
    key.toLowerCase().includes('api')
  );

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="h-5 w-5 text-orange-600" />
          <span>Environment Variables Debug</span>
          <Badge variant="outline" className="text-xs">
            {envVars.length} total
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Check what environment variables are available to the app.
          </p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowValues(!showValues)}
            className="flex items-center gap-2"
          >
            {showValues ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showValues ? 'Hide Values' : 'Show Values'}
          </Button>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 dark:text-white">API-Related Variables:</h4>
          {geminiKeys.length > 0 ? (
            <div className="space-y-2">
              {geminiKeys.map(key => (
                <div key={key} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <span className="text-sm font-mono text-gray-700 dark:text-gray-300">{key}</span>
                  {showValues ? (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {import.meta.env[key] ? 'Set' : 'Not set'}
                    </span>
                  ) : (
                    <Badge variant={import.meta.env[key] ? "default" : "secondary"} className="text-xs">
                      {import.meta.env[key] ? 'Available' : 'Missing'}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No API-related environment variables found.</p>
          )}
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 dark:text-white">All Environment Variables:</h4>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {envVars.map(key => (
              <div key={key} className="flex items-center justify-between p-1 text-xs">
                <span className="font-mono text-gray-600 dark:text-gray-400">{key}</span>
                <Badge variant="outline" className="text-xs">
                  {import.meta.env[key] ? 'Set' : 'Empty'}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Note:</strong> Only variables prefixed with <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">VITE_</code> are accessible in the browser.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnvDebugger; 