/* Client-side transcription provider helper.
   This module implements a thin client that sends audio blobs to a server-side
   proxy at `/api/transcribe`. The server-side proxy should accept audio chunks
   and forward them to the chosen transcription provider (OpenAI/Whisper/Google/etc.).

   This client is intentionally simple and tolerant: if no server is available,
   calls will fail gracefully and the app will keep working with the browser
   SpeechRecognition fallback.
*/

export interface ProviderSession {
  id: string;
  provider: string;
  startedAt: string;
}

export async function createProviderSession(provider = 'default'): Promise<ProviderSession | null> {
  try {
    const resp = await fetch(`/api/transcribe/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider }),
    });

    if (!resp.ok) return null;
    return await resp.json();
  } catch (err) {
    console.warn('createProviderSession failed', err);
    return null;
  }
}

export async function sendAudioChunk(sessionId: string, chunk: Blob): Promise<any> {
  try {
    const form = new FormData();
    form.append('audio', chunk, 'chunk.webm');

    const resp = await fetch(`/api/transcribe/session/${encodeURIComponent(sessionId)}/chunk`, {
      method: 'POST',
      body: form,
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`transcribe chunk failed: ${resp.status} ${text}`);
    }

    return await resp.json();
  } catch (err) {
    console.warn('sendAudioChunk failed', err);
    return null;
  }
}

export async function finalizeProviderSession(sessionId: string): Promise<any> {
  try {
    const resp = await fetch(`/api/transcribe/session/${encodeURIComponent(sessionId)}/finalize`, {
      method: 'POST',
    });

    if (!resp.ok) return null;
    return await resp.json();
  } catch (err) {
    console.warn('finalizeProviderSession failed', err);
    return null;
  }
}

export default { createProviderSession, sendAudioChunk, finalizeProviderSession };
