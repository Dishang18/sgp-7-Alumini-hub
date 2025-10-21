const mongoose = require("mongoose");

const MeetingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  meetingLink: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // professor or collegeadmin
  alumni: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // target alumni
  date: { type: Date, required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  rejectionReason: { type: String }, // Reason provided by alumni when rejecting
  createdAt: { type: Date, default: Date.now },
});

// TTL index: automatically remove meetings when their `date` is in the past
// expireAfterSeconds: 0 means remove as soon as `date` < now
MeetingSchema.index({ date: 1 }, { expireAfterSeconds: 0 });

const Meeting = mongoose.models.Meeting || mongoose.model("Meeting", MeetingSchema);

module.exports = { Meeting };
