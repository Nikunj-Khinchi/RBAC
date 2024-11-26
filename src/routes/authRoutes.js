const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authorization = require('../middleware/authorizationMiddleware');
const authentication = require('../middleware/authenticationMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);

router.get('/getAllUsers', authorization, authentication("Admin"), authController.getAllUsers);
router.delete('/deleteAccount', authorization,authentication("Admin"), authController.deleteAccount);

module.exports = router;

