"use client";

import React, { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getInterviewDetails,
  getInterviewResult,
  submitAssessment,
  retakeInterview,
} from "@/api";
import { FullInterviewDetails } from "@/types";
import { useAzureRecognizer } from "@/lib/azure/useAzureRecognizer";
import { useAudioRecorder } from "@/lib/azure/useAudioRecorder";
import { assessPronunciationFromBlob } from "@/lib/azure/assessPronunciationFromBlob";
import { calculateWeightedAssessment } from "@/lib/azure/calculateWeightedAssessment";
import IAIInterviewUser from "@/interfaces/ai-interview-user.interface";
import axios from "axios";

interface ChatMessage {
  id: number;
  sender: "user" | "question";
  text: string;
  isFinal?: boolean;
  questionIndex: number;
}

const InterviewPage = () => {
  const params = useParams();
  const { interviewId } = params as { interviewId: string };
  const queryClient = useQueryClient();

  const userId = "67b41ececb876f82e14eab75";
  const azureKey = process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY!;
  const azureRegion = process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION!;

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isAnswering, setIsAnswering] = useState(false);
  const [timer, setTimer] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [finalTranscript, setFinalTranscript] = useState("");
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [isSubmittingFinal, setIsSubmittingFinal] = useState(false);
  const [finalResultReady, setFinalResultReady] = useState(false);
  const [interviewFinalResult, setInterviewFinalResult] =
    useState<IAIInterviewUser | null>(null);
  const [isRetaking, setIsRetaking] = useState(false);
  const [retakeErrorMessage, setRetakeErrorMessage] = useState<string | null>(
    null
  );

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { data, isLoading, isError, error } = useQuery<
    FullInterviewDetails,
    Error
  >({
    queryKey: ["interviewDetails", interviewId],
    queryFn: () => getInterviewDetails(interviewId),
    enabled: !!interviewId,
  });

  const currentQuestion = data?.questions?.[currentQuestionIndex];

  const { startRecording, stopRecording } = useAudioRecorder();

  const { startRecognition, stopRecognition } = useAzureRecognizer({
    azureKey,
    azureRegion,
    onResult: ({ transcript, isFinal }) => {
      // Removed confidence and pronunciation
      setChatMessages((prev) => {
        const filtered = prev.filter(
          (msg) =>
            !(
              msg.sender === "user" &&
              msg.questionIndex === currentQuestionIndex
            )
        );
        return [
          ...filtered,
          {
            id: Date.now(),
            sender: "user",
            text: transcript,
            isFinal,
            questionIndex: currentQuestionIndex,
          },
        ];
      });

      if (isFinal) {
        setFinalTranscript(transcript);
      }
    },
    onEnd: () => {
      setIsAnswering(false);
      if (intervalId) clearInterval(intervalId);
      setIntervalId(null);
    },
  });

  const submitMutation = useMutation({
    mutationFn: submitAssessment,
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: ["interviewDetails", interviewId],
      });
      setFinalTranscript("");
      setRecordedAudio(null);

      const isLast = currentQuestionIndex >= (data?.questions?.length ?? 0) - 1;

      if (!isLast) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        setIsSubmittingFinal(true);
        try {
          const result = await getInterviewResult({ userId, interviewId });
          console.log("Interview Result:", result);
          setInterviewFinalResult(result);
          setFinalResultReady(true);
        } catch (err) {
          console.error("Failed to get result:", err);
          alert("Failed to generate final report.");
          setFinalResultReady(false);
        } finally {
          setIsSubmittingFinal(false);
        }
      }
    },
  });

  const handleStart = async () => {
    if (!currentQuestion) return;

    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: "question",
        text: currentQuestion.question,
        isFinal: true,
        questionIndex: currentQuestionIndex,
      },
    ]);

    setFinalTranscript("");
    setRecordedAudio(null);
    setIsAnswering(true);
    setTimer(0);
    const id = setInterval(() => setTimer((t) => t + 1), 1000);
    setIntervalId(id);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    await startRecording();
    startRecognition();
  };

  const handleStop = async () => {
    stopRecognition();
    const blob = await stopRecording();
    setRecordedAudio(blob);
    if (intervalId) clearInterval(intervalId);
    setIntervalId(null);
    setIsAnswering(false);
  };

  const handleSubmit = async () => {
    if (!finalTranscript || !recordedAudio || !currentQuestion) {
      alert("Missing transcript or audio.");
      return;
    }

    const referenceText = finalTranscript.trim();
    const result = await assessPronunciationFromBlob({
      audioBlob: recordedAudio,
      referenceText,
      azureKey,
      azureRegion,
    });

    const aggregated = calculateWeightedAssessment([result]);

    submitMutation.mutate({
      userId,
      interviewId,
      questionId: currentQuestion._id,
      data: aggregated,
    });
  };

  const handleRetake = async () => {
    setIsRetaking(true);
    setRetakeErrorMessage(null); // Clear previous error messages
    try {
      const newAttempt = await retakeInterview({ userId, interviewId });
      console.log("Retake successful:", newAttempt);

      // Reset all states to start a new interview attempt
      setCurrentQuestionIndex(0);
      setChatMessages([]);
      setFinalTranscript("");
      setRecordedAudio(null);
      setIsAnswering(false);
      setTimer(0);
      if (intervalId) clearInterval(intervalId);
      setIntervalId(null);
      setFinalResultReady(false);
      setInterviewFinalResult(null);

      // Invalidate query to refetch interview details for the new attempt
      queryClient.invalidateQueries({
        queryKey: ["interviewDetails", interviewId],
      });
    } catch (err) {
      console.error("Error retaking interview:", err);
      if (axios.isAxiosError(err)) {
        const errorMessage =
          err.response?.data?.data || "Failed to retake interview.";
        setRetakeErrorMessage(errorMessage);
      } else {
        setRetakeErrorMessage("An unexpected error occurred.");
      }
    } finally {
      setIsRetaking(false);
    }
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, "0")}:${sec
      .toString()
      .padStart(2, "0")}`;
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    if (audioRef.current && currentQuestion?.audioUrl && !isAnswering) {
      audioRef.current.src = currentQuestion.audioUrl;
      audioRef.current.load();
      audioRef.current.play().catch((err) => {
        console.warn("Autoplay failed for question audio:", err.message);
      });
    } else if (audioRef.current && isAnswering) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [currentQuestionIndex, isAnswering, currentQuestion?.audioUrl]);

  if (isLoading)
    return <div className='text-center p-8'>Loading interview...</div>;
  if (isError)
    return <div className='text-red-600 text-center p-8'>{error.message}</div>;
  if (!data || !currentQuestion)
    return <div className='p-8 text-center'>No data available.</div>;

  const isMaxAttempts =
    interviewFinalResult && interviewFinalResult.attempt >= 4;

  return (
    <div className='flex h-screen divide-x'>
      <div className='w-1/2 p-6 space-y-6 overflow-y-auto'>
        <h1 className='text-2xl font-bold'>{data.name}</h1>
        <p className='text-lg'>{currentQuestion.question}</p>
        <audio
          ref={audioRef}
          src={currentQuestion.audioUrl}
          controls
          className='w-full'
        />

        {isAnswering && (
          <div className='text-blue-600 font-medium'>
            ⏱ Timer: {formatTime(timer)}
          </div>
        )}

        <div className='space-x-2'>
          {!finalResultReady ? (
            <button
              className='bg-blue-600 text-white px-4 py-2 rounded'
              onClick={handleStart}
              disabled={isAnswering}
            >
              🎙 Start
            </button>
          ) : null}

          {!finalResultReady ? (
            <button
              className='bg-red-600 text-white px-4 py-2 rounded'
              onClick={handleStop}
              disabled={!isAnswering}
            >
              ⏹ Stop
            </button>
          ) : null}

          {finalResultReady ? (
            isMaxAttempts ? (
              <p className='text-red-500 font-semibold'>Max Attempts Reached</p>
            ) : (
              <button
                className={`bg-purple-600 text-white px-4 py-2 rounded ${
                  isRetaking ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={handleRetake}
                disabled={isRetaking}
              >
                {isRetaking ? "Retaking..." : "📊 Retake Interview"}
              </button>
            )
          ) : (
            <button
              className={`bg-green-600 text-white px-4 py-2 rounded ${
                isSubmittingFinal ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={handleSubmit}
              disabled={!finalTranscript || !recordedAudio || isSubmittingFinal}
            >
              {isSubmittingFinal ? "🔄 Generating Report..." : "✅ Submit"}
            </button>
          )}
          {retakeErrorMessage && (
            <p className='text-red-500 font-semibold mt-2'>
              {retakeErrorMessage}
            </p>
          )}
        </div>
      </div>

      <div className='w-1/2 p-6 bg-gray-50 overflow-y-auto'>
        <h2 className='text-xl font-semibold mb-4'>Live Transcript</h2>
        <div ref={chatContainerRef} className='space-y-3'>
          {chatMessages
            .filter((msg) => msg.questionIndex <= currentQuestionIndex)
            .map((msg) => (
              <div
                key={msg.id}
                className={`max-w-[80%] px-4 py-2 rounded-lg shadow ${
                  msg.sender === "user"
                    ? msg.isFinal
                      ? "bg-blue-100 text-blue-800 self-end ml-auto"
                      : "bg-blue-50 text-blue-500 italic self-end ml-auto"
                    : "bg-green-100 text-green-800 self-start"
                }`}
              >
                {msg.text}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;
