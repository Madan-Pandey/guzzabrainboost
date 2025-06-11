'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import LeaderBoard from './leaderBoard';

type LeaderboardEntry = {
  Player_ID: number;
  Player_name: string;
  Playerpoint: number;
  level_scores?: Array<{ highest_score: number }>;
};

export default function QuizCompletionScreen({
  score,
  onContinue,
  levelNumber,
  playerId,
  totalQuestions
}: {
  score: number;
  onContinue: () => void;
  levelNumber: number;
  playerId: number;
  totalQuestions: number;
}) {
  const router = useRouter();
  const [milestoneAchieved, setMilestoneAchieved] = useState<{id: number, bonus: number} | null>(null);
  const [showMilestone, setShowMilestone] = useState(false);
  const [currentPlayerScore, setCurrentPlayerScore] = useState(score);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Calculate completion percentage
  const completionPercentage = (score / (totalQuestions * 20)) * 100;

  // Trigger confetti effect
  useEffect(() => {
    if (completionPercentage >= 50) {
      setShowConfetti(true);
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: NodeJS.Timeout = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [completionPercentage]);

  // Update all game progress
  const updateGameProgress = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    setUpdateError(null);

    try {
      console.log('Starting game progress update...');

      // 1. Update score and unlock next level
      console.log('Updating score...');
      const scoreResponse = await fetch('/api/updateScore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId,
          levelNumber,
          score,
          completionPercentage
        })
      });

      if (!scoreResponse.ok) {
        const errorData = await scoreResponse.json();
        throw new Error(`Failed to update score: ${errorData.error || scoreResponse.statusText}`);
      }

      const scoreData = await scoreResponse.json();
      console.log('Score updated:', scoreData);

      // 2. Update level completion status
      console.log('Updating level completion...');
      const completionResponse = await fetch('/api/levelComplete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId,
          levelNumber,
          score,
          completionPercentage
        })
      });

      if (!completionResponse.ok) {
        throw new Error('Failed to update level completion');
      }

      // 3. Check and update milestone
      console.log('Checking milestone...');
      const milestoneResponse = await fetch(`/api/checkMilestone?playerId=${playerId}&levelNumber=${levelNumber}`);
      if (!milestoneResponse.ok) {
        throw new Error('Failed to check milestone');
      }

      const milestoneData = await milestoneResponse.json();
      console.log('Milestone data:', milestoneData);
      
      if (milestoneData.milestone) {
        console.log('Updating milestone rewards...');
        // 4. Update milestone rewards if achieved
        const rewardResponse = await fetch('/api/reward', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerId,
            nextMilestone: milestoneData.milestone.id
          })
        });

        if (!rewardResponse.ok) {
          throw new Error('Failed to update milestone rewards');
        }

        setMilestoneAchieved(milestoneData.milestone);
        setShowMilestone(true);
      }

      // 5. Unlock next level if completion percentage is sufficient
      if (completionPercentage >= 50) {
        console.log('Unlocking next level...');
        const unlockResponse = await fetch('/api/levelScores/unlock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerId,
            levelNumber: levelNumber + 1
          })
        });

        if (!unlockResponse.ok) {
          throw new Error('Failed to unlock next level');
        }
      }

      // 6. Dispatch events for UI updates
      console.log('Dispatching UI update events...');
      window.dispatchEvent(new CustomEvent('levelCompleted', {
        detail: { playerId, levelNumber, score, completionPercentage }
      }));

      window.dispatchEvent(new CustomEvent('scoreUpdated', {
        detail: { playerId, level: levelNumber, score }
      }));

      // 7. Update leaderboard
      setCurrentPlayerScore(score);

      // 8. Force router refresh to update UI
      router.refresh();

      return scoreData;
    } catch (error) {
      console.error('Error updating game progress:', error);
      setUpdateError(error instanceof Error ? error.message : 'Failed to update game progress');
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle navigation
  const handleContinue = async () => {
    if (isNavigating || isUpdating) return;
    setIsNavigating(true);
    
    try {
      if (completionPercentage >= 50) {
        // Update all game progress
        await updateGameProgress();
        
        // Wait for updates to propagate
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Navigate to next level with force refresh
        router.push(`/quiz/${levelNumber + 1}?t=${Date.now()}`);
      } else {
        // Retry current level
        router.push(`/quiz/${levelNumber}?retry=true`);
      }
    } catch (error) {
      console.error('Navigation error:', error);
      setUpdateError('Failed to navigate to next level. Please try again.');
    } finally {
      setIsNavigating(false);
    }
  };

  // Calculate stars based on completion percentage and perfect score
  const getStars = () => {
    const maxPossibleScore = totalQuestions * 20;
    const isAllCorrectFirstTry = score === maxPossibleScore;

    if (isAllCorrectFirstTry) return 4;
    if (completionPercentage >= 80) return 3;
    if (completionPercentage >= 65) return 2;
    if (completionPercentage >= 50) return 1;
    return 0;
  };

  // Initial update when component mounts
  useEffect(() => {
    if (completionPercentage >= 50) {
      updateGameProgress().catch(console.error);
    }
  }, []);

  // Add error display to the UI
  if (updateError) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{updateError}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Main Content - Takes up 3 columns */}
            <div className="lg:col-span-3">
              {/* Level Completion Header with Animation */}
              <motion.div 
                className="text-center mb-8"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.h2 
                  className="text-4xl font-bold text-blue-600 mb-4"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    color: ['#2563EB', '#4F46E5', '#2563EB']
                  }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                >
                  Level {levelNumber} Completed!
                </motion.h2>
                
                {/* Score and Stars */}
                <div className="flex flex-col items-center space-y-6">
                  <motion.div 
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 w-full max-w-sm"
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="text-center">
                      <p className="text-gray-600 mb-2">Your Score</p>
                      <motion.div 
                        className="text-5xl font-bold text-blue-600 mb-4"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ 
                          type: "spring",
                          stiffness: 260,
                          damping: 20,
                          delay: 0.5
                        }}
                      >
                        {score} / {totalQuestions * 20}
                      </motion.div>
                      <motion.p 
                        className="text-lg text-gray-500 mb-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                      >
                        Completion: {Math.round(completionPercentage)}%
                      </motion.p>
                      <div className="flex justify-center space-x-2">
                        {Array.from({ length: getStars() }).map((_, i) => (
                          <motion.span
                            key={i}
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ 
                              delay: 0.8 + (i * 0.1),
                              type: "spring",
                              stiffness: 260,
                              damping: 20
                            }}
                            className="text-3xl"
                          >
                            ⭐
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  {/* Achievement Badges */}
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    {completionPercentage >= 50 && (
                      <motion.div 
                        className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <h3 className="text-lg font-semibold text-green-600 mb-2">Level Mastery</h3>
                        <p className="text-sm text-green-700">Congratulations! You've mastered this level!</p>
                      </motion.div>
                    )}
                    {score === totalQuestions * 20 && (
                      <motion.div 
                        className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-100"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <h3 className="text-lg font-semibold text-purple-600 mb-2">Perfect Score!</h3>
                        <p className="text-sm text-purple-700">Amazing! You got everything right!</p>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Progress Bar */}
                  <motion.div 
                    className="w-full max-w-sm"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 1.2 }}
                  >
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${completionPercentage}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                      />
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Rewards Message */}
              {completionPercentage >= 50 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-center mb-8 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100"
                >
                  <h3 className="text-lg font-semibold text-green-700 mb-2">
                    🎉 Level {levelNumber + 1} Unlocked!
                  </h3>
                  <p className="text-green-600">
                    You've earned {getStars()} stars and unlocked the next level!
                  </p>
                </motion.div>
              )}

              {/* Milestone Achievement */}
              <AnimatePresence>
                {showMilestone && milestoneAchieved && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="mb-8 text-center bg-gradient-to-r from-yellow-50 to-amber-50 p-6 rounded-xl border border-yellow-100"
                  >
                    <h3 className="text-2xl font-bold text-yellow-700 mb-2">
                      🎉 Milestone {milestoneAchieved.id} Achieved!
                    </h3>
                    <p className="text-yellow-600">
                      Bonus Points: +{milestoneAchieved.bonus}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Leaderboard Section - Takes up 2 columns */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="sticky top-4"
              >
                <h3 className="text-2xl font-semibold mb-4 text-gray-800">Top Players</h3>
                <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-xl border border-blue-100/50 overflow-hidden shadow-lg">
                  <div className="p-4">
                    <LeaderBoard />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Action Buttons */}
          <motion.div 
            className="flex justify-center gap-4 mt-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <button
              onClick={() => router.push(`/quiz/${Number(levelNumber) + 1}`)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-300"
            >
              Next Level
            </button>
            <button
              onClick={() => router.push('/quiz')}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transform hover:scale-105 transition-all duration-300"
            >
              Back to Menu
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
