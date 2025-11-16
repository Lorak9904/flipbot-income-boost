/**
 * CreditsProgressBar Component
 * Visual progress indicator for credit usage
 */
import { getCreditsHealthStatus } from '@/lib/api/credits';

interface CreditsProgressBarProps {
  used: number;
  limit: number | null;
  bonusCredits?: number;
}

export function CreditsProgressBar({ used, limit, bonusCredits = 0 }: CreditsProgressBarProps) {
  // Unlimited plans
  if (limit === null) {
    return (
      <div className="relative h-3 bg-neutral-800/50 rounded-full overflow-hidden border border-purple-500/30">
        <div 
          className="absolute inset-0 bg-gradient-to-r from-purple-500 to-fuchsia-500 animate-pulse"
          style={{ opacity: 0.5 }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-white drop-shadow-md">∞</span>
        </div>
      </div>
    );
  }
  
  const remaining = limit - used + bonusCredits;
  const healthStatus = getCreditsHealthStatus(remaining, limit);
  const percentage = Math.min(((limit - used) / limit) * 100, 100);
  
  const gradients = {
    healthy: 'from-cyan-500 to-cyan-600',
    warning: 'from-yellow-500 to-orange-500',
    critical: 'from-red-500 to-red-600',
    unlimited: 'from-purple-500 to-fuchsia-500',
  };
  
  const borderColors = {
    healthy: 'border-cyan-500/30',
    warning: 'border-yellow-500/30',
    critical: 'border-red-500/30',
    unlimited: 'border-purple-500/30',
  };
  
  return (
    <div className="space-y-1.5">
      {/* Progress bar */}
      <div 
        className={`
          relative h-3 bg-neutral-800/50 rounded-full overflow-hidden border
          ${borderColors[healthStatus]}
        `}
      >
        <div
          className={`
            h-full bg-gradient-to-r transition-all duration-500 ease-out
            ${gradients[healthStatus]}
          `}
          style={{ width: `${percentage}%` }}
        />
        
        {/* Subtle shimmer effect */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"
          style={{ 
            animation: 'shimmer 2s infinite',
            backgroundSize: '200% 100%',
          }}
        />
      </div>
      
      {/* Numbers */}
      <div className="flex justify-between items-center text-xs">
        <span className="text-neutral-400">
          {used} used
        </span>
        <span className={`font-semibold ${
          healthStatus === 'critical' ? 'text-red-400' :
          healthStatus === 'warning' ? 'text-yellow-400' :
          'text-cyan-400'
        }`}>
          {remaining} / {limit} remaining
        </span>
      </div>
    </div>
  );
}

// Add shimmer animation to global CSS if not exists
const style = document.createElement('style');
style.textContent = `
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
`;
if (!document.querySelector('#shimmer-animation')) {
  style.id = 'shimmer-animation';
  document.head.appendChild(style);
}
