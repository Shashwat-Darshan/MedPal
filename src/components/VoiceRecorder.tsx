
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff, Volume2 } from 'lucide-react';

interface VoiceRecorderProps {
  onTranscript: (transcript: string) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscript }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string>('');
  const [transcript, setTranscript] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        
        // Use mock transcription (transcription service removed)
        setIsTranscribing(true);
        try {
          console.log('Using mock transcription...');
          // Simulate processing time
          await new Promise(resolve => setTimeout(resolve, 2000));
          const mockTranscript = "I have been experiencing a runny nose, cough, and feeling tired for the past 3 days.";
          setTranscript(mockTranscript);
          onTranscript(mockTranscript);
          console.log('Mock transcription complete:', mockTranscript);
        } catch (error) {
          console.error('Mock transcription error:', error);
          const fallbackTranscript = "I have symptoms I'd like to discuss.";
          setTranscript(fallbackTranscript);
          onTranscript(fallbackTranscript);
        } finally {
          setIsTranscribing(false);
        }

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playAudio = () => {
    if (audioURL) {
      const audio = new Audio(audioURL);
      audio.play();
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-4">
            {!isRecording ? (
              <Button
                onClick={startRecording}
                className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-full"
                size="lg"
                disabled={isTranscribing}
              >
                <Mic className="h-6 w-6 mr-2" />
                {isTranscribing ? 'Processing...' : 'Start Recording'}
              </Button>
            ) : (
              <Button
                onClick={stopRecording}
                className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-4 rounded-full animate-pulse"
                size="lg"
              >
                <MicOff className="h-6 w-6 mr-2" />
                Stop Recording
              </Button>
            )}
          </div>

          {isRecording && (
            <div className="text-center">
              <div className="flex justify-center space-x-1 mb-2">
                <div className="w-3 h-8 bg-red-500 rounded animate-pulse"></div>
                <div className="w-3 h-6 bg-red-400 rounded animate-pulse" style={{animationDelay: '0.1s'}}></div>
                <div className="w-3 h-10 bg-red-500 rounded animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="w-3 h-7 bg-red-400 rounded animate-pulse" style={{animationDelay: '0.3s'}}></div>
                <div className="w-3 h-9 bg-red-500 rounded animate-pulse" style={{animationDelay: '0.4s'}}></div>
              </div>
              <p className="text-sm text-gray-600">Recording... Speak clearly about your symptoms</p>
            </div>
          )}

          {isTranscribing && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-blue-600">Processing audio...</p>
            </div>
          )}

          {audioURL && !isTranscribing && (
            <div className="space-y-3">
              <div className="flex justify-center">
                <Button
                  onClick={playAudio}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Volume2 className="h-4 w-4" />
                  <span>Play Recording</span>
                </Button>
              </div>
              
              {transcript && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-900 mb-1">Sample Transcription:</p>
                  <p className="text-blue-800">{transcript}</p>
                </div>
              )}
            </div>
          )}

          <div className="text-center text-xs text-gray-500">
            <p>Mock transcription for demo • Real transcription service can be added</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceRecorder;
