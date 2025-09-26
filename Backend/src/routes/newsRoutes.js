const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const checkAuth = require('../middlewares/checkAuth');

router.get('/', newsController.getAllNews);
router.post('/', checkAuth, newsController.createNews);
router.put('/:id', checkAuth, newsController.updateNews);
router.delete('/:id', checkAuth, newsController.deleteNews);

module.exports = router;
