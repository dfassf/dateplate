import { useEffect, useState } from 'react';
import type { ReviewVisibility } from '@hoesikplate/shared';
import { StarRatingInput } from './StarRating';
import { TagSelector } from './TagSelector';
import { VisibilitySelector } from './VisibilitySelector';

export interface ReviewFormValues {
  rating: number;
  content: string;
  selectedTags: string[];
  visibility: ReviewVisibility;
}

interface ReviewFormProps {
  title: string;
  subtitle?: string;
  error?: string;
  loading: boolean;
  submitLabel: string;
  submittingLabel: string;
  initialValues?: ReviewFormValues;
  onSubmit: (values: ReviewFormValues) => void;
}

const DEFAULT_VALUES: ReviewFormValues = {
  rating: 0,
  content: '',
  selectedTags: [],
  visibility: 'PRIVATE',
};

export function ReviewForm({
  title,
  subtitle,
  error,
  loading,
  submitLabel,
  submittingLabel,
  initialValues,
  onSubmit,
}: ReviewFormProps) {
  const [values, setValues] = useState<ReviewFormValues>(initialValues ?? DEFAULT_VALUES);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (initialValues) {
      setValues(initialValues);
      setValidationError('');
    }
  }, [initialValues]);

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      {subtitle && <p className="text-gray-500 text-sm mb-6">{subtitle}</p>}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (values.rating === 0) {
            setValidationError('별점을 선택해주세요.');
            return;
          }
          setValidationError('');
          onSubmit(values);
        }}
        className="space-y-5"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">별점</label>
          <StarRatingInput
            value={values.rating}
            onChange={(rating) => {
              setValues((prev) => ({ ...prev, rating }));
              setValidationError('');
            }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">후기 (선택)</label>
          <textarea
            placeholder="음식 맛, 분위기, 서비스 등 자유롭게 작성해주세요"
            value={values.content}
            onChange={(event) => {
              const content = event.target.value;
              setValues((prev) => ({ ...prev, content }));
            }}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#3182f6] text-sm resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">태그 (선택)</label>
          <TagSelector
            selectedTags={values.selectedTags}
            onChange={(selectedTags) => {
              setValues((prev) => ({ ...prev, selectedTags }));
            }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">공개 범위</label>
          <VisibilitySelector
            value={values.visibility}
            onChange={(visibility) => {
              setValues((prev) => ({ ...prev, visibility }));
            }}
          />
        </div>

        {(validationError || error) && (
          <p className="text-red-500 text-sm">{validationError || error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-50"
          style={{ backgroundColor: '#3182f6' }}
        >
          {loading ? submittingLabel : submitLabel}
        </button>
      </form>
    </div>
  );
}
