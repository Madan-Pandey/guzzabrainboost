'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { levelType } from '@/types/types';

type MilestoneListProps = {
  allLevels: levelType[];
  playerLevel: number;
  justCompleted?: number;
};

export default function MilestoneList({ allLevels, playerLevel, justCompleted }: MilestoneListProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isCurrent, setIsCurrent] = useState(false);

  const getButtonClass = () => {
    if (!isUnlocked) return 'bg-gray-50 text-gray-400';
    if (isCompleted) return 'bg-green-50/30 text-green-600';
    if (isCurrent) return 'bg-blue-50/30 text-blue-600';
    return 'bg-gray-50 text-gray-600';
  };

  const getLevelNameClass = () => {
    if (!isUnlocked) return 'bg-gray-50 text-gray-400';
    if (isCompleted) return 'bg-green-50/30 text-green-600';
    if (isCurrent) return 'bg-gradient-to-r from-blue-50 via-blue-50/50 to-transparent text-blue-600';
    return 'bg-gray-50 text-gray-600';
  };

  const getStartButtonClass = () => {
    if (!isUnlocked) return 'text-gray-400';
    if (isCompleted) return 'text-green-600';
    if (isCurrent) return 'text-blue-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-2">
      {allLevels.map((level) => {
        const isUnlocked = level.Level_number <= playerLevel;
        const isCompleted = level.Level_number < playerLevel;
        const isCurrent = level.Level_number === playerLevel;
        const isJustCompleted = level.Level_number === justCompleted;

        return (
          <Link 
            key={level.Level_Id}
            href={!isUnlocked ? "#" : `/quiz/${level.Level_Id}`}
            className={`block px-3 py-2 rounded-lg transition-all duration-300 hover:bg-gray-50/50 ${getButtonClass()} hover:shadow-md`}
            onClick={(e) => {
              if (!isUnlocked) {
                e.preventDefault();
                alert(`Complete Level ${level.Level_number - 1} first!`);
              }
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${
                  !isUnlocked ? 'bg-gray-100 border border-gray-200' :
                  isCompleted ? 'bg-gradient-to-br from-green-100 to-green-50 border border-green-200 shadow-sm shadow-green-100/50' :
                  'bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200 shadow-sm shadow-blue-100/50'
                } transform transition-transform duration-300 hover:scale-105`}>
                  <span className={`font-bold text-base ${
                    !isUnlocked ? 'text-gray-400' :
                    isCompleted ? 'text-green-600' :
                    'text-blue-600'
                  }`}>
                    {level.Level_number}
                  </span>
                </div>
                <div className={`px-3 py-1.5 rounded-lg transition-all duration-300 ${getLevelNameClass()} ${
                  !isUnlocked ? 'border border-gray-200' :
                  isCompleted ? 'border border-green-200 shadow-sm shadow-green-100/50' :
                  isCurrent ? 'border border-blue-200 shadow-sm shadow-blue-100/50 animate-pulse-subtle' :
                  'border border-gray-200'
                }`}>
                  <span className={`font-bold text-base tracking-tight ${
                    isCurrent ? 'bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent' : ''
                  }`}>
                    {level.Level_Title}
                  </span>
                </div>
              </div>
              <div>
                <span className={`transition-all duration-300 ${getStartButtonClass()}`}>
                  {!isUnlocked ? (
                    <span className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-sm">Complete Level {level.Level_number - 1} first</span>
                  ) : isCompleted ? (
                    <span className="px-3 py-1.5 rounded-lg bg-green-50/30 border border-green-200 text-sm">Completed</span>
                  ) : (
                    <span className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm shadow-sm flex items-center gap-2 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105">
                      Start
                      <svg className="w-4 h-4 transform transition-all duration-300 group-hover:translate-x-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 7l5 5-5 5" />
                      </svg>
                    </span>
                  )}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
} 