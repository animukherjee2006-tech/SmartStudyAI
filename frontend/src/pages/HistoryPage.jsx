import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { History, Search, Trash2, Award, BookText, Filter } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import ConfirmationModal from '../components/ConfirmationModal';
import { useNotification } from '../context/NotificationContext';
import { dashboardApi } from '../services/api';

function HistoryPage() {
  const notify = useNotification();
  const [searchParams] = useSearchParams();

  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [dateFrom, setDateFrom] = useState('');

  const [data, setData] = useState({ sessions: [], quizResults: [], notes: [] });
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadHistory = useCallback(async () => {
    try {
      const res = await dashboardApi.history({ type: typeFilter, search, dateFrom });
      setData({
        sessions: res.sessions || [],
        quizResults: res.quizResults || [],
        notes: res.notes || [],
      });
    } catch (err) {
      notify.error(err.message || 'Failed to load study history.');
    } finally {
      setLoading(false);
    }
  }, [typeFilter, search, dateFrom, notify]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await dashboardApi.deleteHistory(deleteTarget._id);
      setData((prev) => ({
        ...prev,
        sessions: prev.sessions.filter((s) => s._id !== deleteTarget._id),
      }));
      notify.success('History entry deleted.');
      setDeleteTarget(null);
    } catch (err) {
      notify.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  // Compute topic-wise quiz performance
  const topicPerformance = data.quizResults.reduce((acc, r) => {
    if (!acc[r.topic]) {
      acc[r.topic] = { attempts: 0, totalPct: 0 };
    }
    acc[r.topic].attempts += 1;
    acc[r.topic].totalPct += r.percentage || 0;
    return acc;
  }, {});

  const topicRows = Object.entries(topicPerformance).map(([topic, info]) => ({
    topic,
    attempts: info.attempts,
    avg: Math.round(info.totalPct / info.attempts),
  }));

  return (
    <DashboardLayout pageTitle="Study History">
      <div className="space-y-6">
        {/* Filters */}
        <section className="bg-white border border-[#E5E1D8] rounded-lg p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[#172B4D]">
            <Filter className="w-4 h-4 text-[#C49A45]" />
            <h2 className="font-serif font-bold text-base">Filter Activity</h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 flex-1 justify-end">
            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by topic..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-[#E5E1D8] rounded-md bg-[#F7F4EC]/50 focus:outline-none"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-[#E5E1D8] rounded-md bg-white"
            >
              <option value="all">All Activities</option>
              <option value="notes">AI Notes</option>
              <option value="quiz">Quizzes</option>
              <option value="flashcards">Flashcards</option>
              <option value="material">PDF Uploads</option>
              <option value="rag_chat">PDF Q&A</option>
            </select>

            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 text-sm border border-[#E5E1D8] rounded-md bg-white"
              aria-label="Filter from date"
            />
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Activity Timeline */}
          <section className="lg:col-span-8 bg-white border border-[#E5E1D8] rounded-lg p-6 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E5E1D8] mb-4">
              <History className="w-4 h-4 text-[#C49A45]" />
              <h3 className="font-serif font-bold text-lg text-[#172B4D]">
                Study Sessions ({data.sessions.length})
              </h3>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-14 bg-[#F7F4EC] rounded animate-pulse" />
                ))}
              </div>
            ) : data.sessions.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-[#E5E1D8] rounded-lg">
                <p className="text-sm font-medium text-[#172B4D]">No matching study sessions</p>
                <p className="text-xs text-[#6B7280] mt-1">
                  Try clearing your filters or start a new study session.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-[#E5E1D8]">
                {data.sessions.map((item) => (
                  <li key={item._id} className="py-3.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-[#172B4D] truncate">{item.topic}</p>
                      <p className="text-xs text-[#6B7280] mt-0.5 capitalize">
                        {item.type.replace('_', ' ')} ·{' '}
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {item.score !== null && item.score !== undefined && (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded bg-[#39765B]/10 text-[#39765B]">
                          {item.score}%
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(item)}
                        className="text-[#6B7280] hover:text-[#B94A48] p-1"
                        aria-label="Delete history entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Topic Performance & Saved Notes Quick Links */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-[#E5E1D8] rounded-lg p-5 shadow-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-[#E5E1D8] mb-3">
                <Award className="w-4 h-4 text-[#C49A45]" />
                <h3 className="font-serif font-bold text-base text-[#172B4D]">
                  Topic-Wise Quiz Performance
                </h3>
              </div>

              {topicRows.length === 0 ? (
                <p className="text-xs text-[#6B7280] py-4 text-center">
                  Complete quizzes to see topic-wise averages.
                </p>
              ) : (
                <ul className="space-y-3">
                  {topicRows.map((row) => (
                    <li key={row.topic} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium text-[#172B4D]">
                        <span className="truncate pr-2">{row.topic}</span>
                        <span className="shrink-0 font-semibold">{row.avg}%</span>
                      </div>
                      <div className="w-full bg-[#F7F4EC] rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-[#172B4D] h-full rounded-full"
                          style={{ width: `${row.avg}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-white border border-[#E5E1D8] rounded-lg p-5 shadow-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-[#E5E1D8] mb-3">
                <BookText className="w-4 h-4 text-[#294C73]" />
                <h3 className="font-serif font-bold text-base text-[#172B4D]">
                  Recent Notes ({data.notes.length})
                </h3>
              </div>
              {data.notes.length === 0 ? (
                <p className="text-xs text-[#6B7280] py-3 text-center">No saved notes yet.</p>
              ) : (
                <ul className="space-y-2">
                  {data.notes.slice(0, 5).map((note) => (
                    <li key={note._id}>
                      <Link
                        to={`/notes?id=${note._id}`}
                        className="block text-sm font-medium text-[#294C73] hover:text-[#172B4D] hover:underline truncate"
                      >
                        {note.topicTitle}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      </div>

      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        title="Remove History Entry"
        message={`Remove "${deleteTarget?.topic}" from your activity timeline?`}
        confirmLabel="Remove"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </DashboardLayout>
  );
}

export default HistoryPage;
