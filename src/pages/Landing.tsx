import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Brain, Clock3, ShieldCheck, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';

const featureList = [
  {
    icon: Brain,
    title: 'Adaptive Medical Reasoning',
    copy: 'MedPal asks targeted follow-up questions so results feel thoughtful, not generic.',
  },
  {
    icon: Clock3,
    title: 'Fast Triage Flow',
    copy: 'Move from symptom entry to guided next steps in minutes with a clear confidence signal.',
  },
  {
    icon: ShieldCheck,
    title: 'Safety-First Language',
    copy: 'Uncertainty, emergency risk, and disclaimers are surfaced clearly in every assessment.',
  },
];

const Landing = () => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-transparent">
      <div className="absolute -top-20 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute top-80 -left-20 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />
      <div className="absolute top-56 -right-20 h-80 w-80 rounded-full bg-sky-400/20 blur-3xl" />

      <header className="sticky top-0 z-40 border-b border-slate-200/70 dark:border-slate-800/80 backdrop-blur-xl bg-white/70 dark:bg-slate-950/70">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-600 to-emerald-500 text-white flex items-center justify-center shadow-md">
              <Stethoscope className="h-4 w-4" />
            </div>
            <span className="text-xl font-semibold text-slate-900 dark:text-slate-100 brand-heading">MedPal</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/auth">
              <Button variant="ghost" className="text-slate-700 dark:text-slate-200">Sign in</Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-cyan-600 dark:hover:bg-cyan-500">
                Open App
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24">
          <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-200/80 bg-white/70 px-4 py-1 text-sm text-cyan-800 backdrop-blur dark:border-cyan-900/70 dark:bg-slate-900/70 dark:text-cyan-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                AI triage experience built for clarity
              </p>
              <h1 className="text-4xl leading-tight text-slate-900 dark:text-slate-100 sm:text-5xl lg:text-6xl">
                A calmer, smarter front door for everyday health decisions.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg">
                MedPal blends conversational symptom checks with safety guardrails so people can
                understand what might be happening and what to do next.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/diagnosis">
                  <Button size="lg" className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-500 text-white">
                    Begin assessment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">
                    View dashboard
                  </Button>
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-cyan-100/80 bg-white/80 p-5 shadow-xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Active consultation</p>
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">Live</span>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="rounded-xl bg-white p-3 text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-200">Symptom summary captured</div>
                  <div className="rounded-xl bg-cyan-600 p-3 text-white shadow-sm">Is the headache worsening when you bend forward?</div>
                  <div className="rounded-xl bg-white p-3 text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-200">No</div>
                </div>
                <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">Results always include confidence and urgent care warnings when risk is high.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <div className="grid gap-4 md:grid-cols-3">
            {featureList.map((feature) => (
              <article
                key={feature.title}
                className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur transition-transform duration-300 hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-900/80"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-cyan-600">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h2 className="mb-2 text-xl text-slate-900 dark:text-slate-100">{feature.title}</h2>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{feature.copy}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Landing;