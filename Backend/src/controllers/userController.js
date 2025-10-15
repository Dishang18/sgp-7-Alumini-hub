const { User } = require("../models/user");
const { Professor } = require('../models/professorModel');
const Student = require('../models/studentModel');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Update student (admin: all, collegeadmin: same department, professor: same department and branch)
async function updateStudent(req, res) {
  try {
    const { studentId, enrollmentNumber, department, branch, year, email, firstName, lastName } = req.body;
    if (!studentId) {
      return res.status(400).json({ status: 'fail', message: 'studentId is required' });
    }
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ status: 'fail', message: 'Student not found' });
    }
    // Role-based permission check
    const user = req.user;
    if (user.role === 'admin') {
      // admin can update all students
    } else if (user.role === 'collegeadmin') {
      if (student.department?.toLowerCase() !== user.department?.toLowerCase()) {
        return res.status(403).json({ status: 'fail', message: 'No permission to update this student.' });
      }
    } else if (user.role === 'professor') {
      if (student.department?.toLowerCase() !== user.department?.toLowerCase() || student.branch?.toLowerCase() !== user.branch?.toLowerCase()) {
        return res.status(403).json({ status: 'fail', message: 'No permission to update this student.' });
      }
    } else {
      return res.status(403).json({ status: 'fail', message: 'No permission to update students.' });
    }
    // Update fields
    if (enrollmentNumber !== undefined) student.enrollmentNumber = enrollmentNumber;
    if (department !== undefined) student.department = department;
    if (branch !== undefined) student.branch = branch;
    if (year !== undefined) student.year = year;
    if (email !== undefined) student.email = email;
    if (firstName !== undefined) student.firstName = firstName;
    if (lastName !== undefined) student.lastName = lastName;
    await student.save();
    res.status(200).json({ status: 'success', message: 'Student updated' });
  } catch (error) {
    res.status(500).json({ status: 'fail', message: 'Internal Server Error' });
  }
}

// Delete college admin (now just delete user with role collegeadmin)
async function deleteCollegeAdmin(req, res) {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ status: 'fail', message: 'userId is required' });
    }
    const user = await User.findById(userId);
    if (!user || user.role !== 'collegeadmin') {
      return res.status(404).json({ status: 'fail', message: 'College admin not found' });
    }
    await User.findByIdAndDelete(userId);
    logAdminAction(req.user._id, 'DELETE_COLLEGE_ADMIN', { userId });
    res.status(200).json({ status: 'success', message: 'College admin deleted' });
  } catch (error) {
    res.status(500).json({ status: 'fail', message: 'Internal Server Error' });
  }
}








// Get all students (for CollegeAdmin/Professor)
async function getAllStudents(req, res) {
  try {
    let students;
    if (req.user.role === 'admin') {
      // Admin: view all students
      students = await User.find({ role: 'student' });
    } else if (req.user.role === 'collegeadmin') {
      // College admin: only view students in their department (case-insensitive)
      students = await User.find({ 
        role: 'student', 
        department: { $regex: new RegExp(`^${req.user.department}$`, 'i') }
      });
    } else if (req.user.role === 'professor') {
      // Professor: only view students from their department and branch (case-insensitive)
      students = await User.find({ 
        role: 'student', 
        department: { $regex: new RegExp(`^${req.user.department}$`, 'i') },
        branch: { $regex: new RegExp(`^${req.user.branch}$`, 'i') }
      });
    } else {
      students = [];
    }
    res.status(200).json({
      status: "success",
      data: { students },
    });
  } catch (error) {
    res.status(500).json({ status: "fail", message: "Internal Server Error" });
  }
}

