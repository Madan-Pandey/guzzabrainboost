'use client';

type ProgressBarProps = {
  percentage: number;
};

export default function ProgressBar({ percentage }: ProgressBarProps) {
  const clampedPercentage = Math.min(100, Math.max(0, percentage));
  
  return (
    <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      {/* Background bar */}
      <div className="absolute inset-0 bg-blue-100/30"></div>
      
      {/* Progress bar */}
      <div
        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-700 ease-out progress-bar-animate"
        style={{ width: `${clampedPercentage}%` }}
      >
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine"></div>
      </div>
    </div>
  );
} 