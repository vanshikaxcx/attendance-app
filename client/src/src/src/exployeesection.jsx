import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function EmployeeSection({ token }) {
  const [isWFH, setIsWFH] = useState(false);
  const [isHoliday, setIsHoliday] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [filterWFH, setFilterWFH] = useState('');
  const [filterHoliday, setFilterHoliday] = useState('');
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [leaveReason, setLeaveReason] = useState('');
  const [loading, setLoading] = useState(false);

  async function logAttendance() {
    if (!navigator.geolocation) {
      alert('Geolocation not supported');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const res = await fetch('https://attendance-app-6bla.onrender.com/log-attendance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ location, isWFH, isHoliday }),
        });
        const data = await res.json();
        alert(data.message);
      } catch {
        alert('Failed to log attendance');
      } finally {
        setLoading(false);
      }
    }, () => {
      alert('Error getting location');
      setLoading(false);
    });
  }

  async function fetchMyHistory() {
    try {
      const res = await fetch('https://attendance-app-6bla.onrender.com/my-attendance', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.attendance)) {
        let filtered = data.attendance;
        if (filterWFH) filtered = filtered.filter(r => r.isWFH === (filterWFH === 'yes'));
        if (filterHoliday) filtered = filtered.filter(r => r.isHoliday === (filterHoliday === 'yes'));
        setAttendanceHistory(filtered);
      } else {
        setAttendanceHistory([]);
      }
    } catch {
      setAttendanceHistory([]);
    }
  }

  useEffect(() => {
    if (historyVisible) fetchMyHistory();
  }, [historyVisible, filterWFH, filterHoliday]);

  async function applyLeave() {
    if (!leaveReason.trim()) {
      alert('Please enter a reason');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('https://attendance-app-6bla.onrender.com/apply-leave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: leaveReason }),
      });
      const data = await res.json();
      alert(data.message);
      if (res.ok) setLeaveReason('');
    } catch {
      alert('Failed to submit leave');
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        maxWidth: '600px',
        margin: '20px auto',
        background: 'rgba(255,255,255,0.1)',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        backdropFilter: 'blur(10px)',
        color: '#fff',
      }}
    >
      <h2>Welcome, Employee!</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
        <label>
          <input
            type="checkbox"
            checked={isWFH}
            onChange={() => setIsWFH(!isWFH)}
            style={{ marginRight: 5 }}
          />
          Work From Home
        </label>
        <label>
          <input
            type="checkbox"
            checked={isHoliday}
            onChange={() => setIsHoliday(!isHoliday)}
            style={{ marginLeft: 10, marginRight: 5 }}
          />
          Holiday
        </label>
      </div>

      <button
        onClick={logAttendance}
        disabled={loading}
        style={{
          width: '100%',
          padding: '12px',
          marginBottom: 15,
          borderRadius: 6,
          backgroundColor: '#00bcd4',
          border: 'none',
          fontWeight: 'bold',
          cursor: loading ? 'not-allowed' : 'pointer',
          color: 'white',
        }}
      >
        {loading ? 'Marking...' : '📍 Mark Attendance'}
      </button>

      <button
        onClick={() => setHistoryVisible(!historyVisible)}
        style={{
          width: '100%',
          padding: '12px',
          marginBottom: 15,
          borderRadius: 6,
          backgroundColor: '#007b8a',
          border: 'none',
          fontWeight: 'bold',
          color: 'white',
          cursor: 'pointer',
        }}
      >
        📋 {historyVisible ? 'Hide' : 'View'} My Attendance History
      </button>

      {historyVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          style={{ overflow: 'hidden' }}
        >
          <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            <select
              value={filterWFH}
              onChange={e => setFilterWFH(e.target.value)}
              style={{ flex: 1, padding: 8, borderRadius: 6 }}
            >
              <option value="">WFH Filter</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
            <select
              value={filterHoliday}
              onChange={e => setFilterHoliday(e.target.value)}
              style={{ flex: 1, padding: 8, borderRadius: 6 }}
            >
              <option value="">Holiday Filter</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ccc', padding: 8 }}>Date</th>
                <th style={{ border: '1px solid #ccc', padding: 8 }}>WFH</th>
                <th style={{ border: '1px solid #ccc', padding: 8 }}>Holiday</th>
                <th style={{ border: '1px solid #ccc', padding: 8 }}>Location</th>
              </tr>
            </thead>
            <tbody>
              {attendanceHistory.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: 12 }}>
                    No matching records
                  </td>
                </tr>
              ) : (
                attendanceHistory.map(record => (
                  <tr key={record.date}>
                    <td style={{ border: '1px solid #ccc', padding: 8 }}>
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td style={{ border: '1px solid #ccc', padding: 8 }}>
                      {record.isWFH ? 'Yes' : 'No'}
                    </td>
                    <td style={{ border: '1px solid #ccc', padding: 8 }}>
                      {record.isHoliday ? 'Yes' : 'No'}
                    </td>
                    <td style={{ border: '1px solid #ccc', padding: 8 }}>
                      {record.location
                        ? `(${record.location.lat.toFixed(3)}, ${record.location.lng.toFixed(3)})`
                        : 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </motion.div>
      )}

      <h3 style={{ marginTop: 20 }}>Apply for Leave</h3>
      <textarea
        value={leaveReason}
        onChange={e => setLeaveReason(e.target.value)}
        placeholder="Reason for leave..."
        rows={4}
        style={{ width: '100%', padding: 12, borderRadius: 6, border: '1px solid #ccc', resize: 'vertical' }}
      />
      <button
        onClick={applyLeave}
        disabled={loading}
        style={{
          width: '100%',
          padding: '12px',
          marginTop: 10,
          borderRadius: 6,
          backgroundColor: '#00bcd4',
          border: 'none',
          fontWeight: 'bold',
          cursor: loading ? 'not-allowed' : 'pointer',
          color: 'white',
        }}
      >
        {loading ? 'Submitting...' : '📨 Submit Leave Request'}
      </button>
    </motion.div>
  );
}
