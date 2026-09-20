import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import StudentForm from '../components/StudentForm';
import api from '../services/api';

export default function EditStudent() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const data = await api.get(`/students/${id}`);
        setStudent(data);
      } catch (err) {
        toast.error('Failed to load student');
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id]);

  if (loading) return (
    <div className="flex-center" style={{ minHeight: '40vh' }}>
      <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
    </div>
  );

  if (!student) return (
    <div className="empty-state">
      <div className="empty-icon">❌</div>
      <h3>Student not found</h3>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Edit Student</h1>
          <p>Update information for {student.name}</p>
        </div>
      </div>
      <div className="card" style={{ maxWidth: '800px' }}>
        <StudentForm initialData={student} />
      </div>
    </div>
  );
}
