import { calculateAngle } from '../utils/angle';

describe('calculateAngle', () => {
  it('calculates 90 degree angle correctly', () => {
    const a = { x: 0, y: 1 };
    const b = { x: 0, y: 0 };
    const c = { x: 1, y: 0 };
    const angle = calculateAngle(a, b, c);
    expect(angle).toBeCloseTo(90);
  });

  it('calculates 180 degree angle correctly', () => {
    const a = { x: -1, y: 0 };
    const b = { x: 0, y: 0 };
    const c = { x: 1, y: 0 };
    const angle = calculateAngle(a, b, c);
    expect(angle).toBeCloseTo(180);
  });

  it('calculates 45 degree angle correctly', () => {
    const a = { x: 0, y: 1 };
    const b = { x: 0, y: 0 };
    const c = { x: 1, y: 1 };
    const angle = calculateAngle(a, b, c);
    expect(angle).toBeCloseTo(45);
  });

  it('handles zero-length vector safely (returns null)', () => {
    const a = { x: 0, y: 0 };
    const b = { x: 0, y: 0 }; // A and B are same point
    const c = { x: 1, y: 0 };
    const angle = calculateAngle(a, b, c);
    expect(angle).toBeNull();
  });

  it('handles missing points safely (returns null)', () => {
    const a = { x: 0, y: 1 };
    const c = { x: 1, y: 0 };
    expect(calculateAngle(a, null, c)).toBeNull();
    expect(calculateAngle(a, undefined, c)).toBeNull();
  });

  it('handles missing coordinates safely (returns null)', () => {
    const a = { x: 0 };
    const b = { x: 0, y: 0 };
    const c = { x: 1, y: 0 };
    expect(calculateAngle(a, b, c)).toBeNull();
  });
});
