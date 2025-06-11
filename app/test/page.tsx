"use client";

import ShareButton from "../components/buttons/sharebtn";

export default function TestPage() {
  // Example values for testing
  const score = 100;
  const levelTitle = "Test Level";

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-xl font-semibold text-center mb-4">Share Your Score</h2>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <ShareButton
          score={score}
          levelTitle={levelTitle}
          levelNumber={1}
          accuracy={100}
          totalScore={score}
        />
      </div>
    </div>
  );
}
