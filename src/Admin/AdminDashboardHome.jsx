import React, { useEffect, useState } from "react";
import axios from "axios";
import useSearching from "../custom hooks/useSearching"

function StarDisplay({ rating }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= Math.round(rating) ? "text-amber-400 text-base" : "text-slate-300 dark:text-slate-600 text-base"}>★</span>
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
        <p className="text-2xl font-extrabold text-slate-800 dark:text-white leading-none">{value ?? "—"}</p>
        {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function AdminDashboardHome() {
  const currentUser = JSON.parse(localStorage.getItem("currentuser") || "null");
  const [loading, setLoading] = useState(true);
  const [myHotels, setMyHotels] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [selectedHotelId, setSelectedHotelId] = useState("all");

  const [hotelRooms, setHotelRooms] = useState({});
  const [hotelReviews, setHotelReviews] = useState({});
  const [hotelAvgRating, setHotelAvgRating] = useState({});

  useEffect(() => {
    if (currentUser?.email) fetchAll();
  }, []);

  const getLoggedAdminId = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/alladmin`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const admins = res.data?.admins || res.data || [];
    return admins.find((a) => a.email?.toLowerCase() === currentUser.email?.toLowerCase())?._id?.toString() || null;
  };

  const fetchAll = async () => {
    try {
      setLoading(true);
      const adminId = await getLoggedAdminId();
      if (!adminId) { setLoading(false); return; }

      const token = localStorage.getItem("token");
      const [hotelsRes, roomsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/hotel/allhotels`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${import.meta.env.VITE_API_URL}/room/getallrooms`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const hotels = (hotelsRes.data || []).filter(
        (h) => h.adminId?._id?.toString() === adminId
      );
      setMyHotels(hotels);

      const allRooms = roomsRes.data || [];

      const bookingsArr = [];
      const roomsMap = {};
      const reviewsMap = {};
      const avgMap = {};

      await Promise.all(
        hotels.map(async (hotel) => {
          const hid = hotel._id;

          roomsMap[hid] = allRooms.filter(
            (r) => r.hotelId === hid || r.hotelId?._id === hid
          );

          const [bRes, rRes, avgRes] = await Promise.all([
            axios.get(`${import.meta.env.VITE_API_URL}/booking/hotel-bookings`, { params: { hotelId: hid }, headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`${import.meta.env.VITE_API_URL}/rating/view-rating`, { params: { hotelId: hid }, headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`${import.meta.env.VITE_API_URL}/rating/average-rating`, { params: { hotelId: hid }, headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: {} })),
          ]);

          const bks = bRes.data?.bookings || [];
          bks.forEach((b) => bookingsArr.push({ ...b, _hotelName: hotel.hotelname }));
          reviewsMap[hid] = rRes.data?.ratings || [];
          avgMap[hid] = { avg: avgRes.data?.averageRating || 0, count: avgRes.data?.totalReviews || 0 };
        })
      );

      setAllBookings(bookingsArr);
      setHotelRooms(roomsMap);
      setHotelReviews(reviewsMap);
      setHotelAvgRating(avgMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = selectedHotelId === "all"
    ? allBookings
    : allBookings.filter((b) => (b.hotelId?._id || b.hotelId)?.toString() === selectedHotelId);

  const selectedHotel = myHotels.find((h) => h._id === selectedHotelId);

  const totalRevenue = filteredBookings
    .filter((b) => ["approved", "checkIn", "checkOut"].includes(b.status))
    .reduce((s, b) => s + (Number(b.price) || 0), 0);

  const totalRooms = selectedHotelId === "all"
    ? Object.values(hotelRooms).flat().length
    : (hotelRooms[selectedHotelId] || []).length;

  const availableRooms = selectedHotelId === "all"
    ? Object.values(hotelRooms).flat().filter((r) => r.isAvailable && !r.isDeleted).length
    : (hotelRooms[selectedHotelId] || []).filter((r) => r.isAvailable && !r.isDeleted).length;

  const checkins = filteredBookings.filter((b) => b.status === "checkIn").length;

  const globalAvg = selectedHotelId === "all"
    ? (() => {
      const vals = Object.values(hotelAvgRating).filter((v) => v.count > 0);
      if (!vals.length) return { avg: 0, count: 0 };
      const totalCount = vals.reduce((s, v) => s + v.count, 0);
      const weightedSum = vals.reduce((s, v) => s + v.avg * v.count, 0);
      return { avg: weightedSum / totalCount, count: totalCount };
    })()
    : (hotelAvgRating[selectedHotelId] || { avg: 0, count: 0 });

  const reviews = selectedHotelId === "all"
    ? Object.values(hotelReviews).flat()
    : (hotelReviews[selectedHotelId] || []);

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

  return (
    <div className="management-module space-y-8">

      {/* Header + Hotel Picker */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent dark:from-white dark:to-sky-400">
            Dashboard
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {selectedHotelId === "all" ? `All Hotels (${myHotels.length})` : selectedHotel?.hotelname}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {globalAvg.count > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
              <StarDisplay rating={globalAvg.avg} />
              <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{globalAvg.avg.toFixed(1)}</span>
              <span className="text-xs text-slate-400">({globalAvg.count})</span>
            </div>
          )}
          <select
            value={selectedHotelId}
            onChange={(e) => setSelectedHotelId(e.target.value)}
            className="form-select min-w-[200px] text-sm font-semibold"
          >
            <option value="all">🏨 All Hotels</option>
            {myHotels.map((h) => (
              <option key={h._id} value={h._id}>{h.hotelname}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon="🏨" label="Total Hotels" value={selectedHotelId === "all" ? myHotels.length : 1} color="blue" />
        <StatCard icon="🛏️" label="Total Rooms" value={totalRooms} color="violet" sub={`${availableRooms} available`} />
        <StatCard icon="📅" label="Total Bookings" value={filteredBookings.length} color="amber" />
        <StatCard icon="🔑" label="Checked In" value={checkins} color="emerald" sub="currently staying" />
        <StatCard icon="💰" label="Revenue" value={`₹${totalRevenue.toLocaleString("en-IN")}`} color="rose" sub="approved + stayed" />
      </div>

      {/* Hotel Cards (all view) */}
      {selectedHotelId === "all" && myHotels.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
            <h3 className="font-bold text-slate-800 dark:text-white">My Hotels</h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {myHotels.map((h) => {
              const avg = hotelAvgRating[h._id];
              const rooms = hotelRooms[h._id] || [];
              return (
                <div key={h._id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedHotelId(h._id)}>
                  <div className="flex items-center gap-3">
                    {h.images?.[0]
                      ? <img src={h.images[0]} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" alt="" />
                      : <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-lg flex-shrink-0">🏨</div>
                    }
                    <div>
                      <p className="font-semibold text-sm text-slate-800 dark:text-white">{h.hotelname}</p>
                      <p className="text-xs text-slate-400">{h.cityId?.cityName || ""}, {h.stateId?.stateName || ""}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
                    <span>🛏️ {rooms.length} rooms</span>
                    {avg?.count > 0 && (
                      <span className="flex items-center gap-1 text-amber-500 font-bold">⭐ {avg.avg.toFixed(1)} ({avg.count})</span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full font-bold ${h.isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-700"}`}>
                      {h.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bookings Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 dark:text-white">Recent Bookings</h3>
          <span className="text-xs text-slate-400">{filteredBookings.length} total</span>
        </div>
        {filteredBookings.length === 0 ? (
          <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-sm">No bookings found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="px-5 py-3 text-left">Guest</th>
                  {selectedHotelId === "all" && <th className="px-5 py-3 text-left">Hotel</th>}
                  <th className="px-5 py-3 text-left">Room</th>
                  <th className="px-5 py-3 text-left">Check-In</th>
                  <th className="px-5 py-3 text-left">Check-Out</th>
                  <th className="px-5 py-3 text-left">Amount</th>
                  <th className="px-5 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredBookings.slice(0, 10).map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-800 dark:text-slate-200">{b.userId?.name || "Guest"}</td>
                    {selectedHotelId === "all" && <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 text-xs">{b._hotelName}</td>}
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">#{b.roomId?.roomNumber || "—"} · {b.roomId?.roomType || ""}</td>
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
            {filteredBookings.length > 10 && (
              <p className="text-center text-xs text-slate-400 py-3">Showing 10 of {filteredBookings.length}</p>
            )}
          </div>
        )}
      </div>

      {/* Reviews */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 dark:text-white">Guest Reviews</h3>
          {globalAvg.count > 0 && (
            <div className="flex items-center gap-2">
              <StarDisplay rating={globalAvg.avg} />
              <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{globalAvg.avg.toFixed(1)} / 5</span>
              <span className="text-xs text-slate-400">({globalAvg.count})</span>
            </div>
          )}
        </div>
        {reviews.length === 0 ? (
          <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-sm">No reviews yet.</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {reviews.slice(0, 6).map((r) => (
              <div key={r._id} className="px-6 py-4 flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-violet-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {(r.userId?.name || "G")[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{r.userId?.name || "Guest"}</span>
                    <span className="text-xs text-slate-400 flex-shrink-0">{formatDate(r.createdAt)}</span>
                  </div>
                  <StarDisplay rating={r.rating} />
                  {r.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2">"{r.description}"</p>
                  )}
                </div>
              </div>
            ))}
            {reviews.length > 6 && (
              <p className="text-center text-xs text-slate-400 py-3">Showing 6 of {reviews.length} reviews</p>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

export default AdminDashboardHome;
