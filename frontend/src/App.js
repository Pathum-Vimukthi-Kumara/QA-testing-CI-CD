import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

// Landing Page
import LandingPage from './components/Landing/LandingPage';

// Auth Components
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

// Dashboard Components
import UserDashboard from './components/Dashboard/UserDashboard';
import OfficerDashboard from './components/Dashboard/OfficerDashboard';
import AdminDashboard from './components/Dashboard/AdminDashboard';

// Payment Component
import PaymentSubmission from './components/Payment/PaymentSubmission';

// Utils
import ProtectedRoute from './utils/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Dashboard Routes */}
          <Route path="/user-dashboard" element={
            <ProtectedRoute userType="user">
              <UserDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/officer-dashboard" element={
            <ProtectedRoute userType="officer">
              <OfficerDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin-dashboard" element={
            <ProtectedRoute userType="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/payment/:violationId" element={
            <ProtectedRoute userType="user">
              <PaymentSubmission />
            </ProtectedRoute>
          } />
          
          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
