/**
 * ============================================
 *  API Service Layer
 * ============================================
 *  Centralized Axios instance and helper functions
 *  for all backend API calls. Automatically attaches
 *  the Firebase ID token to every request.
 */

import axios from 'axios';
import { auth } from '../config/firebase';

// ─── Axios Instance ───────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 90000, // 90s – plan generation for long durations needs more time
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor – attach Firebase token ──────────────
api.interceptors.request.use(
  async (config) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.error('Failed to get Firebase token:', err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor – normalize errors ──────────────────
api.interceptors.response.use(
  (response) => response.data, // Unwrap – callers get data directly
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong';
    const status = error.response?.status || 500;

    // Auto-redirect on 401 (token expired / invalid)
    if (status === 401) {
      console.warn('Auth token invalid – user should re-login');
    }

    return Promise.reject({ message, status, errors: error.response?.data?.errors });
  }
);

// ============================================================
//  USER API
// ============================================================

export const userAPI = {
  /** GET /users/me – fetch current user profile */
  getProfile: () => api.get('/users/me'),

  /** PUT /users/preferences – update user preferences */
  updatePreferences: (preferences) =>
    api.put('/users/preferences', { preferences }),
};

// ============================================================
//  STUDY PLANS API
// ============================================================

export const plansAPI = {
  /** POST /plans – create a new AI-generated study plan */
  create: (planData) => api.post('/plans', planData),

  /** GET /plans – list all plans (supports ?status=&page=&limit=) */
  getAll: (params = {}) => api.get('/plans', { params }),

  /** GET /plans/:id – get single plan with full schedule */
  getById: (id) => api.get(`/plans/${id}`),

  /** PUT /plans/:id – update plan fields */
  update: (id, data) => api.put(`/plans/${id}`, data),

  /** DELETE /plans/:id – delete plan and its tasks */
  delete: (id) => api.delete(`/plans/${id}`),
};

// ============================================================
//  DAILY TASKS API
// ============================================================

export const tasksAPI = {
  /** GET /tasks/:planId/:date – get tasks for a specific day */
  getByDate: (planId, date) => api.get(`/tasks/${planId}/${date}`),

  /** PUT /tasks/:taskId – update task completion / time */
  update: (taskId, data) => api.put(`/tasks/${taskId}`, data),
};

// ============================================================
//  ANALYTICS API
// ============================================================

export const analyticsAPI = {
  /** GET /analytics – get user's analytics dashboard data */
  get: () => api.get('/analytics'),
};

export default api;
