const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { 
  login, 
  verifyToken, 
  registerEditor, 
  changePassword 
} = require('../controllers/authController');
const { protect, authorize } = require('../midleware/auth'); // authMiddleware DEĞİL, auth!

// Validasyon kuralları
const loginValidation = [
  body('email').isEmail().withMessage('Geçerli bir email adresi girin'),
  body('password').notEmpty().withMessage('Şifre boş olamaz')
];

const registerValidation = [
  body('name').notEmpty().withMessage('İsim gereklidir'),
  body('email').isEmail().withMessage('Geçerli bir email adresi girin'),
  body('role').optional().isIn(['admin', 'editor']).withMessage('Rol admin veya editor olmalidir')
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Mevcut sifre bos olamaz'),
  body('newPassword').isLength({ min: 6 }).withMessage('Yeni sifre en az 6 karakter olmali')
];

// Public routes
router.post('/login', loginValidation, login);

// Private routes
router.get('/verify', protect, verifyToken);
router.put('/change-password', protect, changePasswordValidation, changePassword);

// Admin only routes
router.post('/register', protect, authorize('admin'), registerValidation, registerEditor);

module.exports = router;