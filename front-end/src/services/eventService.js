import ApiService from './apiService';

const eventApi = new ApiService('events');

export const eventService = {
  // Tüm etkinlikleri getir
  getAll: async (params = {}) => {
    try {
      const response = await eventApi.get('', params);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Tek etkinlik getir
  getById: async (id) => {
    try {
      const response = await eventApi.getById(id);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Bugünkü etkinlikler
  getTodays: async () => {
    try {
      const response = await eventApi.get('/today');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Yeni etkinlik ekle
  create: async (data) => {
    try {
      const response = await eventApi.post(data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Etkinlik güncelle
  update: async (id, data) => {
    try {
      const response = await eventApi.put(id, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Etkinlik sil (kalıcı)
  delete: async (id) => {
    try {
      const response = await eventApi.delete(id);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Admin tüm etkinlikler
  getAllAdmin: async () => {
    try {
      const response = await eventApi.get('/admin/all');
      return response;
    } catch (error) {
      throw error;
    }
  }
};