// Get unapproved students (User model only)
async function getUnapprovedStudents(req, res) {
  try {
    let students;
    if (req.user.role === 'admin') {
      // Main admin can see all unapproved students
      students = await User.find({ role: 'student', isApproved: false });
    } else if (req.user.role === 'collegeadmin') {
      // College admin can only see unapproved students from their department (case-insensitive)
      students = await User.find({ 
        role: 'student', 
        isApproved: false, 
        department: { $regex: new RegExp(`^${req.user.department}$`, 'i') }
      });
    } else if (req.user.role === 'professor') {
      // Professor can see unapproved students from their department and branch
      students = await User.find({ 
        role: 'student', 
        isApproved: false, 
        department: req.user.department,
        branch: req.user.branch 
      });
    } else {
      students = [];
    }
    
    res.status(200).json({
      status: "success",
      data: { students },
    });
  } catch (error) {
    console.error('Error fetching unapproved students:', error);
    res.status(500).json({ status: "fail", message: "Internal Server Error" });
  }
}

// Update user (admin only, all fields in User model)
async function updateUser(req, res) {
  try {
    console.log('updateUser req.body:', req.body);
    const { userId, email, role, department, branch, collegeName, firstName, lastName, enrollmentNumber, year, startYear, endYear, degree, rollNumber, password } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }
    if (email) user.email = email;
    if (role) user.role = role;
    if (typeof department !== 'undefined') user.department = department;
    if (typeof branch !== 'undefined') user.branch = branch;
    if (typeof collegeName !== 'undefined') user.collegeName = collegeName;
    if (typeof firstName !== 'undefined') user.firstName = firstName;
    if (typeof lastName !== 'undefined') user.lastName = lastName;
    if (typeof enrollmentNumber !== 'undefined') user.enrollmentNumber = enrollmentNumber;
    if (typeof year !== 'undefined') user.year = year;
    if (typeof startYear !== 'undefined') user.startYear = startYear;
    if (typeof endYear !== 'undefined') user.endYear = endYear;
    if (typeof degree !== 'undefined') user.degree = degree;
    if (typeof rollNumber !== 'undefined') user.rollNumber = rollNumber;
    if (typeof password !== 'undefined' && password) {
      user.password = await bcrypt.hash(password, 10);
    }
    await user.save();
    logAdminAction(req.user._id, 'UPDATE_USER', { userId, email, role, department, branch });
    res.status(200).json({ status: 'success', message: 'User updated' });
  } catch (error) {
    res.status(500).json({ status: 'fail', message: 'Internal Server Error' });
  }
}

// Approve student (User model only)
async function approveStudent(req, res) {
  try {
    const { studentId } = req.body;
    // Only admin, collegeadmin, or professor can approve students
    if (!(req.user.role === 'admin' || req.user.role === 'collegeadmin' || req.user.role === 'professor')) {
      return res.status(403).json({ status: 'fail', message: 'Only admin, collegeadmin, or professor can approve students.' });
    }
    
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ status: 'fail', message: 'Student not found' });
    }

    // Permission checks based on role
    if (req.user.role === 'admin') {
      // Admin can approve all students
    } else if (req.user.role === 'collegeadmin') {
      // College admin can only approve students from their department
      if (student.department?.toLowerCase() !== req.user.department?.toLowerCase()) {
        return res.status(403).json({ status: 'fail', message: 'You can only approve students from your department.' });
      }
    } else if (req.user.role === 'professor') {
      // Professor can only approve students from their department and branch
      if (student.department?.toLowerCase() !== req.user.department?.toLowerCase() || 
          student.branch?.toLowerCase() !== req.user.branch?.toLowerCase()) {
        return res.status(403).json({ status: 'fail', message: 'You can only approve students from your assigned department and branch.' });
      }
    }
    
    student.isApproved = true;
    await student.save();
    logAdminAction(req.user._id, 'APPROVE_STUDENT', { studentId });
    res.status(200).json({ status: 'success', message: 'Student approved' });
  } catch (error) {
    res.status(500).json({ status: 'fail', message: 'Internal Server Error' });
  }
}

