// src/pages/CallerInterface.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // Import Auth
import { callStudentByNumber } from '../utils/firestore';
import { QrScanner } from '../components/QrScanner';
import './CallerInterface.css';

export const CallerInterface = () => {
  const [mode, setMode] = useState('keypad'); 
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]); 
  const [statusMsg, setStatusMsg] = useState({ text: "Ready", type: "neutral" });
  const [selectedZone, setSelectedZone] = useState("");

  // RBAC LOGIC
  const { assignedZones } = useAuth(); // Get permissions
  const allZones = ["PreK-2", "3-4", "Bus Loop"];

  // Filter available zones based on user permissions
  // If assignedZones is empty (Superuser), show all. Otherwise, restrict.
  const visibleZones = (assignedZones && assignedZones.length > 0) 
    ? allZones.filter(z => assignedZones.includes(z))
    : allZones;

  // Auto-select if only 1 option available
  useEffect(() => {
    if (visibleZones.length === 1 && !selectedZone) {
      setSelectedZone(visibleZones[0]);
    }
  }, [visibleZones, selectedZone]);

  const handleSubmit = async (number) => {
    if (!number) return;
    if (!selectedZone) {
      setStatusMsg({ text: "⚠️ Select a Zone First!", type: "error" });
      return;
    }
    setStatusMsg({ text: `Calling ${number}...`, type: "pending" });
    try {
      const result = await callStudentByNumber(number, selectedZone);
      if (result.success) {
        setStatusMsg({ text: `✅ Called: ${result.names}`, type: "success" });
        setHistory(prev => [{ number, time: new Date().toLocaleTimeString(), names: result.names }, ...prev].slice(0, 5));
        setInput(''); 
      } else {
        setStatusMsg({ text: `❌ ${result.message}`, type: "error" });
      }
    } catch (error) {
      console.error(error);
      setStatusMsg({ text: "Error connecting to server", type: "error" });
    }
  };

  const handleKeypad = (num) => {
    if (num === 'C') setInput('');
    else if (num === 'Enter') handleSubmit(input);
    else setInput(prev => prev + num);
  };

  return (
    <div className="caller-container">
      {/* Zone Selector */}
      <div style={{ marginBottom: '20px', padding: '15px', background: '#fff', borderRadius: '8px', border: '1px solid #ddd' }}>
        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', color: '#2c3e50' }}>
          📍 My Location (Zone):
        </label>
        <select 
          value={selectedZone} 
          onChange={(e) => setSelectedZone(e.target.value)}
          style={{ width: '100%', padding: '12px', fontSize: '1.1rem', borderRadius: '6px' }}
        >
          <option value="">-- Select Where You Are Standing --</option>
          {visibleZones.map(z => <option key={z} value={z}>{z}</option>)}
        </select>
      </div>

      <div className="mode-toggle">
        <button className={mode === 'keypad' ? 'active' : ''} onClick={() => setMode('keypad')}>🔢 Keypad</button>
        <button className={mode === 'scan' ? 'active' : ''} onClick={() => setMode('scan')}>📷 Scanner</button>
      </div>

      <div className={`status-banner ${statusMsg.type}`}>{statusMsg.text}</div>

      <div className="input-area">
        {mode === 'scan' ? (
          <div className="scanner-wrapper">
            {selectedZone ? <QrScanner onScanSuccess={(val) => handleSubmit(val)} /> : <div style={{padding:'20px'}}>Select Zone first</div>}
          </div>
        ) : (
          <div className="keypad-wrapper">
            <div className="keypad-display">{input || "Enter #"}</div>
            <div className="keypad-grid">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => <button key={n} onClick={() => handleKeypad(n)}>{n}</button>)}
              <button className="btn-clear" onClick={() => handleKeypad('C')}>CLR</button>
              <button onClick={() => handleKeypad(0)}>0</button>
              <button className="btn-enter" onClick={() => handleKeypad('Enter')}>GO</button>
            </div>
          </div>
        )}
      </div>

      <div className="history-log">
        <h3>Recent Calls</h3>
        {history.map((item, idx) => (
          <div key={idx} className="history-item">
            <span className="hist-num">{item.number}</span><span className="hist-name">{item.names}</span>
          </div>
        ))}
      </div>
    </div>
  );
};