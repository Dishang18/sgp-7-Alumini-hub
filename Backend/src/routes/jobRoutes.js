// routes/jobRoutes.js
const express = require("express");
const router = express.Router();
const {
  createJobController,
  getAllJobsController,
  applyJobController,
  updateJobController,
  deleteJobController,
  getJobsByDepartmentController,
  getDepartmentJobStatsController,
} = require("../controllers/jobController");

const checkAuth = require("../middlewares/checkAuth");

// Assuming you have middleware for authentication

// Post a job (collegeadmin, professor, alumni)
router.post("/create", checkAuth, createJobController);

// Get all jobs (filtered by user's department and role)
router.get("/all", checkAuth, getAllJobsController);

// Get jobs by specific department (admin/collegeadmin only)
router.get("/department/:department", checkAuth, getJobsByDepartmentController);

// Get department job statistics (admin only)
router.get("/stats/departments", checkAuth, getDepartmentJobStatsController);

// Student applies for a job
router.post("/apply/:jobId", checkAuth, applyJobController);

// Update a job (only by creator or admin)
router.put("/update/:id", checkAuth, updateJobController);

// Delete a job (only by creator or admin)
router.delete("/delete/:id", checkAuth, deleteJobController);

module.exports = router;
