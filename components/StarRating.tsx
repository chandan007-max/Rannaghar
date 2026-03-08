import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  totalStars?: number;
  size?: number;
  className?: string;
  onRatingChange?: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, totalStars = 5, size = 16, className = '', onRatingChange }) => {
  const [hoverRating, setHoverRating] = useState<number>(0);

  // If onRatingChange is provided, make the component interactive
  if (onRatingChange) {
    const effectiveRating = hoverRating || rating;
    return (
      <div className={`flex items-center ${className}`} onMouseLeave={() => setHoverRating(0)}>
        {[...Array(totalStars)].map((_, index) => {
          const starValue = index + 1;
          return (
            <button
              type="button"
              key={index}
              className="appearance-none bg-transparent border-none p-0 m-0 cursor-pointer"
              onClick={() => onRatingChange(starValue)}
              onMouseEnter={() => setHoverRating(starValue)}
              aria-label={`Rate ${starValue} stars`}
            >
              <Star
                size={size}
                className={`transition-colors ${starValue <= effectiveRating ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor"
              />
            </button>
          );
        })}
      </div>
    );
  }

  // Original read-only rendering logic
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.25 && rating % 1 < 0.75;
  const roundedUpStars = Math.round(rating);
  const emptyStars = totalStars - roundedUpStars;

  return (
    <div className={`flex items-center ${className}`}>
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} size={size} className="text-yellow-400" fill="currentColor" />
      ))}
      {hasHalfStar && (
        <div key="half" className="relative" style={{ width: size, height: size }}>
          <Star size={size} className="text-gray-300 absolute" fill="currentColor" />
          <div className="absolute top-0 left-0 h-full w-1/2 overflow-hidden">
            <Star size={size} className="text-yellow-400" fill="currentColor" />
          </div>
        </div>
      )}
      {!hasHalfStar && roundedUpStars > fullStars && (
         <Star key={`round-up`} size={size} className="text-yellow-400" fill="currentColor" />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} size={size} className="text-gray-300" fill="currentColor" />
      ))}
    </div>
  );
};

export default StarRating;