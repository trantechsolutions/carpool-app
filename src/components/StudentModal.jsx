// src/components/StudentModal.jsx
import React, { useState } from 'react';
import { updateStudentTransport } from '../utils/firestore';
import './StudentModal.css'; // We'll style this momentarily

export const StudentModal = ({ student, onClose }) => {
  const [transport, setTransport] = useState(student.todaysTransport);
  const [zone, setZone] = useState(student.pickupZone || "Main"); // New State
  const [isPermanent, setIsPermanent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Available Zones (Ideally imported from a config file)
  const availableZones = ["PreK-2", "3-4", "Bus Loop", "Main"];

  const handleSave = async () => {
    setLoading(true);
    try {
      // Pass zone to the update function
      await updateStudentTransport(student.id, transport, isPermanent, zone);
      onClose();
    } catch (error) {
      alert("Error updating student");
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit: {student.fullName}</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          
          {/* --- NEW: Zone Editor --- */}
          <div style={{marginBottom: '20px'}}>
             <label style={{display:'block', fontWeight:'bold', marginBottom:'5px'}}>Pickup Zone:</label>
             <select 
               value={zone} 
               onChange={(e) => setZone(e.target.value)}
               style={{width: '100%', padding: '10px', fontSize: '1rem'}}
             >
                {availableZones.map(z => <option key={z} value={z}>{z}</option>)}
             </select>
          </div>

          <label><strong>Today's Transportation:</strong></label>
          <div className="transport-options">
             {/* ... existing transport buttons ... */}
             {['carpool', 'bus', 'walkoff', 'aftercare'].map(opt => (
                <button 
                  key={opt}
                  className={`option-btn ${transport === opt ? 'selected' : ''}`}
                  onClick={() => setTransport(opt)}
                >
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </button>
              ))}
          </div>
          {/* ... rest of the modal ... */}
        </div>
        
        <div className="modal-footer">
          <button onClick={onClose} className="btn-cancel">Cancel</button>
          <button onClick={handleSave} className="btn-save">{loading ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </div>
    </div>
  );
};