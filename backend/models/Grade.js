const mongoose = require('mongoose');

const gradeSubjectSchema = new mongoose.Schema({
  subjectName: {
    type: String,
    required: [true, 'Subject name is required'],
    trim: true,
  },
  marksObtained: {
    type: Number,
    required: [true, 'Marks obtained is required'],
    min: 0,
  },
  maxMarks: {
    type: Number,
    default: 100,
    min: 1,
  },
  grade: {
    type: String,
    enum: ['A+', 'A', 'B+', 'B', 'C', 'D', 'F'],
  },
});

const gradeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
    },
    examType: {
      type: String,
      enum: ['Internal 1', 'Internal 2', 'Mid Term', 'Semester Final'],
      required: [true, 'Exam type is required'],
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      trim: true,
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: 1,
      max: 8,
    },
    subjects: [gradeSubjectSchema],
    totalMarks: {
      type: Number,
      default: 0,
    },
    maxTotalMarks: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    gpa: {
      type: Number,
      default: 0,
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

// Calculate totals, percentage, and GPA before saving
gradeSchema.pre('save', function (next) {
  if (this.subjects && this.subjects.length > 0) {
    let total = 0;
    let maxTotal = 0;

    this.subjects.forEach((sub) => {
      total += sub.marksObtained;
      maxTotal += sub.maxMarks || 100;

      // Assign letter grade per subject if not provided
      if (!sub.grade) {
        const pct = (sub.marksObtained / (sub.maxMarks || 100)) * 100;
        if (pct >= 90) sub.grade = 'A+';
        else if (pct >= 80) sub.grade = 'A';
        else if (pct >= 70) sub.grade = 'B+';
        else if (pct >= 60) sub.grade = 'B';
        else if (pct >= 50) sub.grade = 'C';
        else if (pct >= 40) sub.grade = 'D';
        else sub.grade = 'F';
      }
    });

    this.totalMarks = total;
    this.maxTotalMarks = maxTotal;
    this.percentage = maxTotal > 0 ? parseFloat(((total / maxTotal) * 100).toFixed(2)) : 0;
    this.gpa = parseFloat(((this.percentage / 100) * 10).toFixed(2));
  }
  next();
});

// Ensure a student has unique exam record per type, semester, and academic year
gradeSchema.index({ student: 1, examType: 1, semester: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('Grade', gradeSchema);
