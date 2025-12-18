// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { 
  uploadRosterToFirestore, 
  getAllStudents, 
  updateStudentProfile, 
  deleteStudent,
  resetDailyStatus 
} from '../utils/firestore';
import { useReactToPrint } from 'react-to-print';
import { CarpoolSign } from '../components/CarpoolSign'; 
import { UserManagement } from '../components/UserManagement';
import './AdminDashboard.css'; // We will create this

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('manage'); // 'upload' or 'manage'
  
  // Upload State
  const [csvData, setCsvData] = useState([]);
  const [uploading, setUploading] = useState(false);
  
  // Management State
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null); // ID of student being edited
  const [editFormData, setEditFormData] = useState({});

  // Print Ref
  const componentRef = React.useRef();
  const handlePrint = useReactToPrint({
    contentRef: componentRef, // Pass the ref object directly here
    documentTitle: "Carpool Signs",
  });

  // --- EFFECT: Load students when entering Manage tab ---
  useEffect(() => {
    if (activeTab === 'manage') {
      loadStudents();
    }
  }, [activeTab]);

  const loadStudents = async () => {
    const data = await getAllStudents();
    // Sort by Name alphabetically
    setStudents(data.sort((a,b) => a.fullName.localeCompare(b.fullName)));
  };

  // --- Handlers ---

  const handleEditClick = (student) => {
    setEditingId(student.id);
    setEditFormData(student); // Pre-fill form
  };

  const handleSaveEdit = async () => {
    try {
      await updateStudentProfile(editingId, editFormData);
      setEditingId(null);
      loadStudents(); // Refresh list
    } catch (e) {
      alert("Error updating student");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to PERMANENTLY delete this student?")) {
      await deleteStudent(id);
      loadStudents();
    }
  };

  const handleDailyReset = async () => {
    if (confirm("Reset ALL students to 'Waiting' and Default Transport?")) {
      await resetDailyStatus();
      alert("New day started!");
    }
  };

  // Filter Logic
  const filteredStudents = students.filter(s => 
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.carpoolNumber.includes(searchTerm)
  );

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Admin Dashboard</h2>
        <div className="header-actions">
           <button onClick={handleDailyReset} className="btn-danger">🔄 Start New Day</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button className={activeTab === 'manage' ? 'active' : ''} onClick={() => setActiveTab('manage')}>Manage Roster</button>
        <button className={activeTab === 'upload' ? 'active' : ''} onClick={() => setActiveTab('upload')}>Bulk Upload</button>
        <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>Manage Users</button>
      </div>

      {/* --- TAB 1: MANAGE ROSTER --- */}
      {activeTab === 'manage' && (
        <div className="manage-view">
          
          <div className="toolbar">
            <input 
              type="text" 
              placeholder="Search by Name or Number..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="search-box"
            />
            <button onClick={handlePrint} className="btn-secondary">🖨️ Print Visible Signs</button>
          </div>

          <div className="roster-table-wrapper">
            <table className="roster-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Grade</th>
                  <th>Teacher</th>
                  <th>Zone</th>
                  <th>Transport</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => (
                  <tr key={student.id}>
                    {editingId === student.id ? (
                      // --- EDIT MODE ---
                      <>
                        <td><input value={editFormData.carpoolNumber} onChange={e=>setEditFormData({...editFormData, carpoolNumber: e.target.value})} style={{width: '50px'}}/></td>
                        <td><input value={editFormData.fullName} onChange={e=>setEditFormData({...editFormData, fullName: e.target.value})} /></td>
                        <td><input value={editFormData.grade} onChange={e=>setEditFormData({...editFormData, grade: e.target.value})} style={{width: '50px'}}/></td>
                        <td><input value={editFormData.teacher} onChange={e=>setEditFormData({...editFormData, teacher: e.target.value})} /></td>
                        <td>
                          <select value={editFormData.pickupZone} onChange={e=>setEditFormData({...editFormData, pickupZone: e.target.value})}>
                            <option value="PreK-2">PreK-2</option>
                            <option value="3-4">3-4</option>
                            <option value="Bus Loop">Bus Loop</option>
                          </select>
                        </td>
                        <td>
                           <select value={editFormData.defaultTransport} onChange={e=>setEditFormData({...editFormData, defaultTransport: e.target.value})}>
                            <option value="carpool">Carpool</option>
                            <option value="bus">Bus</option>
                            <option value="walkoff">Walkoff</option>
                            <option value="aftercare">Aftercare</option>
                          </select>
                        </td>
                        <td>
                          <button onClick={handleSaveEdit} className="btn-save-sm">Save</button>
                          <button onClick={() => setEditingId(null)} className="btn-cancel-sm">Cancel</button>
                        </td>
                      </>
                    ) : (
                      // --- VIEW MODE ---
                      <>
                        <td className="fw-bold">{student.carpoolNumber}</td>
                        <td>{student.fullName}</td>
                        <td>{student.grade}</td>
                        <td>{student.teacher}</td>
                        <td><span className="badge">{student.pickupZone}</span></td>
                        <td>{student.defaultTransport}</td>
                        <td>
                          <button onClick={() => handleEditClick(student)} className="btn-icon">✏️</button>
                          <button onClick={() => handleDelete(student.id)} className="btn-icon delete">🗑️</button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            
          </div>
            
        </div>
      )}

      {/* --- TAB 2: BULK UPLOAD (Existing Logic) --- */}
      {activeTab === 'upload' && (
        <div className="upload-view">
           {/* ... Paste your existing Upload UI code here ... */}
           {/* ... (The File Input, Preview Table, Upload Button) ... */}
           <div className="card">
              <h3>Upload Class Roster</h3>
              <p>CSV Format: Student Name, Carpool Number, Grade, Teacher, Transport, Zone</p>
              <input type="file" accept=".csv" onChange={(e) => {
                 // Reuse your existing CSV parse logic here
                 const file = e.target.files[0];
                 Papa.parse(file, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                       const mapped = results.data.map(row => ({
                          fullName: row['Student Name'],
                          carpoolNumber: row['Carpool Number'] || row['Number'],
                          grade: row['Grade'],
                          teacher: row['Teacher'],
                          transportMethod: row['Transport'],
                          pickupZone: row['Zone']
                       })).filter(s => s.carpoolNumber);
                       setCsvData(mapped);
                    }
                 });
              }} />
              
              {/* Preview & Save Button */}
              {csvData.length > 0 && (
                <div style={{marginTop: '20px'}}>
                   <p>Loaded {csvData.length} rows.</p>
                   <button onClick={async () => {
                      setUploading(true);
                      await uploadRosterToFirestore(csvData);
                      setUploading(false);
                      setCsvData([]);
                      alert("Uploaded!");
                   }}>Confirm Upload</button>
                </div>
              )}
           </div>
        </div>
      )}

      {/* --- TAB 3: USER MANAGEMENT (NEW) --- */}
      {activeTab === 'users' && (
        <UserManagement /> 
      )}
                <CarpoolSign ref={componentRef} studentList={filteredStudents} />

    </div>
    
  );
};