import React, { useState, useEffect, useCallback } from 'react';
import {
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Trash2,
  Award,
} from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import ConfirmationModal from '../components/ConfirmationModal';
import { useNotification } from '../context/NotificationContext';
import { aiApi, quizApi, materialApi } from '../services/api';

function QuizPage() {
  const notify = useNotification();

  const [notes, setNotes] = useState('');
  const [materials, setMaterials] = useState([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [loading, setLoading] = useState(false);

  const [quizData, setQuizData] = useState(null);
  const [quizId, setQuizId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [savingResult, setSavingResult] = useState(false);
  const [error, setError] = useState('');

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [histRes, matRes] = await Promise.all([
        quizApi.history(),
        materialApi.list(),
      ]);
      setHistory(histRes.results || []);
      setMaterials((matRes.materials || []).filter((m) => m.status === 'ready'));
    } catch {
      // Silent background load
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleGenerateQuiz = async () => {
    setError('');
    if (!selectedMaterialId && notes.trim().length < 20) {
      setError('Please enter at least 20 characters of study material or select an uploaded PDF.');
      return;
    }

    setLoading(true);
    setSubmitted(false);
    setSelectedAnswers({});
    setCurrentIndex(0);

    try {
      const payload = selectedMaterialId
        ? { materialId: selectedMaterialId }
        : { notes: notes.trim() };
      const res = await aiApi.generateQuiz(payload);
      if (!res.data?.mcqs?.length) {
        throw new Error('No questions were generated. Please try richer study notes.');
      }
      setQuizData(res.data);
      setQuizId(res.quizId || null);
      notify.success('Quiz generated! Good luck.');
    } catch (err) {
      setError(err.message || 'Failed to generate quiz.');
      notify.error(err.message || 'Failed to generate quiz.');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (qIdx, optIdx) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
    setError('');
  };

  const calculateScore = () => {
    if (!quizData) return 0;
    return quizData.mcqs.reduce((acc, q, idx) => {
      return selectedAnswers[idx] === q.correct_index ? acc + 1 : acc;
    }, 0);
  };

  const handleSubmitQuiz = async () => {
    if (!quizData) return;
    if (Object.keys(selectedAnswers).length < quizData.mcqs.length) {
      setError('Please answer all questions before submitting the quiz.');
      return;
    }

    setError('');
    setSubmitted(true);
    setSavingResult(true);

    const score = calculateScore();
    const answers = quizData.mcqs.map((q, idx) => ({
      questionIndex: idx,
      selectedOption: selectedAnswers[idx],
      correctOption: q.correct_index,
      isCorrect: selectedAnswers[idx] === q.correct_index,
    }));

    try {
      await quizApi.saveResult({
        quizId,
        topic: quizData.topic || 'Practice Quiz',
        score,
        totalQuestions: quizData.mcqs.length,
        answers,
      });
      notify.success(`Quiz submitted! Score: ${score}/${quizData.mcqs.length}`);
      loadData();
    } catch (err) {
      notify.error(err.message || 'Score calculated, but could not save to history.');
    } finally {
      setSavingResult(false);
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setCurrentIndex(0);
    setError('');
  };

  const handleNewQuiz = () => {
    setQuizData(null);
    setQuizId(null);
    setSelectedAnswers({});
    setSubmitted(false);
    setCurrentIndex(0);
    setError('');
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await quizApi.deleteResult(deleteTarget._id);
      setHistory((prev) => prev.filter((r) => r._id !== deleteTarget._id));
      notify.success('Quiz result removed.');
      setDeleteTarget(null);
    } catch (err) {
      notify.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const currentQuestion = quizData?.mcqs?.[currentIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const totalQuestions = quizData?.mcqs?.length || 0;
  const score = calculateScore();

  return (
    <DashboardLayout pageTitle="AI Quiz">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Quiz Area */}
        <div className="lg:col-span-8 space-y-6">
          {!quizData && !loading && (
            <section className="bg-white border border-[#E5E1D8] rounded-lg shadow-xs overflow-hidden">
              <div className="bg-[#172B4D] px-6 py-4 text-white">
                <h2 className="font-serif font-bold text-lg">AI Examination Generator</h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Generate multiple-choice questions with explanations from your notes or PDFs
                </p>
              </div>

              <div className="p-6 space-y-4">
                {materials.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                      Select Uploaded PDF (Optional)
                    </label>
                    <select
                      value={selectedMaterialId}
                      onChange={(e) => {
                        setSelectedMaterialId(e.target.value);
                        setError('');
                      }}
                      className="w-full px-3.5 py-2 text-sm bg-[#F7F4EC] border border-[#E5E1D8] rounded-md text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#294C73]/40"
                    >
                      <option value="">— Paste custom study material below —</option>
                      {materials.map((mat) => (
                        <option key={mat._id} value={mat._id}>
                          {mat.title} ({mat.subject})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {!selectedMaterialId && (
                  <div>
                    <label className="block text-sm font-semibold text-[#172B4D] mb-1.5">
                      Study Material
                    </label>
                    <textarea
                      rows={9}
                      maxLength={30000}
                      value={notes}
                      onChange={(e) => {
                        setNotes(e.target.value);
                        setError('');
                      }}
                      placeholder="Paste your chapter notes or lecture summary here (minimum 20 characters)..."
                      className="w-full p-4 text-sm bg-[#F7F4EC]/40 border border-[#E5E1D8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#294C73]/40 resize-y"
                    />
                    <div className="flex justify-between text-xs text-[#6B7280] mt-1.5">
                      <span>Minimum 20 characters</span>
                      <span>{notes.length} / 30,000</span>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-3 rounded-md bg-[#B94A48]/10 border border-[#B94A48]/30 text-sm text-[#B94A48]">
                    {error}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleGenerateQuiz}
                  className="w-full py-3 px-4 rounded-md bg-[#172B4D] hover:bg-[#10213A] text-white text-sm font-semibold flex items-center justify-center gap-2 transition"
                >
                  <ClipboardCheck className="w-4 h-4 text-[#C49A45]" />
                  <span>Generate Quiz</span>
                </button>
              </div>
            </section>
          )}

          {loading && (
            <div className="bg-white border border-[#E5E1D8] rounded-lg p-6 space-y-4 animate-pulse">
              <div className="h-6 bg-[#E5E1D8] rounded w-1/3" />
              <div className="h-4 bg-[#E5E1D8] rounded w-2/3" />
              <div className="space-y-2.5 pt-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 bg-[#F7F4EC] rounded" />
                ))}
              </div>
            </div>
          )}

          {quizData && !loading && (
            <div className="space-y-5">
              {/* Quiz Header & Progress */}
              <div className="bg-white border border-[#E5E1D8] rounded-lg overflow-hidden shadow-xs">
                <div className="bg-[#172B4D] px-6 py-4 text-white flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-widest text-[#C49A45] font-semibold">
                      Academic Assessment
                    </p>
                    <h2 className="font-serif font-bold text-lg sm:text-xl mt-0.5">
                      {quizData.topic || 'Practice Quiz'}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={handleNewQuiz}
                    className="text-xs font-semibold px-3 py-1.5 rounded border border-white/30 hover:bg-white hover:text-[#172B4D] transition"
                  >
                    New Material
                  </button>
                </div>

                <div className="px-6 py-3 bg-[#F7F4EC] border-t border-[#E5E1D8] flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-[#172B4D]">
                    Question {currentIndex + 1} of {totalQuestions} · {answeredCount} answered
                  </span>

                  <div className="flex flex-wrap gap-1.5">
                    {quizData.mcqs.map((_, idx) => {
                      const isCurrent = idx === currentIndex;
                      const isAnswered = selectedAnswers[idx] !== undefined;
                      const isCorrect =
                        submitted && selectedAnswers[idx] === quizData.mcqs[idx].correct_index;

                      let pillClass = 'bg-white border-[#E5E1D8] text-[#6B7280]';
                      if (submitted) {
                        pillClass = isCorrect
                          ? 'bg-[#39765B] border-[#39765B] text-white'
                          : 'bg-[#B94A48] border-[#B94A48] text-white';
                      } else if (isCurrent) {
                        pillClass = 'bg-[#172B4D] border-[#172B4D] text-white';
                      } else if (isAnswered) {
                        pillClass = 'bg-[#294C73]/15 border-[#294C73] text-[#172B4D]';
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCurrentIndex(idx)}
                          className={`w-7 h-7 rounded text-xs font-semibold border transition ${pillClass}`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Submitted Score Summary */}
              {submitted && (
                <div className="bg-white border border-[#E5E1D8] rounded-lg p-6 text-center shadow-xs">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#C49A45]">
                    Examination Result
                  </p>
                  <p className="font-serif text-4xl font-bold text-[#172B4D] mt-2">
                    {score} / {totalQuestions}{' '}
                    <span className="text-xl text-[#39765B]">
                      ({Math.round((score / totalQuestions) * 100)}%)
                    </span>
                  </p>
                  <p className="text-xs text-[#6B7280] mt-1">
                    {savingResult ? 'Saving result...' : 'Result saved to your Study History.'}
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleRetake}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-[#E5E1D8] hover:border-[#172B4D] text-sm font-semibold text-[#172B4D]"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Retake Quiz
                    </button>
                    <button
                      type="button"
                      onClick={handleNewQuiz}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#172B4D] hover:bg-[#10213A] text-white text-sm font-semibold"
                    >
                      New Quiz
                    </button>
                  </div>
                </div>
              )}

              {/* Active Question Card */}
              {currentQuestion && (
                <section className="bg-white border border-[#E5E1D8] rounded-lg p-6 shadow-xs">
                  <h3 className="font-serif font-bold text-base sm:text-lg text-[#172B4D] leading-relaxed mb-5">
                    {currentIndex + 1}. {currentQuestion.question}
                  </h3>

                  <div className="space-y-3">
                    {currentQuestion.options.map((opt, optIdx) => {
                      const isSelected = selectedAnswers[currentIndex] === optIdx;
                      const isCorrect = currentQuestion.correct_index === optIdx;

                      let optionStyle =
                        'border-[#E5E1D8] bg-white hover:bg-[#F7F4EC]/70 text-[#172B4D]';

                      if (submitted) {
                        if (isCorrect) {
                          optionStyle = 'border-[#39765B] bg-[#39765B]/10 text-[#172B4D]';
                        } else if (isSelected) {
                          optionStyle = 'border-[#B94A48] bg-[#B94A48]/10 text-[#172B4D]';
                        }
                      } else if (isSelected) {
                        optionStyle = 'border-[#294C73] bg-[#294C73]/10 text-[#172B4D]';
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={submitted}
                          onClick={() => handleOptionSelect(currentIndex, optIdx)}
                          className={`w-full text-left p-3.5 rounded-md border text-sm flex items-center justify-between gap-3 transition ${optionStyle}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-full border border-current flex items-center justify-center text-xs font-bold shrink-0">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{opt}</span>
                          </div>
                          {submitted && isCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-[#39765B] shrink-0" />
                          )}
                          {submitted && isSelected && !isCorrect && (
                            <XCircle className="w-4 h-4 text-[#B94A48] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {submitted && currentQuestion.explanation && (
                    <div className="mt-5 p-4 rounded-r-md bg-[#F7F4EC] border-l-4 border-[#C49A45]">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#172B4D]">
                        Explanation
                      </p>
                      <p className="text-sm text-[#374151] mt-1 leading-relaxed">
                        {currentQuestion.explanation}
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="mt-4 p-3 rounded-md bg-[#B94A48]/10 border border-[#B94A48]/30 text-sm text-[#B94A48]">
                      {error}
                    </div>
                  )}

                  {/* Navigation Footer */}
                  <div className="mt-6 pt-4 border-t border-[#E5E1D8] flex items-center justify-between gap-3">
                    <button
                      type="button"
                      disabled={currentIndex === 0}
                      onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-[#E5E1D8] text-sm font-medium text-[#172B4D] hover:bg-[#F7F4EC] disabled:opacity-40 transition"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>

                    <div className="flex items-center gap-3">
                      {!submitted && currentIndex === totalQuestions - 1 && (
                        <button
                          type="button"
                          onClick={handleSubmitQuiz}
                          className="px-5 py-2 rounded-md bg-[#39765B] hover:bg-[#2d5e48] text-white text-sm font-semibold transition"
                        >
                          Submit Quiz
                        </button>
                      )}

                      {currentIndex < totalQuestions - 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setCurrentIndex((i) => Math.min(totalQuestions - 1, i + 1))
                          }
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#172B4D] hover:bg-[#10213A] text-white text-sm font-semibold transition"
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </section>
              )}
            </div>
          )}
        </div>

        {/* Quiz History Sidebar */}
        <aside className="lg:col-span-4">
          <div className="bg-white border border-[#E5E1D8] rounded-lg p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#E5E1D8]">
              <Award className="w-4 h-4 text-[#C49A45]" />
              <h3 className="font-serif font-bold text-base text-[#172B4D]">Quiz History</h3>
            </div>

            {loadingHistory ? (
              <div className="space-y-2.5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-[#F7F4EC] rounded animate-pulse" />
                ))}
              </div>
            ) : history.length === 0 ? (
              <p className="text-xs text-[#6B7280] text-center py-6">
                Completed quizzes and scores will appear here.
              </p>
            ) : (
              <ul className="space-y-2.5 max-h-[540px] overflow-y-auto pr-1">
                {history.map((res) => (
                  <li
                    key={res._id}
                    className="p-3 rounded-md border border-[#E5E1D8] bg-[#F7F4EC]/40 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-[#172B4D] truncate">{res.topic}</p>
                      <p className="text-[11px] text-[#6B7280] mt-0.5">
                        {res.score}/{res.totalQuestions} ({res.percentage}%) ·{' '}
                        {new Date(res.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(res)}
                      className="text-[#6B7280] hover:text-[#B94A48] p-1 shrink-0"
                      aria-label="Delete quiz result"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>

      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Quiz Result"
        message={`Remove "${deleteTarget?.topic}" from your quiz history?`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </DashboardLayout>
  );
}

export default QuizPage;
