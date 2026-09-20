const Fee = require('../models/Fee');
const Grade = require('../models/Grade');

const seedAcademicData = async (students) => {
  if (!students || students.length === 0) return;

  try {
    const feeCount = await Fee.countDocuments();
    if (feeCount === 0) {
      const feesToInsert = [];
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      students.forEach((student, index) => {
        const semester = (student.year || 2) * 2 - 1;
        const totalAmount = 45000;
        let paidAmount = 0;
        let paymentHistory = [];

        // Distribute different statuses for demo
        if (index % 3 === 0) {
          paidAmount = 45000;
          paymentHistory.push({
            amount: 45000,
            paymentDate: new Date(Date.now() - 5 * 86400000),
            paymentMethod: 'UPI',
            transactionId: 'TXN' + (900000 + index),
            receiptNumber: 'REC-' + (50000 + index),
            note: 'Full semester fee paid online',
          });
        } else if (index % 3 === 1) {
          paidAmount = 25000;
          paymentHistory.push({
            amount: 25000,
            paymentDate: new Date(Date.now() - 10 * 86400000),
            paymentMethod: 'Net Banking',
            transactionId: 'TXN' + (800000 + index),
            receiptNumber: 'REC-' + (40000 + index),
            note: '1st Installment paid',
          });
        } else {
          paidAmount = 0;
        }

        feesToInsert.push({
          student: student._id,
          academicYear: '2024-2025',
          semester,
          feeCategory: 'Tuition',
          totalAmount,
          paidAmount,
          dueAmount: totalAmount - paidAmount,
          paymentStatus: paidAmount >= totalAmount ? 'Paid' : paidAmount > 0 ? 'Partial' : 'Pending',
          dueDate,
          paymentHistory,
          remarks: 'Standard Semester Tuition Fee',
        });
      });

      await Fee.insertMany(feesToInsert);
      console.log(`✅ Seeded ${feesToInsert.length} student fee records`);
    }

    const gradeCount = await Grade.countDocuments();
    if (gradeCount === 0) {
      const gradesToInsert = [];

      students.forEach((student, index) => {
        const semester = (student.year || 2) * 2 - 1;
        // Generate realistic marks based on student index
        const base = 75 + (index % 20);
        const subjects = [
          { subjectName: 'Data Structures & Algorithms', marksObtained: Math.min(98, base + 4), maxMarks: 100 },
          { subjectName: 'Database Management Systems', marksObtained: Math.min(99, base + 8), maxMarks: 100 },
          { subjectName: 'Computer Networks', marksObtained: Math.min(95, base - 2), maxMarks: 100 },
          { subjectName: 'Operating Systems', marksObtained: Math.min(92, base + 1), maxMarks: 100 },
          { subjectName: 'Software Engineering', marksObtained: Math.min(96, base + 5), maxMarks: 100 },
        ];

        let total = 0;
        subjects.forEach((s) => {
          total += s.marksObtained;
          const pct = s.marksObtained;
          if (pct >= 90) s.grade = 'A+';
          else if (pct >= 80) s.grade = 'A';
          else if (pct >= 70) s.grade = 'B+';
          else if (pct >= 60) s.grade = 'B';
          else s.grade = 'C';
        });

        const percentage = parseFloat(((total / 500) * 100).toFixed(2));
        const gpa = parseFloat(((percentage / 100) * 10).toFixed(2));

        gradesToInsert.push({
          student: student._id,
          examType: 'Mid Term',
          academicYear: '2024-2025',
          semester,
          subjects,
          totalMarks: total,
          maxTotalMarks: 500,
          percentage,
          gpa,
          remarks: gpa >= 8.5 ? 'Excellent performance' : 'Good performance',
        });
      });

      await Grade.insertMany(gradesToInsert);
      console.log(`✅ Seeded ${gradesToInsert.length} student grade report cards`);
    }
  } catch (err) {
    console.error('❌ Failed to seed academic data:', err.message);
  }
};

module.exports = seedAcademicData;