// Delete student (User model only)
async function deleteStudent(req, res) {
  try {
    const { studentId } = req.body;
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ status: 'fail', message: 'Student not found' });
    }
    
    // Prevent deleting admin user (should never happen, but for safety)
    if (student.role === 'admin') {
      return res.status(403).json({ status: 'fail', message: 'Cannot delete admin user.' });
    }

    // Permission checks based on role
    if (req.user.role === 'admin') {
      // Admin can delete all students
    } else if (req.user.role === 'collegeadmin') {
      // College admin can only delete students from their department
      if (student.department?.toLowerCase() !== req.user.department?.toLowerCase()) {
        return res.status(403).json({ status: 'fail', message: 'You can only delete students from your department.' });
      }
    } else if (req.user.role === 'professor') {
      // Professor can only delete students from their department and branch
      if (student.department?.toLowerCase() !== req.user.department?.toLowerCase() || 
          student.branch?.toLowerCase() !== req.user.branch?.toLowerCase()) {
        return res.status(403).json({ status: 'fail', message: 'You can only delete students from your assigned department and branch.' });
      }
    } else {
      return res.status(403).json({ status: 'fail', message: 'You do not have permission to delete students.' });
    }
    
    await User.findByIdAndDelete(studentId);
    logAdminAction(req.user._id, 'DELETE_STUDENT', { studentId });
    res.status(200).json({ status: 'success', message: 'Student deleted' });
  } catch (error) {
    res.status(500).json({ status: 'fail', message: 'Internal Server Error' });
  }
}

// Function to fetch all users
async function getAllUsers(req, res) {
  try {
    let users;
    let debugInfo = {};
    
    if (req.user.role === 'admin') {
      // Main admin: all users except other admins
      users = await User.find({ role: { $in: ['collegeadmin', 'professor', 'alumni', 'student'] } });
      debugInfo = { adminAccess: true, totalUsers: users.length };
    } else if (req.user.role === 'collegeadmin') {
      // College admin: professors, alumni, and students from same department (case-insensitive)
      const filter = {
        role: { $in: ['professor', 'alumni', 'student'] },
        department: { $regex: new RegExp(`^${req.user.department}$`, 'i') }
      };
      users = await User.find(filter);
      
      // Debug info for college admin
      debugInfo = {
        currentUserDepartment: req.user.department,
        filterUsed: filter,
        matchingUsers: users.length,
        userDepartments: users.map(u => ({ id: u._id, email: u.email, department: u.department, role: u.role }))
      };
      
      // Also get all users to see what departments exist
      const allUsers = await User.find({ role: { $in: ['professor', 'alumni', 'student'] } });
      debugInfo.allAvailableDepartments = [...new Set(allUsers.map(u => u.department))];
      
    } else if (req.user.role === 'professor') {
      // Professor: alumni and students from same department and branch (case-insensitive)
      users = await User.find({
        role: { $in: ['alumni', 'student'] },
        department: { $regex: new RegExp(`^${req.user.department}$`, 'i') },
        branch: { $regex: new RegExp(`^${req.user.branch}$`, 'i') }
      });
      debugInfo = { 
        professorAccess: true, 
        department: req.user.department, 
        branch: req.user.branch,
        totalUsersFound: users.length
      };
    } else {
      users = [];
      debugInfo = { noAccess: true };
    }
    
    res.status(200).json({
      status: "success",
      data: {
        users
      },
    });
  } catch (error) {
    console.error("Error during fetching all users:", error);
    res.status(500).json({
      status: "fail",
      message: "Internal Server Error",
    });
  }
}

// Audit log helper
function logAdminAction(adminId, action, details) {
  const logPath = path.join(__dirname, '../../admin_audit.log');
  const logEntry = `${new Date().toISOString()} | Admin: ${adminId} | Action: ${action} | Details: ${JSON.stringify(details)}\n`;
  fs.appendFileSync(logPath, logEntry);
}

