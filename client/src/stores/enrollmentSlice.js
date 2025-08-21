import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  enrollments: [],
  myLearning: [],
  favorites: [],
  progress: {},
  currentEnrollment: null,
  loading: false,
  error: null,
};

const enrollmentSlice = createSlice({
  name: 'enrollments',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    setEnrollments: (state, action) => {
      state.enrollments = action.payload;
      state.loading = false;
    },
    setMyLearning: (state, action) => {
      state.myLearning = action.payload;
    },
    setFavorites: (state, action) => {
      state.favorites = action.payload;
    },
    setProgress: (state, action) => {
      state.progress = { ...state.progress, ...action.payload };
    },
    addEnrollment: (state, action) => {
      state.enrollments.push(action.payload);
      state.myLearning.push(action.payload);
    },
    removeEnrollment: (state, action) => {
      state.enrollments = state.enrollments.filter(e => e.id !== action.payload);
      state.myLearning = state.myLearning.filter(e => e.id !== action.payload);
    },
    updateEnrollmentProgress: (state, action) => {
      const { enrollmentId, progress } = action.payload;
      const enrollment = state.enrollments.find(e => e.id === enrollmentId);
      if (enrollment) {
        enrollment.progress = progress;
      }
      const myLearning = state.myLearning.find(e => e.id === enrollmentId);
      if (myLearning) {
        myLearning.progress = progress;
      }
    },
    toggleFavorite: (state, action) => {
      const courseId = action.payload;
      const existingIndex = state.favorites.findIndex(f => f.courseId === courseId);
      
      if (existingIndex !== -1) {
        state.favorites.splice(existingIndex, 1);
      } else {
        state.favorites.push({ courseId, addedAt: new Date().toISOString() });
      }
    },
    setCurrentEnrollment: (state, action) => {
      state.currentEnrollment = action.payload;
    },
  },
});

export const {
  setLoading,
  setError,
  clearError,
  setEnrollments,
  setMyLearning,
  setFavorites,
  setProgress,
  addEnrollment,
  removeEnrollment,
  updateEnrollmentProgress,
  toggleFavorite,
  setCurrentEnrollment,
} = enrollmentSlice.actions;

export default enrollmentSlice.reducer;
