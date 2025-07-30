"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className='min-h-screen bg-slate-50 px-4 py-12 flex flex-col items-center justify-start'>
      <h1 className='text-4xl font-bold text-slate-800 mb-6 text-center'>
        👋 Welcome to{" "}
        <span className='text-blue-600'>AI Interview Platform</span>
      </h1>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl'>
        <Link
          href='/dashboard'
          className='block p-6 bg-white rounded-2xl shadow hover:shadow-md hover:bg-blue-50 transition border border-slate-200'
        >
          <h2 className='text-xl font-semibold text-blue-600'>
            📊 Go to Dashboard
          </h2>
          <p className='text-slate-600 mt-2'>
            View student progress, scores, and interview sessions
          </p>
        </Link>

        <Link
          href='/interview-meta'
          className='block p-6 bg-white rounded-2xl shadow hover:shadow-md hover:bg-blue-50 transition border border-slate-200'
        >
          <h2 className='text-xl font-semibold text-blue-600'>
            🧠 View Sample Interview Meta
          </h2>
          <p className='text-slate-600 mt-2'>
            Explore evaluation metrics and insights
          </p>
        </Link>
      </div>
    </main>
  );
}
