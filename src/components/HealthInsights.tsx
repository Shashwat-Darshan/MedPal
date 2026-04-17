
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, Heart, Moon, Activity, Lightbulb } from 'lucide-react';

const HealthInsights = () => {
  const insights = [
    {
      id: '1',
      title: 'Sleep Pattern Analysis',
      description: 'Your sleep quality has improved by 15% this week. Consider maintaining your current bedtime routine.',
      type: 'positive',
      icon: Moon,
      action: 'Keep up the good work!'
    },
    {
      id: '2',
      title: 'Heart Rate Trend',
      description: 'Your resting heart rate has been stable. This indicates good cardiovascular health.',
      type: 'info',
      icon: Heart,
      action: 'Continue regular exercise'
    },
    {
      id: '3',
      title: 'Activity Recommendation',
      description: 'You\'ve been less active on weekends. Try scheduling fun physical activities.',
      type: 'warning',
      icon: Activity,
      action: 'Plan weekend activities'
    },
    {
      id: '4',
      title: 'Hydration Insight',
      description: 'Your water intake is below recommended levels. Aim for 8 glasses daily.',
      type: 'alert',
      icon: TrendingUp,
      action: 'Set water reminders'
    }
  ];

  const getInsightStyle = (type: string) => {
    switch (type) {
      case 'positive': return 'bg-green-50 border-green-200 text-green-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'alert': return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'alert': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-purple-600 flex-shrink-0" />
          <span className="break-words">AI Health Insights</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight) => {
          const Icon = insight.icon;
          return (
            <div key={insight.id} className={`p-4 rounded-lg border w-full ${getInsightStyle(insight.type)}`}>
              <div className="flex items-start space-x-3 w-full">
                <div className="flex-shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex items-start justify-between mb-2 gap-2 w-full">
                    <h4 className="font-medium break-words flex-1 min-w-0">{insight.title}</h4>
                    <Badge className={`${getBadgeStyle(insight.type)} flex-shrink-0 whitespace-nowrap text-xs`}>
                      {insight.type}
                    </Badge>
                  </div>
                  <p className="text-sm mb-3 break-words w-full">{insight.description}</p>
                  <div className="flex items-start space-x-2 w-full">
                    <Lightbulb className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm font-medium break-words flex-1 min-w-0">{insight.action}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default HealthInsights;
