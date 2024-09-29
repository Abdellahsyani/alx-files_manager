const express = require('express');
const router = express.Router();
const AppController = require('../controllers/AppController');
const FilesController = require('../controllers/FilesController');
const UsersController = require('../controllers/UsersController');

// Define your routes
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);
router.get('/connect', AuthController.getConnect);
router.get('disconnect', AuthController.getDisconnect);
router.post('/files', FilesController.postUpload);
router.get('/users/me', UsersController.getMe)
router.post('/users', UsersController.postNew);


module.exports = router;
