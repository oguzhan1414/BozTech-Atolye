const Project = require('../models/Project');

exports.createProject = async (req, res) => {
  try {
    let imgPath = req.body.img || '';
    if (req.file) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      imgPath = `${baseUrl}/uploads/photos/${req.file.filename}`;
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
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort('-createdAt');
    res.status(200).json({ success: true, count: projects.length, data: projects });
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
    res.status(200).json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Proje getirilemedi' });
  }
};

exports.updateProject = async (req, res) => {
  try {
    let updateData = { ...req.body };
    if (req.file) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      updateData.img = `${baseUrl}/uploads/photos/${req.file.filename}`;
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
    res.status(200).json({ success: true, data: project });
  } catch (err) {
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
