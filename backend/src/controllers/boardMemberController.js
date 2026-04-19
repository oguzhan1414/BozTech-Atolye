const BoardMember = require('../models/BoardMember');

exports.createBoardMember = async (req, res) => {
  try {
    let imgPath = req.body.img || '';
    if (req.file) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      imgPath = `${baseUrl}/uploads/photos/${req.file.filename}`;
    }
    
    if (!imgPath) {
      return res.status(400).json({ success: false, message: 'Lütfen bir profil fotoğrafı yükleyin.' });
    }

    const member = await BoardMember.create({ 
      ...req.body, 
      img: imgPath,
      createdBy: req.user.id 
    });
    res.status(201).json({ success: true, data: member });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getBoardMembers = async (req, res) => {
  try {
    // order değerine göre küçükten büyüğe sıralayalım, eğer order yoksa createdAt'e göre
    const members = await BoardMember.find().sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, count: members.length, data: members });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Üyeler getirilemedi' });
  }
};

exports.getBoardMemberById = async (req, res) => {
  try {
    const member = await BoardMember.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Üye bulunamadı' });
    }
    res.status(200).json({ success: true, data: member });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Üye getirilemedi' });
  }
};

exports.updateBoardMember = async (req, res) => {
  try {
    let updateData = { ...req.body };
    if (req.file) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      updateData.img = `${baseUrl}/uploads/photos/${req.file.filename}`;
    }
    
    const member = await BoardMember.findByIdAndUpdate(req.params.id, updateData, { 
      new: true, 
      runValidators: true 
    });
    if (!member) {
      return res.status(404).json({ success: false, message: 'Üye bulunamadı' });
    }
    res.status(200).json({ success: true, data: member });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteBoardMember = async (req, res) => {
  try {
    const member = await BoardMember.findByIdAndDelete(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Üye bulunamadı' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Silinemedi' });
  }
};
