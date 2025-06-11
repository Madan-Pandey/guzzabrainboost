"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

type LeaderboardPlayer = {
  Player_ID: number;
  Player_name: string;
  Playerpoint: number;
  streak: number;
  currentLevelScore?: number;
};

interface LeaderBoardSectionProps {
  currentScore?: number;
  currentPlayerId?: number;
  compact?: boolean;
  maxPlayers?: number;
}

// Milestone thresholds for rewards
const MILESTONE_THRESHOLDS = {
  1: { levels: 10, bonus: 100 },
  2: { levels: 20, bonus: 150 },
  3: { levels: 30, bonus: 200 },
  4: { levels: 40, bonus: 250 },
  5: { levels: 50, bonus: 300 }
} as const;

type MilestoneId = keyof typeof MILESTONE_THRESHOLDS;

export default function LeaderBoardSection({ currentScore, currentPlayerId, compact = false, maxPlayers = 10 }: LeaderBoardSectionProps) {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/leaderboard');
      if (response.ok) {
        const data = await response.json();
        let sortedPlayers = data.players.sort((a: any, b: any) => b.Playerpoint - a.Playerpoint);
        
        // If we have currentScore and currentPlayerId, update the current player's score
        // but only in the UI, don't add it to their total score
        if (currentScore !== undefined && currentPlayerId !== undefined) {
          sortedPlayers = sortedPlayers.map((player: LeaderboardPlayer) => {
            if (player.Player_ID === currentPlayerId) {
              return {
                ...player,
                // Don't add current score to total, just show it separately
                currentLevelScore: currentScore
              };
            }
            return player;
          });
          // Re-sort after updating the score
          sortedPlayers.sort((a: any, b: any) => b.Playerpoint - a.Playerpoint);
        }
        
        setLeaderboardData(sortedPlayers);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchLeaderboard();
  }, [currentScore]); // Add currentScore as dependency to update when it changes

  // Refresh on score updates
  useEffect(() => {
    const handleScoreUpdate = () => fetchLeaderboard();
    window.addEventListener('scoreUpdated', handleScoreUpdate);
    window.addEventListener('levelCompleted', handleScoreUpdate);

    // Backup polling with longer interval since we have real-time events
    const interval = setInterval(fetchLeaderboard, 10000);

    return () => {
      window.removeEventListener('scoreUpdated', handleScoreUpdate);
      window.removeEventListener('levelCompleted', handleScoreUpdate);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden">
      <table className="min-w-full">
        <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold">Rank</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Player</th>
            <th className="px-6 py-4 text-right text-sm font-semibold">Points</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {isLoading ? (
            <tr>
              <td colSpan={3} className="px-6 py-4 text-center">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              </td>
            </tr>
          ) : (
            leaderboardData.slice(0, maxPlayers).map((player, index) => {
              const isCurrentPlayer = player.Player_ID === currentPlayerId;
              return (
                <tr
                  key={player.Player_ID}
                  className={`${isCurrentPlayer ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                >
                  <td className="px-6 py-4">
                    {index === 0 ? "🥇" :
                     index === 1 ? "🥈" :
                     index === 2 ? "🥉" :
                     `#${index + 1}`}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {player.Player_name}
                      {isCurrentPlayer && (
                        <span className="ml-2 text-blue-600 text-sm">(You)</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-semibold text-blue-600">
                      {player.Playerpoint.toLocaleString()} pts
                    </span>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}