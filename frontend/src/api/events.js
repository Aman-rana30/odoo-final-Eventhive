import apiClient from './client';

export const eventsAPI = {
  getEvents: async (params = {}) => {
    const response = await apiClient.get('/events', { params });
    return response.data.data;
  },

  getEventById: async (id) => {
    const response = await apiClient.get(`/events/${id}`);
    return response.data.data;
  },

  getEventBySlug: async (slug) => {
    const response = await apiClient.get(`/events/slug/${slug}`);
    return response.data.data;
  },

  createEvent: async (eventData) => {
    const formData = new FormData();
    Object.keys(eventData).forEach(key => {
      if (key === 'venue') {
        Object.keys(eventData.venue).forEach(venueKey => {
          formData.append(`venue.${venueKey}`, eventData.venue[venueKey]);
        });
      } else if (key === 'coverImage') {
        if (eventData.coverImage) {
          formData.append('coverImage', eventData.coverImage);
        }
      } else if (Array.isArray(eventData[key])) {
        eventData[key].forEach(item => {
          formData.append(key, item);
        });
      } else {
        formData.append(key, eventData[key]);
      }
    });
    // Send to backend, which will upload to Cloudinary
    const response = await apiClient.post('/events', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  },

  updateEvent: async (id, eventData) => {
    const formData = new FormData();
    
    Object.keys(eventData).forEach(key => {
      if (key === 'venue') {
        Object.keys(eventData.venue).forEach(venueKey => {
          formData.append(`venue.${venueKey}`, eventData.venue[venueKey]);
        });
      } else if (key === 'coverImage') {
        if (eventData.coverImage) {
          formData.append('coverImage', eventData.coverImage);
        }
      } else if (Array.isArray(eventData[key])) {
        eventData[key].forEach(item => {
          formData.append(key, item);
        });
      } else {
        formData.append(key, eventData[key]);
      }
    });

    const response = await apiClient.put(`/events/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  },

  publishEvent: async (id) => {
    const response = await apiClient.patch(`/events/${id}/publish`);
    return response.data.data;
  },

  deleteEvent: async (id) => {
    await apiClient.delete(`/events/${id}`);
  },

  getFeaturedEvents: async () => {
    const response = await apiClient.get('/events/featured');
    return response.data.data;
  },

  getTrendingEvents: async () => {
    const response = await apiClient.get('/events/trending');
    return response.data.data;
  },

  trackEventView: async (id) => {
    await apiClient.post(`/events/${id}/track-view`);
  },

  getMyEvents: async (params = {}) => {
    const response = await apiClient.get('/events/my/events', { params });
    return response.data.data.events || response.data.data;
  },
};