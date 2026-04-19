const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'İsim gereklidir'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'E-posta gereklidir'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Şifre gereklidir'],
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'editor'],
    default: 'editor'
  },
  permissions: {
    announcements: { type: Boolean, default: false },
    events: { type: Boolean, default: false },
    applications: { type: Boolean, default: false },
    photos: { type: Boolean, default: false },
    clubInfo: { type: Boolean, default: false },
    users: { type: Boolean, default: false }  // 👈 KULLANICI YÖNETİMİ İZNİ EKLENDİ
  },
  lastLogin: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Şifre hashleme - isModified kontrolü ile
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});


// Şifre kontrolü
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Son giriş tarihini güncelle
userSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date();
  return this.save({ validateBeforeSave: false });
};

// Hassas bilgileri çıkarma
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);