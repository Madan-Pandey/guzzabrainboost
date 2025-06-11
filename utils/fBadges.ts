import prisma from "@/lib/prisma";
import { calculateBadges } from "./calculateBadges";

export async function fetchUserBadges(playerId: number) {
  try {
    // Get player's level scores
    const levelScores = await prisma.levelScore.findMany({
      where: {
        player_id: playerId
      }
    });

    // Get player info
    const player = await prisma.player.findUnique({
      where: {
        Player_ID: playerId
      }
    });

    if (!player) {
      throw new Error('Player not found');
    }

    // Get total levels and sections
    const totalLevels = await prisma.level.count();
    const totalSections = Math.ceil(totalLevels / 5); // Assuming 5 levels per section

    // Calculate stats
    const stats = {
      totalPoints: player.Playerpoint || 0,
      streak: player.streak || 0,
      perfectScores: levelScores.filter(score => score.highest_score === 100).length,
      completedLevels: levelScores.filter(score => score.completion_percentage >= 50).length,
      totalLevels,
      sectionMasteries: Math.floor(levelScores.filter(score => score.completion_percentage >= 80).length / 5),
      totalSections
    };

    // Calculate badges
    const badges = calculateBadges(stats);
    
    return badges;
  } catch (error) {
    console.error('Error fetching badges:', error);
    return [];
  }
} 