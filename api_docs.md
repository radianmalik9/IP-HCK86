# Smart Learning Platform API Documentation

## Overview
Smart Learning Platform is a full-stack web application that allows users to discover, create, and manage online courses with AI-powered learning assistance. The application consists of a React frontend and Node.js/Express backend with PostgreSQL database.

## Project Structure
- **Frontend**: React + Vite, Redux Toolkit, Tailwind CSS  
- **Backend**: Node.js, Express, Sequelize ORM
- **Database**: PostgreSQL (Development) / Supabase (Production)
- **Authentication**: JWT + Firebase Auth + Google OAuth
- **AI Integration**: Google Gemini API
- **File Storage**: Firebase Storage
- **Email Service**: Nodemailer

## Base URL
```
Development: http://localhost:3000
Production: https://your-production-url.com
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

## **POST /auth/register**

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
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "student"
    }
  }
  ```

**Error:**
- **400 Bad Request**  
  Jika email atau password kosong:
  ```json
  { "message": "Email and password are required" }
  ```
- **401 Unauthorized**  
  Jika email atau password salah:
  ```json
  { "message": "Invalid Email or Password" }
  ```

## **POST /auth/google**

## **POST /auth/register**

**Deskripsi:**  
Register user baru.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "role": "student"
}
```

**Response:**
- **201 Created**
  ```json
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "student",
    "createdAt": "2025-01-24T10:00:00.000Z"
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

## **POST /auth/login**

## **POST /auth/google**

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
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@gmail.com",
      "fullName": "John Doe",
      "role": "student"
    }
  }
  ```

**Error:**
- **400 Bad Request**  
  Jika token tidak dikirim atau Firebase Admin tidak terkonfigurasi:
  ```json
  { "message": "ID Token is required" }
  ```
- **401 Unauthorized**  
  Jika token Firebase tidak valid:
  ```json
  { "message": "Invalid Token" }
  ```

## **POST /auth/google/oauth**

**Deskripsi:**  
Login dengan Google OAuth menggunakan authorization code.

**Request Body:**
```json
{
  "code": "google_authorization_code"
}
```

**Response:**
- **200 OK** atau **201 Created**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@gmail.com",
      "fullName": "John Doe",
      "role": "student"
    }
  }
  ```

## **POST /auth/forgot-password**

**Deskripsi:**  
Kirim email reset password.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
- **200 OK**
  ```json
  {
    "message": "Password reset email sent if user exists"
  }
  ```

## **POST /auth/reset-password**

**Deskripsi:**  
Reset password dengan token.

**Request Body:**
```json
{
  "token": "reset_token",
  "password": "new_password123"
}
```

**Response:**
- **200 OK**
  ```json
  {
    "message": "Password reset successful"
  }
  ```

## **POST /auth/verify-email**

**Deskripsi:**  
Verifikasi email dengan token.

**Request Body:**
```json
{
  "token": "verification_token"
}
```

**Response:**
- **200 OK**
  ```json
  {
    "message": "Email verified successfully"
  }
  ```

## **POST /auth/verify-email/request** 🔒

**Deskripsi:**  
Request verification email baru (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
- **200 OK**
  ```json
  {
    "message": "Verification email sent"
  }
  ```

---

### 👤 User Management Endpoints

## **GET /auth/profile** 🔒

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
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "student",
    "profilePicture": "https://example.com/avatar.jpg",
    "birthDate": "1990-01-01",
    "isEmailVerified": true,
    "createdAt": "2025-01-24T10:00:00.000Z"
  }
  ```

## **PUT /auth/profile** 🔒

**Deskripsi:**  
Update profile user (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "fullName": "John Updated",
  "birthDate": "1990-01-01",
  "profilePicture": "https://example.com/new-avatar.jpg"
}
```

**Response:**
- **200 OK**
  ```json
  {
    "message": "Profile updated successfully"
  }
  ```

## **DELETE /auth/profile** 🔒

