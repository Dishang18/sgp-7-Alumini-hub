require('dotenv').config();
const mongoose = require('mongoose');
const { Event } = require('./src/models/eventModel');

async function testAlumniBranchFiltering() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Simulate MCA alumni user
    const userRole = "alumni";
    const userDepartment = "cmpica"; 
    const userBranch = "mca";

    console.log(`\n🔍 Testing for Alumni User:`);
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
    
    console.log(`\n✅ Found ${events.length} events for MCA alumni:`);
    
    events.forEach((event, index) => {
      console.log(`\n${index + 1}. "${event.title}"`);
      console.log(`   Department: ${event.department || 'none'}`);
      console.log(`   Branch: ${event.branch || 'none'}`);
      console.log(`   Target Audience: ${event.targetAudience || 'none'}`);
      console.log(`   Date: ${event.date}`);
    });

    // Also test without branch filtering to see the difference
    const queryWithoutBranch = {
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
            { department: userDepartment },
            { department: { $exists: false } },
            { department: null }
          ]
        }
      ]
    };

    const eventsWithoutBranch = await Event.find(queryWithoutBranch).sort({ createdAt: -1 });
    console.log(`\n🔄 Comparison - Events WITHOUT branch filtering: ${eventsWithoutBranch.length}`);
    
    if (eventsWithoutBranch.length !== events.length) {
      console.log('📊 Branch filtering is working - different results!');
    } else {
      console.log('⚠️  Branch filtering might not be needed - same results');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testAlumniBranchFiltering();