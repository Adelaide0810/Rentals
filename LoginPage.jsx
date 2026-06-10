import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config'; // Import the centralized backend URL configuration

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Sync background and base styling with global app layout context
  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.backgroundColor = "#070b14";
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      // Prepend API_BASE_URL to dynamic route to ensure Netlify hits InfinityFree
      const response = await fetch(`${API_BASE_URL}/login.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      // 1. Get the raw text first
      const textResponse = await response.text();
      
      // 2. Check if the response starts with HTML (meaning an error or challenge)
      if (textResponse.trim().startsWith('<')) {
        console.error("Server returned HTML:", textResponse);
        setErrorMessage("Server communication error. Please try again.");
        return;
      }

      // 3. If it's not HTML, parse as JSON
      const result = JSON.parse(textResponse);

      if (result.success) {
        onLogin(result.username, result.role);
      } else {
        setErrorMessage(result.message || 'Invalid username or password.');
      }
    } catch (error) {
      setErrorMessage('System link failed. Check console for details.');
    }
  };

  // Upgraded Modern UI Aesthetics Design Tokens - Expanded Configuration
  const styles = {
    wrapper: { 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      width: '100vw', 
      height: '100vh', 
      backgroundColor: '#070b14', 
      color: '#f8fafc', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
      overflowX: 'hidden'
    },
    card: { 
      padding: 'clamp(24px, 5vw, 60px)',
      backgroundColor: '#0f172a', 
      borderRadius: '20px',
      border: '1px solid rgba(255, 255, 255, 0.05)', 
      width: 'clamp(300px, 90vw, 700px)',
      boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)',
      boxSizing: 'border-box'
    },
    headerGroup: { 
      textAlign: 'center', 
      marginBottom: '40px'
    },
    titleMain: { 
      margin: '0 0 12px 0', 
      fontSize: 'clamp(28px, 6vw, 38px)',
      fontWeight: '600', 
      letterSpacing: '-0.8px' 
    },
    subtitle: { 
      margin: 0, 
      fontSize: 'clamp(16px, 4vw, 20px)',
      color: '#94a3b8',
      lineHeight: '1.5'
    },
    form: { 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '26px'
    },
    inputGroup: { 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '10px' 
    },
    label: { 
      fontSize: 'clamp(14px, 3vw, 19px)',
      color: '#94a3b8', 
      fontWeight: '500',
      letterSpacing: '0.3px'
    },
    input: { 
      width: '100%',
      padding: 'clamp(12px, 2vw, 14px) clamp(14px, 3vw, 18px)',
      borderRadius: '10px', 
      border: '1px solid rgba(255, 255, 255, 0.08)', 
      backgroundColor: '#070b14', 
      color: '#fff', 
      outline: 'none', 
      fontSize: 'clamp(14px, 3vw, 18px)',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box'
    },
    errorBox: { 
      color: '#ef4444', 
      fontSize: 'clamp(12px, 2vw, 14px)', 
      textAlign: 'center', 
      backgroundColor: 'rgba(239, 68, 68, 0.08)', 
      padding: 'clamp(10px, 2vw, 14px) clamp(12px, 2vw, 16px)', 
      borderRadius: '10px', 
      border: '1px solid rgba(239, 68, 68, 0.2)',
      lineHeight: '1.5'
    },
    submitBtn: { 
      padding: 'clamp(12px, 2vw, 16px)',
      borderRadius: '10px', 
      backgroundColor: '#2563eb', 
      color: '#fff', 
      border: 'none', 
      cursor: 'pointer', 
      fontWeight: '600', 
      fontSize: 'clamp(14px, 3vw, 18px)', 
      marginTop: '10px', 
      boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
      transition: 'background-color 0.15s ease' 
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        
        <div style={styles.headerGroup}>
          <h2 style={styles.titleMain}>Care Dental Portal</h2>
          <p style={styles.subtitle}>Please sign in to access your dashboard</p>
        </div>

        <form onSubmit={handleFormSubmit} style={styles.form}>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              placeholder=""
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder=""
              required
            />
          </div>

          {errorMessage && (
            <div style={styles.errorBox}>
              ⚠️ {errorMessage}
            </div>
          )}

          <button 
            type="submit" 
            style={styles.submitBtn}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
          >
            Verify Credentials
          </button>
          
        </form>
      </div>
    </div>
  );
};

export default LoginPage;