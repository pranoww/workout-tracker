/**
 * Calculates squat depth using vertical distance between hip and knee.
 * Note: In normalized coordinates, Y increases downwards (0 is top, 1 is bottom).
 * Standing: hip Y < knee Y
 * Parallel: hip Y ≈ knee Y
 * 
 * @param {Object} hip {x, y}
 * @param {Object} knee {x, y}
 * @param {number} bodyReferenceLength (e.g. torso length)
 * @returns {number|null} Normalized depth metric. Larger/positive means deeper. 0 is parallel.
 */
export function calculateSquatDepth(hip, knee, bodyReferenceLength) {
  if (!hip || !knee || !bodyReferenceLength || bodyReferenceLength === 0) return null;

  // Since Y increases downwards, hip.y - knee.y becomes less negative as you go down.
  // At parallel, hip.y - knee.y = 0.
  // Below parallel, hip.y - knee.y > 0.
  const depthDiff = hip.y - knee.y;
  
  return depthDiff / bodyReferenceLength;
}

/**
 * Calculates reference length (e.g., torso length)
 */
export function calculateReferenceLength(shoulder, hip) {
  if (!shoulder || !hip) return null;
  const length = Math.abs(hip.y - shoulder.y);
  return length > 0.05 ? length : null;
}
