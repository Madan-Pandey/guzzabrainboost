import React, { Suspense } from "react";
import fetchLevels from "@/utils/fLevels";
import QuizList from "./quizList";

type typeDisplayLevel = {
  playerLevel: number;
};

async function QuizLevelSections({playerLevel} :typeDisplayLevel ) {
  const levels = (await fetchLevels()) || [];

  return (
    <div className="space-y-12 py-8">
      <div className="container mx-auto">
        <div className="relative overflow-hidden rounded-2xl bg-white p-8 shadow-xl border border-gray-100">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]"></div>
          
          {/* Content */}
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Quiz Levels
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz List Section */}
      <div className="container mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100/50 p-6">
          <Suspense fallback={
            <div className="space-y-4">
              <div className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
              <div className="h-24 bg-gray-100 rounded-lg animate-pulse"></div>
              <div className="h-24 bg-gray-100 rounded-lg animate-pulse"></div>
            </div>
          }>
            <QuizList 
              cutEnding={true}
              allLevels={levels} 
              playerLevel={playerLevel}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export default QuizLevelSections;
