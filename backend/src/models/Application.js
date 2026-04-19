const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  // Kişisel Bilgiler
  firstName: {
    type: String,
    required: [true, 'İsim gereklidir'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Soyisim gereklidir'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'E-posta gereklidir'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Geçerli bir e-posta adresi giriniz']
  },
  phone: {
    type: String,
    required: [true, 'Telefon numarası gereklidir'],
    trim: true
  },
  
  // Okul Bilgileri
  studentNumber: {
    type: String,
    required: [true, 'Öğrenci numarası gereklidir'],
    unique: true,
    trim: true
  },
  university: {
    type: String,
    default: 'Yozgat Bozok Üniversitesi'
  },
  faculty: {
    type: String,
    required: [true, 'Fakülte gereklidir']
  },
  department: {
    type: String,
    required: [true, 'Bölüm gereklidir']
  },
  grade: {
    type: String,
    enum: ['1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf', 'Yüksek Lisans', 'Doktora'],
    required: true
  },
  
  // Başvuru Detayları
  motivation: {
    type: String,
    required: [true, 'Motivasyon metni gereklidir'],
    maxlength: [1000, 'Motivasyon metni en fazla 1000 karakter olabilir']
  },
  experience: {
    type: String,
    default: ''
  },
  
  // Hangi etkinliğe/projeye başvurduğu (opsiyonel)
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    default: null
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'waiting', 'interview'],
    default: 'pending'
  },
  statusHistory: [{
    status: String,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    note: String,
    changedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Admin Notları
  adminNotes: [{
    note: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Değerlendirme
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  
  // Metadata
  appliedAt: {
    type: Date,
    default: Date.now
  },
  ipAddress: String,
  userAgent: String
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field: Tam isim
applicationSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Aynı etkinliğe iki kere başvuru kontrolü
applicationSchema.index({ email: 1, eventId: 1 }, { 
  unique: true,
  partialFilterExpression: { eventId: { $ne: null } }
});

// Aynı projeye iki kere başvuru kontrolü
applicationSchema.index({ email: 1, projectId: 1 }, { 
  unique: true,
  partialFilterExpression: { projectId: { $ne: null } }
});

// Öğrenci numarası unique
applicationSchema.index({ studentNumber: 1, eventId: 1 }, { 
  unique: true, 
  partialFilterExpression: { eventId: { $ne: null } } 
});

module.exports = mongoose.model('Application', applicationSchema);