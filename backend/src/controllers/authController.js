const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');

const TEMP_PASSWORD_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';

const generateTemporaryPassword = (length = 12) => {
  const bytes = crypto.randomBytes(length);
  let password = '';

  for (let index = 0; index < length; index += 1) {
    password += TEMP_PASSWORD_CHARS[bytes[index] % TEMP_PASSWORD_CHARS.length];
  }

  return password;
};

// Token oluştur
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// @desc    Admin girişi
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    // Validasyon hatalarını kontrol et
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0];
      return res.status(400).json({ 
        success: false, 
        message: firstError?.msg || 'Gecerli veri giriniz',
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Email ile kullanıcıyı bul
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email veya şifre hatalı' 
      });
    }

    // Şifre kontrolü
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email veya şifre hatalı' 
      });
    }

    // Son giriş tarihini güncelle
    await user.updateLastLogin();

    // Token oluştur
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        lastLogin: user.lastLogin,
        mustChangePassword: Boolean(user.mustChangePassword)
      }
    });

  } catch (error) {
    console.error('Login hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Sunucu hatası' 
    });
  }
};

// @desc    Token doğrulama
// @route   GET /api/auth/verify
// @access  Private
const verifyToken = async (req, res) => {
  try {
    // req.user middleware'den geliyor (protect)
    res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        permissions: req.user.permissions,
        mustChangePassword: Boolean(req.user.mustChangePassword)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Sunucu hatası' 
    });
  }
};

// @desc    Yeni editör ekle (sadece admin)
// @route   POST /api/auth/register
// @access  Private/Admin
const registerEditor = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0];
      return res.status(400).json({ 
        success: false, 
        message: firstError?.msg || 'Gecerli veri giriniz',
        errors: errors.array() 
      });
    }

    const { name, email, permissions, role, isActive } = req.body;
    const temporaryPassword = generateTemporaryPassword(12);

    // Email var mı kontrol et
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bu email adresi zaten kayıtlı' 
      });
    }

    // Yeni editör oluştur
    const user = await User.create({
      name,
      email,
      password: temporaryPassword,
      role: role || 'editor',
      isActive: isActive !== undefined ? isActive : true,
      mustChangePassword: true,
      permissions: permissions || {
        announcements: false,
        events: false,
        applications: false,
        photos: false,
        clubInfo: false,
        users: false
      }
    });

    res.status(201).json({
      success: true,
      message: 'Editör başarıyla oluşturuldu',
      temporaryPassword,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        mustChangePassword: true
      }
    });

  } catch (error) {
    console.error('Kayıt hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Sunucu hatası' 
    });
  }
};

// @desc    Şifre değiştir
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0];
      return res.status(400).json({
        success: false,
        message: firstError?.msg || 'Gecerli veri giriniz',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Yeni sifre mevcut sifre ile ayni olamaz'
      });
    }
    
    // Kullanıcıyı bul (şifreyle birlikte)
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanici bulunamadi'
      });
    }
    
    // Mevcut şifreyi kontrol et
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Mevcut şifre hatalı' 
      });
    }

    // Yeni şifreyi set et
    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();

    res.json({ 
      success: true, 
      message: 'Şifre başarıyla değiştirildi' 
    });

  } catch (error) {
    console.error('Şifre değiştirme hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Sunucu hatası' 
    });
  }
};

module.exports = {
  login,
  verifyToken,
  registerEditor,
  changePassword
};