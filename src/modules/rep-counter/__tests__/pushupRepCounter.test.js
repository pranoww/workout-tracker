import { RepCounterEngine } from '../engines/RepCounterEngine';
import { MOVEMENT_STATES } from '../constants/repCounter';
import { pushupConfig } from '../exercises/pushup';

describe('RepCounterEngine (pushup)', () => {
  let engine;
  let onRepCompleted;
  
  const mockConfig = {
    ...pushupConfig,
    stateTransitionStabilityMs: 0, 
  };

  beforeEach(() => {
    onRepCompleted = vi.fn();
    engine = new RepCounterEngine(mockConfig, onRepCompleted);
  });

  const createPoseAtAngle = (angle, timestamp) => {
    const rad = (180 - angle) * (Math.PI / 180);
    const wristY = 1 + Math.cos(rad);
    const wristX = Math.sin(rad);

    return {
      detected: true,
      confidence: 0.9,
      timestamp,
      landmarks: [
        { id: 'left_shoulder', x: 0, y: 0, visibility: 0.9 },
        { id: 'left_elbow', x: 0, y: 1, visibility: 0.9 },
        { id: 'left_wrist', x: wristX, y: wristY, visibility: 0.9 },
        { id: 'right_shoulder', x: 0, y: 0, visibility: 0.9 },
        { id: 'right_elbow', x: 0, y: 1, visibility: 0.9 },
        { id: 'right_wrist', x: wristX, y: wristY, visibility: 0.9 }
      ]
    };
  };

  it('starts in IDLE state', () => {
    expect(engine.getSnapshot().state).toBe(MOVEMENT_STATES.IDLE);
    expect(engine.getSnapshot().reps).toBe(0);
  });

  it('counts a complete rep successfully', () => {
    engine.processFrame(createPoseAtAngle(160, 1000)); // STANDING (Plank)
    engine.processFrame(createPoseAtAngle(120, 1200)); // DESCENDING
    engine.processFrame(createPoseAtAngle(80, 1500)); // BOTTOM
    engine.processFrame(createPoseAtAngle(120, 1800)); // ASCENDING
    engine.processFrame(createPoseAtAngle(160, 2000)); // STANDING -> REP

    expect(engine.getSnapshot().reps).toBe(1);
    expect(engine.getSnapshot().state).toBe(MOVEMENT_STATES.STANDING);
    expect(onRepCompleted).toHaveBeenCalledTimes(1);
  });

  it('rejects partial pushup (does not reach bottom threshold)', () => {
    engine.processFrame(createPoseAtAngle(160, 1000)); // STANDING
    engine.processFrame(createPoseAtAngle(120, 1200)); // DESCENDING
    engine.processFrame(createPoseAtAngle(100, 1500)); // Stopped halfway (bottom is 90)
    engine.processFrame(createPoseAtAngle(160, 2000)); // STANDING

    expect(engine.getSnapshot().reps).toBe(0);
    expect(onRepCompleted).not.toHaveBeenCalled();
  });

  it('handles single arm visibility gracefully', () => {
    engine.processFrame(createPoseAtAngle(160, 1000)); 
    
    // Create pose with right arm invisible
    const halfPose = createPoseAtAngle(120, 1200);
    halfPose.landmarks.find(l => l.id === 'right_wrist').visibility = 0.1;
    engine.processFrame(halfPose); // Still counts as DESCENDING because left is valid

    expect(engine.getSnapshot().state).toBe(MOVEMENT_STATES.DESCENDING);
  });
});
