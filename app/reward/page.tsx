import RewardCopy from "../components/rewardcopy";
import React from 'react';
import { auth } from "@/auth";
import fetchUser from "@/utils/fUser";
import { redirect } from "next/navigation";

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

export default async function Reward() {
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

  return (
    <div>
      <RewardCopy player={player as PlayerType | null} />
    </div>
  );
}