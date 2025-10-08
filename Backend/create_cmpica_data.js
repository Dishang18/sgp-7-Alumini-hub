require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('./src/models/user');
const { Event } = require('./src/models/eventModel');
const bcrypt = require('bcryptjs');

// Connect to database
mongoose.connect(process.env.MONGODB_URI + process.env.DB_NAME);

async function cleanAndCreateProperData() {
  try {
    console.log("=== CLEANING OLD DATA AND CREATING PROPER EVENTS ===\n");
    
    // 1. Clean up old events with missing data
    console.log("1. Cleaning up old/broken events...");
    const deletedEvents = await Event.deleteMany({
      $or: [
        { createdBy: null },
        { createdBy: { $exists: false } },
        { department: { $exists: false } },
        { department: null },
        { department: undefined }
      ]
    });
    console.log(`Deleted ${deletedEvents.deletedCount} broken events`);
    
    const testPassword = await bcrypt.hash('password123', 12);
    
    // 2. Create College Admin for Computer Science (CMPICA)
    const collegeAdmin = await User.findOneAndUpdate(
      { email: 'admin.cmpica@test.com' },
      {
        email: 'admin.cmpica@test.com',
        password: testPassword,
        firstName: 'CMPICA',
        lastName: 'Admin',
        role: 'collegeadmin',
        department: 'Computer Science',
        isApproved: true
      },
      { upsert: true, new: true }
    );
    console.log("2. Created College Admin:", collegeAdmin.email, collegeAdmin.department);

    // 3. Create MCA Student in CMPICA
    const mcaStudent = await User.findOneAndUpdate(
      { email: 'student.mca.cmpica@test.com' },
      {
        email: 'student.mca.cmpica@test.com', 
        password: testPassword,
        firstName: 'MCA',
        lastName: 'Student',
        role: 'student',
        department: 'Computer Science',
        branch: 'MCA',
        enrollmentNumber: 'MCA2024001',
        year: 2024,
        isApproved: true
      },
      { upsert: true, new: true }
    );
    console.log("3. Created MCA Student:", mcaStudent.email, mcaStudent.department, mcaStudent.branch);

    // 4. Create MCA Alumni in CMPICA
    const mcaAlumni = await User.findOneAndUpdate(
      { email: 'alumni.mca.cmpica@test.com' },
      {
        email: 'alumni.mca.cmpica@test.com',
        password: testPassword,
        firstName: 'MCA',
        lastName: 'Alumni',
        role: 'alumni',
        department: 'Computer Science',
        branch: 'MCA',
        startYear: 2020,
        endYear: 2022,
        degree: 'MCA',
        rollNumber: 'MCA2020001',
        isApproved: true
      },
      { upsert: true, new: true }
    );
    console.log("4. Created MCA Alumni:", mcaAlumni.email, mcaAlumni.department, mcaAlumni.branch);

    // 5. Create events specifically for MCA branch
    console.log("\n5. Creating proper events...");
    
    // Event 1: For MCA Students only
    const mcaStudentEvent = await Event.findOneAndUpdate(
      { title: 'MCA Programming Contest' },
      {
        title: 'MCA Programming Contest',
        description: 'Programming contest specifically for MCA students',
        date: new Date('2025-12-15'),
        location: 'Computer Lab A',
        createdBy: collegeAdmin._id,
        department: 'Computer Science',
        branch: 'MCA',
        targetAudience: ['student']
      },
      { upsert: true, new: true }
    );
    console.log("Created Event 1:", mcaStudentEvent.title, "| Target:", mcaStudentEvent.targetAudience, "| Branch:", mcaStudentEvent.branch);

    // Event 2: For MCA Alumni only
    const mcaAlumniEvent = await Event.findOneAndUpdate(
      { title: 'MCA Alumni Networking' },
      {
        title: 'MCA Alumni Networking',
        description: 'Networking event for MCA alumni',
        date: new Date('2025-12-20'),
        location: 'Conference Hall',
        createdBy: collegeAdmin._id,
        department: 'Computer Science',
        branch: 'MCA',
        targetAudience: ['alumni']
      },
      { upsert: true, new: true }
    );
    console.log("Created Event 2:", mcaAlumniEvent.title, "| Target:", mcaAlumniEvent.targetAudience, "| Branch:", mcaAlumniEvent.branch);

    // Event 3: For both MCA Students and Alumni
    const mcaBothEvent = await Event.findOneAndUpdate(
      { title: 'MCA Department Symposium' },
      {
        title: 'MCA Department Symposium',
        description: 'Symposium for all MCA students and alumni',
        date: new Date('2025-12-25'),
        location: 'Main Auditorium',
        createdBy: collegeAdmin._id,
        department: 'Computer Science',
        branch: 'MCA',
        targetAudience: ['student', 'alumni']
      },
      { upsert: true, new: true }
    );
    console.log("Created Event 3:", mcaBothEvent.title, "| Target:", mcaBothEvent.targetAudience, "| Branch:", mcaBothEvent.branch);

    // Event 4: General CS event (all branches)
    const generalEvent = await Event.findOneAndUpdate(
      { title: 'CS Department Annual Day' },
      {
        title: 'CS Department Annual Day',
        description: 'Annual day celebration for all CS students and alumni',
        date: new Date('2025-12-30'),
        location: 'Main Campus',
        createdBy: collegeAdmin._id,
        department: 'Computer Science',
        // No branch specified - for all CS branches
        targetAudience: ['student', 'alumni']
      },
      { upsert: true, new: true }
    );
    console.log("Created Event 4:", generalEvent.title, "| Target:", generalEvent.targetAudience, "| Branch:", generalEvent.branch || 'ALL');

    console.log("\n=== PROPER TEST DATA CREATED ===");
    console.log("\nTest Accounts for CMPICA:");
    console.log("- College Admin: admin.cmpica@test.com / password123");
    console.log("- MCA Student: student.mca.cmpica@test.com / password123");
    console.log("- MCA Alumni: alumni.mca.cmpica@test.com / password123");
    
    console.log("\nExpected Results:");
    console.log("MCA Student should see:");
    console.log("  - MCA Programming Contest (student only)");
    console.log("  - MCA Department Symposium (both)");
    console.log("  - CS Department Annual Day (general)");
    
    console.log("\nMCA Alumni should see:");
    console.log("  - MCA Alumni Networking (alumni only)");
    console.log("  - MCA Department Symposium (both)");
    console.log("  - CS Department Annual Day (general)");

  } catch (error) {
    console.error("Error:", error);
  } finally {
    mongoose.connection.close();
  }
}

cleanAndCreateProperData();