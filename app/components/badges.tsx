'use client';

import { Badge, BadgeTier } from '@/types/types';
import { FaCrown, FaBolt, FaGem, FaStar, FaMedal } from 'react-icons/fa';

const TIER_BADGES = {
  BRONZE: '🥉',
  SILVER: '🥈',
  GOLD: '🥇',
  PLATINUM: '🏅',
  DIAMOND: '💎',
  NO_BADGE: '🔒'
};

const getBadgeStyle = (tier: BadgeTier) => {
  switch (tier) {
    case 'DIAMOND':
      return {
        background: 'bg-gradient-to-br from-blue-400 via-purple-400 to-blue-500',
        border: 'border-blue-300',
        glow: 'shadow-[0_0_15px_rgba(59,130,246,0.5)]',
        text: 'text-blue-100'
      };
    case 'PLATINUM':
      return {
        background: 'bg-gradient-to-br from-slate-300 via-slate-100 to-slate-400',
        border: 'border-slate-200',
        glow: 'shadow-[0_0_12px_rgba(148,163,184,0.5)]',
        text: 'text-slate-100'
      };
    case 'GOLD':
      return {
        background: 'bg-gradient-to-br from-yellow-400 via-amber-400 to-yellow-500',
        border: 'border-yellow-300',
        glow: 'shadow-[0_0_12px_rgba(245,158,11,0.5)]',
        text: 'text-yellow-100'
      };
    case 'SILVER':
      return {
        background: 'bg-gradient-to-br from-gray-300 via-gray-200 to-gray-400',
        border: 'border-gray-200',
        glow: 'shadow-[0_0_10px_rgba(156,163,175,0.4)]',
        text: 'text-gray-100'
      };
    case 'BRONZE':
      return {
        background: 'bg-gradient-to-br from-amber-700 via-amber-600 to-amber-800',
        border: 'border-amber-600',
        glow: 'shadow-[0_0_8px_rgba(180,83,9,0.4)]',
        text: 'text-amber-100'
      };
    default:
      return {
        background: 'bg-gradient-to-br from-gray-400 via-gray-300 to-gray-500',
        border: 'border-gray-400',
        glow: 'shadow-[0_0_8px_rgba(156,163,175,0.2)]',
        text: 'text-gray-200'
      };
  }
};

const getBadgeInfo = (type: Badge['type'], tier: BadgeTier) => {
  const info = {
    SCORE: {
      title: 'Score Master',
      description: 'Total points earned across all quizzes',
      requirements: {
        DIAMOND: '1000+ points - Elite Scorer',
        PLATINUM: '750+ points - Master Scorer',
        GOLD: '500+ points - Expert Scorer',
        SILVER: '250+ points - Advanced Scorer',
        BRONZE: '100+ points - Novice Scorer',
        NO_BADGE: 'Keep playing to earn points'
      }
    },
    STREAK: {
      title: 'Streak Champion',
      description: 'Consecutive days of quiz completion',
      requirements: {
        DIAMOND: '30+ day streak - Unstoppable',
        PLATINUM: '20+ day streak - Dedicated',
        GOLD: '14+ day streak - Consistent',
        SILVER: '7+ day streak - Regular',
        BRONZE: '3+ day streak - Beginner',
        NO_BADGE: 'Login daily to build your streak'
      }
    },
    PERFECT: {
      title: 'Perfect Score',
      description: 'Perfect scores achieved',
      requirements: {
        DIAMOND: '20+ perfect scores - Perfection Master',
        PLATINUM: '15+ perfect scores - Excellence',
        GOLD: '10+ perfect scores - Outstanding',
        SILVER: '5+ perfect scores - Skilled',
        BRONZE: '1+ perfect score - Rising Star',
        NO_BADGE: 'Get 100% on quizzes to earn this badge'
      }
    },
    PROGRESS: {
      title: 'Quiz Progress',
      description: 'Quiz levels completed',
      requirements: {
        DIAMOND: '100% completion - Completionist',
        PLATINUM: '80% completion - Expert',
        GOLD: '60% completion - Advanced',
        SILVER: '40% completion - Intermediate',
        BRONZE: '20% completion - Beginner',
        NO_BADGE: 'Complete more quiz levels'
      }
    },
    SECTION: {
      title: 'Section Master',
      description: 'Quiz sections mastered',
      requirements: {
        DIAMOND: 'All sections - Grand Master',
        PLATINUM: '80% sections - Elite',
        GOLD: '60% sections - Expert',
        SILVER: '40% sections - Skilled',
        BRONZE: '20% sections - Novice',
        NO_BADGE: 'Master quiz sections to earn this badge'
      }
    }
  };

  return info[type];
};

const BadgeIcon = ({ type }: { type: Badge['type'] }) => {
  switch (type) {
    case 'SCORE':
      return <FaCrown className="text-2xl" />;
    case 'STREAK':
      return <FaBolt className="text-2xl" />;
    case 'PERFECT':
      return <FaGem className="text-2xl" />;
    case 'PROGRESS':
      return <FaStar className="text-2xl" />;
    case 'SECTION':
      return <FaMedal className="text-2xl" />;
  }
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

const BadgeCard = ({ badge }: { badge: Badge }) => {
  const style = getBadgeStyle(badge.tier);
  const info = getBadgeInfo(badge.type, badge.tier);
  const isLocked = badge.tier === 'NO_BADGE';

  return (
    <div className="relative group">
      {/* Badge */}
      <div className={`
        w-24 h-24 rounded-lg flex items-center justify-center
        ${style.background} overflow-hidden
        border-2 ${style.border}
        ${isLocked ? 'opacity-75 hover:opacity-100' : 'transform group-hover:scale-110'}
        transition-all duration-300 ease-out cursor-pointer relative
      `}>
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
                      translate-x-[-200%] group-hover:translate-x-[200%] 
                      transition-transform duration-1000 ease-in-out"></div>
        
        <div className={`${style.text} ${isLocked ? 'opacity-90' : ''} relative z-10`}>
          <BadgeIcon type={badge.type} />
        </div>
      </div>
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200/50 p-3 z-10
                    opacity-0 group-hover:opacity-100 
                    scale-95 group-hover:scale-100
                    transition-all duration-300 ease-out
                    pointer-events-none">
        <div className="text-center">
          <p className="font-bold text-gray-800">{info.title}</p>
          <p className={`text-sm font-semibold mt-1 ${getTierColor(badge.tier)}`}>
            {badge.tier} {badge.tier !== 'NO_BADGE' && TIER_BADGES[badge.tier]}
          </p>
          <p className="text-xs text-gray-500 mt-1">{info.description}</p>
          {badge.progress !== undefined && badge.total !== undefined && (
            <p className="text-xs font-medium text-gray-600 mt-2">
              Progress: {badge.progress}/{badge.total}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Badges({ badges }: { badges: Badge[] }) {
  return (
    <div className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-100">Your Badges</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8">
        {badges.map((badge, index) => (
          <BadgeCard key={index} badge={badge} />
        ))}
      </div>
    </div>
  );
} 