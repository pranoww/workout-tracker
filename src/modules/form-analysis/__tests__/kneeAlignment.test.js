import { calculateKneeAlignment, calculateReferenceWidth } from '../utils/kneeAlignment';

describe('calculateKneeAlignment', () => {
  it('calculates perfect alignment (0 offset)', () => {
    const hip = { x: 0.5, y: 0.5 };
    const ankle = { x: 0.5, y: 1.0 };
    // Knee is exactly in the middle X
    const knee = { x: 0.5, y: 0.75 };
    const width = 0.4;
    
    expect(calculateKneeAlignment(hip, knee, ankle, width)).toBe(0);
  });

  it('calculates valgus/varus deviation', () => {
    const hip = { x: 0.4, y: 0.5 };
    const ankle = { x: 0.6, y: 1.0 };
    // Expected knee X = 0.5
    const knee = { x: 0.7, y: 0.75 };
    const width = 0.4;
    
    // Deviation = |0.7 - 0.5| = 0.2
    // Ratio = 0.2 / 0.4 = 0.5
    expect(calculateKneeAlignment(hip, knee, ankle, width)).toBeCloseTo(0.5);
  });

  it('returns null on invalid inputs', () => {
    expect(calculateKneeAlignment(null, {}, {}, 1)).toBeNull();
    expect(calculateKneeAlignment({}, {}, {}, 0)).toBeNull(); // zero width
  });
});

describe('calculateReferenceWidth', () => {
  it('calculates width safely', () => {
    expect(calculateReferenceWidth({ x: 0.1 }, { x: 0.5 })).toBeCloseTo(0.4);
  });

  it('returns null for very small width (side view)', () => {
    expect(calculateReferenceWidth({ x: 0.5 }, { x: 0.51 })).toBeNull();
  });
});
