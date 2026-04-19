import ApiService from './apiService';

const photoApi = new ApiService('photos');

export const photoService = {
  // Tüm fotoğrafları getir
  getAll: async (params = {}) => {
    try {
      const response = await photoApi.get('', params);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Tek fotoğraf getir
  getById: async (id) => {
    try {
      const response = await photoApi.getById(id);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Kategorilere göre gruplanmış fotoğraflar
  getByCategory: async () => {
    try {
      const response = await photoApi.get('/by-category');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Yeni fotoğraf yükle (form-data ile)
  upload: async (formData) => {
    try {
      const response = await photoApi.postFormData(formData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Fotoğraf güncelle
  update: async (id, data) => {
    try {
      const response = await photoApi.put(id, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Fotoğraf sil (kalıcı)
  delete: async (id) => {
    try {
      const response = await photoApi.delete(id);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Admin tüm fotoğraflar
  getAllAdmin: async () => {
    try {
      const response = await photoApi.get('/admin/all');
      return response;
    } catch (error) {
      throw error;
    }
  }
};