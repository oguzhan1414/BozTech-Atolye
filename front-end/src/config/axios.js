import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Axios instance oluştur
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 saniye timeout
});

// Request interceptor - Her isteğe token ekle
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Debug için (opsiyonel)
    console.log(`🚀 ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Hata yönetimi
axiosInstance.interceptors.response.use(
  (response) => {
    // Başarılı response
    console.log('✅ Response:', response.status);
    return response;
  },
  (error) => {
    // Hata yönetimi
    if (error.response) {
      // Sunucu cevap verdi ama hata kodu döndü
      console.error('❌ Hata:', error.response.status, error.response.data);
      
      switch (error.response.status) {
        case 401:
          // Yetkisiz - token geçersiz veya yok
          console.log('⛔ Yetkisiz erişim, login sayfasına yönlendiriliyor...');
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userName');
          window.location.href = '/admin';
          break;
          
        case 403:
          // Yasak - yetki yok
          console.log('🚫 Bu işlem için yetkiniz yok');
          // İstersen toast message göster
          break;
          
        case 404:
          console.log('🔍 İstek yapılan kaynak bulunamadı');
          break;
          
        case 500:
          console.log('💥 Sunucu hatası');
          break;
          
        default:
          console.log('⚠️ Bilinmeyen hata');
      }
    } else if (error.request) {
      // İstek yapıldı ama cevap alınamadı
      console.error('❌ Sunucuya ulaşılamıyor:', error.request);
    } else {
      // İstek oluşturulurken hata oldu
      console.error('❌ İstek hatası:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;