import api from './axios';

export const authAPI = {
  // Authentication
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  loginWithGoogle: (idToken) => api.post('/auth/google', { idToken }),
  loginWithGoogleOAuth: (code, redirectUri) => api.post('/auth/google/oauth', { code, redirectUri }),
  
  // Profile
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  deleteAccount: () => api.delete('/auth/profile'),
  changePassword: (data) => api.put('/auth/change-password', data),
  
  // Password Reset
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  
  // Email Verification
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  resendVerification: () => api.post('/auth/resend-verification'),
};

export const courseAPI = {
  // Courses
  getCourses: (params) => api.get('/courses', { params }),
  getCourse: (id) => api.get(`/courses/${id}`),
  createCourse: (data) => api.post('/courses', data),
  updateCourse: (id, data) => api.put(`/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`/courses/${id}`),
  
  // Featured and recommended
  getFeaturedCourses: () => api.get('/courses/featured'),
  getRecommendedCourses: () => api.get('/courses/recommended'),
  
  // Course categories and filters
  getCategories: () => api.get('/courses/categories'),
  // Align with server: use /courses?search=...
  searchCourses: (query) => api.get('/courses', { params: { search: query } }),
  
  // Course content
  getLessons: (courseId) => api.get(`/courses/${courseId}/lessons`),
  getLesson: (courseId, lessonId) => api.get(`/courses/${courseId}/lessons/${lessonId}`),
  createLesson: (courseId, data) => api.post(`/courses/${courseId}/lessons`, data),
  updateLesson: (courseId, lessonId, data) => api.put(`/courses/${courseId}/lessons/${lessonId}`, data),
  deleteLesson: (courseId, lessonId) => api.delete(`/courses/${courseId}/lessons/${lessonId}`),
};

export const enrollmentAPI = {
  // Enrollments
  getMyEnrollments: () => api.get('/enrollments/my'),
  enrollInCourse: (courseId) => api.post('/enrollments', { courseId }),
  unenrollFromCourse: (courseId) => api.delete(`/enrollments/${courseId}`),
  
  // Progress tracking
  getProgress: (courseId) => api.get(`/enrollments/${courseId}/progress`),
  getCompletedLessons: (courseId) => api.get(`/enrollments/${courseId}/completed-lessons`),
  updateProgress: (courseId, lessonId, data) => 
    api.put(`/enrollments/${courseId}/lessons/${lessonId}/progress`, data),
  markLessonComplete: (courseId, lessonId) => 
    api.post(`/enrollments/${courseId}/lessons/${lessonId}/complete`),
  
  // Favorites
  getFavorites: () => api.get('/favorites'),
  addToFavorites: (courseId) => api.post('/favorites', { courseId }),
  removeFromFavorites: (courseId) => api.delete(`/favorites/${courseId}`),
};

export const aiAPI = {
  // AI Assistant
  askQuestion: (data) => api.post('/ai/ask', data),
  getRecommendations: (preferences) => api.post('/ai/recommendations', preferences),
  generateStudyPlan: (courseId, preferences) => 
    api.post('/ai/study-plan', { courseId, preferences }),
  
  // Content generation
  generateQuiz: (lessonId) => api.post('/ai/generate-quiz', { lessonId }),
  explainConcept: (concept, context) => api.post('/ai/explain', { concept, context }),
  summarizeLesson: (lessonId) => api.post('/ai/summarize', { lessonId }),
};

export const discussionAPI = {
  // Discussions
  getDiscussions: (courseId) => api.get(`/courses/${courseId}/discussions`),
  createDiscussion: (courseId, data) => api.post(`/courses/${courseId}/discussions`, data),
  updateDiscussion: (discussionId, data) => api.put(`/discussions/${discussionId}`, data),
  deleteDiscussion: (discussionId) => api.delete(`/discussions/${discussionId}`),
  
  // Replies
  addReply: (discussionId, data) => api.post(`/discussions/${discussionId}/replies`, data),
  updateReply: (discussionId, replyId, data) => 
    api.put(`/discussions/${discussionId}/replies/${replyId}`, data),
  deleteReply: (discussionId, replyId) => 
    api.delete(`/discussions/${discussionId}/replies/${replyId}`),
};

export const userAPI = {
  // User management
  createUser: (data) => api.post('/users', data),
  getUsers: (params) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  
  // User stats and analytics
  getUserStats: (id) => api.get(`/users/${id}/stats`),
  getUserActivity: (id) => api.get(`/users/${id}/activity`),
};

export const uploadAPI = {
  // File uploads
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  uploadVideo: (file) => {
    const formData = new FormData();
    formData.append('video', file);
    return api.post('/upload/video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  uploadDocument: (file) => {
    const formData = new FormData();
    formData.append('document', file);
    return api.post('/upload/document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};
