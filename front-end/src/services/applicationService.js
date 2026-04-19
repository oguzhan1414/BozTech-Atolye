import ApiService from './apiService';

const applicationApi = new ApiService('applications');

export const applicationService = {
  // Yeni başvuru yap (public)
  create: async (data) => {
    try {
      const response = await applicationApi.post(data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Tüm başvuruları getir (admin)
  getAll: async (params = {}) => {
    try {
      const response = await applicationApi.get('', params);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Tek başvuru getir (admin)
  getById: async (id) => {
    try {
      const response = await applicationApi.getById(id);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Başvuru durumunu güncelle (admin)
  updateStatus: async (id, status, note = '') => {
    try {
      const response = await applicationApi.put(`${id}/status`, { status, note });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Özel e-posta gönder (admin)
  sendEmail: async (id, subject, message) => {
    try {
      const response = await applicationApi.post({ subject, message }, `/${id}/send-email`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Başvuruya not ekle (admin)
  addNote: async (id, note) => {
    try {
      const response = await applicationApi.post({ note }, `/${id}/notes`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Excel export (admin)
  exportExcel: async (params = {}) => {
    try {
      const response = await applicationApi.get('/export/excel', params);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // CSV export (admin)
  exportCSV: async (params = {}) => {
    try {
      const response = await applicationApi.get('/export/csv', params);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // İstatistikler (admin)
  getStats: async () => {
    try {
      const response = await applicationApi.get('/stats');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Kullanıcının kendi başvuruları
  getMyApplications: async (email) => {
    try {
      const response = await applicationApi.get('/my-applications', { email });
      return response;
    } catch (error) {
      throw error;
    }
  }
};