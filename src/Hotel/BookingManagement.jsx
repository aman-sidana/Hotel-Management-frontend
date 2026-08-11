import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { gsap } from "gsap";

function BookingManagement() {
  const [bookings, setBookings] = useState([]);
  const [myHotel, setMyHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const listRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem("currentuser") || "null");

  const fetchBookings = async () => {
    if (!currentUser?.email) { setLoading(false); return; }
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const hotelsRes = await axios.get(`${import.meta.env.VITE_API_URL}/hotel/allhotels`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allHotels = hotelsRes.data || [];

      const myHotel = allHotels.find(
        (h) => h.hotelemail?.toLowerCase() === currentUser.email.toLowerCase()
      );

      if (!myHotel) { setBookings([]); setLoading(false); return; }

      setMyHotel(myHotel);

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/booking/hotel-bookings`,
        {
          params: { hotelId: myHotel._id },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) { setBookings(response.data.bookings); }
    } catch (error) {
      console.log(error); setBookings([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, [currentUser?.email]);

  useEffect(() => {
    if (loading || !listRef.current?.children.length) return;
    const ctx = gsap.context(() => {
      gsap.from(listRef.current.children, {
        opacity: 0,
        y: 20,
        duration: 0.4,
        stagger: 0.05,
        ease: "power2.out",
        clearProps: "all",
      });
    }, listRef);
    return () => ctx.revert();
  }, [loading, bookings.length, activeTab]);

  const updateLocalStatus = (id, newStatus) => {
    setBookings((prev) => prev.map((b) => (b._id === id ? { ...b, status: newStatus } : b)));
  };

  const handleApprove = async (id) => {
    try {
      setActionLoadingId(id);
      const token = localStorage.getItem("token");
      const response = await axios.patch(`${import.meta.env.VITE_API_URL}/booking/approve`, null, {
        params: { id },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) updateLocalStatus(id, "approved");
    } catch (error) {
      console.log(error); alert(error.response?.data?.message || "Failed to approve booking");
    } finally { setActionLoadingId(null); }
  };

  const handleReject = async (id) => {

    try {
      setActionLoadingId(id);
      const token = localStorage.getItem("token");
      const response = await axios.patch(`${import.meta.env.VITE_API_URL}/booking/reject`, null, {
        params: { id },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) updateLocalStatus(id, "rejected");
    } catch (error) {
      console.log(error); alert(error.response?.data?.message || "Failed to reject booking");
    } finally { setActionLoadingId(null); }
  };

  const handleCheckIn = async (id) => {
    try {
      setActionLoadingId(id);
      const token = localStorage.getItem("token");
      const response = await axios.patch(`${import.meta.env.VITE_API_URL}/booking/checkin`, null, {
        params: { id },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) updateLocalStatus(id, "checkIn");
    } catch (error) {
      console.log(error); alert(error.response?.data?.message || "Failed to check in");
    } finally { setActionLoadingId(null); }
  };

  const handleCheckOut = async (id) => {
    try {
      setActionLoadingId(id);
      const token = localStorage.getItem("token");
      const response = await axios.patch(`${import.meta.env.VITE_API_URL}/booking/checkout`, null, {
        params: { id },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) updateLocalStatus(id, "checkOut");
    } catch (error) {
      console.log(error); alert(error.response?.data?.message || "Failed to check out");
    } finally { setActionLoadingId(null); }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const statusBadgeClass = (status) => {
    const base = "inline-block px-2.5 py-1 rounded-full text-xs font-bold capitalize";
    switch (status) {
      case "pending": return `${base} bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400`;
      case "approved": return `${base} bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400`;
      case "checkIn": return `${base} bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400`;
      case "checkOut": return `${base} bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400`;
      case "rejected":
      case "cancelled": return `${base} bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400`;
      default: return `${base} bg-slate-100 text-slate-500`;
    }
  };

  const tabs = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "checkIn", label: "Checked In" },
    { key: "checkOut", label: "Checked Out" },
    { key: "rejected", label: "Rejected" },
  ];

  const filteredBookings = activeTab === "all" ? bookings : bookings.filter((b) => b.status === activeTab);

  if (!currentUser) {
    return (
      <div className="text-center py-16 text-slate-400 dark:text-slate-500">
        <p>Please login as a hotel manager to view bookings.</p>
      </div>
    );
  }

  return (
    <div className="management-module">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent dark:from-white dark:to-sky-400">
            Booking Management
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {myHotel?.hotelname || "Manage reservations"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const token = localStorage.getItem("token");
              window.open(`${import.meta.env.VITE_API_URL}/booking/download-pdf?adminId=${currentUser?._id}&status=${activeTab}&token=${token}`, "_blank");
            }}
            className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            📄 Download PDF
          </button>
          <span className="px-3 py-1.5 rounded-full text-sm font-semibold text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-700">
            {filteredBookings.length} booking(s)
          </span>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap mb-5 border-b border-slate-200 dark:border-slate-700 pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === tab.key ? "bg-blue-600 text-white" : "btn-action-secondary"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500">Loading bookings...</div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-16 rounded-xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500">
          No bookings found for this filter.
        </div>
      ) : (
        <div className="flex flex-col gap-4" ref={listRef}>
          {filteredBookings.map((booking) => (
            <div
              key={booking._id}
              className="rounded-2xl border p-5 transition-all duration-200
                bg-white dark:bg-slate-800
                border-slate-200 dark:border-slate-700
                shadow-sm hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <h3 className="font-bold text-base text-slate-800 dark:text-white">
                  {booking.userId?.name || "Guest"}
                </h3>
                <span className={statusBadgeClass(booking.status)}>
                  {booking.status === "checkIn" ? "Checked In" : booking.status === "checkOut" ? "Checked Out" : booking.status}
                </span>
              </div>

              <div className="rounded-xl p-4 mb-4 bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700">
                <p className="text-sm font-bold text-sky-600 dark:text-sky-400 mb-3">
                  Room #{booking.roomId?.roomNumber || "N/A"} · {booking.roomId?.roomType || "Standard"}
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <span className="block text-xs text-slate-400 dark:text-slate-500 mb-1">Check In</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{formatDate(booking.startDate)}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-400 dark:text-slate-500 mb-1">Check Out</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{formatDate(booking.endDate)}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-400 dark:text-slate-500 mb-1">Amount</span>
                    <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">₹{booking.price}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end flex-wrap">
                {booking.status === "pending" && (
                  <>
                    <button className="btn-action-success" disabled={actionLoadingId === booking._id} onClick={() => handleApprove(booking._id)}>Approve</button>
                    <button className="btn-action-danger" disabled={actionLoadingId === booking._id} onClick={() => handleReject(booking._id)}>Reject</button>
                  </>
                )}
                {booking.status === "approved" && (
                  <button className="btn-action-primary" disabled={actionLoadingId === booking._id} onClick={() => handleCheckIn(booking._id)}>Check In</button>
                )}
                {booking.status === "checkIn" && (
                  <button className="btn-action-secondary" disabled={actionLoadingId === booking._id} onClick={() => handleCheckOut(booking._id)}>Check Out</button>
                )}
                {["checkOut", "rejected", "cancelled"].includes(booking.status) && (
                  <span className="text-sm text-slate-400 dark:text-slate-500 italic">No actions available</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BookingManagement;