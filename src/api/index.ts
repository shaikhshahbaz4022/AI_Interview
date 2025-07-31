import axios from "axios";
import {
  AllInterviewsRequest,
  AllInterviewsResponse,
  FullInterviewDetails,
  InterviewMetaDetails,
  SubmitAssessmentRequest,
  SubmitAssessmentResponse,
  UpdateUserDetailsRequest,
} from "../types";
import IAIInterviewUser from "@/interfaces/ai-interview-user.interface";

const API_BASE_URL = "http://localhost:3000/api/v1/ai-interview";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    // You might add authorization headers here later
  },
});

// Add a request interceptor to simulate auth token (placeholder for NextAuth)
api.interceptors.request.use((config) => {
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3YjQxZWNlY2I4NzZmODJlMTRlYWI3NSIsInJvbGUiOiJzdHVkZW50IiwiaWF0IjoxNzUzODk3MTM2fQ.9slXkX_NOecP16e_zGbJGXOEV2zPH908Sqfat4EyEQw";
  if (token) {
    config.headers["x-auth"] = token;
  }
  return config;
});

export const getAllInterviews = async (
  data: AllInterviewsRequest
): Promise<AllInterviewsResponse> => {
  try {
    const response = await api.post("/all", data);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching all interviews:", error);
    throw error;
  }
};

export const getInterviewDetails = async (
  interviewId: string
): Promise<FullInterviewDetails> => {
  try {
    const response = await api.get(`/interview/${interviewId}`);
    return response.data.data;
  } catch (error) {
    console.error(
      `Error fetching interview details for ${interviewId}:`,
      error
    );
    throw error;
  }
};

export const getInterviewMetaDetails = async (
  id: string
): Promise<InterviewMetaDetails> => {
  try {
    const response = await api.get(`/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching interview meta details for ${id}:`, error);
    throw error;
  }
};

export const submitAssessment = async (
  data: SubmitAssessmentRequest
): Promise<SubmitAssessmentResponse> => {
  try {
    const response = await api.post("/submitAssessment", data);
    return response.data;
  } catch (error) {
    console.error("Error submitting assessment:", error);
    throw error;
  }
};

export const getInterviewResult = async ({
  userId,
  interviewId,
}: {
  userId: string;
  interviewId: string;
}): Promise<IAIInterviewUser> => {
  try {
    const response = await api.post("/result", {
      userId,
      interviewId,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching interview result:", error);
    throw error;
  }
};

export const updateUserDetails = async (
  data: UpdateUserDetailsRequest
): Promise<IAIInterviewUser> => {
  try {
    const response = await api.put("/user", data);
    return response.data;
  } catch (error) {
    console.error("Error updating user details:", error);
    throw error;
  }
};

export const retakeInterview = async ({
  userId,
  interviewId,
}: {
  userId: string;
  interviewId: string;
}): Promise<IAIInterviewUser> => {
  try {
    const response = await api.post("/retake", { userId, interviewId });
    return response.data;
  } catch (error) {
    console.error("Error retaking interview:", error);
    throw error;
  }
};
