// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser, userRole } = useAuth();

  // 1. Check if logged in
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // 2. Check Role (if a specific role is required)
  if (requiredRole && userRole !== requiredRole) {
    // If they are a teacher trying to access Admin, send them to Teacher view
    return <Navigate to="/teacher" />;
  }

  return children;
};