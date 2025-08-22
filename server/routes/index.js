const express = require('express');
const router = express.Router();
const multer = require('multer');

// Import controllers
const UserController = require('../controllers/userController');
const CourseController = require('../controllers/courseController');
const EnrollmentController = require('../controllers/enrollmentController');
const AIController = require('../controllers/aiController');

// Import middlewares
const { authentication, authorization } = require('../middlewares/authentication');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Public routes
// Auth
router.post('/auth/register', UserController.register);
router.post('/auth/login', UserController.login);
router.post('/auth/logout', (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out' });
});
router.post('/auth/google', UserController.googleSignIn);
router.post('/auth/google/oauth', UserController.googleOAuth);
router.post('/auth/forgot-password', UserController.forgotPassword);
router.post('/auth/reset-password', UserController.resetPassword);
// Public confirm endpoint (expects { token }) to match client
router.post('/auth/verify-email', UserController.verifyEmail);
// Authenticated request to send a new verification email
router.post('/auth/verify-email/request', authentication, UserController.requestEmailVerification);
// Courses
router.get('/courses', CourseController.getAllCourses);
router.get('/courses/categories', CourseController.getCourseCategories);
router.get('/courses/:id', CourseController.getCourseById);

// Protected routes
// User routes
router.get('/auth/profile', authentication, UserController.getProfile);
router.put('/auth/profile', authentication, UserController.updateProfile);
router.delete('/auth/profile', authentication, UserController.deleteAccount);

// Users CRUD (generic) - any authenticated user can list/create; self or admin can update/delete
router.post('/users', authentication, UserController.createUser);
router.get('/users', authentication, UserController.getUsers);
router.get('/users/:id', authentication, UserController.getUserById); // any authenticated
router.put('/users/:id', authentication, UserController.updateUser); // self (basic) or admin (all)
router.delete('/users/:id', authentication, UserController.deleteUser); // self or admin

// Course routes for instructors
router.get('/my-courses', authentication, authorization(['instructor', 'admin']), CourseController.getMyCourses);
router.post('/courses', authentication, authorization(['instructor', 'admin']), upload.single('thumbnail'), CourseController.createCourse);
router.put('/courses/:id', authentication, authorization(['instructor', 'admin']), upload.single('thumbnail'), CourseController.updateCourse);
router.delete('/courses/:id', authentication, authorization(['instructor', 'admin']), CourseController.deleteCourse);
router.patch('/courses/:id/publish', authentication, authorization(['instructor', 'admin']), CourseController.publishCourse);

// Enrollment routes
// Enrollment routes
router.post('/enroll/:courseId', authentication, EnrollmentController.enrollCourse); // legacy support
router.post('/enrollments', authentication, EnrollmentController.enrollCourse); // expects { courseId }
router.get('/enrollments', authentication, EnrollmentController.getMyEnrollments); // legacy
router.get('/enrollments/my', authentication, EnrollmentController.getMyEnrollments);
router.get('/enrollments/:courseId/progress', authentication, EnrollmentController.getProgress);
router.put('/enrollments/:courseId/progress', authentication, EnrollmentController.updateProgress);
router.post('/enrollments/:courseId/lessons/:lessonId/complete', authentication, EnrollmentController.markLessonComplete);
router.get('/enrollments/:courseId/completed-lessons', authentication, EnrollmentController.getCompletedLessons);
router.patch('/enrollments/:courseId/favorite', authentication, EnrollmentController.toggleFavorite);
router.get('/favorites', authentication, EnrollmentController.getFavorites);
router.post('/favorites', authentication, EnrollmentController.addFavorite);
router.delete('/favorites/:courseId', authentication, EnrollmentController.removeFavorite);
router.delete('/enrollments/:courseId', authentication, EnrollmentController.unenrollCourse);

// AI routes
router.post('/ai/recommendations', authentication, AIController.getPersonalizedRecommendations);
router.post('/ai/study-plan', authentication, AIController.generateStudyPlan);
router.post('/ai/ask', authentication, AIController.askQuestion);
router.post('/ai/quiz', authentication, AIController.generateQuiz); // legacy
router.post('/ai/generate-quiz', authentication, AIController.generateQuiz);
router.post('/ai/explain', authentication, AIController.explainConcept);

// Admin routes
router.get('/admin/users', authentication, authorization(['admin']), UserController.getAllUsers);

module.exports = router;
