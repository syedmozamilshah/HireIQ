import axios from 'axios';
import { 
  USER_API_END_POINT, 
  JOB_API_END_POINT, 
  APPLICATION_API_END_POINT, 
  COMPANY_API_END_POINT 
} from '@/utils/constant';

// Create axios instance with default config
const api = axios.create({
  withCredentials: true,
  timeout: 30000, // 30 seconds timeout for AI analysis
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.response?.data);
    
    // Handle specific HTTP status codes
    if (error.response?.status === 401) {
      console.warn('Unauthorized access - redirecting to login');
      // You might want to dispatch a logout action here
    } else if (error.response?.status === 503) {
      console.error('Service unavailable - possibly Python backend is down');
    }
    
    return Promise.reject(error);
  }
);

// User API methods
export const userAPI = {
  login: (credentials) => api.post(`${USER_API_END_POINT}/login`, credentials),
  register: (userData) => api.post(`${USER_API_END_POINT}/register`, userData),
  logout: () => api.get(`${USER_API_END_POINT}/logout`),
  updateProfile: (profileData) => api.post(`${USER_API_END_POINT}/profile/update`, profileData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Job API methods
export const jobAPI = {
  getAllJobs: () => api.get(`${JOB_API_END_POINT}/get`),
  getJobById: (id) => api.get(`${JOB_API_END_POINT}/get/${id}`),
  getAllAdminJobs: () => api.get(`${JOB_API_END_POINT}/getadminjobs`),
  postJob: (jobData) => api.post(`${JOB_API_END_POINT}/post`, jobData),
  updateJob: (id, jobData) => api.put(`${JOB_API_END_POINT}/update/${id}`, jobData),
  deleteJob: (id) => api.delete(`${JOB_API_END_POINT}/delete/${id}`),
};

// Company API methods
export const companyAPI = {
  getAllCompanies: () => api.get(`${COMPANY_API_END_POINT}/get/`),
  getCompanyById: (id) => api.get(`${COMPANY_API_END_POINT}/get/${id}`),
  registerCompany: (companyData) => api.post(`${COMPANY_API_END_POINT}/register`, companyData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateCompany: (id, companyData) => api.put(`${COMPANY_API_END_POINT}/update/${id}`, companyData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Application API methods
export const applicationAPI = {
  applyForJob: (jobId) => api.get(`${APPLICATION_API_END_POINT}/apply/${jobId}`),
  getAppliedJobs: () => api.get(`${APPLICATION_API_END_POINT}/get`),
  getJobApplicants: (jobId) => api.get(`${APPLICATION_API_END_POINT}/${jobId}/applicants`),
  updateApplicationStatus: (applicationId, status) => 
    api.post(`${APPLICATION_API_END_POINT}/status/${applicationId}/update`, { status }),
};

// Career Analysis API methods (Python backend integration)
export const careerAPI = {
  analyzeResume: (jobDescription) => api.post(`${USER_API_END_POINT.replace('/user', '/career')}/analyze`, 
    { jobDescription },
    { timeout: 60000 } // 60 seconds for AI analysis
  ),
  getAnalysisHistory: () => api.get(`${USER_API_END_POINT.replace('/user', '/career')}/history`),
};

// Health check methods for backend services
export const healthAPI = {
  checkExpressHealth: () => api.get(`${USER_API_END_POINT.replace('/api/v1/user', '/health')}`),
  checkPythonHealth: () => api.get(`${USER_API_END_POINT.replace('/api/v1/user', '/ai/health')}`),
};

// Utility function to check if both backends are running
export const checkBackendStatus = async () => {
  try {
    const [expressHealth, pythonHealth] = await Promise.allSettled([
      healthAPI.checkExpressHealth(),
      healthAPI.checkPythonHealth(),
    ]);

    return {
      express: expressHealth.status === 'fulfilled',
      python: pythonHealth.status === 'fulfilled',
      expressError: expressHealth.status === 'rejected' ? expressHealth.reason : null,
      pythonError: pythonHealth.status === 'rejected' ? pythonHealth.reason : null,
    };
  } catch (error) {
    console.error('Error checking backend status:', error);
    return {
      express: false,
      python: false,
      expressError: error,
      pythonError: error,
    };
  }
};

export default api;
