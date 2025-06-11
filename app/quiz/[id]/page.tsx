import { Metadata } from 'next';
import Qbtn from "@/app/components/buttons/quizbtn";
import { fetchQuiz } from "@/utils/fQuiz";
import QuizCard from "@/app/components/quizCard";
import QuizPageSection from "@/app/components/quizPageSection";
import fetchLevels from "@/utils/fLevels";
import fetchPlayers from "@/utils/fPlayers";
import { auth } from "@/auth";
import fetchUser from "@/utils/fUser";
import { getCookie, setCookie } from "cookies-next";
import Link from "next/link";
import { PlayerType, levelType } from '@/types/types';

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Set metadata with cache control headers
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: `Level ${params.id} - Guhuza Quiz`,
    description: `Take on Level ${params.id} of the Guhuza Quiz Challenge!`,
  };
}

type QuizQuestion = {
  question: string;
  comment: string;
  test_answer: number;
  answers: string[];
};

type Quiz = {
  test: {
    question: {
      question: string;
      comment: string;
      test_answer: number;
      answers: string[];
    }[];
  };
};

type Level = {
  Level_Id: number;
  Level_Title: string;
  Level_number: number;
};

type QuizApiResponse = Quiz;

type PageProps = {
  params: {
    id: string;
  };
};

type MilestoneType = {
  Milestone_Id: number;
  Milestone_Title: string;
  Milestone_description: string;
  UnlockingLevel: number;
  Milestone_reward_message: string;
  Milestone_Link: string;
  Milestone_Button_CTA: string;
};

function QuizErrorFallback({ error, levelNumber, retry }: { error: Error; levelNumber: string; retry: () => void }) {
  // Determine error type and message
  let errorTitle = "Unable to Load Quiz";
  let errorMessage = "We're having trouble loading Level " + levelNumber + ". This might be due to a temporary connection issue.";
  let errorIcon = "😕";

  if (error.message.includes("Invalid level number")) {
    errorTitle = "Invalid Level";
    errorMessage = "Please choose a level between 1 and 50.";
    errorIcon = "⚠️";
  } else if (error.message.includes("Level not found")) {
    errorTitle = "Level Not Found";
    errorMessage = "This level doesn't exist in our database. Please try a different level.";
    errorIcon = "🔍";
  } else if (error.message.includes("No questions found")) {
    errorTitle = "No Questions Available";
    errorMessage = "This level has no questions yet. Please try a different level.";
    errorIcon = "📝";
  } else if (error.message.includes("Failed to fetch quiz")) {
    errorTitle = "Connection Error";
    errorMessage = "We couldn't connect to the quiz server. Please check your internet connection and try again.";
    errorIcon = "🌐";
  }

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="bg-white rounded-xl p-8 shadow-lg max-w-md w-full mx-4 text-center space-y-6">
        <div className="w-16 h-16 mx-auto bg-red-50 rounded-full flex items-center justify-center">
          <span className="text-3xl">{errorIcon}</span>
        </div>
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-800">{errorTitle}</h2>
          <p className="text-gray-600">{errorMessage}</p>
          <p className="text-sm text-gray-500">{error.message}</p>
        </div>
        <div className="space-y-3 pt-4">
          <button
            onClick={retry}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </button>
          <Link
            href="/allquiz"
            className="block w-full px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            View All Levels
          </Link>
        </div>
      </div>
    </div>
  );
}

function QuizLoadingState({ levelNumber }: { levelNumber: string }) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="bg-white rounded-xl p-8 shadow-lg max-w-md w-full mx-4 text-center space-y-6">
        <div className="w-16 h-16 mx-auto bg-blue-50 rounded-full flex items-center justify-center relative">
          <div className="absolute inset-0 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
          <span className="text-3xl">📝</span>
        </div>
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-800">Loading Quiz</h2>
          <p className="text-gray-600">
            Preparing Level {levelNumber} for you...
          </p>
          <div className="flex flex-col gap-2">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 w-1/3 animate-pulse"></div>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 w-2/3 animate-pulse delay-100"></div>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 w-1/2 animate-pulse delay-200"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function Page({ params }: PageProps) {
  console.log('Loading quiz page for level:', params.id);
  
  let quizData: Quiz | null = null;
  let error: Error | null = null;
  let levels: Level[] = [];
  let currentLevel: Level | undefined;
  let player: PlayerType | null = null;

  try {
    // Validate level number first
    const levelNumber = Number(params.id);
    if (isNaN(levelNumber) || levelNumber < 1 || levelNumber > 50) {
      throw new Error(`Invalid level number: ${params.id}. Please choose a level between 1 and 50.`);
    }

    // Get user session and player data first
    console.log('Getting user session...');
    const session = await auth();
    
    // For local development, use a default player if not logged in
    if (!session?.user) {
      player = {
        Player_ID: 1,
        Player_name: "Anonymous",
        email: "anonymous@local",
        Playerpoint: 0,
        Level_Id: levelNumber,
        streak: 0,
        lastLogin: new Date(),
        created_at: new Date()
      };
    } else {
      const user = session.user;
      const fetchedPlayer = await fetchUser(
        Number(user.memberId),
        user.firstName ?? "Anonymous",
        user.email || ''
      );
      
      // Ensure we have all required fields
      player = {
        Player_ID: fetchedPlayer.Player_ID,
        Player_name: fetchedPlayer.Player_name || "Anonymous",
        email: fetchedPlayer.email || "anonymous@local",
        Playerpoint: fetchedPlayer.Playerpoint || 0,
        Level_Id: fetchedPlayer.Level_Id || levelNumber,
        streak: fetchedPlayer.streak || 0,
        lastLogin: fetchedPlayer.lastLogin || new Date(),
        created_at: fetchedPlayer.created_at || new Date()
      };
    }

    // Fetch quiz data with cache busting
    console.log('Fetching quiz data...');
    quizData = await fetchQuiz(params.id);
    
    if (!quizData) {
      throw new Error(`No quiz data found for level ${params.id}`);
    }

    // Get level info
    console.log('Fetching levels...');
    levels = await fetchLevels();
    currentLevel = levels.find(l => l.Level_number === Number(params.id));

    if (!currentLevel) {
      throw new Error(`Level ${params.id} not found`);
    }

  } catch (e) {
    error = e as Error;
    console.error('Error loading quiz:', error);
  }

  if (error) {
    return <QuizErrorFallback error={error} levelNumber={params.id} retry={() => window.location.reload()} />;
  }

  if (!quizData || !currentLevel) {
    return <div>Loading...</div>;
  }

  const levelTitle = currentLevel.Level_Title;
  const levelNumber = String(currentLevel.Level_number);

  return (
    <div>
      <QuizPageSection 
        Quizes={quizData.test.question} 
        levelNumber={levelNumber} 
        levelTitle={levelTitle} 
        player={player} 
      />
    </div>
  );
}
