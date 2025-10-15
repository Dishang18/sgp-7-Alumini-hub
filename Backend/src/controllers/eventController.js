const { Event } = require("../models/eventModel");
// eventrequest.js exports the model directly (module.exports = mongoose.model('EventRequest', ...))
// so require(...) returns the model, not an object with EventRequest property.
const EventRequest = require("../models/eventrequest");
const { isEventExpired, getTimeUntilExpiration } = require("../utils/eventCleanup");

const createEventController = async (req, res) => {
  try {
    console.log('🔍 Event creation attempt by user:', {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role,
      department: req.user.department
    });

    // Only collegeadmin, admin, or professor can create events
    if (!(req.user.role === "collegeadmin" || req.user.role === "professor" || req.user.role === "admin")) {
      console.log('❌ Access denied for role:', req.user.role);
      return res.status(403).json({
        status: "fail",
        message: "Only collegeadmin, admin, or professor can create events."
      });
    }

    const { title, date, location, description, targetAudience, branch } = req.body;
    const createdBy = req.user._id;

    // Get the creator's department for department-based filtering
    const creatorDepartment = req.user.department;
    const creatorBranch = req.user.branch;

    // For admin users, department is optional; for others it's required
    if (!creatorDepartment && req.user.role !== "admin") {
      return res.status(400).json({ 
        status: "fail", 
        message: "User must have a department to create events." 
      });
    }

    // Create event with department filtering
    const eventData = {
      title,
      date,
      location,
      description,
      createdBy,
      targetAudience: targetAudience || ["student"], // Default to students
    };

    // For admin users without department, create global events
    if (req.user.role === "admin") {
      if (creatorDepartment) {
        eventData.department = creatorDepartment;
      }
      // Admin can create events without department restriction
    } else {
      // Non-admin users must have department
      eventData.department = creatorDepartment;
    }

    // If specific branch is provided, use it; otherwise use creator's branch for more specific targeting
    if (branch) {
      eventData.branch = branch;
    } else if (creatorBranch && req.user.role === "professor") {
      eventData.branch = creatorBranch; // Professor events target their own branch by default
    }

    const event = await Event.create(eventData);

    // Populate the created event with creator details for response
    await event.populate("createdBy", "firstName lastName email role department branch");

    res.status(201).json({
      status: "success",
      data: { event },
      message: `Event created for ${creatorDepartment} department${eventData.branch ? ` (${eventData.branch} branch)` : ''}`
    });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({
      status: "fail",
      message: "Internal Server Error",
    });
  }
};

