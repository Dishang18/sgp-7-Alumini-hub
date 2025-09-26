         
const { User } = require("../models/user");
const Student = require("../models/studentModel");
const { Professor } = require("../models/professorModel");
const bcrypt = require('bcryptjs');

const registerController = async (req, res) => {
  try {
    console.log('Registration request received:', {
      body: req.body,
      contentType: req.get('Content-Type')
    });
    
    const { email, password, role, firstName, lastName, department, branch, enrollmentNumber, year, startYear, endYear, degree, rollNumber, collegeName } = req.body;
    // Basic validation
    if (!email || !password || !role || !firstName || !lastName) {
      return res.status(400).json({ status: "fail", message: "Email, password, role, firstName, and lastName are required." });
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return res.status(400).json({ status: "fail", message: "Invalid email format." });
    }
    if (password.length < 6) {
      return res.status(400).json({ status: "fail", message: "Password must be at least 6 characters." });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ status: "fail", message: "Email is already registered. Please use a different email." });
    }
    // Role-specific required fields
    if (role === "student") {
      if (!enrollmentNumber || !department || !branch || !year) {
        return res.status(400).json({ status: "fail", message: "enrollmentNumber, department, branch, and year are required for students." });
      }
    } else if (role === "alumni") {
      if (!startYear || !endYear || !degree || !department || !branch || !rollNumber) {
        return res.status(400).json({ status: "fail", message: "startYear, endYear, degree, department, branch, and rollNumber are required for alumni." });
      }
    } else if (role === "professor") {
      if (!department || !branch) {
        return res.status(400).json({ status: "fail", message: "department and branch are required for professors." });
      }
    } else if (role === "collegeadmin") {
      if (!department) {
        return res.status(400).json({ status: "fail", message: "department is required for college admins." });
      }
      // Note: College admin registration is allowed during public registration
      // They will need approval from main admin after registration
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = {
      email,
      password: hashedPassword,
      role,
      firstName,
      lastName,
      department,
      branch,
      enrollmentNumber,
      year,
      startYear,
      endYear,
      degree,
      rollNumber,
      collegeName,
  isApproved: role === 'admin' ? true : false
    };
    const newUser = await User.create(userData);
    
    // Create additional records based on role
    if (role === "student") {
      await Student.create({
        user: newUser._id,
        enrollmentNumber,
        department,
        branch,
        year,
        approvalStatus: "pending"
      });
      console.log('Student record created for:', newUser.email);
    } else if (role === "professor") {
      await Professor.create({
        user: newUser._id,
        department,
        branch,
        isApproved: false,
        canApproveStudents: false
      });
      console.log('Professor record created for:', newUser.email);
    }
    
    console.log('User registered successfully:', {
      email: newUser.email,
      role: newUser.role,
      department: newUser.department,
      branch: newUser.branch,
      isApproved: newUser.isApproved
    });
    
    res.status(201).json({
      status: "success",
      data: {
        user: newUser,
      },
    });
  } catch (error) {
    console.error("Error during registration:", error);
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        status: "fail",
        message: "Validation error: " + errors.join(', ')
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        status: "fail",
        message: "Email already exists"
      });
    }
    
    res.status(500).json({
      status: "fail",
      message: "Internal Server Error: " + error.message,
    });
  }
};

module.exports = registerController;



