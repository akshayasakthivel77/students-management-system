const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Student = require('./models/Student');
const studentsSeed = require('./data/studentsSeed');

const studentRoutes = require('./routes/studentRoutes');
const userRoutes = require('./routes/userRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const gradeRoutes = require('./routes/gradeRoutes');
const feeRoutes = require('./routes/feeRoutes');
const exportRoutes = require('./routes/exportRoutes');
const seedAcademicData = require('./data/academicSeed');

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/students', studentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/export', exportRoutes);

const path = require('path');
const fs = require('fs');

const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(frontendDist, 'index.html'));
  });
} else {
  // Root health-check
  app.get('/', (req, res) => {
    res.json({ message: 'Student Management API is running 🚀' });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

const startServer = async () => {
  await connectDB();
  
  // Seed/update admin user
  try {
    const email = (process.env.ADMIN_EMAIL || 'akshayasakthivel.77@gmail.com').toLowerCase().trim();
    const password = process.env.ADMIN_PASSWORD || 'Akshaya07082008';
    const name = process.env.ADMIN_NAME || 'Akashaya Sakthivel';

    let admin = await User.findOne({ email });
    if (!admin) {
      admin = await User.findOne({ role: 'admin' });
    }

    if (!admin) {
      admin = await User.create({
        name,
        email,
        password,
        role: 'admin'
      });
      console.log(`✅ Default admin user seeded: ${email} (${name})`);
    } else {
      admin.name = name;
      admin.email = email;
      admin.password = password;
      admin.role = 'admin';
      admin.isActive = true;
      await admin.save();
      console.log(`✅ Admin user updated: ${email} (${name})`);
    }
  } catch (err) {
    console.error('❌ Failed to seed/update admin user:', err.message);
  }

  // Seed/sync students
  try {
    for (const s of studentsSeed) {
      await Student.findOneAndUpdate(
        { rollNumber: s.rollNumber },
        { $set: s },
        { upsert: true, new: true }
      );
    }
    console.log(`✅ Synced ${studentsSeed.length} students from seed data`);

    // Migrate any existing student emails with @student.edu to @gmail.com
    const oldEmailStudents = await Student.find({ email: /@student\.edu$/i });
    for (const student of oldEmailStudents) {
      student.email = student.email.replace(/@student\.edu$/i, '@gmail.com');
      await student.save();
    }
    if (oldEmailStudents.length > 0) {
      console.log(`✅ Migrated ${oldEmailStudents.length} student emails to @gmail.com`);
    }
  } catch (err) {
    console.error('❌ Failed to seed students:', err.message);
  }

  // Seed academic data (grades and fees)
  try {
    const allStudents = await Student.find({ isActive: true });
    await seedAcademicData(allStudents);
  } catch (err) {
    console.error('❌ Failed to seed academic data:', err.message);
  }

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
};

startServer();

