const BoardMember = require('../models/BoardMember');
const fs = require('fs');
const path = require('path');
const { buildUploadUrl, resolveUploadUrl } = require('../utils/publicAssetUrl');
const {
  isCloudinaryEnabled,
  uploadImage,
  deleteImage,
  extractPublicIdFromCloudinaryUrl,
} = require('../utils/mediaStorage');

const safeDeleteLocalFile = (filePath) => {
  if (!filePath) return;
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.warn('Yerel yonetim kurulu dosyasi silinemedi:', filePath, error.message);
  }
};

const serializeBoardMember = (req, member) => {
  const plainMember = member.toObject ? member.toObject() : member;
  return {
    ...plainMember,
    img: resolveUploadUrl(req, plainMember.img, plainMember.imgKey, 'photos')
  };
};

exports.createBoardMember = async (req, res) => {
  try {
    let imgPath = req.body.img || '';
    let imgKey = req.body.imgKey || '';

    if (req.file) {
      if (isCloudinaryEnabled()) {
        const uploaded = await uploadImage(req.file.path, 'boztech/board-members');
        imgPath = uploaded.url;
        imgKey = uploaded.key;
        safeDeleteLocalFile(req.file.path);
      } else {
        imgPath = buildUploadUrl(req, req.file.filename, 'photos');
        imgKey = req.file.filename;
      }
    }

    const member = await BoardMember.create({ 
      ...req.body, 
      img: imgPath,
      imgKey,
      createdBy: req.user.id 
    });

    res.status(201).json({ success: true, data: serializeBoardMember(req, member) });
  } catch (err) {
    if (req.file) safeDeleteLocalFile(req.file.path);
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getBoardMembers = async (req, res) => {
  try {
    // order değerine göre küçükten büyüğe sıralayalım, eğer order yoksa createdAt'e göre
    const members = await BoardMember.find().sort({ order: 1, createdAt: -1 });
    res.status(200).json({
      success: true,
      count: members.length,
      data: members.map((member) => serializeBoardMember(req, member))
    });
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
    res.status(200).json({ success: true, data: serializeBoardMember(req, member) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Üye getirilemedi' });
  }
};

exports.updateBoardMember = async (req, res) => {
  try {
    const existingMember = await BoardMember.findById(req.params.id);
    if (!existingMember) {
      return res.status(404).json({ success: false, message: 'Üye bulunamadı' });
    }

    let updateData = { ...req.body };

    if (req.file) {
      if (isCloudinaryEnabled()) {
        const uploaded = await uploadImage(req.file.path, 'boztech/board-members');
        updateData.img = uploaded.url;
        updateData.imgKey = uploaded.key;
        safeDeleteLocalFile(req.file.path);
      } else {
        updateData.img = buildUploadUrl(req, req.file.filename, 'photos');
        updateData.imgKey = req.file.filename;
      }
    }
    
    const member = await BoardMember.findByIdAndUpdate(req.params.id, updateData, { 
      new: true, 
      runValidators: true 
    });

    if (req.file) {
      const oldIsCloud = typeof existingMember.img === 'string' && existingMember.img.includes('res.cloudinary.com');
      const oldKey = existingMember.imgKey || extractPublicIdFromCloudinaryUrl(existingMember.img);

      if (oldIsCloud && isCloudinaryEnabled()) {
        if (oldKey && oldKey !== member.imgKey) {
          await deleteImage(oldKey);
        }
      } else if (oldKey && oldKey !== member.imgKey) {
        const oldFilePath = path.join(__dirname, '../../uploads/photos/', oldKey);
        safeDeleteLocalFile(oldFilePath);
      }
    }

    res.status(200).json({ success: true, data: serializeBoardMember(req, member) });
  } catch (err) {
    if (req.file) safeDeleteLocalFile(req.file.path);
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteBoardMember = async (req, res) => {
  try {
    const member = await BoardMember.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Üye bulunamadı' });
    }

    const isCloudImage = typeof member.img === 'string' && member.img.includes('res.cloudinary.com');
    const imgKey = member.imgKey || extractPublicIdFromCloudinaryUrl(member.img);

    if (isCloudImage && isCloudinaryEnabled()) {
      if (imgKey) {
        await deleteImage(imgKey);
      }
    } else if (imgKey) {
      const filePath = path.join(__dirname, '../../uploads/photos/', imgKey);
      safeDeleteLocalFile(filePath);
    }

    await BoardMember.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Silinemedi' });
  }
};
