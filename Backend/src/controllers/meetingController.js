// Update meeting (only by creator)
const updateMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });
    if (!req.user._id.equals(meeting.createdBy)) {
      return res.status(403).json({ message: "Only the creator can update this meeting." });
    }
    const { title, description, meetingLink, date } = req.body;
    if (title) meeting.title = title;
    if (description) meeting.description = description;
    if (meetingLink) meeting.meetingLink = meetingLink;
    if (date) meeting.date = date;
    await meeting.save();
    res.status(200).json({ message: "Meeting updated", meeting });
  } catch (error) {
    res.status(500).json({ message: "Error updating meeting", error });
  }
};

// Delete meeting (only by creator)
const deleteMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });
    if (!req.user._id.equals(meeting.createdBy)) {
      return res.status(403).json({ message: "Only the creator can delete this meeting." });
    }
    await meeting.deleteOne();
    res.status(200).json({ message: "Meeting deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting meeting", error });
  }
};

const { Meeting } = require("../models/meetingModel");

// Professors/collegeadmins create meeting request to specific alumni
const createMeeting = async (req, res) => {
  try {
    if (!(req.user.role === "professor" || req.user.role === "collegeadmin")) {
      return res.status(403).json({ message: "Only professor or collegeadmin can create meetings." });
    }
    const { title, description, meetingLink, date, alumni } = req.body;
    if (!alumni) {
      return res.status(400).json({ message: "Target alumni is required." });
    }
    const meeting = await Meeting.create({
      title,
      description,
      meetingLink,
      date,
      alumni,
      createdBy: req.user._id,
      status: "pending",
    });
    res.status(201).json({ meeting });
  } catch (error) {
    res.status(500).json({ message: "Error creating meeting", error });
  }
};

// Alumni approve meeting
const approveMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });
    if (!req.user._id.equals(meeting.alumni)) {
      return res.status(403).json({ message: "Only the target alumni can approve this meeting." });
    }
    meeting.status = "approved";
    await meeting.save();
    res.status(200).json({ message: "Meeting approved", meeting });
  } catch (error) {
    res.status(500).json({ message: "Error approving meeting", error });
  }
};

// Alumni reject meeting
const rejectMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });
    if (!req.user._id.equals(meeting.alumni)) {
      return res.status(403).json({ message: "Only the target alumni can reject this meeting." });
    }
    meeting.status = "rejected";
    await meeting.save();
    res.status(200).json({ message: "Meeting rejected", meeting });
  } catch (error) {
    res.status(500).json({ message: "Error rejecting meeting", error });
  }
};

// Get meetings (filtered by role, admin sees all)
const getMeetings = async (req, res) => {
  try {
    let meetings;
    if (req.user.role === "admin") {
      meetings = await Meeting.find().populate("createdBy alumni");
    } else if (req.user.role === "student") {
      meetings = await Meeting.find({ status: "approved" }).populate("createdBy alumni");
    } else if (req.user.role === "alumni") {
      meetings = await Meeting.find({ alumni: req.user._id }).populate("createdBy alumni");
    } else if (req.user.role === "professor" || req.user.role === "collegeadmin") {
      meetings = await Meeting.find({ createdBy: req.user._id }).populate("createdBy alumni");
    } else {
      meetings = [];
    }
    res.status(200).json({ meetings });
  } catch (error) {
    res.status(500).json({ message: "Error fetching meetings", error });
  }
};

module.exports = { createMeeting, getMeetings, approveMeeting, rejectMeeting, updateMeeting, deleteMeeting };
