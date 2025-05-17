const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// Sample users (should be stored securely in a database in production)
const users = [
  { id: 1, username: 'user1', password: 'password1' },
  { id: 2, username: 'user2', password: 'password2' },
  { id: 3, username: 'user3', password: 'password3' },
  { id: 4, username: 'user4', password: 'password4' },
  { id: 5, username: 'user5', password: 'password5' }
];

// Sample holiday work flag
const holidayWork = ['user1', 'user3'];

const SECRET_KEY = 'your_secret_key';

// Authentication
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '1h' });
    return res.json({ token });
  }

  return res.status(401).json({ message: 'Invalid credentials' });
});

// Attendance log with geo-location
app.post('/log-attendance', (req, res) => {
  const { token, location, isWFH } = req.body;
  const decoded = jwt.verify(token, SECRET_KEY);

  if (!decoded) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  const user = users[decoded.id - 1];  // Assuming user IDs start from 1

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Basic geo-fencing logic (example)
  const isInOffice = location.lat > 40 && location.lng < -75; // Simulated office location

  if (isInOffice || isWFH) {
    // Log attendance
    return res.json({ message: 'Attendance logged successfully', user: user.username });
  }

  return res.status(400).json({ message: 'Location not within allowed geofenced area' });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

app.get("/api", (req, res) => {
  res.send("API is working!");
});