// Approve user (collegeadmin, professor, alumni)
async function approveUser(req, res) {
  try {
    const { userId } = req.body;
    console.log('Approval request:', {
      requestingUser: {
        id: req.user._id,
        role: req.user.role,
        department: req.user.department,
        branch: req.user.branch
      },
      targetUserId: userId
    });
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }
    
    console.log('Target user found:', {
      id: user._id,
      role: user.role,
      department: user.department,
      branch: user.branch,
      isApproved: user.isApproved
    });
    
    // Role-based approval permissions
    if (req.user.role === 'admin') {
      // Main admin can approve anyone
    } else if (req.user.role === 'collegeadmin') {
      // College admin can only approve users from their department
      if (user.role === 'collegeadmin') {
        return res.status(403).json({ status: 'fail', message: 'College admins cannot approve other college admins.' });
      }
      if (user.department?.toLowerCase() !== req.user.department?.toLowerCase()) {
        return res.status(403).json({ status: 'fail', message: 'You can only approve users from your department.' });
      }
      if (!['professor', 'alumni', 'student'].includes(user.role)) {
        return res.status(403).json({ status: 'fail', message: 'College admins can only approve professors, alumni, and students.' });
      }
    } else if (req.user.role === 'professor') {
      console.log('Professor approval check:', {
        professorBranch: req.user.branch,
        studentRole: user.role,
        studentBranch: user.branch,
        branchMatch: user.branch?.toLowerCase() === req.user.branch?.toLowerCase()
      });
      
      // Check if professor is assigned as branch manager
      const professorRecord = await Professor.findOne({ user: req.user._id });
      
      if (!professorRecord || !professorRecord.isBranchManager) {
        console.log('Rejected: Professor is not assigned as branch manager');
        return res.status(403).json({ 
          status: 'fail', 
          message: 'You are not assigned as a branch manager. Contact your college admin to get branch management permissions.' 
        });
      }
      
      // Professor can only approve students from their branch
      if (user.role !== 'student') {
        console.log('Rejected: Professor can only approve students');
        return res.status(403).json({ status: 'fail', message: 'Professors can only approve students.' });
      }
      if (user.branch?.toLowerCase() !== req.user.branch?.toLowerCase()) {
        console.log('Rejected: Branch mismatch');
        return res.status(403).json({ status: 'fail', message: 'You can only approve students from your branch.' });
      }
      console.log('Professor approval authorized');
    } else {
      return res.status(403).json({ status: 'fail', message: 'Only admin, collegeadmin, or professor can approve users.' });
    }
    
    user.isApproved = true;
    await user.save();
    
    // If a professor is approving a student, also update the Student model
    if (req.user.role === 'professor' && user.role === 'student') {
      const studentRecord = await Student.findOne({ user: userId });
      if (studentRecord) {
        studentRecord.approvalStatus = 'approved';
        studentRecord.approvedBy = req.user._id;
        studentRecord.approvedAt = new Date();
        await studentRecord.save();
      }
    }
    
    logAdminAction(req.user._id, 'APPROVE_USER', { userId, userRole: user.role, userDepartment: user.department });
    res.status(200).json({ status: 'success', message: 'User approved successfully' });
  } catch (error) {
    console.error('Error approving user:', error);
    res.status(500).json({ status: 'fail', message: 'Internal Server Error' });
  }
}

// Get all unapproved users (students, alumni, professors) based on role permissions
async function getUnapprovedUsers(req, res) {
  try {
    let users;
    if (req.user.role === 'admin') {
      // Main admin can see all unapproved users
      users = await User.find({ 
        role: { $in: ['collegeadmin', 'professor', 'alumni', 'student'] }, 
        isApproved: false 
      });
    } else if (req.user.role === 'collegeadmin') {
      // College admin can only see unapproved users from their department (case-insensitive)
      const filter = { 
        role: { $in: ['professor', 'alumni', 'student'] }, 
        isApproved: false, 
        department: { $regex: new RegExp(`^${req.user.department}$`, 'i') }
      };
      users = await User.find(filter);
    } else if (req.user.role === 'professor') {
      // Professor can see unapproved alumni and students from their department and branch (case-insensitive)
      const filter = { 
        role: { $in: ['alumni', 'student'] }, 
        isApproved: false, 
        department: { $regex: new RegExp(`^${req.user.department}$`, 'i') },
        branch: { $regex: new RegExp(`^${req.user.branch}$`, 'i') }
      };
      users = await User.find(filter);
    } else {
      users = [];
    }
    
    res.status(200).json({
      status: "success",
      data: { users },
    });
  } catch (error) {
    console.error('Error fetching unapproved users:', error);
    res.status(500).json({ status: "fail", message: "Internal Server Error" });
  }
}

