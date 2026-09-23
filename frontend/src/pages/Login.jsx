import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: 'akshayasakthivel.77@gmail.com',
    password: 'Akshaya07082008',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  const executeLogin = async (credentials) => {
    setLoading(true);
    try {
      const data = await api.post('/users/login', credentials);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({ name: data.name, email: data.email, role: data.role }));
      toast.success(`Welcome back, ${data.name}! 🎉`);
      navigate('/');
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    executeLogin(form);
  };

  const handleQuickLogin = () => {
    const creds = {
      email: 'akshayasakthivel.77@gmail.com',
      password: 'Akshaya07082008',
    };
    setForm(creds);
    executeLogin(creds);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-circle">🎓</div>
          <h1>EduManage</h1>
          <p>Student Management System</p>
        </div>

        {currentUser && (
          <div style={{
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: '12px',
            padding: '12px 14px',
            marginBottom: '20px',
            fontSize: '13px',
            textAlign: 'center',
          }}>
            <div>Signed in as <strong>{currentUser.name}</strong></div>
            <div style={{ marginTop: '6px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => navigate('/')}
              >
                🏠 Go to Dashboard
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleLogout}
              >
                🚪 Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Demo Credentials Box */}
        <div style={{
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: '10px',
          padding: '12px 14px',
          marginBottom: '20px',
          fontSize: '12px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontWeight: 600, color: 'var(--accent-light)' }}>🔑 Admin Credentials</span>
            <span className="badge badge-success" style={{ fontSize: '10px' }}>Ready to Sign In</span>
          </div>
          <div style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            <div><strong>Email:</strong> <code style={{ color: 'var(--text-primary)' }}>akshayasakthivel.77@gmail.com</code></div>
            <div><strong>Password:</strong> <code style={{ color: 'var(--text-primary)' }}>Akshaya07082008</code></div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email ID</label>
            <input
              id="login-account"
              name="email"
              type="email"
              className="form-control"
              placeholder="akshayasakthivel.77@gmail.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Password</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-light)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  padding: 0,
                  marginBottom: '6px',
                }}
              >
                {showPassword ? 'Hide 👁️' : 'Show 👁️'}
              </button>
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              className="form-control"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full btn-lg"
            style={{ marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? <><span className="spinner" /> Signing in...</> : '🔐 Sign In'}
          </button>

          <button
            type="button"
            onClick={handleQuickLogin}
            disabled={loading}
            className="btn btn-secondary w-full"
            style={{ marginTop: '10px', fontSize: '13px' }}
          >
            ⚡ 1-Click Sign In as Admin
          </button>
        </form>

        <p className="text-center text-muted" style={{ marginTop: '20px', fontSize: '12px' }}>
          Administrator Account • Student Management System
        </p>
      </div>
    </div>
  );
}
