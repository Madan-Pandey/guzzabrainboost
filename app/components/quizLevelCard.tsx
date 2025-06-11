'use client';

import Link from "next/link";
import Image from "next/image";

type QuizLevelCardTypes = {
  levelNumber: number;
  levelLink: string;
  levelName: string;
  currentLevel: number;
  isCurrentLevel?: boolean;
  isCompleted?: boolean;
  score?: {
    stars: number;
    completionPercentage: number;
    highest_score: number;
    latest_score: number;
  };
};

export default function QuizLevelCard({
  levelNumber,
  levelLink,
  levelName,
  currentLevel,
  isCurrentLevel = false,
  isCompleted = false,
  score
}: QuizLevelCardTypes) {
  
  // Get number of stars based on completion percentage
  const getStars = () => {
    if (!score || !score.completionPercentage) return 0;
    
    // Check if it was a perfect score (all correct on first try)
    const isPerfectScore = score.highest_score === score.latest_score && 
                          score.completionPercentage === 100;

    if (isPerfectScore) {
      return 4; // All correct in one try
    } else if (score.completionPercentage >= 80) {
      return 3;
    } else if (score.completionPercentage >= 65) {
      return 2;
    } else if (score.completionPercentage >= 50) {
      return 1;
    }
    return 0;
  };

  // Helper function to check if a level is completed
  const isLevelCompleted = () => {
    return score && score.completionPercentage >= 50;
  };

  // Next level is either the current level or the first uncompleted level after current level
  const isNextLevel = !isCompleted && (
    levelNumber === currentLevel || 
    (levelNumber === (currentLevel + 1) && isLevelCompleted())
  );

  // A level is locked if it's not completed, not the current level, and not the next available level
  const isLocked = levelNumber !== 1 && 
                  !isCompleted && 
                  !isNextLevel && 
                  levelNumber > currentLevel;

  const handleClick = (e: React.MouseEvent) => {
    if (isLocked) {
      e.preventDefault();
      alert(`Complete Level ${levelNumber - 1} first!`);
    }
  };

  const getStatusText = () => {
    if (isCompleted) return '✓ Completed';
    if (isLocked) return `Complete Level ${levelNumber - 1} first`;
    if (isNextLevel) return 'Start';
    return 'Start';
  };

  const getStatusClass = () => {
    if (isCompleted) return 'text-green-600 font-medium flex items-center';
    if (isLocked) return 'text-gray-400';
    if (isNextLevel) return 'text-blue-600 font-medium flex items-center gap-1 group-hover:gap-2';
    return 'text-blue-600';
  };

  const getLevelNameClass = () => {
    if (isLocked) return 'text-gray-400';
    if (isCompleted) return 'text-green-600 font-semibold';
    if (isNextLevel) return 'bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent font-bold';
    return 'text-gray-700';
  };

  const getCardClass = () => {
    let baseClass = 'relative p-6 rounded-xl border transition-all duration-300 transform hover:scale-[1.02] group overflow-hidden';
    
    if (isCompleted) {
      return `${baseClass} bg-gradient-to-br from-green-50/50 via-emerald-50/30 to-green-50/20 border-green-200/50 hover:shadow-lg hover:border-green-300/50`;
    }
    if (isLocked) {
      return `${baseClass} bg-gray-50/50 border-gray-200/50`;
    }
    if (isNextLevel) {
      return `${baseClass} bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-blue-50/20 border-blue-200/50 hover:shadow-lg hover:border-blue-300/50`;
    }
    return `${baseClass} bg-white border-gray-200/50 hover:border-blue-200/50 hover:shadow-lg`;
  };

  const getLevelIcon = () => {
    if (isCompleted) return "✨";
    if (isLocked && !isNextLevel) return "🔒";
    if (isNextLevel) return "🎯";
    return "📚";
  };

  return (
    <Link
      href={levelLink}
      onClick={handleClick}
      className={`block relative group ${isLocked ? 'cursor-not-allowed' : 'hover:transform hover:scale-[1.02] transition-all duration-300'}`}
    >
      <div className={`relative overflow-hidden rounded-xl border transition-all duration-300 ${
        isLocked ? 'bg-gray-50 border-gray-100' :
        isCompleted ? 'bg-green-50/50 border-green-100 hover:border-green-200' :
        isNextLevel ? 'bg-blue-50/50 border-blue-100 hover:border-blue-200 shadow-sm hover:shadow-md' :
        'bg-white border-gray-100 hover:border-blue-200'
      }`}>
        <div className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className={`font-semibold ${isLocked ? 'text-gray-400' : 'text-gray-800'}`}>
              Level {levelNumber}
            </h3>
          </div>
          
          <div className="flex items-center justify-between">
            <p className={`text-sm ${isLocked ? 'text-gray-400' : 'text-gray-600'}`}>
              {levelName}
            </p>

            {isCompleted ? (
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✓</span>
                <span className="text-green-600 text-sm">Completed</span>
                <div className="flex -space-x-1">
                  {Array.from({ length: getStars() }).map((_, i) => (
                    <span 
                      key={i} 
                      className="text-yellow-400 transform hover:scale-110 transition-transform duration-200"
                      title={`${getStars()} stars earned`}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <span className={getStatusClass()}>
                {getStatusText()}
                {!isLocked && !isCompleted && isNextLevel && (
                  <svg className="w-4 h-4 transform transition-all duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 7l5 5-5 5" />
                  </svg>
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
