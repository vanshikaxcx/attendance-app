const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'secret'; // For demo only

// Dummy users with roles (employee or manager)
const USERS = [
  { username: 'user1', password: 'password1', role: 'employee' },
  { username: 'user2', password: 'password2', role: 'employee' },
  { username: 'manager1', password: 'managerpass', role: 'manager' }
];

// Office location for geo-fencing
const OFFICE_LOCATION = { lat: 28.6315, lng: 77.2167 };
const MAX_DISTANCE_METERS = 1000; // 1km radius

// In-memory attendance storage (replace with DB for production)
const ATTENDANCE_LOG = [];

function getDistance(lat1, lon1, lat2, lon2) {
  const toRad = (x) => x * Math.PI / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Login route - issues JWT with role info
app.post('/login', (req, res) => {
  const { username, password, role } = req.body;
  const user = USERS.find(u => u.username === username && u.password === password && u.role === role);
  if (!user) return res.status(401).json({ message: 'Invalid credentials or role' });

  const token = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// Attendance logging route
app.post('/log-attendance', (req, res) => {
  const { token, location, isWFH, isHoliday } = req.body;
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.role !== 'employee') {
      return res.status(403).json({ message: 'Only employees can mark attendance' });
    }
    const username = payload.username;

    if (!isWFH) {
      const distance = getDistance(
        location.lat, location.lng,
        OFFICE_LOCATION.lat, OFFICE_LOCATION.lng
      );
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
    console.log('Attendance logged:', attendance);
    res.json({ message: '✅ Attendance marked successfully' });

  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
});

// Middleware to verify token and extract user info
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

// Manager route to get attendance data
app.get('/attendance-data', authenticateToken, (req, res) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Access denied. Manager only.' });
  }
  res.json({ attendance: ATTENDANCE_LOG });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// New route for employees to view their own attendance history
app.get('/my-attendance', authenticateToken, (req, res) => {
  if (req.user.role !== 'employee') {
    return res.status(403).json({ message: 'Access denied. Employee only.' });
  }

  const userLogs = ATTENDANCE_LOG.filter(log => log.username === req.user.username);
  res.json({ attendance: userLogs });
});

async function fetchMyHistory() {
  if (!token) {
    alert('Please log in first.');
    return;
  }

  const res = await fetch('https://attendance-app-6bla.onrender.com/my-attendance', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const data = await res.json();
  const table = document.getElementById('myHistoryTable');
  const tbody = table.querySelector('tbody');
  tbody.innerHTML = '';

  if (res.ok && Array.isArray(data.attendance)) {
    data.attendance.forEach(record => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${new Date(record.date).toLocaleDateString()}</td>
        <td>${record.isWFH ? 'Yes' : 'No'}</td>
        <td>${record.isHoliday ? 'Yes' : 'No'}</td>
        <td>${record.location ? `(${record.location.lat.toFixed(3)}, ${record.location.lng.toFixed(3)})` : 'N/A'}</td>
      `;
      tbody.appendChild(tr);
    });
    table.style.display = 'table';
  } else {
    tbody.innerHTML = `<tr><td colspan="4">No records found or error fetching data.</td></tr>`;
    table.style.display = 'table';
  }
}
