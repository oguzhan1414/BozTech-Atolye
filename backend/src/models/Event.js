const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Etkinlik başlığı gereklidir'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Etkinlik açıklaması gereklidir']
  },
  date: {
    type: Date, // Saat bilgisini de burada tutabilirsin
    required: [true, 'Etkinlik tarihi gereklidir']
  },
  time: {
    type: String,
    required: [true, 'Etkinlik saati gereklidir']
  },
  location: {
    type: String,
    required: [true, 'Etkinlik mekanı belirtilmelidir']
  },
  category: {
    type: String,
    enum: ['Konferans', 'Workshop', 'Meetup', 'Seminer', 'Sosyal'],
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  imageKey: {
    type: String,
    default: ''
  },
  participants: {
    type: Number,
    default: 0,
    min: [0, 'Katilimci sayisi negatif olamaz']
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
}, { 
  timestamps: true,
  toJSON: { virtuals: true }, // Sanal alanları JSON'da göster
  toObject: { virtuals: true }
});

// SANAL ALAN: Veritabanında yer kaplamaz, her çağrıldığında o anki tarihe göre hesaplanır
eventSchema.virtual('status').get(function() {
  return this.date < new Date() ? 'past' : 'upcoming';
});

module.exports = mongoose.model('Event', eventSchema);