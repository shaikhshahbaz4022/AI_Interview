"use client";

import React, { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInterviewDetails, submitAssessment } from "@/api";
import { AnswerData, FullInterviewDetails, UserAnswer } from "@/types";

const InterviewPage = () => {
  const params = useParams();
  const { interviewId } = params as { interviewId: string };
  const queryClient = useQueryClient();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const userId = "67b41ececb876f82e14eab75"; // Placeholder for actual user ID
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { data, isLoading, isError, error } = useQuery<
    FullInterviewDetails,
    Error
  >({
    queryKey: ["interviewDetails", interviewId],
    queryFn: () => getInterviewDetails(interviewId),
    enabled: !!interviewId,
  });

  const submitMutation = useMutation({
    mutationFn: submitAssessment,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["interviewDetails", interviewId],
      });

      if (currentQuestionIndex < (data?.questions?.length || 0) - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        alert("Interview Completed!");
      }
    },
    onError: (err) => {
      console.error("Error submitting assessment:", err);
      alert("Failed to submit answer. Please try again.");
    },
  });

  // Ensure audio plays only after it's fully buffered
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleCanPlay = () => {
      audio.play().catch((err) => {
        console.warn("Autoplay failed:", err.message);
      });
    };

    audio.pause();
    audio.currentTime = 0;
    audio.load(); // force re-buffer
    audio.addEventListener("canplaythrough", handleCanPlay);

    return () => {
      audio.removeEventListener("canplaythrough", handleCanPlay);
    };
  }, [currentQuestionIndex]);

  if (!interviewId)
    return <div className='text-center py-8'>No interview ID provided.</div>;
  if (isLoading)
    return <div className='text-center py-8'>Loading interview...</div>;
  if (isError)
    return (
      <div className='text-center py-8 text-red-500'>
        Error: {error?.message}
      </div>
    );
  if (!data || !data.questions || data.questions.length === 0)
    return (
      <div className='text-center py-8'>
        No interview data or questions found.
      </div>
    );

  const currentQuestion = data.questions[currentQuestionIndex];
  const currentAnswer = data?.userAnswers?.find(
    (answer: UserAnswer) => answer.questionId === currentQuestion._id
  );

  const handleRecordAnswer = () => {
    const simulatedAnswer: AnswerData = {
      Display: `Simulated answer for ${currentQuestion.question}`,
      Confidence: Math.random(),
      PronunciationAssessment: {
        AccuracyScore: Math.floor(Math.random() * 100),
        FluencyScore: Math.floor(Math.random() * 100),
        CompletenessScore: Math.floor(Math.random() * 100),
        PronScore: Math.floor(Math.random() * 100),
      },
    };

    submitMutation.mutate({
      userId,
      interviewId,
      questionId: currentQuestion._id,
      data: simulatedAnswer,
    });
  };

  const progress = `${currentQuestionIndex + 1} of ${data.questions.length}`;

  return (
    <div className='container mx-auto p-4 md:p-8 lg:p-12'>
      <h1 className='text-3xl font-bold mb-6 text-center md:text-left'>
        Interview: {data.name}
      </h1>

      <div className='bg-white shadow-md rounded-lg p-6 md:p-8 mb-6'>
        <h2 className='text-xl font-semibold mb-4'>
          Question {currentQuestionIndex + 1}
        </h2>
        <p className='text-lg mb-4'>{currentQuestion.question}</p>

        <audio
          ref={audioRef}
          controls
          preload='auto'
          src={currentQuestion.audioUrl}
          className='w-full mt-2 mb-4'
        />

        <div className='flex flex-col sm:flex-row justify-between items-center mb-4 gap-4'>
          <p className='text-sm text-gray-600'>
            Attempts: {currentAnswer?.attemptCount || 0} /{" "}
            {currentAnswer?.totalAttempts || "N/A"}
          </p>
          <p className='text-sm text-gray-600'>Progress: {progress}</p>
        </div>

        <button
          onClick={handleRecordAnswer}
          disabled={submitMutation.isPending}
          className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50'
        >
          {submitMutation.isPending ? "Submitting..." : "Record Answer"}
        </button>

        {currentAnswer && (
          <div className='mt-4 p-4 bg-gray-100 rounded-md'>
            <h3 className='font-semibold mb-2'>Last Attempt Feedback:</h3>
            <p>Display: {currentAnswer.data.Display}</p>
            <p>
              Confidence: {(currentAnswer.data.Confidence * 100).toFixed(2)}%
            </p>
            <p>
              Accuracy Score:{" "}
              {currentAnswer.data.PronunciationAssessment.AccuracyScore}
            </p>
            <p>
              Fluency Score:{" "}
              {currentAnswer.data.PronunciationAssessment.FluencyScore}
            </p>
            <p>
              Completeness Score:{" "}
              {currentAnswer.data.PronunciationAssessment.CompletenessScore}
            </p>
            <p>
              Pronunciation Score:{" "}
              {currentAnswer.data.PronunciationAssessment.PronScore}
            </p>
          </div>
        )}
      </div>

      <div className='flex justify-between mt-4'>
        <button
          onClick={() =>
            setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
          }
          disabled={currentQuestionIndex === 0}
          className='px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50'
        >
          Previous Question
        </button>
        <button
          onClick={() =>
            setCurrentQuestionIndex((prev) =>
              Math.min((data?.questions.length || 0) - 1, prev + 1)
            )
          }
          disabled={currentQuestionIndex === (data?.questions.length || 0) - 1}
          className='px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50'
        >
          Next Question
        </button>
      </div>
    </div>
  );
};

export default InterviewPage;
