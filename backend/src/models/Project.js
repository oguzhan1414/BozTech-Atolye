const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Proje başlığı zorunludur'], trim: true },
  desc: { type: String, required: [true, 'Kısa açıklama zorunludur'] },
  longDesc: { type: String, required: [true, 'Uzun açıklama (detay) zorunludur'] },
  img: { type: String, required: [true, 'Görsel URL veya yolu zorunludur'] },
  imgKey: { type: String, default: '' },
  tag: { type: String, required: [true, 'Kategori (Tag) alanı zorunludur'] },
  tech: [{ type: String }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
