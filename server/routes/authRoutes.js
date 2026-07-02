const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile, changePassword } = require('../controllers/authController');
const auth = require('../middlewares/auth');

// Routes publiques d'authentification.
router.post('/register', register);
router.post('/login', login);

// Routes protégées nécessitant un token JWT valide.
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.put('/password', auth, changePassword);

module.exports = router;