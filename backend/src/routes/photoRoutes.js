const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const upload = require('../midleware/upload');
const {
  getPhotos,
  getPhotoById,
  uploadPhoto,
  updatePhoto,
  deletePhoto,
  getAllPhotosAdmin,
  getPhotosByCategory
} = require('../controllers/photoController');
const { protect, authorize, checkPermission } = require('../midleware/auth');

// Validasyon kuralları
const photoValidation = [
  body('title').notEmpty().withMessage('Başlık gereklidir').trim(),
  body('category').isIn(['Teknik', 'Eğitim', 'Sosyal', 'Kamp', 'Proje', 'Hackathon', 'Workshop', 'Genel'])
    .withMessage('Geçerli bir kategori seçin')
];

// Public routes
router.get('/', getPhotos);
router.get('/by-category', getPhotosByCategory);
router.get('/:id', getPhotoById);

// Admin routes
router.get('/admin/all', protect, checkPermission('photos'), getAllPhotosAdmin);

// Private routes (giriş gerektirir)
router.post('/',
  protect,
  checkPermission('photos'),
  upload.single('photo'),
  photoValidation,
  uploadPhoto
);

router.put('/:id',
  protect,
  checkPermission('photos'),
  photoValidation,
  updatePhoto
);

router.delete('/:id',
  protect,
  checkPermission('photos'),
  deletePhoto
);

module.exports = router;