// Debug function to check all users and their departments
async function debugUsers(req, res) {
  try {
    const allUsers = await User.find({}, 'firstName lastName email role department branch isApproved');
    const currentUser = {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role,
      department: req.user.department,
      branch: req.user.branch
    };
    
    const departmentStats = {};
    allUsers.forEach(user => {
      if (user.department) {
        departmentStats[user.department] = (departmentStats[user.department] || 0) + 1;
      }
    });
    
    res.status(200).json({
      status: "success",
      data: {
        currentUser,
        allUsers,
        departmentStats,
        totalUsers: allUsers.length
      }
    });
  } catch (error) {
    console.error("Error in debug users:", error);
    res.status(500).json({
      status: "fail",
      message: "Internal Server Error",
    });
  }
}

// Get professors in college admin's department
async function getProfessorsInDepartment(req, res) {
  try {
    const user = req.user;
    if (user.role !== 'collegeadmin' && user.role !== 'admin') {
      return res.status(403).json({ status: 'fail', message: 'Only admin or college admin can view professors.' });
    }

    let filter = { role: 'professor' };
    
    // If college admin, only show professors from their department
    if (user.role === 'collegeadmin') {
      filter.department = { $regex: new RegExp(`^${user.department}$`, 'i') };
    }

    const professors = await User.find(filter)
      .select('firstName lastName email branch department _id isApproved');

    res.status(200).json({
      status: 'success',
      data: { allProfessors: professors }
    });
  } catch (error) {
    console.error('Error fetching professors:', error);
    res.status(500).json({ status: 'fail', message: 'Internal Server Error' });
  }
}

// Get college admins (approved)
async function getCollegeAdmins(req, res) {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'collegeadmin') {
      return res.status(403).json({ status: 'fail', message: 'Only admin or college admin can view college admins.' });
    }

    // Build filter for college admins
    const filter = { role: 'collegeadmin', isApproved: true };

    // If requester is a collegeadmin, exclude themselves from the list
    if (req.user.role === 'collegeadmin') {
      filter._id = { $ne: req.user._id };
    }

    const collegeAdmins = await User.find(filter)
      .select('firstName lastName email department collegeName _id')
      .sort({ lastName: 1, firstName: 1 });

    res.status(200).json({
      status: 'success',
      data: { collegeAdmins }
    });
  } catch (error) {
    console.error('Error fetching college admins:', error);
    res.status(500).json({ status: 'fail', message: 'Internal Server Error' });
  }
}

// Get all branches in college admin's department
async function getBranchesInDepartment(req, res) {
  try {
    const user = req.user;
    if (user.role !== 'collegeadmin') {
      return res.status(403).json({ status: 'fail', message: 'Only college admin can view branches.' });
    }

    // Get unique branches from students and alumni in the department
    const branches = await User.distinct('branch', {
      department: { $regex: new RegExp(`^${user.department}$`, 'i') },
      role: { $in: ['student', 'alumni', 'professor'] },
      branch: { $exists: true, $ne: null, $ne: '' }
    });

    res.status(200).json({
      status: 'success',
      data: { branches: branches.filter(branch => branch) }
    });
  } catch (error) {
    console.error('Error fetching branches:', error);
    res.status(500).json({ status: 'fail', message: 'Internal Server Error' });
  }
}

