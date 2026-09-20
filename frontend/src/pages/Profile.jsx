import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function Profile() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.get('/users/profile');
        setForm((f) => ({ ...f, name: data.name, email: data.email }));
      } catch (err) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setSaving(true);
    try {
      const payload = { name: form.name, email: form.email };
      if (form.password) payload.password = form.password;
      const updated = await api.put('/users/profile', payload);
      localStorage.setItem('token', updated.token);
      localStorage.setItem('user', JSON.stringify({ name: updated.name, email: updated.email, role: updated.role }));
      toast.success('Profile updated!');
      setForm((f) => ({ ...f, password: '', confirmPassword: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const initials = user.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  if (loading) return (
    <div className="flex-center" style={{ minHeight: '40vh' }}>
      <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>My Profile</h1>
          <p>Manage your account information.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Avatar Card */}
        <div className="card text-center">
          <div
            style={{
              width: 80, height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg,#6366f1,#818cf8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 700,
              margin: '0 auto 16px',
              boxShadow: '0 0 30px rgba(99,102,241,0.4)',
            }}
          >
            {initials}
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{user.name}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>{user.email}</p>
          <span className="badge badge-accent" style={{ marginTop: '10px' }}>
            {user.role || 'teacher'}
          </span>

          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)', textAlign: 'left' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>ACCOUNT INFO</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Role</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 500, textTransform: 'capitalize' }}>{user.role}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '6px 0' }}>
              <span style={{ color: 'var(--text-muted)' }}>Status</span>
              <span className="badge badge-success" style={{ fontSize: '10px' }}>Active</span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="card">
          <h3 style={{ marginBottom: '20px', fontSize: '15px', fontWeight: 600 }}>✏️ Edit Profile</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" className="form-control" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-control" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>

            <div style={{ marginTop: '8px', marginBottom: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
              <h4 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px' }}>🔒 Change Password</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input type="password" className="form-control" value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Leave blank to keep current" />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input type="password" className="form-control" value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    placeholder="Repeat new password" />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><span className="spinner" /> Saving...</> : '💾 Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
