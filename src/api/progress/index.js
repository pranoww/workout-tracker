import { apiClient } from '../client';

export const getWorkoutProgress = (workoutId) => {
  return apiClient(`/progress/workouts/${workoutId}`, { method: 'GET' });
};

export const getExerciseSummary = (exerciseId) => {
  return apiClient(`/progress/exercises/${exerciseId}`, { method: 'GET' });
};

export const getExerciseHistory = (exerciseId, page = 1, pageSize = 20) => {
  return apiClient(`/progress/exercises/${exerciseId}/history?page=${page}&page_size=${pageSize}`, { method: 'GET' });
};
