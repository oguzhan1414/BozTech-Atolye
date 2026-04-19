const express = require('express');
const router = express.Router();
const { submitContactForm, sendMessageToBoardMember } = require('../controllers/contactController');

router.post('/', submitContactForm);
router.post('/board', sendMessageToBoardMember);

module.exports = router;
