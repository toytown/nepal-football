import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProgressBar, { computePct } from '../ProgressBar';

describe('ProgressBar', () => {
  it('returns 0% when total is 0 (no division by zero)', () => {
    expect(computePct(0, 0)).toBe(0);
  });

  it('clamps percentages into [0, 100]', () => {
    expect(computePct(0, 10)).toBe(0);
    expect(computePct(5, 10)).toBe(50);
    expect(computePct(10, 10)).toBe(100);
    expect(computePct(20, 10)).toBe(100);
  });

  it('renders integer percentage and remaining count', () => {
    render(<ProgressBar label="Tasks" done={3} total={10} />);
    expect(screen.getByText('30%')).toBeInTheDocument();
    expect(screen.getByText('3 completed')).toBeInTheDocument();
    expect(screen.getByText('7 remaining')).toBeInTheDocument();
  });
});
