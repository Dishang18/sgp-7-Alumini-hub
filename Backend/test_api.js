// Test the event API endpoints directly
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testEventAPI() {
  try {
    console.log("=== TESTING EVENT API ===\n");
    
    // First, login as MCA student to get cookies
    console.log("1. Logging in as MCA student...");
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'student.mca@test.com',
      password: 'password123',
      role: 'student'
    }, {
      withCredentials: true
    });
    
    console.log("Login response:", loginResponse.data);
    
    // Extract cookies from login response
    const cookies = loginResponse.headers['set-cookie'];
    console.log("Received cookies:", cookies);
    
    // Now try to fetch events with the cookies
    console.log("\n2. Fetching events as MCA student...");
    const eventsResponse = await axios.get(`${BASE_URL}/event/all`, {
      withCredentials: true,
      headers: {
        'Cookie': cookies ? cookies.join('; ') : ''
      }
    });
    
    console.log("Events response:", eventsResponse.data);
    console.log("Number of events:", eventsResponse.data.data?.events?.length || 0);
    if (eventsResponse.data.data?.events) {
      console.log("Event titles:");
      eventsResponse.data.data.events.forEach(event => {
        console.log(`  - "${event.title}" (Branch: ${event.branch || 'ALL'})`);
      });
    }
    
    // Test alumni search
    console.log("\n3. Testing alumni search as MCA student...");
    const alumniResponse = await axios.get(`${BASE_URL}/users/alumni`, {
      withCredentials: true,
      headers: {
        'Cookie': cookies ? cookies.join('; ') : ''
      }
    });
    
    console.log("Alumni response:", alumniResponse.data);
    console.log("Number of alumni:", alumniResponse.data.data?.alumni?.length || 0);
    if (alumniResponse.data.data?.alumni) {
      console.log("Alumni found:");
      alumniResponse.data.data.alumni.forEach(alumni => {
        console.log(`  - ${alumni.firstName} ${alumni.lastName} (${alumni.branch})`);
      });
    }
    
    // Test as MCA Alumni
    console.log("\n4. Testing as MCA Alumni...");
    const alumniLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'alumni.mca@test.com',
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
    
    console.log("MCA Alumni events:", alumniEventsResponse.data.data?.events?.length || 0);
    if (alumniEventsResponse.data.data?.events) {
      console.log("Alumni event titles:");
      alumniEventsResponse.data.data.events.forEach(event => {
        console.log(`  - "${event.title}" (Branch: ${event.branch || 'ALL'})`);
      });
    }
    
  } catch (error) {
    console.error("API Test Error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
}

testEventAPI();