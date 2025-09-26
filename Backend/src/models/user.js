
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["alumni", "admin", "collegeadmin", "professor", "student"],
    required: true,
  },
  department: {
    type: String,
    required: function() {
      return ["collegeadmin", "professor", "alumni", "student"].includes(this.role);
    },
  },
  branch: {
    type: String,
    required: function() {
      return ["professor", "alumni", "student"].includes(this.role);
    },
  },
  enrollmentNumber: {
    type: String,
    required: function() { return this.role === "student"; },
    unique: false,
  },
  year: {
    type: Number,
    required: function() { return this.role === "student"; },
  },
  startYear: {
    type: Number,
    required: function() { return this.role === "alumni"; },
  },
  endYear: {
    type: Number,
    required: function() { return this.role === "alumni"; },
  },
  degree: {
    type: String,
    required: function() { return this.role === "alumni"; },
  },
  rollNumber: {
    type: String,
    required: function() { return this.role === "alumni"; },
  },
  verified: {
    type: Boolean,
    default: false,
  },
  education: [
    {
      startYear: String,
      endYear: String,
      course: String,
      school: String,
    },
  ],
  workExperiences: [
    {
      startYear: String,
      endYear: String,
      company: String,
      workTitle: String,
      industry: String,
    },
  ],
  mobileNumber: Number,
  socialProfiles: {
    facebook: {
      type: String,
      default: "https://www.facebook.com/",
    },
    linkedin: {
      type: String,
      default: "https://www.linkedin.com/",
    },
  },
  imageUrl: String,
  skills: [String],
  collegeName: {
    type: String,
    required: function() { return this.role === "collegeadmin"; },
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

module.exports = { User };
