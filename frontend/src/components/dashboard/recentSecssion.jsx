
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function RecentSessions() {
  const navigate = useNavigate();

  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('studybuddy_history')) || [];
    } catch {
      return [];
    }
  });

  const [newTopic, setNewTopic] = useState('');

  const [examDate, setExamDate] = useState(
    () => localStorage.getItem('studybuddy_exam_date') || ''
  );

  // Save history whenever it changes
  useEffect(() => {
    localStorage.setItem('studybuddy_history', JSON.stringify(history));
  }, [history]);

  // Save exam date
  const handleExamDateChange = (e) => {
    const date = e.target.value;
    setExamDate(date);
    localStorage.setItem('studybuddy_exam_date', date);
  };

  // Calculate remaining exam days
  const getDaysLeft = () => {
    if (!examDate) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const exam = new Date(`${examDate}T00:00:00`);
    const diff = exam.getTime() - today.getTime();

    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  // Add new topic
  const handleAddTopic = (e) => {
    e.preventDefault();

    if (!newTopic.trim()) return;

    const entry = {
      id: Date.now(),
      topic: newTopic.trim(),
      type: 'notes',
      count: 0,
      date: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short'
      }),
      mastered: false
    };

    setHistory(prev => [entry, ...prev]);
    setNewTopic('');
  };

  // Toggle Mastered / Pending
  const toggleMastered = (e, index) => {
    e.stopPropagation();

    setHistory(prev =>
      prev.map((item, idx) =>
        idx === index
          ? { ...item, mastered: !item.mastered }
          : item
      )
    );
  };

  // Delete topic
  const deleteTopic = (e, index) => {
    e.stopPropagation();

    setHistory(prev =>
      prev.filter((_, idx) => idx !== index)
    );
  };

  // Last 7 days activity
  const getLast7Days = () => {
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);

      const label = d.toLocaleDateString('en-IN', {
        weekday: 'short'
      });

      const dateStr = d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short'
      });

      const count = history.filter(
        item => item.date === dateStr
      ).length;

      days.push({ label, dateStr, count });
    }

    return days;
  };

  const masteredCount = history.filter(
    item => item.mastered
  ).length;

  const last7Days = getLast7Days();
  const daysLeft = getDaysLeft();

  return (
    <div className="mt-8 space-y-6">

      {/* Weekly Activity, Mastery & Exam Countdown */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">

        {/* Mastery Stats */}
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs text-slate-500 font-medium">
              Topics Covered
            </p>
            <p className="text-2xl font-bold text-slate-900">
              {history.length}
            </p>
          </div>

          <div className="h-8 w-px bg-slate-200" />

          <div>
            <p className="text-xs text-slate-500 font-medium">
              Mastered
            </p>
            <p className="text-2xl font-bold text-emerald-600">
              {masteredCount}
              <span className="text-xs font-normal text-slate-400">
                {' '}/ {history.length}
              </span>
            </p>
          </div>
        </div>

        {/* 7-Day Activity */}
        <div className="lg:mx-auto">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Last 7 Days Activity
          </p>

          <div className="flex items-center gap-2">
            {last7Days.map((day, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center gap-1"
              >
                <div
                  title={`${day.dateStr}: ${day.count} sessions`}
                  className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold transition ${
                    day.count > 0
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  {day.count > 0 ? day.count : '–'}
                </div>

                <span className="text-[10px] text-slate-500 font-medium">
                  {day.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Exam Countdown */}
        <div className="flex items-center justify-between lg:justify-end gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase">
              Target Exam
            </p>

            {daysLeft !== null ? (
              <p className="text-sm font-bold text-indigo-600">
                {daysLeft} Days Left
              </p>
            ) : (
              <p className="text-xs text-slate-400">
                Set exam date
              </p>
            )}
          </div>

          <input
            type="date"
            value={examDate}
            onChange={handleExamDateChange}
            className="text-xs bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Syllabus Revision Tracker */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Syllabus Revision Tracker
            </h2>

            <p className="text-xs text-slate-500">
              Add topics to revise or click any generated session to practice again
            </p>
          </div>

          {/* Add Topic */}
          <form onSubmit={handleAddTopic} className="flex gap-2">
            <input
              type="text"
              placeholder="Add chapter to revise..."
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500 w-48 sm:w-56"
            />

            <button
              type="submit"
              className="px-3.5 py-2 bg-black hover:bg-gray-800 text-white text-xs font-medium rounded-lg transition cursor-pointer"
            >
              + Add
            </button>
          </form>
        </div>

        {/* Empty State */}
        {history.length === 0 ? (
          <div className="border border-dashed border-slate-300 rounded-xl p-8 text-center">

            <p className="text-sm font-medium text-slate-700">
              Aapka revision tracker abhi khali hai
            </p>

            <p className="text-xs text-slate-500 mt-1 mb-4">
              Upar se chapter add karein ya Quick-Quiz / AI-Tutor se apna pehla session banayein.
            </p>

            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/quiz')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition cursor-pointer"
              >
                + Start a Quiz
              </button>

              <button
                type="button"
                onClick={() => navigate('/notes')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition cursor-pointer"
              >
                + Create Notes
              </button>
            </div>
          </div>
        ) : (

          /* Topic List */
          <div className="space-y-2.5">

            {history.map((item, index) => (
              <div
                key={item.id || `${item.topic}-${index}`}
                onClick={() =>
                  navigate(
                    item.type === 'quiz' ? '/quiz' : '/notes'
                  )
                }
                className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-4 ${
                  item.mastered
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : 'bg-slate-50/50 border-slate-200 hover:border-indigo-400'
                }`}
              >

                <div className="flex items-center gap-3.5 min-w-0">

                  {/* Mastery Checkbox */}
                  <button
                    type="button"
                    onClick={(e) => toggleMastered(e, index)}
                    aria-label="Toggle mastery"
                    className={`h-5 w-5 rounded-md border flex items-center justify-center shrink-0 transition cursor-pointer ${
                      item.mastered
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-300 hover:border-emerald-500 bg-white'
                    }`}
                  >
                    {item.mastered && (
                      <svg
                        className="h-3.5 w-3.5 stroke-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="3"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m4.5 12.75 6 6 9-13.5"
                        />
                      </svg>
                    )}
                  </button>

                  {/* Topic Details */}
                  <div className="min-w-0">

                    <div className="flex items-center gap-2">
                      <h3
                        className={`font-semibold text-sm truncate ${
                          item.mastered
                            ? 'line-through text-slate-400'
                            : 'text-slate-900'
                        }`}
                      >
                        {item.topic}
                      </h3>

                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          item.type === 'quiz'
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {item.type === 'quiz' ? 'Quiz' : 'Notes'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-1">
                      {item.date || 'Date unavailable'}
                    </p>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-3 shrink-0">

                  <span className="text-xs text-indigo-600 font-medium hidden sm:block">
                    Revise →
                  </span>

                  <button
                    type="button"
                    onClick={(e) => deleteTopic(e, index)}
                    title="Delete topic"
                    aria-label="Delete topic"
                    className="text-slate-400 hover:text-rose-600 text-xs px-1.5 py-1 cursor-pointer"
                  >
                    ✕
                  </button>

                </div>
              </div>
            ))}

          </div>
        )}
      </div>
    </div>
  );
}

export default RecentSessions;
