import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertTriangle, ArrowLeft, Bookmark, Flag, Mic, Pause, Search } from 'lucide-react';

const baseLines = [
  { speaker: 'Dr. Patel', role: 'Doctor', time: '00:00', confidence: 'high', text: 'Good morning Alex. How have you been feeling since our last visit?', tags: [] },
  { speaker: 'Alex', role: 'Patient', time: '00:06', confidence: 'high', text: "Mostly okay, but I've had some headaches in the afternoon and feel tired.", tags: ['symptom: headaches', 'symptom: fatigue'] },
  { speaker: 'Dr. Patel', role: 'Doctor', time: '00:18', confidence: 'high', text: 'Are you still on metformin 500 milligrams twice daily?', tags: ['medication: metformin', 'dosage: 500mg twice daily'] },
  { speaker: 'Alex', role: 'Patient', time: '00:25', confidence: 'medium', text: 'Yes, but I sometimes miss the evening dose.', tags: [] }
];

const TranscriptLive = () => {
  const navigate = useNavigate();
  // TODO: Wire to actual WebSocket/audio capture service
  const state: 'active' | 'drop' | 'recovering' = 'active';
  const [endOpen, setEndOpen] = useState(false);

  const statusLabel = useMemo(() => {
    if (state === 'drop') return 'Connection drop';
    if (state === 'recovering') return 'Recovering';
    return 'Recording';
  }, [state]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/40 to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Button variant="ghost" onClick={() => navigate('/transcript')} className="mb-3">
          <ArrowLeft className="mr-2 h-4 w-4" /> Exit to sessions
        </Button>

        <Card className="border-slate-200 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-rose-100 text-rose-700">{statusLabel}</Badge>
              <span className="text-sm text-slate-500">00:42</span>
              <Badge variant="outline">Strong · 82ms</Badge>
              <Badge variant="outline">Consent · Encrypted</Badge>
              <Badge variant="outline">Clinician view</Badge>
            </div>
          </CardContent>
        </Card>

        <section className="mt-4 grid gap-4 lg:grid-cols-12">
          <Card className="lg:col-span-8 border-slate-200 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <CardContent className="p-4">
              <div className="mb-3 flex flex-wrap gap-2">
                <div className="relative min-w-[240px] flex-1">
                  <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input placeholder="Search in transcript..." className="pl-9" />
                </div>
                <Button variant="outline">Auto-scroll</Button>
              </div>

              {state === 'drop' && (
                <div className="mb-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  Connection drop - buffering locally. We will resume automatically.
                </div>
              )}

              {baseLines.map((line, index) => (
                <button key={`${line.time}-${index}`} className="mb-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-left dark:border-slate-700 dark:bg-slate-800/60">
                  <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-medium text-slate-800 dark:text-slate-100">{line.speaker}</span>
                    <span>{line.role}</span>
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
                </button>
              ))}

              <p className="mt-2 text-sm text-slate-500">Listening...</p>
            </CardContent>
          </Card>

          <Card className="lg:col-span-4 border-slate-200 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <CardContent className="p-4">
              <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">Clinical context</h2>
              <div className="space-y-3 text-sm">
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60"><p className="font-medium">Key points</p><p className="text-slate-500">Headaches, fatigue, evening dose missed.</p></div>
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60"><p className="font-medium">Medication mentions</p><p className="text-slate-500">Metformin 500mg BID</p></div>
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60"><p className="font-medium">Action checklist</p><p className="text-slate-500">HbA1c, BMP, follow-up in 2 weeks</p></div>
                <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-800"><p className="inline-flex items-center gap-1 font-medium"><AlertTriangle className="h-4 w-4" /> Risk flag</p><p className="text-sm">Polydipsia mention requires review.</p></div>
              </div>
            </CardContent>
          </Card>
        </section>

        <Card className="mt-4 border-slate-200 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <CardContent className="flex flex-wrap items-center gap-2 p-3">
            <Button variant="outline"><Pause className="mr-2 h-4 w-4" /> Pause</Button>
            <Button variant="outline"><Mic className="mr-2 h-4 w-4" /> Add note</Button>
            <Button variant="outline"><Bookmark className="mr-2 h-4 w-4" /> Mark</Button>
            <Button variant="outline"><Flag className="mr-2 h-4 w-4" /> Flag</Button>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-slate-500">2/8 · 25%</span>
              <Button className="bg-rose-600 text-white hover:bg-rose-700" onClick={() => setEndOpen(true)}>End</Button>
            </div>
          </CardContent>
        </Card>

        <Dialog open={endOpen} onOpenChange={setEndOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Wrap up this session?</DialogTitle>
              <DialogDescription>You can review and edit the summary in the next step.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-800"><p className="text-slate-500">Duration</p><p className="font-semibold">00:53</p></div>
              <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-800"><p className="text-slate-500">Completeness</p><p className="font-semibold">75%</p></div>
            </div>
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-2 text-sm text-amber-800">2 unsaved annotations will be lost if you discard.</div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEndOpen(false)}>Continue</Button>
              <Button variant="outline">Save draft</Button>
              <Button onClick={() => navigate('/transcript/summary')}>End and summarize</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default TranscriptLive;
