// Simple test for authentication issues
console.log('Testing frontend-backend authentication...');

// Test 1: Check if backend URL is correct
const backendUrl = import.meta.env.VITE_BACKEND_URL;
console.log('Backend URL from env:', backendUrl);

// Test 2: Check if cookies are being sent
document.addEventListener('DOMContentLoaded', () => {
  console.log('All cookies:', document.cookie);
  
  // Test 3: Try a simple authenticated request
  fetch(`${backendUrl}/event/all`, {
    method: 'GET',
    credentials: 'include', // This is important for cookies
    headers: {
      'Content-Type': 'application/json',
    }
  })
  .then(response => {
    console.log('Event request status:', response.status);
    if (response.status === 401) {
      console.log('❌ Authentication failed - no valid login cookie');
    } else if (response.status === 200) {
      console.log('✅ Authentication successful');
    }
    return response.json();
  })
  .then(data => {
    console.log('Event response:', data);
  })
  .catch(error => {
    console.error('Event request error:', error);
  });
});