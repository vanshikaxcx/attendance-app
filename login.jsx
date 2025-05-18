import React, { useState } from 'react';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [loading, setLoading] = useState(false);

  async function login() {
    setLoading(true);
    try {
      const res = await fetch('https://attendance-app-6bla.onrender.com/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role }),
      });
      const data = await res.json();
      if (res.ok) {
        onLoginSuccess(data.token, role);
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (e) {
      alert('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      maxWidth: '400px',
      margin: '20px auto',
      background: 'rgba(255,255,255,0.1)',
      padding: '20px',
      borderRadius: '10px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      backdropFilter: 'blur(10px)',
    }}>
      <h2 style={{ color: '#e3f2fd', textAlign: 'center' }}>Login</h2>
      <input
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        style={{ width: '100%', padding: '12px', margin: '10px 0', borderRadius: '6px', border: '1px solid #ccc' }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ width: '100%', padding: '12px', margin: '10px 0', borderRadius: '6px', border: '1px solid #ccc' }}
      />
      <select
        value={role}
        onChange={e => setRole(e.target.value)}
        style={{ width: '100%', padding: '12px', margin: '10px 0', borderRadius: '6px', border: '1px solid #ccc' }}
      >
        <option value="employee">Employee</option>
        <option value="manager">Manager</option>
      </select>
      <button
        onClick={login}
        disabled={loading}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: '6px',
          backgroundColor: '#00bcd4',
          color: 'white',
          fontWeight: 'bold',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'background 0.3s',
          border: 'none',
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#0097a7'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#00bcd4'}
      >
        {loading ? 'Logging in...' : '🔐 Login'}
      </button>
    </div>
  );
}
