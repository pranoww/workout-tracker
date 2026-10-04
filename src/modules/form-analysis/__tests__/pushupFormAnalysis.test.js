import { FormAnalysisEngine } from '../engines/FormAnalysisEngine';
import { pushupFormConfig } from '../exercises/pushup';
import { QUALITY_STATUS, OVERALL_QUALITY } from '../constants/formAnalysis';

describe('FormAnalysisEngine (pushup)', () => {
  let engine;

  beforeEach(() => {
    engine = new FormAnalysisEngine(pushupFormConfig);
  });

  const createPushupPose = (timestamp, overrides = {}) => {
    return {
      detected: true,
      confidence: 0.9,
      timestamp,
      landmarks: [
        { id: 'left_shoulder', x: 0, y: 0.2, visibility: 0.9, ...overrides.lShoulder },
        { id: 'right_shoulder', x: 0, y: 0.2, visibility: 0.9, ...overrides.rShoulder },
        { id: 'left_hip', x: -0.5, y: 0.2, visibility: 0.9, ...overrides.lHip },
        { id: 'right_hip', x: -0.5, y: 0.2, visibility: 0.9, ...overrides.rHip },
        { id: 'left_ankle', x: -1.0, y: 0.2, visibility: 0.9, ...overrides.lAnkle },
        { id: 'right_ankle', x: -1.0, y: 0.2, visibility: 0.9, ...overrides.rAnkle },
        { id: 'left_elbow', x: 0, y: 0.6, visibility: 0.9, ...overrides.lElbow },
        { id: 'right_elbow', x: 0, y: 0.6, visibility: 0.9, ...overrides.rElbow },
        { id: 'left_wrist', x: 0, y: 1.0, visibility: 0.9, ...overrides.lWrist },
        { id: 'right_wrist', x: 0, y: 1.0, visibility: 0.9, ...overrides.rWrist }
      ]
    };
  };

  it('handles valid pushup form', () => {
    engine.startRep(1);
    
    // Body alignment: perfectly straight (y=0.2 for shoulder, hip, ankle) -> 180 degrees -> GOOD
    // Elbow angle: we want it to reach 90 degrees or less (GOOD is <= 95)
    // To make elbow angle 90, we can set wrist to x=0.4, y=0.6 so the vectors are (0, -0.4) and (0.4, 0).
    for (let i = 0; i < 5; i++) {
      engine.update(createPushupPose(1000 + i * 100, {
        lWrist: { x: 0.4, y: 0.6 },
        rWrist: { x: 0.4, y: 0.6 }
      }));
    }

    const result = engine.finalizeRep({ repNumber: 1 });
    expect(result.quality).toBe(OVERALL_QUALITY.GOOD);
    expect(result.metrics.bodyAlignment.status).toBe(QUALITY_STATUS.GOOD);
    expect(result.metrics.elbowAngle.status).toBe(QUALITY_STATUS.GOOD);
    expect(result.metrics.romConsistency.status).toBe(QUALITY_STATUS.GOOD); 
  });

  it('detects sagging hips (poor body alignment)', () => {
    engine.startRep(1);
    
    // Sagging hips: hip.y is lower (y=0.5 instead of 0.2), creating a V shape.
    // Shoulder (0, 0.2), Hip (-0.5, 0.5), Ankle (-1.0, 0.2)
    // This deviates from 180 degrees.
    for (let i = 0; i < 5; i++) {
      engine.update(createPushupPose(1000 + i * 100, {
        lHip: { y: 0.5 },
        rHip: { y: 0.5 },
        lWrist: { x: 0.4, y: 0.6 },
        rWrist: { x: 0.4, y: 0.6 }
      }));
    }

    const result = engine.finalizeRep({ repNumber: 1 });
    expect(result.metrics.bodyAlignment.status).toBe(QUALITY_STATUS.POOR);
    expect(result.feedback).toContain("Avoid letting your hips sag or raising them too high");
  });

  it('detects shallow pushup (poor elbow angle)', () => {
    engine.startRep(1);
    
    // Shallow pushup: elbow angle is > 115 degrees.
    // Keep wrist directly below elbow so angle is 180 (straight arms)
    for (let i = 0; i < 5; i++) {
      engine.update(createPushupPose(1000 + i * 100)); // Default wrist is (0, 1.0), elbow (0, 0.6), shoulder (0, 0.2)
    }

    const result = engine.finalizeRep({ repNumber: 1 });
    expect(result.metrics.elbowAngle.status).toBe(QUALITY_STATUS.POOR);
    expect(result.feedback).toContain("Push-up was shallow, lower your chest further");
  });
});
