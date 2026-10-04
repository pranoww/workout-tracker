import { QUALITY_STATUS } from '../constants/formAnalysis';

export const lungeFormConfig = {
  name: "lunge",
  
  // Depth Thresholds
  // Hips drop down towards knee level.
  depth: {
    evaluate: (val) => {
      if (val === null) return QUALITY_STATUS.UNCERTAIN;
      // In a deep lunge, the engine averages the front and back knee depths.
      // Front knee depth approaches 0, back knee depth approaches -1.0.
      // So the average depth reaches around -0.5 to -0.6.
      if (val >= -0.6) return QUALITY_STATUS.GOOD; 
      if (val >= -0.8) return QUALITY_STATUS.MINOR_DEVIATION; 
      return QUALITY_STATUS.POOR; // Shallow lunge
    },
    messages: {
      [QUALITY_STATUS.GOOD]: "Good lunge depth",
      [QUALITY_STATUS.MINOR_DEVIATION]: "Try dropping your back knee a little lower",
      [QUALITY_STATUS.POOR]: "Lunge was shallow, increase your range of motion"
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
      [QUALITY_STATUS.MINOR_DEVIATION]: "Keep your front knee aligned with your foot",
      [QUALITY_STATUS.POOR]: "Try to prevent your front knee from caving inward"
    }
  },

  // Torso Angle (relative to vertical)
  torso: {
    evaluate: (val) => {
      if (val === null) return QUALITY_STATUS.UNCERTAIN;
      if (val <= 20) return QUALITY_STATUS.GOOD;
      if (val <= 35) return QUALITY_STATUS.MINOR_DEVIATION;
      return QUALITY_STATUS.POOR;
    },
    messages: {
      [QUALITY_STATUS.GOOD]: "Good upright torso position",
      [QUALITY_STATUS.MINOR_DEVIATION]: "Keep your torso a little more upright",
      [QUALITY_STATUS.POOR]: "Try to reduce forward torso lean during the lunge"
    }
  },

  // Symmetry is intentionally omitted for Lunge because it's an asymmetrical movement.

  // ROM Consistency
  romConsistency: {
    evaluate: (val) => {
      if (val === null) return QUALITY_STATUS.UNCERTAIN;
      if (val <= 0.20) return QUALITY_STATUS.GOOD;
      if (val <= 0.35) return QUALITY_STATUS.MINOR_DEVIATION;
      return QUALITY_STATUS.POOR;
    },
    messages: {
      [QUALITY_STATUS.GOOD]: "Consistent range of motion",
      [QUALITY_STATUS.MINOR_DEVIATION]: "Try to keep your lunge depth more consistent",
      [QUALITY_STATUS.POOR]: "Inconsistent range of motion between reps"
    }
  }
};
