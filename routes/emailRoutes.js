const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');

router.post('/sendEmail', emailController.sendEmailToListMembers);

module.exports = router;
