const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { getAll, create, update, remove } = require('../controllers/beneficiaireController');

router.get('/', auth, getAll);
router.post('/', auth, create);
router.put('/:id', auth, update);
router.delete('/:id', auth, remove);

module.exports = router;