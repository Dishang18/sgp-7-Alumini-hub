import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import apiClient from '../config/apiClient';

const AuthDebug = () => {
  const [authStatus, setAuthStatus] = useState('checking...');
  const [backendResponse, setBackendResponse] = useState(null);
  const [error, setError] = useState(null);
  
  const loggedIn = useSelector((state) => state.loggedIn);
  const user = useSelector((state) => state.currentUser);

  const checkAuth = async () => {
    try {
      setAuthStatus('checking...');
      setError(null);
      
      const response = await apiClient.get('/auth/check-auth');
      setBackendResponse(response.data);
      setAuthStatus('✅ Authenticated with backend');
    } catch (err) {
      setError(err.response?.data || err.message);
      setAuthStatus('❌ Not authenticated with backend');
    }
  };

  const testEventEndpoint = async () => {
    try {
      const response = await apiClient.get('/event/all');
      console.log('Event response:', response.data);
      alert('✅ Event endpoint working!');
    } catch (err) {
      console.error('Event error:', err);
      alert('❌ Event endpoint failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const forceLogout = async () => {
    try {
      await apiClient.post('/auth/logout', {});
      alert('✅ Logged out successfully');
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout error:', err);
      alert('Logout attempted - redirecting to login');
      window.location.href = '/login';
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>
      
      <div className="grid gap-6">
        {/* Frontend State */}
        <div className="border rounded p-4">
          <h2 className="text-lg font-semibold mb-2">Frontend Redux State</h2>
          <p><strong>Logged In:</strong> {loggedIn ? '✅ True' : '❌ False'}</p>
          <p><strong>User:</strong> {user ? `${user.email} (${user.role})` : 'None'}</p>
        </div>

        {/* Backend Auth Check */}
        <div className="border rounded p-4">
          <h2 className="text-lg font-semibold mb-2">Backend Authentication</h2>
          <p><strong>Status:</strong> {authStatus}</p>
          {backendResponse && (
            <div className="mt-2">
              <p><strong>Backend User:</strong> {backendResponse.user?.email} ({backendResponse.user?.role})</p>
            </div>
          )}
          {error && (
            <div className="mt-2 text-red-600">
              <p><strong>Error:</strong> {JSON.stringify(error, null, 2)}</p>
            </div>
          )}
          <button 
            onClick={checkAuth}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Recheck Auth
          </button>
        </div>

        {/* Action Buttons */}
        <div className="border rounded p-4">
          <h2 className="text-lg font-semibold mb-2">Test Actions</h2>
          <div className="space-x-2">
            <button 
              onClick={testEventEndpoint}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Test Event Endpoint
            </button>
            <button 
              onClick={forceLogout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Force Logout & Redirect
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="border rounded p-4 bg-yellow-50">
          <h2 className="text-lg font-semibold mb-2">Fix Instructions</h2>
          <ol className="list-decimal list-inside space-y-1">
            <li>If frontend shows logged in but backend auth fails → Click "Force Logout"</li>
            <li>Clear browser cookies/storage for this site</li>
            <li>Go to login page and log in again</li>
            <li>Return here and test again</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default AuthDebug;