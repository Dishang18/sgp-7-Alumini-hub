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
const { User } = require("../models/user");

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
    
    // Verify the target alumni exists and check department access
    const targetAlumni = await User.findById(alumni);
    if (!targetAlumni) {
      return res.status(404).json({ message: "Target alumni not found." });
    }
    
    if (targetAlumni.role !== "alumni") {
      return res.status(400).json({ message: "Target user is not an alumni." });
    }
    
    // Check department access for college admin
    if (req.user.role === "collegeadmin") {
      if (targetAlumni.department?.toLowerCase() !== req.user.department?.toLowerCase()) {
        return res.status(403).json({ 
          message: "College admin can only create meetings with alumni from their department." 
        });
      }
    }
    
    // Check department and branch access for professor
    if (req.user.role === "professor") {
      if (targetAlumni.department?.toLowerCase() !== req.user.department?.toLowerCase() ||
          targetAlumni.branch?.toLowerCase() !== req.user.branch?.toLowerCase()) {
        return res.status(403).json({ 
          message: "Professor can only create meetings with alumni from their department and branch." 
        });
      }
    }
    
    console.log('Creating meeting:', {
      creator: { role: req.user.role, department: req.user.department, branch: req.user.branch },
      targetAlumni: { department: targetAlumni.department, branch: targetAlumni.branch }
    });
    
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
    console.error("Error creating meeting:", error);
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
    const { rejectionReason } = req.body;
    
    // Validate rejection reason is provided
    if (!rejectionReason || rejectionReason.trim() === "") {
      return res.status(400).json({ message: "Rejection reason is required when rejecting a meeting." });
    }
    
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });
    if (!req.user._id.equals(meeting.alumni)) {
      return res.status(403).json({ message: "Only the target alumni can reject this meeting." });
    }
    
    meeting.status = "rejected";
    meeting.rejectionReason = rejectionReason.trim();
    
    console.log('Meeting rejection:', {
      meetingId: meeting._id,
      alumniId: req.user._id,
      rejectionReason: rejectionReason.trim()
    });
    
    await meeting.save();
    res.status(200).json({ message: "Meeting rejected with reason", meeting });
  } catch (error) {
    console.error("Error rejecting meeting:", error);
    res.status(500).json({ message: "Error rejecting meeting", error });
  }
};

// Get meetings (filtered by role, admin sees all)
const getMeetings = async (req, res) => {
  try {
    let meetings;
    
    console.log('Get meetings request:', {
      userRole: req.user.role,
      userDepartment: req.user.department,
      userBranch: req.user.branch
    });
    
    if (req.user.role === "admin") {
      // Admin sees all meetings
      meetings = await Meeting.find().populate("createdBy alumni");
    } else if (req.user.role === "student") {
      // Students see approved meetings where both creator and alumni are from their department
      const approvedMeetings = await Meeting.find({ status: "approved" })
        .populate("createdBy alumni");
      
      // Filter meetings where either creator or alumni is from the same department
      meetings = approvedMeetings.filter(meeting => {
        const creatorDept = meeting.createdBy?.department?.toLowerCase();
        const alumniDept = meeting.alumni?.department?.toLowerCase();
        const userDept = req.user.department?.toLowerCase();
        
        return creatorDept === userDept || alumniDept === userDept;
      });
      
      console.log('Student meetings filter:', {
        totalApproved: approvedMeetings.length,
        filteredByDepartment: meetings.length,
        userDepartment: req.user.department
      });
      
    } else if (req.user.role === "alumni") {
      // Alumni see meetings where they are the target alumni
      meetings = await Meeting.find({ alumni: req.user._id }).populate("createdBy alumni");
    } else if (req.user.role === "professor" || req.user.role === "collegeadmin") {
      // Professors and college admins see meetings they created
      meetings = await Meeting.find({ createdBy: req.user._id }).populate("createdBy alumni");
    } else {
      meetings = [];
    }
    
    res.status(200).json({ meetings });
  } catch (error) {
    console.error("Error fetching meetings:", error);
    res.status(500).json({ message: "Error fetching meetings", error });
  }
};

module.exports = { createMeeting, getMeetings, approveMeeting, rejectMeeting, updateMeeting, deleteMeeting };
