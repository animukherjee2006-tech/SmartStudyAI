import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookText,
  ClipboardCheck,
  Layers,
  FolderOpen,
  Award,
  Clock,
  ArrowRight,
  Calendar,
  Sparkles,
  FileText,
} from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { dashboardApi } from '../services/api';

function StatCard({ label, value, subtext, icon: Icon, accent = 'navy' }) {
  const iconColors =
    accent === 'gold'
      ? 'bg-[#F5ECD7] text-[#C49A45]'
      : accent === 'success'
      ? 'bg-[#39765B]/10 text-[#39765B]'
      : 'bg-[#172B4D]/10 text-[#172B4D]';

  return (
    <div className="bg-white border border-[#E5E1D8] rounded-lg p-5 shadow-xs hover:border-[#294C73]/50 transition">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">{label}</p>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-[#172B4D] mt-2">{value}</p>
          {subtext && <p className="text-xs text-[#6B7280] mt-1">{subtext}</p>}
        </div>
        <div className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 ${iconColors}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function loadStats() {
      try {
        const res = await dashboardApi.stats();
        if (active) setData(res);
      } catch (err) {
        if (active) setError(err.message || 'Unable to load dashboard data.');
      } finally {
        if (active) setLoading(false);
      }
    }
    loadStats();
    return () => {
      active = false;
    };
  }, []);

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const stats = data?.stats || {
    totalSessions: 0,
    notesCount: 0,
    quizzesCompleted: 0,
    averageQuizScore: 0,
    decksCount: 0,
    materialsCount: 0,
    completedToday: 0,
    dailyGoal: 5,
  };

  const weeklyActivity = data?.weeklyActivity || [];
  const maxWeeklyCount = Math.max(1, ...weeklyActivity.map((d) => d.count));
  const progressPct = Math.min(
    100,
    Math.round((stats.completedToday / Math.max(1, stats.dailyGoal)) * 100)
  );

  return (
    <DashboardLayout pageTitle="Dashboard">
      <div className="space-y-6">
        {/* Welcome Banner */}
        <section className="bg-white border border-[#E5E1D8] rounded-lg p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C49A45]">
              <Calendar className="w-3.5 h-3.5" />
              <span>{todayFormatted}</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#172B4D] mt-1.5">
              Welcome back, {user?.name?.split(' ')[0] || 'Scholar'}
            </h2>
            <p className="text-sm text-[#6B7280] mt-1">
              Organize your coursework, generate structured revision notes, and track exam readiness.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/notes"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#172B4D] hover:bg-[#10213A] text-white text-sm font-semibold transition"
            >
              <Sparkles className="w-4 h-4 text-[#C49A45]" />
              <span>Generate AI Notes</span>
            </Link>
            <Link
              to="/quiz"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-white border border-[#E5E1D8] hover:border-[#172B4D] text-[#172B4D] text-sm font-semibold transition"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Start AI Quiz</span>
            </Link>
          </div>
        </section>

        {error && (
          <div className="p-4 bg-[#B94A48]/10 border border-[#B94A48]/30 rounded-lg text-sm text-[#B94A48]">
            {error}
          </div>
        )}

        {/* KPI Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white border border-[#E5E1D8] rounded-lg p-5 h-28 animate-pulse"
              >
                <div className="h-3 bg-[#E5E1D8] rounded w-1/2 mb-3" />
                <div className="h-7 bg-[#E5E1D8] rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Study Sessions"
              value={stats.totalSessions}
              subtext={`${stats.materialsCount} PDFs in library`}
              icon={Clock}
              accent="navy"
            />
            <StatCard
              label="Notes Generated"
              value={stats.notesCount}
              subtext="Saved revision kits"
              icon={BookText}
              accent="gold"
            />
            <StatCard
              label="Quizzes Completed"
              value={stats.quizzesCompleted}
              subtext={`${stats.decksCount} flashcard decks`}
              icon={ClipboardCheck}
              accent="navy"
            />
            <StatCard
              label="Average Quiz Score"
              value={stats.quizzesCompleted > 0 ? `${stats.averageQuizScore}%` : '—'}
              subtext={
                stats.quizzesCompleted > 0
                  ? 'Across completed quizzes'
                  : 'Complete a quiz to track'
              }
              icon={Award}
              accent="success"
            />
          </div>
        )}

        {/* Middle Row: Weekly Chart + Daily Goal & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Weekly Study Activity */}
          <section className="lg:col-span-7 bg-white border border-[#E5E1D8] rounded-lg p-6 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#172B4D]">
                  Weekly Study Activity
                </h3>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Study sessions logged over the past 7 days
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-[#F7F4EC] border border-[#E5E1D8] text-[#172B4D]">
                Last 7 Days
              </span>
            </div>

            {loading ? (
              <div className="h-44 bg-[#F7F4EC] rounded animate-pulse" />
            ) : (
              <div className="h-48 flex items-end justify-between gap-2 sm:gap-4 pt-4">
                {weeklyActivity.map((day) => {
                  const heightPct = Math.max(8, Math.round((day.count / maxWeeklyCount) * 100));
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                      <span className="text-xs font-semibold text-[#172B4D]">
                        {day.count > 0 ? day.count : ''}
                      </span>
                      <div className="w-full max-w-[40px] bg-[#F7F4EC] rounded-t-md h-32 flex items-end overflow-hidden border border-[#E5E1D8]/70">
                        <div
                          className={`w-full rounded-t-md transition-all duration-300 ${
                            day.count > 0 ? 'bg-[#172B4D]' : 'bg-[#E5E1D8]/60'
                          }`}
                          style={{ height: `${day.count > 0 ? heightPct : 6}%` }}
                          title={`${day.label}: ${day.count} sessions`}
                        />
                      </div>
                      <span className="text-xs font-medium text-[#6B7280]">{day.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Learning Progress & Quick Actions */}
          <section className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-[#E5E1D8] rounded-lg p-6 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-lg text-[#172B4D]">
                  Daily Learning Goal
                </h3>
                <span className="text-xs font-semibold text-[#39765B] bg-[#39765B]/10 px-2.5 py-1 rounded">
                  {stats.completedToday} / {stats.dailyGoal} today
                </span>
              </div>
              <div className="w-full bg-[#F7F4EC] border border-[#E5E1D8] rounded-full h-2.5 mt-4 overflow-hidden">
                <div
                  className="bg-[#C49A45] h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="text-xs text-[#6B7280] mt-2.5">
                {progressPct >= 100
                  ? 'Daily academic target achieved!'
                  : `${Math.max(0, stats.dailyGoal - stats.completedToday)} more study activities to reach today’s goal.`}
              </p>
            </div>

            <div className="bg-white border border-[#E5E1D8] rounded-lg p-6 shadow-xs">
              <h3 className="font-serif font-bold text-lg text-[#172B4D] mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/notes"
                  className="p-3 rounded-md border border-[#E5E1D8] hover:border-[#172B4D] hover:bg-[#F7F4EC]/60 transition flex items-center gap-2.5 text-sm font-medium text-[#172B4D]"
                >
                  <BookText className="w-4 h-4 text-[#C49A45]" />
                  <span>AI Notes</span>
                </Link>
                <Link
                  to="/quiz"
                  className="p-3 rounded-md border border-[#E5E1D8] hover:border-[#172B4D] hover:bg-[#F7F4EC]/60 transition flex items-center gap-2.5 text-sm font-medium text-[#172B4D]"
                >
                  <ClipboardCheck className="w-4 h-4 text-[#294C73]" />
                  <span>AI Quiz</span>
                </Link>
                <Link
                  to="/flashcards"
                  className="p-3 rounded-md border border-[#E5E1D8] hover:border-[#172B4D] hover:bg-[#F7F4EC]/60 transition flex items-center gap-2.5 text-sm font-medium text-[#172B4D]"
                >
                  <Layers className="w-4 h-4 text-[#39765B]" />
                  <span>Flashcards</span>
                </Link>
                <Link
                  to="/materials"
                  className="p-3 rounded-md border border-[#E5E1D8] hover:border-[#172B4D] hover:bg-[#F7F4EC]/60 transition flex items-center gap-2.5 text-sm font-medium text-[#172B4D]"
                >
                  <FolderOpen className="w-4 h-4 text-[#172B4D]" />
                  <span>Upload PDF</span>
                </Link>
              </div>
            </div>
          </section>
        </div>

        {/* Bottom Row: Continue Learning + Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Continue Learning */}
          <section className="bg-white border border-[#E5E1D8] rounded-lg p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold text-lg text-[#172B4D]">Continue Learning</h3>
              <Link
                to="/notes"
                className="text-xs font-semibold text-[#294C73] hover:text-[#172B4D] inline-flex items-center gap-1"
              >
                All Notes <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-16 bg-[#F7F4EC] rounded animate-pulse" />
                ))}
              </div>
            ) : (data?.continueLearning || []).length === 0 ? (
              <div className="text-center py-8 border border-dashed border-[#E5E1D8] rounded-lg">
                <FileText className="w-8 h-8 text-[#6B7280] mx-auto mb-2 opacity-60" />
                <p className="text-sm font-medium text-[#172B4D]">No saved notes yet</p>
                <p className="text-xs text-[#6B7280] mt-1">
                  Generate your first AI revision kit to see it here.
                </p>
                <Link
                  to="/notes"
                  className="inline-block mt-3 text-xs font-semibold text-[#294C73] hover:underline"
                >
                  Create AI Notes →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {data.continueLearning.map((note) => (
                  <Link
                    key={note._id}
                    to={`/notes?id=${note._id}`}
                    className="block p-4 rounded-md border border-[#E5E1D8] hover:border-[#294C73] hover:bg-[#F7F4EC]/50 transition"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-serif font-bold text-sm text-[#172B4D] truncate">
                        {note.topicTitle}
                      </p>
                      <span className="text-[11px] text-[#6B7280] shrink-0">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-[#6B7280] mt-1">
                      {note.flashcards?.length || 0} flashcards · {note.shortQuestions?.length || 0} exam questions
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Recent Study Sessions */}
          <section className="bg-white border border-[#E5E1D8] rounded-lg p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold text-lg text-[#172B4D]">Recent Study Sessions</h3>
              <Link
                to="/history"
                className="text-xs font-semibold text-[#294C73] hover:text-[#172B4D] inline-flex items-center gap-1"
              >
                Full History <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-[#F7F4EC] rounded animate-pulse" />
                ))}
              </div>
            ) : (data?.recentSessions || []).length === 0 ? (
              <div className="text-center py-8 border border-dashed border-[#E5E1D8] rounded-lg">
                <Clock className="w-8 h-8 text-[#6B7280] mx-auto mb-2 opacity-60" />
                <p className="text-sm font-medium text-[#172B4D]">No recent activity recorded</p>
                <p className="text-xs text-[#6B7280] mt-1">
                  Your notes, quizzes, flashcards, and PDF sessions will appear here.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-[#E5E1D8]">
                {data.recentSessions.map((session) => (
                  <li key={session._id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#172B4D] truncate">{session.topic}</p>
                      <p className="text-xs text-[#6B7280] capitalize">
                        {session.type.replace('_', ' ')} ·{' '}
                        {new Date(session.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {session.score !== null && session.score !== undefined ? (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded bg-[#39765B]/10 text-[#39765B] shrink-0">
                        {session.score}%
                      </span>
                    ) : (
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#F7F4EC] border border-[#E5E1D8] text-[#6B7280] capitalize shrink-0">
                        {session.type.replace('_', ' ')}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;
