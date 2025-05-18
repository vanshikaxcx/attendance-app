import React, { useState } from 'react';
import { motion } from 'framer-motion';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [showEmployee, setShowEmployee] = useState(false);
  const [showManager, setShowManager] = useState(false);

  const login = async () => {
    const res = await fetch('https://attendance-app-6bla.onrender.com/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role })
    });
    const data = await res.json();
    if (res.ok) {
      setToken(data.token);
      setMessage('Login successful!');
      if (role === 'employee') {
        setShowEmployee(true);
        setShowManager(false);
      } else {
        setShowManager(true);
        setShowEmployee(false);
      }
    } else {
      setMessage(data.message || 'Login failed');
    }
  };

  return (
    <div style={{
      fontFamily: "'Segoe UI', sans-serif",
      background: 'linear-gradient(to right, #0f2027, #203a43, #2c5364)',
      color: 'white',
      minHeight: '100vh',
      padding: 40,
      maxWidth: 800,
      margin: 'auto',
      textAlign: 'center'
    }}>
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Smart Attendance System
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          padding: 20,
          borderRadius: 10,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          marginTop: 30
        }}
      >
        <h2>Login</h2>
        <input
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          style={{ padding: 12, margin: '10px 0', width: '100%', borderRadius: 6, border: '1px solid #ccc', fontSize: 16 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ padding: 12, margin: '10px 0', width: '100%', borderRadius: 6, border: '1px solid #ccc', fontSize: 16 }}
        />
        <select
          value={role}
          onChange={e => setRole(e.target.value)}
          style={{ padding: 12, margin: '10px 0', width: '100%', borderRadius: 6, border: '1px solid #ccc', fontSize: 16 }}
        >
          <option value="employee">Employee</option>
          <option value="manager">Manager</option>
        </select>
        <button
          onClick={login}
          style={{
            backgroundColor: '#00bcd4',
            color: 'white',
            fontWeight: 'bold',
            padding: 12,
            width: '100%',
            borderRadius: 6,
            cursor: 'pointer',
            border: 'none',
            marginTop: 10
          }}
          whileHover={{ backgroundColor: '#0097a7' }}
        >
          🔐 Login
        </button>
        {message && <p style={{ marginTop: 15 }}>{message}</p>}
      </motion.div>

      {showEmployee && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ marginTop: 40 }}
        >
          <h2>Welcome, Employee!</h2>
          {/* You can continue migrating your employee UI here */}
        </motion.div>
      )}

      {showManager && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ marginTop: 40 }}
        >
          <h2>Welcome, Manager!</h2>
          {/* You can continue migrating your manager UI here */}
        </motion.div>
      )}
    </div>
  );
}

export default App;
