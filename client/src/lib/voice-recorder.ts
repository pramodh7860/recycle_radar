let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];
let recordingStartTime: number = 0;
let recordingDuration: number = 0;

// Start recording audio
export async function startRecording(): Promise<void> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];
    recordingStartTime = Date.now();

    mediaRecorder.addEventListener('dataavailable', (event) => {
      audioChunks.push(event.data);
    });

    mediaRecorder.start();
    return Promise.resolve();
  } catch (error) {
    console.error('Error starting recording:', error);
    return Promise.reject(error);
  }
}

// Stop recording and return the audio blob and duration
export function stopRecording(): Promise<{ audioBlob: Blob, durationMs: number }> {
  return new Promise((resolve, reject) => {
    if (!mediaRecorder) {
      reject(new Error('No recording in progress'));
      return;
    }

    mediaRecorder.addEventListener('stop', () => {
      recordingDuration = Date.now() - recordingStartTime;
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      
      // Stop all tracks in the stream
      mediaRecorder?.stream.getTracks().forEach(track => track.stop());
      
      resolve({ audioBlob, durationMs: recordingDuration });
    });

    mediaRecorder.stop();
  });
}

// Convert audio blob to base64 for storage
export function audioToBase64(audioBlob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Audio = reader.result as string;
      resolve(base64Audio);
    };
    reader.onerror = reject;
    reader.readAsDataURL(audioBlob);
  });
}

// Create an audio URL for playback
export function createAudioUrl(audioBlob: Blob): string {
  return URL.createObjectURL(audioBlob);
}

// Generate waveform data from audio for visualization
export async function generateWaveform(audioBlob: Blob, numPoints: number = 50): Promise<number[]> {
  return new Promise((resolve, reject) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const fileReader = new FileReader();
    
    fileReader.onload = async (event) => {
      try {
        const audioData = await audioContext.decodeAudioData(event.target!.result as ArrayBuffer);
        const channelData = audioData.getChannelData(0);
        const blockSize = Math.floor(channelData.length / numPoints);
        const waveform = [];
        
        for (let i = 0; i < numPoints; i++) {
          const blockStart = blockSize * i;
          let sum = 0;
          
          for (let j = 0; j < blockSize; j++) {
            sum += Math.abs(channelData[blockStart + j]);
          }
          
          waveform.push(sum / blockSize);
        }
        
        // Normalize
        const max = Math.max(...waveform);
        resolve(waveform.map(point => point / max));
      } catch (error) {
        reject(error);
      }
    };
    
    fileReader.onerror = reject;
    fileReader.readAsArrayBuffer(audioBlob);
  });
}
