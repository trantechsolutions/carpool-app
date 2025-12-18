// src/components/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";

export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ 
    uid: '', email: '', role: 'teacher', zones: [] 
  });
  const [isEditing, setIsEditing] = useState(false);

  // Hardcoded configuration for zones
  const availableZones = ["PreK-2", "3-4", "Bus Loop"];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const snap = await getDocs(collection(db, "users"));
    setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const handleSave = async () => {
    if (!formData.uid) return alert("User UID is required (copy from Firebase Console)");

    try {
      // Create/Update the user permission document
      await setDoc(doc(db, "users", formData.uid), {
        email: formData.email,
        role: formData.role,
        assignedZones: formData.zones
      });
      
      setFormData({ uid: '', email: '', role: 'teacher', zones: [] });
      setIsEditing(false);
      loadUsers();
      alert("User permissions saved successfully.");
    } catch (err) {
      console.error(err);
      alert("Error saving user.");
    }
  };

  const toggleZone = (zone) => {
    setFormData(prev => {
      const current = prev.zones || [];
      if (current.includes(zone)) {
        return { ...prev, zones: current.filter(z => z !== zone) };
      } else {
        return { ...prev, zones: [...current, zone] };
      }
    });
  };

  const handleEdit = (user) => {
    setFormData({
      uid: user.id,
      email: user.email,
      role: user.role,
      zones: user.assignedZones || []
    });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if(confirm("Are you sure? This removes their role/access permissions.")) {
      await deleteDoc(doc(db, "users", id));
      loadUsers();
    }
  };

  return (
    <div className="manage-view">
      <h3>User Access Control</h3>
      
      {/* --- FORM AREA --- */}
      <div className="card" style={{padding: '20px', marginBottom: '30px'}}>
        <h4 style={{marginTop: 0}}>{isEditing ? 'Edit Existing User' : 'Grant New Access'}</h4>
        
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px'}}>
          <div>
            <label style={{display:'block', fontSize:'0.8rem', fontWeight:'bold'}}>Firebase UID</label>
            <input 
              placeholder="Paste UID from Authentication Tab" 
              value={formData.uid}
              onChange={e => setFormData({...formData, uid: e.target.value})}
              disabled={isEditing} // Cannot change ID in edit mode
              style={{width: '100%', padding: '8px'}}
            />
          </div>
          <div>
             <label style={{display:'block', fontSize:'0.8rem', fontWeight:'bold'}}>Email (For Reference)</label>
             <input 
              placeholder="user@school.edu" 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              style={{width: '100%', padding: '8px'}}
            />
          </div>
        </div>

        <div style={{marginBottom: '15px'}}>
          <label style={{display:'block', fontSize:'0.8rem', fontWeight:'bold'}}>System Role</label>
          <select 
            value={formData.role} 
            onChange={e => setFormData({...formData, role: e.target.value})}
            style={{width: '100%', padding: '8px'}}
          >
            <option value="teacher">Teacher (Classroom View)</option>
            <option value="caller">Caller (Scanner/Input)</option>
            <option value="receiver">Receiver (Dispatcher)</option>
            <option value="admin">Admin (Full Access)</option>
          </select>
        </div>
        
        <div style={{background: '#f8f9fa', padding: '10px', borderRadius: '6px'}}>
          <label style={{display:'block', marginBottom:'8px', fontWeight:'bold'}}>Restricted Zones:</label>
          <div style={{display: 'flex', gap: '15px'}}>
            {availableZones.map(z => (
              <label key={z} style={{cursor: 'pointer', display: 'flex', alignItems: 'center'}}>
                <input 
                  type="checkbox" 
                  checked={formData.zones?.includes(z)}
                  onChange={() => toggleZone(z)}
                  style={{marginRight: '5px'}}
                /> {z}
              </label>
            ))}
          </div>
          <p style={{fontSize: '0.75rem', color: '#666', margin: '5px 0 0 0'}}>
            * Leave all unchecked to allow access to ALL zones (Admin/Superuser mode).
          </p>
        </div>

        <div style={{marginTop: '20px'}}>
          <button onClick={handleSave} className="btn-save-sm" style={{fontSize: '1rem', padding: '8px 16px'}}>
            {isEditing ? 'Update User' : 'Grant Permissions'}
          </button>
          {isEditing && (
            <button onClick={() => {setIsEditing(false); setFormData({uid:'', email:'', role:'teacher', zones:[]})}} className="btn-cancel-sm" style={{marginLeft: '10px'}}>
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* --- LIST AREA --- */}
      <table className="roster-table">
        <thead>
          <tr>
            <th>User / Email</th>
            <th>Role</th>
            <th>Allowed Zones</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>
                <div style={{fontWeight: 'bold'}}>{u.email}</div>
                <div style={{fontSize: '0.7rem', color: '#999', fontFamily: 'monospace'}}>{u.id}</div>
              </td>
              <td><span className="badge">{u.role}</span></td>
              <td>
                {(!u.assignedZones || u.assignedZones.length === 0) 
                  ? <span style={{color: '#999', fontStyle: 'italic'}}>All Zones</span> 
                  : u.assignedZones.join(", ")
                }
              </td>
              <td>
                <button onClick={() => handleEdit(u)} className="btn-icon">✏️</button>
                <button onClick={() => handleDelete(u.id)} className="btn-icon delete">🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};