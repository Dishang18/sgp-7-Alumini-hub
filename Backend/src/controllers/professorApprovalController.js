const Student = require("../models/studentModel");
const { User } = require("../models/user");
const { Professor } = require("../models/professorModel");
const { ApiResponse } = require("../utils/ApiResponse");
const { ApiError } = require("../utils/ApiError");
const { asyncHandler } = require("../utils/asyncHandler");

// Get pending students for professor approval (same branch)
const getPendingStudentsForProfessor = asyncHandler(async (req, res) => {
  try {
    const professorId = req.user._id;
    
    // Get professor's branch and department
    const professor = await User.findById(professorId);
    if (!professor || professor.role !== 'professor') {
      throw new ApiError(403, "Access denied. Professor role required.");
    }

    // Check if professor is assigned as branch manager
    const professorRecord = await Professor.findOne({ user: professorId });
    if (!professorRecord || !professorRecord.isBranchManager) {
      throw new ApiError(403, "Access denied. Only branch managers can view pending students. Contact your college admin to get branch management permissions.");
    }

    // Find pending students in the same branch and department
    const pendingStudents = await Student.find({
      department: professor.department,
      branch: professor.branch,
      approvalStatus: "pending"
    }).populate({
      path: "user",
      select: "firstName lastName email"
    }).sort({ createdAt: -1 });

    console.log(`Found ${pendingStudents.length} pending students for professor in ${professor.department}/${professor.branch}`);

    res.status(200).json(
      new ApiResponse(200, pendingStudents, "Pending students fetched successfully")
    );
  } catch (error) {
    console.error("Error fetching pending students:", error);
    throw new ApiError(500, error.message || "Failed to fetch pending students");
  }
});

// Approve student by professor
const approveStudentByProfessor = asyncHandler(async (req, res) => {
  try {
    const { studentId } = req.params;
    const { action } = req.body; // 'approve' or 'reject'
    const professorId = req.user._id;

    // Get professor's details
    const professor = await User.findById(professorId);
    if (!professor || professor.role !== 'professor') {
      throw new ApiError(403, "Access denied. Professor role required.");
    }

    // Check if professor is assigned as branch manager
    const professorRecord = await Professor.findOne({ user: professorId });
    if (!professorRecord || !professorRecord.isBranchManager) {
      throw new ApiError(403, "Access denied. Only branch managers can approve students. Contact your college admin to get branch management permissions.");
    }

    // Find the student
    const student = await Student.findById(studentId).populate('user');
    if (!student) {
      throw new ApiError(404, "Student not found");
    }

    // Check if professor has authority to approve this student (same branch/department)
    if (student.department !== professor.department || student.branch !== professor.branch) {
      throw new ApiError(403, "You can only approve students from your department and branch");
    }

    // Check if already processed
    if (student.approvalStatus !== 'pending') {
      throw new ApiError(400, `Student is already ${student.approvalStatus}`);
    }

    // Update student approval status
    if (action === 'approve') {
      student.approvalStatus = 'approved';
      student.isApproved = true;
      student.approvedBy = professorId;
      student.approvedAt = new Date();
    } else if (action === 'reject') {
      student.approvalStatus = 'rejected';
      student.isApproved = false;
    } else {
      throw new ApiError(400, "Invalid action. Use 'approve' or 'reject'");
    }

    await student.save();

    console.log(`Student ${student.user.firstName} ${student.user.lastName} ${action}d by professor ${professor.firstName} ${professor.lastName}`);

    res.status(200).json(
      new ApiResponse(200, student, `Student ${action}d successfully`)
    );
  } catch (error) {
    console.error("Error processing student approval:", error);
    throw new ApiError(500, error.message || "Failed to process student approval");
  }
});

// Get approved students by professor (for professor's record)
const getApprovedStudentsByProfessor = asyncHandler(async (req, res) => {
  try {
    const professorId = req.user._id;
    
    // Get professor's branch and department
    const professor = await User.findById(professorId);
    if (!professor || professor.role !== 'professor') {
      throw new ApiError(403, "Access denied. Professor role required.");
    }

    // Check if professor is assigned as branch manager
    const professorRecord = await Professor.findOne({ user: professorId });
    if (!professorRecord || !professorRecord.isBranchManager) {
      throw new ApiError(403, "Access denied. Only branch managers can view approved students. Contact your college admin to get branch management permissions.");
    }

    // Find approved students by this professor
    const approvedStudents = await Student.find({
      approvedBy: professorId,
      approvalStatus: "approved"
    }).populate({
      path: "user",
      select: "firstName lastName email"
    }).sort({ approvedAt: -1 });

    console.log(`Found ${approvedStudents.length} students approved by professor ${professor.firstName} ${professor.lastName}`);

    res.status(200).json(
      new ApiResponse(200, approvedStudents, "Approved students fetched successfully")
    );
  } catch (error) {
    console.error("Error fetching approved students:", error);
    throw new ApiError(500, error.message || "Failed to fetch approved students");
  }
});

// Get student approval statistics for professor
const getStudentApprovalStats = asyncHandler(async (req, res) => {
  try {
    const professorId = req.user._id;
    
    // Get professor's details
    const professor = await User.findById(professorId);
    if (!professor || professor.role !== 'professor') {
      throw new ApiError(403, "Access denied. Professor role required.");
    }

    // Check if professor is assigned as branch manager
    const professorRecord = await Professor.findOne({ user: professorId });
    if (!professorRecord || !professorRecord.isBranchManager) {
      throw new ApiError(403, "Access denied. Only branch managers can view approval statistics. Contact your college admin to get branch management permissions.");
    }

    // Get counts for students in professor's branch/department
    const totalPending = await Student.countDocuments({
      department: professor.department,
      branch: professor.branch,
      approvalStatus: "pending"
    });

    const totalApprovedByMe = await Student.countDocuments({
      approvedBy: professorId,
      approvalStatus: "approved"
    });

    const totalRejectedByMe = await Student.countDocuments({
      approvedBy: professorId,
      approvalStatus: "rejected"
    });

    const totalInMyBranch = await Student.countDocuments({
      department: professor.department,
      branch: professor.branch
    });

    const stats = {
      totalPending,
      totalApprovedByMe,
      totalRejectedByMe,
      totalInMyBranch,
      professorInfo: {
        department: professor.department,
        branch: professor.branch,
        name: `${professor.firstName} ${professor.lastName}`
      }
    };

    res.status(200).json(
      new ApiResponse(200, stats, "Student approval statistics fetched successfully")
    );
  } catch (error) {
    console.error("Error fetching approval statistics:", error);
    throw new ApiError(500, error.message || "Failed to fetch approval statistics");
  }
});

module.exports = {
  getPendingStudentsForProfessor,
  approveStudentByProfessor,
  getApprovedStudentsByProfessor,
  getStudentApprovalStats
};