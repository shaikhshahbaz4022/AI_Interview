export interface InterviewFilters {
  search?: string;
  company?: string;
  difficulty?: ("easy" | "medium" | "hard")[];
  tag?: string; // Assuming 'tag' is another filter
}

export interface Pagination {
  page: number;
  limit: number;
}

export interface Sorting {
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export interface AllInterviewsRequest {
  filters?: InterviewFilters;
  pagination?: Pagination;
  sorting?: Sorting;
}

export interface Interview {
  _id: string;
  name: string;
  company: string;
  role: string;
  difficulty: "easy" | "medium" | "hard";
  status: "pending" | "in_progress" | "completed";
  createdAt: string;
  // Add other relevant fields for the interview table
}

export interface AllInterviewsResponse {
  interviews: Interview[];
  total: number;
  page: number;
  limit: number;
}

export interface InterviewQuestion {
  audioUrl: string;
  question: string;
  _id: string;
  // Add other question-related fields
}

export interface PronunciationAssessment {
  AccuracyScore: number;
  FluencyScore: number;
  CompletenessScore: number;
  PronScore: number;
}

export interface AnswerData {
  Display: string;
  Confidence: number;
  PronunciationAssessment: PronunciationAssessment;
}

export interface UserAnswer {
  questionId: string;
  attemptCount: number;
  totalAttempts: number;
  data: AnswerData;
}

export interface FullInterviewDetails {
  _id: string;
  name: string;
  company: string;
  role: string;
  difficulty: "easy" | "medium" | "hard";
  questions: InterviewQuestion[];
  userAnswers: UserAnswer[];
  totalAttempts: number;
  // Add other relevant fields
}

export interface InterviewMetaDetails {
  _id: string;
  name: string;
  company: string;
  role: string;
  difficulty: "easy" | "medium" | "hard";
  // Add other relevant meta details, excluding questions
}

export interface SubmitAssessmentRequest {
  userId: string;
  interviewId: string;
  questionId: string;
  data: AnswerData;
}

export interface SubmitAssessmentResponse {
  message: string;
  // Add any other relevant response fields
}
