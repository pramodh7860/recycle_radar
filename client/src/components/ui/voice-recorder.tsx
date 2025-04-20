import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Play, Square, Trash2 } from "lucide-react";
import { startRecording, stopRecording, createAudioUrl, generateWaveform } from "@/lib/voice-recorder";

interface VoiceRecorderProps {
  onRecordingComplete?: (audioBlob: Blob, transcription: string) => void;
  className?: string;
}

const VoiceRecorder = ({ onRecordingComplete, className }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [transcription, setTranscription] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement>(null);
  const durationTimerRef = useRef<number | null>(null);

  // Clean up resources on unmount
  useEffect(() => {
    return () => {
      if (durationTimerRef.current) {
        window.clearInterval(durationTimerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // Start recording
  const handleStartRecording = async () => {
    try {
      await startRecording();
      setIsRecording(true);
      setRecordingDuration(0);
      
      // Start duration timer
      durationTimerRef.current = window.setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  // Stop recording
  const handleStopRecording = async () => {
    if (!isRecording) return;
    
    try {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
      
      const { audioBlob } = await stopRecording();
      setRecordedAudio(audioBlob);
      
      // Create URL for audio playback
      const url = createAudioUrl(audioBlob);
      setAudioUrl(url);
      
      // Generate waveform data for visualization
      const waveform = await generateWaveform(audioBlob, 40);
      setWaveformData(waveform);
      
      // Simulate transcription (in a real app, this would call a speech-to-text API)
      simulateTranscription();
      
      setIsRecording(false);
      
      // Notify parent component
      if (onRecordingComplete) {
        onRecordingComplete(audioBlob, transcription);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setIsRecording(false);
    }
  };

  // Reset recorder
  const handleReset = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    
    setRecordedAudio(null);
    setAudioUrl(null);
    setWaveformData([]);
    setTranscription("");
  };

  // Toggle audio playback
  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };

  // Simulate transcription - in a real app this would use a speech-to-text API
  const simulateTranscription = () => {
    const mockTranscriptions = [
      "10 kilograms of mixed plastic waste collected from Zone 3, mostly PET bottles and HDPE containers.",
      "About 5 kilograms of paper waste and cardboard collected from the central market area.",
      "Collected approximately 8 kilograms of glass bottles from the residential zone.",
      "E-waste collection of about 3 kilograms including old mobile phones and small electronics.",
      "Mixed recyclable materials, around 12 kilograms total from the commercial district."
    ];
    
    // Select a random transcription
    const randomIndex = Math.floor(Math.random() * mockTranscriptions.length);
    setTranscription(mockTranscriptions[randomIndex]);
  };

  // Format seconds to mm:ss
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle audio end event
  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">Voice Description</h3>
          <Button
            size="icon"
            className={`rounded-full ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-green-700 hover:bg-green-800'} text-white h-10 w-10 flex items-center justify-center transition-colors`}
            onClick={isRecording ? handleStopRecording : handleStartRecording}
          >
            {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
        </div>
        
        {isRecording && (
          <div className="mb-3 flex items-center">
            <div className="mr-2 text-sm text-red-500 animate-pulse">Recording</div>
            <div className="text-sm">{formatDuration(recordingDuration)}</div>
          </div>
        )}
        
        <div className="bg-gray-100 rounded-lg overflow-hidden mb-3 h-10 relative">
          {waveformData.length > 0 ? (
            <div className="flex items-center h-full px-2">
              {waveformData.map((value, index) => (
                <div 
                  key={index}
                  className="bg-green-700 w-1 mx-0.5"
                  style={{ height: `${value * 80}%` }}
                ></div>
              ))}
            </div>
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-green-700 to-teal-500 opacity-40"></div>
          )}
        </div>
        
        {transcription && (
          <p className="text-sm italic text-gray-600 mb-3">{`"${transcription}"`}</p>
        )}
        
        {audioUrl && (
          <div className="flex items-center justify-between">
            <audio ref={audioRef} src={audioUrl} onEnded={handleAudioEnded} className="hidden" />
            
            <Button 
              size="sm"
              variant="outline"
              className="text-green-700"
              onClick={togglePlayback}
            >
              {isPlaying ? <Square className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {isPlaying ? "Stop" : "Play"}
            </Button>
            
            <Button 
              size="sm"
              variant="outline"
              className="text-red-500"
              onClick={handleReset}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VoiceRecorder;
