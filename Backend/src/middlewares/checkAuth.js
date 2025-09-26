
const jwt = require('jsonwebtoken');
const { User } = require('../models/user');

const checkAuth = async (req, res, next) => {
    try {
        // Debug: log cookies received by backend
        console.log('Cookies received:', req.cookies);
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({
                status: 'fail',
                message: 'You are not logged in! Please log in to get access.',
            });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({
                status: 'fail',
                message: 'User not found.',
            });
        }
        console.log('User authenticated:', {
            id: user._id,
            email: user.email,
            role: user.role,
            department: user.department,
            branch: user.branch
        });
        req.user = user;
        next();
    } catch (error) {
        console.error('Error during authentication:', error);
        return res.status(401).json({
            status: 'fail',
            message: 'Invalid or expired token.',
        });
    }
};

module.exports = checkAuth;
