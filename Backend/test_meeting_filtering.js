// Test file to verify meeting and alumni filtering
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Test function to check alumni list filtering
async function testAlumniListFiltering() {
  console.log('=== Testing Alumni List Filtering ===');
  
  try {
    // This would need actual authentication cookies to work
    const response = await axios.get(`${BASE_URL}/alumniList`, {
      withCredentials: true
    });
    
    console.log('Alumni list response:', response.data);
  } catch (error) {
    console.log('Alumni list error (expected without auth):', error.response?.status);
  }
}

// Test function to check meeting filtering
async function testMeetingFiltering() {
  console.log('=== Testing Meeting Filtering ===');
  
  try {
    // This would need actual authentication cookies to work
    const response = await axios.get(`${BASE_URL}/meeting`, {
      withCredentials: true
    });
    
    console.log('Meetings response:', response.data);
  } catch (error) {
    console.log('Meetings error (expected without auth):', error.response?.status);
  }
}

// Run tests
if (require.main === module) {
  console.log('Running meeting department filtering tests...');
  testAlumniListFiltering();
  testMeetingFiltering();
}

module.exports = {
  testAlumniListFiltering,
  testMeetingFiltering
};