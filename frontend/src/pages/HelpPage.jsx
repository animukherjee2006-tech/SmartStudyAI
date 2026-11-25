import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, BookOpen, ClipboardCheck, Layers, FolderOpen } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';

function HelpPage() {
  return (
    <DashboardLayout pageTitle="Help & Support">
      <div className="max-w-4xl space-y-6">
        <section className="bg-white border border-[#E5E1D8] rounded-lg p-6 shadow-xs">
          <div className="flex items-center gap-2.5 mb-2">
            <HelpCircle className="w-5 h-5 text-[#C49A45]" />
            <h2 className="font-serif font-bold text-xl text-[#172B4D]">
              StudyBuddy AI Academic Guide
            </h2>
          </div>
          <p className="text-sm text-[#4B5563] leading-relaxed">
            Use this quick reference to get the most out of your revision workflow.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white border border-[#E5E1D8] rounded-lg p-5 space-y-2">
            <div className="flex items-center gap-2 font-serif font-bold text-[#172B4D]">
              <BookOpen className="w-4 h-4 text-[#C49A45]" />
              <h3>AI Notes</h3>
            </div>
            <p className="text-sm text-[#4B5563]">
              Paste lecture notes or pick an indexed PDF to generate structured summaries,
              definitions, and 2-mark exam questions.
            </p>
            <Link to="/notes" className="text-xs font-semibold text-[#294C73] hover:underline inline-block">
              Open AI Notes →
            </Link>
          </div>

          <div className="bg-white border border-[#E5E1D8] rounded-lg p-5 space-y-2">
            <div className="flex items-center gap-2 font-serif font-bold text-[#172B4D]">
              <ClipboardCheck className="w-4 h-4 text-[#294C73]" />
              <h3>AI Quiz</h3>
            </div>
            <p className="text-sm text-[#4B5563]">
              Practice with multiple-choice questions generated strictly from your study material
              with instant explanations.
            </p>
            <Link to="/quiz" className="text-xs font-semibold text-[#294C73] hover:underline inline-block">
              Open AI Quiz →
            </Link>
          </div>

          <div className="bg-white border border-[#E5E1D8] rounded-lg p-5 space-y-2">
            <div className="flex items-center gap-2 font-serif font-bold text-[#172B4D]">
              <Layers className="w-4 h-4 text-[#39765B]" />
              <h3>Flashcards</h3>
            </div>
            <p className="text-sm text-[#4B5563]">
              Click any card to flip it, mark items as Known or Need Revision, and track mastery
              across decks.
            </p>
            <Link to="/flashcards" className="text-xs font-semibold text-[#294C73] hover:underline inline-block">
              Open Flashcards →
            </Link>
          </div>

          <div className="bg-white border border-[#E5E1D8] rounded-lg p-5 space-y-2">
            <div className="flex items-center gap-2 font-serif font-bold text-[#172B4D]">
              <FolderOpen className="w-4 h-4 text-[#172B4D]" />
              <h3>My Study Materials & PDF Q&A</h3>
            </div>
            <p className="text-sm text-[#4B5563]">
              Upload text-based PDFs (up to 10MB) and ask grounded questions directly against your
              coursework.
            </p>
            <Link to="/materials" className="text-xs font-semibold text-[#294C73] hover:underline inline-block">
              Open Study Materials →
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default HelpPage;
