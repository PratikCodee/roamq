import { Star } from 'lucide-react';

interface RatingProps {
  value: number;
  count?: number;
  size?: 'sm' | 'md';
  showCount?: boolean;
}

export function Rating({ value, count, size = 'sm', showCount = true }: RatingProps) {
  const starSize = size === 'sm' ? 14 : 18;
  const full = Math.floor(value);
  const hasHalf = value - full >= 0.25 && value - full < 0.75;
  const display = hasHalf ? full + 0.5 : Math.round(value);

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {[0, 1, 2, 3, 4].map((i) => {
          const filled = i < display;
          const half = i === full && hasHalf;
          return (
            <Star
              key={i}
              size={starSize}
              className={
                filled
                  ? 'text-sand-400 fill-sand-400'
                  : half
                    ? 'text-sand-400 fill-sand-200'
                    : 'text-navy-200 fill-navy-100'
              }
              strokeWidth={1.5}
            />
          );
        })}
      </div>
      <span className={`font-semibold text-navy-700 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
        {value.toFixed(1)}
      </span>
      {showCount && count !== undefined && (
        <span className={`text-navy-400 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
          ({count.toLocaleString()})
        </span>
      )}
    </div>
  );
}
