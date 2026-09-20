import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../services/api';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

export default function Dashboard() {
  const [stats, setStats] = useState({ students: 0, attendance: 0, courses: 0, active: 0 });
  const [recentStudents, setRecentStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentsData = await api.get('/students?limit=5');
        setRecentStudents(studentsData.students || []);
        setStats({
          students: studentsData.total || 0,
          attendance: 87,
          courses: 8,
          active: studentsData.total || 0,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const barData = [
    { name: 'Jan', students: 30 }, { name: 'Feb', students: 45 },
    { name: 'Mar', students: 38 }, { name: 'Apr', students: 52 },
    { name: 'May', students: 61 }, { name: 'Jun', students: 55 },
  ];

  const pieData = [
    { name: 'Present', value: 72 },
    { name: 'Absent',  value: 15 },
    { name: 'Late',    value: 8  },
    { name: 'Excused', value: 5  },
  ];

  const statCards = [
    { label: 'Total Students', value: stats.students, icon: '🎓', color: '#6366f1', bg: 'rgba(99,102,241,0.15)' },
    { label: 'Attendance Rate', value: `${stats.attendance}%`, icon: '📊', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
    { label: 'Active Courses', value: stats.courses, icon: '📚', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
    { label: 'Active Students', value: stats.active, icon: '✅', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  ];

  if (loading) return (
    <div className="flex-center" style={{ minHeight: '60vh' }}>
      <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back! Here's what's happening today.</p>
        </div>
        <Link to="/students/add" className="btn btn-primary">➕ Add Student</Link>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="stat-card"
            style={{ '--stat-color': s.color, '--stat-bg': s.bg }}
          >
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-change">↑ +3% this month</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div className="card">
          <h3 style={{ marginBottom: '16px', fontSize: '15px', fontWeight: '600' }}>📈 Student Enrollment</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData}>
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }}
              />
              <Bar dataKey="students" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '16px', fontSize: '15px', fontWeight: '600' }}>📋 Attendance</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
            {pieData.map((d, i) => (
              <span key={d.name} style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i], display: 'inline-block' }} />
                {d.name} {d.value}%
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Students */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600' }}>🎓 Recent Students</h3>
          <Link to="/students" className="btn btn-secondary btn-sm">View All</Link>
        </div>
        {recentStudents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎓</div>
            <h3>No students yet</h3>
            <p>Start by adding your first student.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Roll No</th>
                  <th>Course</th>
                  <th>Year</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentStudents.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="student-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                          {s.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{s.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{s.rollNumber}</td>
                    <td>{s.course}</td>
                    <td>Year {s.year}</td>
                    <td><span className={`badge ${s.isActive ? 'badge-success' : 'badge-danger'}`}>{s.isActive ? 'Active' : 'Inactive'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
