import { useState, useRef, useEffect } from "react";
import Button from "./Button";
import Card from "./Card";
import Select from "./Select";
import Textarea from "./Textarea";
import { MicrophoneIcon, StopIcon } from "@heroicons/react/24/outline";
import type { SerializedDocument } from "~/types/document";

interface AudioRecorderProps {
  resumes: SerializedDocument[];
  jobDescriptions: SerializedDocument[];
}

export default function AudioRecorder({ resumes, jobDescriptions }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [selectedResume, setSelectedResume] = useState("");
  const [selectedJob, setSelectedJob] = useState("");
  const [transcription, setTranscription] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasMediaSupport, setHasMediaSupport] = useState(true);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check for MediaRecorder and getUserMedia support
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      setHasMediaSupport(false);
      setError("Your browser doesn't support audio recording. Please use a modern browser like Chrome, Firefox, or Edge.");
      return;
    }

    // Check if we're on HTTPS or localhost
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      setHasMediaSupport(false);
      setError("Audio recording requires a secure connection (HTTPS). Please access this site over HTTPS.");
      return;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isRecording]);

  const processAudioChunk = async (chunk: Blob) => {
    const formData = new FormData();
    formData.append("audio", chunk);
    formData.append("mode", "respond");
    formData.append("resumeId", selectedResume);
    formData.append("jobDescriptionId", selectedJob);

    try {
      const response = await fetch("/api/voice-notes", {
        method: "POST",
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error("Failed to process audio");
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      setTranscription(prev => prev + " " + result.transcription);
      if (result.response) {
        setResponse(result.response);
      }
    } catch (error) {
      console.error("Error processing audio:", error);
      setError(error instanceof Error ? error.message : "Failed to process audio");
    }
  };

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop the test stream
      return true;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          setError("Microphone access was denied. Please allow microphone access in your browser settings and try again.");
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          setError("No microphone found. Please connect a microphone and try again.");
        } else {
          setError("Error accessing microphone: " + error.message);
        }
      }
      return false;
    }
  };

  const startRecording = async () => {
    if (!selectedResume || !selectedJob) {
      setError("Please select both a resume and job description");
      return;
    }

    if (!hasMediaSupport) {
      return;
    }

    // First request permission
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      return;
    }

    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = async (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
          // Process the chunk immediately
          await processAudioChunk(e.data);
        }
      };

      // Set up periodic data collection
      mediaRecorder.start(3000); // Collect data every 3 seconds
      setIsRecording(true);
      setTranscription("");
      setResponse("");
    } catch (error) {
      console.error("Error accessing microphone:", error);
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          setError("Microphone access was denied. Please allow microphone access in your browser settings and try again.");
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          setError("No microphone found. Please connect a microphone and try again.");
        } else {
          setError("Error accessing microphone: " + error.message);
        }
      } else {
        setError("Could not access microphone. Please check permissions.");
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card variant="bordered" className="p-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Interview Practice</h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Select
              label="Select Resume"
              value={selectedResume}
              onChange={(e) => setSelectedResume(e.target.value)}
              options={[
                { value: "", label: "Select a resume..." },
                ...resumes.map((resume) => ({
                  value: resume.id,
                  label: resume.name,
                })),
              ]}
              disabled={isRecording}
            />
            <Select
              label="Select Job Description"
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              options={[
                { value: "", label: "Select a job description..." },
                ...jobDescriptions.map((job) => ({
                  value: job.id,
                  label: job.name,
                })),
              ]}
              disabled={isRecording}
            />
          </div>
          
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
              {error.includes("microphone access") && (
                <div className="mt-2">
                  <strong>How to fix:</strong>
                  <ol className="list-decimal list-inside mt-1">
                    <li>Click the camera/microphone icon in your browser's address bar</li>
                    <li>Select "Allow" for microphone access</li>
                    <li>Refresh the page and try again</li>
                  </ol>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-4">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              variant={isRecording ? "outline" : "primary"}
              className="flex items-center gap-2"
              disabled={!hasMediaSupport || !selectedResume || !selectedJob || isProcessing}
            >
              {isRecording ? (
                <>
                  <StopIcon className="h-5 w-5" />
                  Stop Recording
                </>
              ) : (
                <>
                  <MicrophoneIcon className="h-5 w-5" />
                  Start Recording
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card variant="bordered" className="p-6">
          <h3 className="text-lg font-semibold mb-4">Question Transcription</h3>
          <Textarea
            value={transcription}
            onChange={() => {}} // Read-only
            placeholder="Question transcription will appear here..."
            textareaClassName="h-[200px]"
            readOnly
          />
        </Card>

        <Card variant="bordered" className="p-6">
          <h3 className="text-lg font-semibold mb-4">AI Response</h3>
          <Textarea
            value={response}
            onChange={() => {}} // Read-only
            placeholder="AI response will appear here..."
            textareaClassName="h-[200px]"
            readOnly
          />
        </Card>
      </div>
    </div>
  );
}
