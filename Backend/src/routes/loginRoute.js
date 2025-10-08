const registerController = require('../controllers/registerController');



const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');
const { body, validationResult } = require('express-validator');
const checkAuth = require('../middlewares/checkAuth');

// College admin registration (admin only)
router.post(
	'/register',
	checkAuth,
	[
		body('email').isEmail().withMessage('Invalid email'),
		body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
		body('role').notEmpty().withMessage('Role is required'),
	],
	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		next();
	},
	registerController
);



// Logout endpoint
router.post('/logout', (req, res) => {
	const isProduction = process.env.NODE_ENV === 'production';
	res.clearCookie('jwt', { 
		httpOnly: true, 
		secure: isProduction, 
		sameSite: isProduction ? 'none' : 'lax' 
	});
	res.status(200).json({ message: 'Logged out' });
});

console.log("loginRoute");
router.post(
	'/login',
	[
		body('email').isEmail().withMessage('Invalid email'),
		body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
		body('role').notEmpty().withMessage('Role is required'),
	],
	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		next();
	},
	loginController
);

// Add a simple auth check endpoint for debugging
router.get('/check-auth', checkAuth, (req, res) => {
	res.status(200).json({
		success: true,
		message: 'Authenticated',
		user: {
			id: req.user._id,
			email: req.user.email,
			role: req.user.role,
			department: req.user.department
		}
	});
});

module.exports = router;