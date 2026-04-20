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

const normalizeText = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

const parseBoolean = (value, fallback = false) => {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  const normalized = String(value).trim().toLowerCase();
  return ['true', '1', 'yes', 'on'].includes(normalized);
};

const inferClubPresident = (member) => {
  if (member?.isClubPresident) return true;
  const role = normalizeText(member?.role);
  return role.includes('kulup baskani');
};

const inferProjectLead = (member) => {
  if (member?.isProjectLead) return true;
  const role = normalizeText(member?.role);
  return role.includes('proje baskani');
};

const inferGroupType = (member) => {
  if (member?.groupType === 'project' || member?.groupType === 'club') {
    return member.groupType;
  }
  if (String(member?.projectName || '').trim()) return 'project';
  return 'club';
};

const toBoardPayload = (body, defaults = {}) => {
  const payload = { ...body };

  const resolvedGroupType = (payload.groupType === 'project' || payload.groupType === 'club')
    ? payload.groupType
    : ((defaults.groupType === 'project' || String(defaults.projectName || '').trim()) ? 'project' : 'club');

  const isClubPresident = parseBoolean(payload.isClubPresident, defaults.isClubPresident || false);
  const isProjectLead = parseBoolean(payload.isProjectLead, defaults.isProjectLead || false);

  payload.groupType = isClubPresident ? 'club' : resolvedGroupType;
  payload.projectName = payload.groupType === 'project'
    ? String(payload.projectName || defaults.projectName || '').trim()
    : '';
  payload.isClubPresident = isClubPresident;
  payload.isProjectLead = payload.groupType === 'project' ? isProjectLead : false;

  if (payload.groupType === 'project' && !payload.projectName) {
    throw new Error('Proje ekibi secildiginde proje adi zorunludur.');
  }

  return payload;
};

const sortBoardMembers = (members) => {
  return [...members].sort((a, b) => {
    const aClubPresident = inferClubPresident(a);
    const bClubPresident = inferClubPresident(b);

    if (aClubPresident !== bClubPresident) {
      return aClubPresident ? -1 : 1;
    }

    const aGroupType = inferGroupType(a);
    const bGroupType = inferGroupType(b);

    if (aGroupType !== bGroupType) {
      return aGroupType === 'project' ? -1 : 1;
    }

    if (aGroupType === 'project') {
      const projectCompare = String(a.projectName || '').localeCompare(String(b.projectName || ''), 'tr');
      if (projectCompare !== 0) return projectCompare;

      const aLead = inferProjectLead(a);
      const bLead = inferProjectLead(b);
      if (aLead !== bLead) {
        return aLead ? -1 : 1;
      }
    }

    return String(a.name || '').localeCompare(String(b.name || ''), 'tr');
  });
};

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

    const payload = toBoardPayload(req.body);

    const member = await BoardMember.create({ 
      ...payload,
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
    const members = await BoardMember.find().sort({ createdAt: -1 });
    const sortedMembers = sortBoardMembers(members);

    res.status(200).json({
      success: true,
      count: sortedMembers.length,
      data: sortedMembers.map((member) => serializeBoardMember(req, member))
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
    updateData = toBoardPayload(updateData, existingMember);

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
