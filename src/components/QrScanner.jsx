// src/components/QrScanner.jsx
import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export const QrScanner = ({ onScanSuccess, onScanError }) => {
  const scannerRef = useRef(null);

  useEffect(() => {
    // Initialize the scanner
    const scanner = new Html5QrcodeScanner(
      "reader", 
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => {
        // Pause briefly to prevent rapid-fire double scans
        scanner.pause(true);
        onScanSuccess(decodedText);
        setTimeout(() => scanner.resume(), 2000); 
      }, 
      (error) => {
        if (onScanError) onScanError(error);
      }
    );

    // Cleanup when component unmounts
    return () => {
      scanner.clear().catch(error => console.error("Failed to clear scanner", error));
    };
  }, []);

  return <div id="reader" style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}></div>;
};