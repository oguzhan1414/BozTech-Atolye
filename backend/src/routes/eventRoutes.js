const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getAllEventsAdmin
} = require('../controllers/eventController');
const { protect, authorize, checkPermission } = require('../midleware/auth');

// Validasyon kuralları
const eventValidation = [
  body('title').notEmpty().withMessage('Başlık gereklidir').trim(),
  body('description').notEmpty().withMessage('Açıklama gereklidir'),
  body('date').isISO8601().withMessage('Geçerli bir tarih girin'),
  body('time').notEmpty().withMessage('Saat gereklidir'),
  body('location').notEmpty().withMessage('Konum gereklidir'),
  body('category').isIn(['Konferans', 'Workshop', 'Meetup', 'Seminer', 'Sosyal'])
    .withMessage('Geçerli bir kategori seçin')
];

// Public routes
router.get('/', getEvents);
router.get('/:id', getEventById);

// Admin routes
router.get('/admin/all', protect, checkPermission('events'), getAllEventsAdmin);

// Private routes
router.post('/', 
  protect, 
  checkPermission('events'), 
  eventValidation, 
  createEvent
);

router.put('/:id', 
  protect, 
  checkPermission('events'), 
  eventValidation, 
  updateEvent
);

router.delete('/:id', 
  protect, 
  checkPermission('events'), 
  deleteEvent
);

module.exports = router;