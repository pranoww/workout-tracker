import { FormAnalysisEngine } from '../engines/FormAnalysisEngine';
import { lungeFormConfig } from '../exercises/lunge';
import { QUALITY_STATUS, OVERALL_QUALITY } from '../constants/formAnalysis';

describe('FormAnalysisEngine (lunge)', () => {
  let engine;

  beforeEach(() => {
    engine = new FormAnalysisEngine(lungeFormConfig);
  });

  const createLungePose = (timestamp, overrides = {}) => {
    return {
      detected: true,
      confidence: 0.9,
      timestamp,
      landmarks: [
        { id: 'left_shoulder', x: -0.2, y: 0, visibility: 0.9, ...overrides.lShoulder },
        { id: 'right_shoulder', x: 0.2, y: 0, visibility: 0.9, ...overrides.rShoulder },
        { id: 'left_hip', x: -0.1, y: 0.5, visibility: 0.9, ...overrides.lHip },
        { id: 'right_hip', x: 0.1, y: 0.5, visibility: 0.9, ...overrides.rHip },
        { id: 'left_knee', x: -0.1, y: 1.0, visibility: 0.9, ...overrides.lKnee },
        { id: 'right_knee', x: 0.1, y: 1.0, visibility: 0.9, ...overrides.rKnee },
        { id: 'left_ankle', x: -0.1, y: 1.5, visibility: 0.9, ...overrides.lAnkle },
        { id: 'right_ankle', x: 0.1, y: 1.5, visibility: 0.9, ...overrides.rAnkle }
      ]
    };
  };

  it('handles valid lunge form', () => {
    engine.startRep(1);
    
    // Depth: good (hip.y - knee.y is >= -0.2)
    // lHip: 0.5, lKnee: 0.6 -> depth = 0.5 - 0.6 = -0.1 (>= -0.2 -> GOOD)
    // Torso: upright (hips and shoulders aligned vertically)
    // Knee Alignment: good (hips, knee, ankle aligned horizontally)
    for (let i = 0; i < 5; i++) {
      engine.update(createLungePose(1000 + i * 100, {
        lHip: { y: 0.5 },
        lKnee: { y: 0.6 }
      }));
    }

    const result = engine.finalizeRep({ repNumber: 1 });
    console.log("TEST RESULT:", JSON.stringify(result, null, 2));
    expect(result.quality).toBe(OVERALL_QUALITY.GOOD);
    expect(result.metrics.depth.status).toBe(QUALITY_STATUS.GOOD);
    expect(result.metrics.torso.status).toBe(QUALITY_STATUS.GOOD);
    expect(result.metrics.kneeAlignment.status).toBe(QUALITY_STATUS.GOOD);
    expect(result.metrics.romConsistency.status).toBe(QUALITY_STATUS.GOOD); // Baseline
    expect(result.feedback.length).toBe(4);
  });

  it('detects shallow lunge', () => {
    engine.startRep(1);
    
    // Depth: poor (hip.y - knee.y < -0.4)
    // lHip: 0.5, lKnee: 1.0 -> depth = 0.5 - 1.0 = -0.5
    for (let i = 0; i < 5; i++) {
      engine.update(createLungePose(1000 + i * 100, {
        lHip: { y: 0.5 },
        lKnee: { y: 1.0 }
      }));
    }

    const result = engine.finalizeRep({ repNumber: 1 });
    expect(result.metrics.depth.status).toBe(QUALITY_STATUS.POOR);
    expect(result.feedback).toContain("Lunge was shallow, increase your range of motion");
  });

  it('detects poor knee alignment', () => {
    engine.startRep(1);
    
    // Knee valgus (knee x differs from hip/ankle by large amount)
    // Shoulder width = 0.2
    for (let i = 0; i < 5; i++) {
      engine.update(createLungePose(1000 + i * 100, {
        lShoulder: { x: -0.1 },
        rShoulder: { x: 0.1 },
        lHip: { x: -0.1, y: 0.5 },
        lKnee: { x: 0.2, y: 0.6 }, // Knee deviates significantly
        lAnkle: { x: -0.1, y: 1.0 }
      }));
    }

    const result = engine.finalizeRep({ repNumber: 1 });
    expect(result.metrics.kneeAlignment.status).toBe(QUALITY_STATUS.POOR);
    expect(result.feedback).toContain("Try to prevent your front knee from caving inward");
  });

  it('handles insufficient data', () => {
    engine.startRep(1);
    engine.update(createLungePose(1000));
    // Only 1 sample, needs at least 3
    const result = engine.finalizeRep({ repNumber: 1 });
    
    expect(result.quality).toBe(OVERALL_QUALITY.INSUFFICIENT_DATA);
    expect(result.metrics.depth.status).toBe(QUALITY_STATUS.UNCERTAIN);
    expect(result.feedback).toContain("Unable to analyze form due to poor visibility.");
  });
});
