const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  department: {
    type: String,
    required: false, // Made optional for backwards compatibility with legacy events
  },
  branch: {
    type: String,
    required: false, // Optional, for more specific targeting
  },
  targetAudience: {
    type: [String],
    enum: ["student", "alumni", "professor", "collegeadmin"],
    default: ["student"], // By default, events are for students
  },
});

const Event = mongoose.models.Event || mongoose.model("Event", eventSchema);

module.exports = { Event };
