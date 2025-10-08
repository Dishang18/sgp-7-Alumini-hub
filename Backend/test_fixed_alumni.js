require('dotenv').config();
const mongoose = require('mongoose');
const { Event } = require('./src/models/eventModel');

async function testFixedAlumniQuery() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Use real alumni user: new@gmail.com (cmpica/mca)
    const userRole = "alumni";
    const userDepartment = "cmpica"; 
    const userBranch = "mca";

    console.log('\n🔍 Testing FIXED Alumni Query for: new@gmail.com');
    console.log('Department:', userDepartment);
    console.log('Branch:', userBranch);
    console.log('Role:', userRole);

    // Alumni query with CASE-INSENSITIVE department matching (THE FIX)
    const eventQuery = {
      $and: [
        // Must be for alumni or no target audience specified (legacy events)
        {
          $or: [
            { targetAudience: { $in: ["alumni"] } },
            { targetAudience: { $exists: false } },
            { targetAudience: { $size: 0 } }
          ]
        },
        // Must be in their department or no department specified (CASE-INSENSITIVE)
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

    console.log('\n📋 Fixed Query (with case-insensitive department matching):');
    console.log(JSON.stringify(eventQuery, null, 2));

    const events = await Event.find(eventQuery).sort({ createdAt: -1 });
    
    console.log('\n🎉 SUCCESS! Found', events.length, 'events for CMPICA MCA alumni:');
    
    events.forEach((event, index) => {
      console.log('\n' + (index + 1) + '. "' + event.title + '"');
      console.log('   Department:', event.department || 'none');
      console.log('   Branch:', event.branch || 'none');
      console.log('   Target Audience:', JSON.stringify(event.targetAudience) || 'none');
      console.log('   Date:', event.date.toDateString());
      
      // Check why this event matches
      const matchReasons = [];
      if (!event.targetAudience || event.targetAudience.length === 0) {
        matchReasons.push("Legacy event (no target audience)");
      } else if (event.targetAudience.includes('alumni')) {
        matchReasons.push("Targets alumni");
      }
      
      if (!event.department) {
        matchReasons.push("No department restriction");
      } else if (event.department.toLowerCase() === userDepartment.toLowerCase()) {
        matchReasons.push("Department matches (case-insensitive): " + event.department + " ≈ " + userDepartment);
      }
      
      if (!event.branch) {
        matchReasons.push("No branch restriction");
      } else if (event.branch === userBranch) {
        matchReasons.push("Branch matches: " + event.branch);
      }
      
      console.log('   ✅ Match reasons:', matchReasons.join(', '));
    });

    // Compare with old case-sensitive approach
    const oldQuery = {
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
            { department: userDepartment }, // Case-sensitive (old way)
            { department: { $exists: false } },
            { department: null }
          ]
        },
        {
          $or: [
            { branch: userBranch },
            { branch: { $exists: false } },
            { branch: null }
          ]
        }
      ]
    };
    
    const oldEvents = await Event.find(oldQuery);
    console.log('\n📊 Comparison:');
    console.log('   Old (case-sensitive):', oldEvents.length, 'events');
    console.log('   New (case-insensitive):', events.length, 'events');
    console.log('   Improvement: +' + (events.length - oldEvents.length) + ' events');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testFixedAlumniQuery();