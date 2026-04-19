import React, { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi';
import axiosInstance from '../config/axios';
import '../styles/contact.css'; // Yeni CSS dosyamızı import ettik

function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosInstance.post('/contact', formData);
      alert(res.data?.message || 'Mesajınız başarıyla iletildi! Ekibimiz en kısa sürede dönüş yapacaktır.');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      alert('Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container contact-page">
      <div className="contact-header">
        <h1>İletişime Geçin</h1>
        <p className="text-muted">Kulübümüz, projelerimiz veya üyelik hakkında sorularınız mı var? Buradayız.</p>
      </div>

      <div className="contact-grid">
        {/* Sol Taraf: Bilgiler */}
        <div className="contact-info-card">
          <h2>Bize Ulaşın</h2>
          <p className="mb-4 text-muted">Aşağıdaki kanallar üzerinden bizimle doğrudan iletişime geçebilirsiniz.</p>
          
          <div className="contact-details">
            <div className="contact-item">
              <div className="contact-icon-wrapper">
                <FiMapPin size={24} />
              </div>
              <div>
                <h4>Adres</h4>
                <p className="text-muted">Yozgat Bozok Üniversitesi, Bilgisayar Mühendisliği Bölümü Atölyesi</p>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon-wrapper">
                <FiMail size={24} />
              </div>
              <div>
                <h4>E-posta</h4>
                <p className="text-muted">boztechrd@gmail.com</p>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon-wrapper">
                <FiPhone size={24} />
              </div>
              <div>
                <h4>Telefon</h4>
                <p className="text-muted">+90 553 159 47 47</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sağ Taraf: Form */}
        <div className="contact-form-card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Ad Soyad</label>
              <input type="text" placeholder="Adınız Soyadınız" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            
            <div className="form-group">
              <label>E-posta</label>
              <input type="email" placeholder="oguzhan@boztech.com" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>

            <div className="form-group">
              <label>Mesajınız</label>
              <textarea rows="6" placeholder="Bize ne sormak istersiniz?" required value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})}></textarea>
            </div>

            <button type="submit" className="btn-send" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
              <FiSend /> {loading ? 'Gönderiliyor...' : 'Mesajı Gönder'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;