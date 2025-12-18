// src/components/CarpoolSign.jsx
import React from 'react';
import QRCode from "react-qr-code";

export const CarpoolSign = React.forwardRef(({ studentList }, ref) => {
  
  // --- 1. GROUPING LOGIC ---
  // We turn the flat list of students into "Families" based on Carpool Number
  const families = studentList.reduce((acc, student) => {
    const number = student.carpoolNumber;
    if (!acc[number]) {
      acc[number] = [];
    }
    acc[number].push(student);
    return acc;
  }, {});

  // Sort families by number for printing order
  const sortedNumbers = Object.keys(families).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  // --- 2. HELPER: FIND YOUNGEST ZONE ---
  // Map grades to a numeric value to find the "minimum" (youngest)
  const gradeRank = {
    "PK": 0, "PK3": 0, "PK4": 0, "PreK": 0,
    "K": 1, "KG": 1,
    "1st": 2, "1": 2,
    "2nd": 3, "2": 3,
    "3rd": 4, "3": 4,
    "4th": 5, "4": 5,
    "5th": 6, "5": 6,
    "6th": 7, "6": 7,
    "7th": 8, "7": 8
  };

  const getPrimaryZone = (students) => {
    // Sort kids by grade rank (ascending)
    const sortedKids = [...students].sort((a, b) => {
      const rankA = gradeRank[a.grade] !== undefined ? gradeRank[a.grade] : 99;
      const rankB = gradeRank[b.grade] !== undefined ? gradeRank[b.grade] : 99;
      return rankA - rankB;
    });
    // Return the zone of the youngest child
    return sortedKids[0].pickupZone;
  };

  return (
    <div ref={ref} className="print-only-container">
      {sortedNumbers.map((number) => {
        const siblings = families[number];
        const primaryZone = getPrimaryZone(siblings);

        return (
          // ONE PAGE PER FAMILY
          <div key={number} className="sign-page">
            
            {/* 1. Big Number */}
            <h1 className="hero-number">{number}</h1>
            
            {/* 2. QR Code */}
            <div className="qr-container">
               <QRCode 
                 value={String(number)} 
                 size={250} 
                 level={"H"} 
               />
            </div>

            {/* 3. List of Names */}
            <div className="student-details">
              {siblings.map((child, idx) => (
                <div key={child.id} className="sibling-row" style={{marginBottom: '15px'}}>
                  <h2>{child.fullName}</h2>
                  <p>
                     {child.grade} • {child.teacher}
                  </p>
                </div>
              ))}
              
              {/* 4. Zone Indicator (Primary) */}
              <div className="zone-footer">
                 Pickup Zone: <strong>{primaryZone}</strong>
              </div>
            </div>
            
          </div>
        );
      })}
    </div>
  );
});