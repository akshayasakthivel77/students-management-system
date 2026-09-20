-- ============================================================
-- Student Management System — Reference SQL Schema
-- NOTE: The application uses MongoDB. This SQL schema is
--       provided as a reference / documentation artifact only.
-- ============================================================

-- Users table
CREATE TABLE users (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    role        ENUM('admin', 'teacher', 'staff') DEFAULT 'teacher',
    avatar      VARCHAR(255) DEFAULT '',
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Students table
CREATE TABLE students (
    id            INT PRIMARY KEY AUTO_INCREMENT,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    phone         VARCHAR(20),
    roll_number   VARCHAR(50) NOT NULL UNIQUE,
    course        VARCHAR(100) NOT NULL,
    year          TINYINT NOT NULL CHECK (year BETWEEN 1 AND 6),
    section       VARCHAR(10),
    address       TEXT,
    date_of_birth DATE,
    gender        ENUM('Male', 'Female', 'Other'),
    avatar        VARCHAR(255) DEFAULT '',
    is_active     BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Attendance table
CREATE TABLE attendance (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    student_id  INT NOT NULL,
    date        DATE NOT NULL,
    status      ENUM('Present', 'Absent', 'Late', 'Excused') NOT NULL,
    subject     VARCHAR(100),
    marked_by   INT,
    remarks     TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_attendance (student_id, date, subject),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (marked_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX idx_students_course ON students(course);
CREATE INDEX idx_students_year ON students(year);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_student ON attendance(student_id);

-- Sample admin user (password: admin123 — bcrypt hash)
INSERT INTO users (name, email, password, role)
VALUES (
    'Admin User',
    'admin@school.edu',
    '$2a$10$exampleHashHere',
    'admin'
);
