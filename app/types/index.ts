export type PlayerType = {
  Player_ID: number;
  Player_name: string | null;
  email: string | null;
  Playerpoint: number | null;
  Level_Id: number | null;
  Milestone_Id: number | null;
  lastLogin: Date | null;
  streak: number | null;
  milestone: {
    Milestone_Id: number;
    Milestone_Title: string;
    Milestone_description: string;
    UnlockingLevel: number;
    Milestone_Button_CTA: string;
    Milestone_Link: string;
    Milestone_reward_message: string;
  } | null;
  level: {
    Level_Id: number;
    Level_Title: string;
    Level_number: number;
  } | null;
  level_scores?: {
    Level_Id: number;
    Score: number;
    CompletedAt: Date;
  }[];
}; 