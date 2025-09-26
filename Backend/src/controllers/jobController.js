// controllers/jobController.js
const { Job } = require("../models/job");

// Controller to create a job (collegeadmin, professor, alumni only)
const createJobController = async (req, res) => {
  try {
    if (!["collegeadmin", "professor", "alumni"].includes(req.user.role)) {
      return res.status(403).json({ status: "fail", message: "Only collegeadmins, professors, or alumni can post jobs." });
    }

    const { title, description, vacancy, link, targetAudience, branch } = req.body;
    const createdBy = req.user._id;

    // Get the creator's department for department-based filtering
    const creatorDepartment = req.user.department;
    const creatorBranch = req.user.branch;

    if (!creatorDepartment) {
      return res.status(400).json({ 
        status: "fail", 
        message: "User must have a department to post jobs." 
      });
    }

    // Create job with department filtering
    const jobData = {
      title,
      description,
      vacancy,
      link,
      createdBy,
      department: creatorDepartment,
      targetAudience: targetAudience || ["student"], // Default to students
    };

    // If specific branch is provided, use it; otherwise use creator's branch for more specific targeting
    if (branch) {
      jobData.branch = branch;
    } else if (creatorBranch && req.user.role === "alumni") {
      jobData.branch = creatorBranch; // Alumni jobs target their own branch by default
    }

    const job = await Job.create(jobData);

    // Populate the created job with creator details for response
    await job.populate("createdBy", "firstName lastName email role department branch");

    res.status(201).json({
      status: "success",
      data: { job },
      message: `Job posted for ${creatorDepartment} department${jobData.branch ? ` (${jobData.branch} branch)` : ''}`
    });
  } catch (error) {
    console.error("Error during job creation:", error);
    res.status(500).json({
      status: "fail",
      message: "Internal Server Error",
    });
  }
};
// Controller for students to apply for a job
const applyJobController = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ status: "fail", message: "Only students can apply for jobs." });
    }
    // You may want to store applications in a separate collection, or add an array to Job
    // For now, just return success (implement actual storage as needed)
    // const { jobId } = req.params;
    // const { coverLetter, resumeUrl } = req.body;
    // Save application logic here
    res.status(200).json({ status: "success", message: "Application submitted (demo, not stored)." });
  } catch (error) {
    res.status(500).json({ status: "fail", message: "Internal Server Error" });
  }
};

// Controller to get all jobs (filtered by department and role)
const getAllJobsController = async (req, res) => {
  try {
    let jobQuery = {};
    const userRole = req.user.role;
    const userDepartment = req.user.department;
    const userBranch = req.user.branch;

    // Admin and collegeadmin can see all jobs
    if (userRole === "admin") {
      jobQuery = {}; // No filter - see all jobs
    } else if (userRole === "collegeadmin") {
      // College admin sees jobs from their department
      jobQuery = { department: userDepartment };
    } else if (userRole === "student") {
      // Students see jobs from their department and targeted to students
      jobQuery = {
        department: userDepartment,
        targetAudience: "student"
      };
      
      // If branch is specified in job, filter by student's branch too
      if (userBranch) {
        jobQuery.$or = [
          { branch: { $exists: false } }, // Jobs without branch restriction
          { branch: null }, // Jobs with null branch
          { branch: userBranch } // Jobs specifically for their branch
        ];
      }
    } else if (userRole === "alumni") {
      // Alumni see jobs from their department (both student and alumni targeted)
      jobQuery = {
        department: userDepartment,
        targetAudience: { $in: ["student", "alumni"] }
      };
    } else if (userRole === "professor") {
      // Professors see jobs from their department
      jobQuery = { department: userDepartment };
    } else {
      // No access for other roles
      return res.status(403).json({
        status: "fail",
        message: "Access denied. Invalid role for viewing jobs."
      });
    }

    const jobs = await Job.find(jobQuery)
      .populate("createdBy", "firstName lastName email role department branch")
      .sort({ createdAt: -1 }); // Most recent jobs first

    // Add additional metadata for better user experience
    const jobsWithMetadata = jobs.map(job => ({
      ...job.toObject(),
      isRelevantToUser: job.department === userDepartment,
      isBranchMatch: !job.branch || job.branch === userBranch,
      postedBy: {
        name: `${job.createdBy.firstName} ${job.createdBy.lastName}`,
        role: job.createdBy.role,
        department: job.createdBy.department
      }
    }));

    res.status(200).json({
      status: "success",
      data: {
        jobs: jobsWithMetadata,
      },
      meta: {
        totalJobs: jobs.length,
        userDepartment: userDepartment,
        userRole: userRole,
        filter: userRole === "admin" ? "All departments" : `${userDepartment} department only`,
        message: jobs.length === 0 
          ? `No jobs available for ${userDepartment} department`
          : `${jobs.length} job${jobs.length > 1 ? 's' : ''} found for ${userDepartment} department`
      }
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({
      status: "fail",
      message: "Internal Server Error",
    });
  }
};


// Update a job (admin/collegeadmin: any job, professor/alumni: only their own)
const updateJobController = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ status: "fail", message: "Job not found." });
    
    const userRole = req.user.role;
    const isOwner = String(job.createdBy) === String(req.user._id);
    
    // Permission check
    if (
      userRole === "admin" ||
      userRole === "collegeadmin" ||
      (userRole === "professor" && isOwner) ||
      (userRole === "alumni" && isOwner)
    ) {
      const { title, description, vacancy, link, targetAudience, branch } = req.body;
      
      // Update basic fields
      if (title) job.title = title;
      if (description) job.description = description;
      if (vacancy) job.vacancy = vacancy;
      if (link !== undefined) job.link = link;
      
      // Update target audience (only if provided)
      if (targetAudience) {
        job.targetAudience = targetAudience;
      }
      
      // Update branch (only if provided, and only if user has permission)
      if (branch !== undefined) {
        // Only allow branch changes if user is admin or the original creator
        if (userRole === "admin" || isOwner) {
          job.branch = branch;
        }
      }
      
      // Department cannot be changed once set (maintains department-based filtering)
      
      await job.save();
      
      // Populate and return updated job
      await job.populate("createdBy", "firstName lastName email role department branch");
      
      res.status(200).json({ 
        status: "success", 
        data: { job },
        message: "Job updated successfully"
      });
    } else {
      return res.status(403).json({ 
        status: "fail", 
        message: "You do not have permission to update this job." 
      });
    }
  } catch (error) {
    console.error("Error updating job:", error);
    res.status(500).json({ status: "fail", message: "Internal Server Error" });
  }
};

