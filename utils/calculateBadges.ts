import { Badge, BadgeTier } from '@/types/types';

const calculateTier = (value: number, thresholds: number[]): BadgeTier => {
  if (value >= thresholds[0]) return 'DIAMOND';
  if (value >= thresholds[1]) return 'PLATINUM';
  if (value >= thresholds[2]) return 'GOLD';
  if (value >= thresholds[3]) return 'SILVER';
  if (value >= thresholds[4]) return 'BRONZE';
  return 'NO_BADGE';
};

interface PlayerStats {
  totalPoints: number;
  streak: number;
  perfectScores: number;
  completedLevels: number;
  totalLevels: number;
  sectionMasteries: number;
  totalSections: number;
}

export function calculateBadges(stats: PlayerStats): Badge[] {
  const badges: Badge[] = [
    {
      type: 'SCORE',
      tier: calculateTier(stats.totalPoints, [1000, 750, 500, 250, 100]),
      name: 'Score Master',
      description: 'Earn points from completing quizzes',
      progress: stats.totalPoints,
      total: 1000
    },
    {
      type: 'STREAK',
      tier: calculateTier(stats.streak, [30, 20, 14, 7, 3]),
      name: 'Streak Champion',
      description: 'Maintain a daily login streak',
      progress: stats.streak,
      total: 30
    },
    {
      type: 'PERFECT',
      tier: calculateTier(stats.perfectScores, [20, 15, 10, 5, 1]),
      name: 'Perfect Score',
      description: 'Get 100% on quizzes',
      progress: stats.perfectScores,
      total: 20
    },
    {
      type: 'PROGRESS',
      tier: calculateTier(
        (stats.completedLevels / stats.totalLevels) * 100,
        [100, 80, 60, 40, 20]
      ),
      name: 'Quiz Progress',
      description: 'Complete quiz levels',
      progress: stats.completedLevels,
      total: stats.totalLevels
    },
    {
      type: 'SECTION',
      tier: calculateTier(
        (stats.sectionMasteries / stats.totalSections) * 100,
        [100, 80, 60, 40, 20]
      ),
      name: 'Section Master',
      description: 'Master quiz sections',
      progress: stats.sectionMasteries,
      total: stats.totalSections
    }
  ];

  return badges;
} 