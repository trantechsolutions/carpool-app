// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext'; // Import Context
import { ProtectedRoute } from './components/ProtectedRoute';   // Import Wrapper
import { Navigation } from './components/Navigation';
import { AdminDashboard } from './pages/AdminDashboard';
import { TeacherView } from './pages/TeacherView';
import { ReceiverView } from './pages/ReceiverView';
import { CallerInterface } from './pages/CallerInterface';
import { Login } from './pages/Login'; // Import Login
import './App.css'

// Small helper to hide Navigation on Login page
const Layout = ({ children }) => {
  const { currentUser } = useAuth();
  return (
    <div className="app-layout">
      {currentUser && <Navigation />} 
      <main className="main-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* ONLY ADMINS */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          {/* Teachers & Admins can see Teacher View */}
          <Route path="/teacher" element={
            <ProtectedRoute> 
              <TeacherView />
            </ProtectedRoute>
          } />
          <Route path="/receiver" element={
            <ProtectedRoute>
              <ReceiverView />
            </ProtectedRoute>
          } />
          {/* Callers & Admins can see Caller View */}
          <Route path="/caller" element={
            <ProtectedRoute>
              <CallerInterface />
            </ProtectedRoute>
          } />
          
          {/* Default redirect based on role? For now, just go to teacher */}
          <Route path="/" element={<Navigate to="/teacher" />} />
        </Routes>
      </Layout>
    </AuthProvider>
  );
}

export default App;