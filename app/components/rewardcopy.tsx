"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

type MilestoneType = {
  Milestone_Id: number;
  Milestone_Title: string;
  Milestone_description: string;
  UnlockingLevel: number;
  Milestone_reward_message: string;
  Milestone_Link: string;
  Milestone_Button_CTA: string;
};

type PlayerType = {
  Player_ID: number;
  Player_name: string;
  Playerpoint: number;
  streak: number;
  lastLogin: Date;
  Level_Id?: number;
  Milestone_Id?: number;
  milestone?: MilestoneType | null;
};

type RewardCopyProps = {
  player: PlayerType | null;
};

function RewardCopy({ player }: RewardCopyProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [bonusPoints, setBonusPoints] = useState<number | null>(null);
  const reward = player?.milestone;
  const playerId = player?.Player_ID;
  const currentMilestone = player?.milestone?.Milestone_Id ?? 1;

  const handleSumit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const nextMilestone = currentMilestone + 1;
    
    try {
      const response = await fetch("/api/reward", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ playerId, nextMilestone }),
      });

      if (response.ok) {
        const data = await response.json();
        setBonusPoints(data.bonusPoints);
        
        // Show bonus points for 2 seconds before redirecting
        setTimeout(() => {
          if (reward?.Milestone_Link) {
            window.open(String(reward.Milestone_Link), "_blank");
          }
          router.push("/quiz");
        }, 2000);
      } else {
        console.error("Failed to claim reward");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <h1 className="title mt-20">{reward?.Milestone_Title}</h1>
      <p className="mt-6">{reward?.Milestone_description}</p>
      <p className="mt-4">{reward?.Milestone_reward_message}</p>
      
      {bonusPoints !== null && (
        <div className="mt-6 text-center animate-bounce">
          <p className="text-2xl font-bold text-green-600">
            🎉 Bonus Points: +{bonusPoints} 🎉
          </p>
        </div>
      )}
      
      <div className="my-11">
        <button 
          className={`quizPbtn ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
          onClick={handleSumit}
          disabled={isLoading}
        >
          {isLoading ? 'Claiming...' : reward?.Milestone_Button_CTA}
        </button>
      </div>
    </div>
  );
}

export default RewardCopy;
