export const squatConfig = {
  name: "squat",
  primaryMetric: "knee_angle",
  // Angles in degrees
  standingThreshold: 150, // Considered standing if angle > 150
  bottomThreshold: 90,    // Considered at bottom if angle < 90
  
  // Hysteresis/Stability parameters
  // We use slightly different thresholds for transitions to prevent flickering
  // Start descending: must drop below standingThreshold - buffer
  startDescendingThreshold: 140,
  // Start ascending: must rise above bottomThreshold + buffer
  startAscendingThreshold: 100,

  // General configuration
  minMovementRange: 40, // Angle must change by at least 40 degrees
  
  // A rep must take at least this long (ms) to filter out glitchy jumps
  minRepDurationMs: 600, 
  
  // How many consecutive ms can landmarks be missing before resetting state
  maxInvalidFrameGapMs: 1000, 

  // How many ms must a condition be held to trigger a state change (temporal stability)
  stateTransitionStabilityMs: 150,

  // Required landmarks to process a frame for squat
  requiredLandmarks: [
    'left_hip', 'left_knee', 'left_ankle',
    'right_hip', 'right_knee', 'right_ankle'
  ]
};
