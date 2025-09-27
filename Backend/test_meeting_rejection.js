// Test for meeting rejection with reason
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Mock meeting data
const testMeetingRejection = {
  rejectionReason: "I have a scheduling conflict during that time and cannot attend the meeting."
};

async function testRejectMeetingAPI() {
  console.log('=== Testing Meeting Rejection with Reason ===');
  
  try {
    // This would need actual authentication and a real meeting ID
    const meetingId = '507f1f77bcf86cd799439011'; // Example ObjectId
    
    const response = await axios.patch(
      `${BASE_URL}/meeting/${meetingId}/reject`, 
      testMeetingRejection,
      { withCredentials: true }
    );
    
    console.log('Success:', response.data);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('Authentication required (expected without login)');
    } else if (error.response?.status === 400) {
      console.log('Validation error:', error.response.data.message);
    } else {
      console.log('Error:', error.response?.data || error.message);
    }
  }
}

// Test missing rejection reason
async function testMissingRejectionReason() {
  console.log('=== Testing Missing Rejection Reason ===');
  
  try {
    const meetingId = '507f1f77bcf86cd799439011';
    
    const response = await axios.patch(
      `${BASE_URL}/meeting/${meetingId}/reject`, 
      { rejectionReason: '' }, // Empty reason should fail
      { withCredentials: true }
    );
    
    console.log('Unexpected success:', response.data);
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('Validation working correctly:', error.response.data.message);
    } else {
      console.log('Error:', error.response?.data || error.message);
    }
  }
}

if (require.main === module) {
  console.log('Testing meeting rejection with reason...');
  testRejectMeetingAPI();
  testMissingRejectionReason();
}

module.exports = {
  testRejectMeetingAPI,
  testMissingRejectionReason
};