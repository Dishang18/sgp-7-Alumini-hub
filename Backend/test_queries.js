// Test simplified event queries
const mongoose = require('mongoose');
require('dotenv').config();

async function testEventQueries() {
  try {
    console.log('Testing event queries...');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connected');
    
    const { Event } = require('./src/models/eventModel');
    
    // Test 1: Simple query (admin view - all events)
    console.log('\n1. Testing simple query (all events):');
    const allEvents = await Event.find({});
    console.log(`Found ${allEvents.length} total events`);
    
    // Test 2: Student query (simplified)
    console.log('\n2. Testing student query:');
    const studentQuery = {
      $or: [
        { targetAudience: { $in: ["student"] } },
        { targetAudience: { $exists: false } }
      ]
    };
    
    console.log('Student query:', JSON.stringify(studentQuery, null, 2));
    const studentEvents = await Event.find(studentQuery);
    console.log(`Found ${studentEvents.length} events for students`);
    
    // Test 3: Alumni query (simplified)  
    console.log('\n3. Testing alumni query:');
    const alumniQuery = {
      $or: [
        { targetAudience: { $in: ["alumni"] } },
        { targetAudience: { $exists: false } }
      ]
    };
    
    console.log('Alumni query:', JSON.stringify(alumniQuery, null, 2));
    const alumniEvents = await Event.find(alumniQuery);
    console.log(`Found ${alumniEvents.length} events for alumni`);
    
    // Test 4: Department-specific query
    console.log('\n4. Testing department query:');
    const deptQuery = {
      $or: [
        { department: "Computer Science" },
        { department: { $exists: false } }
      ]
    };
    
    console.log('Department query:', JSON.stringify(deptQuery, null, 2));
    const deptEvents = await Event.find(deptQuery);
    console.log(`Found ${deptEvents.length} events for CS or no department`);
    
    console.log('\n✅ All query tests completed successfully');
    
  } catch (error) {
    console.error('❌ Query test failed:');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
  }
}

testEventQueries();