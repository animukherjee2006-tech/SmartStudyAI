import React, { useState, useEffect, useCallback } from 'react';
import {
  Upload,
  FileText,
  Search,
  ExternalLink,
  Trash2,
  MessageSquare,
  Send,
  BookOpen,
} from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import ConfirmationModal from '../components/ConfirmationModal';
import { useNotification } from '../context/NotificationContext';
import { materialApi } from '../services/api';

const SUBJECTS = ['All', 'General', 'Computer Science', 'Biology', 'Chemistry', 'Physics', 'Mathematics', 'Economics', 'History'];

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function MaterialsPage() {
  const notify = useNotification();

  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');

  // Upload state
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('General');
  const [uploading, setUploading] = useState(false);

  // RAG Q&A Assistant state
  const [activeMaterial, setActiveMaterial] = useState(null);
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [asking, setAsking] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadMaterials = useCallback(async () => {
    try {
      const res = await materialApi.list({ search, subject: subjectFilter });
      setMaterials(res.materials || []);
    } catch (err) {
      notify.error(err.message || 'Failed to load study materials.');
    } finally {
      setLoading(false);
    }
  }, [search, subjectFilter, notify]);

  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      notify.error('Please select a PDF file first.');
      return;
    }
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      notify.error('Only PDF files are supported.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      notify.error('File size must be under 10 MB.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    if (title.trim()) formData.append('title', title.trim());
    formData.append('subject', subject);

    setUploading(true);
    try {
      const res = await materialApi.upload(formData);
      notify.success(res.message || 'PDF uploaded and indexed.');
      setFile(null);
      setTitle('');
      loadMaterials();
    } catch (err) {
      notify.error(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!activeMaterial || question.trim().length < 3) return;

    const q = question.trim();
    setQuestion('');
    setChatHistory((prev) => [...prev, { role: 'user', text: q }]);
    setAsking(true);

    try {
      const res = await materialApi.chat(activeMaterial._id, q);
      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', text: res.answer, sources: res.sources || [] },
      ]);
    } catch (err) {
      notify.error(err.message || 'Could not retrieve answer.');
      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', text: err.message || 'Error answering question.' },
      ]);
    } finally {
      setAsking(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await materialApi.delete(deleteTarget._id);
      setMaterials((prev) => prev.filter((m) => m._id !== deleteTarget._id));
      if (activeMaterial?._id === deleteTarget._id) {
        setActiveMaterial(null);
        setChatHistory([]);
      }
      notify.success('Document deleted.');
      setDeleteTarget(null);
    } catch (err) {
      notify.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout pageTitle="My Study Materials">
      <div className="space-y-6">
        {/* Upload Panel */}
        <section className="bg-white border border-[#E5E1D8] rounded-lg p-6 shadow-xs">
          <div className="flex items-center gap-2.5 mb-4">
            <Upload className="w-5 h-5 text-[#C49A45]" />
            <h2 className="font-serif font-bold text-lg text-[#172B4D]">
              Upload Course PDF
            </h2>
          </div>

          <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                PDF Document (Max 10MB)
              </label>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-[#172B4D] file:mr-3 file:py-2 file:px-3.5 file:rounded-md file:border file:border-[#E5E1D8] file:text-xs file:font-semibold file:bg-[#F7F4EC] file:text-[#172B4D] hover:file:bg-[#EDE8DC]"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                Document Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Optional custom title"
                className="w-full px-3.5 py-2 text-sm border border-[#E5E1D8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#294C73]/40"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-[#E5E1D8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#294C73]/40"
              >
                {SUBJECTS.filter((s) => s !== 'All').map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={uploading}
                className="w-full py-2.5 px-4 rounded-md bg-[#172B4D] hover:bg-[#10213A] disabled:opacity-60 text-white text-sm font-semibold transition"
              >
                {uploading ? 'Indexing...' : 'Upload PDF'}
              </button>
            </div>
          </form>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Document List */}
          <section className="lg:col-span-7 bg-white border border-[#E5E1D8] rounded-lg p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-serif font-bold text-lg text-[#172B4D]">
                Document Library ({materials.length})
              </h3>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search files..."
                    className="pl-9 pr-3 py-1.5 text-sm border border-[#E5E1D8] rounded-md bg-[#F7F4EC]/50 focus:outline-none"
                  />
                </div>
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-[#E5E1D8] rounded-md bg-white"
                >
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-[#F7F4EC] rounded animate-pulse" />
                ))}
              </div>
            ) : materials.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-[#E5E1D8] rounded-lg">
                <FileText className="w-9 h-9 text-[#6B7280] mx-auto mb-2 opacity-60" />
                <p className="text-sm font-medium text-[#172B4D]">No study materials found</p>
                <p className="text-xs text-[#6B7280] mt-1">
                  Upload a PDF above to extract text, generate notes, or ask AI questions.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-[#E5E1D8]">
                {materials.map((mat) => (
                  <li key={mat._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm text-[#172B4D] truncate">{mat.title}</p>
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                            mat.status === 'ready'
                              ? 'bg-[#39765B]/10 text-[#39765B]'
                              : 'bg-[#B94A48]/10 text-[#B94A48]'
                          }`}
                        >
                          {mat.status === 'ready' ? 'Indexed' : 'Error'}
                        </span>
                      </div>
                      <p className="text-xs text-[#6B7280] mt-1">
                        {mat.subject} · {formatBytes(mat.fileSize)} · {mat.pageCount || 1} pages ·{' '}
                        {new Date(mat.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveMaterial(mat);
                          setChatHistory([]);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-[#294C73] text-[#294C73] hover:bg-[#294C73] hover:text-white text-xs font-semibold transition"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Ask AI
                      </button>
                      <a
                        href={materialApi.downloadUrl(mat._id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-[#E5E1D8] text-[#172B4D] hover:bg-[#F7F4EC] text-xs font-semibold transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Open
                      </a>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(mat)}
                        className="p-1.5 text-[#6B7280] hover:text-[#B94A48]"
                        aria-label="Delete material"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* RAG PDF Assistant */}
          <section className="lg:col-span-5 bg-white border border-[#E5E1D8] rounded-lg shadow-xs flex flex-col h-[520px] overflow-hidden">
            <div className="bg-[#172B4D] px-5 py-4 text-white">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#C49A45]" />
                <h3 className="font-serif font-bold text-base">PDF Research Assistant (RAG)</h3>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 truncate">
                {activeMaterial
                  ? `Grounded in: ${activeMaterial.title}`
                  : 'Select "Ask AI" on any indexed PDF to begin'}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F7F4EC]/40">
              {!activeMaterial ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                  <MessageSquare className="w-8 h-8 text-[#6B7280] opacity-50 mb-2" />
                  <p className="text-sm font-medium text-[#172B4D]">No document selected</p>
                  <p className="text-xs text-[#6B7280] mt-1">
                    Click "Ask AI" next to any uploaded PDF to query its contents with cited
                    excerpts.
                  </p>
                </div>
              ) : chatHistory.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <p className="text-xs text-[#6B7280]">
                    Ask a question about <strong className="text-[#172B4D]">{activeMaterial.title}</strong>.
                    Answers are strictly grounded in your document chunks.
                  </p>
                </div>
              ) : (
                chatHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-lg text-sm ${
                      msg.role === 'user'
                        ? 'bg-[#172B4D] text-white ml-8'
                        : 'bg-white border border-[#E5E1D8] text-[#172B4D] mr-4'
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    {msg.sources?.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-[#E5E1D8] space-y-1">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#C49A45]">
                          Source Excerpts
                        </p>
                        {msg.sources.map((src, sIdx) => (
                          <p key={sIdx} className="text-[11px] text-[#6B7280]">
                            <strong>Section #{src.section}:</strong> {src.excerpt}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
              {asking && (
                <div className="p-3 rounded-lg bg-white border border-[#E5E1D8] text-xs text-[#6B7280] mr-8 animate-pulse">
                  Searching document chunks and synthesizing answer...
                </div>
              )}
            </div>

            <form
              onSubmit={handleAskQuestion}
              className="p-3 bg-white border-t border-[#E5E1D8] flex items-center gap-2"
            >
              <input
                type="text"
                disabled={!activeMaterial || asking}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={
                  activeMaterial ? 'Ask a question about this PDF...' : 'Select a PDF first...'
                }
                className="flex-1 px-3.5 py-2 text-sm border border-[#E5E1D8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#294C73]/40 disabled:bg-[#F1F3F5]"
              />
              <button
                type="submit"
                disabled={!activeMaterial || asking || question.trim().length < 3}
                className="p-2.5 rounded-md bg-[#172B4D] hover:bg-[#10213A] disabled:opacity-50 text-white transition"
                aria-label="Send question"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </section>
        </div>
      </div>

      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Study Material"
        message={`Permanently delete "${deleteTarget?.title}" and its indexed excerpts?`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </DashboardLayout>
  );
}

export default MaterialsPage;
