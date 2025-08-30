import apiClient from './client';

export const ticketsAPI = {
  getEventTickets: async (eventId) => {
    const response = await apiClient.get(`/tickets/event/${eventId}`);
    return response.data.data;
  },

  createTicketType: async (eventId, ticketData) => {
    const response = await apiClient.post(`/tickets/event/${eventId}`, ticketData);
    return response.data.data;
  },

  updateTicketType: async (id, ticketData) => {
    const response = await apiClient.put(`/tickets/${id}`, ticketData);
    return response.data.data;
  },

  deleteTicketType: async (id) => {
    await apiClient.delete(`/tickets/${id}`);
  },

  checkAvailability: async (ticketTypeId, quantity = 1) => {
    const response = await apiClient.get(`/tickets/${ticketTypeId}/availability`, {
      params: { quantity }
    });
    return response.data.data;
  },
};