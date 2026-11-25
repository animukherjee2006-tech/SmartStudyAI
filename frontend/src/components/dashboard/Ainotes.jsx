import React from 'react'
import { useNavigate } from 'react-router-dom'

function Ainotes() {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate('notes')}
      className="bg-black dark:bg-gray-800 rounded-xl px-6 py-8 ring shadow-xl ring-gray-900/5 w-full h-full cursor-pointer transition-transform duration-200 hover:-translate-y-1 hover:ring-emerald-500"
    >
      <div>
        <span className="inline-flex items-center justify-center rounded-md bg-emerald-500 p-2.5 shadow-lg">
          <svg
            className="h-6 w-6 stroke-white"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
            />
          </svg>
        </span>
      </div>

      <h1 className="text-white mt-5 text-lg font-semibold tracking-tight">
        AI-Tutor & Notes
      </h1>
      <p className="text-gray-300 mt-2 text-sm">
        Prepare smartly before exams with instant summaries & flashcards
      </p>
    </div>
  )
}

export default Ainotes
