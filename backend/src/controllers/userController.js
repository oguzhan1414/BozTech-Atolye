const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Tüm kullanıcıları getir
// @route   GET /api/users
// @access  Private (Admin/Users yetkisine sahip olanlar)
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Kullanıcılar getirilirken hata:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
};

// @desc    Kullanıcı güncelle
// @route   PUT /api/users/:id
// @access  Private (Admin)
const updateUser = async (req, res) => {
  try {
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
    }

    // Email değiştiriliyorsa çakışma kontrolü
    if (req.body.email && req.body.email !== user.email) {
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Bu email adresi zaten kullanımda' });
      }
    }

    // Update data
    const { name, email, role, isActive, permissions, password } = req.body;
    
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (permissions) user.permissions = permissions;

    // Şifre güncellenmek istiyorsa
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'Sifre en az 6 karakter olmali' });
      }
      user.password = password;
      user.mustChangePassword = true;
    }

    await user.save(); // pre-save hook will hash password if changed

    const updatedUser = user.toObject();
    delete updatedUser.password;

    res.json({
      success: true,
      message: 'Kullanıcı başarıyla güncellendi',
      data: updatedUser
    });
  } catch (error) {
    console.error('Kullanıcı güncellenirken hata:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
};

// @desc    Kullanıcı sil
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
    }

    // Son admin silinemez
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ success: false, message: 'Son admin kullanıcısı silinemez' });
      }
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Kullanıcı başarıyla silindi'
    });
  } catch (error) {
    console.error('Kullanıcı silinirken hata:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
};

// @desc    Giris yapan kullanicinin profilini guncelle
// @route   PUT /api/users/me
// @access  Private
const updateMyProfile = async (req, res) => {
  try {
    const { name } = req.body;

    const normalizedName = String(name || '').trim();
    if (!normalizedName) {
      return res.status(400).json({ success: false, message: 'Ad alani bos birakilamaz' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Kullanici bulunamadi' });
    }

    user.name = normalizedName;
    await user.save();

    res.json({
      success: true,
      message: 'Profil bilgisi guncellendi',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      },
    });
  } catch (error) {
    console.error('Profil guncellenirken hata:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatasi' });
  }
};

module.exports = {
  getUsers,
  updateUser,
  deleteUser,
  updateMyProfile
};
