import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Share2, Star } from 'lucide-react';
import { useUserHistory } from '@/hooks/useUserHistory';

const TranscriptSummary = () => {
  const navigate = useNavigate();
  const { getLatestReportForUser } = useUserHistory();
  
  // Get the latest diagnosis report to pull summary data from
  const latestReport = useMemo(() => getLatestReportForUser(), [getLatestReportForUser]);
  
  // Create sections from latest report or use demo data
  const sections = latestReport ? [
    { title: 'Chief complaint', value: latestReport.symptoms || 'Patient presenting with recent health concerns' },
    { title: 'Key observations', value: 'Clinical assessment conducted. Comprehensive history and physical examination completed.' },
    { title: 'Probable diagnoses', value: latestReport.diseases.map(d => `${d.name} (${Math.round(d.confidence * 100)}%)`).join(', ') || 'Pending evaluation' },
    { title: 'Medications discussed', value: 'Current medications reviewed. No new prescriptions at this time.' },
    { title: 'Recommended tests', value: 'Laboratory work and imaging as clinically indicated. Follow-up assessment scheduled.' },
    { title: 'Follow-up plan', value: 'Patient educated on diagnosis and management plan. Return visit scheduled in 4 weeks or sooner if symptoms change.' }
  ] : [
    { 
      title: 'Chief complaint', 
      value: 'Afternoon headaches and fatigue; routine 3-month diabetes follow-up' 
    },
    { 
      title: 'Key observations', 
      value: 'Good medication adherence overall with occasional weekend missed doses. Headaches correlate with afternoon work schedule. Recent HbA1c improvement (7.2% → 6.8%) indicates improved glycemic control.' 
    },
    { 
      title: 'Probable diagnoses', 
      value: 'Type 2 Diabetes Mellitus (well-controlled); Tension headaches (likely work-related stress); Fatigue (possibly related to afternoon energy dip)' 
    },
    { 
      title: 'Medications discussed', 
      value: 'Continue metformin 500mg BID. Consider adding evening phone reminder. No new medications at this time.' 
    },
    { 
      title: 'Recommended tests', 
      value: 'HbA1c: 6.8% (improved). Continue monitoring: fasting glucose, lipid panel, renal function. Schedule repeat labs in 3 months.' 
    },
    { 
      title: 'Follow-up plan', 
      value: '3-month follow-up appointment. Patient to set phone reminders for evening dose. Recommend afternoon break/hydration at work. Return if headaches increase or new symptoms develop.' 
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/40 to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Button variant="ghost" onClick={() => navigate('/transcript')} className="mb-3">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to sessions
        </Button>

        <Card className="border-slate-200 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <CardContent className="p-5 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-300">Summary</p>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Session summary</h1>
                <p className="text-sm text-slate-600 dark:text-slate-300">Edit, share, and export your structured visit notes.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export</Button>
                <Button variant="outline" onClick={() => navigate('/history')}><Share2 className="mr-2 h-4 w-4" /> Add to history</Button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button size="sm">Patient</Button>
              <Button size="sm" variant="outline">Clinician</Button>
              <Badge variant="outline">Auto-saved</Badge>
              <Badge variant="outline">12:04 · 8 utterances</Badge>
              <Badge variant="outline" className="inline-flex items-center gap-1"><Star className="h-3 w-3 text-amber-500" /> Transcript quality: 94</Badge>
            </div>
          </CardContent>
        </Card>

        <section className="mt-4 grid gap-4 md:grid-cols-2">
          {sections.map((section) => (
            <Card key={section.title} className="border-slate-200 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-slate-900 dark:text-slate-100">{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 dark:text-slate-300">{section.value}</p>
                <Button variant="ghost" size="sm" className="mt-2 px-0">Edit section</Button>
              </CardContent>
            </Card>
          ))}
        </section>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline">Export transcript</Button>
          <Button variant="outline">Share with patient</Button>
          <Button variant="outline" onClick={() => navigate('/history')}>Add to history</Button>
          <Button className="bg-cyan-600 text-white hover:bg-cyan-700" onClick={() => navigate('/transcript/setup')}>Start follow-up session</Button>
        </div>
      </main>
    </div>
  );
};

export default TranscriptSummary;
