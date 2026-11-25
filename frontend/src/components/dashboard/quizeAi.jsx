import React from 'react'
import { useNavigate } from 'react-router-dom'

function QuizeAi() {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate('quiz')}
      className="bg-black dark:bg-gray-800 rounded-xl px-6 py-8 ring shadow-xl ring-gray-900/5 w-full h-full cursor-pointer transition-transform duration-200 hover:-translate-y-1 hover:ring-indigo-500"
    >
      <div>
        <span className="inline-flex items-center justify-center rounded-md bg-indigo-500 p-2.5 shadow-lg">
          <svg
            className="h-6 w-6 stroke-white"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
            />
          </svg>
        </span>
      </div>

      <h1 className="text-white mt-5 text-lg font-semibold tracking-tight">
        Quick-Quiz
      </h1>
      <p className="text-gray-300 mt-2 text-sm">
        Test your knowledge with AI-generated MCQs from your notes
      </p>
    </div>
  )
}

export default QuizeAi
