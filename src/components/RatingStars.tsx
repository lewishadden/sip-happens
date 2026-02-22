import { halfStarThreshold, maxStarCount } from '@/lib/constants';

interface RatingStarsProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
}

export default function RatingStars({ rating, size = 'md', showNumber = true }: RatingStarsProps) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= halfStarThreshold;
  const emptyStars = maxStarCount - fullStars - (hasHalf ? 1 : 0);

  const sizeClass = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  }[size];
  const sizeClassHalfStar = {
    sm: 'w-(--text-sm)',
    md: 'w-(--text-lg)',
    lg: 'w-(--text-2xl)',
  }[size];

  return (
    <div className="flex items-center gap-1.5">
      <div className={`flex ${sizeClass}`}>
        {Array.from({ length: fullStars }).map((_, i) => (
          <span key={`full-${i}`} className="text-caramel">
            &#9733;
          </span>
        ))}
        {hasHalf && (
          <div className={`relative ${sizeClassHalfStar}`}>
            <div className="absolute text-light-espresso/40">&#9733;</div>
            <div className="absolute text-caramel [clip-path:inset(0_50%_0_0)]">&#9733;</div>
          </div>
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <span key={`empty-${i}`} className="text-light-espresso/40">
            &#9733;
          </span>
        ))}
      </div>
      {showNumber && (
        <span className="text-sm font-semibold text-light-espresso">{rating.toFixed(1)}</span>
      )}
    </div>
  );
}
