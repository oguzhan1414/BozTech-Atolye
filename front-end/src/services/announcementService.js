import ApiService from './apiService';

const announcementApi = new ApiService('announcements');

export const announcementService = {
  // Tüm duyuruları getir
  getAll: async (params = {}) => {
    try {
      const response = await announcementApi.get('', params);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Tek duyuru getir
  getById: async (id) => {
    try {
      const response = await announcementApi.getById(id);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Yeni duyuru ekle
  create: async (data) => {
    try {
      const response = await announcementApi.post(data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Duyuru güncelle
  update: async (id, data) => {
    try {
      const response = await announcementApi.put(id, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Duyuru sil (kalıcı)
  delete: async (id) => {
    try {
      const response = await announcementApi.delete(id);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Admin tüm duyurular (arşiv dahil)
  getAllAdmin: async () => {
    try {
      const response = await announcementApi.get('/admin/all');
      return response;
    } catch (error) {
      throw error;
    }
  }
};