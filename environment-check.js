// Check if environment variables are loading correctly
export function checkEnvironment() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  console.log('Environment Check:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey,
    url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'MISSING',
    keyLength: supabaseKey ? supabaseKey.length : 0,
    production: import.meta.env.PROD,
    mode: import.meta.env.MODE
  });
  
  // Show on page if running in development
  if (import.meta.env.DEV) {
    document.body.innerHTML += `
      <div style="position: fixed; top: 10px; right: 10px; background: #333; color: white; padding: 10px; z-index: 9999; font-size: 12px;">
        <strong>Environment Check:</strong><br/>
        VITE_SUPABASE_URL: ${supabaseUrl ? '✓ SET' : '❌ MISSING'}<br/>
        VITE_SUPABASE_ANON_KEY: ${supabaseKey ? '✓ SET' : '❌ MISSING'}<br/>
        Build Mode: ${import.meta.env.MODE}<br/>
        <button onclick="this.parentElement.remove()">×</button>
      </div>
    `;
  }
}

// Call on page load
checkEnvironment();