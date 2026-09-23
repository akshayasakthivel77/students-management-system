import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const THEMES = [
  { id: 'indigo', name: 'Indigo Dream', primary: '#6366f1', light: '#818cf8', dark: '#4f46e5', glow: 'rgba(99,102,241,0.35)' },
  { id: 'cyan', name: 'Electric Cyan', primary: '#06b6d4', light: '#22d3ee', dark: '#0891b2', glow: 'rgba(6,182,212,0.35)' },
  { id: 'emerald', name: 'Emerald Wave', primary: '#10b981', light: '#34d399', dark: '#059669', glow: 'rgba(16,185,129,0.35)' },
  { id: 'purple', name: 'Violet Royale', primary: '#a855f7', light: '#c084fc', dark: '#9333ea', glow: 'rgba(168,85,247,0.35)' },
  { id: 'amber', name: 'Sunset Amber', primary: '#f59e0b', light: '#fbbf24', dark: '#d97706', glow: 'rgba(245,158,11,0.35)' },
  { id: 'rose', name: 'Crimson Rose', primary: '#f43f5e', light: '#fb7185', dark: '#e11d48', glow: 'rgba(244,63,94,0.35)' },
];

export const applyTheme = (themeId) => {
  const theme = THEMES.find((t) => t.id === themeId) || THEMES[0];
  const root = document.documentElement;
  root.style.setProperty('--accent', theme.primary);
  root.style.setProperty('--accent-light', theme.light);
  root.style.setProperty('--accent-dark', theme.dark);
  root.style.setProperty('--accent-glow', theme.glow);
};

const DEFAULT_SETTINGS = {
  institutionName: 'EduManage Academy',
  supportEmail: 'admin@school.edu',
  academicYear: '2024 - 2025',
  currentSemester: 'Semester 1',
  attendanceThreshold: 75,
  currency: '₹',
  dateFormat: 'DD/MM/YYYY',
  theme: 'indigo',
  compactTables: false,
  highContrast: false,
  alertLowAttendance: true,
  alertFeeDue: true,
  alertNewStudent: true,
  alertGradePublish: true,
  dailyDigest: false,
  sessionTimeout: '1 hour',
  twoFactorEnabled: false,
};

