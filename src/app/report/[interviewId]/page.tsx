"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getInterviewResult } from "@/api";

const ReportPage = () => {
  const params = useParams();
  const { interviewId } = params as { interviewId: string };
  const userId = "67b41ececb876f82e14eab75"; // Replace with auth logic if needed

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["interviewResult", interviewId, userId],
    queryFn: () => getInterviewResult({ userId, interviewId }),
    enabled: !!interviewId && !!userId,
  });

  if (isLoading) {
    return <div className='text-center p-8'>Loading report...</div>;
  }

  if (isError || !data) {
    return (
      <div className='text-center p-8 text-red-500'>
        Error loading report: {error?.message || "No data found"}
      </div>
    );
  }

  const {
    finalScore,
    strengths,
    weaknesses,
    answers,
    avgPronScore,
    avgGrammar,
    avgVocabulary,
    avgStructure,
    avgSpecificity,
    avgRelevance,
    avgEngagement,
    avgAccuracy,
    avgCompleteness,
    avgFluency,
    avgConfidence,
  } = data;

  const scoreMetrics = [
    { name: "Pronunciation", value: avgPronScore },
    { name: "Grammar", value: avgGrammar },
    { name: "Vocabulary", value: avgVocabulary },
    { name: "Structure", value: avgStructure },
    { name: "Specificity", value: avgSpecificity },
    { name: "Relevance", value: avgRelevance },
    { name: "Engagement", value: avgEngagement },
    { name: "Accuracy", value: avgAccuracy },
    { name: "Fluency", value: avgFluency },
    { name: "Completeness", value: avgCompleteness },
    { name: "Confidence", value: (avgConfidence! * 100).toFixed(2) },
  ];

  return (
    <>
      {/* Top Navigation */}
      <nav className='bg-white shadow sticky top-0 z-50'>
        <div className='max-w-6xl mx-auto px-4 py-3 flex justify-between items-center'>
          <h1 className='text-xl font-bold text-gray-800'>
            📝 Interview Report
          </h1>
          <div className='space-x-4'>
            <Link href='/dashboard'>
              <span className='text-blue-600 hover:underline cursor-pointer font-medium'>
                🔙 Dashboard
              </span>
            </Link>
            <Link href={`/interview/${interviewId}`}>
              <span className='text-blue-600 hover:underline cursor-pointer font-medium'>
                🎤 Retake
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Report Body */}
      <div className='max-w-5xl mx-auto px-4 py-8'>
        <div className='flex justify-center mb-6'>
          <div className='text-center bg-green-100 text-green-800 px-6 py-4 rounded-full shadow text-2xl font-semibold'>
            🎯 Final Score: {finalScore}/100
          </div>
        </div>

        <section className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8'>
          {scoreMetrics.map((metric) => (
            <div
              key={metric.name}
              className='bg-white shadow-md p-4 rounded-lg border border-gray-200'
            >
              <div className='text-gray-500 text-sm'>{metric.name}</div>
              <div className='text-xl font-bold text-gray-900'>
                {metric.value}
              </div>
            </div>
          ))}
        </section>

        <section className='grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10'>
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
            <h2 className='text-lg font-semibold text-blue-800 mb-2'>
              ✅ Strengths
            </h2>
            <ul className='list-disc list-inside text-blue-700 space-y-1'>
              {strengths?.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>

          <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
            <h2 className='text-lg font-semibold text-red-800 mb-2'>
              ⚠️ Weaknesses
            </h2>
            <ul className='list-disc list-inside text-red-700 space-y-1'>
              {weaknesses?.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section>
          <h2 className='text-2xl font-bold mb-4'>🧠 Answer Breakdown</h2>
          <div className='space-y-4'>
            {answers?.map((a, i) => (
              <details
                key={a.questionId}
                className='border rounded-lg p-4 bg-white shadow-sm'
              >
                <summary className='cursor-pointer font-semibold text-lg text-gray-800'>
                  Q{i + 1}: {a.question}
                </summary>
                <div className='mt-2'>
                  <p className='text-gray-700 mb-2'>
                    <span className='font-semibold'>Answer:</span>{" "}
                    {a.answer || "Not answered"}
                  </p>
                  <div className='grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-gray-600'>
                    <div>Pronunciation: {a.pronScore}</div>
                    <div>Grammar: {a.grammar}</div>
                    <div>Vocabulary: {a.vocabulary}</div>
                    <div>Structure: {a.structure}</div>
                    <div>Specificity: {a.specificity}</div>
                    <div>Relevance: {a.relevance}</div>
                    <div>Engagement: {a.engagement}</div>
                    <div>Fluency: {a.fluency}</div>
                    <div>Completeness: {a.completeness}</div>
                    <div>Accuracy: {a.accuracy}</div>
                    <div>Confidence: {(a.confidence! * 100).toFixed(2)}%</div>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

export default ReportPage;
