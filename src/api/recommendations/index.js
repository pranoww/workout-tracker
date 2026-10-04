import { apiClient } from '../client';

export const createExerciseRecommendation = (exerciseId) => {
  return apiClient('/recommendations/exercise', { 
    method: 'POST', 
    body: { exercise_id: exerciseId } 
  });
};
