import React, { useEffect, useState } from 'react'

function DailyProgress({ onSelect }) {
  const [stats, setStats] = useState({
    streak: 0,
    completedToday: 0,
    dailyGoal: 5,
  })

  // Browser ke localStorage se progress read karein (Zero DB cost)
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('studybuddy_progress'))
    if (saved) {
      setStats(saved)
    }
  }, [])

  const progressPercent = Math.min(
    Math.round((stats.completedToday / stats.dailyGoal) * 100),
    100
  )

  return (
    <div
      onClick={onSelect}
      className="bg-black dark:bg-gray-800 rounded-xl px-6 py-8 ring shadow-xl ring-gray-900/5 w-full max-w-md max-h-96 cursor-pointer transition-transform duration-200 hover:-translate-y-1 hover:ring-amber-500"
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center justify-center rounded-md bg-amber-500 p-2.5 shadow-lg">
          <svg
            className="h-6 w-6 stroke-white"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z"
            />
          </svg>
        </span>

        {/* Live Streak Badge */}
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
          {stats.streak} Day Streak
        </span>
      </div>

      <h1 className="text-white mt-5 text-lg font-semibold tracking-tight">
        Daily Progress
      </h1>
      <p className="text-gray-300 mt-1 text-sm">
        {stats.completedToday} / {stats.dailyGoal} topics revised today
      </p>

      {/* Mini Progress Bar */}
      <div className="w-full bg-gray-800 rounded-full h-2 mt-4 overflow-hidden">
        <div
          className="bg-amber-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  )
}

export default DailyProgress
