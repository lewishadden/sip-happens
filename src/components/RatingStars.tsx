interface RatingStarsProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  showNumber?: boolean;
}

export default function RatingStars({ rating, size = "md", showNumber = true }: RatingStarsProps) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.3;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  const sizeClass = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
  }[size];

  return (
    <div className="flex items-center gap-1.5">
      <div className={`flex ${sizeClass}`}>
        {Array.from({ length: fullStars }).map((_, i) => (
          <span key={`full-${i}`} className="text-caramel">&#9733;</span>
        ))}
        {hasHalf && <span className="text-caramel opacity-60">&#9733;</span>}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <span key={`empty-${i}`} className="text-espresso-300">&#9733;</span>
        ))}
      </div>
      {showNumber && (
        <span className="text-sm font-semibold text-espresso-600">{rating.toFixed(1)}</span>
      )}
    </div>
  );
}
