const express = require('express');
const router = express.Router();
const checkAuth = require('../middlewares/checkAuth');
const { deleteCollegeAdmin, updateStudent } = require('../controllers/userController');
const { User } = require('../models/user');
const Student = require('../models/studentModel');
const registerController = require('../controllers/registerController');

const {
  getAllUsers,
  approveUser,
  getAllStudents,
  getUnapprovedStudents,
  getUnapprovedUsers,
  approveStudent,
  deleteStudent,
  updateUser,
  debugUsers,
  getProfessorsInDepartment,
  assignProfessorToBranch,
  getBranchesInDepartment,
  assignBranchManager,
  removeBranchManager,
  getBranchManagers,
} = require('../controllers/userController');

// Update user (admin only)
router.put('/update', checkAuth, (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'collegeadmin') {
    return res.status(403).json({
      status: 'fail',
      message: 'Only admin or collegeadmin can update users.'
    });
  }
  next();
}, updateUser);

// Student management (CollegeAdmin/Professor)
router.get('/students/all', checkAuth, (req, res, next) => {
  if (!(req.user.role === 'collegeadmin' || req.user.role === 'professor' || req.user.role === 'admin')) {
    return res.status(403).json({ status: 'fail', message: 'Only collegeadmin, professor, or admin can view students.' });
  }
  next();
}, getAllStudents);

router.get('/students/unapproved', checkAuth, (req, res, next) => {
  if (!(req.user.role === 'collegeadmin' || req.user.role === 'professor' || req.user.role === 'admin')) {
    return res.status(403).json({ status: 'fail', message: 'Only collegeadmin, professor, or admin can view unapproved students.' });
  }
  next();
}, getUnapprovedStudents);

router.post('/students/approve', checkAuth, (req, res, next) => {
  if (!(req.user.role === 'collegeadmin' || req.user.role === 'professor' || req.user.role === 'admin')) {
    return res.status(403).json({ status: 'fail', message: 'Only collegeadmin, professor, or admin can approve students.' });
  }
  next();
}, approveStudent);

router.delete('/students/delete', checkAuth, (req, res, next) => {
  if (!(req.user.role === 'collegeadmin' || req.user.role === 'professor' || req.user.role === 'admin')) {
    return res.status(403).json({ status: 'fail', message: 'Only collegeadmin, professor, or admin can delete students.' });
  }
  next();
}, deleteStudent);

// CollegeAdmin or Professor can add students (current, not alumni)
router.post('/students', checkAuth, (req, res, next) => {
  if (!(req.user.role === 'collegeadmin' || req.user.role === 'professor' || req.user.role === 'admin')) {
    return res.status(403).json({ status: 'fail', message: 'Only collegeadmin, professor, or admin can add students.' });
  }
  // Force role to student
  req.body.role = 'student';
  next();
}, registerController);

// Approve user (admin, collegeadmin, and branch manager professors)
router.post('/approve', checkAuth, (req, res, next) => {
  if (!(req.user.role === 'admin' || req.user.role === 'collegeadmin' || req.user.role === 'professor')) {
    return res.status(403).json({
      status: 'fail',
      message: 'Only admin, collegeadmin, or professor can approve users.'
    });
  }
  next();
}, approveUser);

// Get all unapproved users (admin and collegeadmin can access)
router.get('/unapproved', checkAuth, (req, res, next) => {
  if (!['admin', 'collegeadmin', 'professor'].includes(req.user.role)) {
    return res.status(403).json({
      status: 'fail',
      message: 'Only admin, collegeadmin, or professor can access unapproved users.'
    });
  }
  next();
}, getUnapprovedUsers);


// Get all users (admin only)
router.get('/all', checkAuth, (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'fail',
      message: 'Only admin can access all users.'
    });
  }
  next();
}, getAllUsers);

// Get alumni (for any logged in user)
router.get('/alumni', checkAuth, async (req, res) => {
  try {
    const user = req.user;
    let filter = { role: 'alumni', isApproved: true };

    if (user.role === 'student' || user.role === 'alumni') {
      // Students and alumni can only see alumni from their department
      filter.department = user.department;
    } else if (user.role === 'collegeadmin') {
      // College admin can see all alumni from their department
      filter.department = user.department;
    }
    // Admin can see all alumni

    const alumni = await User.find(filter)
      .select('firstName lastName email department branch startYear endYear degree rollNumber')
      .sort({ firstName: 1 });

    res.status(200).json({
      status: 'success',
      data: {
        alumni
      }
    });
  } catch (error) {
    console.error('Error fetching alumni:', error);
    res.status(500).json({
      status: 'fail',
      message: 'Internal server error'
    });
  }
});

// Update student (admin: all, collegeadmin: same department, professor: same department and branch)
router.put('/student/:id', checkAuth, (req, res, next) => {
  if (!(req.user.role === 'collegeadmin' || req.user.role === 'professor' || req.user.role === 'admin')) {
    return res.status(403).json({ status: 'fail', message: 'Only collegeadmin, professor, or admin can update students.' });
  }
  next();
}, updateStudent);

// Delete college admin
router.delete('/collegeadmin', checkAuth, (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'fail',
      message: 'Only admin can delete college admins.'
    });
  }
  next();
}, deleteCollegeAdmin);

// Get professors in department (collegeadmin only)
router.get('/professors/department', checkAuth, (req, res, next) => {
  if (!(req.user.role === 'collegeadmin' || req.user.role === 'admin')) {
    return res.status(403).json({
      status: 'fail',
      message: 'Only collegeadmin or admin can access professors in department.'
    });
  }
  next();
}, getProfessorsInDepartment);

// Assign professor to branch (collegeadmin only)
router.post('/professor/assign-branch', checkAuth, (req, res, next) => {
  if (!(req.user.role === 'collegeadmin' || req.user.role === 'admin')) {
    return res.status(403).json({
      status: 'fail',
      message: 'Only collegeadmin or admin can assign professors to branches.'
    });
  }
  next();
}, assignProfessorToBranch);

// Get branches in department (collegeadmin only)
router.get('/branches/department', checkAuth, (req, res, next) => {
  if (!(req.user.role === 'collegeadmin' || req.user.role === 'admin')) {
    return res.status(403).json({
      status: 'fail',
      message: 'Only collegeadmin or admin can access branches in department.'
    });
  }
  next();
}, getBranchesInDepartment);

// Branch manager management routes
router.post('/assign-branch-manager', checkAuth, (req, res, next) => {
  if (!(req.user.role === 'collegeadmin' || req.user.role === 'admin')) {
    return res.status(403).json({
      status: 'fail',
      message: 'Only collegeadmin or admin can assign branch managers.'
    });
  }
  next();
}, assignBranchManager);

router.post('/remove-branch-manager', checkAuth, (req, res, next) => {
  if (!(req.user.role === 'collegeadmin' || req.user.role === 'admin')) {
    return res.status(403).json({
      status: 'fail',
      message: 'Only collegeadmin or admin can remove branch managers.'
    });
  }
  next();
}, removeBranchManager);

router.get('/branch-managers', checkAuth, (req, res, next) => {
  if (!(req.user.role === 'collegeadmin' || req.user.role === 'admin')) {
    return res.status(403).json({
      status: 'fail',
      message: 'Only collegeadmin or admin can view branch managers.'
    });
  }
  next();
}, getBranchManagers);

// Debug route (admin only)
router.get('/debug', checkAuth, (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'fail',
      message: 'Only admin can access debug information.'
    });
  }
  next();
}, debugUsers);

module.exports = router;