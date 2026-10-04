import { calculateSymmetry } from '../utils/symmetry';

describe('calculateSymmetry', () => {
  it('returns 0 for perfect symmetry', () => {
    expect(calculateSymmetry(50, 50, 100)).toBe(0);
  });

  it('calculates ratio correctly', () => {
    expect(calculateSymmetry(60, 40, 100)).toBeCloseTo(0.2);
  });

  it('handles invalid inputs', () => {
    expect(calculateSymmetry(null, 50, 100)).toBeNull();
    expect(calculateSymmetry(50, 50, 0)).toBeNull(); // divide by zero
  });
});
