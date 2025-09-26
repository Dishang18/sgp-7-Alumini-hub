const express = require("express");
const router = express.Router();
const registerController = require("../controllers/registerController");
const { body, validationResult } = require('express-validator');

router.post(
	"/user",
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

module.exports = router;
