import apiClient from './client';

export const bookingsAPI = {
  createOrder: async (orderData) => {
    const response = await apiClient.post('/bookings/create-order', orderData);
    return response.data.data;
  },

  verifyPayment: async (paymentData) => {
    const response = await apiClient.post('/bookings/verify-payment', paymentData);
    return response.data.data;
  },

  getMyBookings: async (params = {}) => {
    const response = await apiClient.get('/bookings/my', { params });
    return response.data.data;
  },

  getBooking: async (id) => {
    const response = await apiClient.get(`/bookings/${id}`);
    return response.data.data;
  },

  cancelBooking: async (id, reason) => {
    const response = await apiClient.patch(`/bookings/${id}/cancel`, { reason });
    return response.data.data;
  },

  downloadTicket: async (id) => {
    const response = await apiClient.get(`/bookings/${id}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  resendTicket: async (id, method) => {
    await apiClient.post(`/bookings/${id}/resend`, { method });
  },

  getEventBookings: async (eventId, params = {}) => {
    const response = await apiClient.get(`/bookings/event/${eventId}`, { params });
    return response.data.data;
  },
};