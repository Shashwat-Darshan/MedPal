
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { HelpCircle, MessageSquare, CheckCircle } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  type: 'yes_no' | 'multiple_choice';
  options?: string[];
}

interface QuestionCardProps {
  question: Question;
  onAnswer: (answer: string) => void;
  isLoading?: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onAnswer, isLoading = false }) => {
  const [showTextInput, setShowTextInput] = useState(false);
  const [textAnswer, setTextAnswer] = useState('');

  const handleTextSubmit = () => {
    if (textAnswer.trim()) {
      onAnswer(textAnswer.trim());
      setTextAnswer('');
      setShowTextInput(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    }
  };

  return (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-blue-900 dark:text-blue-100">
          <HelpCircle className="h-5 w-5" />
          <span>Follow-up Question</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border-2 border-blue-200 dark:border-blue-700">
          <p className="text-base text-gray-900 dark:text-gray-100 leading-relaxed font-medium">
            {question.text}
          </p>
        </div>
        
        {!showTextInput ? (
          <div className="space-y-4">
            <div className="space-y-3">
              {question.type === 'yes_no' ? (
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={() => onAnswer('yes')}
                    disabled={isLoading}
                    className="bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Yes
                  </Button>
                  <Button 
                    onClick={() => onAnswer('no')}
                    disabled={isLoading}
                    className="bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    No
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {question.options?.map((option, index) => (
                    <Button
                      key={index}
                      onClick={() => onAnswer(option)}
                      disabled={isLoading}
                      variant="outline"
                      className="w-full justify-start p-3 rounded-xl border-2 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <Button
                onClick={() => setShowTextInput(true)}
                variant="outline"
                disabled={isLoading}
                className="w-full py-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Write your own answer
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Describe your specific situation:
              </label>
              <Textarea
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Please provide more details about your condition or symptoms..."
                className="min-h-[100px] p-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm resize-none"
                disabled={isLoading}
              />
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={handleTextSubmit}
                disabled={!textAnswer.trim() || isLoading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Submit Answer
              </Button>
              <Button
                onClick={() => {
                  setShowTextInput(false);
                  setTextAnswer('');
                }}
                variant="outline"
                disabled={isLoading}
                className="px-6 py-3 rounded-xl border-2"
              >
                Back
              </Button>
            </div>
          </div>
        )}

        <p className="text-xs text-center text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
          Your detailed responses help improve diagnostic accuracy
        </p>
      </CardContent>
    </Card>
  );
};

export default QuestionCard;
