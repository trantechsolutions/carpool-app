// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase'; 
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; 

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [assignedZones, setAssignedZones] = useState([]); // <--- NEW STATE
  const [loading, setLoading] = useState(true);

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch User Profile from Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);
        
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserRole(data.role);
          // Load zones or default to empty (which usually implies 'no restriction' or 'no access' depending on logic)
          // We will treat empty array as "No restrictions" for Admins, but "No Access" for others if we want strictness.
          // For now: Empty array = No restrictions (All Zones) is easier, OR explicit list.
          // Let's go with: If defined and not empty, restrict.
          setAssignedZones(data.assignedZones || []); 
        } else {
          // Fallback for un-mapped users
          setUserRole('teacher'); 
          setAssignedZones([]); 
        }
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        setUserRole(null);
        setAssignedZones([]);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    assignedZones, // <--- Exported for use in views
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};