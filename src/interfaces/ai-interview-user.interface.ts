export interface IAnswer {
  questionId: string;
  question: string;
  answer: string;
  confidence?: number;
  accuracy?: number;
  fluency?: number;
  completeness?: number;
  pronScore?: number;
  grammar?: number;
  vocabulary?: number;
  structure?: number;
  specificity?: number;
  relevance?: number;
  engagement?: number;
}

export default interface IAIInterviewUser extends Document {
  _id: string;
  beepUserId: string;
  studentId: string;
  interviewId: string;
  result: boolean;
  attempt: number;
  answers: IAnswer[];
  strengths?: string[];
  weaknesses?: string[];
  avgConfidence?: number;
  avgAccuracy?: number;
  avgFluency?: number;
  avgCompleteness?: number;
  avgPronScore?: number;
  avgGrammar?: number;
  avgVocabulary?: number;
  avgStructure?: number;
  avgSpecificity?: number;
  avgRelevance?: number;
  avgEngagement?: number;
  finalScore?: number;
}
