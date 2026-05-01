import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Share2 } from 'lucide-react';
import { getSession } from '@/services/transcriptService';

const TranscriptDetail = () => {
  const navigate = useNavigate();
  const { transcriptId } = useParams();
  
  // Get session data from mock service
  const session = useMemo(() => 
    transcriptId ? getSession(transcriptId) : null,
    [transcriptId]
  );
  
  const lines = session?.lines || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/40 to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Button variant="ghost" onClick={() => navigate('/transcript')} className="mb-3">
          <ArrowLeft className="mr-2 h-4 w-4" /> All transcripts
        </Button>

        <Card className="border-slate-200 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <CardContent className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{session?.specialty || 'General'}</p>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{session?.title || `Transcript #${transcriptId}`}</h1>
                <p className="text-sm text-slate-600 dark:text-slate-300">{session?.when} · {session?.duration} · {session?.status}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline"><Share2 className="mr-2 h-4 w-4" /> Share</Button>
                <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export</Button>
                <Button onClick={() => navigate('/transcript/summary')}>Open summary</Button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <a href="#history" className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">History</a>
              <a href="#symptoms" className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">Symptoms</a>
              <a href="#meds" className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">Meds</a>
              <a href="#plan" className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">Plan</a>
            </div>
          </CardContent>
        </Card>

        <section className="mt-4 grid gap-4 lg:grid-cols-12">
          <Card className="lg:col-span-8 border-slate-200 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <CardHeader>
              <CardTitle>Transcript</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {lines.map((line, i) => (
                <div key={`${line.time}-${i}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
                  <div className="mb-1 flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-medium text-slate-900 dark:text-slate-100">{line.speaker}</span>
                    <span>· {line.time}</span>
                    <Badge variant="outline">{line.confidence}</Badge>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-200">{line.text}</p>
                  {line.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {line.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="border-cyan-200 bg-cyan-50 text-cyan-700">{tag}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="lg:col-span-4 border-slate-200 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <CardHeader>
              <CardTitle>Session details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800/60">
                <p className="font-medium">Patient</p>
                <p className="text-slate-500">{session?.patient || 'Unknown'}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800/60">
                <p className="font-medium">Clinician</p>
                <p className="text-slate-500">{session?.doctor || 'Unknown'}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800/60">
                <p className="font-medium">Duration</p>
                <p className="text-slate-500">{session?.duration || '00:00'}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
                Transcript lines: {lines.length} · Confidence: High
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default TranscriptDetail;
