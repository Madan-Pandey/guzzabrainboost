export type levelType = {
    Level_Id: number;
    Level_Title: string;
    Level_number: number;
};

export type PlayerType = {
    Player_ID: number;
    Player_name: string;
    email: string;
    Playerpoint: number;
    Level_Id: number;
    streak?: number;
    lastLogin?: Date;
    created_at?: Date;
};

export type BadgeTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND' | 'NO_BADGE';

export interface Badge {
  type: 'SCORE' | 'STREAK' | 'PERFECT' | 'PROGRESS' | 'SECTION';
  tier: BadgeTier;
  name: string;
  description: string;
  dateEarned?: Date;
  progress?: number;
  total?: number;
}

export interface UserBadges {
  scoreMaster: Badge;
  streakChampion: Badge;
  perfectScore: Badge;
  quizProgress: Badge;
  sectionMaster: Badge;
} 