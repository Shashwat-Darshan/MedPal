
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, Heart, Brain, Apple, Dumbbell } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  category: string;
  readTime: string;
  summary: string;
  icon: any;
  featured: boolean;
}

const HealthEducation = () => {
  const [articles] = useState<Article[]>([
    {
      id: '1',
      title: 'Understanding Heart Rate Variability',
      category: 'Cardiology',
      readTime: '5 min read',
      summary: 'Learn how heart rate variability can indicate your overall health and fitness level.',
      icon: Heart,
      featured: true
    },
    {
      id: '2',
      title: 'The Science of Better Sleep',
      category: 'Sleep Health',
      readTime: '7 min read',
      summary: 'Discover evidence-based strategies to improve your sleep quality and duration.',
      icon: Brain,
      featured: false
    },
    {
      id: '3',
      title: 'Nutrition for Mental Health',
      category: 'Nutrition',
      readTime: '6 min read',
      summary: 'Explore the connection between diet and mental wellbeing.',
      icon: Apple,
      featured: false
    },
    {
      id: '4',
      title: 'Benefits of Regular Exercise',
      category: 'Fitness',
      readTime: '4 min read',
      summary: 'Understanding how physical activity impacts both physical and mental health.',
      icon: Dumbbell,
      featured: true
    }
  ]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Cardiology': return 'bg-red-100 text-red-800';
      case 'Sleep Health': return 'bg-purple-100 text-purple-800';
      case 'Nutrition': return 'bg-green-100 text-green-800';
      case 'Fitness': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5 text-indigo-600" />
          <span>Health Education</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {articles.map((article) => {
          const Icon = article.icon;
          return (
            <div key={article.id} className={`p-4 rounded-lg border transition-all hover:shadow-md cursor-pointer ${article.featured ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Icon className="h-5 w-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{article.title}</h4>
                    {article.featured && (
                      <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{article.summary}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge className={getCategoryColor(article.category)}>
                        {article.category}
                      </Badge>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{article.readTime}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Read More
                    </Button>
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

export default HealthEducation;
