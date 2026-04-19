const Announcement = require('../models/Announcement');
const { validationResult } = require('express-validator');

const normalizeAnnouncementType = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'teknik' || normalized === 'tekniklik') {
    return 'Teknik';
  }
  return 'Genel';
};

const normalizeAnnouncementResponse = (announcement) => {
  const plainAnnouncement = announcement.toObject ? announcement.toObject() : announcement;
  return {
    ...plainAnnouncement,
    type: normalizeAnnouncementType(plainAnnouncement.type)
  };
};

// @desc    Tüm duyuruları getir
// @route   GET /api/announcements
// @access  Public
const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({ isActive: true })
      .sort({ date: -1 })
      .populate('createdBy', 'name email');
    
    res.json({
      success: true,
      count: announcements.length,
      data: announcements.map(normalizeAnnouncementResponse)
    });
  } catch (error) {
    console.error('Duyurular getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
};

// @desc    Tek bir duyuruyu getir
// @route   GET /api/announcements/:id
// @access  Public
const getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Duyuru bulunamadı'
      });
    }

    res.json({
      success: true,
      data: normalizeAnnouncementResponse(announcement)
    });
  } catch (error) {
    console.error('Duyuru getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
};

// @desc    Yeni duyuru ekle
// @route   POST /api/announcements
// @access  Private (Admin/Editor)
const createAnnouncement = async (req, res) => {
  try {
    // Validasyon hatalarını kontrol et
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { type, title, description } = req.body;

    const announcement = await Announcement.create({
      type: normalizeAnnouncementType(type),
      title,
      description,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Duyuru başarıyla oluşturuldu',
      data: normalizeAnnouncementResponse(announcement)
    });
  } catch (error) {
    console.error('Duyuru oluşturulurken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
};

// @desc    Duyuru güncelle
// @route   PUT /api/announcements/:id
// @access  Private (Admin/Editor)
const updateAnnouncement = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    let announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Duyuru bulunamadı'
      });
    }

    // Yetki kontrolü (sadece admin veya duyuruyu oluşturan editör)
    if (req.user.role !== 'admin' && announcement.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bu duyuruyu düzenleme yetkiniz yok'
      });
    }

    const updateData = {
      ...req.body,
      type: normalizeAnnouncementType(req.body.type)
    };

    announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Duyuru başarıyla güncellendi',
      data: normalizeAnnouncementResponse(announcement)
    });
  } catch (error) {
    console.error('Duyuru güncellenirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
};

// @desc    Duyuru sil (kalıcı)
// @route   DELETE /api/announcements/:id
// @access  Private (Admin/Editor)
const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Duyuru bulunamadı'
      });
    }

    // Yetki kontrolü
    if (req.user.role !== 'admin' && announcement.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bu duyuruyu silme yetkiniz yok'
      });
    }

    await Announcement.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Duyuru kalıcı olarak silindi'
    });
  } catch (error) {
    console.error('Duyuru silinirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
};

// @desc    Admin için tüm duyurular (aktif/pasif)
// @route   GET /api/announcements/admin/all
// @access  Private (Admin)
const getAllAnnouncementsAdmin = async (req, res) => {
  try {
    const announcements = await Announcement.find({})
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      count: announcements.length,
      data: announcements.map(normalizeAnnouncementResponse)
    });
  } catch (error) {
    console.error('Duyurular getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
};

module.exports = {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getAllAnnouncementsAdmin
};