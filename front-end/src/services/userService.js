import ApiService from './apiService';

const userApi = new ApiService('users');

export const userService = {
  // Tüm kullanıcıları getir
  getAll: async () => {
    try {
      const response = await userApi.get('');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Tek kullanıcı getir
  getById: async (id) => {
    try {
      const response = await userApi.getById(id);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Kullanıcı güncelle
  update: async (id, data) => {
    try {
      const response = await userApi.put(id, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Kullanıcı sil
  delete: async (id) => {
    try {
      const response = await userApi.delete(id);
      return response;
    } catch (error) {
      throw error;
    }
  }
};