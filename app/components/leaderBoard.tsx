'use client';

import { useEffect, useState } from 'react';
import { FaTrophy, FaMedal, FaStar, FaFire } from 'react-icons/fa';
import { useSession } from 'next-auth/react';

const RankBadge = ({ rank }: { rank: number }) => {
  if (rank === 1) return (
    <div className="flex items-center gap-1">
      <FaTrophy className="text-yellow-400 text-2xl drop-shadow-md" />
      <span className="text-yellow-600 font-bold">1st</span>
    </div>
  );
  if (rank === 2) return (
    <div className="flex items-center gap-1">
      <FaTrophy className="text-gray-400 text-xl drop-shadow-md" />
      <span className="text-gray-600 font-bold">2nd</span>
    </div>
  );
  if (rank === 3) return (
    <div className="flex items-center gap-1">
      <FaTrophy className="text-amber-700 text-xl drop-shadow-md" />
      <span className="text-amber-800 font-bold">3rd</span>
    </div>
  );
  return (
    <div className="flex items-center gap-1">
      <span className="font-bold text-gray-700">{rank}th</span>
    </div>
  );
};

type Player = {
  Player_ID: number;
  Player_name: string;
  Playerpoint: number;
  Level_Id?: number;
};

export default function LeaderBoard() {
  const { data: session } = useSession();
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        setIsLoading(true);
        // Fetch players
        const playersResponse = await fetch('/api/leaderboard');
        if (!playersResponse.ok) throw new Error('Failed to fetch players');
        const playersData = await playersResponse.json();
        
        // Get current player info if logged in
        let currentPlayer = null;
        if (session?.user?.memberId) {
          const userResponse = await fetch(`/api/user/${session.user.memberId}`);
          if (userResponse.ok) {
            currentPlayer = await userResponse.json();
          }
        }

        let topPlayers = playersData.slice(0, 10);
        
        // Add current player to list if not in top 10
        if (currentPlayer && !topPlayers.some((p: Player) => p?.Player_ID === currentPlayer.Player_ID)) {
          topPlayers.push(currentPlayer);
        }

        setPlayers(topPlayers);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboardData();

    // Set up event listeners for real-time updates
    const handleScoreUpdate = () => fetchLeaderboardData();
    window.addEventListener('scoreUpdated', handleScoreUpdate);
    window.addEventListener('levelCompleted', handleScoreUpdate);

    return () => {
      window.removeEventListener('scoreUpdated', handleScoreUpdate);
      window.removeEventListener('levelCompleted', handleScoreUpdate);
    };
  }, [session]);

  if (isLoading) {
    return (
      <div className="py-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Leaderboard</h2>
          <p className="text-gray-600 text-lg">Top Players</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Player</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Points</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {players.map((playerData, index) => {
                  const isCurrentPlayer = playerData?.Player_ID === session?.user?.memberId;
                  
                  return (
                    <tr
                      key={playerData?.Player_ID}
                      className={`${
                        isCurrentPlayer ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <RankBadge rank={index + 1} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="font-semibold text-gray-900">
                            {playerData?.Player_name || 'Anonymous'}
                            {isCurrentPlayer && (
                              <span className="ml-2 text-blue-600 text-sm">
                                (You)
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">
                          {(playerData.Playerpoint || 0).toLocaleString()} pts
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600">
                          Level {playerData.Level_Id || 1}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
