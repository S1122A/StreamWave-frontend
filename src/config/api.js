// Backend API Base URLs
// export const BASE_URL = 'http://localhost:5000';
export const BASE_URL = 'https://streamWave-backend-h0arbvcwd7e4anhh.westeurope-01.azurewebsites.net';

// Specific Endpoint URLs
export const ENDPOINTS = {
  AUTH: {
    BASE: '/api/auth',
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    USERS: '/api/auth/users',
    CREATE_USER: '/api/auth/users',
    DELETE_USER: (userId) => `/api/auth/users/${userId}`,
    TOGGLE_USER_STATUS: (userId) => `/api/auth/users/${userId}/toggle-status`,
    PLATFORM_STATS: '/api/auth/platform-stats'
  },
  VIDEOS: {
    LIST: '/api/videos',
    UPLOAD: '/api/videos/upload',
    DETAILS: (videoId) => `/api/videos/${videoId}`,
    LIKE: (videoId) => `/api/videos/${videoId}/like`,
    DELETE: (videoId) => `/api/videos/${videoId}`,
    STATS: (videoId) => `/api/videos/${videoId}/stats`,
    ANALYTICS: '/api/videos/all-analytics'
  },
  CREATOR: {
    VIDEOS: '/api/creator/videos',
    DASHBOARD_STATS: '/api/creator/dashboard-stats',
    VIDEO_ANALYTICS: (videoId) => `/api/creator/videos/${videoId}/analytics`
  },
  COMMENTS: {
    ADD: '/api/comments',
    GET: (videoId) => `/api/comments/${videoId}`
  },
  CONSUMER: {
    LIKED_VIDEOS: '/api/videos/liked'
  }
};

