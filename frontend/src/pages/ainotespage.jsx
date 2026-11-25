import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  Copy,
  Download,
  Mic,
  MicOff,
  Volume2,
  Square,
  BookOpen,
  Trash2,
  FileText,
  ChevronDown,
  ChevronUp,
  Layers,
} from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import ConfirmationModal from '../components/ConfirmationModal';
import { useNotification } from '../context/NotificationContext';
import { aiApi, notesApi, materialApi, flashcardApi } from '../services/api';

const SAMPLE_NOTES = `Photosynthesis is the process by which green plants, algae, and certain bacteria convert light energy into chemical energy. It takes place primarily in the chloroplasts of plant leaves, utilizing the green pigment chlorophyll. The overall chemical equation is: 6CO2 + 6H2O + Light Energy -> C6H12O6 + 6O2. Photosynthesis occurs in two main stages: the light-dependent reactions (in the thylakoid membranes), which generate ATP and NADPH while splitting water to release oxygen, and the Calvin Cycle or light-independent reactions (in the stroma), which use ATP and NADPH to fix carbon dioxide into glucose.`;

function AinotesPage() {
  const notify = useNotification();
  const [searchParams] = useSearchParams();

  const [notesInput, setNotesInput] = useState('');
  const [materials, setMaterials] = useState([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [savedNotesList, setSavedNotesList] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(true);

  const [generating, setGenerating] = useState(false);
  const [studyData, setStudyData] = useState(null);
  const [revealedAnswers, setRevealedAnswers] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  // Voice System states (TTS + STT preserved)
  const [ttsSupported, setTtsSupported] = useState(false);
  const [sttSupported, setSttSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    setTtsSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);
    const SR =
      typeof window !== 'undefined' &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);
    setSttSupported(Boolean(SR));
  }, []);

  const loadLibrary = useCallback(async () => {
    try {
      const [notesRes, matRes] = await Promise.all([
        notesApi.list(),
        materialApi.list(),
      ]);
      setSavedNotesList(notesRes.notes || []);
      setMaterials((matRes.materials || []).filter((m) => m.status === 'ready'));
    } catch {
      // Ignore silent background load error
    } finally {
      setLoadingSaved(false);
    }
  }, []);

  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  // Load specific note if ?id=... is in URL
  useEffect(() => {
    const id = searchParams.get('id');
    if (!id) return;
    notesApi
      .get(id)
      .then((res) => {
        if (res.note) {
          setStudyData({
            topic_title: res.note.topicTitle,
            quick_summary: res.note.quickSummary || [],
            important_concepts: res.note.importantConcepts || [],
            detailed_explanations: res.note.detailedExplanations || [],
            key_points: res.note.keyPoints || [],
            definitions: res.note.definitions || [],
            flashcards: res.note.flashcards || [],
            short_questions: res.note.shortQuestions || [],
          });
        }
      })
      .catch(() => {});
  }, [searchParams]);

  const stopSpeaking = useCallback(() => {
    setIsSpeaking(false);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  useEffect(() => {
    return () => {
      stopSpeaking();
      stopListening();
    };
  }, [stopSpeaking, stopListening]);

  const toggleDictation = () => {
    if (!sttSupported) {
      notify.error('Voice dictation is not supported in this browser.');
      return;
    }
    if (isListening) {
      stopListening();
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = true;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      let added = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        if (event.results[i].isFinal) {
          added += `${event.results[i][0].transcript} `;
        }
      }
      if (added.trim()) {
        setNotesInput((prev) => (prev ? `${prev.trim()} ${added.trim()}` : added.trim()));
      }
    };
    recognition.onerror = () => stopListening();
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleReadSummary = () => {
    if (!ttsSupported || !studyData) return;
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    const text = [
      studyData.topic_title,
      ...(studyData.quick_summary || []),
      ...(studyData.key_points || []),
    ].join('. ');
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleGenerateNotes = async () => {
    stopListening();
    stopSpeaking();
    setError('');

    if (!selectedMaterialId && notesInput.trim().length < 20) {
      setError('Please enter at least 20 characters of study material or select an uploaded PDF.');
      return;
    }

    setGenerating(true);
    setRevealedAnswers({});
    try {
      const payload = selectedMaterialId
        ? { materialId: selectedMaterialId }
        : { notes: notesInput.trim() };

      const res = await aiApi.generateNotes(payload);
      setStudyData(res.data);
      notify.success('AI study notes generated and saved to your library.');
      loadLibrary();
    } catch (err) {
      setError(err.message || 'Failed to generate study notes.');
      notify.error(err.message || 'Failed to generate study notes.');
    } finally {
      setGenerating(false);
    }
  };

  const formatPlainText = () => {
    if (!studyData) return '';
    const lines = [
      `# ${studyData.topic_title}`,
      '',
      '## Summary',
      ...(studyData.quick_summary || []).map((s) => `- ${s}`),
      '',
      '## Important Concepts',
      ...(studyData.important_concepts || []).map((c) => `- ${c}`),
      '',
      '## Detailed Explanations',
      ...(studyData.detailed_explanations || []).map((d) => `### ${d.concept}\n${d.explanation}`),
      '',
      '## Key Points',
      ...(studyData.key_points || []).map((k) => `- ${k}`),
      '',
      '## Definitions',
      ...(studyData.definitions || []).map((d) => `- **${d.term}**: ${d.definition}`),
      '',
      '## Exam Preparation Questions',
      ...(studyData.short_questions || []).map(
        (q, i) => `${i + 1}. ${q.question}\n   Model Answer: ${q.model_answer}`
      ),
    ];
    return lines.join('\n');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatPlainText());
      notify.success('Notes copied to clipboard.');
    } catch {
      notify.error('Could not copy notes.');
    }
  };

  const handleDownload = () => {
    const content = formatPlainText();
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(studyData?.topic_title || 'study-notes')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
    notify.success('Notes downloaded.');
  };

  const handleSaveAsFlashcards = async () => {
    if (!studyData?.flashcards?.length) return;
    try {
      await flashcardApi.create({
        title: studyData.topic_title || 'Study Notes Deck',
        subject: 'AI Notes',
        cards: studyData.flashcards,
      });
      notify.success('Flashcards saved to your Flashcards library!');
    } catch (err) {
      notify.error(err.message || 'Could not save flashcards.');
    }
  };

  const handleSelectSavedNote = async (id) => {
    try {
      const res = await notesApi.get(id);
      if (res.note) {
        setStudyData({
          topic_title: res.note.topicTitle,
          quick_summary: res.note.quickSummary || [],
          important_concepts: res.note.importantConcepts || [],
          detailed_explanations: res.note.detailedExplanations || [],
          key_points: res.note.keyPoints || [],
          definitions: res.note.definitions || [],
          flashcards: res.note.flashcards || [],
          short_questions: res.note.shortQuestions || [],
        });
        setRevealedAnswers({});
      }
    } catch (err) {
      notify.error(err.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await notesApi.delete(deleteTarget._id);
      setSavedNotesList((prev) => prev.filter((n) => n._id !== deleteTarget._id));
      notify.success('Saved note deleted.');
      setDeleteTarget(null);
    } catch (err) {
      notify.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout pageTitle="AI Notes">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left/Main Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Input Card */}
          <section className="bg-white border border-[#E5E1D8] rounded-lg shadow-xs overflow-hidden">
            <div className="bg-[#172B4D] px-6 py-4 text-white flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-serif font-bold text-lg">AI Revision Notes Generator</h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Paste study material or select an uploaded PDF to generate structured notes
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedMaterialId('');
                  setNotesInput(SAMPLE_NOTES);
                  setError('');
                }}
                className="text-xs font-semibold px-3 py-1.5 rounded border border-white/30 hover:bg-white hover:text-[#172B4D] transition"
              >
                Load Sample
              </button>
            </div>

            <div className="p-6 space-y-4">
              {materials.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                    Or Generate From Uploaded PDF
                  </label>
                  <select
                    value={selectedMaterialId}
                    onChange={(e) => {
                      setSelectedMaterialId(e.target.value);
                      setError('');
                    }}
                    className="w-full px-3.5 py-2 text-sm bg-[#F7F4EC] border border-[#E5E1D8] rounded-md text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#294C73]/40"
                  >
                    <option value="">— Paste custom text below —</option>
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
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-semibold text-[#172B4D]">
                      Study Material
                    </label>
                    {sttSupported && (
                      <button
                        type="button"
                        onClick={toggleDictation}
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded border transition ${
                          isListening
                            ? 'bg-[#B94A48] text-white border-[#B94A48]'
                            : 'bg-[#F7F4EC] text-[#172B4D] border-[#E5E1D8] hover:border-[#172B4D]'
                        }`}
                      >
                        {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                        {isListening ? 'Stop Dictation' : 'Dictate Notes'}
                      </button>
                    )}
                  </div>

                  <textarea
                    rows={8}
                    maxLength={30000}
                    value={notesInput}
                    onChange={(e) => {
                      setNotesInput(e.target.value);
                      setError('');
                    }}
                    placeholder="Paste lecture notes, textbook excerpts, or chapter concepts here (minimum 20 characters)..."
                    className="w-full p-4 text-sm bg-[#F7F4EC]/40 border border-[#E5E1D8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#294C73]/40 resize-y"
                  />
                  <div className="flex justify-between text-xs text-[#6B7280] mt-1.5">
                    <span>Minimum 20 characters</span>
                    <span>{notesInput.length} / 30,000</span>
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
                onClick={handleGenerateNotes}
                disabled={generating}
                className="w-full py-3 px-4 rounded-md bg-[#172B4D] hover:bg-[#10213A] disabled:opacity-60 text-white text-sm font-semibold flex items-center justify-center gap-2 transition"
              >
                <Sparkles className="w-4 h-4 text-[#C49A45]" />
                <span>{generating ? 'Generating Structured Notes...' : 'Generate Notes'}</span>
              </button>
            </div>
          </section>

          {/* Loading Skeleton */}
          {generating && (
            <div className="bg-white border border-[#E5E1D8] rounded-lg p-6 space-y-4 animate-pulse">
              <div className="h-6 bg-[#E5E1D8] rounded w-1/2" />
              <div className="h-4 bg-[#E5E1D8] rounded w-full" />
              <div className="h-4 bg-[#E5E1D8] rounded w-5/6" />
              <div className="h-24 bg-[#F7F4EC] rounded w-full" />
            </div>
          )}

          {/* Generated Notes Display */}
          {!generating && studyData && (
            <article className="bg-white border border-[#E5E1D8] rounded-lg shadow-xs overflow-hidden">
              <div className="px-6 py-5 bg-[#F7F4EC] border-b border-[#E5E1D8] flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-[#C49A45]">
                    Academic Revision Kit
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#172B4D] mt-1">
                    {studyData.topic_title}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {ttsSupported && (
                    <button
                      type="button"
                      onClick={handleReadSummary}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#E5E1D8] bg-white hover:border-[#172B4D] text-xs font-semibold text-[#172B4D]"
                    >
                      {isSpeaking ? <Square className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      {isSpeaking ? 'Stop Audio' : 'Listen'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#E5E1D8] bg-white hover:border-[#172B4D] text-xs font-semibold text-[#172B4D]"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#172B4D] text-white text-xs font-semibold hover:bg-[#10213A]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-8">
                {/* Summary */}
                {studyData.quick_summary?.length > 0 && (
                  <section>
                    <h4 className="font-serif font-bold text-base text-[#172B4D] border-b border-[#E5E1D8] pb-2 mb-3">
                      Executive Summary
                    </h4>
                    <ul className="space-y-2 list-disc pl-5 text-sm text-[#374151] leading-relaxed">
                      {studyData.quick_summary.map((point, idx) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* Important Concepts */}
                {studyData.important_concepts?.length > 0 && (
                  <section>
                    <h4 className="font-serif font-bold text-base text-[#172B4D] border-b border-[#E5E1D8] pb-2 mb-3">
                      Important Concepts
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {studyData.important_concepts.map((concept, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 rounded-md bg-[#F7F4EC] border border-[#E5E1D8] text-xs font-semibold text-[#172B4D]"
                        >
                          {concept}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {/* Detailed Explanations */}
                {studyData.detailed_explanations?.length > 0 && (
                  <section>
                    <h4 className="font-serif font-bold text-base text-[#172B4D] border-b border-[#E5E1D8] pb-2 mb-3">
                      Detailed Explanations
                    </h4>
                    <div className="space-y-3">
                      {studyData.detailed_explanations.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-md bg-[#F7F4EC]/50 border border-[#E5E1D8]"
                        >
                          <p className="font-semibold text-sm text-[#172B4D]">{item.concept}</p>
                          <p className="text-sm text-[#4B5563] mt-1 leading-relaxed">
                            {item.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Key Points */}
                {studyData.key_points?.length > 0 && (
                  <section>
                    <h4 className="font-serif font-bold text-base text-[#172B4D] border-b border-[#E5E1D8] pb-2 mb-3">
                      Key Revision Points
                    </h4>
                    <ul className="space-y-2 text-sm text-[#374151]">
                      {studyData.key_points.map((kp, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-[#172B4D] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span>{kp}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* Definitions */}
                {studyData.definitions?.length > 0 && (
                  <section>
                    <h4 className="font-serif font-bold text-base text-[#172B4D] border-b border-[#E5E1D8] pb-2 mb-3">
                      Important Definitions
                    </h4>
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {studyData.definitions.map((def, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-md border border-[#E5E1D8] bg-white"
                        >
                          <dt className="font-semibold text-sm text-[#294C73]">{def.term}</dt>
                          <dd className="text-xs text-[#4B5563] mt-1 leading-relaxed">
                            {def.definition}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </section>
                )}

                {/* Exam Preparation Questions */}
                {studyData.short_questions?.length > 0 && (
                  <section>
                    <h4 className="font-serif font-bold text-base text-[#172B4D] border-b border-[#E5E1D8] pb-2 mb-3">
                      Exam Preparation Questions
                    </h4>
                    <div className="space-y-3">
                      {studyData.short_questions.map((qa, idx) => {
                        const open = Boolean(revealedAnswers[idx]);
                        return (
                          <div
                            key={idx}
                            className="border border-[#E5E1D8] rounded-md overflow-hidden"
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setRevealedAnswers((prev) => ({ ...prev, [idx]: !prev[idx] }))
                              }
                              className="w-full px-4 py-3 text-left flex items-center justify-between gap-3 bg-[#F7F4EC]/50 hover:bg-[#F7F4EC] transition"
                            >
                              <span className="text-sm font-semibold text-[#172B4D]">
                                Q{idx + 1}. {qa.question}
                              </span>
                              {open ? (
                                <ChevronUp className="w-4 h-4 text-[#6B7280] shrink-0" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-[#6B7280] shrink-0" />
                              )}
                            </button>
                            {open && (
                              <div className="px-4 py-3 text-sm text-[#374151] bg-white border-t border-[#E5E1D8]">
                                <span className="text-xs font-bold uppercase tracking-wider text-[#39765B] block mb-1">
                                  Model Answer
                                </span>
                                {qa.model_answer}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* Save Flashcards CTA */}
                {studyData.flashcards?.length > 0 && (
                  <div className="pt-4 border-t border-[#E5E1D8] flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-[#6B7280]">
                      {studyData.flashcards.length} active-recall flashcards were generated with this kit.
                    </p>
                    <button
                      type="button"
                      onClick={handleSaveAsFlashcards}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-[#C49A45] text-[#172B4D] bg-[#F5ECD7]/60 hover:bg-[#F5ECD7] text-xs font-semibold transition"
                    >
                      <Layers className="w-4 h-4 text-[#C49A45]" />
                      Save Deck to Flashcards
                    </button>
                  </div>
                )}
              </div>
            </article>
          )}
        </div>

        {/* Right Column: Previously Generated Notes */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-[#E5E1D8] rounded-lg p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#E5E1D8]">
              <BookOpen className="w-4 h-4 text-[#C49A45]" />
              <h3 className="font-serif font-bold text-base text-[#172B4D]">
                Saved Notes Library
              </h3>
            </div>

            {loadingSaved ? (
              <div className="space-y-2.5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-[#F7F4EC] rounded animate-pulse" />
                ))}
              </div>
            ) : savedNotesList.length === 0 ? (
              <div className="text-center py-6">
                <FileText className="w-7 h-7 text-[#6B7280] mx-auto mb-2 opacity-60" />
                <p className="text-xs text-[#6B7280]">
                  Your generated notes will automatically be saved here.
                </p>
              </div>
            ) : (
              <ul className="space-y-2.5 max-h-[540px] overflow-y-auto pr-1">
                {savedNotesList.map((item) => (
                  <li
                    key={item._id}
                    className="p-3 rounded-md border border-[#E5E1D8] hover:border-[#294C73] bg-[#F7F4EC]/40 flex items-start justify-between gap-2 transition"
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectSavedNote(item._id)}
                      className="text-left flex-1 min-w-0"
                    >
                      <p className="font-semibold text-sm text-[#172B4D] truncate">
                        {item.topicTitle}
                      </p>
                      <p className="text-[11px] text-[#6B7280] mt-0.5">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(item)}
                      className="text-[#6B7280] hover:text-[#B94A48] p-1"
                      aria-label="Delete note"
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
        title="Delete Saved Note"
        message={`Are you sure you want to delete "${deleteTarget?.topicTitle}"? This cannot be undone.`}
        confirmLabel="Delete Note"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </DashboardLayout>
  );
}

export default AinotesPage;
