import { calculateAngle } from '../utils/angle';
import { POSE_CONFIG } from '../../pose/constants/pose';

const isLandmarkValid = (lm) => {
  return lm && lm.visibility >= POSE_CONFIG.MIN_LANDMARK_CONFIDENCE;
};

export const pushupConfig = {
  name: "push_up",
  primaryMetric: "elbow_angle",
  
  // We use the elbow angle to track push-up depth
  calculatePrimaryMetric: (landmarks) => {
    const lShoulder = landmarks['left_shoulder'];
    const lElbow = landmarks['left_elbow'];
    const lWrist = landmarks['left_wrist'];
    
    const rShoulder = landmarks['right_shoulder'];
    const rElbow = landmarks['right_elbow'];
    const rWrist = landmarks['right_wrist'];

    const leftValid = isLandmarkValid(lShoulder) && isLandmarkValid(lElbow) && isLandmarkValid(lWrist);
    const rightValid = isLandmarkValid(rShoulder) && isLandmarkValid(rElbow) && isLandmarkValid(rWrist);

    let leftAngle = null;
    let rightAngle = null;

    if (leftValid) {
      leftAngle = calculateAngle(lShoulder, lElbow, lWrist);
    }
    if (rightValid) {
      rightAngle = calculateAngle(rShoulder, rElbow, rWrist);
    }

    if (leftAngle !== null && rightAngle !== null) {
      // Use the average angle of both arms
      return (leftAngle + rightAngle) / 2;
    } else if (leftAngle !== null) {
      return leftAngle;
    } else if (rightAngle !== null) {
      return rightAngle;
    }

    return null;
  },

  // Angles in degrees (elbow angle)
  // Pushup top position has straight arms. 
  // We expect elbow > 150 to be considered "standing/top".
  standingThreshold: 150, 
  bottomThreshold: 90,    
  
  // Hysteresis/Stability parameters
  startDescendingThreshold: 130,
  startAscendingThreshold: 110,

  // General configuration
  minMovementRange: 40, // Angle must change by at least 40 degrees
  minRepDurationMs: 600, // A rep takes time
  maxInvalidFrameGapMs: 1000, 
  stateTransitionStabilityMs: 150,

  // Required landmarks
  requiredLandmarks: [
    'left_shoulder', 'left_elbow', 'left_wrist',
    'right_shoulder', 'right_elbow', 'right_wrist'
  ]
};
