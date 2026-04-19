const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
} = require('../controllers/projectController');
const { protect, authorize } = require('../midleware/auth');
const upload = require('../midleware/upload');

router.route('/')
  .get(getProjects)
  .post(protect, authorize('admin', 'editor'), upload.single('image'), createProject);

router.route('/:id')
  .get(getProjectById)
  .put(protect, authorize('admin', 'editor'), upload.single('image'), updateProject)
  .delete(protect, authorize('admin'), deleteProject);

module.exports = router;
