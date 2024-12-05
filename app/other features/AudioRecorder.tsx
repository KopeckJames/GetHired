import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { toast } from './ui/use-toast';

export function AudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleAnalyzeAudio = async () => {
    if (!audioBlob) return;

    const formData = new FormData();
    formData.append('audio', audioBlob);

    try {
      const response = await fetch('/api/analysis/audio', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze audio');
      }

      const result = await response.json();
      toast({
        title: "Success",
        description: "Audio analysis complete",
      });
      
      // Handle the analysis result (e.g., display transcription and response)
      console.log(result);
    } catch (error) {
      console.error('Error analyzing audio:', error);
      toast({
        title: "Error",
        description: "Failed to analyze audio",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Voice Input</h2>
        <div className="flex gap-2">
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            variant={isRecording ? "destructive" : "default"}
          >
            {isRecording ? "Stop Recording" : "Start Recording"}
          </Button>
          {audioBlob && (
            <Button
              onClick={handleAnalyzeAudio}
              variant="outline"
            >
              Analyze Recording
            </Button>
          )}
        </div>
        {audioBlob && (
          <audio controls src={URL.createObjectURL(audioBlob)} className="w-full" />
        )}
      </div>
    </Card>
  );
}
