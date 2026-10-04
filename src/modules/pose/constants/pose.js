// Pose detection configurations
export const POSE_CONFIG = {
  MODEL: 'BlazePose',
  // Target FPS for pose processing. 30 FPS is usually sufficient without burning CPU.
  TARGET_FPS: 30, 
  // Minimum confidence to consider a single landmark valid (0.0 to 1.0)
  MIN_LANDMARK_CONFIDENCE: 0.5,
  // Minimum overall pose confidence to consider the person detected (0.0 to 1.0)
  MIN_POSE_CONFIDENCE: 0.5,
};

export const POSE_STATES = {
  INITIAL: 'INITIAL',
  LOADING: 'LOADING',
  READY: 'READY',
  DETECTING: 'DETECTING',
  NO_PERSON: 'NO_PERSON',
  LOW_CONFIDENCE: 'LOW_CONFIDENCE',
  ERROR: 'ERROR',
  UNSUPPORTED: 'UNSUPPORTED'
};

// Standardized dictionary keys for landmarks, so the app avoids using raw indices.
// These match the standard BlazePose landmark naming convention.
export const LANDMARKS = {
  NOSE: 'nose',
  LEFT_EYE_INNER: 'left_eye_inner',
  LEFT_EYE: 'left_eye',
  LEFT_EYE_OUTER: 'left_eye_outer',
  RIGHT_EYE_INNER: 'right_eye_inner',
  RIGHT_EYE: 'right_eye',
  RIGHT_EYE_OUTER: 'right_eye_outer',
  LEFT_EAR: 'left_ear',
  RIGHT_EAR: 'right_ear',
  MOUTH_LEFT: 'mouth_left',
  MOUTH_RIGHT: 'mouth_right',
  LEFT_SHOULDER: 'left_shoulder',
  RIGHT_SHOULDER: 'right_shoulder',
  LEFT_ELBOW: 'left_elbow',
  RIGHT_ELBOW: 'right_elbow',
  LEFT_WRIST: 'left_wrist',
  RIGHT_WRIST: 'right_wrist',
  LEFT_PINKY: 'left_pinky',
  RIGHT_PINKY: 'right_pinky',
  LEFT_INDEX: 'left_index',
  RIGHT_INDEX: 'right_index',
  LEFT_THUMB: 'left_thumb',
  RIGHT_THUMB: 'right_thumb',
  LEFT_HIP: 'left_hip',
  RIGHT_HIP: 'right_hip',
  LEFT_KNEE: 'left_knee',
  RIGHT_KNEE: 'right_knee',
  LEFT_ANKLE: 'left_ankle',
  RIGHT_ANKLE: 'right_ankle',
  LEFT_HEEL: 'left_heel',
  RIGHT_HEEL: 'right_heel',
  LEFT_FOOT_INDEX: 'left_foot_index',
  RIGHT_FOOT_INDEX: 'right_foot_index'
};

// A mapping representing standard body connections for rendering a skeleton
export const SKELETON_CONNECTIONS = [
  // Torso
  [LANDMARKS.LEFT_SHOULDER, LANDMARKS.RIGHT_SHOULDER],
  [LANDMARKS.LEFT_SHOULDER, LANDMARKS.LEFT_HIP],
  [LANDMARKS.RIGHT_SHOULDER, LANDMARKS.RIGHT_HIP],
  [LANDMARKS.LEFT_HIP, LANDMARKS.RIGHT_HIP],
  
  // Right Arm
  [LANDMARKS.RIGHT_SHOULDER, LANDMARKS.RIGHT_ELBOW],
  [LANDMARKS.RIGHT_ELBOW, LANDMARKS.RIGHT_WRIST],
  
  // Left Arm
  [LANDMARKS.LEFT_SHOULDER, LANDMARKS.LEFT_ELBOW],
  [LANDMARKS.LEFT_ELBOW, LANDMARKS.LEFT_WRIST],
  
  // Right Leg
  [LANDMARKS.RIGHT_HIP, LANDMARKS.RIGHT_KNEE],
  [LANDMARKS.RIGHT_KNEE, LANDMARKS.RIGHT_ANKLE],
  [LANDMARKS.RIGHT_ANKLE, LANDMARKS.RIGHT_FOOT_INDEX],
  
  // Left Leg
  [LANDMARKS.LEFT_HIP, LANDMARKS.LEFT_KNEE],
  [LANDMARKS.LEFT_KNEE, LANDMARKS.LEFT_ANKLE],
  [LANDMARKS.LEFT_ANKLE, LANDMARKS.LEFT_FOOT_INDEX]
];
