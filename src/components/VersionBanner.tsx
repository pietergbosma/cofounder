import React from 'react';

export function VersionBanner() {
  return (
    <div style={{
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      background: 'linear-gradient(90deg, #4f46e5, #7c3aed)',
      color: 'white',
      padding: '8px 20px',
      textAlign: 'center',
      fontSize: '12px',
      fontWeight: 'bold',
      zIndex: 9999,
      borderBottom: '2px solid #312e81'
    }}>
      🚀 SUPABASE INTEGRATION ACTIVE - Version 2.0 ({(new Date()).toLocaleDateString()})
    </div>
  );
}