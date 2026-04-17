
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Activity, 
  Award, 
  Stethoscope,
  MessageSquare,
  Brain,
  Zap,
  Target,
  Clock,
  Star,
  Shield
} from 'lucide-react';

const DashboardContent = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container-responsive py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="flex-container mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex-1">
              <h1 className="text-responsive-2xl font-bold text-gray-900 dark:text-white mb-1">
                Welcome back
              </h1>
              <p className="text-responsive-sm text-gray-600 dark:text-gray-300">
                Your personalized health dashboard
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 text-responsive-xs text-green-600 dark:text-green-400">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="hidden sm:inline">Live:</span>
                <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs px-2 py-1">
                <Star className="icon-responsive mr-1" />
                <span className="hidden sm:inline">7 day </span>streak
              </Badge>
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xs px-2 py-1">
                <Award className="icon-responsive mr-1" />
                3 awards
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Action Card */}
        <Card className="glass-card mb-4 sm:mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 shadow-xl">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-responsive-lg font-bold mb-1 sm:mb-2">AI Health Insights</h2>
                  <p className="text-responsive-sm text-blue-100 opacity-90">Get instant health analysis</p>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/diagnosis')}
                className="bg-white text-blue-600 hover:bg-blue-50 button-responsive font-semibold rounded-xl shadow-lg w-full sm:w-auto"
              >
                <Zap className="icon-responsive mr-2" />
                New Diagnosis
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Card className="glass-card">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs px-1.5 py-0.5">
                  +2
                </Badge>
              </div>
              <div>
                <h3 className="text-responsive-lg font-bold text-gray-900 dark:text-white mb-0.5">12</h3>
                <p className="text-responsive-xs text-gray-600 dark:text-gray-400">Consultations</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-right">
                  <div className="text-responsive-base font-bold text-gray-900 dark:text-white">85</div>
                  <div className="text-responsive-xs text-green-600 dark:text-green-400">Great</div>
                </div>
              </div>
              <div>
                <p className="text-responsive-xs text-gray-600 dark:text-gray-400 mb-1">Health Score</p>
                <Progress value={85} className="h-1.5 sm:h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="text-responsive-xs text-gray-600 dark:text-gray-400">Keep up!</div>
              </div>
              <div>
                <h3 className="text-responsive-lg font-bold text-gray-900 dark:text-white mb-0.5">7</h3>
                <p className="text-responsive-xs text-gray-600 dark:text-gray-400">Day Streak</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <Award className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-responsive-xs text-gray-600 dark:text-gray-400">2 more</div>
              </div>
              <div>
                <h3 className="text-responsive-lg font-bold text-gray-900 dark:text-white mb-0.5">3</h3>
                <p className="text-responsive-xs text-gray-600 dark:text-gray-400">Achievements</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="glass-card">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-responsive-base">
              <Target className="icon-responsive text-blue-600" />
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex-container">
              <div 
                onClick={() => navigate('/diagnosis')}
                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-700/50 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <Stethoscope className="icon-responsive text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-responsive-sm">AI Diagnosis</h3>
                  <p className="text-responsive-xs text-gray-600 dark:text-gray-400">Get instant health assessment</p>
                </div>
              </div>

              <div 
                onClick={() => navigate('/chat')}
                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200/50 dark:border-green-700/50 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="icon-responsive text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-responsive-sm">Health Chat</h3>
                  <p className="text-responsive-xs text-gray-600 dark:text-gray-400">Ask health questions</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trust Indicators - Mobile Optimized */}
        <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-responsive-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            <span>Fast & Secure</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="h-3 w-3" />
            <span>AI Powered</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Heart className="h-3 w-3" />
            <span>Trusted</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
