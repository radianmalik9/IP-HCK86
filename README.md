# Smart Learning Platform API Documentation

## Overview
Smart Learning Platform is a full-stack web application that allows users to discover, create, and manage online courses with AI-powered learning assistance. The application consists of a React frontend and Node.js/Express backend with PostgreSQL database.

## Project Structure
- **Frontend**: React + Vite, Redux Toolkit, Tailwind CSS
- **Backend**: Node.js, Express, Sequelize ORM
- **Database**: PostgreSQL
- **Authentication**: JWT + Firebase Auth + Google OAuth
- **AI Integration**: Google Gemini API
- **File Storage**: Firebase Storage
- **Email Service**: Nodemailer

## Base URL
```
http://localhost:3000
```

## Authentication
The API uses JWT (JSON Web Tokens) for authentication. Protected routes require an `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

---

## API Endpoints

### 🏠 Base Route

#### GET `/`
Get server status
- **Access**: Public
- **Response**: 
```
"Smart Learning Platform Server OK"
```

---

### 🔐 Authentication Endpoints

## **POST /auth/login**

**Deskripsi:**  
Login user dengan email dan password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
- **200 OK**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "role": "student"
    }
  }
  ```

**Error:**
- **400 Bad Request**  
  Jika email kosong:
  ```json
  { "message": "Email is required" }
  ```
  Atau jika password kosong:
  ```json
  { "message": "Password is required" }
  ```
- **401 Unauthorized**  
  Jika email atau password salah:
  ```json
  { "message": "Invalid Email or Password" }
  ```
- **500 Internal Server Error**  
  ```json
  { "message": "Internal Server Error" }
  ```

## **POST /auth/register**

**Deskripsi:**  
Register user baru.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "student"
}
```

**Response:**
- **201 Created**
  ```json
  {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "student"
  }
  ```

**Error:**
- **400 Bad Request**  
  Jika email kosong:
  ```json
  { "message": "Email is required" }
  ```
  Atau jika password kosong:
  ```json
  { "message": "Password is required" }
  ```
  Atau jika email sudah terdaftar:
  ```json
  { "message": "Email must be unique" }
  ```
- **500 Internal Server Error**  
  ```json
  { "message": "Internal Server Error" }
  ```

## **POST /auth/google-signin**

**Deskripsi:**  
Login/Register dengan Google OAuth menggunakan Firebase.

**Request Body:**
```json
{
  "idToken": "firebase_id_token_here"
}
```

**Response:**
- **200 OK** atau **201 Created**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "user@gmail.com",
      "name": "John Doe",
      "role": "student"
    }
  }
  ```

**Error:**
- **400 Bad Request**  
  Jika token tidak dikirim:
  ```json
  { "message": "ID Token is required" }
  ```
- **401 Unauthorized**  
  Jika token Firebase tidak valid:
  ```json
  { "message": "Invalid Token" }
  ```
- **500 Internal Server Error**  
  ```json
  { "message": "Internal Server Error" }
  ```

---

### 👤 User Management Endpoints

## **GET /users** 🔒

**Deskripsi:**  
Ambil daftar semua users (Protected - hanya untuk admin).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name or email

**Response:**
- **200 OK**
  ```json
  {
    "users": [
      {
        "id": 1,
        "email": "user@example.com",
        "name": "John Doe",
        "role": "student",
        "profilePicture": "https://example.com/avatar.jpg",
        "createdAt": "2025-01-24T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalUsers": 50,
      "limit": 10
    }
  }
  ```

## **GET /users/profile** 🔒

