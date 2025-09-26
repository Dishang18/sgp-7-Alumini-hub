const mongoose = require("mongoose");

const ProfessorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  department: {
    type: String,
    required: true,
    trim: true,
  },
  branch: {
    type: String,
    required: true,
    trim: true,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  canApproveStudents: {
    type: Boolean,
    default: false, // This will be set to true by college admin
  },
  isBranchManager: {
    type: Boolean,
    default: false, // Set to true if this professor is assigned to manage their branch
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the admin/college admin who assigned this professor
  },
  assignedAt: {
    type: Date,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the college admin who approved this professor
  },
  approvedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

const Professor = mongoose.model("Professor", ProfessorSchema);
module.exports = { Professor };
