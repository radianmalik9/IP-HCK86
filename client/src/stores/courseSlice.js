import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  courses: [],
  featuredCourses: [],
  currentCourse: null,
  lessons: [],
  currentLesson: null,
  loading: false,
  error: null,
  filters: {
    category: '',
    level: '',
    search: '',
    sortBy: 'newest',
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12,
  },
};

const courseSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    // Courses
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
    setCourses: (state, action) => {
      state.courses = action.payload;
      state.loading = false;
      state.error = null;
    },
    setFeaturedCourses: (state, action) => {
      state.featuredCourses = action.payload;
    },
    setCurrentCourse: (state, action) => {
      state.currentCourse = action.payload;
    },
    addCourse: (state, action) => {
      state.courses.unshift(action.payload);
    },
    updateCourse: (state, action) => {
      const index = state.courses.findIndex(course => course.id === action.payload.id);
      if (index !== -1) {
        state.courses[index] = action.payload;
      }
      if (state.currentCourse?.id === action.payload.id) {
        state.currentCourse = action.payload;
      }
    },
    deleteCourse: (state, action) => {
      state.courses = state.courses.filter(course => course.id !== action.payload);
      if (state.currentCourse?.id === action.payload) {
        state.currentCourse = null;
      }
    },
    
    // Lessons
    setLessons: (state, action) => {
      state.lessons = action.payload;
    },
    setCurrentLesson: (state, action) => {
      state.currentLesson = action.payload;
    },
    addLesson: (state, action) => {
      state.lessons.push(action.payload);
    },
    updateLesson: (state, action) => {
      const index = state.lessons.findIndex(lesson => lesson.id === action.payload.id);
      if (index !== -1) {
        state.lessons[index] = action.payload;
      }
      if (state.currentLesson?.id === action.payload.id) {
        state.currentLesson = action.payload;
      }
    },
    deleteLesson: (state, action) => {
      state.lessons = state.lessons.filter(lesson => lesson.id !== action.payload);
      if (state.currentLesson?.id === action.payload) {
        state.currentLesson = null;
      }
    },
    
    // Filters and Pagination
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        category: '',
        level: '',
        search: '',
        sortBy: 'newest',
      };
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
  },
});

export const {
  setLoading,
  setError,
  clearError,
  setCourses,
  setFeaturedCourses,
  setCurrentCourse,
  addCourse,
  updateCourse,
  deleteCourse,
  setLessons,
  setCurrentLesson,
  addLesson,
  updateLesson,
  deleteLesson,
  setFilters,
  resetFilters,
  setPagination,
} = courseSlice.actions;

export default courseSlice.reducer;
