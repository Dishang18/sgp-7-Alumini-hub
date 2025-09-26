const { updateMeeting, deleteMeeting } = require("../controllers/meetingController");

const express = require("express");
const router = express.Router();
const checkAuth = require("../middlewares/checkAuth");
const { createMeeting, getMeetings, approveMeeting, rejectMeeting } = require("../controllers/meetingController");


// Professors/collegeadmins create meeting request to alumni
router.post("/", checkAuth, createMeeting);
// Alumni approve/reject meeting
router.patch("/:id/approve", checkAuth, approveMeeting);
router.patch("/:id/reject", checkAuth, rejectMeeting);
// Get meetings (role-based)
router.get("/", checkAuth, getMeetings);

// Update meeting (only by creator)
router.put("/:id", checkAuth, updateMeeting);
// Delete meeting (only by creator)
router.delete("/:id", checkAuth, deleteMeeting);

module.exports = router;
