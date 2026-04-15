import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PageLoader } from './components/shared/LoadingSpinner';

import Home from './pages/Home';
import Login from './pages/Login';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import Emergency from './pages/Emergency';

function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser, userRole, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!currentUser) return <Navigate to="/" replace />;
  // If allowedRoles specified and user role doesn't match, redirect to home
  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login/patient" element={<Login />} />
            <Route path="/login/doctor" element={<Login />} />
            <Route path="/emergency" element={<Emergency />} />
            <Route path="/patient/dashboard" element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientDashboard />
              </ProtectedRoute>
            } />
            <Route path="/doctor/dashboard" element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}
