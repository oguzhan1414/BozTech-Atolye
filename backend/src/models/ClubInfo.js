const mongoose = require('mongoose');

const clubInfoSchema = new mongoose.Schema({
  section: {
    type: String,
    required: true,
    unique: true,
    enum: ['mission', 'services', 'board', 'activities', 'projects', 'membership', 'socialLinks']
  },
  data: {
    type: mongoose.Schema.Types.Mixed, // Her section için farklı yapı olacağı için Mixed kullanıyoruz
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('ClubInfo', clubInfoSchema);
