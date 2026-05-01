import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Activity, Mic, PlayCircle, Search, UserRound, UsersRound, Video } from 'lucide-react';
import { getAllSessions, getActiveTranscriptSession } from '@/services/transcriptService';

const Transcript = () => {
  const navigate = useNavigate();
  const sessions = getAllSessions();
  const activeSession = getActiveTranscriptSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/40 to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Card className="border-slate-200 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <CardContent className="p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-300">Live Transcript</p>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 sm:text-4xl">Capture every visit with clinical precision.</h1>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Speaker-separated rows, confidence cues, and auto-tagged entities in real time.</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => navigate('/transcript/setup')}>
                  <Video className="mr-2 h-4 w-4" /> Pre-session setup
                </Button>
                <Button className="bg-cyan-600 text-white hover:bg-cyan-700" onClick={() => navigate('/transcript/live')}>
                  <PlayCircle className="mr-2 h-4 w-4" /> Start session
                </Button>
              </div>
            </div>

            {activeSession && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge className="bg-cyan-100 text-cyan-800">Active session</Badge>
                <span className="text-sm text-slate-600 dark:text-slate-300">{activeSession.title} · {activeSession.patient} · {activeSession.status}</span>
                <Button variant="outline" size="sm" onClick={() => navigate('/transcript/live')}>Resume live session</Button>
              </div>
            )}
          </CardContent>
        </Card>

        <section className="mt-4 grid gap-4 lg:grid-cols-12">
          <Card className="lg:col-span-8 border-slate-200 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <CardHeader>
              <CardTitle className="text-xl text-slate-900 dark:text-slate-100">Start a Live Consultation Transcript</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">Real-time entities, suggested diagnoses, and structured notes ready for sign-off.</p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => navigate('/transcript/live')}><Mic className="mr-2 h-4 w-4" /> New session</Button>
                <Button variant="outline" onClick={() => navigate('/transcript/ts1')}>Resume draft</Button>
                <Button variant="outline" onClick={() => navigate('/transcript/live')}>View demo</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-4 border-slate-200 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <CardHeader>
              <CardTitle className="text-xl text-slate-900 dark:text-slate-100">Device check</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2 dark:bg-slate-800/60"><span>Microphone</span><Badge variant="outline">OK</Badge></div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2 dark:bg-slate-800/60"><span>Camera</span><Badge variant="outline">Off</Badge></div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2 dark:bg-slate-800/60"><span>Connection</span><Badge variant="outline">82 ms</Badge></div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2 dark:bg-slate-800/60"><span>Speaker</span><Badge variant="outline">OK</Badge></div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-4 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Sessions</h2>
            <p className="text-sm text-slate-500">{sessions.length} total · {sessions.filter(s => s.status === 'draft').length} draft</p>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            <div className="relative min-w-[250px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input className="pl-9" placeholder="Search transcripts..." />
            </div>
            <Button variant="outline">All</Button>
            <Button variant="outline">Draft</Button>
            <Button variant="outline">Completed</Button>
          </div>

          <div className="space-y-3">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => navigate(`/transcript/${session.id}`)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-cyan-300 hover:bg-cyan-50/40 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-cyan-700 dark:hover:bg-slate-800"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className={
                      session.status === 'draft'
                        ? 'border-amber-200 bg-amber-50 text-amber-700'
                        : session.status === 'live'
                          ? 'border-cyan-200 bg-cyan-50 text-cyan-700'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    }
                  >
                    {session.status}
                  </Badge>
                  <span className="text-xs text-slate-500">{session.duration}</span>
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{session.title}</h3>
                <p className="text-sm text-slate-500">{session.when} · {session.specialty}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <span className="inline-flex items-center gap-1"><UserRound className="h-4 w-4" /> {session.patient}</span>
                  <span className="inline-flex items-center gap-1"><UsersRound className="h-4 w-4" /> {session.doctor}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Signed in as Alex Morgan · Patient</p>
      </main>
    </div>
  );
};

export default Transcript;
