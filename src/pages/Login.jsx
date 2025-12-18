// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Login.css';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, currentUser, userRole } = useAuth(); // Import user state
  const navigate = useNavigate();

  // --- NEW: Traffic Cop Logic ---
  // We watch 'currentUser' and 'userRole'. 
  // As soon as they update (after login), we navigate.
  useEffect(() => {
    if (currentUser && userRole) {
      // Direct traffic based on role
      if (userRole === 'admin') navigate('/admin');
      else if (userRole === 'caller') navigate('/caller');
      else if (userRole === 'receiver') navigate('/receiver');
      else navigate('/teacher');
    }
  }, [currentUser, userRole, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setIsSubmitting(true);
      await login(email, password);
      // REMOVED: navigate('/admin'); 
      // We do NOT navigate here anymore. We let the useEffect above handle it.
    } catch (err) {
      setError('Failed to log in. Check email/password.');
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>School Staff Login</h2>
        {error && <div className="error-msg">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button disabled={isSubmitting} type="submit" className="btn-login">
            {isSubmitting ? 'Verifying...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
};