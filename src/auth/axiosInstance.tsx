// axiosInstance.js
import axios from 'axios';

//https://localhost:5000/api/auth/
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api/auth/'
});

// Add auth token from localStorage or other state
axiosInstance.interceptors.request.use(config => {
  const userInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
  if (userInfo) {
    config.headers.Authorization = `Bearer ${JSON.parse(userInfo)?.token}`;
  } else if (config.url !== 'login') {
    window.location.href = '/login'
  }
  return config;
});

export default axiosInstance;
