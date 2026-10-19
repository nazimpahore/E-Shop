import React from 'react';
import { Star } from 'lucide-react';

export default function RatingStars({ rating = 0, count = null, size = 'sm', showNumber = true }) {
  const stars = [1, 2, 3, 4, 5];
  const starSize = size === 'lg' ? 'w-4 h-4' : size === 'xs' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  return (
    <div className="flex items-center gap-1.5" aria-label={`Rating: ${rating} out of 5 stars`}>
      <div className="flex items-center text-amber-500">
        {stars.map((star) => {
          const isFilled = rating >= star;
          const isHalf = !isFilled && rating >= star - 0.5;

          return (
            <Star
              key={star}
              className={`${starSize} ${
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : isHalf
                  ? 'fill-amber-400/50 text-amber-400'
                  : 'text-slate-300'
              }`}
            />
          );
        })}
      </div>
      {showNumber && (
        <span className="text-xs font-semibold text-slate-700">
          {rating.toFixed(1)}
        </span>
      )}
      {count !== null && (
        <span className="text-xs text-slate-500">
          ({count})
        </span>
      )}
    </div>
  );
}
