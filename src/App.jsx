import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import Login from './Login';
import Signup from './SignUp';
import Dashboard from './Dashboard';

function App() {
  const [user, setUser] = useState(null);  // Manages logged-in user state

  return (
    <Router>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <Switch>
          {/* If the user is logged in, redirect from login and signup to the dashboard */}
          <Route path="/login">
            {user ? <Redirect to="/dashboard" /> : <Login setUser={setUser} />}
          </Route>
          <Route path="/signup">
            {user ? <Redirect to="/dashboard" /> : <Signup setUser={setUser} />}
          </Route>
          {/* Protect the dashboard route and redirect to login if not authenticated */}
          <Route path="/dashboard">
            {user ? <Dashboard user={user} /> : <Redirect to="/login" />}
          </Route>
          {/* Default route to login page */}
          <Route exact path="/">
            <Redirect to="/login" />
          </Route>
          {/* Catch-all route to redirect to login for any undefined routes */}
          <Route path="*">
            <Redirect to="/login" />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
