import ApiService from './apiService';

const authApi = new ApiService('auth');

export const authService = {
  // Giriş yap
  login: async (email, password) => {
    try {
      const response = await authApi.post({ email, password }, '/login');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Token doğrula
  verify: async () => {
    try {
      const response = await authApi.get('/verify');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Şifre değiştir
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await authApi.put('/change-password', { currentPassword, newPassword });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Yeni editör ekle (admin)
  registerEditor: async (userData) => {
    try {
      const response = await authApi.post(userData, '/register');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Çıkış yap
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userMustChangePassword');
    window.location.href = '/admin';
  }
};