const getAllEventsController = async (req, res) => {
  try {
    console.log("getAllEventsController called");
    
    // Safety check for user object
    if (!req.user) {
      return res.status(401).json({
        status: "fail",
        message: "User not authenticated"
      });
    }
    
    console.log("User:", {
      id: req.user._id,
      role: req.user.role,
      department: req.user.department,
      branch: req.user.branch
    });
    
    let eventQuery = {};
    const userRole = req.user.role;
    const userDepartment = req.user.department;
    const userBranch = req.user.branch;

    // Admin sees all events
    if (userRole === "admin") {
      eventQuery = {}; // No filter - see all events
    } else if (userRole === "collegeadmin") {
      // College admin sees events from their department or legacy events without department (case-insensitive)
      eventQuery = {
        $or: [
          { department: { $regex: new RegExp('^' + userDepartment + '$', 'i') } },
          { department: { $exists: false } }, // Legacy events without department
          { department: null }
        ]
      };
    } else if (userRole === "student") {
      // Students see events that are targeted to students or legacy events
      // Simplified query to avoid nested complexity
      eventQuery = {
        $and: [
          // Must be for students or no target audience specified (legacy events)
          {
            $or: [
              { targetAudience: { $in: ["student"] } },
              { targetAudience: { $exists: false } },
              { targetAudience: { $size: 0 } }
            ]
          },
          // Must be in their department or no department specified (case-insensitive)
          {
            $or: [
              { department: { $regex: new RegExp('^' + userDepartment + '$', 'i') } },
              { department: { $exists: false } },
              { department: null }
            ]
          }
        ]
      };
      
      // Add branch filtering if user has a branch
      if (userBranch) {
        eventQuery.$and.push({
          $or: [
            { branch: { $exists: false } },
            { branch: null },
            { branch: userBranch }
          ]
        });
      }
    } else if (userRole === "alumni") {
      // Alumni see events that are targeted to alumni or legacy events
      // With branch and department filtering like students
      eventQuery = {
        $and: [
          // Must be for alumni or no target audience specified (legacy events)
          {
            $or: [
              { targetAudience: { $in: ["alumni"] } },
              { targetAudience: { $exists: false } },
              { targetAudience: { $size: 0 } }
            ]
          },
          // Must be in their department or no department specified (case-insensitive)
          {
            $or: [
              { department: { $regex: new RegExp('^' + userDepartment + '$', 'i') } },
              { department: { $exists: false } },
              { department: null }
            ]
          },
          // Must be for their branch or no branch specified
          {
            $or: [
              { branch: userBranch },
              { branch: { $exists: false } },
              { branch: null }
            ]
          }
        ]
      };
    } else if (userRole === "professor") {
      // Professors see events from their department or legacy events (case-insensitive)
      eventQuery = {
        $or: [
          { department: { $regex: new RegExp('^' + userDepartment + '$', 'i') } },
          { department: { $exists: false } }, // Legacy events
          { department: null }
        ]
      };
    } else {
      // No access for other roles
      return res.status(403).json({
        status: "fail",
        message: "Access denied. Invalid role for viewing events."
      });
    }

    // Fetch events with department filtering
    console.log("Event query:", JSON.stringify(eventQuery, null, 2));
    const allEvents = await Event.find(eventQuery)
      .populate("createdBy", "firstName lastName email role department branch")
      .sort({ createdAt: -1 }); // Most recent events first
    
    console.log(`Found ${allEvents.length} events`);
    
    // Check for events with missing createdBy references
    const eventsWithMissingUsers = allEvents.filter(event => !event.createdBy);
    if (eventsWithMissingUsers.length > 0) {
      console.log(`⚠️  Warning: ${eventsWithMissingUsers.length} events have missing/deleted user references`);
      eventsWithMissingUsers.forEach(event => {
        console.log(`   - Event "${event.title}" (ID: ${event._id}) has null createdBy`);
      });
    }

    // Filter out expired events and add expiration status to remaining events
    const activeEvents = allEvents
      .filter(event => !isEventExpired(event.date))
      .map(event => ({
        ...event.toObject(),
        timeUntilExpiration: getTimeUntilExpiration(event.date),
        isExpired: false,
        isRelevantToUser: event.department === userDepartment,
        isBranchMatch: !event.branch || event.branch === userBranch,
        organizedBy: event.createdBy ? {
          name: `${event.createdBy.firstName || 'Unknown'} ${event.createdBy.lastName || 'User'}`,
          role: event.createdBy.role || 'Unknown',
          department: event.createdBy.department || 'Unknown'
        } : {
          name: 'Deleted User',
          role: 'Unknown',
          department: 'Unknown'
        }
      }));

    // Enhanced meta information for admin
    let metaInfo = {
      totalEvents: activeEvents.length,
      userDepartment: userDepartment,
      userRole: userRole,
      filter: userRole === "admin" ? "All departments" : `${userDepartment} department only`
    };

    if (userRole === "admin") {
      // Provide department breakdown for main admin
      const departmentStats = {};
      const collegeAdminEvents = activeEvents.filter(event => 
        event.organizedBy && event.organizedBy.role === 'collegeadmin'
      );
      
      activeEvents.forEach(event => {
        const dept = event.department || 'No Department';
        departmentStats[dept] = (departmentStats[dept] || 0) + 1;
      });

      metaInfo = {
        ...metaInfo,
        departmentBreakdown: departmentStats,
        collegeAdminEventsCount: collegeAdminEvents.length,
        message: activeEvents.length === 0 
          ? "No active events found across all departments. Expired events are automatically removed." 
          : `${activeEvents.length} active event${activeEvents.length > 1 ? 's' : ''} found across all departments${collegeAdminEvents.length > 0 ? ` (${collegeAdminEvents.length} from college admins)` : ''}.`
      };
    } else {
      metaInfo.message = activeEvents.length === 0 
        ? `No active events found for ${userDepartment} department. Expired events are automatically removed.` 
        : `${activeEvents.length} active event${activeEvents.length > 1 ? 's' : ''} found for ${userDepartment} department.`;
    }

    res.status(200).json({
      status: "success",
      data: {
        events: activeEvents,
      },
      meta: metaInfo
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      status: "fail",
      message: "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};
// Create event request (collegeadmin to another collegeadmin)
const createEventRequestController = async (req, res) => {
  try {
    // Only collegeadmin can create event requests
    if (req.user.role !== "collegeadmin") {
      return res.status(403).json({
        status: "fail",
        message: "Only collegeadmin can create event requests."
      });
    }

    const { targetCollegeAdminId, title, date, location, description, targetAudience, branch } = req.body;
    const requesterId = req.user._id;

    // Validate required fields
    if (!targetCollegeAdminId || !title || !date || !location || !description) {
      return res.status(400).json({
        status: "fail",
        message: "All fields are required: targetCollegeAdminId, title, date, location, description"
      });
    }

    // Find target college admin
    const { User } = require("../models/user");
    const targetAdmin = await User.findById(targetCollegeAdminId);

    if (!targetAdmin || targetAdmin.role !== "collegeadmin") {
      return res.status(400).json({
        status: "fail",
        message: "Invalid target college admin."
      });
    }

    // Prevent requesting to same college
    if (req.user.collegeName === targetAdmin.collegeName) {
      return res.status(400).json({
        status: "fail",
        message: "Cannot request events to admins from the same college."
      });
    }

    // Create event request
    const eventRequestData = {
      requester: requesterId,
      targetCollegeAdmin: targetCollegeAdminId,
      eventDetails: {
        title,
        date,
        location,
        description,
        targetAudience: targetAudience || ["student"],
        branch
      }
    };

    const eventRequest = await EventRequest.create(eventRequestData);

    // Populate requester and target admin details
    await eventRequest.populate("requester", "firstName lastName email collegeName department");
    await eventRequest.populate("targetCollegeAdmin", "firstName lastName email collegeName department");

    console.log(`Event request created: requester=${requesterId.toString()} target=${targetCollegeAdminId}`);
    res.status(201).json({
      status: "success",
      data: { eventRequest },
      message: `Event request sent to ${targetAdmin.firstName} ${targetAdmin.lastName} (${targetAdmin.collegeName})`
    });
  } catch (error) {
    console.error("Error creating event request:", error);
    res.status(500).json({
      status: "fail",
      message: "Internal Server Error",
    });
  }
};

// Get event requests for current user (as requester or target)
const getEventRequestsController = async (req, res) => {
  try {
    // Only collegeadmin can view event requests
    if (req.user.role !== "collegeadmin") {
      return res.status(403).json({
        status: "fail",
        message: "Only collegeadmin can view event requests."
      });
    }

    const userId = req.user._id;

    // Find requests where user is either requester or target
    const eventRequests = await EventRequest.find({
      $or: [
        { requester: userId },
        { targetCollegeAdmin: userId }
      ]
    })
    .populate("requester", "firstName lastName email collegeName department")
    .populate("targetCollegeAdmin", "firstName lastName email collegeName department")
    .sort({ createdAt: -1 });

  // Categorize requests (use string comparison to avoid ObjectId equals pitfalls)
  const sentRequests = eventRequests.filter(er => er.requester && er.requester._id && er.requester._id.toString() === userId.toString());
  const receivedRequests = eventRequests.filter(er => er.targetCollegeAdmin && er.targetCollegeAdmin._id && er.targetCollegeAdmin._id.toString() === userId.toString());

  console.log(`Event requests: total=${eventRequests.length}, sent=${sentRequests.length}, received=${receivedRequests.length}`);

    res.status(200).json({
      status: "success",
      data: {
        sentRequests,
        receivedRequests,
        allRequests: eventRequests
      },
      meta: {
        totalSent: sentRequests.length,
        totalReceived: receivedRequests.length,
        totalRequests: eventRequests.length
      }
    });
  } catch (error) {
    console.error("Error fetching event requests:", error);
    res.status(500).json({
      status: "fail",
      message: "Internal Server Error",
    });
  }
};

// Approve event request (only target collegeadmin can approve)
const approveEventRequestController = async (req, res) => {
  try {
    const eventRequestId = req.params.id;
    const userId = req.user._id;

    // Only collegeadmin can approve requests
    if (req.user.role !== "collegeadmin") {
      return res.status(403).json({
        status: "fail",
        message: "Only collegeadmin can approve event requests."
      });
    }

    const eventRequest = await EventRequest.findById(eventRequestId);

    if (!eventRequest) {
      return res.status(404).json({
        status: "fail",
        message: "Event request not found."
      });
    }

    // Only target admin can approve
    if (!eventRequest.targetCollegeAdmin.equals(userId)) {
      return res.status(403).json({
        status: "fail",
        message: "You can only approve requests sent to you."
      });
    }

    if (eventRequest.status !== "pending") {
      return res.status(400).json({
        status: "fail",
        message: "Event request has already been processed."
      });
    }

    // Create event from request
    const eventData = {
      title: eventRequest.eventDetails.title,
      date: eventRequest.eventDetails.date,
      location: eventRequest.eventDetails.location,
      description: eventRequest.eventDetails.description,
      createdBy: eventRequest.requester, // Event created by the requester
      department: req.user.department, // Event in target admin's department
      targetAudience: eventRequest.eventDetails.targetAudience,
      branch: eventRequest.eventDetails.branch
    };

    const event = await Event.create(eventData);

    // Update request status
    eventRequest.status = "approved";
    eventRequest.approvedEventId = event._id;
    await eventRequest.save();

    // Populate event details
    await event.populate("createdBy", "firstName lastName email role department branch collegeName");

    res.status(200).json({
      status: "success",
      data: { event, eventRequest },
      message: "Event request approved and event created successfully."
    });
  } catch (error) {
    console.error("Error approving event request:", error);
    res.status(500).json({
      status: "fail",
      message: "Internal Server Error",
    });
  }
};

// Reject event request (only target collegeadmin can reject)
const rejectEventRequestController = async (req, res) => {
  try {
    const eventRequestId = req.params.id;
    const userId = req.user._id;
    const { rejectionReason } = req.body;

    // Only collegeadmin can reject requests
    if (req.user.role !== "collegeadmin") {
      return res.status(403).json({
        status: "fail",
        message: "Only collegeadmin can reject event requests."
      });
    }

    const eventRequest = await EventRequest.findById(eventRequestId);

    if (!eventRequest) {
      return res.status(404).json({
        status: "fail",
        message: "Event request not found."
      });
    }

    // Only target admin can reject
    if (!eventRequest.targetCollegeAdmin.equals(userId)) {
      return res.status(403).json({
        status: "fail",
        message: "You can only reject requests sent to you."
      });
    }

    if (eventRequest.status !== "pending") {
      return res.status(400).json({
        status: "fail",
        message: "Event request has already been processed."
      });
    }

    // Update request status
    eventRequest.status = "rejected";
    if (rejectionReason) {
      eventRequest.rejectionReason = rejectionReason;
    }
    await eventRequest.save();

    res.status(200).json({
      status: "success",
      data: { eventRequest },
      message: "Event request rejected successfully."
    });
  } catch (error) {
    console.error("Error rejecting event request:", error);
    res.status(500).json({
      status: "fail",
      message: "Internal Server Error",
    });
  }
};


// Update event (only by creator)
const updateEventController = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ status: "fail", message: "Event not found." });
    }
    
    const userRole = req.user.role;
    const isOwner = event.createdBy.equals(req.user._id);
    
    // Admin can update all events, others can only update their own events
    if (userRole === "admin") {
      // Admin has full access
    } else if (!isOwner || !(userRole === "collegeadmin" || userRole === "professor")) {
      return res.status(403).json({ status: "fail", message: "You can only update your own events." });
    }
    
    const { title, date, location, description, targetAudience, branch } = req.body;
    
    // Update basic fields
    if (title) event.title = title;
    if (date) event.date = date;
    if (location) event.location = location;
    if (description) event.description = description;
    
    // Update target audience (only if provided)
    if (targetAudience) {
      event.targetAudience = targetAudience;
    }
    
    // Update branch (only if provided, and only if user has permission)
    if (branch !== undefined) {
      // Only allow branch changes if user is the original creator
      if (isOwner) {
        event.branch = branch;
      }
    }
    
    // Department cannot be changed once set (maintains department-based filtering)
    
    await event.save();
    
    // Populate and return updated event
    await event.populate("createdBy", "firstName lastName email role department branch");
    
    res.status(200).json({ 
      status: "success", 
      data: { event },
      message: "Event updated successfully"
    });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ status: "fail", message: "Internal Server Error" });
  }
};

