const express = require('express');
const userController = require('../contollers/userController');

const router = express.Router();

// Signup route
router.post('/signup', userController.signup);

// Login route
router.post('/login', userController.login);

router.get('/:id', userController.getUserById);


module.exports = router;