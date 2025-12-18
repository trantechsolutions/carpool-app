// src/pages/TeacherView.jsx
import React, { useState, useEffect } from 'react';
import { subscribeToClassroom } from '../utils/firestore'; // Removed dismissStudent import
import { StudentModal } from '../components/StudentModal';
import './TeacherView.css';

export const TeacherView = () => {
  const [students, setStudents] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [editingStudent, setEditingStudent] = useState(null);

  // Ideally fetched from DB
  const availableTeachers = ["Mrs. Krabappel", "Ms. Honey", "Mr. Feeny", "Unassigned"]; 

  useEffect(() => {
    if (!selectedTeacher) return;
    const unsubscribe = subscribeToClassroom(selectedTeacher, (data) => {
      setStudents(data);
    });
    return () => unsubscribe();
  }, [selectedTeacher]);

  const sortedStudents = [...students].sort((a, b) => {
    const score = (status) => {
      if (status === 'queued') return 3;
      if (status === 'waiting') return 2;
      return 1;
    };
    if (score(b.status) !== score(a.status)) return score(b.status) - score(a.status);
    return a.fullName.localeCompare(b.fullName);
  });

  return (
    <div className="teacher-container">
      <div className="classroom-header">
        <div>
          <h2 style={{margin: 0}}>Classroom Dashboard</h2>
          <p style={{margin: 0, color: '#666'}}>Monitor pickups and manage transport exceptions.</p>
        </div>
        <select 
          value={selectedTeacher} 
          onChange={(e) => setSelectedTeacher(e.target.value)}
          className="teacher-select"
        >
          <option value="">-- Select Your Name --</option>
          {availableTeachers.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {!selectedTeacher ? (
        <div className="empty-state" style={{textAlign: 'center', padding: '50px', color: '#999'}}>
          <h3>Please select a classroom above.</h3>
        </div>
      ) : (
        <div className="student-grid">
          {sortedStudents.map(student => (
            <div 
              key={student.id} 
              // Card still highlights green if 'queued', but no dismiss button
              className={`student-card ${student.status} ${student.isOverrideActive ? 'override' : ''}`}
              onClick={() => setEditingStudent(student)} 
              title="Click to edit transport"
            >
              <div className="card-top">
                <span className="student-num">#{student.carpoolNumber}</span>
                <span className="transport-badge">{student.todaysTransport}</span>
              </div>
              
              <h3>{student.fullName}</h3>
              
              <div className="status-indicator">
                {student.status === 'queued' ? (
                  <span style={{color: '#16a34a', fontWeight: 'bold'}}>
                    🟢 CALLED - SEND OUT
                  </span>
                ) : (
                  <span>Status: {student.status.toUpperCase()}</span>
                )}
              </div>
              
              {/* NO DISMISS BUTTON HERE ANYMORE */}
              
              {student.status === 'dismissed' && <div className="dismissed-msg">Student has left.</div>}
            </div>
          ))}
        </div>
      )}

      {editingStudent && (
        <StudentModal 
          student={editingStudent} 
          onClose={() => setEditingStudent(null)} 
        />
      )}
    </div>
  );
};