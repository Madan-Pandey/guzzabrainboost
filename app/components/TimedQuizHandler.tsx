import React, { useState, useEffect } from 'react';
import QuestionTimer from './QuestionTimer';

interface TimedQuizHandlerProps {
  isQuestionActive: boolean; // Is the current question active
  onTimeUp: (moveToNext: boolean) => void; // Callback for when time is up
  updateScore: (points: number) => void; // Callback to update the score
  children: React.ReactNode; // Child components (your existing quiz UI)
}

const TimedQuizHandler: React.FC<TimedQuizHandlerProps> = ({
  isQuestionActive,
  onTimeUp,
  updateScore,
  children
}) => {
  const handleTimeUp = (extendTime: boolean) => {
    if (extendTime) {
      // Deduct 20 points for time extension
      updateScore(-20);
    } else {
      // Move to next question without answering
      onTimeUp(true);
    }
  };

  return (
    <div className="relative">
      <QuestionTimer 
        onTimeUp={handleTimeUp}
        isActive={isQuestionActive}
      />
      {children}
    </div>
  );
};

export default TimedQuizHandler;