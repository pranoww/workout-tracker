/**
 * Calculates frontal knee alignment (valgus/varus) offset.
 * Note: This metric is highly dependent on a frontal camera view.
 * 
 * @param {Object} hip {x, y}
 * @param {Object} knee {x, y}
 * @param {Object} ankle {x, y}
 * @param {number} bodyReferenceWidth (e.g. shoulder width or hip width)
 * @returns {number|null} Normalized offset ratio (0 means perfectly aligned), or null if invalid.
 */
export function calculateKneeAlignment(hip, knee, ankle, bodyReferenceWidth) {
  if (!hip || !knee || !ankle || !bodyReferenceWidth || bodyReferenceWidth === 0) return null;

  const expectedKneeX = (hip.x + ankle.x) / 2;
  const deviation = Math.abs(knee.x - expectedKneeX);

  return deviation / bodyReferenceWidth;
}

/**
 * Calculates a reference width using shoulders or hips.
 */
export function calculateReferenceWidth(leftNode, rightNode) {
  if (!leftNode || !rightNode) return null;
  const width = Math.abs(leftNode.x - rightNode.x);
  return width > 0.05 ? width : null; // if width is extremely small, it might be a side view
}
