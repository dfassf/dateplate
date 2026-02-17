import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { StarRatingDisplay, StarRatingInput } from './StarRating';

afterEach(() => {
  cleanup();
});

describe('StarRatingDisplay', () => {
  it('renders stars and score label', () => {
    render(<StarRatingDisplay rating={3} />);

    expect(screen.getByText('★★★☆☆')).toBeTruthy();
    expect(screen.getByText('3점')).toBeTruthy();
  });

  it('hides score label when showNumber is false', () => {
    render(<StarRatingDisplay rating={4} showNumber={false} />);

    expect(screen.getByText('★★★★☆')).toBeTruthy();
    expect(screen.queryByText('4점')).toBeNull();
  });
});

describe('StarRatingInput', () => {
  it('calls onChange with clicked star value', () => {
    const onChange = vi.fn();
    render(<StarRatingInput value={2} onChange={onChange} />);

    fireEvent.click(screen.getAllByRole('button')[3]);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(4);
  });
});