// Assign professor to branch
async function assignProfessorToBranch(req, res) {
  try {
    const { professorId, branch } = req.body;
    const user = req.user;

    if (user.role !== 'collegeadmin') {
      return res.status(403).json({ status: 'fail', message: 'Only college admin can assign professors to branches.' });
    }

    if (!professorId || !branch) {
      return res.status(400).json({ status: 'fail', message: 'professorId and branch are required.' });
    }

    const professor = await User.findById(professorId);
    if (!professor || professor.role !== 'professor') {
      return res.status(404).json({ status: 'fail', message: 'Professor not found.' });
    }

    // Check if professor is in the same department as college admin
    if (professor.department?.toLowerCase() !== user.department?.toLowerCase()) {
      return res.status(403).json({ status: 'fail', message: 'You can only assign professors from your department.' });
    }

    // Update professor's branch
    professor.branch = branch;
    await professor.save();

    logAdminAction(user._id, 'ASSIGN_PROFESSOR_BRANCH', { professorId, branch, professorName: `${professor.firstName} ${professor.lastName}` });

    res.status(200).json({
      status: 'success',
      message: `Professor ${professor.firstName} ${professor.lastName} has been assigned to ${branch} branch.`
    });
  } catch (error) {
    console.error('Error assigning professor to branch:', error);
    res.status(500).json({ status: 'fail', message: 'Internal Server Error' });
  }
}

// Assign professor as branch manager (can approve students)
async function assignBranchManager(req, res) {
  try {
    const { professorId } = req.body;
    const user = req.user;

    // Only college admin or main admin can assign branch managers
    if (user.role !== 'collegeadmin' && user.role !== 'admin') {
      return res.status(403).json({ 
        status: 'fail', 
        message: 'Only college admin or admin can assign branch managers.' 
      });
    }

    if (!professorId) {
      return res.status(400).json({ status: 'fail', message: 'professorId is required.' });
    }

    const professor = await User.findById(professorId);
    if (!professor || professor.role !== 'professor') {
      return res.status(404).json({ status: 'fail', message: 'Professor not found.' });
    }

    // Check if professor is in the same department as college admin (if college admin is making the assignment)
    if (user.role === 'collegeadmin' && professor.department?.toLowerCase() !== user.department?.toLowerCase()) {
      return res.status(403).json({ 
        status: 'fail', 
        message: 'You can only assign professors from your department as branch managers.' 
      });
    }

    // Get or create professor record
    let professorRecord = await Professor.findOne({ user: professorId });
    
    if (!professorRecord) {
      professorRecord = new Professor({
        user: professorId,
        department: professor.department,
        branch: professor.branch,
        isApproved: true, // Auto-approve when assigned as branch manager
        canApproveStudents: true,
        isBranchManager: true,
        assignedBy: user._id,
        assignedAt: new Date(),
        approvedBy: user._id,
        approvedAt: new Date()
      });
    } else {
      professorRecord.canApproveStudents = true;
      professorRecord.isBranchManager = true;
      professorRecord.assignedBy = user._id;
      professorRecord.assignedAt = new Date();
      if (!professorRecord.isApproved) {
        professorRecord.isApproved = true;
        professorRecord.approvedBy = user._id;
        professorRecord.approvedAt = new Date();
      }
    }

    await professorRecord.save();

    logAdminAction(user._id, 'ASSIGN_BRANCH_MANAGER', { 
      professorId, 
      professorName: `${professor.firstName} ${professor.lastName}`,
      branch: professor.branch,
      department: professor.department
    });

    res.status(200).json({
      status: 'success',
      message: `Professor ${professor.firstName} ${professor.lastName} has been assigned as branch manager for ${professor.branch} branch.`,
      data: { professorRecord }
    });
  } catch (error) {
    console.error('Error assigning branch manager:', error);
    res.status(500).json({ status: 'fail', message: 'Internal Server Error' });
  }
}

