import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const COURSES = ['B.Tech', 'B.Sc', 'BCA', 'MCA', 'MBA', 'B.Com', 'BA', 'M.Tech'];
const GENDERS = ['Male', 'Female', 'Other'];

export default function StudentForm({ initialData = {}, onSuccess }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: initialData.name || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    rollNumber: initialData.rollNumber || '',
    course: initialData.course || '',
    year: initialData.year || '',
    section: initialData.section || '',
    address: initialData.address || '',
    dateOfBirth: initialData.dateOfBirth ? initialData.dateOfBirth.split('T')[0] : '',
    gender: initialData.gender || '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (initialData._id) {
        await api.put(`/students/${initialData._id}`, form);
        toast.success('Student updated successfully!');
      } else {
        await api.post('/students', form);
        toast.success('Student added successfully!');
      }
      if (onSuccess) onSuccess();
      else navigate('/students');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input name="name" value={form.name} onChange={handleChange}
            className="form-control" placeholder="John Doe" required />
        </div>
        <div className="form-group">
          <label className="form-label">Email *</label>
          <input name="email" type="email" value={form.email} onChange={handleChange}
            className="form-control" placeholder="john@example.com" required />
        </div>
        <div className="form-group">
          <label className="form-label">Roll Number *</label>
          <input name="rollNumber" value={form.rollNumber} onChange={handleChange}
            className="form-control" placeholder="CS2024001" required />
        </div>
        <div className="form-group">
          <label className="form-label">Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange}
            className="form-control" placeholder="+91 98765 43210" />
        </div>
        <div className="form-group">
          <label className="form-label">Course *</label>
          <select name="course" value={form.course} onChange={handleChange}
            className="form-control" required>
            <option value="">Select Course</option>
            {COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Year *</label>
          <select name="year" value={form.year} onChange={handleChange}
            className="form-control" required>
            <option value="">Select Year</option>
            {[1, 2, 3, 4, 5, 6].map((y) => <option key={y} value={y}>Year {y}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Section</label>
          <input name="section" value={form.section} onChange={handleChange}
            className="form-control" placeholder="A" />
        </div>
        <div className="form-group">
          <label className="form-label">Gender</label>
          <select name="gender" value={form.gender} onChange={handleChange}
            className="form-control">
            <option value="">Select Gender</option>
            {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Date of Birth</label>
          <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange}
            className="form-control" />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Address</label>
        <textarea name="address" value={form.address} onChange={handleChange}
          className="form-control" placeholder="Full address..." />
      </div>

      <div className="flex gap-3" style={{ marginTop: '8px' }}>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <><span className="spinner" /> Saving...</> : (initialData._id ? '💾 Update Student' : '➕ Add Student')}
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => navigate('/students')}>
          Cancel
        </button>
      </div>
    </form>
  );
}
