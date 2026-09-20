import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    // Strictly clear credentials on page load so only Email ID placeholder displays
    setForm({ email: '', password: '' });
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleQuickFill = () => {
    setUnlocked(true);
    setForm({
      email: 'akashiyasakthivel123@gmail.com',
      password: 'akashiya123',
    });
    toast.success('Credentials filled! Click Sign In 🚀');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.post('/users/login', form);
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

        <form onSubmit={handleSubmit} autoComplete="off">
          {/* Dummy inputs to divert browser autofill */}
          <input type="text" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
          <input type="password" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

          <div className="form-group">
            <label className="form-label">Email ID</label>
            <input
              id="login-account"
              name="user_email_id"
              type="text"
              className="form-control"
              placeholder="Email ID"
              autoComplete="off"
              readOnly={!unlocked}
              onFocus={() => setUnlocked(true)}
              onClick={() => setUnlocked(true)}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
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
              name="user_password"
              type={showPassword ? 'text' : 'password'}
              className="form-control"
              placeholder="••••••••"
              autoComplete="new-password"
              readOnly={!unlocked}
              onFocus={() => setUnlocked(true)}
              onClick={() => setUnlocked(true)}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-full btn-lg" style={{ marginTop: '8px' }} disabled={loading}>
            {loading ? <><span className="spinner" /> Signing in...</> : '🔐 Sign In'}
          </button>

          <button
            type="button"
            onClick={handleQuickFill}
            className="btn btn-secondary w-full"
            style={{ marginTop: '10px', fontSize: '13px' }}
          >
            ⚡ Quick-Fill Your Credentials
          </button>
        </form>

        <p className="text-center text-muted" style={{ marginTop: '20px' }}>
          Don't have an account? Contact your administrator.
        </p>
      </div>
    </div>
  );
}
