const Event = require('../models/Event');
const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');
const { buildUploadUrl, resolveUploadUrl } = require('../utils/publicAssetUrl');
const {
  isCloudinaryEnabled,
  uploadImage,
  deleteImage,
  extractPublicIdFromCloudinaryUrl,
} = require('../utils/mediaStorage');

const safeDeleteLocalFile = (filePath) => {
  if (!filePath) return;
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.warn('Yerel etkinlik gorseli silinemedi:', filePath, error.message);
  }
};

const parseParticipants = (value, fallback = 0) => {
  if (value === undefined || value === null || value === '') return fallback;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 0) return fallback;
  return parsed;
};

const serializeEvent = (req, event) => {
  const plainEvent = event.toObject ? event.toObject() : event;
  return {
    ...plainEvent,
    image: resolveUploadUrl(req, plainEvent.image, plainEvent.imageKey, 'photos')
  };
};

// @desc    Tüm etkinlikleri getir (aktif olanlar)
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
  try {
    const { type } = req.query; // upcoming veya past filtrelemesi için
    
    let filter = { isActive: true };
    const now = new Date();
    
    if (type === 'upcoming') {
      filter.date = { $gte: now };
    } else if (type === 'past') {
      filter.date = { $lt: now };
    }

    const events = await Event.find(filter)
      .sort({ date: type === 'upcoming' ? 1 : -1 })
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      count: events.length,
      data: events.map((event) => serializeEvent(req, event))
    });
  } catch (error) {
    console.error('Etkinlikler getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
};

// @desc    Tek bir etkinliği getir
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Etkinlik bulunamadı'
      });
    }

    res.json({
      success: true,
      data: serializeEvent(req, event)
    });
  } catch (error) {
    console.error('Etkinlik getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
};

// @desc    Yeni etkinlik ekle
// @route   POST /api/events
// @access  Private (Admin/Editor)
const createEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { title, description, date, time, location, category, participants } = req.body;

    const eventDate = new Date(date);
    let image = '';
    let imageKey = '';

    if (req.file) {
      if (isCloudinaryEnabled()) {
        const uploaded = await uploadImage(req.file.path, 'boztech/events');
        image = uploaded.url;
        imageKey = uploaded.key;
        safeDeleteLocalFile(req.file.path);
      } else {
        image = buildUploadUrl(req, req.file.filename, 'photos');
        imageKey = req.file.filename;
      }
    }

    const event = await Event.create({
      title,
      description,
      date: eventDate,
      time,
      location,
      category,
      participants: parseParticipants(participants, 0),
      image,
      imageKey,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Etkinlik başarıyla oluşturuldu',
      data: serializeEvent(req, event)
    });
  } catch (error) {
    if (req.file) {
      safeDeleteLocalFile(req.file.path);
    }
    console.error('Etkinlik oluşturulurken hata:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Sunucu hatası'
    });
  }
};

// @desc    Etkinlik güncelle
// @route   PUT /api/events/:id
// @access  Private (Admin/Editor)
const updateEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Etkinlik bulunamadı'
      });
    }

    // Yetki kontrolü
    if (req.user.role !== 'admin' && event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bu etkinliği düzenleme yetkiniz yok'
      });
    }

    // type alanının backend veritabanına eklenmesine gerek yok, sanal alan (virtual) olarak hesaplanıyor
    if (req.body.type) {
      delete req.body.type;
    }

    const previousImage = {
      image: event.image,
      imageKey: event.imageKey
    };

    const updateData = { ...req.body };
    updateData.participants = parseParticipants(req.body.participants, event.participants || 0);

    if (req.file) {
      if (isCloudinaryEnabled()) {
        const uploaded = await uploadImage(req.file.path, 'boztech/events');
        updateData.image = uploaded.url;
        updateData.imageKey = uploaded.key;
        safeDeleteLocalFile(req.file.path);
      } else {
        updateData.image = buildUploadUrl(req, req.file.filename, 'photos');
        updateData.imageKey = req.file.filename;
      }
    }

    event = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (req.file) {
      const oldIsCloud = typeof previousImage.image === 'string' && previousImage.image.includes('res.cloudinary.com');
      const oldKey = previousImage.imageKey || extractPublicIdFromCloudinaryUrl(previousImage.image);

      if (oldIsCloud && isCloudinaryEnabled()) {
        if (oldKey && oldKey !== event.imageKey) {
          await deleteImage(oldKey);
        }
      } else if (oldKey && oldKey !== event.imageKey) {
        const oldPath = path.join(__dirname, '../../uploads/photos/', oldKey);
        safeDeleteLocalFile(oldPath);
      }
    }

    res.json({
      success: true,
      message: 'Etkinlik başarıyla güncellendi',
      data: serializeEvent(req, event)
    });
  } catch (error) {
    if (req.file) {
      safeDeleteLocalFile(req.file.path);
    }
    console.error('Etkinlik güncellenirken hata:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Sunucu hatası'
    });
  }
};

// @desc    Etkinlik sil (kalıcı)
// @route   DELETE /api/events/:id
// @access  Private (Admin/Editor)
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Etkinlik bulunamadı'
      });
    }

    // Yetki kontrolü
    if (req.user.role !== 'admin' && event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bu etkinliği silme yetkiniz yok'
      });
    }

    const isCloudImage = typeof event.image === 'string' && event.image.includes('res.cloudinary.com');
    const imageKey = event.imageKey || extractPublicIdFromCloudinaryUrl(event.image);

    if (isCloudImage && isCloudinaryEnabled()) {
      if (imageKey) {
        await deleteImage(imageKey);
      }
    } else if (imageKey) {
      const filePath = path.join(__dirname, '../../uploads/photos/', imageKey);
      safeDeleteLocalFile(filePath);
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Etkinlik kalıcı olarak silindi'
    });
  } catch (error) {
    console.error('Etkinlik silinirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
};

// @desc    Admin için tüm etkinlikler (aktif/pasif)
// @route   GET /api/events/admin/all
// @access  Private (Admin)
const getAllEventsAdmin = async (req, res) => {
  try {
    const events = await Event.find({})
      .sort({ date: -1 })
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      count: events.length,
      data: events.map((event) => serializeEvent(req, event))
    });
  } catch (error) {
    console.error('Etkinlikler getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getAllEventsAdmin
};