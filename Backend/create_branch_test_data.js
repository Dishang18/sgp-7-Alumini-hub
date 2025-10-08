require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('./src/models/user');
const { Event } = require('./src/models/eventModel');
const bcrypt = require('bcryptjs');

// Connect to database
mongoose.connect(process.env.MONGODB_URI + process.env.DB_NAME);

async function createBranchSpecificTestData() {
  try {
    console.log("=== CREATING BRANCH-SPECIFIC TEST DATA ===\n");
    
    const testPassword = await bcrypt.hash('password123', 12);
    
    // Create college admin for Computer Science department
    const collegeAdmin = await User.findOneAndUpdate(
      { email: 'admin.cs@test.com' },
      {
        email: 'admin.cs@test.com',
        password: testPassword,
        firstName: 'CS',
        lastName: 'Admin',
        role: 'collegeadmin',
        department: 'Computer Science',
        isApproved: true
      },
      { upsert: true, new: true }
    );
    console.log("Created College Admin:", collegeAdmin.email, collegeAdmin.department);

    // Create MCA student
    const mcaStudent = await User.findOneAndUpdate(
      { email: 'student.mca@test.com' },
      {
        email: 'student.mca@test.com', 
        password: testPassword,
        firstName: 'MCA',
        lastName: 'Student',
        role: 'student',
        department: 'Computer Science',
        branch: 'MCA',
        enrollmentNumber: 'MCA001',
        year: 2024,
        isApproved: true
      },
      { upsert: true, new: true }
    );
    console.log("Created MCA Student:", mcaStudent.email, mcaStudent.department, mcaStudent.branch);

    // Create MCA alumni
    const mcaAlumni = await User.findOneAndUpdate(
      { email: 'alumni.mca@test.com' },
      {
        email: 'alumni.mca@test.com',
        password: testPassword,
        firstName: 'MCA',
        lastName: 'Alumni',
        role: 'alumni',
        department: 'Computer Science',
        branch: 'MCA',
        startYear: 2020,
        endYear: 2022,
        isApproved: true
      },
      { upsert: true, new: true }
    );
    console.log("Created MCA Alumni:", mcaAlumni.email, mcaAlumni.department, mcaAlumni.branch);

    // Create BCA student (same department, different branch)
    const bcaStudent = await User.findOneAndUpdate(
      { email: 'student.bca@test.com' },
      {
        email: 'student.bca@test.com',
        password: testPassword,
        firstName: 'BCA',
        lastName: 'Student',
        role: 'student',
        department: 'Computer Science',
        branch: 'BCA',
        enrollmentNumber: 'BCA001',
        year: 2024,
        isApproved: true
      },
      { upsert: true, new: true }
    );
    console.log("Created BCA Student:", bcaStudent.email, bcaStudent.department, bcaStudent.branch);

    // Create events
    // Event specifically for MCA branch
    const mcaEvent = await Event.findOneAndUpdate(
      { title: 'MCA Technical Workshop' },
      {
        title: 'MCA Technical Workshop',
        description: 'Technical workshop specifically for MCA students and alumni',
        date: new Date('2025-12-10'),
        location: 'Computer Lab 1',
        createdBy: collegeAdmin._id,
        department: 'Computer Science',
        branch: 'MCA',  // Specific to MCA branch
        targetAudience: ['student', 'alumni']
      },
      { upsert: true, new: true }
    );
    console.log("Created MCA Event:", mcaEvent.title, "Branch:", mcaEvent.branch, "Target:", mcaEvent.targetAudience);

    // Event for all CS students/alumni (no branch specified)
    const generalEvent = await Event.findOneAndUpdate(
      { title: 'CS Department Seminar' },
      {
        title: 'CS Department Seminar',
        description: 'General seminar for all CS students and alumni',
        date: new Date('2025-12-20'),
        location: 'Main Auditorium',
        createdBy: collegeAdmin._id,
        department: 'Computer Science',
        // No branch specified - should be visible to all CS branches
        targetAudience: ['student', 'alumni']
      },
      { upsert: true, new: true }
    );
    console.log("Created General CS Event:", generalEvent.title, "Branch:", generalEvent.branch || 'ALL', "Target:", generalEvent.targetAudience);

    console.log("\n=== BRANCH-SPECIFIC TEST DATA CREATION COMPLETE ===");
    console.log("Test Accounts:");
    console.log("- College Admin: admin.cs@test.com / password123");
    console.log("- MCA Student: student.mca@test.com / password123");
    console.log("- MCA Alumni: alumni.mca@test.com / password123");
    console.log("- BCA Student: student.bca@test.com / password123");
    console.log("\nExpected Behavior:");
    console.log("- MCA Student should see: 'MCA Technical Workshop' + 'CS Department Seminar'");
    console.log("- MCA Alumni should see: 'MCA Technical Workshop' + 'CS Department Seminar'");
    console.log("- BCA Student should see: 'CS Department Seminar' (NOT MCA workshop)");

  } catch (error) {
    console.error("Error creating test data:", error);
  } finally {
    mongoose.connection.close();
  }
}

createBranchSpecificTestData();