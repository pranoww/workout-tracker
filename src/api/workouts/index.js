import { apiClient } from '../client';

export const getWorkouts = () => {
  return apiClient('/workouts', { method: 'GET' });
};

export const getWorkout = (workoutId) => {
  return apiClient(`/workouts/${workoutId}`, { method: 'GET' });
};

export const createWorkout = (data) => {
  return apiClient('/workouts', { method: 'POST', body: data });
};

export const addExerciseToWorkout = (workoutId, data) => {
  return apiClient(`/workouts/${workoutId}/exercises`, { method: 'POST', body: data });
};

export const addSetToWorkoutExercise = (workoutId, workoutExerciseId, data) => {
  return apiClient(`/workouts/${workoutId}/exercises/${workoutExerciseId}/sets`, { method: 'POST', body: data });
};

export const startWorkout = (workoutId) => {
  return apiClient(`/workouts/${workoutId}/start`, { method: 'POST' });
};

export const completeWorkout = (workoutId) => {
  return apiClient(`/workouts/${workoutId}/complete`, { method: 'POST' });
};

export const completeWorkoutSet = (workoutId, workoutExerciseId, setId, data) => {
  return apiClient(`/workouts/${workoutId}/exercises/${workoutExerciseId}/sets/${setId}/complete`, {
    method: 'POST',
    body: data
  });
};

export const skipWorkoutSet = (workoutId, workoutExerciseId, setId) => {
  return apiClient(`/workouts/${workoutId}/exercises/${workoutExerciseId}/sets/${setId}/skip`, {
    method: 'POST'
  });
};
