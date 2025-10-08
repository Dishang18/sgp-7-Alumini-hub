import apiClient from '../config/apiClient';

// MEETING API
export const fetchAlumniList = async () => {
  return apiClient.get('/alumniList');
};

export const createMeetingRequest = async (meetingData) => {
  return apiClient.post('/meeting', meetingData);
};

export const approveMeeting = async (id) => {
  return apiClient.patch(`/meeting/${id}/approve`, {});
};

export const rejectMeeting = async (id, rejectionReason) => {
  return apiClient.patch(`/meeting/${id}/reject`, { rejectionReason });
};

// EVENT API
export const updateEvent = async (id, eventData) => {
  return apiClient.put(`/event/update/${id}`, eventData);
};

export const deleteEvent = async (id) => {
  return apiClient.delete(`/event/delete/${id}`);
};

export const fetchEvents = async () => {
  return apiClient.get('/event/all');
};

export const createEvent = async (eventData) => {
  return apiClient.post('/event/create', eventData);
};

export const fetchMeetings = async () => {
  return apiClient.get('/meeting');
};

export const createMeeting = async (meetingData) => {
  return apiClient.post('/meeting', meetingData);
};

export const bulkImport = async (formData) => {
  return apiClient.post('/bulkImport', formData);
};

// POSTS API
export const fetchPosts = async () => {
  return apiClient.get('/posts/all');
};

export const createPost = async (postData) => {
  return apiClient.post('/posts/create', postData);
};

export const toggleLikePost = async (postId) => {
  return apiClient.post(`/posts/like/${postId}`, {});
};

export const addCommentToPost = async (postId, commentData) => {
  return apiClient.post(`/posts/comment/${postId}`, commentData);
};

export const deletePost = async (postId) => {
  return apiClient.delete(`/posts/delete/${postId}`);
};

export const fetchUserPosts = async (userId) => {
  return apiClient.get(`/posts/user/${userId}`);
};

// PROFESSOR APPROVAL API
export const fetchPendingStudents = async () => {
  return apiClient.get('/professor/pending-students');
};

export const approveStudent = async (studentId, action) => {
  return apiClient.put(`/professor/student/${studentId}/approve`, { action });
};

export const fetchApprovedStudents = async () => {
  return apiClient.get('/professor/approved-students');
};

export const fetchApprovalStats = async () => {
  return apiClient.get('/professor/approval-stats');
};
