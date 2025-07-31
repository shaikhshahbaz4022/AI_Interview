export interface AzureAssessmentResult {
  Display: string;
  Confidence: number;
  WordCount: number;
  PronunciationAssessment: {
    AccuracyScore: number;
    FluencyScore: number;
    CompletenessScore: number;
    PronScore: number;
  };
}
export function calculateWeightedAssessment(results: AzureAssessmentResult[]) {
  let totalWords = 0;
  let totalConfidence = 0;
  let totalAccuracy = 0;
  let totalFluency = 0;
  let totalCompleteness = 0;
  let totalPronScore = 0;
  let displayText = "";

  for (const res of results) {
    const wc = res.WordCount || 1;
    totalWords += wc;
    displayText += (displayText ? " " : "") + (res.Display ?? "");

    const pa = res.PronunciationAssessment || {
      AccuracyScore: 0,
      FluencyScore: 0,
      CompletenessScore: 0,
      PronScore: 0,
    };

    totalConfidence += (res.Confidence ?? 0) * wc;
    totalAccuracy += (pa.AccuracyScore ?? 0) * wc;
    totalFluency += (pa.FluencyScore ?? 0) * wc;
    totalCompleteness += (pa.CompletenessScore ?? 0) * wc;
    totalPronScore += (pa.PronScore ?? 0) * wc;
  }

  const safeDivide = (sum: number) =>
    totalWords > 0 ? Number((sum / totalWords).toFixed(1)) : 0;

  return {
    Display: displayText.trim(),
    Confidence: safeDivide(totalConfidence),
    PronunciationAssessment: {
      AccuracyScore: safeDivide(totalAccuracy),
      FluencyScore: safeDivide(totalFluency),
      CompletenessScore: safeDivide(totalCompleteness),
      PronScore: safeDivide(totalPronScore),
    },
    WordCount: totalWords,
  };
}
