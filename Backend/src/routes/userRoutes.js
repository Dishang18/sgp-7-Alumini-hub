
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

// Get all users (admin can see all, collegeadmin can see their department)
router.get('/all', checkAuth, (req, res, next) => {
  if (!(req.user.role === 'admin' || req.user.role === 'collegeadmin')) {
    return res.status(403).json({
      status: 'fail',
      message: 'Only admin or collegeadmin can access users.'
    });
  }
  next();
}, getAllUsers);

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

// Debug endpoint to check all users and departments (temporary for debugging)
router.get('/debug', checkAuth, (req, res, next) => {
  if (!['admin', 'collegeadmin'].includes(req.user.role)) {
    return res.status(403).json({
      status: 'fail',
      message: 'Only admin or collegeadmin can access debug info.'
    });
  }
  next();
}, debugUsers);




// Delete college admin (admin only)
router.delete('/collegeadmin/delete', checkAuth, (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ status: 'fail', message: 'Only admin can delete college admins.' });
  }
  next();
}, deleteCollegeAdmin);

// Generic delete user (admin and collegeadmin)
router.delete('/delete', checkAuth, (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'collegeadmin') {
    return res.status(403).json({ status: 'fail', message: 'Only admin or collegeadmin can delete users.' });
  }
  next();
}, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ status: 'fail', message: 'userId is required' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }
    
    // Role-based deletion permissions
    if (req.user.role === 'collegeadmin') {
      // College admin can only delete users from their department (case-insensitive)
      const userDept = user.department?.toLowerCase();
      const currentUserDept = req.user.department?.toLowerCase();
      if (!userDept || !currentUserDept || userDept !== currentUserDept) {
        return res.status(403).json({ 
          status: 'fail', 
          message: `You can only delete users from your department. User dept: "${user.department}", Your dept: "${req.user.department}"` 
        });
      }
      // College admin cannot delete other college admins or main admins
      if (['admin', 'collegeadmin'].includes(user.role)) {
        return res.status(403).json({ status: 'fail', message: 'You cannot delete admin users.' });
      }
    }
    
    // Prevent deleting admin users (additional check)
    if (user.role === 'admin') {
      return res.status(403).json({ status: 'fail', message: 'Cannot delete admin users.' });
    }
    
    // Remove from profile collection if needed
    if (user.role === 'student') {
      await Student.findOneAndDelete({ user: userId });
    }
    // Note: alumni, professor, and collegeadmin models are not implemented yet
    
    await User.findByIdAndDelete(userId);
    res.status(200).json({ status: 'success', message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ status: 'fail', message: 'Internal Server Error' });
  }
});

// Update student (admin, collegeadmin, professor with role-based access)
router.put('/students/update', checkAuth, (req, res, next) => {
  const user = req.user;
  if (!['admin', 'collegeadmin', 'professor'].includes(user.role)) {
    return res.status(403).json({ status: 'fail', message: 'Only admin, collegeadmin, or professor can update students.' });
  }
  next();
}, updateStudent);

// Get alumni for students (students can view alumni from their department)
router.get('/alumni', checkAuth, async (req, res) => {
  try {
    const { department, branch, year, name } = req.query;
    const currentUser = req.user;
    
    console.log('Alumni search request:', {
      currentUser: { role: currentUser.role, department: currentUser.department },
      queryParams: { department, branch, year, name }
    });
    
    // Build filter based on user role and query parameters
    let filter = { role: 'alumni', isApproved: true };
    
    if (currentUser.role === 'student') {
      // Students can only see alumni from their department
      filter.department = { $regex: new RegExp(`^${currentUser.department}$`, 'i') };
    } else if (currentUser.role === 'professor') {
      // Professors can see alumni from their department
      filter.department = { $regex: new RegExp(`^${currentUser.department}$`, 'i') };
    } else if (currentUser.role === 'collegeadmin') {
      // College admins can see alumni from their department
      filter.department = { $regex: new RegExp(`^${currentUser.department}$`, 'i') };
    } else if (currentUser.role === 'admin') {
      // Main admin can see all alumni, optionally filter by department
      if (department) {
        filter.department = { $regex: new RegExp(`^${department}$`, 'i') };
      }
    } else {
      return res.status(403).json({ status: 'fail', message: 'Access denied' });
    }
    
    // Add additional filters if provided
    if (branch) {
      filter.branch = { $regex: new RegExp(`^${branch}$`, 'i') };
    }
    if (year) {
      // Search in both startYear and endYear
      filter.$or = [
        { startYear: parseInt(year) },
        { endYear: parseInt(year) }
      ];
    }
    if (name) {
      filter.$or = [
        { firstName: { $regex: new RegExp(name, 'i') } },
        { lastName: { $regex: new RegExp(name, 'i') } }
      ];
    }
    
    const alumni = await User.find(filter)
      .select('firstName lastName email department branch startYear endYear degree rollNumber socialProfiles skills education workExperiences')
      .sort({ lastName: 1, firstName: 1 });
    
    console.log('Alumni search result:', {
      filter,
      foundAlumni: alumni.length,
      alumniList: alumni.map(a => ({ name: `${a.firstName} ${a.lastName}`, department: a.department, branch: a.branch }))
    });
    
    res.status(200).json({
      status: 'success',
      data: { alumni, count: alumni.length }
    });
    
  } catch (error) {
    console.error('Error fetching alumni:', error);
    res.status(500).json({ status: 'fail', message: 'Internal Server Error' });
  }
});

// Get professors in department (for college admin and admin)
router.get('/professors', checkAuth, (req, res, next) => {
  if (req.user.role !== 'collegeadmin' && req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'fail',
      message: 'Only admin or college admin can view professors.'
    });
  }
  next();
}, getProfessorsInDepartment);

// Get branches in department (for college admin)
router.get('/branches', checkAuth, (req, res, next) => {
  if (req.user.role !== 'collegeadmin') {
    return res.status(403).json({
      status: 'fail',
      message: 'Only college admin can view branches in their department.'
    });
  }
  next();
}, getBranchesInDepartment);

// Assign professor to branch (college admin only)
router.post('/assign-professor-branch', checkAuth, (req, res, next) => {
  if (req.user.role !== 'collegeadmin') {
    return res.status(403).json({
      status: 'fail',
      message: 'Only college admin can assign professors to branches.'
    });
  }
  next();
}, assignProfessorToBranch);

// Debug endpoint to check professor registrations (temporary)
router.get('/debug-professors', checkAuth, async (req, res) => {
  try {
    const professors = await User.find({ role: 'professor' })
      .select('email firstName lastName department branch isApproved')
      .sort({ createdAt: -1 });
    
    const unapprovedProfessors = await User.find({ 
      role: 'professor', 
      isApproved: false 
    }).select('email firstName lastName department branch isApproved');
    
    res.status(200).json({
      status: 'success',
      data: {
        allProfessors: professors,
        unapprovedProfessors,
        currentUser: {
          email: req.user.email,
          role: req.user.role,
          department: req.user.department
        }
      }
    });
  } catch (error) {
    console.error('Debug professors error:', error);
    res.status(500).json({ status: 'fail', message: 'Internal Server Error' });
  }
});

// Branch Manager Management Routes
router.post('/assign-branch-manager', checkAuth, (req, res, next) => {
  assignBranchManager(req, res).catch(next);
});

router.post('/remove-branch-manager', checkAuth, (req, res, next) => {
  removeBranchManager(req, res).catch(next);
});

router.get('/branch-managers', checkAuth, (req, res, next) => {
  getBranchManagers(req, res).catch(next);
});

module.exports = router;
