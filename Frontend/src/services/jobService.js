export const updateJob = async (jobId, jobData, token) => {
  return axios.put(`${API_BASE}/jobs/update/${jobId}`, jobData, {
    withCredentials: true,
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deleteJob = async (jobId, token) => {
  return axios.delete(`${API_BASE}/jobs/delete/${jobId}`, {
    withCredentials: true,
    headers: { Authorization: `Bearer ${token}` },
  });
};
// import axios from 'axios';
// const API_BASE = 'http://localhost:5000';

// export const fetchJobs = async (token) => {
//   return axios.get(`${API_BASE}/jobs/all`, {
//     withCredentials: true,
//     headers: { Authorization: `Bearer ${token}` },
//   });
// };

// export const createJob = async (jobData, token) => {
//   return axios.post(`${API_BASE}/jobs/create`, jobData, {
//     withCredentials: true,
//     headers: { Authorization: `Bearer ${token}` },
//   });
// };

// export const applyJob = async (jobId, applicationData, token) => {
//   return axios.post(`${API_BASE}/jobs/apply/${jobId}`, applicationData, {
//     withCredentials: true,
//     headers: { Authorization: `Bearer ${token}` },
//   });
// };


import axios from 'axios';
const API_BASE = 'http://localhost:5000';

export const fetchJobs = async (token) => {
  return axios.get(`${API_BASE}/jobs/all`, {
    withCredentials: true,
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const createJob = async (jobData, token) => {
  return axios.post(`${API_BASE}/jobs/create`, jobData, {
    withCredentials: true,
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const applyJob = async (jobId, applicationData, token) => {
  return axios.post(`${API_BASE}/jobs/apply/${jobId}`, applicationData, {
    withCredentials: true,
    headers: { Authorization: `Bearer ${token}` },
  });
};
