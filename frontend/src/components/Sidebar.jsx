import { NavLink, useNavigate } from 'react-router-dom';

const navItems = [
  { to: '/', icon: '🏠', label: 'Dashboard' },
  { to: '/students', icon: '🎓', label: 'Students' },
  { to: '/students/add', icon: '➕', label: 'Add Student' },
  { to: '/attendance', icon: '📋', label: 'Attendance' },
  { to: '/profile', icon: '👤', label: 'My Profile' },
  { to: '/settings', icon: '⚙️', label: 'Settings' },
];

export default function Sidebar({ isOpen }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">🎓</div>
        <div>
          <h2>EduManage</h2>
          <span>Student Portal</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <p className="nav-section-title">Main Menu</p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        <p className="nav-section-title" style={{ marginTop: '24px' }}>Account</p>
        <button
          onClick={handleLogout}
          className="nav-link"
          style={{ width: '100%', background: 'none', cursor: 'pointer', border: 'none', color: 'var(--danger)', textAlign: 'left' }}
        >
          <span className="nav-icon">🚪</span>
          Logout
        </button>
      </nav>

      {/* Footer info */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--border)', fontSize: '11px', color: 'var(--text-muted)' }}>
        v1.0.0 • Student Management System
      </div>
    </aside>
  );
}
