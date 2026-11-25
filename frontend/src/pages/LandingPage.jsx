import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  Layers,
  FileText,
  Sparkles,
  BarChart3,
  Upload,
  BrainCircuit,
  TrendingUp,
  CheckCircle2,
  ChevronDown,
  Menu,
  X,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  {
    icon: BookOpen,
    title: 'AI Study Notes',
    description:
      'Transform dense textbook chapters and lecture transcripts into structured summaries, definitions, and exam-ready short answers.',
  },
  {
    icon: ClipboardCheck,
    title: 'AI Quiz Generator',
    description:
      'Generate syllabus-aligned multiple-choice assessments with detailed explanations to test comprehension before exams.',
  },
  {
    icon: Layers,
    title: 'Smart Flashcards',
    description:
      'Review key concepts with active-recall flip cards, shuffle modes, and mastery tracking for focused revision.',
  },
  {
    icon: FileText,
    title: 'PDF Learning & Q&A',
    description:
      'Upload lecture slides and academic PDFs, extract searchable content, and ask grounded questions directly from your documents.',
  },
  {
    icon: Sparkles,
    title: 'Personalized Learning',
    description:
      'Track daily study goals, revisit weak concepts marked for revision, and organize materials by academic subject.',
  },
  {
    icon: BarChart3,
    title: 'Study Analytics',
    description:
      'Monitor weekly study sessions, quiz score averages, and topic-wise progress in a clean academic dashboard.',
  },
];

const STEPS = [
  {
    step: '01',
    icon: Upload,
    title: 'Upload Study Materials',
    description: 'Paste lecture notes or upload your course PDFs into your private library.',
  },
  {
    step: '02',
    icon: BrainCircuit,
    title: 'Generate AI Notes',
    description: 'Receive structured summaries, definitions, key points, and exam questions in seconds.',
  },
  {
    step: '03',
    icon: ClipboardCheck,
    title: 'Practice with Quizzes',
    description: 'Take interactive multiple-choice quizzes and review explanations for every answer.',
  },
  {
    step: '04',
    icon: TrendingUp,
    title: 'Improve Your Performance',
    description: 'Track scores, drill flashcards marked for revision, and build consistent study habits.',
  },
];

const TESTIMONIALS = [
  {
    quote:
      'StudyBuddy AI cut my exam preparation time in half. Having structured definitions and 2-mark model answers from my own lecture PDFs is invaluable.',
    name: 'Ananya Sharma',
    role: 'B.Sc. Biotechnology, Year 3',
  },
  {
    quote:
      'The quiz generator catches subtle details I usually gloss over when reading. Seeing the explanation right after submitting makes every session count.',
    name: 'Marcus Vance',
    role: 'M.A. Economics Candidate',
  },
  {
    quote:
      'Clean, calm, and distraction-free. It feels like a real university research portal rather than a noisy app.',
    name: 'Priya Nair',
    role: 'Computer Science Undergraduate',
  },
];

const FAQS = [
  {
    q: 'Are my uploaded PDFs and study notes private?',
    a: 'Yes. Every uploaded PDF, generated note, quiz result, and flashcard deck is strictly scoped to your authenticated account.',
  },
  {
    q: 'How does the AI Notes & Quiz generator work?',
    a: 'Our backend processes your pasted notes or extracted PDF text securely via Gemini AI, returning structured academic summaries, flashcards, and MCQs without exposing API keys.',
  },
  {
    q: 'Can I ask questions about a specific PDF I uploaded?',
    a: 'Yes. In My Study Materials, uploaded PDFs are indexed into searchable chunks so you can ask grounded questions and view source excerpts.',
  },
  {
    q: 'Does StudyBuddy AI work on mobile and tablet devices?',
    a: 'Yes. Every page—from the landing portal to flashcards and quizzes—is designed to work smoothly across desktop, tablet, and mobile viewports.',
  },
];

