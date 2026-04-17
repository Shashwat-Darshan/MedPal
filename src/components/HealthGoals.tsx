
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, Plus, Trophy, Calendar, TrendingUp } from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  category: 'fitness' | 'nutrition' | 'wellness';
  deadline: string;
  completed: boolean;
}

const HealthGoals = () => {
  const [goals] = useState<Goal[]>([
    {
      id: '1',
      title: 'Daily Steps',
      target: 10000,
      current: 8432,
      unit: 'steps',
      category: 'fitness',
      deadline: '2025-06-30',
      completed: false
    },
    {
      id: '2',
      title: 'Water Intake',
      target: 8,
      current: 6,
      unit: 'glasses',
      category: 'nutrition',
      deadline: '2025-06-13',
      completed: false
    },
    {
      id: '3',
      title: 'Sleep Quality',
      target: 8,
      current: 7.6,
      unit: 'hours',
      category: 'wellness',
      deadline: '2025-06-13',
      completed: false
    },
    {
      id: '4',
      title: 'Meditation',
      target: 30,
      current: 30,
      unit: 'minutes',
      category: 'wellness',
      deadline: '2025-06-13',
      completed: true
    }
  ]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'fitness': return 'bg-blue-100 text-blue-800';
      case 'nutrition': return 'bg-green-100 text-green-800';
      case 'wellness': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-blue-600" />
            <span>Health Goals</span>
          </div>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Goal
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.map((goal) => (
          <div key={goal.id} className="p-4 bg-gray-50 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h4 className="font-medium text-gray-900">{goal.title}</h4>
                {goal.completed && <Trophy className="h-4 w-4 text-yellow-500" />}
              </div>
              <Badge className={getCategoryColor(goal.category)}>
                {goal.category}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{goal.current} / {goal.target} {goal.unit}</span>
              <span className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{goal.deadline}</span>
              </span>
            </div>
            
            <Progress 
              value={getProgressPercentage(goal.current, goal.target)} 
              className={`h-2 ${goal.completed ? 'bg-green-200' : ''}`}
            />
            
            {goal.completed && (
              <div className="flex items-center space-x-2 text-green-600 text-sm">
                <Trophy className="h-4 w-4" />
                <span>Goal Completed! 🎉</span>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default HealthGoals;
