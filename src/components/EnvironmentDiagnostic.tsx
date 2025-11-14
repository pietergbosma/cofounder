import React from 'react';

// Environment Variables Diagnostic Component
export function EnvironmentDiagnostic() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  // Only show in development or if environment variables are missing
  if (supabaseUrl && supabaseKey) {
    return null; // Hide if everything looks good
  }
  
  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: '#ff4444',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      zIndex: 9999,
      maxWidth: '300px',
      fontSize: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
    }}>
      <strong>🔴 Environment Variables Missing!</strong>
      <div style={{ marginTop: '8px', lineHeight: '1.4' }}>
        <div>VITE_SUPABASE_URL: {supabaseUrl ? '✅ SET' : '❌ MISSING'}</div>
        <div>VITE_SUPABASE_ANON_KEY: {supabaseKey ? '✅ SET' : '❌ MISSING'}</div>
        <div>Build Mode: {import.meta.env.MODE}</div>
        <div>Production: {import.meta.env.PROD ? 'YES' : 'NO'}</div>
      </div>
      <button 
        onClick={() => document.querySelector('[data-env-diag]')?.remove()}
        style={{
          position: 'absolute',
          top: '5px',
          right: '5px',
          background: 'none',
          border: 'none',
          color: 'white',
          fontSize: '16px',
          cursor: 'pointer'
        }}
      >
        ×
      </button>
    </div>
  );
}

// Add this as global diagnostic in main.tsx or App.tsx
declare global {
  interface Window {
    checkEnvironment?: () => void;
  }
}

export function setupEnvironmentDiagnostic() {
  window.checkEnvironment = () => {
    console.log('=== ENVIRONMENT DIAGNOSTIC ===');
    console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? 'SET' : 'MISSING');
    console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'MISSING');
    console.log('Build Mode:', import.meta.env.MODE);
    console.log('Is Production:', import.meta.env.PROD);
    console.log('================================');
  };
  
  // Auto-run diagnostic
  window.checkEnvironment();
}