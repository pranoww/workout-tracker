/**
 * Calculates symmetry between a left and right metric.
 * 
 * @param {number} leftMetric 
 * @param {number} rightMetric 
 * @param {number} normalizationFactor (Optional) To normalize the difference (e.g. max range)
 * @returns {number|null} Normalized difference (0 means perfectly symmetric), or null.
 */
export function calculateSymmetry(leftMetric, rightMetric, normalizationFactor = 1) {
  if (typeof leftMetric !== 'number' || typeof rightMetric !== 'number') return null;
  if (isNaN(leftMetric) || isNaN(rightMetric)) return null;
  if (normalizationFactor === 0) return null;
  
  return Math.abs(leftMetric - rightMetric) / normalizationFactor;
}
