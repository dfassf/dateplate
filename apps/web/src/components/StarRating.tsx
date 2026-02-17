interface StarRatingInputProps {
  value: number;
  onChange: (rating: number) => void;
}

export function StarRatingInput({ value, onChange }: StarRatingInputProps) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="text-3xl transition-colors"
          style={{ color: n <= value ? '#facc15' : '#d1d5db' }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

interface StarRatingDisplayProps {
  rating: number;
  showNumber?: boolean;
}

export function StarRatingDisplay({ rating, showNumber = true }: StarRatingDisplayProps) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="text-yellow-500">
        {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
      </span>
      {showNumber && <span className="text-sm text-gray-400">{rating}점</span>}
    </span>
  );
}
