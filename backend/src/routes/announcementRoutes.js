const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getAllAnnouncementsAdmin
} = require('../controllers/announcementController');

// Klasör ismini 'middleware' olarak düzelttiysen böyle kalsın, 
// yoksa '../midleware/auth' yapmayı unutma!
const { protect, authorize, checkPermission } = require('../midleware/auth');

// Validasyon kuralları (Modeldeki enumlar ile eşitledik)
const announcementValidation = [
  body('type').isIn(['Teknik', 'Genel']).withMessage('Geçerli bir duyuru tipi seçin'),
  body('title').notEmpty().withMessage('Başlık gereklidir').trim().isLength({ max: 100 }),
  body('description').notEmpty().withMessage('Açıklama gereklidir')
];

// Public routes
router.get('/', getAnnouncements);
router.get('/:id', getAnnouncementById);

// Admin only routes
router.get('/admin/all', protect, checkPermission('announcements'), getAllAnnouncementsAdmin);

// Private/Permission routes
router.post('/', 
  protect, 
  checkPermission('announcements'), 
  announcementValidation, 
  createAnnouncement
);

router.put('/:id', 
  protect, 
  checkPermission('announcements'), 
  announcementValidation, 
  updateAnnouncement
);

router.delete('/:id', 
  protect, 
  checkPermission('announcements'), 
  deleteAnnouncement
);

module.exports = router;