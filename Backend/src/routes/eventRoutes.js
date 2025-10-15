const express = require("express");
const router = express.Router();
const {
  createEventController,
  getAllEventsController,
  createEventRequestController,
  getEventRequestsController,
  approveEventRequestController,
  rejectEventRequestController,
  updateEventController,
  deleteEventController,
  manualCleanupController,
  getEventsByDepartmentController,
  getDepartmentEventStatsController,
  debugEventsController,
} = require("../controllers/eventController");
const checkAuth = require("../middlewares/checkAuth");

// Assuming you have middleware for authentication
router.use(checkAuth);
 


router.post("/request/create", createEventRequestController);

router.get("/requests", getEventRequestsController);

router.put("/request/:id/approve", approveEventRequestController);

router.put("/request/:id/reject", rejectEventRequestController);


// CRUD routes
router.post("/create", createEventController);

// Get all events (filtered by user's department and role)
router.get("/all", getAllEventsController);

// Get events by specific department (admin/collegeadmin only)
router.get("/department/:department", getEventsByDepartmentController);

// Get department event statistics (admin only)
router.get("/stats/departments", getDepartmentEventStatsController);

router.put("/update/:id", updateEventController);
router.delete("/delete/:id", deleteEventController);

// Admin cleanup route
router.post("/cleanup", manualCleanupController);

// Debug route (admin only)
router.get("/debug", debugEventsController);

// Simple test route
router.get("/test", (req, res) => {
  res.json({
    status: "success",
    message: "Event routes are working",
    user: req.user ? {
      id: req.user._id,
      role: req.user.role,
      department: req.user.department
    } : null
  });
});

module.exports = router;
