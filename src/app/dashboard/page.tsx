"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllInterviews } from "@/api";
import { Interview, InterviewFilters, Pagination, Sorting } from "@/types";

const DashboardPage = () => {
  const [filters, setFilters] = useState<InterviewFilters>({});
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
  });
  const [sorting, setSorting] = useState<Sorting>({
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["allInterviews", filters, pagination, sorting],
    queryFn: () =>
      getAllInterviews({
        filters,
        pagination,
        sorting,
      }),
  });

  if (isLoading)
    return <div className='text-center py-8'>Loading interviews...</div>;
  if (isError)
    return (
      <div className='text-center py-8 text-red-500'>
        Error: {error?.message}
      </div>
    );

  return (
    <div className='container mx-auto p-4 md:p-8 lg:p-12'>
      <h1 className='text-3xl font-bold mb-6 text-center md:text-left'>
        AI Interview Dashboard
      </h1>

      {/* Filters Section */}
      <div className='bg-white shadow-md rounded-lg p-4 mb-6'>
        <h2 className='text-xl font-semibold mb-4'>Filters</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          <div>
            <label
              htmlFor='search'
              className='block text-sm font-medium text-gray-700'
            >
              Search
            </label>
            <input
              type='text'
              id='search'
              className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500'
              value={filters.search || ""}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
          </div>
          <div>
            <label
              htmlFor='company'
              className='block text-sm font-medium text-gray-700'
            >
              Company
            </label>
            <input
              type='text'
              id='company'
              className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2'
              value={filters.company || ""}
              onChange={(e) =>
                setFilters({ ...filters, company: e.target.value })
              }
            />
          </div>
          <div>
            <label
              htmlFor='difficulty'
              className='block text-sm font-medium text-gray-700'
            >
              Difficulty
            </label>
            <select
              id='difficulty'
              className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2'
              value={
                filters.difficulty && filters.difficulty.length > 0
                  ? filters.difficulty[0]
                  : ""
              }
              onChange={(e) =>
                setFilters({
                  ...filters,
                  difficulty: e.target.value
                    ? [e.target.value as "easy" | "medium" | "hard"]
                    : [],
                })
              }
            >
              <option value=''>All</option>
              <option value='easy'>Easy</option>
              <option value='medium'>Medium</option>
              <option value='hard'>Hard</option>
            </select>
          </div>
          <div>
            <label
              htmlFor='tag'
              className='block text-sm font-medium text-gray-700'
            >
              Tag
            </label>
            <input
              type='text'
              id='tag'
              className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2'
              value={filters.tag || ""}
              onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Interviews Table */}
      <div className='bg-white shadow-md rounded-lg overflow-hidden'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
                onClick={() =>
                  setSorting({
                    sortBy: "name",
                    sortOrder:
                      sorting.sortBy === "name" && sorting.sortOrder === "asc"
                        ? "desc"
                        : "asc",
                  })
                }
              >
                Name{" "}
                {sorting.sortBy === "name" &&
                  (sorting.sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
                onClick={() =>
                  setSorting({
                    sortBy: "company",
                    sortOrder:
                      sorting.sortBy === "company" &&
                      sorting.sortOrder === "asc"
                        ? "desc"
                        : "asc",
                  })
                }
              >
                Company{" "}
                {sorting.sortBy === "company" &&
                  (sorting.sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
                onClick={() =>
                  setSorting({
                    sortBy: "role",
                    sortOrder:
                      sorting.sortBy === "role" && sorting.sortOrder === "asc"
                        ? "desc"
                        : "asc",
                  })
                }
              >
                Role{" "}
                {sorting.sortBy === "role" &&
                  (sorting.sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
                onClick={() =>
                  setSorting({
                    sortBy: "difficulty",
                    sortOrder:
                      sorting.sortBy === "difficulty" &&
                      sorting.sortOrder === "asc"
                        ? "desc"
                        : "asc",
                  })
                }
              >
                Difficulty{" "}
                {sorting.sortBy === "difficulty" &&
                  (sorting.sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
                onClick={() =>
                  setSorting({
                    sortBy: "status",
                    sortOrder:
                      sorting.sortBy === "status" && sorting.sortOrder === "asc"
                        ? "desc"
                        : "asc",
                  })
                }
              >
                Status{" "}
                {sorting.sortBy === "status" &&
                  (sorting.sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {data?.interviews?.map((interview: Interview) => (
              <tr key={interview._id}>
                <td className='px-6 py-4 whitespace-nowrap'>
                  {interview.name}
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  {interview.company}
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  {interview.role}
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  {interview.difficulty}
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  {interview.status}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                  <a
                    href={`/interview/${interview._id}`}
                    className='text-indigo-600 hover:text-indigo-900'
                  >
                    Start Interview
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className='mt-4 flex justify-between items-center'>
        <button
          onClick={() =>
            setPagination((prev) => ({
              ...prev,
              page: Math.max(1, prev.page - 1),
            }))
          }
          disabled={pagination.page === 1 || isLoading}
          className='px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50'
        >
          Previous
        </button>
        <span>
          Page {pagination.page} of{" "}
          {Math.ceil((data?.total || 0) / pagination.limit)}
        </span>
        <button
          onClick={() =>
            setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
          }
          disabled={
            pagination.page * pagination.limit >= (data?.total || 0) ||
            isLoading
          }
          className='px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50'
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;
