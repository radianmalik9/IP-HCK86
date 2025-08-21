import { configureStore } from '@reduxjs/toolkit';
import authSlice from './authSlice';
import courseSlice from './courseSlice';
import enrollmentSlice from './enrollmentSlice';
import uiSlice from './uiSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    courses: courseSlice,
    enrollments: enrollmentSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});
