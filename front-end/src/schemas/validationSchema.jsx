
import * as Yup from 'yup';

  // 1. Doğrulama Şeması (Yup) - Yetenekler kısmını da ekledik
  const validationSchema = Yup.object({
    firstName: Yup.string().min(2, 'Çok kısa!').required('Ad zorunludur'),
    lastName: Yup.string().min(2, 'Çok kısa!').required('Soyad zorunludur'),
    studentNumber: Yup.string()
      .matches(/^[0-9]+$/, "Sadece rakam giriniz")
      .min(9, 'Öğrenci numarası en az 9 hane olmalı')
      .required('Öğrenci no zorunludur'),
    faculty: Yup.string().required('Fakülte seçimi zorunludur'),
    email: Yup.string().email('Geçersiz e-posta formatı').required('E-posta zorunludur'),
    phone: Yup.string().min(10, 'Geçersiz telefon numarası').required('Telefon zorunludur'),
    grade: Yup.string().required('Sınıf seçimi zorunludur'),
    motivation: Yup.string().min(20, 'Lütfen biraz daha detay verin (min. 20 karakter)').required('Bu alan zorunludur'),
    experience: Yup.string().min(10, 'Lütfen varsa projelerinden kısaca bahset').required('Bu alan zorunludur'),
  });

  export default validationSchema;