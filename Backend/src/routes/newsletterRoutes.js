const express = require('express');
const router = express.Router();
const newsletterController = require('../controllers/newsletterController');
const checkAuth = require('../middlewares/checkAuth');

router.get('/', newsletterController.getAllNewsletters);
router.post('/', checkAuth, newsletterController.createNewsletter);
router.put('/:id', checkAuth, newsletterController.updateNewsletter);
router.delete('/:id', checkAuth, newsletterController.deleteNewsletter);

module.exports = router;
