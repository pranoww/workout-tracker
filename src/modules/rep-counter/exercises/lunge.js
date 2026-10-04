import { calculateAngle } from '../utils/angle';
import { POSE_CONFIG } from '../../pose/constants/pose';

const isLandmarkValid = (lm) => {
  return lm && lm.visibility >= POSE_CONFIG.MIN_LANDMARK_CONFIDENCE;
};

export const lungeConfig = {
  name: "lunge",
  primaryMetric: "knee_angle",
  
  // We use the most bent knee (minimum angle) to track lunge depth
  calculatePrimaryMetric: (landmarks) => {
    const lHip = landmarks['left_hip'];
    const lKnee = landmarks['left_knee'];
    const lAnkle = landmarks['left_ankle'];
    
    const rHip = landmarks['right_hip'];
    const rKnee = landmarks['right_knee'];
    const rAnkle = landmarks['right_ankle'];

    const leftValid = isLandmarkValid(lHip) && isLandmarkValid(lKnee) && isLandmarkValid(lAnkle);
    const rightValid = isLandmarkValid(rHip) && isLandmarkValid(rKnee) && isLandmarkValid(rAnkle);

    let leftAngle = null;
    let rightAngle = null;

    if (leftValid) {
      leftAngle = calculateAngle(lHip, lKnee, lAnkle);
    }
    if (rightValid) {
      rightAngle = calculateAngle(rHip, rKnee, rAnkle);
    }

    if (leftAngle !== null && rightAngle !== null) {
      // Use the minimum angle (the leg that is bending the most)
      return Math.min(leftAngle, rightAngle);
    } else if (leftAngle !== null) {
      return leftAngle;
    } else if (rightAngle !== null) {
      return rightAngle;
    }

    return null;
  },

  // Angles in degrees (representing the most bent knee)
  standingThreshold: 140, // Legs are mostly straight when standing
  bottomThreshold: 100,    // A deep lunge brings the knee to ~90
  
  // Hysteresis/Stability parameters
  startDescendingThreshold: 130,
  startAscendingThreshold: 110,

  // General configuration
  minMovementRange: 30, // Angle must change by at least 30 degrees
  minRepDurationMs: 600, // A rep takes time
  maxInvalidFrameGapMs: 1000, 
  stateTransitionStabilityMs: 150,

  // Required landmarks
  requiredLandmarks: [
    'left_hip', 'left_knee', 'left_ankle',
    'right_hip', 'right_knee', 'right_ankle'
  ]
};
