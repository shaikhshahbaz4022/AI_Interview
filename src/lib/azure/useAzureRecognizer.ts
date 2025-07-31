import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import { useRef } from "react";

export function useAzureRecognizer({
  azureKey,
  azureRegion,
  onResult,
  onEnd,
}: {
  azureKey: string;
  azureRegion: string;
  onResult: (data: {
    transcript: string;
    confidence: number;
    isFinal: boolean;
  }) => void;
  onEnd?: () => void;
}) {
  const recognizerRef = useRef<sdk.SpeechRecognizer | null>(null);
  const transcriptRef = useRef<string>("");

  const startRecognition = () => {
    transcriptRef.current = ""; // reset transcript

    const speechConfig = sdk.SpeechConfig.fromSubscription(
      azureKey,
      azureRegion
    );
    speechConfig.speechRecognitionLanguage = "en-US";
    const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();

    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
    recognizerRef.current = recognizer;

    recognizer.recognizing = (_, e) => {
      if (e.result.text) {
        const interim = `${transcriptRef.current} ${e.result.text}`.trim();
        onResult({ transcript: interim, confidence: 0, isFinal: false });
      }
    };

    recognizer.recognized = (_, e) => {
      if (
        e.result.reason === sdk.ResultReason.RecognizedSpeech &&
        e.result.text
      ) {
        transcriptRef.current += ` ${e.result.text}`;
        onResult({
          transcript: transcriptRef.current.trim(),
          confidence: 0.9,
          isFinal: true,
        });
      }
    };

    recognizer.sessionStopped = () => {
      recognizer.stopContinuousRecognitionAsync();
      onEnd?.();
    };

    recognizer.canceled = (_, e) => {
      console.warn("Speech canceled:", e.errorDetails);
      recognizer.stopContinuousRecognitionAsync();
      onEnd?.();
    };

    recognizer.startContinuousRecognitionAsync();
  };

  const stopRecognition = () => {
    recognizerRef.current?.stopContinuousRecognitionAsync(() => {
      recognizerRef.current?.close();
      recognizerRef.current = null;
    });
  };

  return { startRecognition, stopRecognition };
}
