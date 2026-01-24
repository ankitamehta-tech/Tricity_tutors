import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import LandingPage from '@/pages/LandingPage';
import AuthPage from '@/pages/AuthPage';
import ForgotPassword from '@/pages/ForgotPassword';
import TutorDashboard from '@/pages/TutorDashboard';
import StudentDashboard from '@/pages/StudentDashboard';
import TutorProfile from '@/pages/TutorProfile';
import TutorProfileEdit from '@/pages/TutorProfileEdit';
import BrowseTutors from '@/pages/BrowseTutors';
import WalletPage from '@/pages/WalletPage';
import JobsPage from '@/pages/JobsPage';
import MessagesPage from '@/pages/MessagesPage';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsConditions from '@/pages/TermsConditions';
import RefundPolicy from '@/pages/RefundPolicy';
import ContactUs from '@/pages/ContactUs';
import { useState, useEffect } from 'react';
import '@/App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const PrivateRoute = ({ children, allowedRoles }) => {
    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return <Navigate to="/" />;
    }
    return children;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="App">
      <div className="noise-overlay" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage user={user} />} />
          <Route path="/auth" element={<AuthPage setUser={setUser} />} />
          <Route path="/login" element={<AuthPage setUser={setUser} />} />
          <Route path="/signup" element={<AuthPage setUser={setUser} />} />
          <Route path="/tutor/signup" element={<Navigate to="/auth" />} />
          <Route path="/student/signup" element={<Navigate to="/auth" />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/tutor/dashboard"
            element={
              <PrivateRoute allowedRoles={['tutor']}>
                <TutorDashboard user={user} setUser={setUser} />
              </PrivateRoute>
            }
          />
          <Route
            path="/tutor/profile/edit"
            element={
              <PrivateRoute allowedRoles={['tutor']}>
                <TutorProfileEdit user={user} />
              </PrivateRoute>
            }
          />
          <Route
            path="/student/dashboard"
            element={
              <PrivateRoute allowedRoles={['student', 'parent', 'coaching', 'company']}>
                <StudentDashboard user={user} setUser={setUser} />
              </PrivateRoute>
            }
          />
          <Route path="/tutors" element={<BrowseTutors user={user} />} />
          <Route path="/tutors/:tutorId" element={<TutorProfile user={user} />} />
          <Route
            path="/wallet"
            element={
              <PrivateRoute>
                <WalletPage user={user} setUser={setUser} />
              </PrivateRoute>
            }
          />
          <Route
            path="/jobs"
            element={
              <PrivateRoute allowedRoles={['tutor']}>
                <JobsPage user={user} setUser={setUser} />
              </PrivateRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <PrivateRoute>
                <MessagesPage user={user} />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
