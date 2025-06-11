'use client';

import { useState, useEffect } from 'react';
import QuizLevelCard from './quizLevelCard';
import { levelType } from '@/types/types';

type MilestoneType = {
  id: number;
  title: string;
  description: string;
  unlockLevel: number;
  range: [number, number];
  icon: string;
};

type LevelScore = {
  stars: number;
  completionPercentage: number;
  highest_score: number;
  latest_score: number;
};

const milestones: MilestoneType[] = [
  { 
    id: 1,
    title: "Beginner",
    description: "Start your journey",
    unlockLevel: 1,
    range: [1, 10],
    icon: "🌱"
  },
  { 
    id: 2,
    title: "Elementary",
    description: "Building foundations",
    unlockLevel: 10,
    range: [11, 20],
    icon: "📚"
  },
  { 
    id: 3,
    title: "Intermediate",
    description: "Growing knowledge",
    unlockLevel: 20,
    range: [21, 30],
    icon: "🎯"
  },
  { 
    id: 4,
    title: "Advanced",
    description: "Mastering concepts",
    unlockLevel: 30,
    range: [31, 40],
    icon: "⭐"
  },
  { 
    id: 5,
    title: "Expert",
    description: "Becoming a pro",
    unlockLevel: 40,
    range: [41, 50],
    icon: "👑"
  }
];