// Delete event (only by creator)
const deleteEventController = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ status: "fail", message: "Event not found." });
    }
    // Admin can delete all events, others can only delete their own events
    if (req.user.role === "admin") {
      // Admin has full access
    } else if (!event.createdBy.equals(req.user._id) || !(req.user.role === "collegeadmin" || req.user.role === "professor")) {
      return res.status(403).json({ status: "fail", message: "You can only delete your own events." });
    }
    await event.deleteOne();
    res.status(200).json({ status: "success", message: "Event deleted successfully." });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ status: "fail", message: "Internal Server Error" });
  }
};

// Manual cleanup endpoint (for admin use)
const manualCleanupController = async (req, res) => {
  try {
    // Only admin can trigger manual cleanup
    if (req.user.role !== "admin") {
      return res.status(403).json({
        status: "fail",
        message: "Only admin can trigger manual event cleanup."
      });
    }

    const { cleanupExpiredEvents } = require("../utils/eventCleanup");
    
    // Get count before cleanup
    const expiredCount = await Event.countDocuments({
      date: { $lt: new Date() }
    });

    if (expiredCount === 0) {
      return res.status(200).json({
        status: "success",
        message: "No expired events found to clean up.",
        data: {
          removedCount: 0
        }
      });
    }

    // Perform cleanup
    await cleanupExpiredEvents();

    res.status(200).json({
      status: "success",
      message: `Manual cleanup completed. ${expiredCount} expired events removed.`,
      data: {
        removedCount: expiredCount
      }
    });
  } catch (error) {
    console.error("Error in manual cleanup:", error);
    res.status(500).json({
      status: "fail",
      message: "Internal Server Error",
    });
  }
};

// Get events by specific department (admin/collegeadmin only)
const getEventsByDepartmentController = async (req, res) => {
  try {
    if (!["admin", "collegeadmin"].includes(req.user.role)) {
      return res.status(403).json({ 
        status: "fail", 
        message: "Only admin or college admin can view events by department." 
      });
    }

    const { department } = req.params;
    
    if (!department) {
      return res.status(400).json({
        status: "fail",
        message: "Department parameter is required."
      });
    }

    // College admin can only view their own department
    if (req.user.role === "collegeadmin" && req.user.department !== department) {
      return res.status(403).json({
        status: "fail",
        message: "College admin can only view events from their own department."
      });
    }

    const events = await Event.find({ department })
      .populate("createdBy", "firstName lastName email role department branch")
      .sort({ createdAt: -1 });

    // Filter out expired events
    const activeEvents = events.filter(event => !isEventExpired(event.date));

    res.status(200).json({
      status: "success",
      data: { events: activeEvents },
      meta: {
        department,
        totalEvents: activeEvents.length,
        message: `${activeEvents.length} active event${activeEvents.length !== 1 ? 's' : ''} found in ${department} department`
      }
    });
  } catch (error) {
    console.error("Error fetching events by department:", error);
    res.status(500).json({
      status: "fail",
      message: "Internal Server Error",
    });
  }
};

