const express = require('express');
const router = express.Router();
const listController = require('../controllers/listController');

router.post('/createlist', listController.createList);

module.exports = router;
