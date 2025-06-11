import React from 'react';

interface QuizRewardsProps {
  totalQuestions: number;
  mistakes: number;
}

const QuizRewards: React.FC<QuizRewardsProps> = ({ totalQuestions, mistakes }) => {
  const correctAnswers = totalQuestions - mistakes;
  const percentage = (correctAnswers / totalQuestions) * 100;
  
  // Calculate trophies
  let trophies = 0;
  if (percentage >= 33) trophies = 1;
  if (percentage >= 60) trophies = 2;
  if (percentage >= 90) {
    trophies = 3;
    if (mistakes < 3) trophies = 4;
  }
  if (mistakes === 0) trophies = 5;
  
  // Trophy emoji
  const trophyEmoji = '🏆';
  
  return (
    <div className="mt-6 text-center">
      <h3 className="text-xl font-bold mb-3">Your Rewards</h3>
      
      <div className="text-4xl mb-4">
        {Array(trophies).fill(trophyEmoji).join(' ')}
      </div>
      
      <div className="text-lg">
        <p className="mb-2">Correct answers: {correctAnswers}/{totalQuestions} ({percentage.toFixed(1)}%)</p>
        <p className="mb-2">Trophies earned: {trophies}</p>
        
        {mistakes === 0 && (
          <p className="text-green-600 font-bold mt-4">
            Well done! You got everything correct on the first try!
          </p>
        )}
      </div>
    </div>
  );
};

export default QuizRewards; 