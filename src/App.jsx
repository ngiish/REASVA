import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/SignUp';
import Dashboard from './components/Dashboard';
import NavBar from './components/NavBar'; // Import NavBar

function App() {
  const [user, setUser] = useState(() => {
    // Retrieve user from localStorage if available
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Effect to save user state in localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user)); // Save user to localStorage
    } else {
      localStorage.removeItem('user'); // Remove user from localStorage if logged out
    }
  }, [user]);

  return (
    <Router>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        {/* Include NavBar component, passing user and setUser as props */}
        {user && <NavBar user={user} setUser={setUser} />}
        
        <Routes>
          {/* Redirect from login and signup to dashboard if user is logged in */}
          <Route
            path="/login"
            element={user ? <Navigate to="/dashboard" replace /> : <Login setUser={setUser} />}
          />
          <Route
            path="/signup"
            element={user ? <Navigate to="/dashboard" replace /> : <Signup setUser={setUser} />}
          />
          {/* Protect the dashboard route and redirect to login if not authenticated */}
          <Route
            path="/dashboard"
            element={user ? <Dashboard user={user} /> : <Navigate to="/login" replace />}
          />
          {/* Default route to login page */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          {/* Catch-all route to redirect to login for any undefined routes */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
