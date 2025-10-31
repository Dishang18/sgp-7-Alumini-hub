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

// Helper: prefer institute column but fall back to department to remain compatible with older CSVs
const pickInstitute = (row) => {
    return row.institute || row.Institute || row.department || row.Department || '';
};

// Helper to normalize and pick collegeName from multiple possible headers
const pickCollegeName = (row) => {
    return row.collegeName || row.college || row.instituteName || row.institute || row.college_name || row.institute_name || '';
};

const processRows = async (rows, role) => {
    const errors = [];
    let imported = 0;
    let rowNumber = 0;
    for (const rawRow of rows) {
        rowNumber++;
        // Normalize keys to trimmed strings
        const row = {};
        for (const k of Object.keys(rawRow)) {
            const v = rawRow[k];
            row[k.trim()] = typeof v === 'string' ? v.trim() : v;
        }
        try {
            // All users must have email, password, firstName, lastName
            if (!row.email || !row.password || !row.firstName || !row.lastName) {
                errors.push({ rowNumber, row, error: 'Missing email, password, firstName, or lastName' });
                continue;
            }
            // Check if user already exists
            const existingUser = await User.findOne({ email: row.email });
            if (existingUser) {
                errors.push({ rowNumber, row, error: 'Email already exists' });
                continue;
            }

            const institute = pickInstitute(row);

            // Validate by role
            if (role === 'student') {
                if (!row.enrollmentNumber || !institute || !row.branch || (row.year === undefined || row.year === '')) {
                    errors.push({ rowNumber, row, error: 'Missing enrollmentNumber, institute, branch, or year for student' });
                    continue;
                }
                if (isNaN(Number(row.year))) {
                    errors.push({ rowNumber, row, error: 'Year must be a number for student' });
                    continue;
                }
            } else if (role === 'alumni') {
                if ((row.startYear === undefined || row.startYear === '') || (row.endYear === undefined || row.endYear === '') || !row.degree || !institute || !row.branch || !row.rollNumber) {
                    errors.push({ rowNumber, row, error: 'Missing startYear, endYear, degree, institute, branch, or rollNumber for alumni' });
                    continue;
                }
                if (isNaN(Number(row.startYear)) || isNaN(Number(row.endYear))) {
                    errors.push({ rowNumber, row, error: 'startYear and endYear must be numbers for alumni' });
                    continue;
                }
            } else if (role === 'professor') {
                if (!institute) {
                    errors.push({ rowNumber, row, error: 'Missing institute for professor' });
                    continue;
                }
            } else if (role === 'collegeadmin') {
                const collegeName = pickCollegeName(row) || institute;
                if (!collegeName) {
                    errors.push({ rowNumber, row, error: 'Missing collegeName/institute for collegeadmin' });
                    continue;
                }
            } else if (role === 'admin') {
                if (!row.adminName) {
                    errors.push({ rowNumber, row, error: 'Missing adminName for admin' });
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
                userData.department = institute; // keep DB field name 'department' but populate from CSV 'institute'
                userData.branch = row.branch;
                userData.year = Number(row.year);
            } else if (role === 'alumni') {
                userData.startYear = Number(row.startYear);
                userData.endYear = Number(row.endYear);
                userData.degree = row.degree;
                userData.department = institute;
                userData.branch = row.branch;
                userData.rollNumber = row.rollNumber;
            } else if (role === 'professor') {
                userData.department = institute;
            } else if (role === 'collegeadmin') {
                userData.department = institute;
                userData.collegeName = pickCollegeName(row) || institute;
            } else if (role === 'admin') {
                userData.adminName = row.adminName;
            }

            await User.create(userData);
            imported++;
        } catch (error) {
            errors.push({ rowNumber, row: rawRow, error: error.message });
        }
    }
    return { imported, errors };
};

const bulkImport = async (req, res) => {
    // Only admin and collegeadmin can import (already checked in route)
    const providedRows = req.body && req.body.rows;

    try {
        if (providedRows) {
            const role = req.body && req.body.role;
            if (!role || !['alumni', 'professor', 'collegeadmin', 'admin', 'student'].includes(role)) {
                return res.status(400).json({ status: 'fail', message: 'Role is required and must be one of alumni, professor, collegeadmin, admin, student.' });
            }
            // rows may be a JSON string if sent as form-data text
            let rowsArray = providedRows;
            if (typeof providedRows === 'string') {
                try {
                    rowsArray = JSON.parse(providedRows);
                } catch (e) {
                    return res.status(400).json({ status: 'fail', message: 'Invalid JSON in rows field' });
                }
            }
            if (!Array.isArray(rowsArray)) {
                return res.status(400).json({ status: 'fail', message: 'rows must be an array' });
            }
            const result = await processRows(rowsArray, role);
            return res.status(200).json({ status: 'success', imported: result.imported, errors: result.errors });
        }

        // Fallback to file upload
        upload(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
                return res.status(500).json({ status: 'fail', message: err.message });
            } else if (err) {
                return res.status(500).json({ status: 'fail', message: err.message });
            }
            if (!req.file) {
                return res.status(400).json({ status: 'fail', message: 'No file uploaded.' });
            }

            const role = req.body && req.body.role;
            if (!role || !['alumni', 'professor', 'collegeadmin', 'admin', 'student'].includes(role)) {
                try { fs.unlinkSync(req.file.path); } catch (e) { /* ignore */ }
                return res.status(400).json({ status: 'fail', message: 'Role is required and must be one of alumni, professor, collegeadmin, admin, student.' });
            }

            const results = [];
            const filePath = req.file.path;
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (row) => {
                    results.push(row);
                })
                .on('end', async () => {
                    try {
                        const result = await processRows(results, role);
                        // Remove file after processing
                        try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
                        return res.status(200).json({ status: 'success', imported: result.imported, errors: result.errors });
                    } catch (e) {
                        try { fs.unlinkSync(filePath); } catch (er) { /* ignore */ }
                        return res.status(500).json({ status: 'fail', message: e.message });
                    }
                })
                .on('error', (e) => {
                    try { fs.unlinkSync(filePath); } catch (er) { /* ignore */ }
                    return res.status(500).json({ status: 'fail', message: e.message });
                });
        });
    } catch (error) {
        return res.status(500).json({ status: 'fail', message: error.message });
    }
};

module.exports = { bulkImport };