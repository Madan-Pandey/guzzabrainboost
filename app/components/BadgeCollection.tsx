'use client';

import { UserBadges } from '@/types/types';
import Badge from './Badge';

interface BadgeCollectionProps {
  badges: UserBadges;
  showProgress?: boolean;
}

export default function BadgeCollection({ badges, showProgress = true }: BadgeCollectionProps) {
  return (
    <div className="p-4 bg-white rounded-xl shadow-sm">
      <h2 className="text-xl font-bold text-gray-800 mb-4">My Badges</h2>
      
      <div className="space-y-6">
        {/* Active Badges Row */}
        <div className="flex items-center justify-center gap-4">
          {Object.values(badges)
            .filter(badge => badge.tier !== 'NO_BADGE')
            .slice(0, 3)
            .map((badge, index) => (
              <Badge 
                key={`${badge.type}-${index}`}
                badge={badge}
                size="lg"
                showProgress={showProgress}
              />
            ))}
        </div>

        {/* All Badges Grid */}
        <div className="grid grid-cols-5 gap-4">
          {Object.values(badges).map((badge, index) => (
            <div key={`${badge.type}-${index}`} className="flex flex-col items-center">
              <Badge 
                badge={badge}
                size="sm"
                showProgress={showProgress}
              />
              <span className="text-xs text-gray-600 mt-2">{badge.name}</span>
            </div>
          ))}
        </div>

        {/* Badge Progress Summary */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Badge Progress</h3>
          <div className="space-y-2">
            {Object.values(badges).map((badge, index) => (
              badge.progress !== undefined && badge.total !== undefined && (
                <div key={`progress-${index}`} className="flex items-center">
                  <span className="text-xs text-gray-600 w-24">{badge.name}</span>
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden ml-2">
                    <div 
                      className={`h-full bg-gradient-to-r ${
                        badge.tier === 'DIAMOND' ? 'from-blue-400 to-blue-300' :
                        badge.tier === 'PLATINUM' ? 'from-slate-400 to-slate-300' :
                        badge.tier === 'GOLD' ? 'from-yellow-500 to-yellow-400' :
                        badge.tier === 'SILVER' ? 'from-gray-400 to-gray-300' :
                        badge.tier === 'BRONZE' ? 'from-amber-600 to-amber-500' :
                        'from-gray-300 to-gray-200'
                      }`}
                      style={{ width: `${(badge.progress / badge.total) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 ml-2">
                    {badge.progress}/{badge.total}
                  </span>
                </div>
              )
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 