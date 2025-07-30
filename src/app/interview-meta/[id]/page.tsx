"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getInterviewMetaDetails } from "@/api";

const InterviewMetaPage = () => {
  const params = useParams();
  const { id } = params as { id: string };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["interviewMeta", id],
    queryFn: () => getInterviewMetaDetails(id),
    enabled: !!id, // Only run the query if id is available
  });

  if (!id)
    return <div className='text-center py-8'>No interview ID provided.</div>;
  if (isLoading)
    return (
      <div className='text-center py-8'>Loading interview meta details...</div>
    );
  if (isError)
    return (
      <div className='text-center py-8 text-red-500'>
        Error: {error?.message}
      </div>
    );
  if (!data)
    return <div className='text-center py-8'>No interview details found.</div>;

  return (
    <div className='container mx-auto p-4 md:p-8 lg:p-12'>
      <h1 className='text-3xl font-bold mb-6 text-center md:text-left'>
        Interview Details: {data.name}
      </h1>
      <div className='bg-white shadow-md rounded-lg p-6 md:p-8'>
        <p className='text-lg mb-2'>
          <span className='font-semibold'>Company:</span> {data.company}
        </p>
        <p className='text-lg mb-2'>
          <span className='font-semibold'>Role:</span> {data.role}
        </p>
        <p className='text-lg mb-2'>
          <span className='font-semibold'>Difficulty:</span> {data.difficulty}
        </p>
        {/* Add more meta details as needed */}
      </div>
      <div className='mt-6'>
        <a
          href={`/interview/${id}`}
          className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
        >
          Start Interview
        </a>
      </div>
    </div>
  );
};

export default InterviewMetaPage;
