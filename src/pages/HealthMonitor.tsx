
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Activity, Heart, Thermometer, Droplets, TrendingUp, TrendingDown, Calendar, Clock, Zap, Target, AlertCircle, CheckCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import Navbar from '@/components/Navbar';

const HealthMonitor = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Mock health data
  const vitals = {
    heartRate: { value: 72, unit: 'bpm', status: 'normal', trend: 'stable' },
    bloodPressure: { systolic: 120, diastolic: 80, status: 'normal', trend: 'improving' },
    temperature: { value: 98.6, unit: '°F', status: 'normal', trend: 'stable' },
    oxygenSaturation: { value: 98, unit: '%', status: 'excellent', trend: 'stable' },
    weight: { value: 70, unit: 'kg', status: 'healthy', trend: 'stable' },
    sleep: { value: 7.5, unit: 'hours', status: 'good', trend: 'improving' }
  };

  const heartRateData = [
    { time: '00:00', value: 65 },
    { time: '04:00', value: 60 },
    { time: '08:00', value: 72 },
    { time: '12:00', value: 78 },
    { time: '16:00', value: 85 },
    { time: '20:00', value: 70 },
    { time: '24:00', value: 68 }
  ];

  const weeklyActivity = [
    { day: 'Mon', steps: 8500, calories: 320 },
    { day: 'Tue', steps: 10200, calories: 380 },
    { day: 'Wed', steps: 7800, calories: 290 },
    { day: 'Thu', steps: 12000, calories: 450 },
    { day: 'Fri', steps: 9500, calories: 360 },
    { day: 'Sat', steps: 11000, calories: 420 },
    { day: 'Sun', steps: 6500, calories: 250 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'good': 
      case 'normal': 
      case 'healthy': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-600 bg-clip-text text-transparent">
                Health Monitor
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Track your vital signs and health metrics in real-time</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live Monitoring: {currentTime.toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Heart className="h-4 w-4 text-red-500" />
              <span>All Systems Normal</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span>Real-time Data</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Vital Signs Cards */}
          <div className="lg:col-span-8 space-y-6">
            {/* Current Vitals */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="stat-card floating-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Heart Rate</p>
                      <p className="text-2xl font-bold text-white">{vitals.heartRate.value}</p>
                      <p className="text-blue-200 text-xs">{vitals.heartRate.unit}</p>
                    </div>
                    <div className="text-right">
                      <Heart className="h-6 w-6 text-blue-200 heartbeat-animation" />
                      {getTrendIcon(vitals.heartRate.trend)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white floating-card glass-stats">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Blood Pressure</p>
                      <p className="text-2xl font-bold">{vitals.bloodPressure.systolic}/{vitals.bloodPressure.diastolic}</p>
                      <p className="text-green-200 text-xs">mmHg</p>
                    </div>
                    <div className="text-right">
                      <Activity className="h-6 w-6 text-green-200" />
                      {getTrendIcon(vitals.bloodPressure.trend)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white floating-card glass-stats">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Temperature</p>
                      <p className="text-2xl font-bold">{vitals.temperature.value}</p>
                      <p className="text-orange-200 text-xs">{vitals.temperature.unit}</p>
                    </div>
                    <div className="text-right">
                      <Thermometer className="h-6 w-6 text-orange-200" />
                      {getTrendIcon(vitals.temperature.trend)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white floating-card glass-stats">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-teal-100 text-sm">Oxygen Saturation</p>
                      <p className="text-2xl font-bold">{vitals.oxygenSaturation.value}</p>
                      <p className="text-teal-200 text-xs">{vitals.oxygenSaturation.unit}</p>
                    </div>
                    <div className="text-right">
                      <Droplets className="h-6 w-6 text-teal-200" />
                      {getTrendIcon(vitals.oxygenSaturation.trend)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-pink-600 text-white floating-card glass-stats">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Weight</p>
                      <p className="text-2xl font-bold">{vitals.weight.value}</p>
                      <p className="text-purple-200 text-xs">{vitals.weight.unit}</p>
                    </div>
                    <div className="text-right">
                      <Target className="h-6 w-6 text-purple-200" />
                      {getTrendIcon(vitals.weight.trend)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white floating-card glass-stats">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-indigo-100 text-sm">Sleep</p>
                      <p className="text-2xl font-bold">{vitals.sleep.value}</p>
                      <p className="text-indigo-200 text-xs">{vitals.sleep.unit}</p>
                    </div>
                    <div className="text-right">
                      <Clock className="h-6 w-6 text-indigo-200" />
                      {getTrendIcon(vitals.sleep.trend)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Heart Rate Chart */}
            <Card className="glass-light dark:glass-card dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span>Heart Rate Trend (24h)</span>
                  <Badge className={getStatusColor(vitals.heartRate.status)}>
                    {vitals.heartRate.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={heartRateData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="time" className="text-sm" />
                    <YAxis className="text-sm" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#ef4444" 
                      fill="url(#heartRateGradient)" 
                      strokeWidth={2}
                    />
                    <defs>
                      <linearGradient id="heartRateGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Weekly Activity */}
            <Card className="glass-light dark:glass-card dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                  <Activity className="h-5 w-5 text-blue-500" />
                  <span>Weekly Activity Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weeklyActivity}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="day" className="text-sm" />
                    <YAxis className="text-sm" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Line type="monotone" dataKey="steps" stroke="#3b82f6" strokeWidth={2} name="Steps" />
                    <Line type="monotone" dataKey="calories" stroke="#10b981" strokeWidth={2} name="Calories" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Health Status */}
            <Card className="glass-light dark:glass-card dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100 text-base">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Health Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(vitals).map(([key, vital]) => (
                  <div key={key} className="flex items-center justify-between p-3 health-metric rounded-lg">
                    <div>
                      <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h4>
                      <Badge className={`${getStatusColor(vital.status)} text-xs mt-1`}>
                        {vital.status}
                      </Badge>
                    </div>
                    {getTrendIcon(vital.trend)}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Daily Goals */}
            <Card className="glass-light dark:glass-card dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100 text-base">
                  <Target className="h-5 w-5 text-purple-500" />
                  <span>Daily Goals</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="p-3 tip-card rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Steps</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">8,500 / 10,000</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div className="p-3 tip-card rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Water Intake</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">6 / 8 glasses</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div className="p-3 tip-card rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Sleep</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">7.5 / 8 hours</span>
                    </div>
                    <Progress value={94} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="glass-light dark:glass-card dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100 text-base">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start medical-gradient text-white hover:opacity-90">
                  <Heart className="h-4 w-4 mr-2" />
                  Record Heart Rate
                </Button>
                <Button variant="outline" className="w-full justify-start dark:border-gray-600 dark:text-gray-300">
                  <Thermometer className="h-4 w-4 mr-2" />
                  Log Temperature
                </Button>
                <Button variant="outline" className="w-full justify-start dark:border-gray-600 dark:text-gray-300">
                  <Activity className="h-4 w-4 mr-2" />
                  Add Exercise
                </Button>
                <Button variant="outline" className="w-full justify-start dark:border-gray-600 dark:text-gray-300">
                  <Calendar className="h-4 w-4 mr-2" />
                  Set Reminder
                </Button>
              </CardContent>
            </Card>

            {/* Health Alert */}
            <Card className="glass-light dark:glass-card dark:border-gray-700 border-blue-200 dark:border-blue-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-blue-700 dark:text-blue-300 text-base">
                  <AlertCircle className="h-5 w-5" />
                  <span>Health Tip</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-600 dark:text-blue-300">
                  Your heart rate variability is excellent! This indicates good cardiovascular health. 
                  Keep up your regular exercise routine.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HealthMonitor;