**Deskripsi:**  
Ambil profile user yang sedang login (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
- **200 OK**
  ```json
  {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "student",
    "profilePicture": "https://example.com/avatar.jpg",
    "birthDate": "1990-01-01",
    "createdAt": "2025-01-24T10:00:00.000Z"
  }
  ```

## **PATCH /users/profile** 🔒

**Deskripsi:**  
Update profile user (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "name": "John Updated",
  "birthDate": "1990-01-01"
}
```

**Response:**
- **200 OK**
  ```json
  {
    "message": "Profile updated successfully"
  }
  ```

---

### 📚 Course Endpoints

## **GET /courses**

**Deskripsi:**  
Ambil semua courses dengan optional filtering dan pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by title atau description
- `category` (optional): Filter by category
- `published` (optional): true/false filter

**Contoh:** `/courses?search=javascript&category=programming&page=1&limit=5`

**Response:**
- **200 OK**
  ```json
  {
    "courses": [
      {
        "id": 1,
        "title": "JavaScript Fundamentals",
        "description": "Learn JavaScript from basics to advanced",
        "category": "Programming",
        "thumbnailUrl": "https://example.com/thumbnail.jpg",
        "duration": 360,
        "instructorName": "Jane Smith",
        "lessonsCount": 5,
        "isPublished": true,
        "createdAt": "2025-01-24T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalCourses": 25,
      "limit": 10
    }
  }
  ```

## **GET /courses/:id**

**Deskripsi:**  
Ambil course detail berdasarkan ID.

**Parameters:**
- `id`: Course ID

**Response:**
- **200 OK**
  ```json
  {
    "id": 1,
    "title": "JavaScript Fundamentals",
    "description": "Learn JavaScript from basics to advanced",
    "category": "Programming",
    "thumbnailUrl": "https://example.com/thumbnail.jpg",
    "duration": 360,
    "instructorName": "Jane Smith",
    "instructorId": 2,
    "isPublished": true,
    "lessons": [
      {
        "id": 1,
        "title": "Introduction to JavaScript",
        "duration": 60,
        "videoUrl": "https://youtube.com/watch?v=abc123"
      }
    ],
    "createdAt": "2025-01-24T10:00:00.000Z"
  }
  ```

**Error:**
- **404 Not Found**  
  Jika course tidak ditemukan:
  ```json
  { "message": "Course not found" }
  ```

## **POST /courses** 🔒

**Deskripsi:**  
Buat course baru (Protected - hanya untuk instructor).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "title": "Advanced React Course",
  "description": "Master React with hooks and context",
  "category": "Programming",
  "duration": 480
}
```

**Response:**
- **201 Created**
  ```json
  {
    "id": 2,
    "title": "Advanced React Course",
    "description": "Master React with hooks and context",
    "category": "Programming",
    "duration": 480,
    "instructorId": 2,
    "isPublished": false,
    "createdAt": "2025-01-24T10:00:00.000Z"
  }
  ```

**Error:**
- **400 Bad Request**  
  Jika required fields kosong:
  ```json
  { "message": "Title, description, and category are required" }
  ```
- **403 Forbidden**  
  Jika user bukan instructor:
  ```json
  { "message": "Only instructors can create courses" }
  ```

## **PATCH /courses/:id** 🔒

**Deskripsi:**  
Update course (Protected - hanya untuk course instructor).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Parameters:**
- `id`: Course ID

**Request Body (partial update):**
```json
{
  "title": "Updated Course Title",
  "isPublished": true
}
```

**Response:**
- **200 OK**
  ```json
  {
    "message": "Course updated successfully"
  }
  ```

## **DELETE /courses/:id** 🔒

**Deskripsi:**  
Hapus course (Protected - hanya untuk course instructor).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Parameters:**
- `id`: Course ID

**Response:**
- **200 OK**
  ```json
  {
    "message": "Course deleted successfully"
  }
  ```

## **POST /courses/:id/upload-thumbnail** 🔒

**Deskripsi:**  
Upload thumbnail untuk course (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Parameters:**
- `id`: Course ID

**Request Body:**
```
Form data with 'thumbnail' file field
```

**Response:**
- **200 OK**
  ```json
  {
    "message": "Thumbnail uploaded successfully",
    "thumbnailUrl": "https://firebase-storage-url.com/thumbnail.jpg"
  }
  ```

---

### 🤖 AI Assistant Endpoints

## **POST /ai/recommend-courses** 🔒

**Deskripsi:**  
Dapatkan rekomendasi course dari AI berdasarkan preferences user (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "interests": ["javascript", "web development", "react"],
  "level": "beginner",
  "duration": "short"
}
```

**Response:**
- **200 OK**
  ```json
  {
    "recommendations": [
      {
        "courseId": 1,
        "title": "JavaScript Fundamentals",
        "reason": "Perfect for beginners interested in web development",
        "score": 0.95
      }
    ]
  }
  ```

## **POST /ai/study-plan** 🔒

**Deskripsi:**  
Generate study plan berdasarkan course yang diambil user (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "timeAvailable": "2 hours per day",
  "goals": "Learn web development in 3 months",
  "currentLevel": "beginner"
}
```

**Response:**
- **200 OK**
  ```json
  {
    "studyPlan": {
      "duration": "12 weeks",
      "dailyCommitment": "2 hours",
      "schedule": [
        {
          "week": 1,
          "topics": ["HTML Basics", "CSS Fundamentals"],
          "courses": [1, 2]
        }
      ]
    }
  }
  ```

## **POST /ai/ask** 🔒

**Deskripsi:**  
Tanya jawab dengan AI assistant (Protected - dengan cooldown mechanism).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "question": "Apa itu JavaScript closure?"
}
```

**Response:**
- **200 OK**
  ```json
  {
    "answer": "JavaScript closure adalah fungsi yang memiliki akses ke variabel dari scope parent-nya bahkan setelah parent function telah selesai eksekusi. Closure sangat berguna untuk encapsulation dan creating private variables."
  }
  ```

**Error:**
- **429 Too Many Requests**  
  Jika masih dalam cooldown:
  ```json
  { "message": "Please wait before asking another question" }
  ```

## **POST /ai/explain-concept** 🔒

**Deskripsi:**  
Minta penjelasan konsep dari AI (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "concept": "React Hooks",
  "level": "beginner"
}
```

**Response:**
- **200 OK**
  ```json
  {
    "explanation": "React Hooks adalah fitur yang memungkinkan Anda menggunakan state dan lifecycle methods dalam functional components. Hook yang paling umum adalah useState untuk state management dan useEffect untuk side effects."
  }
  ```

## **POST /ai/generate-quiz** 🔒

**Deskripsi:**  
Generate quiz berdasarkan course content (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "courseId": 1,
  "difficulty": "medium",
  "questionCount": 5
}
```

**Response:**
- **200 OK**
  ```json
  {
    "quiz": {
      "title": "JavaScript Fundamentals Quiz",
      "questions": [
        {
          "question": "What is a closure in JavaScript?",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": 0
        }
      ]
    }
  }
  ```

---

### 📖 Enrollment & Learning Endpoints

## **GET /enrollments/my-learning** 🔒

**Deskripsi:**  
Ambil daftar course yang diikuti user (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
- **200 OK**
  ```json
  [
    {
      "id": 1,
      "courseId": 1,
      "progress": 40,
      "enrolledAt": "2025-01-24T10:00:00.000Z",
      "course": {
        "id": 1,
        "title": "JavaScript Fundamentals",
        "thumbnailUrl": "https://example.com/thumbnail.jpg",
        "duration": 360,
        "lessonsCount": 5
      }
    }
  ]
  ```

## **POST /enrollments/:courseId/enroll** 🔒

**Deskripsi:**  
Daftar ke course (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Parameters:**
- `courseId`: Course ID

**Response:**
- **201 Created**
  ```json
  {
    "message": "Successfully enrolled in course",
    "enrollment": {
      "id": 1,
      "courseId": 1,
      "userId": 1,
      "progress": 0,
      "enrolledAt": "2025-01-24T10:00:00.000Z"
    }
  }
  ```

**Error:**
- **400 Bad Request**  
  Jika sudah terdaftar:
  ```json
  { "message": "Already enrolled in this course" }
  ```

## **DELETE /enrollments/:courseId/unenroll** 🔒

**Deskripsi:**  
Keluar dari course (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Parameters:**
- `courseId`: Course ID

**Response:**
- **200 OK**
  ```json
  {
    "message": "Successfully unenrolled from course"
  }
  ```

## **POST /enrollments/:courseId/mark-lesson-complete** 🔒

**Deskripsi:**  
Tandai lesson sebagai selesai (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Parameters:**
- `courseId`: Course ID

**Request Body:**
```json
{
  "lessonId": 1
}
```

**Response:**
- **200 OK**
  ```json
  {
    "message": "Lesson marked as completed",
    "progress": 40
  }
  ```

## **GET /enrollments/:courseId/completed-lessons** 🔒

**Deskripsi:**  
Ambil daftar lesson yang sudah diselesaikan (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Parameters:**
- `courseId`: Course ID

**Response:**
- **200 OK**
  ```json
  {
    "completedLessons": [1, 3, 5]
  }
  ```

---

### ❤️ Favorites Endpoints

## **GET /favorites** 🔒

**Deskripsi:**  
Ambil daftar favorite courses user (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
- **200 OK**
  ```json
  [
    {
      "id": 1,
      "courseId": 1,
      "userId": 1,
      "course": {
        "id": 1,
        "title": "JavaScript Fundamentals",
        "thumbnailUrl": "https://example.com/thumbnail.jpg",
        "instructorName": "Jane Smith"
      },
      "createdAt": "2025-01-24T10:00:00.000Z"
    }
  ]
  ```

## **POST /favorites** 🔒

**Deskripsi:**  
Tambah course ke favorites (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "courseId": 1
}
```

**Response:**
- **201 Created**
  ```json
  {
    "message": "Course added to favorites",
    "favorite": {
      "id": 1,
      "courseId": 1,
      "userId": 1,
      "createdAt": "2025-01-24T10:00:00.000Z"
    }
  }
  ```

## **DELETE /favorites/:courseId** 🔒

**Deskripsi:**  
Hapus course dari favorites (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Parameters:**
- `courseId`: Course ID

**Response:**
- **200 OK**
  ```json
  {
    "message": "Course removed from favorites"
  }
  ```

---

### 🌐 External API Integration

## **GET /external/youtube-search**

**Deskripsi:**  
Search video dari YouTube untuk course content.

**Query Parameters:**
- `q` (required): Search query
- `maxResults` (optional): Maximum results (default: 10)

**Contoh:** `/external/youtube-search?q=javascript tutorial&maxResults=5`

**Response:**
- **200 OK**
  ```json
  {
    "videos": [
      {
        "videoId": "abc123",
        "title": "JavaScript Tutorial for Beginners",
        "thumbnail": "https://img.youtube.com/vi/abc123/maxresdefault.jpg",
        "channelTitle": "Programming Channel",
        "publishedAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
  ```

## **GET /external/courses**

**Deskripsi:**  
Ambil course dari external providers (Udemy, Coursera, edX).

**Query Parameters:**
- `provider` (required): udemy | coursera | edx
- `search` (optional): Search term
- `category` (optional): Course category

**Response:**
- **200 OK**
  ```json
  {
    "courses": [
      {
        "id": "ext_123",
        "title": "Complete JavaScript Course",
        "provider": "udemy",
        "price": "$49.99",
        "rating": 4.5,
        "url": "https://udemy.com/course/complete-javascript"
      }
    ]
  }
  ```

---

### 📧 Email Endpoints

## **POST /send-email**

**Deskripsi:**  
Kirim email menggunakan nodemailer.

**Request Body:**
```json
{
  "to": "recipient@example.com",
  "subject": "Welcome to Smart Learning Platform",
  "message": "Thank you for joining our platform!"
}
```

**Response:**
- **200 OK**
  ```json
  {
    "message": "Email sent successfully"
  }
  ```

**Error:**
- **400 Bad Request**  
  Jika field required tidak lengkap:
  ```json
  { "message": "To, subject, and message are required" }
  ```
- **500 Internal Server Error**  
  Jika gagal mengirim email:
  ```json
  { "message": "Failed to send email" }
  ```

---

## Frontend Features

### 🏠 Main Features
1. **Home Page**: Browse dan search courses dengan hero section
2. **Course Details**: View detailed course information dengan lesson list
3. **AI Assistant**: Personalized recommendations dan Q&A chatbot
4. **User Authentication**: Login/Register dengan email atau Google OAuth
5. **My Learning**: Dashboard untuk tracking progress course
6. **Favorites Management**: Save dan manage favorite courses
7. **Course Creation**: Create dan edit courses (untuk instructor)
8. **Learning Page**: Video player dengan lesson tracking

### 🔧 Frontend Components
- **Navbar**: Navigation dengan authentication status dan profile dropdown
- **CourseCard**: Course display component dengan rating dan progress
- **HeroCourse**: Featured course display di homepage
- **VideoPlayer**: Custom video player untuk course lessons
- **ProtectedRoute**: Route protection untuk authenticated users
- **AIChat**: Chat interface untuk AI assistant
- **ProgressBar**: Visual progress tracking component
- **FileUpload**: Drag & drop file upload component

### 📱 Pages
- **HomePage**: Main landing page dengan course browsing dan search
- **LoginPage**: User authentication dengan Firebase Google OAuth
- **RegisterPage**: User registration dengan email validation
- **CourseDetailPage**: Detailed course view dengan enrollment action
- **MyLearningPage**: User dashboard dengan enrolled courses
- **LearningPage**: Course learning interface dengan video player
- **AIAssistantPage**: AI-powered learning assistance dan chat
- **ProfilePage**: User profile management
- **CoursesPage**: Browse all courses dengan filtering
- **CreateCoursePage**: Course creation form (instructor only)

### 🔄 State Management (Redux)
- **authSlice**: User authentication state dan profile management
- **courseSlice**: Course data management dan caching
- **enrollmentSlice**: Learning progress dan enrollment management
- **favoritesSlice**: Favorites course management
- **aiSlice**: AI chat history dan recommendations

---

## Database Schema

### Users Table
```sql
{
  id: PRIMARY KEY,
  email: STRING UNIQUE NOT NULL,
  password: STRING,
  name: STRING,
  role: ENUM('student', 'instructor', 'admin'),
  profilePicture: STRING,
  birthDate: DATE,
  firebaseUid: STRING UNIQUE,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP
}
```

### Courses Table
```sql
{
  id: PRIMARY KEY,
  title: STRING NOT NULL,
  description: TEXT,
  category: STRING NOT NULL,
  thumbnailUrl: STRING,
  duration: INTEGER, // in minutes
  instructorId: FOREIGN KEY (Users.id),
  isPublished: BOOLEAN DEFAULT false,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP
}
```

### Lessons Table
```sql
{
  id: PRIMARY KEY,
  title: STRING NOT NULL,
  courseId: FOREIGN KEY (Courses.id),
  duration: INTEGER, // in minutes
  videoUrl: STRING,
  content: TEXT,
  orderIndex: INTEGER,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP
}
```

### Enrollments Table
```sql
{
  id: PRIMARY KEY,
  userId: FOREIGN KEY (Users.id),
  courseId: FOREIGN KEY (Courses.id),
  progress: INTEGER DEFAULT 0, // percentage 0-100
  enrolledAt: TIMESTAMP,
  completedAt: TIMESTAMP,
  UNIQUE(userId, courseId)
}
```

### Progress Table
```sql
{
  id: PRIMARY KEY,
  userId: FOREIGN KEY (Users.id),
  lessonId: FOREIGN KEY (Lessons.id),
  completed: BOOLEAN DEFAULT false,
  completedAt: TIMESTAMP,
  UNIQUE(userId, lessonId)
}
```

### Favorites Table
```sql
{
  id: PRIMARY KEY,
  userId: FOREIGN KEY (Users.id),
  courseId: FOREIGN KEY (Courses.id),
  createdAt: TIMESTAMP,
  UNIQUE(userId, courseId)
}
```

### AIInteractions Table
```sql
{
  id: PRIMARY KEY,
  userId: FOREIGN KEY (Users.id),
  question: TEXT NOT NULL,
  answer: TEXT NOT NULL,
  type: ENUM('ask', 'recommend', 'explain'),
  createdAt: TIMESTAMP
}
```

---

## Environment Variables

### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/smart_learning

# Authentication
JWT_SECRET=your_super_secret_jwt_key
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY=your_service_account_private_key

# AI Integration
GOOGLE_AI_API_KEY=your_gemini_api_key

# External APIs
YOUTUBE_API_KEY=your_youtube_api_key
UDEMY_CLIENT_ID=your_udemy_client_id
UDEMY_CLIENT_SECRET=your_udemy_client_secret

# Email Service
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Server Configuration
PORT=3000
NODE_ENV=development
```

### Frontend (.env)
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# API Configuration
VITE_API_BASE_URL=http://localhost:3000
```

---

## Error Handling

All API endpoints follow consistent error response format:
```json
{
  "message": "Error description"
}
```

Common HTTP status codes:
- **200**: Success
- **201**: Created
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (authentication required)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **409**: Conflict (duplicate resource)
- **429**: Too Many Requests (rate limiting)
- **500**: Internal Server Error

---

## Testing

The backend includes comprehensive test coverage using Jest:
- Unit tests for controllers
- Integration tests for routes
- Middleware testing
- Error handling testing
- Model testing
- AI service testing

**Current Test Coverage:**
- **Statement Coverage**: 91.77%
- **Branch Coverage**: 78.55% 
- **Function Coverage**: 96.82%
- **Line Coverage**: 93.68%
- **Test Suites**: 37 passed, 37 total
- **Tests**: 130 passed, 130 total

Run tests with:
```bash
cd smart-learning-server
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

---

## Development Setup

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn

### Backend Setup
```bash
cd smart-learning-server
npm install
cp .env.example .env
# Configure your environment variables
npm run db:create
npm run db:migrate
npm run db:seed
npm run dev
```

### Frontend Setup
```bash
cd smart-learning-client
npm install
cp .env.example .env
# Configure your environment variables
npm run dev
```

### Database Setup
```bash
# Create database
createdb smart_learning

# Run migrations
npx sequelize-cli db:migrate

# Run seeders (optional)
npx sequelize-cli db:seed:all
```

---

## Production Deployment

### Backend
```bash
npm run build
npm start
```

### Frontend
```bash
npm run build
# Serve the dist/ folder with your preferred web server
```

### Docker Support
```bash
# Build and run with Docker Compose
docker-compose up --build

# Production deployment
docker-compose -f docker-compose.prod.yml up -d
```

---

## Additional Notes

1. **AI Integration**: Platform menggunakan Google Gemini AI untuk personalized learning recommendations dan intelligent Q&A responses
2. **File Storage**: Course thumbnails dan user profile pictures menggunakan Firebase Storage dengan automatic optimization
3. **Authentication**: Dual authentication system dengan traditional JWT dan Firebase Auth untuk Google OAuth
4. **Real-time Features**: Progress tracking dan completion status update secara real-time
5. **External API**: Integration dengan YouTube untuk video content dan course providers untuk additional learning resources
6. **Security**: Implementation of rate limiting, input validation, dan secure file upload dengan virus scanning
7. **Performance**: Database indexing, query optimization, dan Redis caching untuk improved performance
8. **Responsive Design**: Mobile-first approach dengan Tailwind CSS untuk optimal user experience across devices
9. **Accessibility**: WCAG 2.1 compliance dengan proper ARIA labels dan keyboard navigation support
10. **Analytics**: Built-in learning analytics untuk tracking user progress dan course effectiveness