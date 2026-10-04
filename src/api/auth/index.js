import { apiClient } from '../client';

export const sendOtp = (email) => {
  return apiClient('/auth/send-otp', { method: 'POST', body: { email } });
};

export const verifyOtp = (email, otp) => {
  return apiClient('/auth/verify-otp', { method: 'POST', body: { email, otp } });
};

export const getMe = () => {
  return apiClient('/auth/me', { method: 'GET' });
};

export const logout = () => {
  return apiClient('/auth/logout', { method: 'POST' });
};
