import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setViewport } from './stores/uiSlice';
import { debounce } from './utils/helpers';
import { authAPI } from './apis/services';
import { updateUser } from './stores/authSlice';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import LearningPage from './pages/LearningPage';
import MyLearningPage from './pages/MyLearningPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import AIAssistantPage from './pages/AIAssistantPage';
import OAuthCallbackPage from './pages/OAuthCallbackPage';

// Route Protection Components
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading: authLoading } = useSelector((state) => state.auth);
  const { loading } = useSelector((state) => state.ui);

  // Handle viewport changes
  useEffect(() => {
    const handleResize = debounce(() => {
      dispatch(setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      }));
    }, 250);

    // Set initial viewport
    dispatch(setViewport({
      width: window.innerWidth,
      height: window.innerHeight,
    }));

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dispatch]);

  // Bootstrap: load current user profile if token exists (persist profile across refresh)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    (async () => {
      try {
        const res = await authAPI.getProfile();
        if (res?.data?.data) dispatch(updateUser(res.data.data));
      } catch (_) {
        // ignore; interceptor will handle 401 and redirect
      }
    })();
  }, [dispatch]);

  // Show loading spinner during initial authentication check
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Global Loading Overlay */}
      {loading.global && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <LoadingSpinner size="large" />
        </div>
      )}

      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />
          <Route path="/ai" element={<ProtectedRoute><AIAssistantPage /></ProtectedRoute>} />
          <Route path="/oauth2/callback" element={<OAuthCallbackPage />} />

          {/* Public Only Routes (redirect if authenticated) */}
          <Route path="/login" element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          } />
          <Route path="/register" element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          } />

          {/* Protected Routes (require authentication) */}
          <Route path="/my-learning" element={
            <ProtectedRoute>
              <MyLearningPage />
            </ProtectedRoute>
          } />
          <Route path="/learn/:courseId" element={
            <ProtectedRoute>
              <LearningPage />
            </ProtectedRoute>
          } />
          <Route path="/learn/:courseId/lesson/:lessonId" element={
            <ProtectedRoute>
              <LearningPage />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />

          {/* Catch all route */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
