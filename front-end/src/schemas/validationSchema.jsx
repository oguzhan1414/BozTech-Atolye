import * as Yup from 'yup';

const validationSchema = Yup.object({
  firstName:     Yup.string().min(2, 'Çok kısa!').required('Ad zorunludur'),
  lastName:      Yup.string().min(2, 'Çok kısa!').required('Soyad zorunludur'),
  studentNumber: Yup.string()
    .matches(/^[0-9]+$/, 'Sadece rakam giriniz')
    .min(9, 'Öğrenci numarası en az 9 hane olmalı')
    .required('Öğrenci no zorunludur'),
  department:    Yup.string().required('Bölüm seçimi zorunludur'),
  email:         Yup.string().email('Geçersiz e-posta formatı').required('E-posta zorunludur'),
  phone:         Yup.string()
    .test('len', 'Geçerli bir telefon numarası giriniz (10 hane)', val => {
      const digits = (val || '').replace(/\D/g, '');
      return digits.length === 10;
    })
    .required('Telefon zorunludur'),
  grade:         Yup.string().required('Sınıf seçimi zorunludur'),
  motivation:    Yup.string().min(20, 'Lütfen biraz daha detay verin (min. 20 karakter)').required('Bu alan zorunludur'),
  experience:    Yup.string().min(10, 'Lütfen varsa projelerinden kısaca bahset').required('Bu alan zorunludur'),
  kvkkConsent:   Yup.bool().oneOf([true], 'Devam etmek için KVKK metnini okuyup onaylamanız zorunludur.'),
});

export default validationSchema;
