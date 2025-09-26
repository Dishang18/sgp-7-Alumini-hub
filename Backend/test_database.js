// Simple test to check if Event model and database work
const mongoose = require('mongoose');
require('dotenv').config();

// Test database connection and Event model
async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Connect to database  
    const mongoUri = process.env.MONGODB_URL || 'mongodb://localhost:27017/alumni-connect';
    console.log('Connecting to:', mongoUri);
    
    await mongoose.connect(mongoUri);
    console.log('✅ Database connected successfully');
    
    // Test Event model import
    const { Event } = require('./src/models/eventModel');
    console.log('✅ Event model imported successfully');
    
    // Test simple query
    console.log('Testing Event.find({})...');
    const events = await Event.find({}).limit(3);
    console.log(`✅ Found ${events.length} events in database`);
    
    if (events.length > 0) {
      console.log('Sample event:', {
        id: events[0]._id,
        title: events[0].title,
        department: events[0].department,
        targetAudience: events[0].targetAudience
      });
    }
    
    console.log('✅ All tests passed');
    
  } catch (error) {
    console.error('❌ Test failed:');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('Database disconnected');
  }
}

testDatabase();