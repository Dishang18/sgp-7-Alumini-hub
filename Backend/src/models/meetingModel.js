const mongoose = require("mongoose");

const MeetingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  meetingLink: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // professor or collegeadmin
  alumni: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // target alumni
  date: { type: Date, required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

const Meeting = mongoose.models.Meeting || mongoose.model("Meeting", MeetingSchema);

module.exports = { Meeting };
