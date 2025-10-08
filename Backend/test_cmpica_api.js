// Test API with the new CMPICA accounts
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testCMPICAAPI() {
  try {
    console.log("=== TESTING CMPICA API ===\n");
    
    // Test 1: Login as MCA Student from CMPICA
    console.log("1. Logging in as CMPICA MCA student...");
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'student.mca.cmpica@test.com',
      password: 'password123',
      role: 'student'
    }, {
      withCredentials: true
    });
    
    const loginData = loginResponse.data;
    console.log("Login successful:", loginData.user.firstName, loginData.user.lastName);
    console.log("Department:", loginData.user.department, "| Branch:", loginData.user.branch);
    
    const cookies = loginResponse.headers['set-cookie'];
    
    // Test 2: Fetch events for MCA student
    console.log("\n2. Fetching events for MCA student...");
    const eventsResponse = await axios.get(`${BASE_URL}/event/all`, {
      withCredentials: true,
      headers: {
        'Cookie': cookies ? cookies.join('; ') : ''
      }
    });
    
    const events = eventsResponse.data.data.events;
    console.log(`Found ${events.length} events:`);
    events.forEach((event, index) => {
      console.log(`  ${index + 1}. "${event.title}" (Branch: ${event.branch || 'ALL'}, Target: [${event.targetAudience.join(', ')}])`);
    });
    
    // Test 3: Login as MCA Alumni and test events
    console.log("\n3. Testing as CMPICA MCA alumni...");
    const alumniLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'alumni.mca.cmpica@test.com',
      password: 'password123',
      role: 'alumni'
    }, {
      withCredentials: true
    });
    
    const alumniCookies = alumniLoginResponse.headers['set-cookie'];
    
    const alumniEventsResponse = await axios.get(`${BASE_URL}/event/all`, {
      withCredentials: true,
      headers: {
        'Cookie': alumniCookies ? alumniCookies.join('; ') : ''
      }
    });
    
    const alumniEvents = alumniEventsResponse.data.data.events;
    console.log(`Alumni found ${alumniEvents.length} events:`);
    alumniEvents.forEach((event, index) => {
      console.log(`  ${index + 1}. "${event.title}" (Branch: ${event.branch || 'ALL'}, Target: [${event.targetAudience.join(', ')}])`);
    });
    
    // Test 4: Alumni search from student account
    console.log("\n4. Testing alumni search from student account...");
    const alumniSearchResponse = await axios.get(`${BASE_URL}/users/alumni`, {
      withCredentials: true,
      headers: {
        'Cookie': cookies ? cookies.join('; ') : ''
      }
    });
    
    const alumniList = alumniSearchResponse.data.data.alumni;
    console.log(`Found ${alumniList.length} alumni:`);
    alumniList.forEach((alumni, index) => {
      console.log(`  ${index + 1}. ${alumni.firstName} ${alumni.lastName} (${alumni.branch}) - ${alumni.email}`);
    });
    
    console.log("\n=== API TEST COMPLETED SUCCESSFULLY ===");
    
  } catch (error) {
    console.error("API Test Error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
}

testCMPICAAPI();