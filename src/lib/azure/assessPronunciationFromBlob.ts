import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import { AzureAssessmentResult } from "./calculateWeightedAssessment";

export async function assessPronunciationFromBlob({
  audioBlob,
  referenceText,
  azureKey,
  azureRegion,
}: {
  audioBlob: Blob;
  referenceText: string;
  azureKey: string;
  azureRegion: string;
}): Promise<AzureAssessmentResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const buffer = reader.result as ArrayBuffer;
      const audioStream = sdk.AudioInputStream.createPushStream();
      audioStream.write(buffer);
      audioStream.close();

      const audioConfig = sdk.AudioConfig.fromStreamInput(audioStream);
      const speechConfig = sdk.SpeechConfig.fromSubscription(
        azureKey,
        azureRegion
      );
      speechConfig.speechRecognitionLanguage = "en-US";

      const reco = new sdk.SpeechRecognizer(speechConfig, audioConfig);

      const pronunciationConfig = new sdk.PronunciationAssessmentConfig(
        referenceText,
        sdk.PronunciationAssessmentGradingSystem.HundredMark,
        sdk.PronunciationAssessmentGranularity.Word,
        true
      );

      pronunciationConfig.applyTo(reco);

      reco.recognizeOnceAsync((result) => {
        const json = result.properties.getProperty(
          sdk.PropertyId.SpeechServiceResponse_JsonResult
        );
        const parsed = JSON.parse(json);
        const pron = parsed?.NBest?.[0]?.PronunciationAssessment ?? {};
        const confidence = parsed?.NBest?.[0]?.Confidence ?? 0.9;

        resolve({
          Display: referenceText.trim(),
          Confidence: confidence,
          WordCount: referenceText.trim().split(/\s+/).length,
          PronunciationAssessment: {
            AccuracyScore: pron.AccuracyScore ?? 0,
            FluencyScore: pron.FluencyScore ?? 0,
            CompletenessScore: pron.CompletenessScore ?? 0,
            PronScore: pron.PronScore ?? 0,
          },
        });

        reco.close();
      });
    };

    reader.readAsArrayBuffer(audioBlob);
  });
}