**Deskripsi:**  
Delete user account (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
- **200 OK**
  ```json
  {
    "message": "Account deleted successfully"
  }
  ```

## **GET /users** 🔒

**Deskripsi:**  
Ambil daftar users dengan pagination dan search (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by fullName or email

**Response:**
- **200 OK**
  ```json
  {
    "users": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "email": "user@example.com",
        "fullName": "John Doe",
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
        "id": "550e8400-e29b-41d4-a716-446655440000",
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
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "JavaScript Fundamentals",
    "description": "Learn JavaScript from basics to advanced",
    "category": "Programming",
    "thumbnailUrl": "https://example.com/thumbnail.jpg",
    "duration": 360,
    "instructorName": "Jane Smith",
    "instructorId": "instructor-uuid",
    "isPublished": true,
    "lessons": [
      {
        "id": "lesson-uuid",
        "title": "Introduction to JavaScript",
        "duration": 60,
        "videoUrl": "https://youtube.com/watch?v=abc123",
        "content": "Lesson content here...",
        "orderIndex": 1
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

## **GET /my-courses** 🔒

**Deskripsi:**  
Ambil courses yang dibuat oleh instructor yang sedang login (Protected - hanya untuk instructor).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
- **200 OK**
  ```json
  [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Advanced React Course",
      "description": "Master React with hooks and context",
      "category": "Programming",
      "duration": 480,
      "isPublished": false,
      "lessonsCount": 8,
      "enrollmentsCount": 25
    }
  ]
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
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Advanced React Course",
    "description": "Master React with hooks and context",
    "category": "Programming",
    "duration": 480,
    "instructorId": "instructor-uuid",
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
  { "message": "Access denied" }
  ```

## **PUT /courses/:id** 🔒

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

## **PATCH /courses/:id/publish** 🔒

**Deskripsi:**  
Toggle publish status course (Protected - hanya untuk course instructor).

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
    "message": "Course published successfully"
  }
  ```
  atau
  ```json
  {
    "message": "Course unpublished successfully"
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

## **POST /ai/recommendations** 🔒

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
        "courseId": "550e8400-e29b-41d4-a716-446655440000",
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
          "courses": ["course-uuid-1", "course-uuid-2"]
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
  "courseId": "550e8400-e29b-41d4-a716-446655440000",
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

## **GET /enrollments** 🔒

**Deskripsi:**  
Ambil daftar course yang diikuti user (Protected). Alias untuk `/enrollments/my`.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
- **200 OK**
  ```json
  [
    {
      "id": "enrollment-uuid",
      "courseId": "course-uuid",
      "progress": 40,
      "enrolledAt": "2025-01-24T10:00:00.000Z",
      "isFavorite": false,
      "course": {
        "id": "course-uuid",
        "title": "JavaScript Fundamentals",
        "thumbnailUrl": "https://example.com/thumbnail.jpg",
        "duration": 360,
        "lessonsCount": 5
      }
    }
  ]
  ```

## **GET /enrollments/my** 🔒

**Deskripsi:**  
Ambil daftar course yang diikuti user (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
- **200 OK**
  Same as `/enrollments`

## **POST /enrollments** 🔒

**Deskripsi:**  
Daftar ke course dengan courseId di request body (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "courseId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**
- **201 Created**
  ```json
  {
    "message": "Successfully enrolled in course",
    "enrollment": {
      "id": "enrollment-uuid",
      "courseId": "course-uuid",
      "userId": "user-uuid",
      "progress": 0,
      "enrolledAt": "2025-01-24T10:00:00.000Z"
    }
  }
  ```

## **POST /enroll/:courseId** 🔒

**Deskripsi:**  
Daftar ke course dengan courseId di URL parameter (Protected). Legacy endpoint.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Parameters:**
- `courseId`: Course ID

**Response:**
- **201 Created**
  Same as `/enrollments`

**Error:**
- **400 Bad Request**  
  Jika sudah terdaftar:
  ```json
  { "message": "Already enrolled in this course" }
  ```
- **404 Not Found**  
  Jika course tidak ditemukan atau tidak published:
  ```json
  { "message": "Course not found" }
  ```

## **DELETE /enrollments/:courseId** 🔒

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

## **GET /enrollments/:courseId/progress** 🔒

**Deskripsi:**  
Ambil progress enrollment untuk course tertentu (Protected).

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
    "enrollment": {
      "id": "enrollment-uuid",
      "progress": 60,
      "enrolledAt": "2025-01-24T10:00:00.000Z"
    }
  }
  ```

## **PUT /enrollments/:courseId/progress** 🔒

**Deskripsi:**  
Update progress enrollment (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Parameters:**
- `courseId`: Course ID

**Request Body:**
```json
{
  "progress": 75
}
```

**Response:**
- **200 OK**
  ```json
  {
    "message": "Progress updated successfully"
  }
  ```

## **POST /enrollments/:courseId/lessons/:lessonId/complete** 🔒

**Deskripsi:**  
Tandai lesson sebagai selesai dan hitung ulang progress (Protected).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Parameters:**
- `courseId`: Course ID
- `lessonId`: Lesson ID

**Response:**
- **200 OK**
  ```json
  {
    "success": true,
    "message": "Lesson marked complete",
    "data": {
      "enrollment": {
        "id": "enrollment-uuid",
        "progress": 40
      },
      "completedCount": 2,
      "totalLessons": 5,
      "percent": 40
    }
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
    "success": true,
    "data": ["lesson-uuid-1", "lesson-uuid-3", "lesson-uuid-5"]
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
      "id": "enrollment-uuid",
      "courseId": "course-uuid",
      "userId": "user-uuid",
      "isFavorite": true,
      "course": {
        "id": "course-uuid",
        "title": "JavaScript Fundamentals",
        "thumbnailUrl": "https://example.com/thumbnail.jpg",
        "instructorName": "Jane Smith"
      },
      "enrolledAt": "2025-01-24T10:00:00.000Z"
    }
  ]
  ```

## **POST /favorites** 🔒

**Deskripsi:**  
Tambah course ke favorites (Protected). User harus sudah enrolled.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "courseId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**
- **200 OK**
  ```json
  {
    "message": "Course added to favorites"
  }
  ```

**Error:**
- **404 Not Found**  
  Jika user belum enrolled:
  ```json
  { "message": "Enrollment not found" }
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

## **PATCH /enrollments/:courseId/favorite** 🔒

**Deskripsi:**  
Toggle favorite status course (Protected).

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
    "message": "Course added to favorites"
  }
  ```
  atau
  ```json
  {
    "message": "Course removed from favorites"
  }
  ```

---

## Database Schema

### Users Table
```sql
{
  id: UUID PRIMARY KEY,
  email: STRING UNIQUE NOT NULL,
  password: STRING NOT NULL,
  fullName: STRING NOT NULL,
  role: ENUM('student', 'instructor', 'admin') DEFAULT 'student',
  profilePicture: STRING,
  birthDate: DATE,
  firebaseUid: STRING UNIQUE,
  isEmailVerified: BOOLEAN DEFAULT false,
  emailVerificationToken: STRING,
  passwordResetToken: STRING,
  passwordResetExpires: DATE,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP
}
```

### Courses Table
```sql
{
  id: UUID PRIMARY KEY,
  title: STRING NOT NULL,
  description: TEXT,
  category: STRING NOT NULL,
  thumbnailUrl: STRING,
  duration: INTEGER, // in minutes
  instructorId: UUID FOREIGN KEY (Users.id),
  isPublished: BOOLEAN DEFAULT false,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP
}
```

### Lessons Table
```sql
{
  id: UUID PRIMARY KEY,
  title: STRING NOT NULL,
  courseId: UUID FOREIGN KEY (Courses.id),
  duration: INTEGER, // in minutes
  videoUrl: STRING,
  content: TEXT,
  resources: TEXT, // JSON string for additional resources
  orderIndex: INTEGER,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP
}
```

### Enrollments Table
```sql
{
  id: UUID PRIMARY KEY,
  userId: UUID FOREIGN KEY (Users.id),
  courseId: UUID FOREIGN KEY (Courses.id),
  progress: INTEGER DEFAULT 0, // percentage 0-100
  isFavorite: BOOLEAN DEFAULT false,
  enrolledAt: TIMESTAMP,
  completedAt: TIMESTAMP,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP,
  UNIQUE(userId, courseId)
}
```

### Progress Table
```sql
{
  id: UUID PRIMARY KEY,
  userId: UUID FOREIGN KEY (Users.id),
  lessonId: UUID FOREIGN KEY (Lessons.id),
  courseId: UUID FOREIGN KEY (Courses.id),
  isCompleted: BOOLEAN DEFAULT false,
  completedAt: TIMESTAMP,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP,
  UNIQUE(userId, lessonId, courseId)
}
```

### Discussions Table
```sql
{
  id: UUID PRIMARY KEY,
  userId: UUID FOREIGN KEY (Users.id),
  courseId: UUID FOREIGN KEY (Courses.id),
  lessonId: UUID FOREIGN KEY (Lessons.id),
  content: TEXT NOT NULL,
  parentId: UUID FOREIGN KEY (Discussions.id), // for replies
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP
}
```

---

## Environment Variables

### Backend (.env)
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/smart_learning
# or for Supabase
# DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres

# Authentication
JWT_SECRET=your_super_secret_jwt_key

# Firebase Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your_project.appspot.com

# AI Integration
GOOGLE_AI_API_KEY=your_gemini_api_key

# Email Service (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
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
- **Statement Coverage**: 90.66%
- **Branch Coverage**: 78.26% 
- **Function Coverage**: 93.84%
- **Line Coverage**: 92.87%
- **Test Suites**: 37 passed, 37 total
- **Tests**: 130 passed, 130 total

Key test coverage areas:
- ✅ **enrollmentController.js**: 91.89% statements, 100% functions
- ✅ **aiController.js**: 95.89% statements, 100% functions  
- ✅ **middlewares**: 100% coverage across authentication and error handling
- ⚠️ **courseController.js**: 83.09% statements, 77.77% functions
- ⚠️ **userController.js**: 85.71% statements, 89.47% functions

Run tests with:
```bash
cd server
npm test
```

Run tests with coverage:
```bash
cd server
npm test -- --coverage
```

---

## Development Setup

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v13 or higher) atau Supabase account
- npm atau yarn

### Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Configure your environment variables in .env
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
cp .env.example .env
# Configure your environment variables in .env
npm run dev
```

### Database Setup

#### Local PostgreSQL
```bash
# Create database
createdb smart_learning

# Update .env with your database URL
DATABASE_URL=postgresql://username:password@localhost:5432/smart_learning

# Run migrations (akan dibuat otomatis jika tidak ada)
npm run dev  # Server akan membuat tabel otomatis menggunakan Sequelize sync
```

#### Supabase (Production)
```bash
# 1. Create project di Supabase
# 2. Copy connection string dari Settings > Database
# 3. Update .env dengan Supabase URL
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# 4. Server akan membuat tabel otomatis saat pertama kali running
```

### Seeding Data (Optional)
```bash
cd server
npm run seed:min  # Creates sample users, courses, and lessons
```

---

## Production Deployment

### Backend
```bash
# Set NODE_ENV=production in your environment
NODE_ENV=production
DATABASE_URL=your_production_database_url

# Install dependencies and start
npm install --production
npm start
```

### Frontend
```bash
# Build for production
npm run build

# Serve the dist/ folder with your preferred web server (nginx, apache, etc.)
# or deploy to Vercel/Netlify/Firebase Hosting
```

### Environment Setup
1. **Database**: Pastikan PostgreSQL atau Supabase sudah ready
2. **Firebase**: Setup project dengan Storage dan Auth enabled
3. **Google AI**: Aktifkan Gemini API dan dapatkan API key
4. **Email** (optional): Setup Gmail App Password untuk email service

---

## API Testing

### Manual Testing dengan curl

#### Authentication
```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","fullName":"Test User"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

#### Courses (with token)
```bash
# Get all courses
curl -X GET http://localhost:3000/courses

# Get course by ID
curl -X GET http://localhost:3000/courses/[COURSE_ID]

# Create course (instructor only)
curl -X POST http://localhost:3000/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [YOUR_TOKEN]" \
  -d '{"title":"New Course","description":"Course description","category":"Programming"}'
```

#### Enrollment
```bash
# Enroll to course
curl -X POST http://localhost:3000/enrollments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [YOUR_TOKEN]" \
  -d '{"courseId":"[COURSE_ID]"}'

# Mark lesson complete
curl -X POST http://localhost:3000/enrollments/[COURSE_ID]/lessons/[LESSON_ID]/complete \
  -H "Authorization: Bearer [YOUR_TOKEN]"
```

---

## Additional Notes

1. **AI Integration**: Platform menggunakan Google Gemini AI untuk personalized learning recommendations, study plan generation, quiz creation, dan intelligent Q&A responses dengan cooldown mechanism untuk rate limiting

2. **File Storage**: Course thumbnails dan user profile pictures menggunakan Firebase Storage dengan automatic public URL generation dan size limits (5MB)

3. **Authentication**: Dual authentication system dengan traditional JWT dan Firebase Auth untuk Google OAuth, plus email verification dan password reset functionality

4. **Real-time Features**: Progress tracking dan completion status update secara real-time dengan automatic percentage calculation berdasarkan completed lessons

5. **Database Design**: UUID-based primary keys untuk semua tables, comprehensive foreign key relationships, dan optimized indexing untuk query performance

6. **Security**: Implementation of JWT token validation, input sanitization, role-based access control, dan secure password hashing dengan bcrypt

7. **Error Handling**: Centralized error handling middleware dengan consistent HTTP status codes dan detailed error messages untuk debugging

8. **Testing**: Comprehensive test suite dengan Jest covering controllers, middlewares, helpers, dan error scenarios dengan 90%+ code coverage

9. **API Architecture**: RESTful API design dengan clear endpoint naming conventions, proper HTTP methods, dan consistent response formats

10. **Environment Configuration**: Flexible configuration supporting both local PostgreSQL dan Supabase untuk development/production deployment

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```
   Error: connect ECONNREFUSED 127.0.0.1:5432
   ```
   - Pastikan PostgreSQL service running atau check Supabase connection string
   - Verify DATABASE_URL format correct

2. **Firebase Auth Error**
   ```
   Error: Firebase Admin not initialized
   ```
   - Check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY di .env
   - Pastikan Firebase service account key format correct

3. **AI API Error**
   ```
   Error: Google AI API key not found
   ```
   - Set GOOGLE_AI_API_KEY di environment variables
   - Enable Gemini API di Google Cloud Console

4. **JWT Token Error**
   ```
   Error: Invalid token
   ```
   - Check JWT_SECRET di .env file
   - Pastikan token format correct: `Bearer <token>`

5. **Test Failures**
   ```
   Jest coverage threshold not met
   ```
   - Run `npm test` untuk melihat coverage details
   - Focus pada uncovered lines untuk meningkatkan coverage

### Performance Tips

1. **Database Optimization**
   - Use proper indexing pada frequently queried columns
   - Implement pagination untuk large datasets
   - Consider database connection pooling untuk production

2. **API Response Optimization**  
   - Implement response caching untuk static data
   - Use select specific fields untuk reduce payload size
   - Add rate limiting untuk prevent abuse

3. **Frontend Performance**
   - Implement lazy loading untuk components
   - Use React.memo untuk prevent unnecessary re-renders
   - Optimize bundle size dengan code splitting

### Development Workflow

1. **Branch Strategy**: 
   - `main`: Production branch
   - `development`: Development branch (current)
   - Feature branches: `feature/feature-name`

2. **Commit Convention**:
   - `feat`: New feature
   - `fix`: Bug fix
   - `docs`: Documentation update
   - `test`: Test additions/updates
   - `refactor`: Code refactoring

3. **Before Deploying**:
   - Run all tests: `npm test`
   - Check code coverage meets threshold
   - Test API endpoints manually
   - Verify environment variables setup

---

## Project Status: ✅ COMPLETED

**Core Features Implemented:**
- ✅ User authentication (JWT + Firebase)
- ✅ Course management (CRUD + publish/unpublish)  
- ✅ Enrollment system dengan progress tracking
- ✅ AI-powered recommendations dan Q&A
- ✅ Favorites system
- ✅ Comprehensive API documentation
- ✅ Test suite dengan 90%+ coverage
- ✅ Database schema dengan proper relationships
- ✅ Error handling dan validation
- ✅ File upload untuk thumbnails/profile pictures

**Production Ready:**
- Database: PostgreSQL (local) + Supabase (production)
- API: Fully documented REST endpoints  
- Testing: 130 passing tests
- Security: JWT + role-based access control
- Deployment: Environment configuration ready