// Delete a job (admin/collegeadmin: any job, professor/alumni: only their own)
const deleteJobController = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ status: "fail", message: "Job not found." });
    const userRole = req.user.role;
    const isOwner = String(job.createdBy) === String(req.user._id);
    if (
      userRole === "admin" ||
      userRole === "collegeadmin" ||
      (userRole === "professor" && isOwner) ||
      (userRole === "alumni" && isOwner)
    ) {
      await job.deleteOne();
      res.status(200).json({ status: "success", message: "Job deleted successfully." });
    } else {
      return res.status(403).json({ status: "fail", message: "You do not have permission to delete this job." });
    }
  } catch (error) {
    res.status(500).json({ status: "fail", message: "Internal Server Error" });
  }
};

// Get jobs by specific department (admin/collegeadmin only)
const getJobsByDepartmentController = async (req, res) => {
  try {
    if (!["admin", "collegeadmin"].includes(req.user.role)) {
      return res.status(403).json({ 
        status: "fail", 
        message: "Only admin or college admin can view jobs by department." 
      });
    }

    const { department } = req.params;
    
    if (!department) {
      return res.status(400).json({
        status: "fail",
        message: "Department parameter is required."
      });
    }

    // College admin can only view their own department
    if (req.user.role === "collegeadmin" && req.user.department !== department) {
      return res.status(403).json({
        status: "fail",
        message: "College admin can only view jobs from their own department."
      });
    }

    const jobs = await Job.find({ department })
      .populate("createdBy", "firstName lastName email role department branch")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      data: { jobs },
      meta: {
        department,
        totalJobs: jobs.length,
        message: `${jobs.length} job${jobs.length !== 1 ? 's' : ''} found in ${department} department`
      }
    });
  } catch (error) {
    console.error("Error fetching jobs by department:", error);
    res.status(500).json({
      status: "fail",
      message: "Internal Server Error",
    });
  }
};

// Get available departments with job counts
const getDepartmentJobStatsController = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ 
        status: "fail", 
        message: "Only admin can view department job statistics." 
      });
    }

    const stats = await Job.aggregate([
      {
        $group: {
          _id: "$department",
          totalJobs: { $sum: 1 },
          activeJobs: { 
            $sum: { 
              $cond: [{ $gte: ["$createdAt", new Date(Date.now() - 30*24*60*60*1000)] }, 1, 0] 
            } 
          }
        }
      },
      {
        $sort: { totalJobs: -1 }
      }
    ]);

    res.status(200).json({
      status: "success",
      data: { departmentStats: stats },
      meta: {
        totalDepartments: stats.length,
        message: `Job statistics for ${stats.length} departments`
      }
    });
  } catch (error) {
    console.error("Error fetching department job stats:", error);
    res.status(500).json({
      status: "fail",
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  createJobController,
  getAllJobsController,
  applyJobController,
  updateJobController,
  deleteJobController,
  getJobsByDepartmentController,
  getDepartmentJobStatsController,
};
