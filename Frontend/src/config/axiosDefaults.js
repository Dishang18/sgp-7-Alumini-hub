import axios from 'axios';

// Set axios defaults from Vite environment variable so all plain axios calls
// use the configured backend (this affects modules that import axios directly).
const BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
axios.defaults.baseURL = BASE;
axios.defaults.withCredentials = true;

// Helpful log during dev builds
if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.log(`🌐 axios baseURL set to ${axios.defaults.baseURL}`);
}

export default axios;
