const express = require("express");
const {
  getPendingStudentsForProfessor,
  approveStudentByProfessor,
  getApprovedStudentsByProfessor,
  getStudentApprovalStats
} = require("../controllers/professorApprovalController");
const checkAuth = require("../middlewares/checkAuth");

const router = express.Router();

// All routes require authentication
router.use(checkAuth);

// Get pending students for approval (professor only)
router.get("/pending-students", getPendingStudentsForProfessor);

// Approve or reject a student (professor only)
router.put("/student/:studentId/approve", approveStudentByProfessor);

// Get students approved by this professor
router.get("/approved-students", getApprovedStudentsByProfessor);

// Get approval statistics for professor
router.get("/approval-stats", getStudentApprovalStats);

module.exports = router;