/**
 * Calculates the angle between three points: A, B, C.
 * The angle is calculated at point B.
 * 
 * @param {Object} a - { x, y }
 * @param {Object} b - { x, y } (vertex)
 * @param {Object} c - { x, y }
 * @returns {number|null} Angle in degrees [0, 180], or null if invalid.
 */
export function calculateAngle(a, b, c) {
  if (!a || !b || !c) return null;
  
  if (
    typeof a.x !== 'number' || typeof a.y !== 'number' ||
    typeof b.x !== 'number' || typeof b.y !== 'number' ||
    typeof c.x !== 'number' || typeof c.y !== 'number'
  ) {
    return null;
  }

  // Calculate vectors AB and BC (or BA and BC)
  const ba = { x: a.x - b.x, y: a.y - b.y };
  const bc = { x: c.x - b.x, y: c.y - b.y };

  // Calculate dot product
  const dotProduct = ba.x * bc.x + ba.y * bc.y;

  // Calculate magnitudes
  const magnitudeBA = Math.sqrt(ba.x * ba.x + ba.y * ba.y);
  const magnitudeBC = Math.sqrt(bc.x * bc.x + bc.y * bc.y);

  if (magnitudeBA === 0 || magnitudeBC === 0) return null;

  // Calculate cosine of angle
  let cosAngle = dotProduct / (magnitudeBA * magnitudeBC);
  
  // Handle floating point errors
  if (cosAngle > 1.0) cosAngle = 1.0;
  if (cosAngle < -1.0) cosAngle = -1.0;

  let angle = Math.acos(cosAngle) * (180 / Math.PI);
  
  if (isNaN(angle)) return null;

  return angle;
}
