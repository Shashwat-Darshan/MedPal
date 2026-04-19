
import React from 'react';
import { Stethoscope, Brain, Sparkles, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/Navbar';
import DiagnosticFlow from '@/components/DiagnosticFlow';

const Index = () => {
  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />
      
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-3xl border border-slate-200/80 bg-white/75 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
          <div className="mb-4 flex items-center space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-600 to-emerald-500 text-white shadow-sm">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl text-slate-900 dark:text-slate-100">
                AI Medical Diagnosis
              </h1>
              <p className="mt-1 text-slate-600 dark:text-slate-300">Structured symptom triage with confidence-based outputs</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span>AI Assistant Online</span>
            </div>
            <div className="flex items-center space-x-2">
              <Brain className="h-4 w-4 text-cyan-600" />
              <span>Adaptive Follow-up Questions</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Safety-first Guidance</span>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Clear Confidence Levels</span>
            </div>
          </div>
        </div>

        <DiagnosticFlow />
      </main>
    </div>
  );
};

export default Index;
