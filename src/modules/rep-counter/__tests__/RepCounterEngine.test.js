import { RepCounterEngine } from '../engines/RepCounterEngine';
import { MOVEMENT_STATES } from '../constants/repCounter';

describe('RepCounterEngine (squat)', () => {
  let engine;
  let onRepCompleted;
  
  const mockConfig = {
    name: "squat",
    primaryMetric: "knee_angle",
    standingThreshold: 150,
    bottomThreshold: 90,
    startDescendingThreshold: 140,
    startAscendingThreshold: 100,
    minMovementRange: 40,
    minRepDurationMs: 600, 
    maxInvalidFrameGapMs: 1000, 
    stateTransitionStabilityMs: 0, // Set to 0 for easier synchronous testing
    requiredLandmarks: [
      'left_hip', 'left_knee', 'left_ankle',
      'right_hip', 'right_knee', 'right_ankle'
    ]
  };

  beforeEach(() => {
    onRepCompleted = vi.fn();
    engine = new RepCounterEngine(mockConfig, onRepCompleted);
  });

  // Helper to simulate a frame with a specific angle (straight line vertical)
  const createPoseAtAngle = (angle, timestamp) => {
    // 180 degrees -> points are collinear.
    // To simulate a knee angle, we can fake the coordinates.
    // Hip = (0, 0), Knee = (0, 1)
    // Ankle needs to be calculated to create the desired angle.
    // If angle = 180, ankle is (0, 2)
    // If angle = 90, ankle is (1, 1)
    
    // Easier way: just fake a triangle
    const rad = (180 - angle) * (Math.PI / 180);
    const ankleY = 1 + Math.cos(rad);
    const ankleX = Math.sin(rad);

    return {
      detected: true,
      confidence: 0.9,
      timestamp,
      landmarks: [
        { id: 'left_hip', x: 0, y: 0, visibility: 0.9 },
        { id: 'left_knee', x: 0, y: 1, visibility: 0.9 },
        { id: 'left_ankle', x: ankleX, y: ankleY, visibility: 0.9 },
        { id: 'right_hip', x: 0, y: 0, visibility: 0.9 },
        { id: 'right_knee', x: 0, y: 1, visibility: 0.9 },
        { id: 'right_ankle', x: ankleX, y: ankleY, visibility: 0.9 }
      ]
    };
  };

  it('starts in IDLE state', () => {
    expect(engine.getSnapshot().state).toBe(MOVEMENT_STATES.IDLE);
    expect(engine.getSnapshot().reps).toBe(0);
  });

  it('transitions to STANDING when valid standing pose is passed', () => {
    engine.processFrame(createPoseAtAngle(160, 1000));
    expect(engine.getSnapshot().state).toBe(MOVEMENT_STATES.STANDING);
  });

  it('transitions to DESCENDING and BOTTOM properly', () => {
    engine.processFrame(createPoseAtAngle(160, 1000)); // STANDING
    engine.processFrame(createPoseAtAngle(130, 1100)); // DESCENDING
    expect(engine.getSnapshot().state).toBe(MOVEMENT_STATES.DESCENDING);

    engine.processFrame(createPoseAtAngle(80, 1500)); // BOTTOM
    expect(engine.getSnapshot().state).toBe(MOVEMENT_STATES.BOTTOM);
  });

  it('counts a complete rep successfully', () => {
    engine.processFrame(createPoseAtAngle(160, 1000)); // STANDING
    engine.processFrame(createPoseAtAngle(130, 1200)); // DESCENDING
    engine.processFrame(createPoseAtAngle(80, 1500)); // BOTTOM
    engine.processFrame(createPoseAtAngle(120, 1800)); // ASCENDING
    engine.processFrame(createPoseAtAngle(160, 2000)); // STANDING -> REP

    expect(engine.getSnapshot().reps).toBe(1);
    expect(engine.getSnapshot().state).toBe(MOVEMENT_STATES.STANDING);
    expect(onRepCompleted).toHaveBeenCalledTimes(1);
    expect(onRepCompleted).toHaveBeenCalledWith(expect.objectContaining({
      repNumber: 1,
      durationMs: 800 // 2000 - 1200
    }));
  });

  it('rejects partial squat (does not reach bottom threshold)', () => {
    engine.processFrame(createPoseAtAngle(160, 1000)); // STANDING
    engine.processFrame(createPoseAtAngle(130, 1200)); // DESCENDING
    engine.processFrame(createPoseAtAngle(100, 1500)); // Stopped halfway (bottom is 90)
    engine.processFrame(createPoseAtAngle(160, 2000)); // STANDING

    expect(engine.getSnapshot().reps).toBe(0);
    expect(engine.getSnapshot().state).toBe(MOVEMENT_STATES.STANDING);
    expect(onRepCompleted).not.toHaveBeenCalled();
  });

  it('rejects fast glitchy rep due to minRepDurationMs policy', () => {
    engine.processFrame(createPoseAtAngle(160, 1000)); // STANDING
    engine.processFrame(createPoseAtAngle(130, 1050)); // DESCENDING
    engine.processFrame(createPoseAtAngle(80, 1100)); // BOTTOM
    engine.processFrame(createPoseAtAngle(160, 1150)); // STANDING (Total 100ms < 600ms)

    expect(engine.getSnapshot().reps).toBe(0);
  });

  it('rejects small movement range (minMovementRange)', () => {
    // Modify config for this test
    const strictConfig = { ...mockConfig, startDescendingThreshold: 155, standingThreshold: 160, bottomThreshold: 140, startAscendingThreshold: 150 };
    const strictEngine = new RepCounterEngine(strictConfig, onRepCompleted);
    
    strictEngine.processFrame(createPoseAtAngle(165, 1000)); // STANDING
    strictEngine.processFrame(createPoseAtAngle(150, 1500)); // DESCENDING
    strictEngine.processFrame(createPoseAtAngle(135, 2000)); // BOTTOM
    strictEngine.processFrame(createPoseAtAngle(165, 2500)); // STANDING

    // Range: 165 to 135 = 30 degrees. config.minMovementRange is 40.
    expect(strictEngine.getSnapshot().reps).toBe(0);
  });

  it('ignores low confidence frames without resetting state', () => {
    engine.processFrame(createPoseAtAngle(160, 1000)); // STANDING
    engine.processFrame(createPoseAtAngle(130, 1200)); // DESCENDING
    
    const lowConfPose = createPoseAtAngle(80, 1300);
    lowConfPose.confidence = 0.2; // Invalid
    engine.processFrame(lowConfPose); 
    
    // State should still be DESCENDING
    expect(engine.getSnapshot().state).toBe(MOVEMENT_STATES.DESCENDING);

    engine.processFrame(createPoseAtAngle(80, 1500)); // BOTTOM
    engine.processFrame(createPoseAtAngle(120, 1800)); // ASCENDING
    engine.processFrame(createPoseAtAngle(160, 2000)); // STANDING -> REP

    expect(engine.getSnapshot().reps).toBe(1);
  });

  it('resets state if landmark loss gap exceeds maxInvalidFrameGapMs', () => {
    engine.processFrame(createPoseAtAngle(160, 1000)); // STANDING
    engine.processFrame(createPoseAtAngle(130, 1200)); // DESCENDING
    
    const lowConfPose = createPoseAtAngle(80, 3000); // 1800ms later (gap > 1000)
    lowConfPose.confidence = 0.2; 
    engine.processFrame(lowConfPose); 
    
    // Gap exceeded, should reset to IDLE
    expect(engine.getSnapshot().state).toBe(MOVEMENT_STATES.IDLE);
  });

  it('handles starting mid-movement correctly', () => {
    // Start at bottom
    engine.processFrame(createPoseAtAngle(80, 1000)); 
    expect(engine.getSnapshot().state).toBe(MOVEMENT_STATES.IDLE); // Hasn't hit standing yet

    engine.processFrame(createPoseAtAngle(160, 1500)); 
    expect(engine.getSnapshot().state).toBe(MOVEMENT_STATES.STANDING);
    
    // Doesn't count as rep
    expect(engine.getSnapshot().reps).toBe(0);
  });
});
