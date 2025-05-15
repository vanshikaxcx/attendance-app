import streamlit as st
from auth import authenticate
import db
from datetime import datetime, date

GEO_FENCE_CENTER = (37.7749, -122.4194)  # Example coordinates (San Francisco)
GEO_FENCE_RADIUS_KM = 10  # 10km radius

def distance(lat1, lon1, lat2, lon2):
    from math import radians, cos, sin, asin, sqrt
    # Haversine formula to calculate distance
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1)*cos(lat2)*sin(dlon/2)**2
    c = 2*asin(sqrt(a))
    r = 6371
    return c*r

def in_geofence(lat, lon):
    dist = distance(lat, lon, *GEO_FENCE_CENTER)
    return dist <= GEO_FENCE_RADIUS_KM

st.title("Primitive Attendance Logging Platform")

if 'logged_in' not in st.session_state:
    st.session_state.logged_in = False

if not st.session_state.logged_in:
    st.subheader("Login")
    username = st.text_input("Username")
    password = st.text_input("Password", type="password")
    if st.button("Login"):
        if authenticate(username, password):
            st.success(f"Welcome {username}")
            st.session_state.logged_in = True
            st.session_state.username = username
        else:
            st.error("Invalid username or password")
else:
    st.sidebar.write(f"Logged in as: {st.session_state.username}")
    if st.sidebar.button("Logout"):
        st.session_state.logged_in = False
        st.rerun()

    st.header("Attendance")

    today = date.today().isoformat()
    attendance_today = db.get_attendance(st.session_state.username)
    checked_in_today = any(rec[0] == today and rec[3] == "Checked In" for rec in attendance_today)

    st.write(f"**Today:** {today}")

    with st.form("attendance_form"):
        lat = st.number_input("Latitude", format="%.6f", value=37.7749)
        lon = st.number_input("Longitude", format="%.6f", value=-122.4194)
        work_type = st.selectbox("Work Type", ["Office", "WFH", "Holiday"])
        submit = st.form_submit_button("Submit")

        if submit:
            if work_type == "Holiday":
                st.info("Holiday working logged")
                db.log_check_in(st.session_state.username, "N/A", "Holiday")
            else:
                if in_geofence(lat, lon) or work_type == "WFH":
                    if not checked_in_today:
                        db.log_check_in(st.session_state.username, f"{lat},{lon}", work_type)
                        st.success(f"Checked in for {work_type}")
                    else:
                        db.log_check_out(st.session_state.username)
                        st.success("Checked out")
                else:
                    st.error("You are not in the permitted geo-fence area!")

    st.header("Attendance Records")
    records = db.get_attendance(st.session_state.username)
    for rec in records:
        st.write(f"Date: {rec[0]}, Check-in: {rec[1]}, Check-out: {rec[2]}, Status: {rec[3]}, Location: {rec[4]}, Work type: {rec[5]}")