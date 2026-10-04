import { POSE_CONFIG } from '../constants/pose';

/**
 * Normalizes raw TFJS pose output into our standardized domain contract.
 * @param {Object} rawPose - The raw pose object from TFJS pose-detection.
 * @param {number} videoWidth - The source video width.
 * @param {number} videoHeight - The source video height.
 * @returns {Object} Normalized pose object.
 */
export function normalizePose(rawPose, videoWidth, videoHeight) {
  if (!rawPose || !rawPose.keypoints || rawPose.keypoints.length === 0) {
    return {
      detected: false,
      confidence: 0,
      landmarks: [],
      timestamp: performance.now()
    };
  }

  // Calculate overall pose confidence. BlazePose returns a `score` on the root pose object.
  const poseConfidence = rawPose.score || 0;
  
  if (poseConfidence < POSE_CONFIG.MIN_POSE_CONFIDENCE) {
    return {
      detected: true,
      confidence: poseConfidence,
      landmarks: [], // We clear landmarks if overall confidence is too low to avoid erratic lines
      timestamp: performance.now()
    };
  }

  const normalizedLandmarks = rawPose.keypoints.map(kp => {
    // TFJS gives x and y in absolute pixel coordinates of the source video.
    // We normalize to 0.0 - 1.0
    const normX = videoWidth > 0 ? kp.x / videoWidth : 0;
    const normY = videoHeight > 0 ? kp.y / videoHeight : 0;
    
    // Z coordinate is often found in keypoints3D for BlazePose, 
    // but the 2D keypoints array also sometimes has an estimated Z.
    // If we need Z later, we could fetch from rawPose.keypoints3D[index],
    // but for now 2D overlay and basic x/y is the primary foundation.
    
    return {
      id: kp.name, // e.g., 'nose', 'left_shoulder'
      x: normX,
      y: normY,
      z: kp.z || 0,
      visibility: kp.score || 0
    };
  });

  return {
    detected: true,
    confidence: poseConfidence,
    landmarks: normalizedLandmarks,
    timestamp: performance.now()
  };
}
