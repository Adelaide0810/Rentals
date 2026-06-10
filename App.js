import React, { useState } from 'react';
import LoginPage from './pages/LoginPage';
import DentistPage from './pages/DentistPage';
import ReceptionistPage from './pages/ReceptionistPage';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const [allPatients, setAllPatients] = useState([
    { patientName: 'John Doe', procedure: 'Filling', dentistName: 'Dr. Smith', cost: 150, date: '2026-06-08' },
    // ... your initial data or empty array []
  ]);

  // Initialize state by checking localStorage first
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('username') || '';
  });
  
  const [role, setRole] = useState(() => {
    return localStorage.getItem('role') || '';
  });

  const handleLogin = (user, userRole) => {
    // Update React state
    setUsername(user);
    setRole(userRole);
    setIsLoggedIn(true);
    
    // Save to localStorage so it persists on refresh
    localStorage.setItem('username', user);
    localStorage.setItem('role', userRole);
    localStorage.setItem('isLoggedIn', 'true');
  };

  const handleLogout = () => {
    // Clear React state
    setIsLoggedIn(false);
    setUsername('');
    setRole('');
    
    // Remove from localStorage
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('isLoggedIn');
  };

  return (
    <>
      {!isLoggedIn ? (
        <LoginPage onLogin={handleLogin} />
      ) : role === 'dentist' ? (
        // 2. Pass the state and a function to update it to the pages
        <DentistPage 
            username={username} 
            onLogout={handleLogout} 
            allPatients={allPatients} 
            setAllPatients={setAllPatients} 
        />
      ) : role === 'receptionist' ? (
        <ReceptionistPage 
            username={username} 
            onLogout={handleLogout} 
            allPatients={allPatients} 
            setAllPatients={setAllPatients} 
        />
      ) : role === 'administrator' ? (
        // 3. Pass the state to the Admin Dashboard
        <AdminDashboard 
            username={username} 
            onLogout={handleLogout} 
            allPatients={allPatients} 
        />
      ) : (
      <LoginPage onLogin={handleLogin} />
    )}
  </>
);
}

export default App;