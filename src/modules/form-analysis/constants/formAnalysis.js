export const QUALITY_STATUS = {
  GOOD: 'GOOD',
  MINOR_DEVIATION: 'MINOR_DEVIATION',
  POOR: 'POOR',
  UNCERTAIN: 'UNCERTAIN',
  NOT_AVAILABLE: 'NOT_AVAILABLE'
};

export const OVERALL_QUALITY = {
  GOOD: 'GOOD',
  FAIR: 'FAIR',
  NEEDS_IMPROVEMENT: 'NEEDS_IMPROVEMENT',
  POOR: 'POOR',
  INSUFFICIENT_DATA: 'INSUFFICIENT_DATA'
};

export const METRIC_WEIGHTS = {
  depth: 0.30,
  kneeAlignment: 0.25,
  torso: 0.20,
  symmetry: 0.15,
  romConsistency: 0.10
};

export const METRIC_SCORES = {
  [QUALITY_STATUS.GOOD]: 100,
  [QUALITY_STATUS.MINOR_DEVIATION]: 70,
  [QUALITY_STATUS.POOR]: 40,
  // UNCERTAIN / NOT_AVAILABLE shouldn't receive a direct score; they will be excluded from the denominator.
};
