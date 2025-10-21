import axios from 'axios';

// API base uses axios.defaults.baseURL which is set from VITE_BACKEND_URL by axiosDefaults
const API_BASE = '';

// MEETING API
export const fetchAlumniList = async (token) => {
  return axios.get(`/alumniList`, {
    withCredentials: true,
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const createMeetingRequest = async (meetingData, token) => {
  return axios.post(`/meeting`, meetingData, {
    withCredentials: true,
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const approveMeeting = async (id, token) => {
  return axios.patch(`/meeting/${id}/approve`, {}, {
    withCredentials: true,
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const rejectMeeting = async (id, rejectionReason, token) => {
  return axios.patch(`/meeting/${id}/reject`, { rejectionReason }, {
    withCredentials: true,
    headers: { Authorization: `Bearer ${token}` },
  });
};

// EVENT API
export const updateEvent = async (id, eventData, token) => {
  return axios.put(`/event/update/${id}`, eventData, {
    withCredentials: true,
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deleteEvent = async (id, token) => {
  return axios.delete(`/event/delete/${id}`, {
    withCredentials: true,
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const fetchEvents = async (token) => {
  return axios.get(`/event/all`, {
    withCredentials: true,
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const createEvent = async (eventData, token) => {
  return axios.post(`/event/create`, eventData, {
    withCredentials: true,
    headers: { Authorization: `Bearer ${token}` },
  });
};

// EVENT REQUEST API
export const createEventRequest = async (requestData, token) => {
  return axios.post(`/event/request/create`, requestData, {
    withCredentials: true,
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const fetchEventRequests = async (token) => {
  return axios.get(`/event/requests`, {
    withCredentials: true,
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const approveEventRequest = async (id, token) => {
  return axios.put(`/event/request/${id}/approve`, {}, {
    withCredentials: true,
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const rejectEventRequest = async (id, rejectionReason, token) => {
  return axios.put(`/event/request/${id}/reject`, { rejectionReason }, {
    withCredentials: true,
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const fetchMeetings = async (token) => {
  return axios.get(`/meeting`, {
    withCredentials: true,
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const createMeeting = async (meetingData, token) => {
  return axios.post(`/meeting`, meetingData, {
    withCredentials: true,
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const bulkImport = async (formData, token) => {
  return axios.post(`/bulkImport`, formData, {
    withCredentials: true,
    headers: { Authorization: `Bearer ${token}` },
  });
};

// POSTS API
export const fetchPosts = async () => {
  return axios.get(`/posts/all`, {
    withCredentials: true,
  });
};

export const createPost = async (postData) => {
  return axios.post(`/posts/create`, postData, {
    withCredentials: true,
  });
};

export const toggleLikePost = async (postId) => {
  return axios.post(`/posts/like/${postId}`, {}, {
    withCredentials: true,
  });
};

export const addCommentToPost = async (postId, commentData) => {
  return axios.post(`/posts/comment/${postId}`, commentData, {
    withCredentials: true,
  });
};

export const deletePost = async (postId) => {
  return axios.delete(`/posts/delete/${postId}`, {
    withCredentials: true,
  });
};

export const fetchUserPosts = async (userId) => {
  return axios.get(`/posts/user/${userId}`, {
    withCredentials: true,
  });
};

// PROFESSOR APPROVAL API
export const fetchPendingStudents = async () => {
  return axios.get(`/professor/pending-students`, {
    withCredentials: true,
  });
};

export const approveStudent = async (studentId, action) => {
  return axios.put(`/professor/student/${studentId}/approve`, 
    { action }, 
    { withCredentials: true }
  );
};

export const fetchApprovedStudents = async () => {
  return axios.get(`/professor/approved-students`, {
    withCredentials: true,
  });
};

export const fetchApprovalStats = async () => {
  return axios.get(`/professor/approval-stats`, {
    withCredentials: true,
  });
};

// COLLEGE ADMINS API
export const fetchCollegeAdmins = async () => {
  return axios.get(`/users/college-admins`, {
    withCredentials: true,
  });
};
