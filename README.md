# 🎓 Student Management System

A full-stack web application for managing students, attendance, and user authentication.

## Tech Stack

- **Frontend**: React (Vite) + CSS
- **Backend**: Node.js + Express.js
- **Database**: MongoDB (Mongoose)
- **Auth**: JWT (JSON Web Tokens)

## Project Structure

```
student-management-system/
├── backend/        # Node.js + Express REST API
├── frontend/       # React (Vite) SPA
└── database/       # SQL schema (reference)
```

## Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB running locally or a MongoDB Atlas URI

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd student-management-system
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Backend setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env   # then fill in your values
   npm run dev
   ```

4. **Frontend setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Environment Variables (backend/.env)

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/student_management
JWT_SECRET=your_jwt_secret_here
```

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/users/register` | Register a new user |
| POST | `/api/users/login` | Login & get token |
| GET | `/api/students` | Get all students |
| POST | `/api/students` | Add a student |
| PUT | `/api/students/:id` | Update a student |
| DELETE | `/api/students/:id` | Delete a student |
| GET | `/api/attendance` | Get attendance records |
| POST | `/api/attendance` | Mark attendance |

## License
MIT
