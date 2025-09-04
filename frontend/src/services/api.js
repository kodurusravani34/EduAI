import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

export const userService = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  getDashboard: async () => {
    const response = await api.get('/users/dashboard');
    return response.data;
  },

  getAnalytics: async (period = '7d') => {
    const response = await api.get(`/users/analytics?period=${period}`);
    return response.data;
  },
};

export const goalService = {
  getGoals: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/goals?${params}`);
    return response.data;
  },

  createGoal: async (goalData) => {
    const response = await api.post('/goals', goalData);
    return response.data;
  },

  updateGoal: async (goalId, goalData) => {
    const response = await api.put(`/goals/${goalId}`, goalData);
    return response.data;
  },

  deleteGoal: async (goalId) => {
    const response = await api.delete(`/goals/${goalId}`);
    return response.data;
  },

  updateProgress: async (goalId, progress) => {
    const response = await api.patch(`/goals/${goalId}/progress`, { progress });
    return response.data;
  },

  updateMilestone: async (goalId, milestoneIndex, updates) => {
    const response = await api.patch(`/goals/${goalId}/milestones/${milestoneIndex}`, updates);
    return response.data;
  },

  getSuggestions: async () => {
    const response = await api.get('/goals/suggestions/ai');
    return response.data;
  },
};

export const lessonService = {
  getLessons: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/lessons?${params}`);
    return response.data;
  },

  createLesson: async (lessonData) => {
    const response = await api.post('/lessons', lessonData);
    return response.data;
  },

  updateLesson: async (lessonId, lessonData) => {
    const response = await api.put(`/lessons/${lessonId}`, lessonData);
    return response.data;
  },

  deleteLesson: async (lessonId) => {
    const response = await api.delete(`/lessons/${lessonId}`);
    return response.data;
  },

  startLesson: async (lessonId) => {
    const response = await api.patch(`/lessons/${lessonId}/start`);
    return response.data;
  },

  completeLesson: async (lessonId, data) => {
    const response = await api.patch(`/lessons/${lessonId}/complete`, data);
    return response.data;
  },

  updateProgress: async (lessonId, progressData) => {
    const response = await api.patch(`/lessons/${lessonId}/progress`, progressData);
    return response.data;
  },

  getRecommendations: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await api.get(`/lessons/recommendations/ai?${queryParams}`);
    return response.data;
  },
};

export const youtubeService = {
  searchVideos: async (query, maxResults = 10) => {
    const response = await api.get(`/youtube/search?q=${encodeURIComponent(query)}&maxResults=${maxResults}`);
    return response.data;
  },

  getVideoDetails: async (videoId) => {
    const response = await api.get(`/youtube/video/${videoId}`);
    return response.data;
  },

  getTrendingVideos: async (category = 'education') => {
    const response = await api.get(`/youtube/trending?category=${category}`);
    return response.data;
  },

  saveAsLesson: async (videoData) => {
    const response = await api.post('/youtube/save-as-lesson', videoData);
    return response.data;
  },

  getRecommendations: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await api.get(`/youtube/recommendations?${queryParams}`);
    return response.data;
  },
};

export const aiService = {
  generateStudyPlan: async () => {
    const response = await api.post('/ai/study-plan');
    return response.data;
  },

  getLessonRecommendations: async () => {
    const response = await api.get('/ai/lesson-recommendations');
    return response.data;
  },

  getProgressAnalysis: async () => {
    const response = await api.get('/ai/progress-analysis');
    return response.data;
  },

  generateGoalMilestones: async (goalData) => {
    const response = await api.post('/ai/goal-milestones', goalData);
    return response.data;
  },

  getInsights: async () => {
    const response = await api.get('/ai/insights');
    return response.data;
  },
};

export default api;
