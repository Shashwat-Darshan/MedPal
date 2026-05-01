import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, ArrowLeft, Bookmark, Flag, MicOff, Pause, Play, Search, Sparkles, Users } from 'lucide-react';
import {
  appendTranscriptLine,
  clearActiveTranscriptSession,
  createNewSession,
  finalizeTranscriptSession,
  formatTranscriptDuration,
  getActiveTranscriptSession,
  getSession,
  getTranscriptContext,
  getTranscriptSummaryFromLines,
  saveSession,
  setActiveTranscriptSession,
  tagTranscriptText,
  type TranscriptLine,
  type TranscriptSession,
} from '@/services/transcriptService';
import {
  createProviderSession,
  sendAudioChunk,
  finalizeProviderSession,
} from '@/services/transcriptionProvider';

type SpeakerRole = 'Doctor' | 'Patient';
type RecordingState = 'idle' | 'recording' | 'recovering' | 'error';

interface SpeechRecognitionAlternativeLike {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultLike extends ArrayLike<SpeechRecognitionAlternativeLike> {
  isFinal: boolean;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string; message?: string }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

interface SpeechRecognitionConstructorLike {
  new (): SpeechRecognitionLike;
}

const getSpeechRecognitionConstructor = (): SpeechRecognitionConstructorLike | null => {
  const browserWindow = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructorLike;
    webkitSpeechRecognition?: SpeechRecognitionConstructorLike;
  };

  return browserWindow.SpeechRecognition || browserWindow.webkitSpeechRecognition || null;
};

const speakerLabel = (role: SpeakerRole) => (role === 'Doctor' ? 'Clinician speaking' : 'Patient speaking');

const createTranscriptLine = (speaker: SpeakerRole, text: string, elapsedMs: number): TranscriptLine => ({
  speaker: speaker === 'Doctor' ? 'Dr. Patel' : 'Alex',
  role: speaker,
  time: formatTranscriptDuration(elapsedMs),
  confidence: 'high',
  text,
  tags: tagTranscriptText(text),
});

