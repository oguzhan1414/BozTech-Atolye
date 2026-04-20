import axiosInstance from '../config/axios';

class ApiService {
  constructor(resource) {
    this.resource = resource;
  }

  // GET isteği
  async get(path = '', params = {}) {
    try {
      const response = await axiosInstance.get(`/${this.resource}${path}`, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // GET by ID
  async getById(id) {
    try {
      const response = await axiosInstance.get(`/${this.resource}/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // POST isteği
  async post(data, path = '') {
    try {
      const response = await axiosInstance.post(`/${this.resource}${path}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // PUT isteği
  async put(id, data) {
    try {
      const response = await axiosInstance.put(`/${this.resource}/${id}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Belirli bir alt path'e PUT isteği
  async putByPath(path = '', data = {}) {
    try {
      const response = await axiosInstance.put(`/${this.resource}${path}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // DELETE isteği
  async delete(id, params = {}) {
    try {
      const response = await axiosInstance.delete(`/${this.resource}/${id}`, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // FormData ile POST (dosya yükleme için)
  async postFormData(data, path = '') {
    try {
      const response = await axiosInstance.post(`/${this.resource}${path}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // FormData ile PUT (dosya guncelleme icin)
  async putFormData(id, data, path = '') {
    try {
      const response = await axiosInstance.put(`/${this.resource}/${id}${path}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Hata yönetimi
  handleError(error) {
    if (error.response) {
      return {
        status: error.response.status,
        message: error.response.data.message || 'Bir hata oluştu',
        errors: error.response.data.errors
      };
    }
    return {
      status: 500,
      message: 'Sunucuya bağlanılamadı'
    };
  }
}

export default ApiService;