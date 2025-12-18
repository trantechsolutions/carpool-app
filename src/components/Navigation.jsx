// src/components/Navigation.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import Auth
import './Navigation.css';

export const Navigation = () => {
  const location = useLocation();
  const { userRole, logout } = useAuth(); // Get role and logout

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  return (
    <nav className="navbar">
      <div className="nav-brand">🏫 School Carpool</div>
      <div className="nav-links">
        
        {/* Only show Admin link to Admins */}
        {userRole === 'admin' && (
          <Link to="/admin" className={isActive('/admin')}>Admin</Link>
        )}

        <Link to="/teacher" className={isActive('/teacher')}>Teacher</Link>
        <Link to="/receiver" className={isActive('/receiver')}>Receiver</Link>
        <Link to="/caller" className={isActive('/caller')}>Caller</Link>
        
        <button 
          onClick={logout} 
          style={{marginLeft: '10px', background: 'none', color: '#dc2626', border: '1px solid #dc2626', padding: '5px 10px'}}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};