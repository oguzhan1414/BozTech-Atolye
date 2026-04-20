const mongoose = require('mongoose');

const boardMemberSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Ad soyad zorunludur'], trim: true },
  role: { type: String, required: [true, 'Görev (Role) alanı zorunludur'] },
  img: { type: String, default: '' },
  imgKey: { type: String, default: '' },
  groupType: { type: String, enum: ['club', 'project'], default: 'club' },
  projectName: { type: String, default: '' },
  isClubPresident: { type: Boolean, default: false },
  isProjectLead: { type: Boolean, default: false },
  linkedin: { type: String, default: '#' },
  github: { type: String, default: '#' },
  email: { type: String, default: '' },
  order: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('BoardMember', boardMemberSchema);
