// models/Job.js
const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    vacancy: {
      type: Number,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming you have a User model
      required: true,
    },
    link: {
      type: String,
      required: false,
    },
    department: {
      type: String,
      required: true,
    },
    branch: {
      type: String,
      required: false, // Optional, for more specific targeting
    },
    targetAudience: {
      type: [String],
      enum: ["student", "alumni"],
      default: ["student"], // By default, jobs are for students
    },
  },
  {
    timestamps: true,
  }
);

const Job = mongoose.models.Job || mongoose.model("Job", jobSchema);

module.exports = { Job };
