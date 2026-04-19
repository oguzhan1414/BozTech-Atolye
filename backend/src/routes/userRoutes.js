const express = require('express');
const router = express.Router();
const { getUsers, updateUser, deleteUser } = require('../controllers/userController');
const { protect, checkPermission, authorize } = require('../midleware/auth');

// Private routes 
router.get('/', protect, checkPermission('users'), getUsers);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
