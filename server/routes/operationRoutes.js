const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { getAll, create, remove, getStats } = require('../controllers/operationController');

router.get('/', auth, getAll);
router.get('/stats', auth, getStats);
router.post('/', auth, create);
router.delete('/:id', auth, remove);

module.exports = router;