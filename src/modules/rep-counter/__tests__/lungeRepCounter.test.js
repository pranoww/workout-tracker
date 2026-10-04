import { RepCounterEngine } from '../engines/RepCounterEngine';
import { MOVEMENT_STATES } from '../constants/repCounter';
import { lungeConfig } from '../exercises/lunge';

describe('RepCounterEngine (lunge)', () => {
  let engine;
  let onRepCompleted;
  
  const mockConfig = {
    ...lungeConfig,
    stateTransitionStabilityMs: 0, // Set to 0 for easier synchronous testing
  };

  beforeEach(() => {
    onRepCompleted = vi.fn();
    engine = new RepCounterEngine(mockConfig, onRepCompleted);
  });

  const createPoseAtAngle = (angle, timestamp, leg = 'both') => {
    const rad = (180 - angle) * (Math.PI / 180);
    const ankleY = 1 + Math.cos(rad);
    const ankleX = Math.sin(rad);

    const lAnkle = leg === 'both' || leg === 'left' ? { x: ankleX, y: ankleY } : { x: 0, y: 2 };
    const rAnkle = leg === 'both' || leg === 'right' ? { x: ankleX, y: ankleY } : { x: 0, y: 2 };

    return {
      detected: true,
      confidence: 0.9,
      timestamp,
      landmarks: [
        { id: 'left_hip', x: 0, y: 0, visibility: 0.9 },
        { id: 'left_knee', x: 0, y: 1, visibility: 0.9 },
        { id: 'left_ankle', x: lAnkle.x, y: lAnkle.y, visibility: 0.9 },
        { id: 'right_hip', x: 0, y: 0, visibility: 0.9 },
        { id: 'right_knee', x: 0, y: 1, visibility: 0.9 },
        { id: 'right_ankle', x: rAnkle.x, y: rAnkle.y, visibility: 0.9 }
      ]
    };
  };

  it('starts in IDLE state', () => {
    expect(engine.getSnapshot().state).toBe(MOVEMENT_STATES.IDLE);
    expect(engine.getSnapshot().reps).toBe(0);
  });

  it('counts a complete rep successfully (left leg)', () => {
    engine.processFrame(createPoseAtAngle(160, 1000, 'left')); // STANDING
    engine.processFrame(createPoseAtAngle(120, 1200, 'left')); // DESCENDING
    engine.processFrame(createPoseAtAngle(90, 1500, 'left')); // BOTTOM
    engine.processFrame(createPoseAtAngle(120, 1800, 'left')); // ASCENDING
    engine.processFrame(createPoseAtAngle(160, 2000, 'left')); // STANDING -> REP

    expect(engine.getSnapshot().reps).toBe(1);
    expect(engine.getSnapshot().state).toBe(MOVEMENT_STATES.STANDING);
    expect(onRepCompleted).toHaveBeenCalledTimes(1);
  });

  it('counts a complete rep successfully (right leg)', () => {
    engine.processFrame(createPoseAtAngle(160, 1000, 'right')); // STANDING
    engine.processFrame(createPoseAtAngle(120, 1200, 'right')); // DESCENDING
    engine.processFrame(createPoseAtAngle(90, 1500, 'right')); // BOTTOM
    engine.processFrame(createPoseAtAngle(120, 1800, 'right')); // ASCENDING
    engine.processFrame(createPoseAtAngle(160, 2000, 'right')); // STANDING -> REP

    expect(engine.getSnapshot().reps).toBe(1);
    expect(onRepCompleted).toHaveBeenCalledTimes(1);
  });

  it('rejects partial lunge (does not reach bottom threshold)', () => {
    engine.processFrame(createPoseAtAngle(160, 1000)); // STANDING
    engine.processFrame(createPoseAtAngle(120, 1200)); // DESCENDING
    engine.processFrame(createPoseAtAngle(110, 1500)); // Stopped halfway (bottom is 100)
    engine.processFrame(createPoseAtAngle(160, 2000)); // STANDING

    expect(engine.getSnapshot().reps).toBe(0);
    expect(onRepCompleted).not.toHaveBeenCalled();
  });

  it('rejects fast glitchy rep due to minRepDurationMs policy', () => {
    engine.processFrame(createPoseAtAngle(160, 1000)); // STANDING
    engine.processFrame(createPoseAtAngle(120, 1050)); // DESCENDING
    engine.processFrame(createPoseAtAngle(90, 1100)); // BOTTOM
    engine.processFrame(createPoseAtAngle(160, 1150)); // STANDING (Total 100ms < 600ms)

    expect(engine.getSnapshot().reps).toBe(0);
  });

  it('resets state if landmark loss gap exceeds maxInvalidFrameGapMs', () => {
    engine.processFrame(createPoseAtAngle(160, 1000)); // STANDING
    engine.processFrame(createPoseAtAngle(120, 1200)); // DESCENDING
    
    const lowConfPose = createPoseAtAngle(90, 3000); // 1800ms later (gap > 1000)
    lowConfPose.confidence = 0.2; 
    engine.processFrame(lowConfPose); 
    
    expect(engine.getSnapshot().state).toBe(MOVEMENT_STATES.IDLE);
  });
});
