// Test script to verify event filtering logic
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Event = require('./src/models/eventModel');
const User = require('./src/models/user');

// Connect to database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alumni-connect')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Database connection error:', err));

async function testEventFiltering() {
  try {
    console.log('=== Testing Event Filtering Logic ===\n');

    // Test 1: Get all events to see structure
    console.log('1. All events in database:');
    const allEvents = await Event.find({}).select('title department branch targetAudience createdBy').populate('createdBy', 'firstName lastName role department branch');
    console.log(`Total events: ${allEvents.length}`);
    allEvents.forEach((event, index) => {
      console.log(`${index + 1}. "${event.title}"`);
      console.log(`   Department: ${event.department || 'undefined'}`);
      console.log(`   Branch: ${event.branch || 'undefined'}`);
      console.log(`   Target Audience: ${JSON.stringify(event.targetAudience)}`);
      console.log(`   Created by: ${event.createdBy?.firstName} (${event.createdBy?.role})`);
      console.log('');
    });

    // Test 2: Test student query
    console.log('\n2. Testing student query (CS department):');
    const studentQuery = {
      $or: [
        {
          $and: [
            { targetAudience: { $in: ["student"] } },
            {
              $or: [
                { department: { $exists: false } },
                { department: null },
                { department: "Computer Science" }
              ]
            }
          ]
        },
        {
          $and: [
            { targetAudience: { $exists: false } },
            {
              $or: [
                { department: { $exists: false } },
                { department: null },
                { department: "Computer Science" }
              ]
            }
          ]
        }
      ]
    };

    const studentEvents = await Event.find(studentQuery).select('title department targetAudience');
    console.log(`Events visible to CS students: ${studentEvents.length}`);
    studentEvents.forEach(event => {
      console.log(`- "${event.title}" (dept: ${event.department}, audience: ${JSON.stringify(event.targetAudience)})`);
    });

    // Test 3: Test alumni query  
    console.log('\n3. Testing alumni query (CS department):');
    const alumniQuery = {
      $or: [
        {
          $and: [
            { targetAudience: { $in: ["alumni"] } },
            {
              $or: [
                { department: { $exists: false } },
                { department: null },
                { department: "Computer Science" }
              ]
            }
          ]
        },
        {
          $and: [
            { targetAudience: { $exists: false } },
            {
              $or: [
                { department: { $exists: false } },
                { department: null },
                { department: "Computer Science" }
              ]
            }
          ]
        }
      ]
    };

    const alumniEvents = await Event.find(alumniQuery).select('title department targetAudience');
    console.log(`Events visible to CS alumni: ${alumniEvents.length}`);
    alumniEvents.forEach(event => {
      console.log(`- "${event.title}" (dept: ${event.department}, audience: ${JSON.stringify(event.targetAudience)})`);
    });

    // Test 4: Test admin query
    console.log('\n4. Testing admin query (all events):');
    const adminEvents = await Event.find({}).select('title department targetAudience');
    console.log(`Events visible to admin: ${adminEvents.length}`);

    console.log('\n=== Test Complete ===');
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testEventFiltering();