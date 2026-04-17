import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Zap, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface PerformanceMetrics {
  provider: string;
  responseTime: number;
  success: boolean;
  timestamp: Date;
}

const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Load metrics from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('medpal_performance_metrics');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setMetrics(parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        })));
      } catch (error) {
        console.error('Error loading performance metrics:', error);
      }
    }
  }, []);

  // Save metrics to localStorage
  const saveMetrics = (newMetrics: PerformanceMetrics[]) => {
    setMetrics(newMetrics);
    localStorage.setItem('medpal_performance_metrics', JSON.stringify(newMetrics));
  };

  // Add new metric
  const addMetric = (provider: string, responseTime: number, success: boolean) => {
    const newMetric: PerformanceMetrics = {
      provider,
      responseTime,
      success,
      timestamp: new Date()
    };

    const updatedMetrics = [...metrics, newMetric].slice(-50); // Keep last 50
    saveMetrics(updatedMetrics);
  };

  // Get provider stats
  const getProviderStats = (provider: string) => {
    const providerMetrics = metrics.filter(m => m.provider === provider);
    if (providerMetrics.length === 0) return null;

    const avgResponseTime = providerMetrics.reduce((sum, m) => sum + m.responseTime, 0) / providerMetrics.length;
    const successRate = (providerMetrics.filter(m => m.success).length / providerMetrics.length) * 100;
    const recentMetrics = providerMetrics.slice(-10);
    const recentAvg = recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / recentMetrics.length;

    return {
      avgResponseTime: Math.round(avgResponseTime),
      successRate: Math.round(successRate),
      recentAvg: Math.round(recentAvg),
      totalCalls: providerMetrics.length
    };
  };

  // Get performance rating
  const getPerformanceRating = (responseTime: number) => {
    if (responseTime < 2000) return { rating: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (responseTime < 5000) return { rating: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (responseTime < 10000) return { rating: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { rating: 'Slow', color: 'text-red-600', bg: 'bg-red-100' };
  };

  // Clear metrics
  const clearMetrics = () => {
    setMetrics([]);
    localStorage.removeItem('medpal_performance_metrics');
  };

  const providers = ['Gemini', 'Groq', 'Mistral'];

  return (
    <Card className="glass-light dark:glass-card dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
          <Clock className="h-5 w-5 text-blue-600" />
          <span>Performance Monitor</span>
          <Badge variant="outline" className="text-xs">
            {metrics.length} calls tracked
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {providers.map(provider => {
          const stats = getProviderStats(provider);
          if (!stats) return null;

          const rating = getPerformanceRating(stats.recentAvg);

          return (
            <div key={provider} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">{provider}</h3>
                <div className="flex items-center space-x-2">
                  <Badge className={`text-xs ${rating.bg} ${rating.color}`}>
                    {rating.rating}
                  </Badge>
                  {stats.successRate >= 95 ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : stats.successRate >= 80 ? (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg Response Time</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {stats.avgResponseTime}ms
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {stats.successRate}%
                  </p>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span>Recent Performance</span>
                  <span>{stats.recentAvg}ms</span>
                </div>
                <Progress 
                  value={Math.min((stats.recentAvg / 10000) * 100, 100)} 
                  className="h-2"
                />
              </div>

              <div className="text-xs text-gray-500">
                {stats.totalCalls} total calls • Last 10 avg: {stats.recentAvg}ms
              </div>
            </div>
          );
        })}

        {metrics.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No performance data yet. API calls will be tracked here.</p>
          </div>
        )}

        {metrics.length > 0 && (
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Last updated: {metrics[metrics.length - 1]?.timestamp.toLocaleTimeString()}
            </div>
            <button
              onClick={clearMetrics}
              className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
            >
              Clear Data
            </button>
          </div>
        )}

        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <div className="flex items-start space-x-2">
            <Zap className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">Performance Tips:</p>
              <ul className="text-xs space-y-1">
                <li>• Response times under 2s are excellent</li>
                <li>• 2-5s is good performance</li>
                <li>• Over 10s indicates slow provider</li>
                <li>• Success rate should be above 95%</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Export function to add metrics from other components
export const addPerformanceMetric = (provider: string, responseTime: number, success: boolean) => {
  const stored = localStorage.getItem('medpal_performance_metrics');
  let metrics: PerformanceMetrics[] = [];
  
  if (stored) {
    try {
      metrics = JSON.parse(stored).map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp)
      }));
    } catch (error) {
      console.error('Error loading performance metrics:', error);
    }
  }

  const newMetric: PerformanceMetrics = {
    provider,
    responseTime,
    success,
    timestamp: new Date()
  };

  const updatedMetrics = [...metrics, newMetric].slice(-50); // Keep last 50
  localStorage.setItem('medpal_performance_metrics', JSON.stringify(updatedMetrics));
};

export default PerformanceMonitor; 