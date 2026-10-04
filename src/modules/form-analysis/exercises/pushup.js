import { QUALITY_STATUS } from '../constants/formAnalysis';

export const pushupFormConfig = {
  name: "push_up",
  
  // Elbow Angle (Push-up depth)
  // We track the minimum elbow angle reached during the rep
  elbowAngle: {
    evaluate: (val) => {
      if (val === null) return QUALITY_STATUS.UNCERTAIN;
      if (val <= 95) return QUALITY_STATUS.GOOD; // 90 degrees or better
      if (val <= 115) return QUALITY_STATUS.MINOR_DEVIATION; 
      return QUALITY_STATUS.POOR; // Shallow push-up
    },
    messages: {
      [QUALITY_STATUS.GOOD]: "Good push-up depth",
      [QUALITY_STATUS.MINOR_DEVIATION]: "Lower with slightly more range of motion",
      [QUALITY_STATUS.POOR]: "Push-up was shallow, lower your chest further"
    }
  },

  // Body Alignment (shoulder -> hip -> ankle)
  // A perfect plank is 180 degrees. 
  // < 180 means hips are dropping (sagging). > 180 means hips are high (piking).
  // The engine tracks the maximum deviation from 180.
  bodyAlignment: {
    evaluate: (val) => {
      if (val === null) return QUALITY_STATUS.UNCERTAIN;
      
      const deviation = Math.abs(180 - val);
      if (deviation <= 15) return QUALITY_STATUS.GOOD; // 165 - 195
      if (deviation <= 25) return QUALITY_STATUS.MINOR_DEVIATION; 
      return QUALITY_STATUS.POOR; 
    },
    messages: {
      [QUALITY_STATUS.GOOD]: "Good body alignment",
      [QUALITY_STATUS.MINOR_DEVIATION]: "Keep your body in a straighter line",
      [QUALITY_STATUS.POOR]: "Avoid letting your hips sag or raising them too high"
    }
  },

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
      [QUALITY_STATUS.MINOR_DEVIATION]: "Try to keep your push-up depth more consistent",
      [QUALITY_STATUS.POOR]: "Inconsistent range of motion between reps"
    }
  }
};
