
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface Disease {
  name: string;
  confidence: number;
  description: string;
  symptoms: string[];
}

interface DiagnosisCardProps {
  disease: Disease;
  rank: number;
}

const DiagnosisCard: React.FC<DiagnosisCardProps> = ({ disease, rank }) => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-500';
    if (confidence >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getConfidenceBadgeColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-100 text-green-800';
    if (confidence >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card className={`transition-all duration-300 hover:shadow-lg ${rank === 1 ? 'ring-2 ring-blue-200' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-3">
            <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-2 py-1 rounded-full">
              #{rank}
            </span>
            <span className="text-lg">{disease.name}</span>
          </CardTitle>
          <Badge className={getConfidenceBadgeColor(disease.confidence)}>
            {disease.confidence}% match
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Confidence Level</span>
            <span className="text-sm text-gray-600">{disease.confidence}%</span>
          </div>
          <Progress 
            value={disease.confidence} 
            className="h-2"
          />
        </div>

        <div>
          <p className="text-gray-700 mb-3">{disease.description}</p>
          
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Common Symptoms:</h4>
            <div className="flex flex-wrap gap-2">
              {disease.symptoms.map((symptom, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {symptom}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {rank === 1 && disease.confidence >= 80 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800 font-medium">
              🎯 High confidence match - Consider discussing this with your healthcare provider
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DiagnosisCard;
