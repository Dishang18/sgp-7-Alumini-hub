require('dotenv').config();
const mongoose = require('mongoose');
const { Event } = require('./src/models/eventModel');

async function testRealAlumni() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Use real alumni user: new@gmail.com
    const userRole = "alumni";
    const userDepartment = "cmpica"; 
    const userBranch = "mca";

    console.log(`\n🔍 Testing for REAL Alumni User: new@gmail.com`);
    console.log(`Department: ${userDepartment}`);
    console.log(`Branch: ${userBranch}`);
    console.log(`Role: ${userRole}`);

    // Alumni query with branch filtering (the fixed version)
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
        // Must be in their department or no department specified
        {
          $or: [
            { department: userDepartment },
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

    console.log('\n📋 Query being executed:');
    console.log(JSON.stringify(eventQuery, null, 2));

    const events = await Event.find(eventQuery).sort({ createdAt: -1 });
    
    console.log(`\n✅ Found ${events.length} events for CMPICA MCA alumni:`);
    
    events.forEach((event, index) => {
      console.log(`\n${index + 1}. "${event.title}"`);
      console.log(`   Department: ${event.department || 'none'}`);
      console.log(`   Branch: ${event.branch || 'none'}`);
      console.log(`   Target Audience: ${JSON.stringify(event.targetAudience) || 'none'}`);
      console.log(`   Date: ${event.date}`);
    });

    // Now let's try with case-insensitive department matching
    console.log('\n🔄 Testing with case-insensitive department matching:');
    
    const caseInsensitiveQuery = {
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
            { department: { $regex: new RegExp('^' + userDepartment + '$', 'i') } },
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

    const caseInsensitiveEvents = await Event.find(caseInsensitiveQuery).sort({ createdAt: -1 });
    console.log(`\n✅ Found ${caseInsensitiveEvents.length} events with case-insensitive matching:`);
    
    caseInsensitiveEvents.forEach((event, index) => {
      console.log(`\n${index + 1}. "${event.title}"`);
      console.log(`   Department: ${event.department || 'none'}`);
      console.log(`   Branch: ${event.branch || 'none'}`);
      console.log(`   Target Audience: ${JSON.stringify(event.targetAudience) || 'none'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testRealAlumni();