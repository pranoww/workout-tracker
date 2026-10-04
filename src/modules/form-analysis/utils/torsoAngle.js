/**
 * Calculates the torso lean angle relative to the vertical axis.
 * @param {Object} leftShoulder {x, y}
 * @param {Object} rightShoulder {x, y}
 * @param {Object} leftHip {x, y}
 * @param {Object} rightHip {x, y}
 * @returns {number|null} Angle in degrees [0, 90] where 0 is perfectly vertical, or null if invalid.
 */
export function calculateTorsoAngle(leftShoulder, rightShoulder, leftHip, rightHip) {
  if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) return null;

  // Calculate midpoints
  const shoulderCenter = {
    x: (leftShoulder.x + rightShoulder.x) / 2,
    y: (leftShoulder.y + rightShoulder.y) / 2
  };
  
  const hipCenter = {
    x: (leftHip.x + rightHip.x) / 2,
    y: (leftHip.y + rightHip.y) / 2
  };

  const dx = shoulderCenter.x - hipCenter.x;
  const dy = shoulderCenter.y - hipCenter.y; // y increases downwards

  if (dx === 0 && dy === 0) return null;

  // Angle with the vertical axis (y-axis)
  // If dx=0, torso is perfectly vertical.
  // The tangent of the angle with the vertical axis is |dx / dy|
  const angleRad = Math.atan2(Math.abs(dx), Math.abs(dy));
  
  const angleDeg = angleRad * (180 / Math.PI);
  
  if (isNaN(angleDeg)) return null;
  return angleDeg;
}
