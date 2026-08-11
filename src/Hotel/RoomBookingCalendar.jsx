import React, { useEffect, useState, useCallback } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";

function RoomBookingCalendar({ roomId }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());

  const fetchBookings = useCallback(async () => {
    if (!roomId) return;
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/booking/room-bookings`, {
        params: { roomId },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setBookings(res.data.bookings);
      }
    } catch (err) {
      console.error("Calendar: failed to fetch room bookings", err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const buildDateSets = () => {
    const yellow = new Set();
    const red = new Set();

    bookings.forEach(({ startDate, endDate, status }) => {
      if (!startDate || !endDate) return;
      if (["cancelled", "rejected", "checkOut"].includes(status)) return;

      const start = new Date(startDate);
      const end = new Date(endDate);


      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      const current = new Date(start);

      while (current <= end) {
        const key = current.toDateString();
        if (status === "checkIn") {
          red.add(key);
        } else {
          yellow.add(key);
        }
        current.setDate(current.getDate() + 1);
      }
    });

    return { yellow, red };
  };

  const { yellow, red } = buildDateSets();

  const getDayClass = (date) => {
    const key = date.toDateString();
    if (red.has(key)) return "cal-day--checkin";
    if (yellow.has(key)) return "cal-day--booked";
    return "";
  };

  const legend = [
    { color: "#F59E0B", label: "Booked (pending / approved)" },
    { color: "#EF4444", label: "Checked In (occupied)" },
  ];

  return (
    <div className="room-calendar-wrapper">

      <div className="cal-header">
        <span className="cal-title">📅 Booking Calendar</span>
        {loading && <span className="cal-loading">Loading…</span>}
      </div>

      <div className="cal-legend">
        {legend.map(({ color, label }) => (
          <span key={label} className="cal-legend-item">
            <span className="cal-legend-dot" style={{ background: color }} />
            {label}
          </span>
        ))}
      </div>

      <DatePicker
        selected={viewDate}
        onChange={(date) => setViewDate(date)}
        inline
        dayClassName={getDayClass}
        calendarClassName="room-datepicker"
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
      />

      <div className="cal-summary">
        <span>
          <strong>{yellow.size}</strong> day(s) booked ahead
        </span>
        <span>
          <strong>{red.size}</strong> day(s) occupied now
        </span>
      </div>
    </div>
  );
}

export default RoomBookingCalendar;
