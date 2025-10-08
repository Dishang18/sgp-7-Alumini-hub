require('dotenv').config();
const mongoose = require('mongoose');
const { Event } = require('./src/models/eventModel');

async function debugEventTargeting() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all events and analyze their targeting
    const allEvents = await Event.find({}).sort({ createdAt: -1 });
    
    console.log(`\n📊 Total events in database: ${allEvents.length}`);
    console.log('\n🔍 Analyzing each event:');
    
    allEvents.forEach((event, index) => {
      console.log(`\n${index + 1}. "${event.title}"`);
      console.log(`   Department: ${event.department || 'none'}`);
      console.log(`   Branch: ${event.branch || 'none'}`);
      console.log(`   Target Audience: ${JSON.stringify(event.targetAudience) || 'none'}`);
      console.log(`   Date: ${event.date}`);
      
      // Check if this event should match MCA alumni
      const isDepartmentMatch = !event.department || event.department === null || event.department === 'cmpica';
      const isBranchMatch = !event.branch || event.branch === null || event.branch === 'mca';
      const isAudienceMatch = !event.targetAudience || 
                             event.targetAudience.length === 0 || 
                             event.targetAudience.includes('alumni');
      
      console.log(`   📋 Would match MCA alumni: ${isDepartmentMatch && isBranchMatch && isAudienceMatch ? '✅ YES' : '❌ NO'}`);
      if (!isDepartmentMatch) console.log(`     ❌ Department mismatch: ${event.department} ≠ cmpica`);
      if (!isBranchMatch) console.log(`     ❌ Branch mismatch: ${event.branch} ≠ mca`);
      if (!isAudienceMatch) console.log(`     ❌ Audience mismatch: ${JSON.stringify(event.targetAudience)} doesn't include alumni`);
    });

    // Now test specific targeting scenarios
    console.log('\n🎯 Testing specific scenarios:');
    
    // 1. Events for CMPICA department
    const cmpicaEvents = await Event.find({ department: 'cmpica' });
    console.log(`\n1. CMPICA department events: ${cmpicaEvents.length}`);
    
    // 2. Events for MCA branch
    const mcaEvents = await Event.find({ branch: 'mca' });
    console.log(`2. MCA branch events: ${mcaEvents.length}`);
    
    // 3. Events targeting alumni
    const alumniEvents = await Event.find({ targetAudience: { $in: ['alumni'] } });
    console.log(`3. Alumni targeted events: ${alumniEvents.length}`);
    
    // 4. Events with no target audience (legacy)
    const legacyEvents = await Event.find({ 
      $or: [
        { targetAudience: { $exists: false } },
        { targetAudience: { $size: 0 } }
      ]
    });
    console.log(`4. Legacy events (no target audience): ${legacyEvents.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

debugEventTargeting();