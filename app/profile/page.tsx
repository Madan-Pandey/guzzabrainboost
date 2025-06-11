import { auth } from "@/auth";
import fetchUser from "@/utils/fUser";
import fetchRank from "@/utils/fRanking";
import { fetchUserBadges } from "@/utils/fBadges";
import { redirect } from "next/navigation";
import ProfileHerosection from "../components/profileHerosection";
import QuizLevelSections from "../components/quizLevelSections";
import Badges from "../components/badges";

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

export default async function Profile() {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  const user = session.user;
  const name = user?.firstName == null ? "Anonymous" : user?.firstName + " " + user?.lastName;

  const player = session
    ? await fetchUser(
      Number(user?.memberId),
      name,
      user?.email || ""
    )
    : null;

  const playerPoint = player?.Playerpoint ?? 0;
  const playerRank = player ? await fetchRank(playerPoint) : 100;
  const playerLevel = player?.Level_Id ?? 1;
  const badges = player ? await fetchUserBadges(player.Player_ID) : [];

  return (
    <div className="p-6 min-h-screen">
      <ProfileHerosection player={player as PlayerType | null} playerRank={playerRank} />
      
      {/* Badges Section */}
      <div className="mt-12 container mx-auto max-w-6xl">
        <Badges badges={badges} />
      </div>
      
      <div className="mt-12">
        <QuizLevelSections playerLevel={playerLevel} />
      </div>
    </div>
  );
}
