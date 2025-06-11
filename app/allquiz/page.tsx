import { auth } from "@/auth";
import MilestoneList from "@/app/components/milestoneList";
import fetchLevels from "@/utils/fLevels";
import fetchUser from "@/utils/fUser";
import { Suspense } from "react";
import { headers } from 'next/headers';
import { cookies } from 'next/headers';

// Force dynamic rendering and disable cache
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Level = {
  Level_Id: number;
  Level_Title: string;
  Level_number: number;
};

function LoadingState() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
        ))}
      </div>
    </div>
  );
}

export default async function AllQuizPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Force revalidation by reading headers
  headers();
  
  // Get the current player level from cookies
  const cookieStore = cookies();
  const playerLevelCookie = cookieStore.get('PlayerLevel');
  const cookiePlayerLevel = playerLevelCookie ? Number(playerLevelCookie.value) : 1;
  
  // Fetch data server-side with no cache
  const session = await auth();
  const levels = await fetchLevels();
  
  let playerLevel = cookiePlayerLevel;
  
  // Get player level if user is logged in
  if (session?.user?.memberId && session.user.firstName && session.user.email) {
    try {
      const player = await fetchUser(
        Number(session.user.memberId),
        session.user.firstName,
        session.user.email
      );
      
      // Use the highest level between cookie and database
      playerLevel = Math.max(player?.Level_Id || 1, cookiePlayerLevel);

      // If we just completed a level, ensure we're showing the next level
      const completedLevel = searchParams.completed ? Number(searchParams.completed) : null;
      const nextLevel = searchParams.next ? Number(searchParams.next) : null;
      
      if (completedLevel && nextLevel) {
        // Use the highest level among all sources
        playerLevel = Math.max(playerLevel, nextLevel);
      }

      console.log('Player level determined:', {
        cookieLevel: cookiePlayerLevel,
        dbLevel: player?.Level_Id,
        completedLevel,
        nextLevel,
        finalLevel: playerLevel
      });

    } catch (error) {
      console.error('Error fetching player:', error);
    }
  }

  return (
    <main className="min-h-screen py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">All Quiz Levels</h1>
          <Suspense fallback={<LoadingState />}>
            <MilestoneList 
              allLevels={levels} 
              playerLevel={playerLevel} 
              justCompleted={searchParams.completed ? Number(searchParams.completed) : undefined}
            />
          </Suspense>
        </div>
      </div>
    </main>
  );
}