import React from "react";
import Pbtn from "../components/buttons/primarybtn";
import Image from "next/image";
import WhyplaySection from "./whyplaySection";
import QuizLevelSections from "../components/quizLevelSections";
import LeaderBoard from "../components/leaderBoard";
import ProfileHerosection from "../components/profileHerosection";
import ShareButton from "../components/buttons/sharebtn";
import QuizHero from "../components/quizHero";
import fetchPlayers from "@/utils/fPlayers";
import { auth } from "@/auth";
import LogoutButton from "../components/buttons/logoutBtn";
import LoginButton from "../components/buttons/loginBtn";
import fetchUser from "@/utils/fUser";
import { cookies } from "next/headers";

async function QuizHomePage() {
  const session = await auth();
  let playerLevel = 1;

  if (session?.user) {
    const user = session.user;
    const name = user?.firstName ?? "Anonymous";

    const player = await fetchUser(
      Number(user?.memberId),
      name,
      user?.email || ''
    );

    playerLevel = player?.Level_Id ?? 1;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <QuizHero />

      {/* Why Play Section */}
      <div className="whyplay">
        <WhyplaySection playerLevel={playerLevel} />
      </div>

      {/* Quiz Level Section */}
      <div className="QuizSection mt-16">
        <QuizLevelSections playerLevel={playerLevel} />
      </div>

      {/* Leaderboard Section */}
      <div className="leaderboard section container mb-16">
        <LeaderBoard />
      </div>
    </div>
  );
}

export default QuizHomePage;
