const express = require('express');
const AppController = require('../controllers/AppController');

const router = express.Router();
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);
module.exports = router;
