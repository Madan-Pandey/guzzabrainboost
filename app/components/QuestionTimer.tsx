import React, { useState, useEffect, useCallback } from 'react';

interface QuestionTimerProps {
  onTimeUp: (extendTime: boolean) => void;
  isActive: boolean;
}

const QuestionTimer: React.FC<QuestionTimerProps> = ({ 
  onTimeUp, 
  isActive = true 
}) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(20);
  const [showExtensionDialog, setShowExtensionDialog] = useState<boolean>(false);
  const [extensionTimeRemaining, setExtensionTimeRemaining] = useState<number>(5);
  const [timerRunning, setTimerRunning] = useState<boolean>(isActive);

  const resetTimer = useCallback(() => {
    setTimeRemaining(20);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timerRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prevTime => prevTime - 1);
      }, 1000);
    } else if (timerRunning && timeRemaining === 0) {
      setTimerRunning(false);
      setShowExtensionDialog(true);
      setExtensionTimeRemaining(5);
      if (interval) clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timerRunning, timeRemaining]);

  useEffect(() => {
    let extensionInterval: NodeJS.Timeout | null = null;
    
    if (showExtensionDialog && extensionTimeRemaining > 0) {
      extensionInterval = setInterval(() => {
        setExtensionTimeRemaining(prevTime => prevTime - 1);
      }, 1000);
    } else if (showExtensionDialog && extensionTimeRemaining === 0) {
      handleContinue();
      if (extensionInterval) clearInterval(extensionInterval);
    }
    
    return () => {
      if (extensionInterval) clearInterval(extensionInterval);
    };
  }, [showExtensionDialog, extensionTimeRemaining]);

  const handleExtend = () => {
    setShowExtensionDialog(false);
    setTimeRemaining(20);
    setTimerRunning(true);
    onTimeUp(true);
  };

  const handleContinue = () => {
    setShowExtensionDialog(false);
    onTimeUp(false);
  };

  const getTimerColorClass = () => {
    if (timeRemaining <= 5) return 'bg-red-100 text-red-800 border-red-200 animate-pulse';
    if (timeRemaining <= 10) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  useEffect(() => {
    if (isActive) {
      resetTimer();
      setTimerRunning(true);
    }
  }, [isActive, resetTimer]);

  return (
    <>
      <div className={`flex items-center justify-center gap-2 md:gap-3 text-base md:text-lg font-semibold px-3 md:px-4 py-1.5 rounded-full border ${getTimerColorClass()} transition-all duration-300 shadow-sm min-w-[140px]`}>
        <span className="text-lg md:text-xl">⏳</span>
        <span className="font-mono">{timeRemaining}</span>
        <span className="font-medium">sec remaining</span>
      </div>
      
      {showExtensionDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-[90%] text-center space-y-4">
            <div className="text-2xl font-bold text-gray-800">
              ⏰ Time's Up!
            </div>
            <p className="text-gray-600 text-lg">
              Would you like to extend your time or continue?
            </p>
            <div className="text-sm text-gray-500 font-medium">
              Auto-continue in {extensionTimeRemaining}s
            </div>
            
            <div className="flex flex-col gap-3 mt-6">
              <button 
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                onClick={handleExtend}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Extend Time (20s -20pts)
              </button>
              
              <button 
                className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                onClick={handleContinue}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
                Continue to Next
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuestionTimer;