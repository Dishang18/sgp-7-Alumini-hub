require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('./src/models/user');
const { Event } = require('./src/models/eventModel');

mongoose.connect(process.env.MONGODB_URI + process.env.DB_NAME);

async function debugCurrentState() {
  try {
    console.log("=== DEBUG: CURRENT STATE ===\n");
    
    // Check the current user
    const currentUser = await User.findOne({ 
      role: 'alumni',
      department: 'cmpica',
      branch: 'mca'
    });
    
    console.log("Current Alumni User:", {
      email: currentUser?.email,
      department: currentUser?.department,
      branch: currentUser?.branch,
      approved: currentUser?.isApproved
    });
    
    // Check all events
    console.log("\nAll Events in Database:");
    const allEvents = await Event.find({}).populate('createdBy', 'firstName lastName email');
    allEvents.forEach((event, index) => {
      console.log(`${index + 1}. "${event.title}"`);
      console.log(`   Target: [${event.targetAudience.join(', ')}]`);
      console.log(`   Department: ${event.department || 'NONE'}`);
      console.log(`   Branch: ${event.branch || 'NONE'}`);
      console.log(`   Creator: ${event.createdBy?.firstName || 'NULL/MISSING'}`);
      console.log();
    });
    
    // Test current filtering (WITHOUT branch)
    console.log("Current Query Result (no branch filtering):");
    const currentQuery = {
      $and: [
        {
          $or: [
            { targetAudience: { $in: ["alumni"] } },
            { targetAudience: { $exists: false } },
            { targetAudience: { $size: 0 } }
          ]
        },
        {
          $or: [
            { department: "cmpica" },
            { department: { $exists: false } },
            { department: null }
          ]
        }
      ]
    };
    
    const currentEvents = await Event.find(currentQuery);
    console.log(`Found ${currentEvents.length} events with current logic`);
    
    // Test with branch filtering
    console.log("\nWith Branch Filtering:");
    const withBranchQuery = {
      $and: [
        {
          $or: [
            { targetAudience: { $in: ["alumni"] } },
            { targetAudience: { $exists: false } },
            { targetAudience: { $size: 0 } }
          ]
        },
        {
          $or: [
            { department: "cmpica" },
            { department: { $exists: false } },
            { department: null }
          ]
        },
        {
          $or: [
            { branch: { $exists: false } },
            { branch: null },
            { branch: "mca" }
          ]
        }
      ]
    };
    
    const branchEvents = await Event.find(withBranchQuery);
    console.log(`Found ${branchEvents.length} events with branch filtering`);

  } catch (error) {
    console.error("Error:", error);
  } finally {
    mongoose.connection.close();
  }
}

debugCurrentState();