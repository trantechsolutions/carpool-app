// src/components/CarpoolSign.jsx
import React from 'react';
import QRCode from "react-qr-code";
// Make sure you imported the CSS from Step 1 in your main App file

export const CarpoolSign = React.forwardRef(({ studentList }, ref) => {
  // studentList accepts an array, allowing you to print 1 or 500 signs at once.
  return (
    <div ref={ref} className="print-only-container">
      {studentList.map((student) => (
        <div key={student.id} className="sign-page">
          
          {/* 1. The Big Number for Humans (20ft viewing distance) */}
          <h1 className="hero-number">
            {student.carpoolNumber}
          </h1>

          {/* 2. The QR Code for Scanners (2ft viewing distance) */}
          {/* We encode ONLY the number string for fastest scanning */}
          <div className="qr-container">
             <QRCode 
                value={String(student.carpoolNumber)} 
                size={256} /* Large enough for easy scanning */
                level={"H"} /* High error correction level */
             />
          </div>

          {/* 3. Verification Details (for after the car stops) */}
          <div className="student-details">
            <h2>{student.lastName} Family</h2>
            {/* If you use family numbers, list children here: */}
            <p>{student.childrenNames} ({student.grade})</p>
          </div>

           <div style={{marginTop: '20px', fontSize: '12pt'}}>
              St. Mary's Elementary Carpool 2025-2026
           </div>
        </div>
      ))}
    </div>
  );
});