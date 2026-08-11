import React, { useEffect, useState } from "react";
import axios from "axios";

function StarDisplay({ rating }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= Math.round(rating) ? "text-amber-400" : "text-slate-300 dark:text-slate-600"}>
          ★
        </span>
      ))}
    </span>
  );
}

function StatCard({ icon, label, value, sub, color }) {
  const colors = {
    blue: "from-blue-500 to-blue-600 shadow-blue-500/25",
    emerald: "from-emerald-500 to-emerald-600 shadow-emerald-500/25",
    amber: "from-amber-500 to-amber-600 shadow-amber-500/25",
    violet: "from-violet-500 to-violet-600 shadow-violet-500/25",
    rose: "from-rose-500 to-rose-600 shadow-rose-500/25",
  };
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm flex items-center gap-4">
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors[color]} shadow-lg flex items-center justify-center text-2xl flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">{label}</p>
        <p className="text-3xl font-extrabold text-slate-800 dark:text-white leading-none">{value ?? "—"}</p>
        {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function HotelDashboardHome() {
  const currentUser = JSON.parse(localStorage.getItem("currentuser") || "null");

  const [loading, setLoading] = useState(true);
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState({ avg: 0, count: 0 });

  useEffect(() => {
    if (!currentUser?.email) { setLoading(false); return; }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const hotelsRes = await axios.get(`${import.meta.env.VITE_API_URL}/hotel/allhotels`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const myHotel = (hotelsRes.data || []).find(
        (h) => h.hotelemail?.toLowerCase() === currentUser.email.toLowerCase()
      );
      if (!myHotel) { setLoading(false); return; }
      setHotel(myHotel);

      const [roomsRes, bookingsRes, ratingsRes, avgRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/room/getallrooms`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${import.meta.env.VITE_API_URL}/booking/hotel-bookings`, { params: { hotelId: myHotel._id }, headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${import.meta.env.VITE_API_URL}/rating/view-rating`, { params: { hotelId: myHotel._id }, headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${import.meta.env.VITE_API_URL}/rating/average-rating`, { params: { hotelId: myHotel._id }, headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: {} })),
      ]);

      const allRooms = roomsRes.data || [];
      const ownRooms = allRooms.filter(
        (r) => r.hotelId === myHotel._id || r.hotelId?._id === myHotel._id
      );
      setRooms(ownRooms);
      setBookings(bookingsRes.data?.bookings || []);
      setReviews(ratingsRes.data?.ratings || []);
      setAvgRating({
        avg: avgRes.data?.averageRating || 0,
        count: avgRes.data?.totalReviews || 0,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalRooms = rooms.length;
  const availableRooms = rooms.filter((r) => r.isAvailable && !r.isDeleted).length;
  const totalBookings = bookings.length;
  const checkins = bookings.filter((b) => b.status === "checkIn").length;
  const revenue = bookings
    .filter((b) => ["checkIn", "checkOut", "approved"].includes(b.status))
    .reduce((sum, b) => sum + (Number(b.price) || 0), 0);

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  const statusBadge = (status) => {
    const base = "px-2.5 py-0.5 rounded-full text-xs font-bold capitalize";
    const map = {
      pending: `${base} bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400`,
      approved: `${base} bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400`,
      checkIn: `${base} bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400`,
      checkOut: `${base} bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400`,
      rejected: `${base} bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400`,
      cancelled: `${base} bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400`,
    };
    return map[status] || base;
  };

  if (loading) {
    return (
      <div className="management-module flex items-center justify-center py-32">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-400 dark:text-slate-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="management-module text-center py-32">
        <div className="text-5xl mb-4">🏨</div>
        <p className="text-slate-500 dark:text-slate-400">No hotel found for your account.</p>
      </div>
    );
  }

  return (
    <div className="management-module space-y-8">

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent dark:from-white dark:to-sky-400">
            Dashboard
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{hotel.hotelname} — Overview</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => {
              const token = localStorage.getItem("token");
              window.open(`${import.meta.env.VITE_API_URL}/booking/download-pdf?adminId=${currentUser?._id}&token=${token}`, "_blank");
            }}
            className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            📄 Download PDF
          </button>
          {avgRating.count > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
              <StarDisplay rating={avgRating.avg} />
              <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                {avgRating.avg.toFixed(1)}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                ({avgRating.count} {avgRating.count === 1 ? "review" : "reviews"})
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon="🛏️" label="Total Rooms" value={totalRooms} color="blue" />
        <StatCard icon="✅" label="Available" value={availableRooms} color="emerald" sub={`${totalRooms - availableRooms} occupied`} />
        <StatCard icon="📅" label="Total Bookings" value={totalBookings} color="violet" />
        <StatCard icon="🔑" label="Checked In" value={checkins} color="amber" sub="currently staying" />
        <StatCard icon="💰" label="Revenue" value={`₹${revenue.toLocaleString("en-IN")}`} color="rose" sub="approved + stayed" />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 dark:text-white">Recent Bookings</h3>
          <span className="text-xs text-slate-400 dark:text-slate-500">{totalBookings} total</span>
        </div>
        {bookings.length === 0 ? (
          <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-sm">No bookings yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="px-5 py-3 text-left">Guest</th>
                  <th className="px-5 py-3 text-left">Room</th>
                  <th className="px-5 py-3 text-left">Check-In</th>
                  <th className="px-5 py-3 text-left">Check-Out</th>
                  <th className="px-5 py-3 text-left">Amount</th>
                  <th className="px-5 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {bookings.slice(0, 8).map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-800 dark:text-slate-200">
                      {b.userId?.name || "Guest"}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                      #{b.roomId?.roomNumber || "—"} · {b.roomId?.roomType || ""}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{formatDate(b.startDate)}</td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{formatDate(b.endDate)}</td>
                    <td className="px-5 py-3.5 font-bold text-emerald-600 dark:text-emerald-400">₹{b.price}</td>
                    <td className="px-5 py-3.5">
                      <span className={statusBadge(b.status)}>
                        {b.status === "checkIn" ? "Checked In" : b.status === "checkOut" ? "Checked Out" : b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {bookings.length > 8 && (
              <p className="text-center text-xs text-slate-400 dark:text-slate-500 py-3">
                Showing 8 of {bookings.length} — see Booking Management for full list
              </p>
            )}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 dark:text-white">Guest Reviews</h3>
          {avgRating.count > 0 && (
            <div className="flex items-center gap-2">
              <StarDisplay rating={avgRating.avg} />
              <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                {avgRating.avg.toFixed(1)} / 5
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                ({avgRating.count} reviews)
              </span>
            </div>
          )}
        </div>
        {reviews.length === 0 ? (
          <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-sm">No reviews yet.</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {reviews.slice(0, 6).map((r) => (
              <div key={r._id} className="px-6 py-4 flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-violet-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {(r.userId?.name || "G")[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                      {r.userId?.name || "Guest"}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 flex-shrink-0">
                      {formatDate(r.createdAt)}
                    </span>
                  </div>
                  <StarDisplay rating={r.rating} />
                  {r.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2">
                      "{r.description}"
                    </p>
                  )}
                </div>
              </div>
            ))}
            {reviews.length > 6 && (
              <p className="text-center text-xs text-slate-400 dark:text-slate-500 py-3">
                Showing 6 of {reviews.length} reviews
              </p>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

export default HotelDashboardHome;
