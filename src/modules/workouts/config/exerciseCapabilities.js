export const EXERCISE_CAPABILITIES = {
  squat: {
    cameraSupported: true,
    repCountingSupported: true,
    formAnalysisSupported: true,
  },
  lunge: {
    cameraSupported: true,
    repCountingSupported: true,
    formAnalysisSupported: true,
  },
  push_up: {
    cameraSupported: true,
    repCountingSupported: true,
    formAnalysisSupported: true,
  }
};

export const getExerciseCapabilities = (exerciseName) => {
  if (!exerciseName) return null;
  const normalizedName = exerciseName.toLowerCase();
  return EXERCISE_CAPABILITIES[normalizedName] || {
    cameraSupported: false,
    repCountingSupported: false,
    formAnalysisSupported: false,
  };
};
