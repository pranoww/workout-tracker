import { QUALITY_STATUS } from '../constants/formAnalysis';

export const squatFormConfig = {
  name: "squat",
  
  // Depth Thresholds (hip.y - knee.y) / torsoLength
  // Y increases downwards. Standing = negative. Parallel = 0.
  // We want to reach at least parallel or slightly below.
  depth: {
    evaluate: (val) => {
      if (val === null) return QUALITY_STATUS.UNCERTAIN;
      if (val >= -0.1) return QUALITY_STATUS.GOOD; // Parallel or below, or slightly above
      if (val >= -0.25) return QUALITY_STATUS.MINOR_DEVIATION; 
      return QUALITY_STATUS.POOR; // Shallow
    },
    messages: {
      [QUALITY_STATUS.GOOD]: "Good depth",
      [QUALITY_STATUS.MINOR_DEVIATION]: "Try reaching a little deeper",
      [QUALITY_STATUS.POOR]: "Squat was shallow, try to go lower"
    }
  },

  // Knee Alignment (valgus)
  kneeAlignment: {
    evaluate: (val) => {
      if (val === null) return QUALITY_STATUS.UNCERTAIN;
      if (val <= 0.15) return QUALITY_STATUS.GOOD;
      if (val <= 0.25) return QUALITY_STATUS.MINOR_DEVIATION;
      return QUALITY_STATUS.POOR;
    },
    messages: {
      [QUALITY_STATUS.GOOD]: "Good knee alignment",
      [QUALITY_STATUS.MINOR_DEVIATION]: "Keep your knees more aligned with your feet",
      [QUALITY_STATUS.POOR]: "Try to keep your knees tracking more consistently"
    }
  },

  // Torso Angle (relative to vertical)
  torso: {
    evaluate: (val) => {
      if (val === null) return QUALITY_STATUS.UNCERTAIN;
      if (val <= 25) return QUALITY_STATUS.GOOD;
      if (val <= 40) return QUALITY_STATUS.MINOR_DEVIATION;
      return QUALITY_STATUS.POOR;
    },
    messages: {
      [QUALITY_STATUS.GOOD]: "Good torso position",
      [QUALITY_STATUS.MINOR_DEVIATION]: "Keep your torso a little more upright",
      [QUALITY_STATUS.POOR]: "Try to reduce forward torso lean"
    }
  },

  // Symmetry
  symmetry: {
    evaluate: (val) => {
      if (val === null) return QUALITY_STATUS.UNCERTAIN;
      if (val <= 0.10) return QUALITY_STATUS.GOOD;
      if (val <= 0.20) return QUALITY_STATUS.MINOR_DEVIATION;
      return QUALITY_STATUS.POOR;
    },
    messages: {
      [QUALITY_STATUS.GOOD]: "Good symmetry",
      [QUALITY_STATUS.MINOR_DEVIATION]: "Movement is slightly asymmetric",
      [QUALITY_STATUS.POOR]: "Try to keep both sides moving more evenly"
    }
  },

  // ROM Consistency
  romConsistency: {
    evaluate: (val) => {
      if (val === null) return QUALITY_STATUS.UNCERTAIN;
      if (val <= 0.15) return QUALITY_STATUS.GOOD;
      if (val <= 0.30) return QUALITY_STATUS.MINOR_DEVIATION;
      return QUALITY_STATUS.POOR;
    },
    messages: {
      [QUALITY_STATUS.GOOD]: "Consistent range of motion",
      [QUALITY_STATUS.MINOR_DEVIATION]: "Try to keep your squat depth more consistent",
      [QUALITY_STATUS.POOR]: "Inconsistent range of motion"
    }
  }
};
