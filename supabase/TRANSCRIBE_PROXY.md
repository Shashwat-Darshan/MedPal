# Transcription Proxy (example)

This file shows a minimal example of a server-side proxy endpoint that accepts audio chunk uploads
and forwards them to a transcription provider (for example OpenAI/Whisper or Google Speech-to-Text).

This repository does not include an active backend by default. The client `src/services/transcriptionProvider.ts`
POSTs to `/api/transcribe/...`. You can implement `/api/transcribe` as an Edge Function, Supabase function
or simple server endpoint. The example below is Node/Express-like pseudocode.

Example (Node / Express):

```js
// POST /api/transcribe/session
app.post('/api/transcribe/session', async (req, res) => {
  const { provider } = req.body;
  const sessionId = generateId();
  // store session metadata in your DB if needed
  res.json({ id: sessionId, provider, startedAt: new Date().toISOString() });
});

// POST /api/transcribe/session/:id/chunk
app.post('/api/transcribe/session/:id/chunk', upload.single('audio'), async (req, res) => {
  const { id } = req.params;
  const audioBuffer = req.file.buffer; // raw audio bytes

  // forward to transcription provider - this depends on provider API
  // e.g., for OpenAI whisper-like endpoints, send as multipart or base64
  const providerResult = await forwardToProvider(audioBuffer);

  // respond with any partial transcript the provider returns
  res.json({ text: providerResult?.text ?? null });
});

// POST /api/transcribe/session/:id/finalize
app.post('/api/transcribe/session/:id/finalize', async (req, res) => {
  // finalize aggregation, return final transcript
  const finalTranscript = await finalizeForSession(req.params.id);
  res.json({ text: finalTranscript });
});
```

Security note: Keep provider API keys on the server. Do not call provider APIs directly from browser code.
