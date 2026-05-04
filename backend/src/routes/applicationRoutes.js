const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplicationStatus,
  addApplicationNote,
  exportToExcel,
  exportToCSV,
  getApplicationStats,
  getMyApplications,
  sendCustomEmail,
  deleteApplication
} = require('../controllers/applicationController');
const { protect, authorize, checkPermission } = require('../midleware/auth');

// Validasyon kuralları
const applicationValidation = [
  body('firstName').notEmpty().withMessage('İsim gereklidir').trim(),
  body('lastName').notEmpty().withMessage('Soyisim gereklidir').trim(),
  body('email').isEmail().withMessage('Geçerli bir e-posta adresi girin'),
  body('phone').notEmpty().withMessage('Telefon numarası gereklidir'),
  body('studentNumber').notEmpty().withMessage('Öğrenci numarası gereklidir'),
  body('faculty').notEmpty().withMessage('Fakülte gereklidir'),
  body('department').notEmpty().withMessage('Bölüm gereklidir'),
  body('grade').isIn(['1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf', 'Yüksek Lisans', 'Doktora'])
    .withMessage('Geçerli bir sınıf seçin'),
  body('motivation').notEmpty().withMessage('Motivasyon metni gereklidir')
    .isLength({ max: 1000 }).withMessage('Motivasyon metni en fazla 1000 karakter olabilir')
];

// Public routes
router.post('/', applicationValidation, createApplication);
router.get('/my-applications', getMyApplications);

// Admin/Editor routes
router.get('/', protect, checkPermission('applications'), getApplications);
router.get('/stats', protect, checkPermission('applications'), getApplicationStats);
router.get('/export/excel', protect, checkPermission('applications'), exportToExcel);
router.get('/export/csv', protect, checkPermission('applications'), exportToCSV);
router.get('/:id', protect, checkPermission('applications'), getApplicationById);
router.put('/:id/status', protect, checkPermission('applications'), updateApplicationStatus);
router.post('/:id/notes', protect, checkPermission('applications'), addApplicationNote);
router.post('/:id/send-email', protect, checkPermission('applications'), sendCustomEmail);
router.delete('/:id', protect, authorize('admin'), deleteApplication);

module.exports = router;