require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('./src/models/user');
const { Event } = require('./src/models/eventModel');

// Connect to database
mongoose.connect(process.env.MONGODB_URI + process.env.DB_NAME);

async function testBranchFiltering() {
  try {
    console.log("=== TESTING BRANCH-SPECIFIC EVENT FILTERING ===\n");
    
    // Test MCA Student
    const mcaStudent = await User.findOne({ email: 'student.mca@test.com' });
    console.log("1. MCA Student:", {
      email: mcaStudent.email,
      department: mcaStudent.department,
      branch: mcaStudent.branch
    });
    
    // Test the exact same filter logic from the controller
    const studentEventQuery = {
      $and: [
        {
          $or: [
            { targetAudience: { $in: ["student"] } },
            { targetAudience: { $exists: false } },
            { targetAudience: { $size: 0 } }
          ]
        },
        {
          $or: [
            { department: mcaStudent.department },
            { department: { $exists: false } },
            { department: null }
          ]
        },
        {
          $or: [
            { branch: { $exists: false } },
            { branch: null },
            { branch: mcaStudent.branch }
          ]
        }
      ]
    };
    
    console.log("Student Query:", JSON.stringify(studentEventQuery, null, 2));
    
    const studentEvents = await Event.find(studentEventQuery).populate('createdBy', 'email role');
    console.log(`\nMCA Student should see ${studentEvents.length} events:`);
    studentEvents.forEach(event => {
      console.log(`  - "${event.title}" (Branch: ${event.branch || 'ALL'}, Target: [${event.targetAudience.join(', ')}])`);
    });
    
    // Test MCA Alumni
    const mcaAlumni = await User.findOne({ email: 'alumni.mca@test.com' });
    console.log("\n2. MCA Alumni:", {
      email: mcaAlumni.email,
      department: mcaAlumni.department,
      branch: mcaAlumni.branch
    });
    
    const alumniEventQuery = {
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
            { department: mcaAlumni.department },
            { department: { $exists: false } },
            { department: null }
          ]
        },
        {
          $or: [
            { branch: { $exists: false } },
            { branch: null },
            { branch: mcaAlumni.branch }
          ]
        }
      ]
    };
    
    console.log("Alumni Query (WITH branch filtering):", JSON.stringify(alumniEventQuery, null, 2));
    
    const alumniEvents = await Event.find(alumniEventQuery).populate('createdBy', 'email role');
    console.log(`\nMCA Alumni should see ${alumniEvents.length} events:`);
    alumniEvents.forEach(event => {
      console.log(`  - "${event.title}" (Branch: ${event.branch || 'ALL'}, Target: [${event.targetAudience.join(', ')}])`);
    });
    
    // Test BCA Student (should NOT see MCA-specific events)
    const bcaStudent = await User.findOne({ email: 'student.bca@test.com' });
    console.log("\n3. BCA Student:", {
      email: bcaStudent.email,
      department: bcaStudent.department,
      branch: bcaStudent.branch
    });
    
    const bcaEventQuery = {
      $and: [
        {
          $or: [
            { targetAudience: { $in: ["student"] } },
            { targetAudience: { $exists: false } },
            { targetAudience: { $size: 0 } }
          ]
        },
        {
          $or: [
            { department: bcaStudent.department },
            { department: { $exists: false } },
            { department: null }
          ]
        },
        {
          $or: [
            { branch: { $exists: false } },
            { branch: null },
            { branch: bcaStudent.branch }
          ]
        }
      ]
    };
    
    const bcaEvents = await Event.find(bcaEventQuery).populate('createdBy', 'email role');
    console.log(`\nBCA Student should see ${bcaEvents.length} events:`);
    bcaEvents.forEach(event => {
      console.log(`  - "${event.title}" (Branch: ${event.branch || 'ALL'}, Target: [${event.targetAudience.join(', ')}])`);
    });

  } catch (error) {
    console.error("Error testing branch filtering:", error);
  } finally {
    mongoose.connection.close();
  }
}

testBranchFiltering();