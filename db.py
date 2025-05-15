import sqlite3
from datetime import datetime

conn = sqlite3.connect("attendance.db", check_same_thread=False)
c = conn.cursor()

def create_tables():
    c.execute('''CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        date TEXT,
        check_in TEXT,
        check_out TEXT,
        status TEXT,
        location TEXT,
        work_type TEXT
    )''')
    conn.commit()

def log_check_in(username, location, work_type):
    date = datetime.now().date().isoformat()
    time = datetime.now().time().strftime("%H:%M:%S")
    c.execute('''INSERT INTO attendance (username, date, check_in, status, location, work_type) 
                 VALUES (?, ?, ?, ?, ?, ?)''',
                 (username, date, time, 'Checked In', location, work_type))
    conn.commit()

def log_check_out(username):
    date = datetime.now().date().isoformat()
    time = datetime.now().time().strftime("%H:%M:%S")
    c.execute('''UPDATE attendance 
                 SET check_out = ?, status = ? 
                 WHERE username = ? AND date = ? AND status = 'Checked In' ''',
                 (time, 'Checked Out', username, date))
    conn.commit()

def get_attendance(username):
    c.execute("SELECT date, check_in, check_out, status, location, work_type FROM attendance WHERE username = ? ORDER BY date DESC", (username,))
    return c.fetchall()

create_tables()