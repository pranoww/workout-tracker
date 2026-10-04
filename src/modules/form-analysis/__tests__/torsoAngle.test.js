import { calculateTorsoAngle } from '../utils/torsoAngle';

describe('calculateTorsoAngle', () => {
  it('calculates perfectly vertical torso (0 degrees)', () => {
    const leftShoulder = { x: -0.5, y: 0 };
    const rightShoulder = { x: 0.5, y: 0 };
    // Shoulder center = (0, 0)
    const leftHip = { x: -0.5, y: 1 };
    const rightHip = { x: 0.5, y: 1 };
    // Hip center = (0, 1)

    const angle = calculateTorsoAngle(leftShoulder, rightShoulder, leftHip, rightHip);
    expect(angle).toBeCloseTo(0);
  });

  it('calculates 45 degree lean', () => {
    // Shoulder center = (1, 0)
    const leftShoulder = { x: 0.5, y: 0 };
    const rightShoulder = { x: 1.5, y: 0 };
    
    // Hip center = (0, 1)
    const leftHip = { x: -0.5, y: 1 };
    const rightHip = { x: 0.5, y: 1 };

    const angle = calculateTorsoAngle(leftShoulder, rightShoulder, leftHip, rightHip);
    expect(angle).toBeCloseTo(45);
  });

  it('handles missing points', () => {
    expect(calculateTorsoAngle(null, {}, {}, {})).toBeNull();
  });
});
