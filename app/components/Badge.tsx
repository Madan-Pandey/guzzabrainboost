'use client';

import { Badge as BadgeType, BadgeTier } from '@/types/types';
import { useState } from 'react';

const TIER_COLORS = {
  BRONZE: 'from-amber-700 via-amber-600 to-amber-500',
  SILVER: 'from-gray-500 via-gray-400 to-gray-300',
  GOLD: 'from-yellow-600 via-yellow-500 to-yellow-400',
  PLATINUM: 'from-cyan-500 via-cyan-400 to-cyan-300',
  DIAMOND: 'from-blue-600 via-blue-500 to-blue-400',
  NO_BADGE: 'from-gray-300 to-gray-200'
};

const TIER_BORDERS = {
  BRONZE: 'border-amber-400',
  SILVER: 'border-gray-200',
  GOLD: 'border-yellow-300',
  PLATINUM: 'border-cyan-200',
  DIAMOND: 'border-blue-300',
  NO_BADGE: 'border-gray-200'
};

const TIER_SHADOWS = {
  BRONZE: 'shadow-amber-500/50',
  SILVER: 'shadow-gray-400/50',
  GOLD: 'shadow-yellow-500/50',
  PLATINUM: 'shadow-cyan-400/50',
  DIAMOND: 'shadow-blue-500/50',
  NO_BADGE: 'shadow-gray-300/50'
};

const TIER_BADGES = {
  BRONZE: '⭐',
  SILVER: '⭐⭐',
  GOLD: '⭐⭐⭐',
  PLATINUM: '⭐⭐⭐⭐',
  DIAMOND: '💎',
  NO_BADGE: '🔒'
};

interface BadgeProps {
  badge: BadgeType;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
}

export default function Badge({ badge, size = 'md', showProgress = true }: BadgeProps) {
  const [showDetails, setShowDetails] = useState(false);

  const sizeClasses = {
    sm: 'w-12 h-12 text-sm',
    md: 'w-16 h-16 text-base',
    lg: 'w-20 h-20 text-lg'
  };

  const getTierColor = (tier: BadgeTier) => {
    switch (tier) {
      case 'BRONZE': return 'text-amber-700';
      case 'SILVER': return 'text-gray-600';
      case 'GOLD': return 'text-yellow-600';
      case 'PLATINUM': return 'text-cyan-600';
      case 'DIAMOND': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="relative group">
      <div 
        className={`relative ${sizeClasses[size]} rounded-full cursor-pointer
          bg-gradient-to-br ${TIER_COLORS[badge.tier]}
          border-2 ${TIER_BORDERS[badge.tier]}
          flex items-center justify-center
          transform transition-all duration-300
          hover:scale-110 shadow-lg ${TIER_SHADOWS[badge.tier]}
          hover:shadow-xl hover:brightness-110`}
        onClick={() => setShowDetails(!showDetails)}
      >
        <span className="text-2xl filter drop-shadow-md">{TIER_BADGES[badge.tier]}</span>
      </div>

      {/* Badge Progress */}
      {showProgress && badge.progress !== undefined && badge.total !== undefined && (
        <div className="mt-2">
          <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden shadow-inner">
            <div 
              className={`h-full bg-gradient-to-r ${TIER_COLORS[badge.tier]} transition-all duration-500 ease-out`}
              style={{ width: `${(badge.progress / badge.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Badge Details Popup */}
      {showDetails && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200/50 p-3 z-10">
          <div className="text-center">
            <p className="font-bold text-gray-800">{badge.name}</p>
            <p className={`text-sm font-semibold mt-1 ${getTierColor(badge.tier)}`}>
              {badge.tier} {TIER_BADGES[badge.tier]}
            </p>
            <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
            {badge.progress !== undefined && badge.total !== undefined && (
              <p className="text-xs font-medium text-gray-600 mt-2">
                Progress: {badge.progress}/{badge.total}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 