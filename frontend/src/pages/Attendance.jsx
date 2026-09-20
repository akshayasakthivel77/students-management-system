import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

const STATUS_COLORS = {
  Present: 'badge-success',
  Absent: 'badge-danger',
  Late: 'badge-warning',
  Excused: 'badge-info',
};

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ student: '', date: new Date().toISOString().split('T')[0], status: 'Present', subject: '', remarks: '' });
  const [submitting, setSubmitting] = useState(false);
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const [attData, stuData] = await Promise.all([
          api.get('/attendance?limit=30'),
          api.get('/students?limit=100'),
        ]);
        setRecords(attData.records || []);
        setStudents(stuData.students || []);
      } catch (err) {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const fetchRecords = async (date) => {
    try {
      const params = date ? `?date=${date}&limit=30` : '?limit=30';
      const data = await api.get(`/attendance${params}`);
      setRecords(data.records || []);
    } catch (err) {
      toast.error('Failed to filter records');
    }
  };

  const handleDateFilter = (e) => {
    setFilterDate(e.target.value);
    fetchRecords(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.student) return toast.error('Please select a student');
    setSubmitting(true);
    try {
      await api.post('/attendance', form);
      toast.success('Attendance marked!');
      setForm({ student: '', date: new Date().toISOString().split('T')[0], status: 'Present', subject: '', remarks: '' });
      fetchRecords(filterDate);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex-center" style={{ minHeight: '40vh' }}>
      <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Attendance</h1>
          <p>Mark and view student attendance records.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Mark Attendance Form */}
        <div className="card">
          <h3 style={{ marginBottom: '16px', fontSize: '15px', fontWeight: '600' }}>✅ Mark Attendance</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Student *</label>
              <select className="form-control" value={form.student} onChange={(e) => setForm({ ...form, student: e.target.value })} required>
                <option value="">Select Student</option>
                {[...students]
                  .sort((a, b) => (a.rollNumber || '').localeCompare(b.rollNumber || '', undefined, { numeric: true }))
                  .map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.rollNumber} - {s.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input type="date" className="form-control" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Status *</label>
              <select className="form-control" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {['Present', 'Absent', 'Late', 'Excused'].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Subject</label>
              <input type="text" className="form-control" placeholder="e.g. Mathematics" value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Remarks</label>
              <textarea className="form-control" placeholder="Optional note..." value={form.remarks}
                onChange={(e) => setForm({ ...form, remarks: e.target.value })} style={{ minHeight: '60px' }} />
            </div>
            <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
              {submitting ? <><span className="spinner" /> Saving...</> : '✅ Mark Attendance'}
            </button>
          </form>
        </div>

        {/* Records Table */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', gap: '12px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600' }}>📋 Attendance Records</h3>
            <input type="date" className="form-control" value={filterDate} onChange={handleDateFilter}
              style={{ width: 'auto', maxWidth: '180px' }} />
          </div>
          {records.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No records found</h3>
              <p>Mark attendance using the form on the left.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Subject</th>
                    <th>Marked By</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r._id}>
                      <td>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{r.student?.name || 'N/A'}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{r.student?.rollNumber}</div>
                      </td>
                      <td>{new Date(r.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td><span className={`badge ${STATUS_COLORS[r.status] || 'badge-info'}`}>{r.status}</span></td>
                      <td>{r.subject || '—'}</td>
                      <td>{r.markedBy?.name || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
