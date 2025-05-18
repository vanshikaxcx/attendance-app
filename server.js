const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

const JWT_SECRET = 'secret'; // For demo only. Use env vars in production.

// Dummy users
const USERS = [
  { username: 'user1', password: 'password1', role: 'employee' },
  { username: 'user2', password: 'password2', role: 'employee' },
  { username: 'user3', password: 'password3', role: 'employee' },
  { username: 'user4', password: 'password4', role: 'employee' },
  { username: 'user5', password: 'password5', role: 'employee' },
  { username: 'manager1', password: 'managerpass', role: 'manager' }
];

// Geo-fencing setup
const OFFICE_LOCATION = { lat: 28.6315, lng: 77.2167 }; // Delhi
const MAX_DISTANCE_METERS = 1000;

// In-memory data
const ATTENDANCE_LOG = [];
const LEAVE_REQUESTS = [];

// Utility: calculate distance (Haversine formula)
function getDistance(lat1, lon1, lat2, lon2) {
  const toRad = x => (x * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Route: Login
app.post('/login', (req, res) => {
  const { username, password, role } = req.body;
  const user = USERS.find(u => u.username === username && u.password === password && u.role === role);

  if (!user) return res.status(401).json({ message: 'Invalid credentials or role' });

  const token = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// Middleware: verify token and attach user
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'Authorization header missing' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token missing' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(401).json({ message: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// Route: Log attendance
app.post('/log-attendance', (req, res) => {
  const { token, location, isWFH, isHoliday } = req.body;

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.role !== 'employee') {
      return res.status(403).json({ message: 'Only employees can mark attendance' });
    }

    const username = payload.username;

    if (!isWFH) {
      const distance = getDistance(location.lat, location.lng, OFFICE_LOCATION.lat, OFFICE_LOCATION.lng);
      if (distance > MAX_DISTANCE_METERS) {
        return res.status(400).json({ message: 'Outside geo-fence. Enable WFH if remote.' });
      }
    }

    const now = new Date();
    const attendance = {
      username,
      date: now.toISOString(),
      location,
      isWFH,
      isHoliday
    };

    ATTENDANCE_LOG.push(attendance);
    console.log('✅ Attendance logged:', attendance);
    res.json({ message: '✅ Attendance marked successfully' });

  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
});

// Route: Manager view - all attendance
app.get('/attendance-data', authenticateToken, (req, res) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Access denied. Manager only.' });
  }

  res.json({ attendance: ATTENDANCE_LOG });
});

// Route: Employee view - personal attendance
app.get('/my-attendance', authenticateToken, (req, res) => {
  if (req.user.role !== 'employee') {
    return res.status(403).json({ message: 'Access denied. Employee only.' });
  }

  const userAttendance = ATTENDANCE_LOG.filter(log => log.username === req.user.username);
  res.json({ attendance: userAttendance });
});

// Route: Apply for leave
app.post('/apply-leave', authenticateToken, (req, res) => {
  if (req.user.role !== 'employee') {
    return res.status(403).json({ message: 'Only employees can apply for leave' });
  }

  const { fromDate, toDate, reason } = req.body;
  const leave = {
    id: LEAVE_REQUESTS.length + 1,
    username: req.user.username,
    fromDate,
    toDate,
    reason,
    status: 'pending'
  };
  LEAVE_REQUESTS.push(leave);
  res.json({ message: 'Leave request submitted', leave });
});

// Route: Manager - view leave requests
app.get('/leave-requests', authenticateToken, (req, res) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Only managers can view leave requests' });
  }

  res.json({ requests: LEAVE_REQUESTS });
});

// Route: Manager - update leave status
app.post('/leave-decision', authenticateToken, (req, res) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Only managers can update leave status' });
  }

  const { id, status } = req.body;
  const leave = LEAVE_REQUESTS.find(l => l.id === id);
  if (!leave) return res.status(404).json({ message: 'Leave request not found' });

  leave.status = status;
  res.json({ message: `Leave request ${status}`, leave });
});

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Server running at: http://localhost:${PORT}`);
});