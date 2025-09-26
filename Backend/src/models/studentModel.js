const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // firstName and lastName are now only in User model
  enrollmentNumber: {
    type: String,
    required: true,
    unique: true,
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
  year: {
    type: Number,
    required: true,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the professor who approved this student
  },
  approvedAt: {
    type: Date,
  },
  approvalStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
}, {
  timestamps: true,
});

const Student = mongoose.model("Student", StudentSchema);
module.exports = Student;
