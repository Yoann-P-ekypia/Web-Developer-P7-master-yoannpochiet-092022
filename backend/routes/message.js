// ROUTE Message

const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const messageCtrl = require('../controllers/message');

router.put('/:id', auth, multer, messageCtrl.update);
router.delete('/:id', auth, messageCtrl.delete);

router.post('/', auth, multer, messageCtrl.create);
router.get('/', auth, messageCtrl.list);
router.get('/:id', auth, messageCtrl.OneMessage);
router.post('/:id/like', auth, messageCtrl.likeMessage);

module.exports = router;