// Remove branch manager assignment
async function removeBranchManager(req, res) {
  try {
    const { professorId } = req.body;
    const user = req.user;

    // Only college admin or main admin can remove branch managers
    if (user.role !== 'collegeadmin' && user.role !== 'admin') {
      return res.status(403).json({ 
        status: 'fail', 
        message: 'Only college admin or admin can remove branch managers.' 
      });
    }

    if (!professorId) {
      return res.status(400).json({ status: 'fail', message: 'professorId is required.' });
    }

    const professor = await User.findById(professorId);
    if (!professor || professor.role !== 'professor') {
      return res.status(404).json({ status: 'fail', message: 'Professor not found.' });
    }

    // Check if professor is in the same department as college admin (if college admin is making the change)
    if (user.role === 'collegeadmin' && professor.department?.toLowerCase() !== user.department?.toLowerCase()) {
      return res.status(403).json({ 
        status: 'fail', 
        message: 'You can only manage professors from your department.' 
      });
    }

    // Update professor record
    const professorRecord = await Professor.findOne({ user: professorId });
    
    if (!professorRecord) {
      return res.status(404).json({ status: 'fail', message: 'Professor record not found.' });
    }

    professorRecord.isBranchManager = false;
    professorRecord.canApproveStudents = false;
    await professorRecord.save();

    logAdminAction(user._id, 'REMOVE_BRANCH_MANAGER', { 
      professorId, 
      professorName: `${professor.firstName} ${professor.lastName}`,
      branch: professor.branch,
      department: professor.department
    });

    res.status(200).json({
      status: 'success',
      message: `Professor ${professor.firstName} ${professor.lastName} has been removed as branch manager.`,
      data: { professorRecord }
    });
  } catch (error) {
    console.error('Error removing branch manager:', error);
    res.status(500).json({ status: 'fail', message: 'Internal Server Error' });
  }
}

// Get branch managers for a department
async function getBranchManagers(req, res) {
  try {
    const user = req.user;

    if (user.role !== 'collegeadmin' && user.role !== 'admin') {
      return res.status(403).json({ 
        status: 'fail', 
        message: 'Only college admin or admin can view branch managers.' 
      });
    }

    let filter = { isBranchManager: true };
    
    // If college admin, only show branch managers from their department
    if (user.role === 'collegeadmin') {
      filter.department = { $regex: new RegExp(`^${user.department}$`, 'i') };
    }

    const branchManagers = await Professor.find(filter).populate('user', 'firstName lastName email department branch');

    res.status(200).json({
      status: 'success',
      data: { branchManagers }
    });
  } catch (error) {
    console.error('Error getting branch managers:', error);
    res.status(500).json({ status: 'fail', message: 'Internal Server Error' });
  }
}

// Get unique departments (admin or collegeadmin)
async function getDepartments(req, res) {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'collegeadmin') {
      return res.status(403).json({ status: 'fail', message: 'Only admin or collegeadmin can view departments.' });
    }
    const departments = await User.distinct('department', { department: { $exists: true, $ne: '' } });
    res.status(200).json({ status: 'success', data: { departments: departments.filter(d => d) } });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ status: 'fail', message: 'Internal Server Error' });
  }
}

// Get all branches (optionally filter by department query param)
async function getAllBranches(req, res) {
  try {
    // Allow admin to fetch all branches, collegeadmin can optionally pass a department query param
    const { department } = req.query;
    const filter = { branch: { $exists: true, $ne: '' } };
    if (department) filter.department = { $regex: new RegExp(`^${department}$`, 'i') };
    const branches = await User.distinct('branch', filter);
    res.status(200).json({ status: 'success', data: { branches: branches.filter(b => b) } });
  } catch (error) {
    console.error('Error fetching branches:', error);
    res.status(500).json({ status: 'fail', message: 'Internal Server Error' });
  }
}

module.exports = {
  getAllUsers,
  approveUser,
  getAllStudents,
  getUnapprovedStudents,
  getUnapprovedUsers,
  approveStudent,
  deleteStudent,
  updateUser,
  deleteCollegeAdmin,
  updateStudent,
  debugUsers,
  getProfessorsInDepartment,
  assignProfessorToBranch,
  getBranchesInDepartment,
  assignBranchManager,
  removeBranchManager,
  getBranchManagers,
  getCollegeAdmins,
};

// Export new endpoints
module.exports.getDepartments = getDepartments;
module.exports.getAllBranches = getAllBranches;
