const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Fotoğraf başlığı gereklidir'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['Teknik', 'Eğitim', 'Sosyal', 'Kamp', 'Proje', 'Workshop', 'Genel'],
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  imageKey: {
    type: String,
    required: true  // Dosya adı (silme/güncelleme için)
  },
  imageSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Photo', photoSchema);