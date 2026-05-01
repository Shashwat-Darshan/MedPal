
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { useUserHistory } from '@/hooks/useUserHistory';
import { 
  Activity,
  Bell,
  Calendar,
  Check,
  Clock,
  Heart,
  MoveUpRight,
  Pill,
  Plus,
  Radio,
  Sparkles,
  UserCircle2
} from 'lucide-react';

const DashboardContent = () => {
  const navigate = useNavigate();
  const { history } = useUserHistory();

  // Dynamic medication reminders based on time of day
  const getCurrentReminders = () => {
    const now = new Date();
    const hour = now.getHours();
    
    const allReminders = [
      { name: 'Metformin 500mg', time: '8:00 AM', status: hour >= 8 && hour < 12 ? 'Due' : hour < 8 ? 'Upcoming' : 'Done', scheduledHour: 8 },
      { name: 'Walk 30 min', time: '12:30 PM', status: hour >= 12 && hour < 15 ? 'Due' : hour < 12 ? 'Upcoming' : 'Done', scheduledHour: 12 },
      { name: 'Lisinopril 5mg', time: '6:00 PM', status: hour >= 18 && hour < 21 ? 'Due' : hour < 18 ? 'Upcoming' : 'Done', scheduledHour: 18 },
      { name: 'Vitamin D', time: '9:00 PM', status: hour >= 21 ? 'Due' : 'Upcoming', scheduledHour: 21 }
    ];
    
    return allReminders.slice(0, 3);
  };

  // Dynamic insights based on simulated health data
  const getHealthInsights = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    
    return [
      { 
        title: 'Resting HR improving', 
        detail: 'Down 4 bpm vs last week (68→64).', 
        type: 'success',
        icon: '↓'
      },
      { 
        title: 'Medication adherence strong', 
        detail: '92% this week. Only 1 dose missed.', 
        type: 'success',
        icon: '✓'
      },
      { 
        title: 'Morning BP elevated', 
        detail: 'Average 145/90. Consider morning walk.', 
        type: 'warning',
        icon: '⚠'
      },
      { 
        title: 'HbA1c trending down', 
        detail: 'Latest: 6.8% (was 7.2% last quarter).', 
        type: 'success',
        icon: '↓'
      },
      { 
        title: 'Sleep consistency improved', 
        detail: 'Avg 7.2 hours last 7 days. Great!', 
        type: 'success',
        icon: '✓'
      }
    ];
  };

  const reminders = getCurrentReminders();
  const insights = getHealthInsights().slice(0, 3);

  // Transform history items to activity feed format
  const activity = useMemo(() => {
    return history.slice(0, 3).map((item) => {
      const date = new Date(item.date);
      const now = new Date();
      const daysAgo = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      let when = 'Today';
      if (daysAgo === 1) when = 'Yesterday';
      else if (daysAgo > 1) when = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      return {
        when,
        label: `Diagnostic assessment: ${item.symptoms}`,
        value: `${Math.round(item.confidence)}% confidence`
      };
    });
  }, [history]);

  const insightBadgeClass = (type: string) => {
    if (type === 'success') return 'bg-green-100 text-green-700 border-green-200';
    if (type === 'warning') return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-blue-100 text-blue-700 border-blue-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/50 to-emerald-50/40 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <section className="mb-5 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-300">Today</p>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 sm:text-4xl">Good morning, Alex.</h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Here's a calm look at how you're doing, nothing urgent and a few gentle nudges.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 p-1 text-xs dark:border-slate-700 dark:bg-slate-800">
                {['7d', '30d', '90d', '1y'].map((range) => (
                  <button
                    key={range}
                    className={`rounded-full px-3 py-1 ${range === '7d' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}
                  >
                    {range}
                  </button>
                ))}
              </div>

              <Button onClick={() => navigate('/transcript')} className="rounded-full bg-cyan-600 px-5 text-white hover:bg-cyan-700">
                <Radio className="mr-2 h-4 w-4" />
                Start transcript
              </Button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {['All', 'Vitals', 'Medications', 'Goals', 'Visits'].map((tab, index) => (
              <button
                key={tab}
                className={`rounded-full px-3 py-1.5 text-xs font-medium sm:text-sm ${
                  index === 0
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-12">
          <Card className="lg:col-span-6 border-slate-200 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <CardContent className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">Health score</Badge>
                <span className="text-sm text-slate-500 dark:text-slate-400">82%</span>
              </div>
              <div className="mb-2 flex items-end gap-2">
                <p className="text-5xl font-bold text-slate-900 dark:text-slate-100">82</p>
                <p className="pb-1 text-sm font-medium text-emerald-600">+3</p>
              </div>
              <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">Good · vs last week</p>
              <Progress value={82} className="h-2" />
            </CardContent>
          </Card>

          <Card className="lg:col-span-3 border-slate-200 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <CardContent className="p-5">
              <Badge variant="outline" className="mb-4 border-emerald-200 bg-emerald-50 text-emerald-700">Adherence</Badge>
              <p className="text-4xl font-bold text-slate-900 dark:text-slate-100">92%</p>
              <p className="mb-3 mt-1 text-sm text-slate-500 dark:text-slate-400">11/12 doses · 1 missed</p>
              <Progress value={92} className="h-2" />
            </CardContent>
          </Card>

          <Card className="lg:col-span-3 border-slate-200 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <CardContent className="p-5">
              <Badge variant="outline" className="mb-4 border-cyan-200 bg-cyan-50 text-cyan-700">Resting HR</Badge>
              <p className="text-4xl font-bold text-slate-900 dark:text-slate-100">68</p>
              <p className="mt-1 text-sm text-emerald-600">↓ 2 bpm vs last week</p>
              <div className="mt-4 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                <div className="h-2 w-2/3 rounded-full bg-cyan-500" />
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-4 grid gap-4 xl:grid-cols-12">
          <Card className="xl:col-span-8 border-slate-200 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Today</p>
                  <CardTitle className="text-2xl text-slate-900 dark:text-slate-100">Upcoming reminders</CardTitle>
                </div>
                <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-300">
                  <Plus className="mr-1 h-4 w-4" />
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {reminders.map((item) => (
                <div key={`${item.name}-${item.time}`} className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-800/60">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
                    <Pill className="h-4 w-4" />
                  </div>
                  <div className="mr-auto min-w-[140px]">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.time}</p>
                  </div>
                  <Badge variant="outline" className={item.status === 'Due' ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-slate-200 bg-white text-slate-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200'}>
                    {item.status}
                  </Badge>
                  <Button size="sm" className="rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-200">
                    <Check className="mr-1 h-4 w-4" />
                    Mark taken
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="xl:col-span-4 border-slate-200 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl text-slate-900 dark:text-slate-100">Recent insights</CardTitle>
                <Button variant="ghost" size="sm" className="text-slate-500 dark:text-slate-300">
                  All <MoveUpRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {insights.map((item) => (
                <div key={item.title} className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
                    <Badge variant="outline" className={insightBadgeClass(item.type)}>{item.type}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-12">
          <Card className="lg:col-span-8 border-slate-200 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl text-slate-900 dark:text-slate-100">Recent activity</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/history')}>View history</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {activity.map((entry) => (
                <div key={`${entry.when}-${entry.label}`} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div className="mr-auto">
                    <p className="text-xs text-slate-500 dark:text-slate-400">{entry.when}</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{entry.label}</p>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{entry.value}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="lg:col-span-4 border-slate-200 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl text-slate-900 dark:text-slate-100">Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button variant="outline" className="justify-start" onClick={() => navigate('/transcript')}>
                <Radio className="mr-2 h-4 w-4 text-cyan-600" /> Live transcript
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => navigate('/monitor')}>
                <Activity className="mr-2 h-4 w-4 text-emerald-600" /> Log vitals
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => navigate('/chat')}>
                <Sparkles className="mr-2 h-4 w-4 text-blue-600" /> Health chat
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => navigate('/settings')}>
                <Bell className="mr-2 h-4 w-4 text-violet-600" /> Alerts settings
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="mt-4 flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300">
          <span className="inline-flex items-center gap-2"><Heart className="h-4 w-4 text-rose-500" /> Patient-first care</span>
          <span className="inline-flex items-center gap-2"><Clock className="h-4 w-4 text-cyan-600" /> Privacy and security by design</span>
          <span className="inline-flex items-center gap-2"><UserCircle2 className="h-4 w-4 text-emerald-600" /> Clinical support tools</span>
        </section>
      </div>
    </div>
  );
};

export default DashboardContent;
