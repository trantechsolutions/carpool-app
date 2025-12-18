// src/pages/ReceiverView.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // Import Auth
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { dismissStudent } from '../utils/firestore'; 
import './ReceiverView.css';

export const ReceiverView = () => {
  const [zone, setZone] = useState(""); 
  const [queue, setQueue] = useState([]);
  
  // RBAC Logic
  const { assignedZones } = useAuth();
  const allZones = ["PreK-2", "3-4", "Bus Loop"];
  const visibleZones = (assignedZones && assignedZones.length > 0) 
    ? allZones.filter(z => assignedZones.includes(z))
    : allZones;

  // Auto-select single zone
  useEffect(() => {
    if (visibleZones.length === 1 && !zone) {
      setZone(visibleZones[0]);
    } else if (!zone && visibleZones.length > 0) {
      setZone(visibleZones[0]); // Default to first available
    }
  }, [visibleZones, zone]);

  useEffect(() => {
    if (!zone) return;

    const q = query(
      collection(db, "students"),
      where("status", "==", "queued")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allQueued = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const myQueue = allQueued
        .filter(s => s.pickupZone === zone)
        .sort((a, b) => (a.timestampCalled?.seconds || 0) - (b.timestampCalled?.seconds || 0));

      setQueue(myQueue);
    });

    return unsubscribe;
  }, [zone]);

  return (
    <div className="receiver-container">
      <div className="receiver-header">
        <div>
          <h2 style={{margin: 0}}>📢 Receiver Dispatch</h2>
          <p style={{margin: 0, opacity: 0.8}}>Manage loading for {zone}</p>
        </div>
        <select 
          value={zone} 
          onChange={(e) => setZone(e.target.value)}
          className="zone-select"
        >
          {visibleZones.map(z => <option key={z} value={z}>{z}</option>)}
        </select>
      </div>

      <div className="queue-list">
        {queue.length === 0 ? (
          <div className="empty-queue">
            <h3>Queue Empty</h3>
            <p>Ready for calls...</p>
          </div>
        ) : (
          queue.map((student, index) => (
            <div key={student.id} className="queue-card active-card">
              <div className="queue-pos">
                <span className="label">Pos</span>
                {index + 1}
              </div>
              <div className="queue-info">
                <div className="q-number-large">#{student.carpoolNumber}</div>
                <div className="q-name-large">{student.fullName}</div>
                <div className="q-teacher">
                  {student.teacher} • <span style={{fontWeight: 'bold'}}>{student.grade}</span>
                </div>
              </div>
              <button 
                className="btn-receiver-dismiss"
                onClick={() => dismissStudent(student.id)}
              >
                ✅ LOADED
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};