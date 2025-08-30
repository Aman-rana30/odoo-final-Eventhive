import apiClient from './client';

export const authAPI = {
  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data.data;
  },

  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data.data;
  },

  logout: async (refreshToken) => {
    await apiClient.post('/auth/logout', { refreshToken });
  },

  getProfile: async () => {
    const response = await apiClient.get('/auth/profile');
    return response.data.data;
  },

  updateProfile: async (profileData) => {
    const response = await apiClient.put('/auth/profile', profileData);
    return response.data.data;
  },

  refreshToken: async (refreshToken) => {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data.data;
  },
};