const TranscriptLive = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const microphoneStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const providerSessionRef = useRef<string | null>(null);
  const liveSessionRef = useRef<TranscriptSession | null>(null);
  const currentSpeakerRef = useRef<SpeakerRole>('Doctor');
  const recordingStartedAtRef = useRef<number>(Date.now());
  const isRecordingRef = useRef(false);
  const restartTimerRef = useRef<number | null>(null);

  const [session, setSession] = useState<TranscriptSession | null>(null);
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [currentSpeaker, setCurrentSpeaker] = useState<SpeakerRole>('Doctor');
  const [elapsedMs, setElapsedMs] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [manualTranscript, setManualTranscript] = useState('');
  const [endOpen, setEndOpen] = useState(false);
  const [recognitionSupported, setRecognitionSupported] = useState(true);
  const [useProvider, setUseProvider] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('default');
  const [providerState, setProviderState] = useState<'idle' | 'streaming' | 'error'>('idle');

  useEffect(() => {
    currentSpeakerRef.current = currentSpeaker;
  }, [currentSpeaker]);

  useEffect(() => {
    const navigationState = location.state as { sessionId?: string } | null;
    const existingSession = getActiveTranscriptSession() || (navigationState?.sessionId ? getSession(navigationState.sessionId) : null);
    const nextSession =
      existingSession ||
      createNewSession({
        status: 'live',
        when: 'Now',
        title: 'Live Consultation',
        specialty: 'General',
        patient: 'Alex Morgan',
        doctor: 'Dr. Priya Patel',
        consented: true,
      });

    if (!existingSession) {
      saveSession(nextSession);
      setActiveTranscriptSession(nextSession.id);
    }

    liveSessionRef.current = nextSession;
    setSession(nextSession);
    setRecognitionSupported(Boolean(getSpeechRecognitionConstructor()));

    return () => {
      if (restartTimerRef.current) {
        window.clearTimeout(restartTimerRef.current);
      }
      microphoneStreamRef.current?.getTracks().forEach((track) => track.stop());
      recognitionRef.current?.abort();
    };
  }, [location.state]);

  useEffect(() => {
    if (recordingState !== 'recording' && recordingState !== 'recovering') {
      setElapsedMs(0);
      return;
    }

    const timerId = window.setInterval(() => {
      setElapsedMs(Date.now() - recordingStartedAtRef.current);
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [recordingState]);

  const transcriptLines = useMemo(() => session?.lines ?? [], [session?.lines]);
  const transcriptSummary = useMemo(() => getTranscriptSummaryFromLines(transcriptLines), [transcriptLines]);
  const transcriptContext = useMemo(() => getTranscriptContext(transcriptLines), [transcriptLines]);

  const filteredLines = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return transcriptLines;
    }

    return transcriptLines.filter((line) => {
      const haystack = `${line.speaker} ${line.role} ${line.text} ${line.tags.join(' ')}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [searchTerm, transcriptLines]);

  const speakerColorClass = (role: SpeakerRole) => (role === 'Doctor' ? 'ring-cyan-300 dark:ring-cyan-700 bg-cyan-50 dark:bg-cyan-900/40' : 'ring-amber-300 dark:ring-amber-700 bg-amber-50 dark:bg-amber-900/40');

  const displayDuration = recordingState === 'recording' || recordingState === 'recovering'
    ? formatTranscriptDuration(elapsedMs)
    : session?.duration || '00:00';

  const recognitionStatusLabel = !recognitionSupported
    ? 'Browser speech recognition unavailable'
    : recordingState === 'error'
      ? 'Recording error'
      : recordingState === 'recovering'
        ? 'Recovering'
        : recordingState === 'recording'
          ? 'Recording'
          : 'Paused';

  const clearLiveResources = () => {
    microphoneStreamRef.current?.getTracks().forEach((track) => track.stop());
    microphoneStreamRef.current = null;
  };

  const stopRecognition = () => {
    isRecordingRef.current = false;
    setRecordingState('idle');
    recognitionRef.current?.stop();
    clearLiveResources();
  };

  const stopProviderStreaming = async () => {
    setProviderState('idle');
    try {
      mediaRecorderRef.current?.stop();
      if (providerSessionRef.current) {
        await finalizeProviderSession(providerSessionRef.current);
      }
    } catch (err) {
      console.warn('stopProviderStreaming', err);
      setProviderState('error');
    } finally {
      providerSessionRef.current = null;
      mediaRecorderRef.current = null;
      clearLiveResources();
    }
  };

  const startProviderStreaming = async () => {
    const nextSession = liveSessionRef.current;
    if (!nextSession) return;

    if (!navigator.mediaDevices?.getUserMedia) {
      setProviderState('error');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      microphoneStreamRef.current = stream;

      const MediaRecorderCtor = (window as any).MediaRecorder as typeof MediaRecorder | undefined;
      if (!MediaRecorderCtor) {
        setProviderState('error');
        return;
      }

      const recorder = new MediaRecorderCtor(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = recorder;

      const providerSession = await createProviderSession(selectedProvider);
      if (!providerSession) {
        setProviderState('error');
        return;
      }

      providerSessionRef.current = providerSession.id;
      setProviderState('streaming');

      recorder.ondataavailable = async (ev: BlobEvent) => {
        if (!ev.data || ev.data.size === 0) return;

        try {
          const result = await sendAudioChunk(providerSession.id, ev.data);
          // If the provider returns interim/final transcripts, append them.
          if (result?.text) {
            const finalLine = createTranscriptLine(currentSpeakerRef.current, String(result.text), Date.now() - recordingStartedAtRef.current);
            const updatedSession = appendTranscriptLine(nextSession.id, finalLine);

            if (updatedSession) {
              liveSessionRef.current = updatedSession;
              setSession(updatedSession);
            }
          }
        } catch (err) {
          console.warn('chunk send failed', err);
          setProviderState('error');
        }
      };

      recorder.onerror = (e) => {
        console.warn('media recorder error', e);
        setProviderState('error');
      };

      recorder.start(1500); // emit chunks every ~1.5s
    } catch (err) {
      console.warn('startProviderStreaming failed', err);
      setProviderState('error');
      clearLiveResources();
    }
  };

  const appendManualTranscript = () => {
    const nextSession = liveSessionRef.current;
    const trimmedTranscript = manualTranscript.trim();

    if (!nextSession || !trimmedTranscript) {
      return;
    }

    const manualLine = createTranscriptLine(currentSpeakerRef.current, trimmedTranscript, Date.now() - recordingStartedAtRef.current);
    const updatedSession = appendTranscriptLine(nextSession.id, manualLine);

    if (updatedSession) {
      liveSessionRef.current = updatedSession;
      setSession(updatedSession);
    }

    setManualTranscript('');
    setInterimTranscript('');
  };

  const startRecognition = async () => {
    const nextSession = liveSessionRef.current;

    if (!nextSession) {
      return;
    }

    const recognitionConstructor = getSpeechRecognitionConstructor();

    if (!recognitionConstructor) {
      setRecognitionSupported(false);
      setRecordingState('error');
      return;
    }

    try {
      if (navigator.mediaDevices?.getUserMedia) {
        microphoneStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
    } catch {
      setRecordingState('error');
      clearLiveResources();
      return;
    }

    const recognition = recognitionRef.current || new recognitionConstructor();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      isRecordingRef.current = true;
      setRecordingState('recording');
      recordingStartedAtRef.current = Date.now();
      setElapsedMs(0);
    };

    recognition.onresult = (event) => {
      let interimText = '';

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const alternative = result[0];

        if (!alternative) {
          continue;
        }

        const transcriptText = alternative.transcript.trim();

        if (!transcriptText) {
          continue;
        }

        if (result.isFinal) {
          const finalLine = createTranscriptLine(currentSpeakerRef.current, transcriptText, Date.now() - recordingStartedAtRef.current);
          const updatedSession = appendTranscriptLine(nextSession.id, finalLine);

          if (updatedSession) {
            liveSessionRef.current = updatedSession;
            setSession(updatedSession);
          }

          interimText = '';
          continue;
        }

        interimText = transcriptText;
      }

      setInterimTranscript(interimText);
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech' || event.error === 'aborted') {
        setRecordingState('recovering');
        return;
      }

      setRecordingState('error');
      isRecordingRef.current = false;
      clearLiveResources();
    };

    recognition.onend = () => {
      if (!isRecordingRef.current) {
        setRecordingState('idle');
        return;
      }

      setRecordingState('recovering');

      if (restartTimerRef.current) {
        window.clearTimeout(restartTimerRef.current);
      }

      restartTimerRef.current = window.setTimeout(() => {
        if (!isRecordingRef.current) {
          return;
        }

        try {
          recognition.start();
          setRecordingState('recording');
        } catch {
          setRecordingState('error');
          isRecordingRef.current = false;
          clearLiveResources();
        }
      }, 250);
    };

    try {
      isRecordingRef.current = true;
      setRecordingState('recording');
      recognition.start();
    } catch {
      setRecordingState('error');
      isRecordingRef.current = false;
      clearLiveResources();
    }
  };

  const toggleRecording = () => {
    if (useProvider) {
      if (providerState === 'streaming') {
        void stopProviderStreaming();
        return;
      }

      void startProviderStreaming();
      return;
    }

    if (recordingState === 'recording' || recordingState === 'recovering') {
      stopRecognition();
      return;
    }

    void startRecognition();
  };

  const handleEndSession = () => {
    if (!session) {
      return;
    }

    stopRecognition();

    const completedSession = finalizeTranscriptSession(session.id);
    if (completedSession) {
      liveSessionRef.current = completedSession;
      setSession(completedSession);
    }

    clearActiveTranscriptSession();
    navigate('/transcript/summary');
  };

  const saveDraft = () => {
    if (session) {
      saveSession(session);
    }

    setEndOpen(false);
  };

  const statusTone = recordingState === 'error' ? 'destructive' : recordingState === 'recovering' ? 'secondary' : 'default';

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
              <Badge variant={statusTone}>{recognitionStatusLabel}</Badge>
              <span className="text-sm text-slate-500">{displayDuration}</span>
              <Badge variant="outline">{autoScroll ? 'Auto-scroll on' : 'Auto-scroll off'}</Badge>
              <Badge variant="outline">Consent · Encrypted</Badge>
              <Badge variant="outline">{speakerLabel(currentSpeaker)}</Badge>
              <Badge variant="outline">{recognitionSupported ? 'Speech recognition ready' : 'Speech recognition unavailable'}</Badge>
              {useProvider && (
                <Badge variant={providerState === 'error' ? 'destructive' : providerState === 'streaming' ? 'outline' : 'secondary'}>
                  {providerState === 'streaming' ? 'Provider streaming' : providerState === 'error' ? 'Provider error' : 'Provider ready'}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <section className="mt-4 grid gap-4 lg:grid-cols-12">
          <Card className="lg:col-span-8 border-slate-200 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <CardContent className="p-4">
              <div className="mb-3 flex flex-wrap gap-2">
                <div className="relative min-w-[240px] flex-1">
                  <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search in transcript..." className="pl-9" />
                </div>
                <Button variant="outline" onClick={() => setAutoScroll((current) => !current)}>{autoScroll ? 'Auto-scroll on' : 'Auto-scroll off'}</Button>
                <Button variant="outline" onClick={() => setCurrentSpeaker((current) => (current === 'Doctor' ? 'Patient' : 'Doctor'))}>
                  <Users className="mr-2 h-4 w-4" /> Switch speaker
                </Button>
                <div className="ml-auto flex items-center gap-2">
                  <label className="text-sm text-slate-500">Provider mode</label>
                  <select value={selectedProvider} onChange={(e) => setSelectedProvider(e.target.value)} className="rounded border bg-white px-2 py-1 text-sm">
                    <option value="default">Default</option>
                    <option value="openai">OpenAI</option>
                    <option value="google">Google</option>
                  </select>
                  <Button variant="outline" onClick={() => setUseProvider((v) => !v)} className={useProvider ? 'bg-cyan-100 dark:bg-cyan-700' : ''}>{useProvider ? 'Using provider' : 'Browser only'}</Button>
                </div>
              </div>

              {!recognitionSupported && (
                <div className="mb-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  This browser does not expose the Web Speech API. Live transcription cannot start here.
                </div>
              )}

              {recordingState === 'error' && (
                <div className="mb-3 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  Recording failed. Check microphone permissions and try again.
                </div>
              )}

              {recordingState === 'recovering' && (
                <div className="mb-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  Speech recognition paused briefly. We are attempting to reconnect.
                </div>
              )}

              <div className="space-y-2">
                {filteredLines.map((line, index) => {
                  const isCurrentSpeaker = line.role === currentSpeaker;
                  return (
                    <button
                      key={`${line.time}-${index}`}
                      className={`w-full rounded-xl border p-3 text-left transition-colors duration-150 ${isCurrentSpeaker ? speakerColorClass(line.role) + ' border-2' : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60'}`}
                    >
                      <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-medium text-slate-800 dark:text-slate-100">{line.speaker}</span>
                        <span className="px-2 text-[10px] font-semibold uppercase tracking-wide text-slate-600">{line.role}</span>
                        <span>· {line.time}</span>
                        <Badge variant="outline">{line.confidence}</Badge>
                        {isCurrentSpeaker && <Badge className="ml-2" variant="secondary">Speaking now</Badge>}
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-200">{line.text}</p>
                      {line.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {line.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="border-cyan-200 bg-cyan-50 text-cyan-700">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {interimTranscript && (
                <div className="mt-3 rounded-xl border border-dashed border-cyan-300 bg-cyan-50 p-3 text-sm text-cyan-900 dark:border-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-100">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em]">Live draft</p>
                  <p>{interimTranscript}</p>
                </div>
              )}

              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Manual fallback</p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    value={manualTranscript}
                    onChange={(event) => setManualTranscript(event.target.value)}
                    placeholder={recognitionSupported ? 'Type a line if you want to capture it manually...' : 'Type a line to capture manually...'}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        appendManualTranscript();
                      }
                    }}
                  />
                  <Button variant="outline" onClick={appendManualTranscript}>Add line</Button>
                </div>
              </div>

              {filteredLines.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/60">
                  No transcript lines yet. Click Start to begin capturing speech.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-4 border-slate-200 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Clinical context</h2>
                <Badge variant="outline" className="inline-flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Live summary
                </Badge>
              </div>
              <div className="space-y-3 text-sm">
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
                  <p className="font-medium">Session</p>
                  <p className="text-slate-500">{session?.title || 'Live consultation'} · {session?.specialty || 'General'}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
                  <p className="font-medium">Key points</p>
                  <p className="text-slate-500">{transcriptContext.keyPoints}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
                  <p className="font-medium">Medication mentions</p>
                  <p className="text-slate-500">{transcriptContext.medicationMentions}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
                  <p className="font-medium">Action checklist</p>
                  <p className="text-slate-500">{transcriptContext.actionChecklist}</p>
                </div>
                <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-800">
                  <p className="inline-flex items-center gap-1 font-medium"><AlertTriangle className="h-4 w-4" /> Risk flag</p>
                  <p className="text-sm">{transcriptContext.riskFlag}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
                  <p className="font-medium">Auto summary snapshot</p>
                  <p className="text-slate-500">{transcriptSummary.followUp || 'The summary will populate as the session progresses.'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <Card className="mt-4 border-slate-200 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <CardContent className="flex flex-wrap items-center gap-2 p-3">
            <Button variant="outline" onClick={toggleRecording} disabled={!recognitionSupported}>
              {recordingState === 'recording' || recordingState === 'recovering' ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
              {recordingState === 'recording' || recordingState === 'recovering' ? 'Pause' : 'Start'}
            </Button>
            <Button variant="outline" onClick={stopRecognition} disabled={recordingState === 'idle'}>
              <MicOff className="mr-2 h-4 w-4" /> Pause capture
            </Button>
            <Button variant="outline"><Bookmark className="mr-2 h-4 w-4" /> Mark</Button>
            <Button variant="outline"><Flag className="mr-2 h-4 w-4" /> Flag</Button>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-slate-500">{filteredLines.length}/{transcriptLines.length} lines · {Math.round((filteredLines.length / Math.max(transcriptLines.length, 1)) * 100)}%</span>
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
              <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-800"><p className="text-slate-500">Duration</p><p className="font-semibold">{displayDuration}</p></div>
              <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-800"><p className="text-slate-500">Completeness</p><p className="font-semibold">{Math.max(10, Math.min(100, transcriptLines.length * 12))}%</p></div>
            </div>
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-2 text-sm text-amber-800">Finalizing will save the transcript to history and open the structured summary.</div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEndOpen(false)}>Continue</Button>
              <Button variant="outline" onClick={saveDraft}>Save draft</Button>
              <Button onClick={handleEndSession}>End and summarize</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default TranscriptLive;
