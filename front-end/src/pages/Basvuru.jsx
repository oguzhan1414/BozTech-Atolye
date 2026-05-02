import React, { useState } from 'react';
import { useFormik } from 'formik';
import { Helmet } from 'react-helmet-async';

import { FiUser, FiMail, FiPhone, FiCalendar, FiFileText, FiBookOpen, FiStar } from 'react-icons/fi';
import '../styles/basvuru.css';
import validationSchema from '../schemas/validationSchema';
import { applicationService } from '../services/applicationService';

function ApplicationPage() {
  const [isSuccess, setIsSuccess] = useState(false);

  // 2. Formik Kurulumu
  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      studentNumber: '',
      faculty: '',
      email: '',
      phone: '',
      department: 'Bilgisayar Mühendisliği', // Okuduğun bölüm bilgisini sabitledik
      grade: '',
      motivation: '',
      experience: '', // Geri geldi!
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const response = await applicationService.create(values);
        if (response.success) {
          setIsSuccess(true);
          resetForm();
        } else {
          alert('Başvuru sırasında bir hata oluştu: ' + (response.message || 'Lütfen bilgilerinizi kontrol ediniz.'));
        }
      } catch (error) {
        alert('Sunucu hatası: Bağlantı kurulamadı veya kayıt zaten var.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  if (isSuccess) {
    return (
      <div className="application-page" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="container">
          <div className="success-container fade-in" style={{ background: '#1e293b', padding: '60px 40px', borderRadius: '24px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', border: '1px solid #334155', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ width: '80px', height: '80px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#10b981' }}>
               <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="40" height="40"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h2 style={{ color: '#f8fafc', fontSize: '28px', marginBottom: '16px', fontWeight: 'bold' }}>Başvurunuz Alındı!</h2>
            <p style={{ color: '#94a3b8', fontSize: '16px', lineHeight: '1.6', marginBottom: '32px' }}>
              Başvurunuz başarıyla sistemimize kaydedilmiştir. Değerlendirme süreci tamamlandıktan sonra iletişim bilgileriniz üzerinden en kısa sürede size olumlu veya olumsuz geri dönüş yapılacaktır. BozTech'e gösterdiğiniz ilgi için teşekkür ederiz!
            </p>
            <button className="btn btn-primary" onClick={() => window.location.href = '/'} style={{ padding: '12px 30px', fontSize: '16px' }}>
              Ana Sayfaya Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <Helmet>
      <title>Başvuru | BozTech</title>
      <meta name="description" content="BozTech R&D topluluğuna katılmak için başvurun. Yozgat Bozok Üniversitesi teknoloji topluluğunun bir parçası olun." />
      <link rel="canonical" href="https://boztech.com.tr/apply" />
    </Helmet>
    <div className="application-page">
      <div className="bubbles-container">
        {[...Array(6)].map((_, i) => <div key={i} className="bubble"></div>)}
      </div>

      <div className="container">
        <div className="app-header fade-in">
          <h1>BozTech'e Katıl</h1>
          <p className="text-muted">Formu doldur, başvurunu değerlendirelim.</p>
        </div>

        <div className="application-form-container fade-in">
          <form className="application-form" onSubmit={formik.handleSubmit}>
            
            {/* KİŞİSEL BİLGİLER */}
            <div className="form-section">
              <h3><FiUser /> Kişisel Bilgiler</h3>
              <div className="grid grid-2">
                <div className="form-group">
                  <label htmlFor="firstName">Ad</label>
                  <input type="text" id="firstName" {...formik.getFieldProps('firstName')} />
                  {formik.touched.firstName && formik.errors.firstName && <span className="error-text">{formik.errors.firstName}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Soyad</label>
                  <input type="text" id="lastName" {...formik.getFieldProps('lastName')} />
                  {formik.touched.lastName && formik.errors.lastName && <span className="error-text">{formik.errors.lastName}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="studentNumber">Öğrenci No</label>
                  <input type="text" id="studentNumber" {...formik.getFieldProps('studentNumber')} />
                  {formik.touched.studentNumber && formik.errors.studentNumber && <span className="error-text">{formik.errors.studentNumber}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="faculty">Fakülte</label>
                  <select id="faculty" {...formik.getFieldProps('faculty')}>
                    <option value="">Seçiniz</option>
                    <option value="Mühendislik Mimarlık Fakültesi">Mühendislik Mimarlık Fakültesi</option>
                    <option value="Fen Edebiyat Fakültesi">Fen Edebiyat Fakültesi</option>
                    <option value="İktisadi ve İdari Bilimler Fakültesi">İktisadi ve İdari Bilimler Fakültesi</option>
                    <option value="Tıp Fakültesi">Tıp Fakültesi</option>
                    <option value="Eğitim Fakültesi">Eğitim Fakültesi</option>
                    <option value="Diğer">Diğer</option>
                  </select>
                  {formik.touched.faculty && formik.errors.faculty && <span className="error-text">{formik.errors.faculty}</span>}
                </div>
              </div>
            </div>

            {/* İLETİŞİM & AKADEMİK */}
            <div className="form-section">
              <h3><FiMail /> İletişim & Akademik</h3>
              <div className="grid grid-2">
                <div className="form-group">
                  <label htmlFor="email">E-posta</label>
                  <input type="email" id="email" {...formik.getFieldProps('email')} />
                  {formik.touched.email && formik.errors.email && <span className="error-text">{formik.errors.email}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Telefon</label>
                  <input type="tel" id="phone" {...formik.getFieldProps('phone')} />
                  {formik.touched.phone && formik.errors.phone && <span className="error-text">{formik.errors.phone}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="grade">Sınıf</label>
                  <select id="grade" {...formik.getFieldProps('grade')}>
                    <option value="">Seçiniz</option>
                    <option value="1. Sınıf">1. Sınıf</option>
                    <option value="2. Sınıf">2. Sınıf</option>
                    <option value="3. Sınıf">3. Sınıf</option>
                    <option value="4. Sınıf">4. Sınıf</option>
                    <option value="Yüksek Lisans">Yüksek Lisans</option>
                    <option value="Doktora">Doktora</option>
                  </select>
                  {formik.touched.grade && formik.errors.grade && <span className="error-text">{formik.errors.grade}</span>}
                </div>
              </div>
            </div>

            {/* YETENEKLER & MOTİVASYON - EKSİKSİZ HALİ */}
            <div className="form-section">
              <h3><FiStar /> Yetenekler & Motivasyon</h3>
              <div className="form-group mb-4">
                <label htmlFor="motivation"><FiFileText /> Neden BozTech Atölye?</label>
                <textarea id="motivation" rows="3" {...formik.getFieldProps('motivation')} placeholder="Hayallerinden ve hedeflerinden bahset..."></textarea>
                {formik.touched.motivation && formik.errors.motivation && <span className="error-text">{formik.errors.motivation}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="experience"><FiBookOpen /> Teknik Deneyimlerin & Projelerin</label>
                <textarea id="experience" rows="3" {...formik.getFieldProps('experience')} placeholder="Python, Kotlin veya Arduino projelerinden bahset..."></textarea>
                {formik.touched.experience && formik.errors.experience && <span className="error-text">{formik.errors.experience}</span>}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary btn-submit" disabled={formik.isSubmitting}>
                {formik.isSubmitting ? 'Gönderiliyor...' : 'Başvuruyu Tamamla'}
              </button>
              <button type="button" className="btn btn-outline btn-reset" onClick={formik.handleReset}>Temizle</button>
            </div>
          </form>
        </div>
      </div>
    </div>
    </>
  );
}

export default ApplicationPage;