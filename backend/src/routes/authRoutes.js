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
  body('password').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalı')
];

// Public routes
router.post('/login', loginValidation, login);

// Private routes
router.get('/verify', protect, verifyToken);
router.put('/change-password', protect, changePassword);

// Admin only routes
router.post('/register', protect, authorize('admin'), registerValidation, registerEditor);

module.exports = router;