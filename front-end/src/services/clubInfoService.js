import ApiService from './apiService';

const clubInfoApi = new ApiService('club-info');

export const clubInfoService = {
  // Tüm bölümleri getir
  getAll: async () => {
    try {
      const response = await clubInfoApi.get('');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Belirli bir bölümü getir
  getBySection: async (section) => {
    try {
      const response = await clubInfoApi.get(`/${section}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Bölüm güncelle
  update: async (section, data) => {
    try {
      const response = await clubInfoApi.put(section, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Yeni bölüm oluştur (ilk kez)
  create: async (section, data) => {
    try {
      const response = await clubInfoApi.post(data, `/${section}`);
      return response;
    } catch (error) {
      throw error;
    }
  }
};