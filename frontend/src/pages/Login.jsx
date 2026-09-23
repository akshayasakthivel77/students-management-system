import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const emailInputRef = useRef(null);

  // Modes: 'login' | 'forgot' | 'register'
  const [mode, setMode] = useState('login');

  // Stored user if already signed in
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });

  // Login Form
  const [form, setForm] = useState({
    email: 'akshayasakthivel.77@gmail.com',
    password: 'Akshaya07082008',
  });
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password Form
  const [forgotForm, setForgotForm] = useState({
    email: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Register Form (Create another account)
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'teacher',
  });

  const [loading, setLoading] = useState(false);

  // Handlers for Login
  const handleLoginChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleForgotChange = (e) => setForgotForm({ ...forgotForm, [e.target.name]: e.target.value });
  const handleRegisterChange = (e) => setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });

  // Sign out current user
  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    toast.success('Signed out successfully');
  };

  // "Log in another account" handler
  const handleLoginAnotherAccount = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setForm({ email: '', password: '' });
    setMode('login');
    toast('Switched to clean login. Enter your account credentials.', { icon: '👤' });
    setTimeout(() => {
      emailInputRef.current?.focus();
    }, 100);
  };

  // Quick fill default admin credentials
  const handleUseAdminCredentials = () => {
    const creds = {
      email: 'akshayasakthivel.77@gmail.com',
      password: 'Akshaya07082008',
    };
    setForm(creds);
    toast.success('Admin credentials loaded');
  };


  // Execute Login
  const executeLogin = async (credentials) => {
    setLoading(true);
    try {
      const data = await api.post('/users/login', credentials);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({ name: data.name, email: data.email, role: data.role }));
      setCurrentUser({ name: data.name, email: data.email, role: data.role });
      toast.success(`Welcome back, ${data.name}! 🎉`);
      navigate('/');
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please enter both email and password');
      return;
    }
    executeLogin(form);
  };

  // Execute Forgot / Reset Password
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotForm.email) {
      toast.error('Please enter your registered email address');
      return;
    }
    if (!forgotForm.newPassword || forgotForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }
    if (forgotForm.newPassword !== forgotForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/users/forgot-password', {
        email: forgotForm.email,
        newPassword: forgotForm.newPassword,
      });

      toast.success(res.message || 'Password reset successfully! Please sign in with your new password.');
      setForm({
        email: forgotForm.email,
        password: forgotForm.newPassword,
      });
      setForgotForm({ email: '', newPassword: '', confirmPassword: '' });
      setMode('login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  // Execute Register (Create another account)
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!registerForm.name || !registerForm.email || !registerForm.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (registerForm.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const data = await api.post('/users/register', registerForm);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({ name: data.name, email: data.email, role: data.role }));
      toast.success(`Account created! Welcome, ${data.name} 🎓`);
      navigate('/');
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="logo-circle">🎓</div>
          <h1>EduManage</h1>
          <p>Student Management System</p>
        </div>

        {/* Current Active Session Box (if already logged in) */}
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
            <div>Signed in as <strong>{currentUser.name}</strong> <span className="badge badge-info" style={{ fontSize: '11px', textTransform: 'capitalize' }}>{currentUser.role}</span></div>
            <div style={{ marginTop: '8px', display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
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
                onClick={handleLoginAnotherAccount}
                title="Sign out and sign in with a different account"
              >
                🔄 Log in to another account
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleSignOut}
              >
                🚪 Sign Out
              </button>
            </div>
          </div>
        )}

        {/* -------------------- 1. LOGIN MODE -------------------- */}
        {mode === 'login' && (
          <>
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label className="form-label">Email ID</label>
                <input
                  ref={emailInputRef}
                  id="login-account"
                  name="email"
                  type="email"
                  className="form-control"
                  placeholder="Enter email (e.g. user@gmail.com)"
                  value={form.email}
                  onChange={handleLoginChange}
                  required
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Password</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleLoginChange}
                  required
                />
                {/* Forgot Password link */}
                <div style={{ textAlign: 'right', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotForm(f => ({ ...f, email: form.email }));
                      setMode('forgot');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-light)',
                      fontSize: '12px',
                      cursor: 'pointer',
                      padding: 0,
                      textDecoration: 'underline',
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                className="btn btn-primary w-full btn-lg"
                style={{ marginTop: '4px' }}
                disabled={loading}
              >
                {loading ? <><span className="spinner" /> Signing in...</> : '🔐 Sign In'}
              </button>

              {/* Log in with another account button */}
              <button
                type="button"
                onClick={handleLoginAnotherAccount}
                className="btn btn-secondary w-full"
                style={{
                  marginTop: '10px',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  border: '1px solid var(--border)',
                }}
              >
                👤 Log in with another account
              </button>

              {/* 1-Click Admin Button */}
              <button
                type="button"
                onClick={() => {
                  handleUseAdminCredentials();
                  executeLogin({
                    email: 'akshayasakthivel.77@gmail.com',
                    password: 'Akshaya07082008',
                  });
                }}
                disabled={loading}
                className="btn btn-secondary w-full"
                style={{ marginTop: '8px', fontSize: '13px' }}
              >
                ⚡ 1-Click Sign In as Admin
              </button>
            </form>

            {/* Switch to Register another account */}
            <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-light)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline',
                }}
              >
                Create Account
              </button>
            </div>
          </>
        )}

        {/* -------------------- 2. FORGOT PASSWORD MODE -------------------- */}
        {mode === 'forgot' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                🔑 Reset Password
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Enter your account email and choose a new password.
              </p>
            </div>

            <form onSubmit={handleForgotSubmit}>
              <div className="form-group">
                <label className="form-label">Registered Email ID</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="name@example.com"
                  value={forgotForm.email}
                  onChange={handleForgotChange}
                  required
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">New Password</label>
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-light)',
                      fontSize: '12px',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    {showNewPassword ? 'Hide 👁️' : 'Show 👁️'}
                  </button>
                </div>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  name="newPassword"
                  className="form-control"
                  placeholder="At least 6 characters"
                  value={forgotForm.newPassword}
                  onChange={handleForgotChange}
                  required
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  className="form-control"
                  placeholder="Repeat new password"
                  value={forgotForm.confirmPassword}
                  onChange={handleForgotChange}
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full btn-lg"
                style={{ marginTop: '8px' }}
                disabled={loading}
              >
                {loading ? <><span className="spinner" /> Resetting...</> : '🔄 Reset Password'}
              </button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="btn btn-secondary w-full"
                style={{ marginTop: '10px', fontSize: '13px' }}
              >
                ← Back to Sign In
              </button>
            </form>
          </div>
        )}

        {/* -------------------- 3. REGISTER ANOTHER ACCOUNT MODE -------------------- */}
        {mode === 'register' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                ✨ Create Account
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Register another account to access the system.
              </p>
            </div>

            <form onSubmit={handleRegisterSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="e.g. John Doe"
                  value={registerForm.name}
                  onChange={handleRegisterChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email ID</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="e.g. john@example.com"
                  value={registerForm.email}
                  onChange={handleRegisterChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  placeholder="At least 6 characters"
                  value={registerForm.password}
                  onChange={handleRegisterChange}
                  required
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Account Role</label>
                <select
                  name="role"
                  className="form-control"
                  value={registerForm.role}
                  onChange={handleRegisterChange}
                >
                  <option value="teacher">Teacher</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full btn-lg"
                style={{ marginTop: '8px' }}
                disabled={loading}
              >
                {loading ? <><span className="spinner" /> Creating account...</> : '🚀 Create Account & Sign In'}
              </button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="btn btn-secondary w-full"
                style={{ marginTop: '10px', fontSize: '13px' }}
              >
                ← Back to Sign In
              </button>
            </form>
          </div>
        )}

        <p className="text-center text-muted" style={{ marginTop: '20px', fontSize: '12px' }}>
          Student Management System • Secure Authentication
        </p>
      </div>
    </div>
  );
}
