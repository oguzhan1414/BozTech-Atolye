const Photo = require('../models/Photo');
const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');
const { buildUploadUrl, resolveUploadUrl } = require('../utils/publicAssetUrl');

const serializePhoto = (req, photo) => {
  const plainPhoto = photo.toObject ? photo.toObject() : photo;
  return {
    ...plainPhoto,
    imageUrl: resolveUploadUrl(req, plainPhoto.imageUrl, plainPhoto.imageKey, 'photos')
  };
};

// @desc    Tüm fotoğrafları getir
// @route   GET /api/photos
// @access  Public
const getPhotos = async (req, res) => {
  try {
    const { category, eventId, tag, limit } = req.query;
    
    let filter = { isActive: true };
    if (category) filter.category = category;
    if (eventId) filter.eventId = eventId;
    if (tag) filter.tags = tag;

    let photoQuery = Photo.find(filter)
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'name')
      .populate('eventId', 'title');

    const parsedLimit = parseInt(limit, 10);
    if (!Number.isNaN(parsedLimit) && parsedLimit > 0) {
      photoQuery = photoQuery.limit(parsedLimit);
    }

    const photos = await photoQuery;

    res.json({
      success: true,
      count: photos.length,
      data: photos.map((photo) => serializePhoto(req, photo))
    });
  } catch (error) {
    console.error('Fotoğraflar getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
};

// @desc    Tek bir fotoğraf getir
// @route   GET /api/photos/:id
// @access  Public
const getPhotoById = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id)
      .populate('uploadedBy', 'name')
      .populate('eventId', 'title date');

    if (!photo || !photo.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Fotoğraf bulunamadı'
      });
    }

    res.json({
      success: true,
      data: serializePhoto(req, photo)
    });
  } catch (error) {
    console.error('Fotoğraf getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
};

// @desc    Yeni fotoğraf yükle
// @route   POST /api/photos
// @access  Private (Admin/Editor)
const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Lütfen bir fotoğraf seçin'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Yüklenen dosyayı sil
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { title, description, category, tags, eventId } = req.body;

    // URL oluştur
    const imageUrl = buildUploadUrl(req, req.file.filename, 'photos');

    const photo = await Photo.create({
      title,
      description,
      category,
      imageUrl,
      imageKey: req.file.filename,
      imageSize: req.file.size,
      mimeType: req.file.mimetype,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      eventId: eventId || null,
      uploadedBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Fotoğraf başarıyla yüklendi',
      data: serializePhoto(req, photo)
    });

  } catch (error) {
    // Hata olursa yüklenen dosyayı sil
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Fotoğraf yüklenirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
};

// @desc    Fotoğraf güncelle
// @route   PUT /api/photos/:id
// @access  Private (Admin/Editor)
const updatePhoto = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    let photo = await Photo.findById(req.params.id);

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Fotoğraf bulunamadı'
      });
    }

    // Yetki kontrolü
    if (req.user.role !== 'admin' && photo.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bu fotoğrafı düzenleme yetkiniz yok'
      });
    }

    const { title, description, category, tags, eventId } = req.body;

    photo.title = title || photo.title;
    photo.description = description !== undefined ? description : photo.description;
    photo.category = category || photo.category;
    photo.tags = tags ? tags.split(',').map(tag => tag.trim()) : photo.tags;
    photo.eventId = eventId || photo.eventId;

    await photo.save();

    res.json({
      success: true,
      message: 'Fotoğraf güncellendi',
      data: serializePhoto(req, photo)
    });

  } catch (error) {
    console.error('Fotoğraf güncellenirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
};

// @desc    Fotoğraf sil (kalıcı)
// @route   DELETE /api/photos/:id
// @access  Private (Admin/Editor)
const deletePhoto = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Fotoğraf bulunamadı'
      });
    }

    // Yetki kontrolü
    if (req.user.role !== 'admin' && photo.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bu fotoğrafı silme yetkiniz yok'
      });
    }

    const filePath = path.join(__dirname, '../../uploads/photos/', photo.imageKey);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Photo.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Fotoğraf kalıcı olarak silindi'
    });

  } catch (error) {
    console.error('Fotoğraf silinirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
};

// @desc    Admin için tüm fotoğraflar (arşiv dahil)
// @route   GET /api/photos/admin/all
// @access  Private (Admin)
const getAllPhotosAdmin = async (req, res) => {
  try {
    const photos = await Photo.find({})
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'name')
      .populate('eventId', 'title');

    const stats = {
      total: photos.length,
      active: photos.filter(p => p.isActive).length,
      archived: photos.filter(p => !p.isActive).length,
      byCategory: await Photo.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ])
    };

    res.json({
      success: true,
      stats,
      count: photos.length,
      data: photos.map((photo) => serializePhoto(req, photo))
    });

  } catch (error) {
    console.error('Fotoğraflar getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
};

// @desc    Kategoriye göre fotoğrafları grupla
// @route   GET /api/photos/by-category
// @access  Public
const getPhotosByCategory = async (req, res) => {
  try {
    const categories = await Photo.aggregate([
      { $match: { isActive: true } },
      { $group: {
          _id: '$category',
          count: { $sum: 1 },
          photos: { $push: '$$ROOT' }
      }},
      { $project: {
          category: '$_id',
          count: 1,
          photos: { $slice: ['$photos', 6] } // Her kategoriden 6 fotoğraf
      }},
      { $sort: { category: 1 } }
    ]);

    const normalizedCategories = categories.map((category) => ({
      ...category,
      photos: (category.photos || []).map((photo) => serializePhoto(req, photo))
    }));

    res.json({
      success: true,
      data: normalizedCategories
    });

  } catch (error) {
    console.error('Kategoriler getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
};

module.exports = {
  getPhotos,
  getPhotoById,
  uploadPhoto,
  updatePhoto,
  deletePhoto,
  getAllPhotosAdmin,
  getPhotosByCategory
};