import { useRef } from "react";
import { encode } from "wav-encoder";

export function useAudioRecorder() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // Use 'audio/webm;codecs=opus' or 'audio/webm'
    const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
  };

  const stopRecording = () =>
    new Promise<Blob>(async (resolve) => {
      if (!mediaRecorderRef.current) return;

      mediaRecorderRef.current.onstop = async () => {
        const webmBlob = new Blob(chunksRef.current, { type: "audio/webm" });

        const arrayBuffer = await webmBlob.arrayBuffer();

        // Decode to PCM using browser AudioContext
        const audioCtx = new AudioContext({ sampleRate: 16000 });
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

        // Convert to mono PCM
        const channelData = audioBuffer.getChannelData(0); // mono only

        const wavData = await encode({
          sampleRate: 16000,
          channelData: [channelData],
        });

        const wavBlob = new Blob([wavData], { type: "audio/wav" });

        resolve(wavBlob);
      };

      mediaRecorderRef.current.stop();
    });

  return { startRecording, stopRecording };
}
