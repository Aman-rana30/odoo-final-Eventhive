import apiClient from './client';

export const couponsAPI = {
  validateCoupon: async (code, validationData) => {
    const response = await apiClient.post(`/coupons/validate/${code}`, validationData);
    return response.data.data;
  },

  createCoupon: async (couponData) => {
    const response = await apiClient.post('/coupons', couponData);
    return response.data.data;
  },

  getCoupons: async (params = {}) => {
    const response = await apiClient.get('/coupons', { params });
    return response.data.data;
  },

  updateCoupon: async (id, couponData) => {
    const response = await apiClient.put(`/coupons/${id}`, couponData);
    return response.data.data;
  },

  deleteCoupon: async (id) => {
    await apiClient.delete(`/coupons/${id}`);
  },
};