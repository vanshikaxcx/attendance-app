const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());

// Dummy users (replace with DB if needed)
const USERS = [
  { username: 'user1', password: 'password1' },
  { username: 'user2', password: 'password2' },
  { username: 'user3', password: 'password3' },
  { username: 'user4', password: 'password4' },
  { username: 'user5', password: 'password5' }
];

const JWT_SECRET = 'secret'; // For demo only
const jwt = require('jsonwebtoken');

// Office location (example: Connaught Place, Delhi)
const OFFICE_LOCATION = { lat: 28.6315, lng: 77.2167 };
const MAX_DISTANCE_METERS = 1000; // 1km radius for geo-fencing

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

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = USERS.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

app.post('/log-attendance', (req, res) => {
  const { token, location, isWFH, isHoliday } = req.body;
  try {
    const payload = jwt.verify(token, JWT_SECRET);
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
      user: username,
      timestamp: now,
      location,
      isWFH,
      isHoliday
    };

    console.log('Attendance logged:', attendance);
    return res.json({ message: '✅ Attendance marked successfully' });

  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Example backend URL hosted on Render
const BASE_URL = "https://attendance-app-6bla.onrender.com";

// Login
fetch(`${BASE_URL}/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username, password }),
});

// Attendance
fetch(`${BASE_URL}/log-attendance`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ token, location, isWFH, isHoliday }),
});

const cors = require("cors");
app.use(cors());
