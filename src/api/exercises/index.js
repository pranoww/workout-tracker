import { apiClient } from '../client';

export const getExercises = (params = {}) => {
  const query = new URLSearchParams();
  if (params.category) query.append('category', params.category);
  if (params.muscle_group) query.append('muscle_group', params.muscle_group);
  if (params.difficulty) query.append('difficulty', params.difficulty);
  if (params.limit) query.append('limit', params.limit);
  if (params.skip) query.append('skip', params.skip);
  
  const queryString = query.toString();
  return apiClient(`/exercises${queryString ? `?${queryString}` : ''}`, { method: 'GET' });
};

export const getExercise = (id) => {
  return apiClient(`/exercises/${id}`, { method: 'GET' });
};
