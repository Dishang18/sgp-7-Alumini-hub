import axios from 'axios';

const API_BASE = 'http://localhost:5000'; // Changed to match backend port

// MEETING API
export const fetchAlumniList = async (token) => {
  return axios.get(`${API_BASE}/alumniList`, {
    withCredentials: true,
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const createMeetingRequest = async (meetingData, token) => {
  return axios.post(`${API_BASE}/meeting`, meetingData, {
    withCredentials: true,
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const approveMeeting = async (id, token) => {
  return axios.patch(`${API_BASE}/meeting/${id}/approve`, {}, {
    withCredentials: true,
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const rejectMeeting = async (id, token) => {
  return axios.patch(`${API_BASE}/meeting/${id}/reject`, {}, {
    withCredentials: true,
    headers: { Authorization: `Bearer ${token}` },
  });
};

// EVENT API
export const updateEvent = async (id, eventData, token) => {
  return axios.put(`${API_BASE}/event/update/${id}`, eventData, {
    withCredentials: true,
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deleteEvent = async (id, token) => {
  return axios.delete(`${API_BASE}/event/delete/${id}`, {
    withCredentials: true,
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const fetchEvents = async (token) => {
  return axios.get(`${API_BASE}/event/all`, {
    withCredentials: true,
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const createEvent = async (eventData, token) => {
  return axios.post(`${API_BASE}/event/create`, eventData, {
    withCredentials: true,
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const fetchMeetings = async (token) => {
  return axios.get(`${API_BASE}/meeting`, {
    withCredentials: true,
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const createMeeting = async (meetingData, token) => {
  return axios.post(`${API_BASE}/meeting`, meetingData, {
    withCredentials: true,
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const bulkImport = async (formData, token) => {
  return axios.post(`${API_BASE}/bulkImport`, formData, {
    withCredentials: true,
    headers: { Authorization: `Bearer ${token}` },
  });
};

// POSTS API
export const fetchPosts = async () => {
  return axios.get(`${API_BASE}/posts/all`, {
    withCredentials: true,
  });
};

export const createPost = async (postData) => {
  return axios.post(`${API_BASE}/posts/create`, postData, {
    withCredentials: true,
  });
};

export const toggleLikePost = async (postId) => {
  return axios.post(`${API_BASE}/posts/like/${postId}`, {}, {
    withCredentials: true,
  });
};

export const addCommentToPost = async (postId, commentData) => {
  return axios.post(`${API_BASE}/posts/comment/${postId}`, commentData, {
    withCredentials: true,
  });
};

export const deletePost = async (postId) => {
  return axios.delete(`${API_BASE}/posts/delete/${postId}`, {
    withCredentials: true,
  });
};

export const fetchUserPosts = async (userId) => {
  return axios.get(`${API_BASE}/posts/user/${userId}`, {
    withCredentials: true,
  });
};

// PROFESSOR APPROVAL API
export const fetchPendingStudents = async () => {
  return axios.get(`${API_BASE}/professor/pending-students`, {
    withCredentials: true,
  });
};

export const approveStudent = async (studentId, action) => {
  return axios.put(`${API_BASE}/professor/student/${studentId}/approve`, 
    { action }, 
    { withCredentials: true }
  );
};

export const fetchApprovedStudents = async () => {
  return axios.get(`${API_BASE}/professor/approved-students`, {
    withCredentials: true,
  });
};

export const fetchApprovalStats = async () => {
  return axios.get(`${API_BASE}/professor/approval-stats`, {
    withCredentials: true,
  });
};
