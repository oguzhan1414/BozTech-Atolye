const Event = require('../models/Event');
const { validationResult } = require('express-validator');

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
      data: events
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
      data: event
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

    const { title, description, date, time, location, category } = req.body;

    const eventDate = new Date(date);

    const event = await Event.create({
      title,
      description,
      date: eventDate,
      time,
      location,
      category,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Etkinlik başarıyla oluşturuldu',
      data: event
    });
  } catch (error) {
    console.error('Etkinlik oluşturulurken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
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

    event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Etkinlik başarıyla güncellendi',
      data: event
    });
  } catch (error) {
    console.error('Etkinlik güncellenirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
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
      data: events
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