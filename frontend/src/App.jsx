import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import AddStudent from './pages/AddStudent';
import EditStudent from './pages/EditStudent';
import Attendance from './pages/Attendance';
import Profile from './pages/Profile';
import Settings, { applyTheme } from './pages/Settings';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { useState, useEffect } from 'react';

// Simple auth guard — checks localStorage for token
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  useEffect(() => {
    try {
      const saved = localStorage.getItem('app_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.theme) applyTheme(parsed.theme);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const isLoginPage = location.pathname === '/login';
  const isLoggedIn = !!localStorage.getItem('token');

  if (isLoginPage) {
    return <Login />;
  }

  return (
    <div className="app">
      {isLoggedIn ? (
        <>
          <Sidebar isOpen={sidebarOpen} />
          <div className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
            <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
            <div className="page-wrapper">
              <Routes>
                <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/students" element={<PrivateRoute><Students /></PrivateRoute>} />
                <Route path="/students/add" element={<PrivateRoute><AddStudent /></PrivateRoute>} />
                <Route path="/students/edit/:id" element={<PrivateRoute><EditStudent /></PrivateRoute>} />
                <Route path="/attendance" element={<PrivateRoute><Attendance /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </div>
        </>
      ) : (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </div>
  );
}

export default App;
