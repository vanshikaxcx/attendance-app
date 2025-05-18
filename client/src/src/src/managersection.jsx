import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function ManagerSection({ token }) {
  const [allAttendance, setAllAttendance] = useState([]);
  const [attendanceVisible, setAttendanceVisible] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all attendance records
  async function fetchAllAttendance() {
    setLoading(true);
    try {
      const res = await fetch('https://attendance-app-6bla.onrender.com/attendance-data', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.attendance)) {
        setAllAttendance(data.attendance);
        setAttendanceVisible(true);
      } else {
        setAllAttendance([]);
        setAttendanceVisible(true);
        alert('Failed to load attendance data');
      }
    } catch (error) {
      alert('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  }

  // Fetch leave requests
  async function fetchLeaveRequests() {
    try {
      const res = await fetch('https://attendance-app-6bla.onrender.com/leave-requests', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.requests)) {
        setLeaveRequests(data.requests);
      } else {
        setLeaveRequests([]);
      }
    } catch {
      setLeaveRequests([]);
    }
  }

  // Handle approving or rejecting leave requests
  async function handleLeave(id, approved) {
    try {
      const res = await fetch('https://attendance-app-6bla.onrender.com/handle-leave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, approved }),
      });
      const data = await res.json();
      alert(data.message);
      fetchLeaveRequests();
    } catch {
      alert('Failed to process leave request');
    }
  }

  // Load leave requests on component mount
  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        maxWidth: 700,
        margin: '20px auto',
        background: 'rgba(255,255,255,0.1)',
        padding: 20,
        borderRadius: 10,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        backdropFilter: 'blur(10px)',
        color: '#fff',
      }}
    >
      <h2>Welcome, Manager!</h2>

      <button
        onClick={fetchAllAttendance}
        disabled={loading}
        style={{
          width: '100%',
          padding: 12,
          marginBottom: 20,
          borderRadius: 6,
          backgroundColor: '#009688',
          border: 'none',
          fontWeight: 'bold',
          color: 'white',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Loading...' : '📊 View All Attendance Data'}
      </button>

      {attendanceVisible && (
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            color: '#fff',
            marginBottom: 30,
          }}
        >
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>User</th>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>Date</th>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>WFH</th>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>Holiday</th>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>Location</th>
            </tr>
          </thead>
          <tbody>
            {allAttendance.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 12 }}>
                  No attendance records found
                </td>
              </tr>
            ) : (
              allAttendance.map((record, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid #ccc', padding: 8 }}>
                    {record.username || 'N/A'}
                  </td>
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
      )}

      <h3>Leave Requests</h3>
      {leaveRequests.length === 0 ? (
        <p>No pending leave requests</p>
      ) : (
        <div
          style={{
            maxHeight: 300,
            overflowY: 'auto',
          }}
        >
          {leaveRequests.map((request) => (
            <div
              key={request.id}
              style={{
                background: 'rgba(0,0,0,0.3)',
                padding: 10,
                marginBottom: 10,
                borderRadius: 6,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <strong>{request.username}</strong> wants leave for: <br />
                <em>{request.reason}</em>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => handleLeave(request.id, true)}
                  style={{
                    backgroundColor: '#4caf50',
                    border: 'none',
                    borderRadius: 6,
                    color: 'white',
                    padding: '6px 12px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  Approve
                </button>
                <button
                  onClick={() => handleLeave(request.id, false)}
                  style={{
                    backgroundColor: '#f44336',
                    border: 'none',
                    borderRadius: 6,
                    color: 'white',
                    padding: '6px 12px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
