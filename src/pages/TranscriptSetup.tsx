import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';

const TranscriptSetup = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/40 to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Button variant="ghost" onClick={() => navigate('/transcript')} className="mb-3">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to transcripts
        </Button>

        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-300">Pre-session</p>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Confirm visit details</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Review participants, metadata, and consent before going live.</p>
        </div>

        <section className="grid gap-4 lg:grid-cols-12">
          <Card className="lg:col-span-7 border-slate-200 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <CardHeader>
              <CardTitle>Participants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
                <div className="mb-1 flex items-center justify-between">
                  <p className="font-medium">Doctor: Dr. Priya Patel</p>
                  <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700"><CheckCircle2 className="mr-1 h-3 w-3" /> Verified</Badge>
                </div>
                <p className="text-sm text-slate-500">Endocrinology · License CA 12345</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
                <div className="mb-1 flex items-center justify-between">
                  <p className="font-medium">Patient: Alex Morgan</p>
                  <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700"><CheckCircle2 className="mr-1 h-3 w-3" /> Verified</Badge>
                </div>
                <p className="text-sm text-slate-500">DOB 1989-04-12 · MRN 008421</p>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-5 border-slate-200 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <CardHeader>
              <CardTitle>Visit details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Visit reason</Label>
                <Select defaultValue="follow-up">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="follow-up">Follow-up</SelectItem>
                    <SelectItem value="new-symptoms">New symptoms</SelectItem>
                    <SelectItem value="med-review">Medication review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Specialty</Label>
                <Select defaultValue="endo">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="endo">Endocrinology</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="neuro">Neurology</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Appointment type</Label>
                <Select defaultValue="in-person">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-person">In-person</SelectItem>
                    <SelectItem value="telehealth">Telehealth</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notes for clinician</Label>
                <Input placeholder="Anything we should know?" />
              </div>
            </CardContent>
          </Card>
        </section>

        <Card className="mt-4 border-slate-200 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <CardContent className="p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h2 className="inline-flex items-center gap-2 text-base font-semibold"><ShieldCheck className="h-4 w-4 text-cyan-600" /> Recording and consent notice</h2>
              <Badge variant="outline">HIPAA · BAA covered</Badge>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">By starting this session, both participants consent to creating a written transcript. Transcripts are encrypted at rest and visible to authorized care team members only.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline">I have obtained verbal consent</Button>
              <Button variant="outline">Also retain audio recording (optional)</Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={() => navigate('/transcript')}>Cancel</Button>
          <Button variant="outline">Save as draft</Button>
          <Button className="bg-cyan-600 text-white hover:bg-cyan-700" onClick={() => navigate('/transcript/live')}>Start Live Transcript</Button>
        </div>
      </main>
    </div>
  );
};

export default TranscriptSetup;
