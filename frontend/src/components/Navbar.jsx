import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../services/api';

const pageTitles = {
  '/': 'Dashboard',
  '/students': 'Students',
  '/students/add': 'Add Student',
  '/attendance': 'Attendance',
  '/profile': 'My Profile',
  '/settings': 'Settings & Preferences',
};

export default function Navbar({ toggleSidebar }) {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Student Management';

  const [currentUser, setCurrentUser] = useState(() => {
    const cached = JSON.parse(localStorage.getItem('user') || '{}');
    if (!cached.name || cached.name === 'System Admin') {
      cached.name = 'Akashaya Sakthivel';
      localStorage.setItem('user', JSON.stringify(cached));
    }
    return cached;
  });

  useEffect(() => {
    api.get('/users/profile')
      .then((res) => {
        if (res && res.name) {
          setCurrentUser(res);
          localStorage.setItem('user', JSON.stringify({ name: res.name, email: res.email, role: res.role }));
        }
      })
      .catch(() => {});
  }, []);

  const initials = currentUser.name
    ? currentUser.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AS';

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="toggle-btn" onClick={toggleSidebar} aria-label="Toggle Sidebar">
          ☰
        </button>
        <span className="navbar-title">{title}</span>
      </div>

      <div className="navbar-right">
        <div style={{ textAlign: 'right', marginRight: '8px' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
            {currentUser.name || 'User'}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {currentUser.role || 'teacher'}
          </div>
        </div>
        <div className="user-avatar">{initials}</div>
        <button
          type="button"
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }}
          className="btn btn-secondary btn-sm"
          style={{ marginLeft: '10px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}
          title="Sign Out to Login Page"
        >
          🚪 Sign Out
        </button>
      </div>
    </header>
  );
}
