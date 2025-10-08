require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('./src/models/user');

// Connect to database
mongoose.connect(process.env.MONGODB_URI + process.env.DB_NAME);

async function testAlumniSearch() {
  try {
    console.log("=== TESTING ALUMNI SEARCH ===\n");
    
    // Test as student searching for alumni
    const student = await User.findOne({ email: 'student@test.com' });
    console.log("Student details:", {
      email: student.email,
      role: student.role,
      department: student.department,
      branch: student.branch
    });
    
    // Simulate alumni search filter for student
    let filter = { role: 'alumni', isApproved: true };
    filter.department = student.department; // Simplified filter
    
    console.log("Alumni search filter:", filter);
    
    const alumni = await User.find(filter)
      .select('firstName lastName email department branch startYear endYear');
    
    console.log(`Found ${alumni.length} alumni:`);
    alumni.forEach(a => {
      console.log(`- ${a.firstName} ${a.lastName} (${a.email}) | Dept: ${a.department} | Branch: ${a.branch}`);
    });

  } catch (error) {
    console.error("Error testing alumni search:", error);
  } finally {
    mongoose.connection.close();
  }
}

testAlumniSearch();