// Script to create sample events for testing
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Event = require('./src/models/eventModel');
const User = require('./src/models/user');

// Connect to database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alumni-connect')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Database connection error:', err));

async function createSampleEvents() {
  try {
    console.log('Creating sample events for testing...\n');

    // Find an admin user to be the creator
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('No admin user found. Please create one first.');
      return;
    }

    // Sample events to create
    const sampleEvents = [
      {
        title: 'CS Department Tech Talk',
        description: 'A tech talk for CS students and alumni',
        date: new Date('2024-12-25'),
        location: 'CS Auditorium',
        department: 'Computer Science',
        branch: 'Computer Science',
        targetAudience: ['student', 'alumni'],
        createdBy: adminUser._id
      },
      {
        title: 'Legacy Event (No Department)',
        description: 'An old event without department/audience fields',
        date: new Date('2024-12-26'),
        location: 'Main Hall',
        // No department or targetAudience - testing legacy support
        createdBy: adminUser._id
      },
      {
        title: 'Alumni Only Networking',
        description: 'Networking event for alumni only',
        date: new Date('2024-12-27'),
        location: 'Alumni Center',
        department: 'Computer Science',
        targetAudience: ['alumni'],
        createdBy: adminUser._id
      },
      {
        title: 'Student Workshop',
        description: 'Workshop specifically for students',
        date: new Date('2024-12-28'),
        location: 'Workshop Room',
        department: 'Computer Science',
        targetAudience: ['student'],
        createdBy: adminUser._id
      },
      {
        title: 'Mechanical Engineering Seminar',
        description: 'Seminar for Mechanical Engineering department',
        date: new Date('2024-12-29'),
        location: 'ME Auditorium',
        department: 'Mechanical Engineering',
        targetAudience: ['student', 'alumni'],
        createdBy: adminUser._id
      }
    ];

    // Create events
    for (const eventData of sampleEvents) {
      const existingEvent = await Event.findOne({ title: eventData.title });
      if (!existingEvent) {
        const event = new Event(eventData);
        await event.save();
        console.log(`✓ Created: ${eventData.title}`);
      } else {
        console.log(`- Skipped (exists): ${eventData.title}`);
      }
    }

    console.log('\nSample events creation complete!');
    
  } catch (error) {
    console.error('Error creating sample events:', error);
  } finally {
    mongoose.connection.close();
  }
}

createSampleEvents();