function QuizList({ allLevels, cutEnding = true, playerLevel }: { allLevels: levelType[]; cutEnding: boolean; playerLevel: number }) {
  const [expandedMilestone, setExpandedMilestone] = useState<number | null>(null);
  const [levelScores, setLevelScores] = useState<Record<number, LevelScore>>({});

  // Check if a level is completed
  const isLevelCompleted = (levelNum: number) => {
    const score = levelScores[levelNum];
    return score && score.completionPercentage >= 50;
  };

  // Check if a level is unlocked
  const isLevelUnlocked = (levelNum: number) => {
    if (levelNum === 1) return true;
    // A level is unlocked if the previous level is completed OR if it's the next level after the highest completed level
    const previousLevelCompleted = isLevelCompleted(levelNum - 1);
    const isNextLevelAfterHighestCompleted = levelNum === getHighestCompletedLevel() + 1;
    return previousLevelCompleted || isNextLevelAfterHighestCompleted;
  };

  // Get highest completed level
  const getHighestCompletedLevel = () => {
    let highest = 0;
    Object.entries(levelScores).forEach(([levelNum, score]) => {
      if (score.completionPercentage >= 50 && Number(levelNum) > highest) {
        highest = Number(levelNum);
      }
    });
    return highest;
  };

  // Get the next level card
  const getNextLevel = () => {
    const highestCompleted = getHighestCompletedLevel();
    
    // For new users or if level 1 is not completed
    if (highestCompleted === 0 || !isLevelCompleted(1)) {
      return allLevels.find(level => level.Level_number === 1);
    }

    // Return the next level after highest completed
    const nextLevelNum = highestCompleted + 1;
    const nextLevel = allLevels.find(level => level.Level_number === nextLevelNum);
    
    // If next level exists, return it
    if (nextLevel) return nextLevel;
    
    // If all levels completed, return the last level
    return allLevels[allLevels.length - 1];
  };

  // Fetch level scores
  const fetchLevelScores = async () => {
    try {
      const response = await fetch('/api/levelScores');
      if (response.ok) {
        const data = await response.json();
        setLevelScores(data.scores || {});
      }
    } catch (error) {
      console.error('Error fetching level scores:', error);
    }
  };

  // Initial fetch and setup refresh interval
  useEffect(() => {
    fetchLevelScores();
    const interval = setInterval(fetchLevelScores, 2000);
    return () => clearInterval(interval);
  }, []);

  // Listen for score updates
  useEffect(() => {
    const handleScoreUpdate = () => fetchLevelScores();
    window.addEventListener('scoreUpdated', handleScoreUpdate);
    window.addEventListener('levelCompleted', handleScoreUpdate);
    return () => {
      window.removeEventListener('scoreUpdated', handleScoreUpdate);
      window.removeEventListener('levelCompleted', handleScoreUpdate);
    };
  }, []);

  // Calculate milestone progress based on completed levels
  const getMilestoneProgress = (milestone: MilestoneType) => {
    const milestoneLevels = getLevelsByMilestone(milestone.range);
    const completedLevels = milestoneLevels.filter(level => {
      const score = levelScores[level.Level_number];
      return score && score.completionPercentage >= 50;
    }).length;
    // Simple 10% increment per level completed
    return completedLevels * 10;
  };

  // Get current milestone based on player level
  const getCurrentMilestone = () => {
    // For new users or no completion, show first milestone
    if (!levelScores || Object.keys(levelScores).length === 0) {
      return milestones[0];
    }

    // Find the current milestone based on the next level
    const nextLevel = getNextLevel();
    return milestones.find(m => 
      nextLevel && 
      nextLevel.Level_number >= m.range[0] && 
      nextLevel.Level_number <= m.range[1]
    ) || milestones[0];
  };

  // Get levels for a milestone
  const getLevelsByMilestone = (range: [number, number]) => {
    return allLevels.filter(level => 
      level.Level_number >= range[0] && 
      level.Level_number <= range[1]
    ).sort((a, b) => a.Level_number - b.Level_number);
  };

  // Check if a milestone is unlocked
  const isMilestoneUnlocked = (milestone: MilestoneType) => {
    if (milestone.id === 1) return true; // First milestone always unlocked
    // Check if first level of this milestone is unlocked
    return isLevelUnlocked(milestone.range[0]);
  };

  const nextLevel = getNextLevel();
  const currentMilestone = getCurrentMilestone();

  const isBrowser = () => typeof window !== "undefined";

  function scrollToTop() {
    if (!isBrowser()) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Debug log all level scores
  console.log('All level scores:', levelScores);

  return (
    <div className="space-y-8">
      {/* Next Level Section - Always visible */}
      {nextLevel && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-blue-600">Next Challenge</h2>
          <QuizLevelCard
            key={nextLevel.Level_Id}
            levelNumber={nextLevel.Level_number}
            levelLink={`/quiz/${nextLevel.Level_number}`}
            levelName={nextLevel.Level_Title}
            currentLevel={playerLevel}
            isCurrentLevel={true}
            isCompleted={isLevelCompleted(nextLevel.Level_number)}
            score={levelScores[nextLevel.Level_number - 1]}
          />
        </div>
      )}

      {/* Milestones Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-6">Your Learning Path</h2>
        <div className="grid gap-8">
          {milestones.map((milestone) => {
            const milestoneLevels = allLevels.filter(
              (level) =>
                level.Level_number >= milestone.range[0] &&
                level.Level_number <= milestone.range[1]
            );

            const isExpanded = expandedMilestone === milestone.id;
            const isUnlocked = playerLevel >= milestone.unlockLevel;
            const hasCompletedLevels = milestoneLevels.some((level) =>
              isLevelCompleted(level.Level_number)
            );

            return (
              <div key={milestone.id} className="space-y-4">
                <button
                  onClick={() => setExpandedMilestone(isExpanded ? null : milestone.id)}
                  className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                    isUnlocked
                      ? "bg-white hover:bg-gray-50"
                      : "bg-gray-100 cursor-not-allowed"
                  }`}
                  disabled={!isUnlocked}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-2xl">{milestone.icon}</span>
                      <div>
                        <h3 className="text-lg font-semibold">
                          {milestone.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {milestone.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {!isUnlocked && (
                        <span className="text-sm text-gray-500">
                          Unlock at Level {milestone.unlockLevel}
                        </span>
                      )}
                      <span
                        className={`transform transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      >
                        ▼
                      </span>
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-4 space-y-4 bg-gray-50">
                    {milestoneLevels.map((level) => {
                      const levelNum = level.Level_number;
                      const isCompleted = isLevelCompleted(levelNum);
                      const isUnlocked = isLevelUnlocked(levelNum);
                      const currentLevelScore = levelScores[levelNum];
                      const prevLevelScore = levelScores[levelNum - 1];
                      
                      console.log(`Rendering level ${levelNum}:`, {
                        isCompleted,
                        isUnlocked,
                        currentLevelScore,
                        prevLevelScore
                      });

                      return (
                        <QuizLevelCard
                          key={level.Level_Id}
                          levelNumber={levelNum}
                          levelLink={`/quiz/${levelNum}`}
                          levelName={level.Level_Title}
                          currentLevel={playerLevel}
                          isCurrentLevel={levelNum === playerLevel}
                          isCompleted={isCompleted}
                          score={currentLevelScore}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {!cutEnding && (
        <div className="py-8 w-full flex flex-col items-center gap-4">
          <p className="text-sm text-gray-600">
            {playerLevel > 1 ? `You've completed ${playerLevel - 1} ${playerLevel - 1 === 1 ? 'level' : 'levels'}!` : 'Start your journey with Level 1!'}
          </p>
          <button 
            onClick={scrollToTop}
            className="px-6 py-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200"
          >
            Scroll To Top
          </button>
        </div>
      )}
    </div>
  );
}

export default QuizList;
