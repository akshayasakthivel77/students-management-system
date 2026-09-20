import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import StudentCard from '../components/StudentCard';
import SearchBar from '../components/SearchBar';
import api from '../services/api';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [view, setView] = useState('grid'); // 'grid' | 'table'
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (search) params.append('search', search);
      const data = await api.get(`/students?${params}`);
      setStudents(data.students || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (err) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, [page, search]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    try {
      await api.delete(`/students/${id}`);
      toast.success('Student deleted');
      fetchStudents();
    } catch (err) {
      toast.error('Failed to delete student');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Students</h1>
          <p>{total} students registered</p>
        </div>
        <div className="flex gap-3" style={{ flexWrap: 'wrap' }}>
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search name, roll, email..." />
          <div className="flex gap-2">
            <button className={`btn btn-secondary btn-sm ${view === 'grid' ? 'btn-primary' : ''}`} onClick={() => setView('grid')}>⊞ Grid</button>
            <button className={`btn btn-secondary btn-sm ${view === 'table' ? 'btn-primary' : ''}`} onClick={() => setView('table')}>☰ Table</button>
          </div>
          <Link to="/students/add" className="btn btn-primary">➕ Add Student</Link>
        </div>
      </div>

      {loading ? (
        <div className="flex-center" style={{ minHeight: '40vh' }}>
          <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
        </div>
      ) : students.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎓</div>
          <h3>No students found</h3>
          <p>{search ? 'Try a different search term.' : 'Add your first student to get started.'}</p>
          <Link to="/students/add" className="btn btn-primary" style={{ marginTop: '16px' }}>➕ Add Student</Link>
        </div>
      ) : view === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {students.map((s) => <StudentCard key={s._id} student={s} onDelete={handleDelete} />)}
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Roll No</th>
                  <th>Course</th>
                  <th>Year</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{s.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.email}</div>
                      </div>
                    </td>
                    <td>{s.rollNumber}</td>
                    <td>{s.course}</td>
                    <td>Year {s.year} {s.section && `- ${s.section}`}</td>
                    <td>{s.phone || '—'}</td>
                    <td><span className={`badge ${s.isActive ? 'badge-success' : 'badge-danger'}`}>{s.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <div className="flex gap-2">
                        <Link to={`/students/edit/${s._id}`} className="btn btn-secondary btn-sm">✏️</Link>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s._id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex-center gap-3" style={{ marginTop: '24px' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
          <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Page {page} of {pages}</span>
          <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}>Next →</button>
        </div>
      )}
    </div>
  );
}
