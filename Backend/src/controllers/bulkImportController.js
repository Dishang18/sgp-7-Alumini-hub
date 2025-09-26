const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { User } = require('../models/user');
const bcrypt = require('bcryptjs');

// Storage for uploaded files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../../uploads/');
        if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    },
});
const upload = multer({ storage: storage }).single('file');

const bulkImport = async (req, res) => {
    // Only admin and collegeadmin can import (already checked in route)
    upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(500).json({ status: 'fail', message: err.message });
        } else if (err) {
            return res.status(500).json({ status: 'fail', message: err.message });
        }
        if (!req.file) {
            return res.status(400).json({ status: 'fail', message: 'No file uploaded.' });
        }

        // Ask for user role in request body
        const { role } = req.body;
        if (!role || !['alumni', 'professor', 'collegeadmin', 'admin'].includes(role)) {
            return res.status(400).json({ status: 'fail', message: 'Role is required and must be one of alumni, professor, collegeadmin, admin.' });
        }

        const results = [];
        const errors = [];
        const filePath = req.file.path;
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                results.push(row);
            })
            .on('end', async () => {
                for (const row of results) {
                    try {

                        // All users must have email, password, firstName, lastName
                        if (!row.email || !row.password || !row.firstName || !row.lastName) {
                            errors.push({ row, error: 'Missing email, password, firstName, or lastName' });
                            continue;
                        }
                        // Check if user already exists
                        const existingUser = await User.findOne({ email: row.email });
                        if (existingUser) {
                            errors.push({ row, error: 'Email already exists' });
                            continue;
                        }
                        // Validate by role
                        if (role === 'student') {
                            if (!row.enrollmentNumber || !row.department || !row.branch || !row.year) {
                                errors.push({ row, error: 'Missing enrollmentNumber, department, branch, or year for student' });
                                continue;
                            }
                            if (isNaN(Number(row.year))) {
                                errors.push({ row, error: 'Year must be a number for student' });
                                continue;
                            }
                        } else if (role === 'alumni') {
                            if (!row.startYear || !row.endYear || !row.degree || !row.department || !row.branch || !row.rollNumber) {
                                errors.push({ row, error: 'Missing startYear, endYear, degree, department, branch, or rollNumber for alumni' });
                                continue;
                            }
                            if (isNaN(Number(row.startYear)) || isNaN(Number(row.endYear))) {
                                errors.push({ row, error: 'startYear and endYear must be numbers for alumni' });
                                continue;
                            }
                        } else if (role === 'professor') {
                            if (!row.department) {
                                errors.push({ row, error: 'Missing department for professor' });
                                continue;
                            }
                        } else if (role === 'collegeadmin') {
                            if (!row.department) {
                                errors.push({ row, error: 'Missing department for collegeadmin' });
                                continue;
                            }
                        } else if (role === 'admin') {
                            if (!row.adminName) {
                                errors.push({ row, error: 'Missing adminName for admin' });
                                continue;
                            }
                        }
                        const hashedPassword = await bcrypt.hash(row.password, 10);
                        // Build userData object for User model
                        const userData = {
                            email: row.email,
                            password: hashedPassword,
                            role,
                            isApproved: role === 'alumni' ? false : true,
                            firstName: row.firstName,
                            lastName: row.lastName,
                        };
                        if (role === 'student') {
                            userData.enrollmentNumber = row.enrollmentNumber;
                            userData.department = row.department;
                            userData.branch = row.branch;
                            userData.year = row.year;
                        } else if (role === 'alumni') {
                            userData.startYear = row.startYear;
                            userData.endYear = row.endYear;
                            userData.degree = row.degree;
                            userData.department = row.department;
                            userData.branch = row.branch;
                            userData.rollNumber = row.rollNumber;
                        } else if (role === 'professor') {
                            userData.department = row.department;
                        } else if (role === 'collegeadmin') {
                            userData.department = row.department;
                        } else if (role === 'admin') {
                            userData.adminName = row.adminName;
                        }
                        await User.create(userData);
                    } catch (error) {
                        errors.push({ row, error: error.message });
                    }
                }
                fs.unlinkSync(filePath); // Remove file after processing
                res.status(200).json({
                    status: 'success',
                    imported: results.length - errors.length,
                    errors,
                });
            });
    });
};

module.exports = { bulkImport };