"use client";
import React, { useState, useEffect } from "react";
import QuizCard from "./quizCard";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { setCookie } from "cookies-next";
import QuestionTimer from "./QuestionTimer";
import LeaderBoard from "./leaderBoard";
import ShareButton from "./buttons/sharebtn";
import { auth } from "@/auth";
import fetchPlayers from "@/utils/fPlayers";
import fetchRank from "@/utils/fRanking";
import fetchUser from "@/utils/fUser";
import { FaTrophy, FaMedal } from 'react-icons/fa';
import Link from "next/link";
import { PlayerType } from '@/types/types';
import QuizCompletionScreen from "./QuizCompletionScreen";

type quizeType = {
  question: string;
  comment: string;
  test_answer: number;
  answers: string[];
};

type QuizPageSectionProps = {
  Quizes: {
    question: string;
    comment: string;
    test_answer: number;
    answers: string[];
  }[];
  levelNumber: string;
  levelTitle: string;
  player: PlayerType | null;
};

export default function QuizPageSection({ Quizes, levelNumber, levelTitle, player }: QuizPageSectionProps) {
  const len = Quizes.length;
  const router = useRouter();
  const [score, setScore] = useState<number>(0);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(-1);
  const [answerChecked, setAnswerChecked] = useState(false);
  const [ansCorrect, setAnsCorrect] = useState(false);
  const [usedHint, setUsedHint] = useState(false);
  const [retried, setRetried] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
  const [showTimeUpOptions, setShowTimeUpOptions] = useState(false);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const [isUpdatingScore, setIsUpdatingScore] = useState(false);
  const [levelScore, setLevelScore] = useState<number>(0);
  const [levelHistory, setLevelHistory] = useState<any[]>([]);
  const [leaderboardKey, setLeaderboardKey] = useState(0);
  const quizer: quizeType = Quizes[questionNumber];

  const setDefault = () => {
    setSelectedAnswer(-1);
    setAnswerChecked(false);
    setAnsCorrect(false);
    setUsedHint(false);
    setRetried(false);
  };

  const handleTimeUp = (extendTime: boolean) => {
    if (extendTime) {
      setScore(prev => Math.max(0, prev - 20)); // Deduct 20 points but don't go below 0
      setTimerKey(prev => prev + 1); // Reset timer
    } else {
      setShowTimeUpOptions(true);
    }
  };

  const handleShowAnswer = () => {
    setSelectedAnswer(quizer.test_answer);
    setAnswerChecked(true);
    setShowTimeUpOptions(false);
  };

  const handleExtendTime = () => {
    setScore(prev => Math.max(0, prev - 20)); // Deduct 20 points but don't go below 0
    setTimerKey(prev => prev + 1); // Reset timer
    setShowTimeUpOptions(false);
  };

  const handleNextLevel = async () => {
    const nextLevel = Number(levelNumber) + 1;
    router.push(`/quiz/${nextLevel}`);
  };

  const updateScoreInDatabase = async (newScore: number) => {
    try {
      const response = await fetch('/api/updateScore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerId: player?.Player_ID || 1, // Default to player 1 if not set
          score: newScore,
          levelNumber: Number(levelNumber)
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update score');
      }

      // Force leaderboard refresh
      setLeaderboardKey(prev => prev + 1);
      
      // Dispatch a custom event for real-time updates
      window.dispatchEvent(new CustomEvent('scoreUpdated', {
        detail: { playerId: player?.Player_ID || 1, newScore }
      }));

    } catch (error) {
      console.error('Error updating score:', error);
    }
  };

  const handleScore = async () => {
    setAnswerChecked(true);
    if (selectedAnswer === quizer.test_answer) {
      // Calculate points based on whether hint was used or retried
      let pointsToAdd = 20; // Base points for correct answer
      if (usedHint) {
        pointsToAdd = 0; // No points if hint was used
      } else if (retried) {
        pointsToAdd = 10; // Half points if retried
      }

      // Update score
      const newScore = score + pointsToAdd;
      setScore(newScore);

      // Update database with current progress
      try {
        const response = await fetch('/api/updateScore', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            playerId: player?.Player_ID || 1,
            score: newScore,
            levelNumber: Number(levelNumber)
          })
        });

        if (response.ok) {
          // Force leaderboard refresh
          setLeaderboardKey(prev => prev + 1);
          
          // Dispatch score update event
          window.dispatchEvent(new CustomEvent('scoreUpdated', {
            detail: {
              playerId: player?.Player_ID || 1,
              level: Number(levelNumber),
              score: newScore
            }
          }));
        }
      } catch (error) {
        console.error('Error updating score during gameplay:', error);
      }
    }
  };

  const handleNextQuestion = () => {
    if (questionNumber < len) {
      setQuestionNumber(prev => prev + 1);
      setDefault();
      setTimerKey(prev => prev + 1);
      setShowTimeUpOptions(false);
    }
  };

  const handleRetry = () => { 
    setScore(0);
    setQuestionNumber(0);
    router.push(`/quiz/${levelNumber}`);
  };

  const quizCompleted = questionNumber >= len;

  useEffect(() => {
    if (quizCompleted && !showCompletionScreen) {
      setShowCompletionScreen(true);
    }
  }, [quizCompleted]);

  useEffect(() => {
    if (quizCompleted && player?.Player_ID) {
      const fetchLevelHistory = async () => {
        try {
          const response = await fetch(`/api/levelHistory?playerId=${player.Player_ID}`);
          if (response.ok) {
            const data = await response.json();
            setLevelHistory(data.history || []);
          }
        } catch (error) {
          console.error('Error fetching level history:', error);
        }
      };
      fetchLevelHistory();
    }
  }, [quizCompleted, player?.Player_ID]);

  useEffect(() => {
    const handleScoreUpdate = (event: CustomEvent) => {
      if (event.detail.playerId === player?.Player_ID) {
        setScore(event.detail.newScore);
      }
    };

    window.addEventListener('scoreUpdated', handleScoreUpdate as EventListener);
    return () => {
      window.removeEventListener('scoreUpdated', handleScoreUpdate as EventListener);
    };
  }, [player?.Player_ID]);

  const handleCompletionAcknowledged = () => {
    const nextLevel = Number(levelNumber) + 1;
    window.location.href = `/quiz/${nextLevel}`;
  };

  // Add this effect to handle level loading
  useEffect(() => {
    const loadLevel = async () => {
      try {
        // Force fetch new quiz data when level changes
        const response = await fetch(`/api/quiz/${levelNumber}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          // Reset quiz state
          setQuestionNumber(0);
          setScore(0);
          setSelectedAnswer(-1);
          setAnswerChecked(false);
          setAnsCorrect(false);
          setUsedHint(false);
          setRetried(false);
          setShowTimeUpOptions(false);
          setShowCompletionScreen(false);
        }
      } catch (error) {
        console.error('Error loading level:', error);
      }
    };

    loadLevel();
  }, [levelNumber]); // Reload when level changes

  const isLastQuestion = questionNumber === len - 1;
  const isLastQuestionChecked = isLastQuestion && answerChecked;

  const handleShare = (platform: string) => {
    const totalScore = (player?.Playerpoint || 0) + score;
    const correctAnswers = score / 20;
    const totalQuestions = Quizes.length;
    const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
    
    let shareText = `🎯 Level ${levelNumber} Completed!\n`;
    shareText += `📚 ${levelTitle}\n`;      
    shareText += `✨ Score: ${score} points\n`;
    shareText += `📊 Accuracy: ${accuracy}%\n`;
    shareText += `🏆 Total Score: ${totalScore} points\n\n`;
    shareText += `🎮 Try Guhuza Quiz and test your knowledge!\n`;
    shareText += `🌟 Join me on this learning journey!\n`;
    
    const shareUrl = "https://guhuzaquiz.com";
    
    let shareLink = "";
    switch (platform) {
      case "twitter":
        const twitterText = `🎯 Just scored ${score} points in "${levelTitle}" on Guhuza Quiz with ${accuracy}% accuracy! Can you beat my score? Join the challenge! #GuhuzaQuiz #Learning`;
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
        break;
      case "linkedin":
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent("Guhuza Quiz Achievement")}&summary=${encodeURIComponent(shareText)}`;
        break;
      case "whatsapp":
        shareLink = `https://wa.me/?text=${encodeURIComponent(shareText + "\n" + shareUrl)}`;
        break;
      case "telegram":
        shareLink = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        break;
    }
    
    if (shareLink) {
      window.open(shareLink, '_blank', 'width=600,height=400');
    }
  };

  return !quizCompleted ? (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/20 to-transparent py-4 md:py-8">
      {showTimeUpOptions && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 mx-4 max-w-md w-full transform transition-all duration-300 scale-95 hover:scale-100 shadow-2xl border border-blue-100/50 backdrop-blur-lg">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-50 rounded-xl shadow-inner">
                <span className="text-4xl">⏰</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Time's Up!</h2>
                <p className="text-gray-600">Choose your next action</p>
              </div>
            </div>
            <div className="space-y-3">
              <button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                onClick={handleShowAnswer}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Show Answer
              </button>
              <button 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                onClick={handleNextQuestion}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
                Next Question
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container px-4 mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          <div className="flex-1 bg-white rounded-2xl p-4 md:p-6 shadow-lg border border-gray-100/50 backdrop-blur-sm">
            <div className="flex flex-col min-h-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="space-y-2">
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 break-words">
                      Level {levelNumber}: {levelTitle}
                    </h2>
                    <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-200 shadow-sm inline-block">
                      <p className="text-gray-700 font-medium">
                        Question <span className="text-blue-600">{questionNumber + 1}</span> /{" "}
                        <span className="text-blue-600">{len}</span>
                      </p>
                    </div>
                  </div>
                  {!answerChecked && (
                    <div className="bg-white rounded-xl p-3 shadow-md border border-gray-100">
                      <QuestionTimer 
                        key={`${questionNumber}-${timerKey}`}
                        onTimeUp={handleTimeUp}
                        isActive={!answerChecked}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto py-6">
                <QuizCard
                  Question={quizer.question}
                  CorrectAns={quizer.test_answer}
                  Answers={quizer.answers}
                  selectedAnswer={selectedAnswer}
                  setSelectedAnswer={setSelectedAnswer}
                  checked={answerChecked}
                  setAnsCorrect={setAnsCorrect}
                />
              </div>

              <div className="sticky bottom-0 bg-white pt-4">
                {answerChecked ? (
                  <div className="w-full">
                    {!ansCorrect ? (
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                          <button
                            className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 w-full sm:w-auto text-sm md:text-base shadow-md hover:shadow-lg"
                            onClick={() => {
                              setSelectedAnswer(-1);
                              setAnswerChecked(false);
                              setRetried(true);
                            }}
                            disabled={usedHint}
                          >
                            Try Again
                          </button>
                          <button
                            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 w-full sm:w-auto text-sm md:text-base shadow-md hover:shadow-lg"
                            onClick={() => {
                              setSelectedAnswer(quizer.test_answer);
                              setUsedHint(true);
                            }}
                          >
                            Show Answer
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 text-center bg-blue-50/50 py-2.5 px-4 rounded-lg border border-blue-100/50">
                          Check the answer - no points will be deducted for learning
                        </p>
                      </div>
                    ) : (
                      <button
                        className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 text-sm md:text-base shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                        onClick={isLastQuestionChecked ? () => setQuestionNumber(len) : handleNextQuestion}
                      >
                        {isLastQuestionChecked ? (
                          <>
                            Finish Quiz
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </>
                        ) : (
                          <>
                            Next Question
                            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" viewBox="0 0 16 16" fill="currentColor">
                              <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                            </svg>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base shadow-md hover:shadow-lg"
                    onClick={handleScore}
                    disabled={selectedAnswer === -1}
                  >
                    Check Answer
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/3 lg:sticky lg:top-4 min-h-[200px] sm:min-h-[300px] lg:min-h-0">
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 flex items-center justify-center bg-blue-50 rounded-lg">
                  <span className="text-xl">📝</span>
                </div>
                <h2 className="text-lg font-bold text-gray-800">Progress</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1.5">
                    <span>Completion</span>
                    <span>{Math.round((questionNumber / len) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500"
                      style={{ width: `${(questionNumber / len) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2 border-t border-gray-100">
                  <span className="text-gray-600 text-sm">Score</span>
                  <span className="text-lg font-semibold text-blue-600">+{score}</span>
                </div>
              </div>
            </div>

            <div className="relative w-full aspect-square max-w-none mx-auto">
              <div className="relative w-full h-full">
                {answerChecked ? (
                  ansCorrect ? (
                    <Image
                      src="/mascot/proudMascot.svg"
                      alt="Happy Mascot"
                      fill
                      className="object-contain drop-shadow-xl animate-bounce-slow"
                      priority
                    />
                  ) : (
                    <Image
                      src="/mascot/sadMascot.svg"
                      alt="Sad Mascot"
                      fill
                      className="object-contain drop-shadow-xl animate-wobble"
                      priority
                    />
                  )
                ) : (
                  <Image
                    src="/mascot/thinkingMascot.svg"
                    alt="Thinking Mascot"
                    fill
                    className="object-contain drop-shadow-xl animate-float"
                    priority
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/30 via-purple-50/20 to-transparent py-6 animate-gradient-xy relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl"></div>
        <div className="absolute top-1/4 -left-16 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-1/4 -right-16 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-rose-500/10 rounded-full blur-2xl"></div>
        
        <div className="absolute top-10 left-[10%] animate-float-slow opacity-20 text-4xl">🎯</div>
        <div className="absolute top-1/3 right-[15%] animate-float-slower opacity-20 text-4xl delay-300">⭐</div>
        <div className="absolute bottom-1/4 left-[20%] animate-float opacity-20 text-4xl delay-700">🏆</div>
        <div className="absolute top-2/3 right-[25%] animate-float-slow opacity-20 text-4xl delay-1000">🎉</div>
        
        <div className="absolute top-20 right-[30%] w-4 h-4 border-2 border-emerald-400/20 rounded-full animate-spin-slower"></div>
        <div className="absolute bottom-32 left-[40%] w-6 h-6 border-2 border-blue-400/20 rounded-sm rotate-45 animate-float-slow"></div>
        <div className="absolute top-1/2 right-[10%] w-3 h-3 bg-purple-400/20 rounded-full animate-ping"></div>
      </div>

      <div className="container px-4 mx-auto">
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex justify-center gap-4 opacity-60">
          <div className="w-px h-24 bg-gradient-to-b from-transparent via-emerald-400/30 to-transparent animate-firework-1"></div>
          <div className="w-px h-32 bg-gradient-to-b from-transparent via-blue-400/30 to-transparent animate-firework-2 delay-300"></div>
          <div className="w-px h-28 bg-gradient-to-b from-transparent via-purple-400/30 to-transparent animate-firework-3 delay-500"></div>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
          <div className="space-y-5">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-blue-100/50 relative overflow-hidden transform hover:scale-[1.01] transition-transform duration-300">
              <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,transparent_40%,rgba(96,165,250,0.08)_50%,transparent_60%,transparent_100%)] animate-shine"></div>
              <div className="relative">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 rounded-xl border border-emerald-100/50 transform hover:rotate-12 transition-transform duration-300 relative group">
                    <div className="absolute inset-0 rounded-xl bg-white/50 backdrop-blur-sm group-hover:backdrop-blur-0 transition-all duration-300"></div>
                    <span className="text-3xl relative animate-bounce-slow z-10">🎉</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-semibold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent animate-gradient-x">
                      Level Complete!
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">{levelTitle}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 rounded-lg p-4 border border-amber-100/50 transform hover:scale-[1.02] transition-all duration-300 hover:shadow-lg group relative">
                    <div className="absolute inset-0 bg-white/50 rounded-lg backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl group-hover:animate-spin-slow">⭐</span>
                        <h2 className="text-sm font-medium text-gray-700">Level Score</h2>
                      </div>
                      <div className="text-2xl font-semibold text-amber-600 group-hover:animate-pulse">
                        +{score}
                      </div>
                      {levelHistory.length > 0 && levelHistory.some(h => h.level_completed === Number(levelNumber)) && (
                        <div className="mt-2 text-xs text-gray-500">
                          Previous best: {Math.max(...levelHistory.filter(h => h.level_completed === Number(levelNumber)).map(h => h.score_gained))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 rounded-lg p-4 border border-purple-100/50 transform hover:scale-[1.02] transition-all duration-300 hover:shadow-lg group relative">
                    <div className="absolute inset-0 bg-white/50 rounded-lg backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl group-hover:animate-spin-slow">🌟</span>
                        <h2 className="text-sm font-medium text-gray-700">Achievement</h2>
                      </div>
                      <div className="text-2xl font-semibold text-purple-600">
                        {Math.floor((score / (Quizes.length * 20)) * 100)}% Complete
                      </div>
                      <div className="mt-2 flex gap-1">
                        {Array.from({ length: Math.min(4, Math.ceil((score / (Quizes.length * 20)) * 4)) }).map((_, i) => (
                          <span key={i} className="text-lg animate-pulse">⭐</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {levelHistory.length > 0 && (
                  <div className="mt-6 bg-white/80 rounded-xl p-4 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Level History</h3>
                    <div className="space-y-2">
                      {levelHistory
                        .filter(h => h.level_completed === Number(levelNumber))
                        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                        .slice(0, 3)
                        .map((history, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                              {new Date(history.timestamp).toLocaleDateString()}
                            </span>
                            <span className="font-medium text-blue-600">
                              +{history.score_gained} points
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Share Your Achievement</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
                    {[
                      { name: "X", platform: "twitter", icon: "/social/x.svg", gradient: "from-neutral-950 via-neutral-900 to-neutral-800" },
                      { name: "Facebook", platform: "facebook", icon: "/social/facebook.svg", gradient: "from-blue-600 via-blue-500 to-blue-400" },
                      { name: "LinkedIn", platform: "linkedin", icon: "/social/linkedin.svg", gradient: "from-blue-700 via-blue-600 to-blue-500" },
                      { name: "WhatsApp", platform: "whatsapp", icon: "/social/whatsapp.svg", gradient: "from-green-500 via-green-400 to-emerald-400" },
                      { name: "Telegram", platform: "telegram", icon: "/social/telegram.svg", gradient: "from-sky-600 via-sky-500 to-blue-500" }
                    ].map((platform) => (
                      <div key={platform.name} className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-purple-500/20 rounded-2xl blur-xl transition-opacity opacity-0 group-hover:opacity-100 animate-pulse-slow"></div>
                        <div className="relative flex flex-col items-center gap-3">
                          <button
                            onClick={() => handleShare(platform.platform)}
                            className="w-16 h-16 flex items-center justify-center bg-white rounded-2xl shadow-lg border border-gray-100 transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl relative overflow-hidden"
                          >
                            <div className={`absolute inset-0 bg-gradient-to-br ${platform.gradient} opacity-0 group-hover:opacity-100 transition-all duration-500`}></div>
                            <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,transparent_40%,rgba(255,255,255,0.2)_50%,transparent_60%,transparent_100%)] group-hover:animate-shimmer"></div>
                            <Image 
                              src={platform.icon} 
                              alt={platform.name} 
                              width={24} 
                              height={24} 
                              className="relative z-10 transition-all duration-300 group-hover:brightness-0 group-hover:invert transform group-hover:scale-110"
                            />
                          </button>
                          <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors duration-300">
                            {platform.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 mt-8">
                  <button 
                    className={`px-6 py-3 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-sm font-medium text-white rounded-lg transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 relative group overflow-hidden transform hover:scale-[1.02] ${isUpdatingScore ? 'opacity-75 cursor-not-allowed' : ''}`}
                    onClick={handleCompletionAcknowledged}
                    disabled={isUpdatingScore}
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,transparent_40%,rgba(255,255,255,0.2)_50%,transparent_60%,transparent_100%)] group-hover:animate-shimmer"></div>
                    <span className="relative flex items-center gap-2">
                      {isUpdatingScore ? (
                        <>
                          Updating Score...
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </>
                      ) : (
                        <>
                          Continue to Next Level
                          <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" viewBox="0 0 16 16" fill="currentColor">
                            <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                          </svg>
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-6">
            <div className="bg-gradient-to-br from-white via-orange-50/20 to-amber-50/30 rounded-2xl border border-orange-100/50 relative overflow-hidden shadow-xl backdrop-blur-sm animate-fade-in">
              <LeaderBoard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}