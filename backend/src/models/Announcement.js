const mongoose = require('mongoose');

const normalizeAnnouncementType = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'teknik' || normalized === 'tekniklik') {
    return 'Teknik';
  }
  return 'Genel';
};

const announcementSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Teknik', 'Genel'],
    set: normalizeAnnouncementType,
    required: [true, 'Duyuru türü seçilmelidir']
  },
  title: {
    type: String,
    required: [true, 'Duyuru başlığı gereklidir'],
    trim: true,
    maxlength: [100, 'Başlık 100 karakterden uzun olamaz']
  },
  description: {
    type: String, // Rich Text Editor'den gelecek HTML'i saklar
    required: [true, 'Duyuru içeriği gereklidir']
  },
  image: {
    type: String, // Duyuru için görsel URL'i (opsiyonel ama tavsiye ederim)
    default: null
  },
  date: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);