function LandingPage() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="min-h-screen bg-[#F7F4EC] text-[#172B4D] flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-[#E5E1D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-md bg-[#172B4D] text-[#C49A45] flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="font-serif font-bold text-lg text-[#172B4D]">StudyBuddy AI</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#172B4D]">
            <a href="#home" className="hover:text-[#294C73] transition">Home</a>
            <a href="#features" className="hover:text-[#294C73] transition">Features</a>
            <a href="#how-it-works" className="hover:text-[#294C73] transition">How It Works</a>
            <a href="#about" className="hover:text-[#294C73] transition">About</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 text-sm font-semibold rounded-md bg-[#172B4D] text-white hover:bg-[#10213A] transition"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-[#172B4D] hover:text-[#294C73] transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold rounded-md bg-[#172B4D] text-white hover:bg-[#10213A] transition"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-md border border-[#E5E1D8] text-[#172B4D]"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-[#E5E1D8] px-4 py-4 space-y-3">
            <a href="#home" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium py-1">Home</a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium py-1">Features</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium py-1">How It Works</a>
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium py-1">About</a>
            <div className="pt-2 border-t border-[#E5E1D8] flex flex-col gap-2">
              {user ? (
                <Link
                  to="/dashboard"
                  className="w-full text-center py-2 rounded-md bg-[#172B4D] text-white text-sm font-semibold"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="w-full text-center py-2 rounded-md border border-[#E5E1D8] text-sm font-semibold"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="w-full text-center py-2 rounded-md bg-[#172B4D] text-white text-sm font-semibold"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="home" className="py-14 sm:py-20 border-b border-[#E5E1D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E5E1D8] text-xs font-semibold uppercase tracking-wider text-[#294C73]">
              <span className="w-2 h-2 rounded-full bg-[#C49A45]" />
              University-Grade Academic Workspace
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl font-black text-[#172B4D] leading-tight">
              Study Smarter. Learn Better.
            </h1>

            <p className="text-base sm:text-lg text-[#4B5563] leading-relaxed max-w-xl">
              StudyBuddy AI turns your lecture notes and course PDFs into structured revision
              guides, active-recall flashcards, and exam-oriented quizzes—all in one focused
              academic portal.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to={user ? '/dashboard' : '/register'}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-[#172B4D] hover:bg-[#10213A] text-white text-sm font-semibold shadow-sm transition"
              >
                <span>{user ? 'Open Dashboard' : 'Get Started Free'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-white border border-[#E5E1D8] hover:border-[#172B4D] text-[#172B4D] text-sm font-semibold transition"
              >
                Explore Features
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-3 text-xs text-[#6B7280] font-medium">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#39765B]" />
                Private & user-scoped library
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#39765B]" />
                Syllabus-focused AI generation
              </span>
            </div>
          </div>

          {/* Academic Portal Preview Card */}
          <div className="lg:col-span-6">
            <div className="bg-white border border-[#E5E1D8] rounded-xl shadow-md overflow-hidden">
              <div className="bg-[#172B4D] px-5 py-3.5 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#C49A45]" />
                  <span className="font-serif text-sm font-bold">Student Academic Portal</span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-white/10 text-[#F5ECD7]">
                  Live Workspace
                </span>
              </div>

              <div className="p-5 sm:p-6 space-y-5 bg-[#F7F4EC]/50">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white border border-[#E5E1D8] rounded-lg p-3">
                    <p className="text-[11px] uppercase tracking-wider text-[#6B7280]">Notes</p>
                    <p className="font-serif text-xl font-bold text-[#172B4D] mt-1">Structured</p>
                  </div>
                  <div className="bg-white border border-[#E5E1D8] rounded-lg p-3">
                    <p className="text-[11px] uppercase tracking-wider text-[#6B7280]">Quizzes</p>
                    <p className="font-serif text-xl font-bold text-[#39765B] mt-1">Exam-Ready</p>
                  </div>
                  <div className="bg-white border border-[#E5E1D8] rounded-lg p-3">
                    <p className="text-[11px] uppercase tracking-wider text-[#6B7280]">PDF Q&A</p>
                    <p className="font-serif text-xl font-bold text-[#C49A45] mt-1">Grounded</p>
                  </div>
                </div>

                <div className="bg-white border border-[#E5E1D8] rounded-lg p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#294C73]">
                      Sample Revision Kit
                    </span>
                    <span className="text-xs text-[#39765B] font-semibold">Saved to Library</span>
                  </div>
                  <p className="font-serif font-bold text-base text-[#172B4D]">
                    Cellular Respiration & ATP Synthesis
                  </p>
                  <p className="text-xs text-[#6B7280] leading-relaxed">
                    Includes 4 core concepts, 6 key definitions, 5 active-recall flashcards, and
                    exam preparation short-answer models.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-20 bg-white border-b border-[#E5E1D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#C49A45]">
              Core Capabilities
            </p>
            <h2 className="font-serif text-3xl font-bold text-[#172B4D] mt-2">
              Everything required for disciplined academic mastery
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="bg-[#F7F4EC]/60 border border-[#E5E1D8] rounded-lg p-6 hover:border-[#294C73] transition"
              >
                <div className="w-10 h-10 rounded-md bg-[#172B4D] text-[#C49A45] flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-lg text-[#172B4D]">{title}</h3>
                <p className="text-sm text-[#4B5563] mt-2 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 sm:py-20 border-b border-[#E5E1D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#C49A45]">
              Workflow
            </p>
            <h2 className="font-serif text-3xl font-bold text-[#172B4D] mt-2">
              How StudyBuddy AI Works
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map(({ step, icon: Icon, title, description }) => (
              <div
                key={step}
                className="bg-white border border-[#E5E1D8] rounded-lg p-6 flex flex-col"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-serif text-2xl font-black text-[#C49A45]">{step}</span>
                  <Icon className="w-5 h-5 text-[#294C73]" />
                </div>
                <h3 className="font-serif font-bold text-base text-[#172B4D]">{title}</h3>
                <p className="text-sm text-[#6B7280] mt-2 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits & About */}
      <section id="about" className="py-16 sm:py-20 bg-[#172B4D] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#C49A45]">
              Why StudyBuddy AI
            </p>
            <h2 className="font-serif text-3xl font-bold mt-2">
              Built for focus, retention, and measurable exam readiness
            </h2>
            <p className="text-slate-300 text-sm sm:text-base mt-4 leading-relaxed">
              Designed around university study workflows, StudyBuddy AI eliminates clutter so you
              can move directly from raw lecture materials to active recall and self-testing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              'Syllabus-grounded AI output',
              'Persistent notes & quiz history',
              'Voice dictation & read-aloud',
              'PDF chunking & source citations',
            ].map((benefit) => (
              <div
                key={benefit}
                className="bg-[#10213A] border border-white/10 rounded-lg p-4 flex items-start gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-[#C49A45] shrink-0 mt-0.5" />
                <span className="text-sm font-medium text-slate-100">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-20 bg-white border-b border-[#E5E1D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#C49A45]">
              Student Perspectives
            </p>
            <h2 className="font-serif text-3xl font-bold text-[#172B4D] mt-2">
              Trusted by dedicated learners
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((item) => (
              <div
                key={item.name}
                className="bg-[#F7F4EC] border border-[#E5E1D8] rounded-lg p-6 flex flex-col justify-between"
              >
                <p className="text-sm text-[#374151] leading-relaxed italic">"{item.quote}"</p>
                <div className="mt-5 pt-4 border-t border-[#E5E1D8]">
                  <p className="font-serif font-bold text-sm text-[#172B4D]">{item.name}</p>
                  <p className="text-xs text-[#6B7280] mt-0.5">{item.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#C49A45]">
              Frequently Asked Questions
            </p>
            <h2 className="font-serif text-3xl font-bold text-[#172B4D] mt-2">
              Common Questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={faq.q}
                  className="bg-white border border-[#E5E1D8] rounded-lg overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left font-semibold text-sm text-[#172B4D] hover:bg-[#F7F4EC]/50 transition"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#6B7280] transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-sm text-[#4B5563] leading-relaxed border-t border-[#E5E1D8] pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#10213A] text-slate-300 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <GraduationCap className="w-5 h-5 text-[#C49A45]" />
            <span className="font-serif font-bold text-white">StudyBuddy AI</span>
          </div>
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} StudyBuddy AI · Academic Learning Platform
          </p>
          <div className="flex items-center gap-5 text-xs">
            <Link to="/login" className="hover:text-white transition">Login</Link>
            <Link to="/register" className="hover:text-white transition">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
