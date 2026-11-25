import React, { useState, useEffect, useCallback } from 'react';
import {
  Layers,
  Plus,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  RotateCcw,
  Trash2,
  Sparkles,
} from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import ConfirmationModal from '../components/ConfirmationModal';
import { useNotification } from '../context/NotificationContext';
import { flashcardApi } from '../services/api';

function FlashcardsPage() {
  const notify = useNotification();

  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDeck, setActiveDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  // Create deck modal/panel state
  const [showCreate, setShowCreate] = useState(false);
  const [createMode, setCreateMode] = useState('ai'); // 'ai' | 'manual'
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('General');
  const [sourceText, setSourceText] = useState('');
  const [manualCards, setManualCards] = useState([{ front: '', back: '' }]);
  const [creating, setCreating] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadDecks = useCallback(async () => {
    try {
      const res = await flashcardApi.list();
      const list = res.decks || [];
      setDecks(list);
      if (list.length > 0 && !activeDeck) {
        setActiveDeck(list[0]);
        setCards(list[0].cards || []);
      }
    } catch (err) {
      notify.error(err.message || 'Failed to load flashcard decks.');
    } finally {
      setLoading(false);
    }
  }, [activeDeck, notify]);

  useEffect(() => {
    loadDecks();
  }, [loadDecks]);

  const selectDeck = (deck) => {
    setActiveDeck(deck);
    setCards(deck.cards || []);
    setCurrentIdx(0);
    setFlipped(false);
  };

  const handleShuffle = () => {
    if (cards.length < 2) return;
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIdx(0);
    setFlipped(false);
    notify.info('Deck shuffled.');
  };

  const handleCardStatus = async (status) => {
    if (!activeDeck || !cards[currentIdx]) return;
    const card = cards[currentIdx];

    try {
      const res = await flashcardApi.updateCardStatus(activeDeck._id, card._id, status);
      const updatedCards = cards.map((c) => (c._id === card._id ? { ...c, status } : c));
      setCards(updatedCards);
      setDecks((prev) => prev.map((d) => (d._id === activeDeck._id ? res.deck : d)));
      setActiveDeck(res.deck);

      if (currentIdx < cards.length - 1) {
        setFlipped(false);
        setCurrentIdx((i) => i + 1);
      }
    } catch (err) {
      notify.error(err.message || 'Could not update card status.');
    }
  };

  const handleCreateDeck = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const payload =
        createMode === 'ai'
          ? { title: title.trim(), subject: subject.trim(), sourceText: sourceText.trim() }
          : { title: title.trim(), subject: subject.trim(), cards: manualCards };

      const res = await flashcardApi.create(payload);
      notify.success('Flashcard deck created!');
      setDecks((prev) => [res.deck, ...prev]);
      selectDeck(res.deck);
      setShowCreate(false);
      setTitle('');
      setSourceText('');
      setManualCards([{ front: '', back: '' }]);
    } catch (err) {
      notify.error(err.message || 'Failed to create deck.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteDeck = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await flashcardApi.delete(deleteTarget._id);
      const remaining = decks.filter((d) => d._id !== deleteTarget._id);
      setDecks(remaining);
      if (activeDeck?._id === deleteTarget._id) {
        setActiveDeck(remaining[0] || null);
        setCards(remaining[0]?.cards || []);
        setCurrentIdx(0);
      }
      notify.success('Deck deleted.');
      setDeleteTarget(null);
    } catch (err) {
      notify.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const knownCount = cards.filter((c) => c.status === 'known').length;
  const revisionCount = cards.filter((c) => c.status === 'revision').length;
  const progressPct = cards.length > 0 ? Math.round((knownCount / cards.length) * 100) : 0;
  const currentCard = cards[currentIdx];

  return (
    <DashboardLayout pageTitle="Flashcards">
      <div className="space-y-6">
        {/* Top Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#172B4D]">
              Active Recall Flashcards
            </h2>
            <p className="text-sm text-[#6B7280] mt-0.5">
              Master definitions and concepts through spaced review
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreate((prev) => !prev)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#172B4D] hover:bg-[#10213A] text-white text-sm font-semibold transition"
          >
            <Plus className="w-4 h-4" />
            <span>{showCreate ? 'Close Builder' : 'New Flashcard Deck'}</span>
          </button>
        </div>

        {/* Create Deck Form */}
        {showCreate && (
          <form
            onSubmit={handleCreateDeck}
            className="bg-white border border-[#E5E1D8] rounded-lg p-6 shadow-xs space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E1D8] pb-3">
              <h3 className="font-serif font-bold text-lg text-[#172B4D]">Create Flashcard Deck</h3>
              <div className="flex rounded-md border border-[#E5E1D8] overflow-hidden text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setCreateMode('ai')}
                  className={`px-3 py-1.5 ${
                    createMode === 'ai' ? 'bg-[#172B4D] text-white' : 'bg-white text-[#172B4D]'
                  }`}
                >
                  Generate with AI
                </button>
                <button
                  type="button"
                  onClick={() => setCreateMode('manual')}
                  className={`px-3 py-1.5 ${
                    createMode === 'manual' ? 'bg-[#172B4D] text-white' : 'bg-white text-[#172B4D]'
                  }`}
                >
                  Manual Cards
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-1">
                  Deck Title {createMode === 'ai' && '(Optional for AI)'}
                </label>
                <input
                  type="text"
                  required={createMode === 'manual'}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Organic Chemistry Functional Groups"
                  className="w-full px-3.5 py-2 text-sm border border-[#E5E1D8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#294C73]/40"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Chemistry"
                  className="w-full px-3.5 py-2 text-sm border border-[#E5E1D8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#294C73]/40"
                />
              </div>
            </div>

            {createMode === 'ai' ? (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-1">
                  Study Notes (min 20 characters)
                </label>
                <textarea
                  rows={5}
                  required
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  placeholder="Paste your notes and StudyBuddy AI will extract key flashcards..."
                  className="w-full p-3.5 text-sm border border-[#E5E1D8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#294C73]/40"
                />
              </div>
            ) : (
              <div className="space-y-3">
                {manualCards.map((c, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder={`Card ${idx + 1} Front (Term / Question)`}
                      value={c.front}
                      onChange={(e) =>
                        setManualCards((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, front: e.target.value } : item))
                        )
                      }
                      className="px-3.5 py-2 text-sm border border-[#E5E1D8] rounded-md"
                    />
                    <input
                      type="text"
                      required
                      placeholder={`Card ${idx + 1} Back (Definition / Answer)`}
                      value={c.back}
                      onChange={(e) =>
                        setManualCards((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, back: e.target.value } : item))
                        )
                      }
                      className="px-3.5 py-2 text-sm border border-[#E5E1D8] rounded-md"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setManualCards((prev) => [...prev, { front: '', back: '' }])}
                  className="text-xs font-semibold text-[#294C73] hover:underline"
                >
                  + Add Another Card
                </button>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 rounded-md border border-[#E5E1D8] text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-md bg-[#172B4D] hover:bg-[#10213A] disabled:opacity-60 text-white text-sm font-semibold"
              >
                {createMode === 'ai' && <Sparkles className="w-4 h-4 text-[#C49A45]" />}
                <span>{creating ? 'Creating...' : 'Save Deck'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Main Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Deck List */}
          <aside className="lg:col-span-4 bg-white border border-[#E5E1D8] rounded-lg p-5 shadow-xs h-fit">
            <h3 className="font-serif font-bold text-base text-[#172B4D] pb-3 border-b border-[#E5E1D8] mb-3">
              Your Decks ({decks.length})
            </h3>

            {loading ? (
              <div className="space-y-2.5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-[#F7F4EC] rounded animate-pulse" />
                ))}
              </div>
            ) : decks.length === 0 ? (
              <div className="text-center py-8">
                <Layers className="w-8 h-8 text-[#6B7280] mx-auto mb-2 opacity-60" />
                <p className="text-sm font-medium text-[#172B4D]">No flashcard decks yet</p>
                <p className="text-xs text-[#6B7280] mt-1">
                  Create a deck above or save flashcards from AI Notes.
                </p>
              </div>
            ) : (
              <ul className="space-y-2.5">
                {decks.map((deck) => {
                  const isSelected = activeDeck?._id === deck._id;
                  const known = deck.cards.filter((c) => c.status === 'known').length;
                  return (
                    <li
                      key={deck._id}
                      className={`p-3 rounded-md border flex items-center justify-between gap-2 transition ${
                        isSelected
                          ? 'border-[#172B4D] bg-[#F7F4EC]'
                          : 'border-[#E5E1D8] hover:border-[#294C73]'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => selectDeck(deck)}
                        className="text-left flex-1 min-w-0"
                      >
                        <p className="font-semibold text-sm text-[#172B4D] truncate">{deck.title}</p>
                        <p className="text-[11px] text-[#6B7280] mt-0.5">
                          {deck.subject} · {known}/{deck.cards.length} known
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(deck)}
                        className="text-[#6B7280] hover:text-[#B94A48] p-1"
                        aria-label="Delete deck"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </aside>

          {/* Active Flashcard Player */}
          <section className="lg:col-span-8">
            {!activeDeck || cards.length === 0 ? (
              <div className="bg-white border border-[#E5E1D8] rounded-lg p-12 text-center shadow-xs">
                <Layers className="w-10 h-10 text-[#C49A45] mx-auto mb-3" />
                <h3 className="font-serif font-bold text-lg text-[#172B4D]">
                  Select or Create a Flashcard Deck
                </h3>
                <p className="text-sm text-[#6B7280] mt-1 max-w-md mx-auto">
                  Choose a deck from the left or click "New Flashcard Deck" to generate active-recall
                  cards from your study notes.
                </p>
              </div>
            ) : (
              <div className="bg-white border border-[#E5E1D8] rounded-lg p-6 shadow-xs space-y-5">
                {/* Deck Header & Progress */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#C49A45]">
                      {activeDeck.subject}
                    </span>
                    <h3 className="font-serif font-bold text-xl text-[#172B4D]">
                      {activeDeck.title}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={handleShuffle}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#E5E1D8] hover:border-[#172B4D] text-xs font-semibold text-[#172B4D]"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    Shuffle
                  </button>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-[#6B7280] mb-1.5">
                    <span>
                      Mastery Progress: {knownCount} Known · {revisionCount} Need Revision
                    </span>
                    <span className="font-semibold text-[#172B4D]">{progressPct}%</span>
                  </div>
                  <div className="w-full bg-[#F7F4EC] border border-[#E5E1D8] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#39765B] h-full transition-all duration-300"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                {/* 3D Flip Card */}
                <div
                  onClick={() => setFlipped((f) => !f)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      setFlipped((f) => !f);
                    }
                  }}
                  className="perspective-1000 cursor-pointer select-none"
                >
                  <div
                    className={`relative w-full min-h-[240px] transition-transform duration-500 transform-style-3d ${
                      flipped ? 'rotate-y-180' : ''
                    }`}
                  >
                    {/* Front */}
                    <div className="absolute inset-0 backface-hidden bg-[#F7F4EC] border-2 border-[#E5E1D8] rounded-xl p-8 flex flex-col items-center justify-center text-center">
                      <span className="text-[11px] font-semibold uppercase tracking-widest text-[#C49A45] mb-3">
                        Question / Term · Card {currentIdx + 1} of {cards.length}
                      </span>
                      <p className="font-serif font-bold text-xl text-[#172B4D] leading-relaxed">
                        {currentCard?.front}
                      </p>
                      <span className="text-xs text-[#6B7280] mt-6">Click card to reveal answer</span>
                    </div>

                    {/* Back */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180 bg-[#172B4D] text-white border-2 border-[#172B4D] rounded-xl p-8 flex flex-col items-center justify-center text-center">
                      <span className="text-[11px] font-semibold uppercase tracking-widest text-[#C49A45] mb-3">
                        Answer / Definition
                      </span>
                      <p className="text-base sm:text-lg leading-relaxed">{currentCard?.back}</p>
                      <span className="text-xs text-slate-300 mt-6">Click to flip back</span>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={currentIdx === 0}
                      onClick={() => {
                        setFlipped(false);
                        setCurrentIdx((i) => Math.max(0, i - 1));
                      }}
                      className="inline-flex items-center gap-1 px-3.5 py-2 rounded-md border border-[#E5E1D8] text-sm font-medium disabled:opacity-40 hover:bg-[#F7F4EC]"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Prev
                    </button>
                    <button
                      type="button"
                      disabled={currentIdx === cards.length - 1}
                      onClick={() => {
                        setFlipped(false);
                        setCurrentIdx((i) => Math.min(cards.length - 1, i + 1));
                      }}
                      className="inline-flex items-center gap-1 px-3.5 py-2 rounded-md border border-[#E5E1D8] text-sm font-medium disabled:opacity-40 hover:bg-[#F7F4EC]"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleCardStatus('revision')}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold border transition ${
                        currentCard?.status === 'revision'
                          ? 'bg-[#C49A45] text-white border-[#C49A45]'
                          : 'bg-white text-[#172B4D] border-[#E5E1D8] hover:border-[#C49A45]'
                      }`}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Need Revision
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCardStatus('known')}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold border transition ${
                        currentCard?.status === 'known'
                          ? 'bg-[#39765B] text-white border-[#39765B]'
                          : 'bg-white text-[#172B4D] border-[#E5E1D8] hover:border-[#39765B]'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mark as Known
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Flashcard Deck"
        message={`Delete "${deleteTarget?.title}" and all of its flashcards?`}
        confirmLabel="Delete Deck"
        loading={deleting}
        onConfirm={handleDeleteDeck}
        onCancel={() => setDeleteTarget(null)}
      />
    </DashboardLayout>
  );
}

export default FlashcardsPage;
