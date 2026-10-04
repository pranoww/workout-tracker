import { FormAnalysisEngine } from '../engines/FormAnalysisEngine';
import { squatFormConfig } from '../exercises/squat';
import { OVERALL_QUALITY, QUALITY_STATUS } from '../constants/formAnalysis';

describe('FormAnalysisEngine (squat)', () => {
  let engine;

  beforeEach(() => {
    engine = new FormAnalysisEngine(squatFormConfig);
    engine.startRep(1);
  });

  const createValidPose = (overrides = {}) => {
    const baseLandmarks = [
      { id: 'left_shoulder', x: 0.4, y: 0.2, visibility: 0.9 },
      { id: 'right_shoulder', x: 0.6, y: 0.2, visibility: 0.9 },
      { id: 'left_hip', x: 0.4, y: 0.5, visibility: 0.9 },
      { id: 'right_hip', x: 0.6, y: 0.5, visibility: 0.9 },
      { id: 'left_knee', x: 0.4, y: 0.7, visibility: 0.9 },
      { id: 'right_knee', x: 0.6, y: 0.7, visibility: 0.9 },
      { id: 'left_ankle', x: 0.4, y: 0.9, visibility: 0.9 },
      { id: 'right_ankle', x: 0.6, y: 0.9, visibility: 0.9 },
    ];

    // Apply overrides
    const landmarks = baseLandmarks.map(lm => ({
      ...lm,
      ...(overrides[lm.id] || {})
    }));

    return {
      detected: true,
      confidence: 0.9,
      timestamp: performance.now(),
      landmarks
    };
  };

  it('handles insufficient data correctly', () => {
    engine.update(createValidPose(), 1000);
    // Only 1 sample, which is < 3 minimum required
    const result = engine.finalizeRep({ repNumber: 1 });
    
    expect(result.quality).toBe(OVERALL_QUALITY.INSUFFICIENT_DATA);
    expect(result.score).toBe(0);
  });

  it('analyzes a good squat', () => {
    // Generate samples going down to parallel
    // Standing
    engine.update(createValidPose(), 1000);
    
    // Mid
    engine.update(createValidPose({
      left_hip: { y: 0.6 }, right_hip: { y: 0.6 },
      left_knee: { y: 0.7 }, right_knee: { y: 0.7 }
    }), 1200);

    // Bottom (parallel) - hip y == knee y
    engine.update(createValidPose({
      left_hip: { y: 0.7 }, right_hip: { y: 0.7 },
      left_knee: { y: 0.7 }, right_knee: { y: 0.7 }
    }), 1500);

    const result = engine.finalizeRep({ repNumber: 1 });

    expect(result.quality).toBe(OVERALL_QUALITY.GOOD);
    expect(result.metrics.depth.status).toBe(QUALITY_STATUS.GOOD);
    expect(result.metrics.kneeAlignment.status).toBe(QUALITY_STATUS.GOOD);
    expect(result.metrics.torso.status).toBe(QUALITY_STATUS.GOOD);
    expect(result.metrics.symmetry.status).toBe(QUALITY_STATUS.GOOD);
    
    // First rep ROM consistency should be GOOD baseline
    expect(result.metrics.romConsistency.status).toBe(QUALITY_STATUS.GOOD);
    expect(result.metrics.romConsistency.value).toBeNull();
  });

  it('detects a shallow squat', () => {
    engine.update(createValidPose(), 1000);
    engine.update(createValidPose(), 1200);
    // Never reach parallel, hip stays way above knee
    engine.update(createValidPose({
      left_hip: { y: 0.5 }, right_hip: { y: 0.5 },
      left_knee: { y: 0.8 }, right_knee: { y: 0.8 }
    }), 1500);

    const result = engine.finalizeRep({ repNumber: 1 });

    // Depth should be POOR
    expect(result.metrics.depth.status).toBe(QUALITY_STATUS.POOR);
  });

  it('detects asymmetric movement', () => {
    engine.update(createValidPose(), 1000);
    engine.update(createValidPose(), 1200);
    // One hip drops lower than the other
    engine.update(createValidPose({
      left_hip: { y: 0.7 }, right_hip: { y: 0.5 },
      left_knee: { y: 0.7 }, right_knee: { y: 0.7 }
    }), 1500);

    const result = engine.finalizeRep({ repNumber: 1 });
    expect(result.metrics.symmetry.status).toBe(QUALITY_STATUS.POOR);
  });

  it('handles low confidence frames gracefully', () => {
    engine.update(createValidPose(), 1000);
    engine.update(createValidPose(), 1200);
    engine.update(createValidPose(), 1500);

    // Frame with low confidence
    const badPose = createValidPose();
    badPose.confidence = 0.2;
    engine.update(badPose, 1600);

    const result = engine.finalizeRep({ repNumber: 1 });
    expect(result.quality).not.toBe(OVERALL_QUALITY.INSUFFICIENT_DATA);
  });
});
