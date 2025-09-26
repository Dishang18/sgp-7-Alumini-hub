const express = require('express');
const router = express.Router();
const bulkImportController = require('../controllers/bulkImportController');
const checkAuth = require('../middlewares/checkAuth');

// Only admin and collegeadmin can bulk import
router.post('/bulkImport', checkAuth, (req, res, next) => {
	if (!(req.user.role === 'admin' || req.user.role === 'collegeadmin')) {
		return res.status(403).json({
			status: 'fail',
			message: 'Only admin or collegeadmin can perform bulk import.'
		});
	}
	next();
}, bulkImportController.bulkImport);

module.exports = router;