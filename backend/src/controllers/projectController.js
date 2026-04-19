const Project = require('../models/Project');
const fs = require('fs');
const { buildUploadUrl, resolveUploadUrl } = require('../utils/publicAssetUrl');
const { isCloudinaryEnabled, uploadImage } = require('../utils/mediaStorage');

const safeDeleteLocalFile = (filePath) => {
  if (!filePath) return;
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.warn('Yerel dosya silinemedi:', filePath, error.message);
  }
};

const serializeProject = (req, project) => {
  const plainProject = project.toObject ? project.toObject() : project;
  return {
    ...plainProject,
    img: resolveUploadUrl(req, plainProject.img, null, 'photos')
  };
};

exports.createProject = async (req, res) => {
  try {
    let imgPath = req.body.img || '';
    if (req.file) {
      if (isCloudinaryEnabled()) {
        const uploaded = await uploadImage(req.file.path, 'boztech/projects');
        imgPath = uploaded.url;
        safeDeleteLocalFile(req.file.path);
      } else {
        imgPath = buildUploadUrl(req, req.file.filename, 'photos');
      }
    }
    
    if (!imgPath) {
      return res.status(400).json({ success: false, message: 'Lütfen bir proje görseli yükleyin.' });
    }

    let techArray = [];
    if (req.body.tech) {
      if (Array.isArray(req.body.tech)) techArray = req.body.tech;
      else techArray = req.body.tech.split(',').map(t => t.trim()).filter(Boolean);
    }

    const project = await Project.create({ 
      ...req.body, 
      tech: techArray,
      img: imgPath,
      createdBy: req.user.id 
    });
    res.status(201).json({ success: true, data: serializeProject(req, project) });
  } catch (err) {
    if (req.file) safeDeleteLocalFile(req.file.path);
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort('-createdAt');
    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects.map((project) => serializeProject(req, project))
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Projeler getirilemedi' });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Proje bulunamadı' });
    }
    res.status(200).json({ success: true, data: serializeProject(req, project) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Proje getirilemedi' });
  }
};

exports.updateProject = async (req, res) => {
  try {
    let updateData = { ...req.body };
    if (req.file) {
      if (isCloudinaryEnabled()) {
        const uploaded = await uploadImage(req.file.path, 'boztech/projects');
        updateData.img = uploaded.url;
        safeDeleteLocalFile(req.file.path);
      } else {
        updateData.img = buildUploadUrl(req, req.file.filename, 'photos');
      }
    }

    if (updateData.tech) {
      if (!Array.isArray(updateData.tech)) {
        updateData.tech = updateData.tech.split(',').map(t => t.trim()).filter(Boolean);
      }
    }

    const project = await Project.findByIdAndUpdate(req.params.id, updateData, { 
      new: true, 
      runValidators: true 
    });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Proje bulunamadı' });
    }
    res.status(200).json({ success: true, data: serializeProject(req, project) });
  } catch (err) {
    if (req.file) safeDeleteLocalFile(req.file.path);
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Proje bulunamadı' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Silinemedi' });
  }
};
