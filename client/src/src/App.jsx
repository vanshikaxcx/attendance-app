import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Login from './components/Login';
import EmployeeSection from './components/EmployeeSection';
import ManagerSection from './components/ManagerSection';


export default function App() {
  const [token, setToken] = useState('');
  const [role, setRole] = useState(null);

  function onLoginSuccess(token, role) {
    setToken(token);
    setRole(role);
  }

  return (
    <div style={{
      fontFamily: "'Segoe UI', sans-serif",
      background: 'linear-gradient(to right, #0f2027, #203a43, #2c5364)',
      color: '#fff',
      minHeight: '100vh',
      padding: '40px',
    }}>
      <h1 style={{ textAlign: 'center', color: '#e3f2fd' }}>Smart Attendance System</h1>

      <AnimatePresence>
        {!token && (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Login onLoginSuccess={onLoginSuccess} />
          </motion.div>
        )}

        {token && role === 'employee' && (
          <motion.div
            key="employee"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <EmployeeSection token={token} />
          </motion.div>
        )}

        {token && role === 'manager' && (
          <motion.div
            key="manager"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ManagerSection token={token} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
