const express = require('express');
const router = express.Router();
const { getAllSectionsInfo, getSectionInfo, updateSectionInfo } = require('../controllers/clubInfoController');
const { protect, checkPermission } = require('../midleware/auth');

router.get('/', getAllSectionsInfo);
router.get('/:section', getSectionInfo);
router.put('/:section', protect, checkPermission('clubInfo'), updateSectionInfo);

module.exports = router;
