import { Link } from 'react-router-dom';

export default function StudentCard({ student, onDelete }) {
  const initials = student.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const avatarColors = [
    'linear-gradient(135deg,#6366f1,#818cf8)',
    'linear-gradient(135deg,#10b981,#34d399)',
    'linear-gradient(135deg,#f59e0b,#fbbf24)',
    'linear-gradient(135deg,#ef4444,#f87171)',
    'linear-gradient(135deg,#3b82f6,#60a5fa)',
    'linear-gradient(135deg,#8b5cf6,#a78bfa)',
  ];
  const color = avatarColors[student.name.charCodeAt(0) % avatarColors.length];

  return (
    <div className="student-card">
      <div className="student-card-header">
        <div className="student-avatar" style={{ background: color }}>
          {initials}
        </div>
        <div className="student-card-info">
          <h3>{student.name}</h3>
          <p>{student.rollNumber} • {student.course}</p>
          <p style={{ marginTop: '2px' }}>{student.email}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <span className="badge badge-accent">Year {student.year}</span>
        {student.section && <span className="badge badge-info">Section {student.section}</span>}
        <span className={`badge ${student.isActive ? 'badge-success' : 'badge-danger'}`}>
          {student.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      {student.phone && (
        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          📞 {student.phone}
        </div>
      )}

      <div className="student-card-actions">
        <Link to={`/students/edit/${student._id}`} className="btn btn-secondary btn-sm">
          ✏️ Edit
        </Link>
        <button
          onClick={() => onDelete(student._id)}
          className="btn btn-danger btn-sm"
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
}
