import { Badge, BadgeTier } from '@/types/types';

const BADGE_REQUIREMENTS = {
  SCORE: {
    DIAMOND: 1000,
    PLATINUM: 750,
    GOLD: 500,
    SILVER: 250,
    BRONZE: 100
  },
  STREAK: {
    DIAMOND: 30,
    PLATINUM: 20,
    GOLD: 14,
    SILVER: 7,
    BRONZE: 3
  },
  PERFECT: {
    DIAMOND: 20,
    PLATINUM: 15,
    GOLD: 10,
    SILVER: 5,
    BRONZE: 1
  },
  PROGRESS: {
    DIAMOND: 100,
    PLATINUM: 80,
    GOLD: 60,
    SILVER: 40,
    BRONZE: 20
  },
  SECTION: {
    DIAMOND: 10,
    PLATINUM: 8,
    GOLD: 6,
    SILVER: 4,
    BRONZE: 2
  }
};

export function calculateScoreBadge(score: number): Badge {
  let tier: BadgeTier = 'NO_BADGE';
  
  if (score >= BADGE_REQUIREMENTS.SCORE.DIAMOND) tier = 'DIAMOND';
  else if (score >= BADGE_REQUIREMENTS.SCORE.PLATINUM) tier = 'PLATINUM';
  else if (score >= BADGE_REQUIREMENTS.SCORE.GOLD) tier = 'GOLD';
  else if (score >= BADGE_REQUIREMENTS.SCORE.SILVER) tier = 'SILVER';
  else if (score >= BADGE_REQUIREMENTS.SCORE.BRONZE) tier = 'BRONZE';

  return {
    type: 'SCORE',
    tier,
    name: 'Score Master',
    description: `Achieve a score of ${score} points`,
    dateEarned: new Date(),
    progress: score,
    total: BADGE_REQUIREMENTS.SCORE.DIAMOND
  };
}

export function calculateStreakBadge(consecutiveScores: number[]): Badge {
  const goodScores = consecutiveScores.filter(score => score >= 80).length;
  let tier: BadgeTier = 'NO_BADGE';

  if (goodScores >= BADGE_REQUIREMENTS.STREAK.DIAMOND) tier = 'DIAMOND';
  else if (goodScores >= BADGE_REQUIREMENTS.STREAK.PLATINUM) tier = 'PLATINUM';
  else if (goodScores >= BADGE_REQUIREMENTS.STREAK.GOLD) tier = 'GOLD';
  else if (goodScores >= BADGE_REQUIREMENTS.STREAK.SILVER) tier = 'SILVER';
  else if (goodScores >= BADGE_REQUIREMENTS.STREAK.BRONZE) tier = 'BRONZE';

  return {
    type: 'STREAK',
    tier,
    name: 'Streak Champion',
    description: `Maintain ${goodScores} consecutive scores above 80`,
    dateEarned: new Date(),
    progress: goodScores,
    total: BADGE_REQUIREMENTS.STREAK.DIAMOND
  };
}

export function calculatePerfectBadge(perfectScores: number): Badge {
  let tier: BadgeTier = 'NO_BADGE';

  if (perfectScores >= BADGE_REQUIREMENTS.PERFECT.DIAMOND) tier = 'DIAMOND';
  else if (perfectScores >= BADGE_REQUIREMENTS.PERFECT.PLATINUM) tier = 'PLATINUM';
  else if (perfectScores >= BADGE_REQUIREMENTS.PERFECT.GOLD) tier = 'GOLD';
  else if (perfectScores >= BADGE_REQUIREMENTS.PERFECT.SILVER) tier = 'SILVER';
  else if (perfectScores >= BADGE_REQUIREMENTS.PERFECT.BRONZE) tier = 'BRONZE';

  return {
    type: 'PERFECT',
    tier,
    name: 'Perfect Score',
    description: `Achieve ${perfectScores} perfect scores`,
    dateEarned: new Date(),
    progress: perfectScores,
    total: BADGE_REQUIREMENTS.PERFECT.DIAMOND
  };
}

export function calculateProgressBadge(completedLevels: number): Badge {
  let tier: BadgeTier = 'NO_BADGE';

  if (completedLevels >= BADGE_REQUIREMENTS.PROGRESS.DIAMOND) tier = 'DIAMOND';
  else if (completedLevels >= BADGE_REQUIREMENTS.PROGRESS.PLATINUM) tier = 'PLATINUM';
  else if (completedLevels >= BADGE_REQUIREMENTS.PROGRESS.GOLD) tier = 'GOLD';
  else if (completedLevels >= BADGE_REQUIREMENTS.PROGRESS.SILVER) tier = 'SILVER';
  else if (completedLevels >= BADGE_REQUIREMENTS.PROGRESS.BRONZE) tier = 'BRONZE';

  return {
    type: 'PROGRESS',
    tier,
    name: 'Quiz Progress',
    description: `Complete ${completedLevels} levels`,
    dateEarned: new Date(),
    progress: completedLevels,
    total: BADGE_REQUIREMENTS.PROGRESS.DIAMOND
  };
}

export function calculateSectionBadge(sectionLevelsCompleted: number): Badge {
  let tier: BadgeTier = 'NO_BADGE';

  if (sectionLevelsCompleted >= BADGE_REQUIREMENTS.SECTION.DIAMOND) tier = 'DIAMOND';
  else if (sectionLevelsCompleted >= BADGE_REQUIREMENTS.SECTION.PLATINUM) tier = 'PLATINUM';
  else if (sectionLevelsCompleted >= BADGE_REQUIREMENTS.SECTION.GOLD) tier = 'GOLD';
  else if (sectionLevelsCompleted >= BADGE_REQUIREMENTS.SECTION.SILVER) tier = 'SILVER';
  else if (sectionLevelsCompleted >= BADGE_REQUIREMENTS.SECTION.BRONZE) tier = 'BRONZE';

  return {
    type: 'SECTION',
    tier,
    name: 'Section Master',
    description: `Complete ${sectionLevelsCompleted} levels in a section`,
    dateEarned: new Date(),
    progress: sectionLevelsCompleted,
    total: BADGE_REQUIREMENTS.SECTION.DIAMOND
  };
} 