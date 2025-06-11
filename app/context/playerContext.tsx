"use client"; 

import { createContext, useContext, useEffect, useState } from "react";
import { cookies } from 'next/headers'

type LevelScore = {
  level_number: number;
  highest_score: number;
  latest_score: number;
  completion_percentage: number;
  stars: number;
};

type typePlayer = {
  Level_Id: number;
  Milestone_Id: number;
  Player_ID: number;
  Player_name: string;
  Playerpoint: number;
  Temp_Score: number;
  lastLogin: Date;
  streak: number;
  user_Id: number;
  milestone: {
    Milestone_Id: number;
    Milestone_Title: string;
    Milestone_description: string;
    UnlockingLevel: number;
    Milestone_reward_message: string;
    Milestone_Link: string;
    Milestone_Button_CTA: string;
  };
  level: {
    Level_Id: number;
    Level_Title: string;
    Level_number: number;
  };
  level_scores: LevelScore[];
};

export const playerContext = createContext<{
  player: typePlayer | null;
  AssignPlayerData: (playerData: typePlayer) => void;
  playerLevel: number | undefined;
  setPlayerLevel: (newLevel: number) => void;
  setTempScore: (score: number) => void;
  tempScore: number;
  getLevelScore: (levelNumber: number) => LevelScore | undefined;
}>({
  player: null,
  AssignPlayerData: () => {},
  playerLevel: undefined,
  setPlayerLevel: () => {},
  setTempScore: () => {},
  tempScore: 0,
  getLevelScore: () => undefined,
});

function PlayerContextProvider({ children }: { children: React.ReactNode }) {
  const [player, setPlayer] = useState<typePlayer | null>(null); 
  const [tempScore, setTempScore] = useState(0);

  useEffect(() => {
    try {
      const storedPlayer = localStorage.getItem("player");
      if (storedPlayer) {
        const parsedPlayer = JSON.parse(storedPlayer);
        console.log('Loading player from localStorage:', parsedPlayer);
        setPlayer(parsedPlayer);
      }
    } catch (error) {
      console.error("Failed to parse player data:", error);
    }
  }, []);

  useEffect(() => {
    if (player !== null) {
      console.log('Saving player to localStorage:', player);
      localStorage.setItem("player", JSON.stringify(player));
    }
  }, [player]);

  // Listen for player updates
  useEffect(() => {
    const handlePlayerUpdate = (event: CustomEvent) => {
      const updatedPlayer = event.detail;
      if (updatedPlayer) {
        setPlayer(updatedPlayer);
        localStorage.setItem("player", JSON.stringify(updatedPlayer));
      }
    };

    window.addEventListener('playerUpdate', handlePlayerUpdate as EventListener);
    return () => {
      window.removeEventListener('playerUpdate', handlePlayerUpdate as EventListener);
    };
  }, []);

  const AssignPlayerData = (playerData: typePlayer) => {
    console.log('Assigning new player data:', playerData);
    
    // Calculate total points from level scores
    const totalPoints = playerData.level_scores?.reduce((total, score) => 
      total + (score.highest_score || 0), 0) || 0;
    
    const updatedPlayerData = {
      ...playerData,
      Playerpoint: totalPoints, // Update total points
      level_scores: playerData.level_scores || [],
      level: playerData.level || {
        Level_Id: playerData.Level_Id,
        Level_Title: `Level ${playerData.Level_Id}`,
        Level_number: playerData.Level_Id
      }
    };
    setPlayer(updatedPlayerData);
    localStorage.setItem("player", JSON.stringify(updatedPlayerData));
  };

  const setPlayerLevel = (newLevel: number) => {
    console.log('Setting new player level:', newLevel);
    setPlayer((prev) => {
      if (!prev) {
        console.log('No previous player data found');
        return null;
      }
      
      const existingLevelScore = prev.level_scores?.find(score => score.level_number === newLevel);
      const updatedLevelScores = [...(prev.level_scores || [])];
      
      if (!existingLevelScore) {
        updatedLevelScores.push({
          level_number: newLevel,
          highest_score: 0,
          latest_score: 0,
          completion_percentage: 0,
          stars: 0
        });
      }

      // Calculate total points from all level scores
      const totalPoints = updatedLevelScores.reduce((total, score) => 
        total + (score.highest_score || 0), 0);
      
      const updated = { 
        ...prev, 
        Level_Id: newLevel,
        Playerpoint: totalPoints,
        level: {
          ...prev.level,
          Level_Id: newLevel,
          Level_Title: `Level ${newLevel}`,
          Level_number: newLevel
        },
        level_scores: updatedLevelScores
      };
      console.log('Updated player data:', updated);
      localStorage.setItem("player", JSON.stringify(updated));
      return updated;
    });
  };

  const getLevelScore = (levelNumber: number): LevelScore | undefined => {
    if (!player?.level_scores) return undefined;
    return player.level_scores.find(score => score.level_number === levelNumber) || {
      level_number: levelNumber,
      highest_score: 0,
      latest_score: 0,
      completion_percentage: 0,
      stars: 0
    };
  };

  const value = {
    player,
    AssignPlayerData,
    playerLevel: player?.Level_Id,
    setPlayerLevel,
    setTempScore,
    tempScore,
    getLevelScore,
  };

  return (
    <playerContext.Provider value={value}>{children}</playerContext.Provider>
  );
}

export default PlayerContextProvider;