export default function Settings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('app_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [saving, setSaving] = useState(false);
  const [exportLoading, setExportLoading] = useState({});
  const [pingStatus, setPingStatus] = useState(null);
  const [pingLoading, setPingLoading] = useState(false);

  // Apply theme when component mounts or theme changes
  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);

  const handleTextChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggle = (field) => {
    setSettings((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSaveSettings = () => {
    setSaving(true);
    try {
      localStorage.setItem('app_settings', JSON.stringify(settings));
      applyTheme(settings.theme);
      setTimeout(() => {
        setSaving(false);
        toast.success('Settings saved successfully!');
      }, 350);
    } catch (err) {
      setSaving(false);
      toast.error('Failed to save settings');
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all settings back to default values?')) {
      setSettings(DEFAULT_SETTINGS);
      localStorage.setItem('app_settings', JSON.stringify(DEFAULT_SETTINGS));
      applyTheme(DEFAULT_SETTINGS.theme);
      toast.success('Settings reset to defaults');
    }
  };

  const handleExport = async (endpoint, filename, key) => {
    setExportLoading((prev) => ({ ...prev, [key]: true }));
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');
      const response = await fetch(`${baseUrl}/export/${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`${filename} downloaded!`);
    } catch (err) {
      toast.error(err.message || 'Export failed. Ensure backend is running.');
    } finally {
      setExportLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handlePingBackend = async () => {
    setPingLoading(true);
    setPingStatus(null);
    const start = Date.now();
    try {
      await api.get('/users/profile');
      const duration = Date.now() - start;
      setPingStatus({ ok: true, latency: duration, time: new Date().toLocaleTimeString() });
      toast.success(`API responded in ${duration}ms`);
    } catch (err) {
      setPingStatus({ ok: false, error: err.message, time: new Date().toLocaleTimeString() });
      toast.error('API connection check failed');
    } finally {
      setPingLoading(false);
    }
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="settings-page">
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1>⚙️ Settings</h1>
          <p>Configure institution defaults, appearance, notifications, exports, and security preferences.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" className="btn btn-secondary" onClick={handleResetDefaults}>
            🔄 Reset
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSaveSettings} disabled={saving}>
            {saving ? <><span className="spinner" /> Saving...</> : '💾 Save Settings'}
          </button>
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="settings-layout">
        {/* Navigation Tabs */}
        <aside className="settings-tabs card" style={{ padding: '12px' }}>
          <button
            type="button"
            className={`settings-tab-btn ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <span className="tab-icon">🏢</span>
            <div className="tab-text">
              <span className="tab-title">General</span>
              <span className="tab-desc">Academic & institution info</span>
            </div>
          </button>

          <button
            type="button"
            className={`settings-tab-btn ${activeTab === 'appearance' ? 'active' : ''}`}
            onClick={() => setActiveTab('appearance')}
          >
            <span className="tab-icon">🎨</span>
            <div className="tab-text">
              <span className="tab-title">Appearance</span>
              <span className="tab-desc">Themes & visual options</span>
            </div>
          </button>

          <button
            type="button"
            className={`settings-tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <span className="tab-icon">🔔</span>
            <div className="tab-text">
              <span className="tab-title">Notifications</span>
              <span className="tab-desc">Alerts & email triggers</span>
            </div>
          </button>

          <button
            type="button"
            className={`settings-tab-btn ${activeTab === 'data' ? 'active' : ''}`}
            onClick={() => setActiveTab('data')}
          >
            <span className="tab-icon">💾</span>
            <div className="tab-text">
              <span className="tab-title">Data & Export</span>
              <span className="tab-desc">CSV reports & backups</span>
            </div>
          </button>

          <button
            type="button"
            className={`settings-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <span className="tab-icon">🛡️</span>
            <div className="tab-text">
              <span className="tab-title">Security</span>
              <span className="tab-desc">Session & account policy</span>
            </div>
          </button>

          <button
            type="button"
            className={`settings-tab-btn ${activeTab === 'system' ? 'active' : ''}`}
            onClick={() => setActiveTab('system')}
          >
            <span className="tab-icon">ℹ️</span>
            <div className="tab-text">
              <span className="tab-title">System Info</span>
              <span className="tab-desc">Render & API health</span>
            </div>
          </button>
        </aside>

        {/* Tab Content Panel */}
        <main className="settings-content">
          {/* TAB 1: GENERAL */}
          {activeTab === 'general' && (
            <div className="card">
              <div className="settings-section-header">
                <div>
                  <h2 className="section-title">🏢 General Academic Settings</h2>
                  <p className="section-desc">Manage institution details, academic years, and attendance thresholds.</p>
                </div>
              </div>

              <div className="form-grid" style={{ marginTop: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Institution / School Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={settings.institutionName}
                    onChange={(e) => handleTextChange('institutionName', e.target.value)}
                    placeholder="e.g. EduManage International Academy"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Support / Contact Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={settings.supportEmail}
                    onChange={(e) => handleTextChange('supportEmail', e.target.value)}
                    placeholder="admin@school.edu"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Active Academic Year</label>
                  <select
                    className="form-control"
                    value={settings.academicYear}
                    onChange={(e) => handleTextChange('academicYear', e.target.value)}
                  >
                    <option value="2023 - 2024">2023 - 2024</option>
                    <option value="2024 - 2025">2024 - 2025 (Current)</option>
                    <option value="2025 - 2026">2025 - 2026</option>
                    <option value="2026 - 2027">2026 - 2027</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Current Term / Semester</label>
                  <select
                    className="form-control"
                    value={settings.currentSemester}
                    onChange={(e) => handleTextChange('currentSemester', e.target.value)}
                  >
                    <option value="Semester 1">Semester 1 (Fall)</option>
                    <option value="Semester 2">Semester 2 (Spring)</option>
                    <option value="Semester 3">Semester 3</option>
                    <option value="Semester 4">Semester 4</option>
                    <option value="Summer Term">Summer Term</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Attendance Warning Threshold: <strong>{settings.attendanceThreshold}%</strong>
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="range"
                      min="50"
                      max="95"
                      step="5"
                      value={settings.attendanceThreshold}
                      onChange={(e) => handleTextChange('attendanceThreshold', Number(e.target.value))}
                      style={{ flex: 1, accentColor: 'var(--accent)' }}
                    />
                    <span className="badge badge-warning" style={{ fontSize: '12px' }}>
                      {settings.attendanceThreshold}%
                    </span>
                  </div>
                  <small style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                    Students with attendance below this percentage are flagged for attention.
                  </small>
                </div>

                <div className="form-group">
                  <label className="form-label">Currency Symbol</label>
                  <select
                    className="form-control"
                    value={settings.currency}
                    onChange={(e) => handleTextChange('currency', e.target.value)}
                  >
                    <option value="₹">₹ (Indian Rupee - INR)</option>
                    <option value="$">$ (US Dollar - USD)</option>
                    <option value="€">€ (Euro - EUR)</option>
                    <option value="£">£ (British Pound - GBP)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Date Display Format</label>
                  <select
                    className="form-control"
                    value={settings.dateFormat}
                    onChange={(e) => handleTextChange('dateFormat', e.target.value)}
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 23/09/2026)</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 09/23/2026)</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-09-23)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-primary" onClick={handleSaveSettings}>
                  Save General Settings
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: APPEARANCE */}
          {activeTab === 'appearance' && (
            <div className="card">
              <div className="settings-section-header">
                <div>
                  <h2 className="section-title">🎨 Appearance & Theme</h2>
                  <p className="section-desc">Customize the portal theme colors and table display density.</p>
                </div>
              </div>

              <div style={{ marginTop: '24px' }}>
                <label className="form-label" style={{ marginBottom: '12px', fontSize: '14px' }}>
                  Accent Color Palette
                </label>
                <div className="theme-grid">
                  {THEMES.map((theme) => {
                    const isSelected = settings.theme === theme.id;
                    return (
                      <div
                        key={theme.id}
                        className={`theme-card ${isSelected ? 'active' : ''}`}
                        onClick={() => {
                          handleTextChange('theme', theme.id);
                          applyTheme(theme.id);
                        }}
                      >
                        <div
                          className="theme-circle"
                          style={{
                            background: `linear-gradient(135deg, ${theme.primary}, ${theme.light})`,
                            boxShadow: isSelected ? `0 0 16px ${theme.glow}` : 'none',
                          }}
                        />
                        <div className="theme-info">
                          <span className="theme-name">{theme.name}</span>
                          <span className="theme-hex">{theme.primary}</span>
                        </div>
                        {isSelected && <span className="theme-check">✓</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="settings-divider" />

              <div className="settings-row">
                <div>
                  <h4 style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Compact Tables</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Reduce table cell padding to display more student and attendance rows on screen.
                  </p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={settings.compactTables}
                    onChange={() => handleToggle('compactTables')}
                  />
                  <span className="slider round"></span>
                </label>
              </div>

              <div className="settings-row">
                <div>
                  <h4 style={{ fontSize: '14px', color: 'var(--text-primary)' }}>High Contrast Highlights</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Enhance text sharpness and card borders for improved visibility.
                  </p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={settings.highContrast}
                    onChange={() => handleToggle('highContrast')}
                  />
                  <span className="slider round"></span>
                </label>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-primary" onClick={handleSaveSettings}>
                  Save Appearance Preferences
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="card">
              <div className="settings-section-header">
                <div>
                  <h2 className="section-title">🔔 Notification Preferences</h2>
                  <p className="section-desc">Manage system triggers, email alerts, and administrative notifications.</p>
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <div className="settings-row">
                  <div>
                    <h4 style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Critical Attendance Warning</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Notify faculty when a student's total attendance drops below {settings.attendanceThreshold}%.
                    </p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={settings.alertLowAttendance}
                      onChange={() => handleToggle('alertLowAttendance')}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>

                <div className="settings-row">
                  <div>
                    <h4 style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Fee Payment Due Reminder</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Send pending tuition fee alerts 3 days prior to the deadline date.
                    </p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={settings.alertFeeDue}
                      onChange={() => handleToggle('alertFeeDue')}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>

                <div className="settings-row">
                  <div>
                    <h4 style={{ fontSize: '14px', color: 'var(--text-primary)' }}>New Student Enrollment Alerts</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Receive notifications when new student records are created or imported.
                    </p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={settings.alertNewStudent}
                      onChange={() => handleToggle('alertNewStudent')}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>

                <div className="settings-row">
                  <div>
                    <h4 style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Grade & Examination Reports</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Notify administrators when semester grades are updated or finalized.
                    </p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={settings.alertGradePublish}
                      onChange={() => handleToggle('alertGradePublish')}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>

                <div className="settings-row">
                  <div>
                    <h4 style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Daily Activity Summary Digest</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Receive a daily 6:00 PM email summary of marked attendance and fee collections.
                    </p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={settings.dailyDigest}
                      onChange={() => handleToggle('dailyDigest')}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-primary" onClick={handleSaveSettings}>
                  Save Notification Settings
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: DATA & EXPORT */}
          {activeTab === 'data' && (
            <div className="card">
              <div className="settings-section-header">
                <div>
                  <h2 className="section-title">💾 Data Management & Instant Exports</h2>
                  <p className="section-desc">Download complete CSV spreadsheets of your school records directly.</p>
                </div>
              </div>

              <div className="export-cards-grid" style={{ marginTop: '20px' }}>
                {/* Students Export */}
                <div className="export-card">
                  <div className="export-card-icon" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
                    🎓
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Students Directory</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      All registered students with roll numbers, contact, courses, and active status.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={exportLoading.students}
                    onClick={() => handleExport('students', 'students_list.csv', 'students')}
                  >
                    {exportLoading.students ? <span className="spinner" /> : '⬇️ Export CSV'}
                  </button>
                </div>

                {/* Attendance Export */}
                <div className="export-card">
                  <div className="export-card-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>
                    📋
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Attendance Records</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Detailed daily attendance logs, dates, subjects, and status remarks.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-success btn-sm"
                    disabled={exportLoading.attendance}
                    onClick={() => handleExport('attendance', 'attendance_report.csv', 'attendance')}
                  >
                    {exportLoading.attendance ? <span className="spinner" /> : '⬇️ Export CSV'}
                  </button>
                </div>

                {/* Fees Export */}
                <div className="export-card">
                  <div className="export-card-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }}>
                    💳
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Fee Collections & Dues</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Total fee payments, paid installments, pending dues, and payment statuses.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    disabled={exportLoading.fees}
                    onClick={() => handleExport('fees', 'fees_report.csv', 'fees')}
                  >
                    {exportLoading.fees ? <span className="spinner" /> : '⬇️ Export CSV'}
                  </button>
                </div>

                {/* Grades Export */}
                <div className="export-card">
                  <div className="export-card-icon" style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa' }}>
                    🏆
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Academic Grades & Marks</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Exam grades, total marks scored, GPA, and semester performance scores.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    disabled={exportLoading.grades}
                    onClick={() => handleExport('grades', 'grades_report.csv', 'grades')}
                  >
                    {exportLoading.grades ? <span className="spinner" /> : '⬇️ Export CSV'}
                  </button>
                </div>
              </div>

              <div className="settings-divider" />

              <div className="settings-row">
                <div>
                  <h4 style={{ fontSize: '14px', color: 'var(--danger)' }}>Clear Local Storage Cache</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Clears client-cached table filters and cached preferences. This does not delete database records.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => {
                    if (window.confirm('Clear local app cache? You will remain logged in.')) {
                      const token = localStorage.getItem('token');
                      const u = localStorage.getItem('user');
                      localStorage.clear();
                      if (token) localStorage.setItem('token', token);
                      if (u) localStorage.setItem('user', u);
                      toast.success('Local cache cleared');
                    }
                  }}
                >
                  🧹 Clear Cache
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: SECURITY */}
          {activeTab === 'security' && (
            <div className="card">
              <div className="settings-section-header">
                <div>
                  <h2 className="section-title">🛡️ Security & Authentication</h2>
                  <p className="section-desc">Manage session timeouts, account access controls, and administrative passwords.</p>
                </div>
              </div>

              <div style={{ marginTop: '20px' }}>
                <div className="settings-row">
                  <div>
                    <h4 style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Session Inactivity Timeout</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Automatically lock or sign out your session after an idle period.
                    </p>
                  </div>
                  <select
                    className="form-control"
                    style={{ width: '160px' }}
                    value={settings.sessionTimeout}
                    onChange={(e) => handleTextChange('sessionTimeout', e.target.value)}
                  >
                    <option value="15 minutes">15 minutes</option>
                    <option value="30 minutes">30 minutes</option>
                    <option value="1 hour">1 hour (Default)</option>
                    <option value="4 hours">4 hours</option>
                    <option value="Never">Never</option>
                  </select>
                </div>

                <div className="settings-row">
                  <div>
                    <h4 style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Two-Factor Authentication (2FA)</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Require an additional verification code when signing in to the administrator portal.
                    </p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={settings.twoFactorEnabled}
                      onChange={() => {
                        handleToggle('twoFactorEnabled');
                        toast.success(
                          settings.twoFactorEnabled ? '2FA disabled' : '2FA policy enabled for this session'
                        );
                      }}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>

                <div className="settings-divider" />

                <div style={{ background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid var(--border)' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    Active User Session
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', fontSize: '13px' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>LOGGED IN AS</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{user.name || 'Akashaya Sakthivel'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>USER ROLE</span>
                      <span className="badge badge-accent" style={{ textTransform: 'capitalize' }}>
                        {user.role || 'admin'}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>LOGIN STATUS</span>
                      <span className="badge badge-success">Active & Verified</span>
                    </div>
                  </div>

                  <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigate('/profile')}
                    >
                      ✏️ Edit Profile & Change Password
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-primary" onClick={handleSaveSettings}>
                  Save Security Settings
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: SYSTEM INFO */}
          {activeTab === 'system' && (
            <div className="card">
              <div className="settings-section-header">
                <div>
                  <h2 className="section-title">ℹ️ System Environment & Diagnostics</h2>
                  <p className="section-desc">View deployment details, live backend connectivity, and runtime metrics.</p>
                </div>
              </div>

              <div style={{ marginTop: '20px' }}>
                {/* Diagnostics Check */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '20px' }}>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600 }}>API Server Connectivity Check</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Test the round-trip latency to the backend Express & MongoDB service.
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {pingStatus && (
                      <span
                        className={`badge ${pingStatus.ok ? 'badge-success' : 'badge-danger'}`}
                        style={{ fontSize: '12px', padding: '6px 12px' }}
                      >
                        {pingStatus.ok ? `🟢 Live (${pingStatus.latency} ms)` : '🔴 Unreachable'}
                      </span>
                    )}
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handlePingBackend}
                      disabled={pingLoading}
                    >
                      {pingLoading ? <span className="spinner" /> : '⚡ Test Connection'}
                    </button>
                  </div>
                </div>

                {/* System Specs Table */}
                <div className="table-wrapper">
                  <table className="table">
                    <tbody>
                      <tr>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)', width: '220px' }}>Application Name</td>
                        <td>Student Management System (EduManage)</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Hosting Platform</td>
                        <td>
                          <span className="badge badge-accent">Render Web Service</span>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Live Cloud URL</td>
                        <td>
                          <a
                            href="https://students-management-system-4-k3xb.onrender.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--accent-light)', textDecoration: 'none' }}
                          >
                            https://students-management-system-4-k3xb.onrender.com ↗
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Frontend Technology</td>
                        <td>React 18.3 • Vite 5.3 • SPA Client-side Router</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Backend Framework</td>
                        <td>Node.js Express REST API</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Database Engine</td>
                        <td>MongoDB / Mongoose with In-Memory fallback</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Authentication Mode</td>
                        <td>JWT (JSON Web Token) with Bearer Authorization</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Current Release</td>
                        <td>v1.2.0 • Production Ready</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
