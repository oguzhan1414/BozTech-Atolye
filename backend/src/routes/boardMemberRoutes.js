const express = require('express');
const router = express.Router();
const {
  getBoardMembers,
  getBoardMemberById,
  createBoardMember,
  updateBoardMember,
  deleteBoardMember
} = require('../controllers/boardMemberController');
const { protect, authorize } = require('../midleware/auth');
const upload = require('../midleware/upload');

router.route('/')
  .get(getBoardMembers)
  .post(protect, authorize('admin', 'editor'), upload.single('image'), createBoardMember);

router.route('/:id')
  .get(getBoardMemberById)
  .put(protect, authorize('admin', 'editor'), upload.single('image'), updateBoardMember)
  .delete(protect, authorize('admin'), deleteBoardMember);

module.exports = router;
