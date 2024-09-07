import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/SignUp';
import Dashboard from './components/Dashboard';

function App() {
  const [user, setUser] = useState(null); // Manages logged-in user state

  return (
    <Router>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <Routes>
          {/* If the user is logged in, redirect from login and signup to the dashboard */}
          <Route
            path="/login"
            element={user ? <Navigate to="/dashboard" replace /> : <Login setUser={setUser} />}
          />
          {/* Route to sign up */}
          <Route
            path="/signup"
            element={user ? <Navigate to="/dashboard" replace /> : <Signup setUser={setUser} />}
          />
          {/* Protect the dashboard route and redirect to login if not authenticated */}
          <Route
            path="/dashboard"
            element={user ? <Dashboard user={user} /> : 
            <Navigate to="/login" replace />}
          />
          {/* Default route to login page */}
          <Route
            path="/"
            element={<Navigate to="/login" replace />}
          />
          {/* Catch-all route to redirect to login for any undefined routes */}
          <Route
            path="*"
            element={<Navigate to="/login" replace />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
