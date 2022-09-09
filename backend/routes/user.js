// ROUTE USER Message

const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user');
const password = require('../middleware/password');

// Configurez les routes d'authentification

router.post('/signup', password , userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;