"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ProgressBar from "./progressBar";

type MilestoneType = {
  id: number;
  title: string;
  description: string;
  range: [number, number];
  reward_message: string;
  button_cta: string;
  link: string;
};

type PlayerType = {
  Player_ID: number;
  Player_name: string;
  Playerpoint: number;
  streak: number;
  lastLogin: Date;
  Level_Id?: number;
  Milestone_Id?: number;
  level_scores?: {
    level_number: number;
    completion_percentage: number;
  }[];
};

type typePlayerHeroSection = {
  player: PlayerType;
  playerRank: number;
};

// Milestone bonus points configuration
const MILESTONE_BONUSES = {
  1: 100,  // First milestone: 100 points
  2: 150,  // Second milestone: 150 points
  3: 200,  // Third milestone: 200 points
  4: 250,  // Fourth milestone: 250 points
  5: 300   // Fifth milestone: 300 points
};

function ProfileHerosection({ player, playerRank }: typePlayerHeroSection) {
  const router = useRouter();
  const [milestones, setMilestones] = useState<MilestoneType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [milestoneProgress, setMilestoneProgress] = useState(0);
  const [completedLevelsInMilestone, setCompletedLevelsInMilestone] = useState(0);
  const [totalLevelsInMilestone, setTotalLevelsInMilestone] = useState(10);
  
  const currentLevel = player?.Level_Id || 1;
  const currentMilestoneId = player?.Milestone_Id || 1;

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        const response = await fetch('/api/milestones');
        if (response.ok) {
          const data = await response.json();
          setMilestones(data.milestones);
          
          // Calculate milestone progress
          if (data.milestones.length > 0) {
            const currentMilestone = getCurrentMilestone(data.milestones);
            if (currentMilestone) {
              const [start, end] = currentMilestone.range;
              const total = end - start + 1;
              setTotalLevelsInMilestone(total);
              
              // Calculate completed levels (including current level)
              const completed = Math.max(0, currentLevel - start + 1);
              const remaining = Math.max(0, total - completed);
              
              setCompletedLevelsInMilestone(completed);
              const progress = Math.min(100, (completed / total) * 100);
              setMilestoneProgress(progress);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching milestones:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMilestones();
  }, [player, currentLevel]);

  const handleClaimReward = () => {
    router.push("/reward");
  };

  // Find the current milestone based on level
  const getCurrentMilestone = (availableMilestones: MilestoneType[] = milestones) => {
    if (availableMilestones.length === 0) return null;
    
    const milestone = availableMilestones.find(m => 
      currentLevel >= m.range[0] && currentLevel <= m.range[1]
    );
    
    return milestone || availableMilestones[0]; // Default to first milestone if none found
  };

  const currentMilestone = getCurrentMilestone();
  const bonusPoints = MILESTONE_BONUSES[currentMilestoneId as keyof typeof MILESTONE_BONUSES] || 0;
  const remainingLevels = totalLevelsInMilestone - completedLevelsInMilestone;
  
  if (!currentMilestone || isLoading) {
    return (
      <div className="container mx-auto max-w-6xl animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="flex flex-col flex-wrap md:flex-row gap-8 md:gap-12">
          <div className="flex-1 h-64 bg-gray-200 rounded-lg"></div>
          <div className="flex-1 h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl py-8">
      <div className="flex flex-col flex-wrap md:flex-row gap-8 md:gap-12">
        {/* Stats Card */}
        <div className="flex-1 animate-slide-in-left" 
             style={{ animationDelay: '500ms' }}>
          <div className="profile-card hover-lift animate-pulse-glow"
               style={{ animationDelay: '800ms' }}>
            <div className="grid grid-cols-3 min py-6">
              <div className="text-center group animate-fade-in" style={{ animationDelay: '900ms' }}>
                <p className="text-gray-500 text-sm mb-1">Ranking</p>
                <p className="text-5xl font-bold text-gray-800 stats-value group-hover:animate-pop">
                  {playerRank}
                </p>
              </div>
              <div className="text-center group animate-fade-in" style={{ animationDelay: '1000ms' }}>
                <p className="text-gray-500 text-sm mb-1">Points Earned</p>
                <p className="text-5xl font-bold text-gray-800 stats-value group-hover:animate-pop">
                  {player?.Playerpoint || 0}
                </p>
              </div>
              <div className="text-center group animate-fade-in relative" style={{ animationDelay: '1100ms' }}>
                <p className="text-gray-500 text-sm mb-1">Level</p>
                <div className="relative">
                  <p className="text-5xl font-bold text-gray-800 stats-value group-hover:animate-pop">
                    {currentLevel}
                  </p>
                  {/* Level Progress Indicator */}
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-700 ease-out progress-bar-animate"
                      style={{ width: `${milestoneProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center bg-blue-50/50 rounded-b-lg py-6 w-full border-t-1 group animate-fade-in"
                 style={{ animationDelay: '1200ms' }}>
              <span className="text-blue-300 mr-2 text-xl group-hover:animate-rotate-shine">🔥</span>
              <p className="text-gray-700 text-xl stats-value">
                {player?.streak || 0} Days Streak
              </p>
            </div>
          </div>
        </div>

        {/* Right Gift Section */}
        <div className="flex-1 animate-slide-in-right" 
             style={{ animationDelay: '700ms' }}>
          <div className="flex flex-row items-center border-1 border-b-3 border-blue-400 gap-8 px-9 rounded-lg bg-gradient-to-r from-blue-50/50 to-blue-100/30 profile-card milestone-glow reward-box-float"
               style={{ animationDelay: '1000ms' }}>
            <div className="relative overflow-visible mb-4 animate-fade-in"
                 style={{ animationDelay: '1300ms' }}>
              <div className="flex flex-col gap-y-[-3] items-center">
                <div className={`relative ${completedLevelsInMilestone === totalLevelsInMilestone ? 'animate-bounce-subtle' : ''}`}>
                  <Image
                    src="/ProfileGraphics/Gift.svg"
                    alt="Gift icon"
                    width={100}
                    height={140}
                  />
                  {completedLevelsInMilestone === totalLevelsInMilestone && (
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-yellow-300/10 to-yellow-400/10 animate-sparkle rounded-full"></div>
                  )}
                </div>
              </div>
            </div>

            <div className="py-4 mb:py-0 animate-fade-in flex-1"
                 style={{ animationDelay: '1400ms' }}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-blue-600 stats-value">
                  <span className="flex items-center gap-2">
                    🎁 Reward
                  </span>
                </h3>
                <span className="text-green-600 font-semibold bg-green-100/30 px-3 py-1 rounded-full hover:animate-pop">
                  +{bonusPoints} points
                </span>
              </div>

              <div className="bg-blue-50/50 rounded-lg p-3 mb-3">
                <p className="text-gray-700 font-medium">
                  {completedLevelsInMilestone === totalLevelsInMilestone ? (
                    <span className="flex items-center gap-2">
                      <span className="text-green-600">✨ All levels completed! Claim your reward!</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span>Level {currentLevel} • Complete {totalLevelsInMilestone - completedLevelsInMilestone} more {totalLevelsInMilestone - completedLevelsInMilestone === 1 ? 'level' : 'levels'} for {bonusPoints} points!</span>
                    </span>
                  )}
                </p>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span className="font-medium">Progress to Reward</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{completedLevelsInMilestone}/{totalLevelsInMilestone} Levels</span>
                    <span className="font-semibold text-blue-600">({Math.round(milestoneProgress)}%)</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-700 ease-out progress-bar-animate relative"
                    style={{ width: `${milestoneProgress}%` }}
                  >
                    {milestoneProgress > 0 && (
                      <div className="absolute top-0 right-0 h-full w-1 bg-white/30 animate-pulse"></div>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-gray-600 mb-4 text-sm">
                {completedLevelsInMilestone > 0 
                  ? `Great progress! You've completed ${completedLevelsInMilestone} ${completedLevelsInMilestone === 1 ? 'level' : 'levels'}!` 
                  : 'Complete your first quiz to start earning rewards!'}
              </p>

              <button
                className={`quizPbtn w-full transition-all duration-300 ${
                  completedLevelsInMilestone < totalLevelsInMilestone 
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover-lift bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                }`}
                disabled={completedLevelsInMilestone < totalLevelsInMilestone}
                onClick={handleClaimReward}
              >
                {completedLevelsInMilestone === totalLevelsInMilestone ? (
                  <span className="flex items-center justify-center gap-2">
                    Claim Your Reward
                    <span className="bg-white/20 px-2 py-1 rounded-full text-sm animate-pulse-glow">
                      +{bonusPoints} points
                    </span>
                    <span className="animate-bounce-subtle">🎁</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Complete More Levels
                    <span className="text-sm">({totalLevelsInMilestone - completedLevelsInMilestone} remaining)</span>
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileHerosection;
