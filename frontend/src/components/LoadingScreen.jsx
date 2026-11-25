import React from 'react';
import { BookOpen } from 'lucide-react';

function LoadingScreen({ message = 'Loading StudyBuddy AI...' }) {
  return (
    <div className="min-h-screen bg-[#F7F4EC] flex flex-col items-center justify-center px-4">
      <div className="w-12 h-12 rounded-lg bg-[#172B4D] text-[#C49A45] flex items-center justify-center shadow-sm mb-4">
        <BookOpen className="w-6 h-6 animate-pulse" />
      </div>
      <h2 className="font-serif text-lg font-bold text-[#172B4D]">StudyBuddy AI</h2>
      <p className="text-sm text-[#6B7280] mt-1">{message}</p>
    </div>
  );
}

export default LoadingScreen;