// Get available departments with event counts
const getDepartmentEventStatsController = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ 
        status: "fail", 
        message: "Only admin can view department event statistics." 
      });
    }

    const stats = await Event.aggregate([
      {
        $group: {
          _id: "$department",
          totalEvents: { $sum: 1 },
          activeEvents: { 
            $sum: { 
              $cond: [{ $gte: ["$date", new Date()] }, 1, 0] 
            } 
          },
          upcomingEvents: {
            $sum: {
              $cond: [{ $gte: ["$date", new Date()] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { totalEvents: -1 }
      }
    ]);

    res.status(200).json({
      status: "success",
      data: { departmentStats: stats },
      meta: {
        totalDepartments: stats.length,
        message: `Event statistics for ${stats.length} departments`
      }
    });
  } catch (error) {
    console.error("Error fetching department event stats:", error);
    res.status(500).json({
      status: "fail",
      message: "Internal Server Error",
    });
  }
};

// Debug endpoint to check all events (admin only)
const debugEventsController = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        status: "fail",
        message: "Only admin can access debug information."
      });
    }

    const allEvents = await Event.find()
      .populate("createdBy", "firstName lastName email role department branch")
      .sort({ createdAt: -1 });

    // Check for events missing new fields
    const eventsWithoutDepartment = allEvents.filter(event => !event.department);
    const eventsWithoutTargetAudience = allEvents.filter(event => !event.targetAudience || event.targetAudience.length === 0);

    res.status(200).json({
      status: "success",
      data: {
        totalEvents: allEvents.length,
        eventsWithoutDepartment: eventsWithoutDepartment.length,
        eventsWithoutTargetAudience: eventsWithoutTargetAudience.length,
        events: allEvents.map(event => ({
          _id: event._id,
          title: event.title,
          department: event.department || 'MISSING',
          targetAudience: event.targetAudience || 'MISSING',
          branch: event.branch || 'NONE',
          createdBy: event.createdBy ? {
            name: `${event.createdBy.firstName} ${event.createdBy.lastName}`,
            role: event.createdBy.role,
            department: event.createdBy.department
          } : 'MISSING'
        }))
      }
    });
  } catch (error) {
    console.error("Error in debug events:", error);
    res.status(500).json({
      status: "fail",
      message: "Internal Server Error",
    });
  }
};

module.exports = {
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
  debugEventsController
};
