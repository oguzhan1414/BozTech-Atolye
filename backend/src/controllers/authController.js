const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

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
      return res.status(400).json({ 
        success: false, 
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
        lastLogin: user.lastLogin
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
        permissions: req.user.permissions
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
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { name, email, password, permissions, role, isActive } = req.body;

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
      password,
      role: role || 'editor',
      isActive: isActive !== undefined ? isActive : true,
      permissions: permissions || {
        announcements: false,
        events: false,
        applications: false,
        photos: false,
        users: false
      }
    });

    res.status(201).json({
      success: true,
      message: 'Editör başarıyla oluşturuldu',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions
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
    const { currentPassword, newPassword } = req.body;
    
    // Kullanıcıyı bul (şifreyle birlikte)
    const user = await User.findById(req.user._id).select('+password');
    
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