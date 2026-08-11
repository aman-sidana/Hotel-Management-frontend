import React, { useEffect, useState } from "react";
import axios from "axios";


function StatCard({ icon, label, value, sub, color }) {
  const colors = {
    blue: "from-blue-500 to-blue-600 shadow-blue-500/25",
    emerald: "from-emerald-500 to-emerald-600 shadow-emerald-500/25",
    amber: "from-amber-500 to-amber-600 shadow-amber-500/25",
    violet: "from-violet-500 to-violet-600 shadow-violet-500/25",
    rose: "from-rose-500 to-rose-600 shadow-rose-500/25",
    sky: "from-sky-500 to-sky-600 shadow-sky-500/25",
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

function SuperAdminDashboardHome() {
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState([]);
  const [allHotels, setAllHotels] = useState([]);
  const [allBookings, setAllBookings] = useState([]);

  const [selectedAdminId, setSelectedAdminId] = useState("all");
  const [selectedHotelId, setSelectedHotelId] = useState("all");
  const [timeRange, setTimeRange] = useState("all");

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      const [adminsRes, hotelsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/admin/alladmin`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${import.meta.env.VITE_API_URL}/hotel/allhotels`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const adminData = adminsRes.data?.admins || adminsRes.data || [];
      const rawHotels = Array.isArray(hotelsRes.data) ? hotelsRes.data : hotelsRes.data?.hotels || [];
      const hotelData = rawHotels.filter(
        (h) => (h.status === "approved" || h.status === "Approved") && (h.isActive === true || h.isActive === undefined)
      );

      setAdmins(adminData);
      setAllHotels(hotelData);

      const bookingsArr = [];
      await Promise.all(
        hotelData.map(async (hotel) => {
          try {
            const bRes = await axios.get(`${import.meta.env.VITE_API_URL}/booking/hotel-bookings`, {
              params: { hotelId: hotel._id },
              headers: { Authorization: `Bearer ${token}` },
            });
            const bks = bRes.data?.bookings || [];
            bks.forEach((b) => {
              bookingsArr.push({
                ...b,
                _hotelName: hotel.hotelname,
                _adminId: hotel.adminId?._id?.toString() || hotel.adminId?.toString(),
                _adminName: hotel.adminId?.adminname || hotel.adminId?.name || "Unknown Admin"
              });
            });
          } catch (e) {
          }
        })
      );

      setAllBookings(bookingsArr);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedAdminId !== "all" && selectedHotelId !== "all") {
      const hotel = allHotels.find((h) => h._id === selectedHotelId);
      if (hotel && (hotel.adminId?._id?.toString() || hotel.adminId?.toString()) !== selectedAdminId) {
        setSelectedHotelId("all");
      }
    }
  }, [selectedAdminId]);

  const isWithinTimeRange = (bookingDateStr) => {
    if (timeRange === "all") return true;
    if (!bookingDateStr) return true;

    const bDate = new Date(bookingDateStr);
    if (isNaN(bDate.getTime())) return true;

    const now = new Date();
    const diffDays = (now.getTime() - bDate.getTime()) / (1000 * 3600 * 24);

    if (timeRange === "7days") return diffDays >= 0 && diffDays <= 7;
    if (timeRange === "1month") return diffDays >= 0 && diffDays <= 30;
    if (timeRange === "6months") return diffDays >= 0 && diffDays <= 180;
    if (timeRange === "1year") return diffDays >= 0 && diffDays <= 365;

    return true;
  };

  const filteredHotels = selectedAdminId === "all"
    ? allHotels
    : allHotels.filter((h) => (h.adminId?._id?.toString() || h.adminId?.toString()) === selectedAdminId);

  const filteredBookings = allBookings.filter((b) => {
    const matchAdmin = selectedAdminId === "all" || b._adminId === selectedAdminId;
    const matchHotel = selectedHotelId === "all" || (b.hotelId?._id || b.hotelId)?.toString() === selectedHotelId;
    const bookingDate = b.createdAt || b.bookingDate || b.checkInDate;
    const matchTime = isWithinTimeRange(bookingDate);
    return matchAdmin && matchHotel && matchTime;
  });

  const totalRevenue = filteredBookings
    .filter((b) => ["approved", "checkIn", "checkOut"].includes(b.status))
    .reduce((sum, b) => sum + (Number(b.price) || 0), 0);

  const superAdminIncome = totalRevenue * 0.07;

  const hotelStats = filteredHotels.map(h => {
    const hBookings = filteredBookings.filter(b => (b.hotelId?._id || b.hotelId)?.toString() === h._id.toString() && ["approved", "checkIn", "checkOut"].includes(b.status));
    const hRevenue = hBookings.reduce((sum, b) => sum + (Number(b.price) || 0), 0);
    const hIncome = hRevenue * 0.07;
    return {
      ...h,
      totalBookings: hBookings.length,
      revenue: hRevenue,
      income: hIncome,
      adminName: h.adminId?.adminname || h.adminId?.name || "Unknown Admin"
    };
  });

  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedAdminId, selectedHotelId, timeRange, itemsPerPage]);

  const totalPages = Math.ceil(hotelStats.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const displayedHotelStats = hotelStats.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) {
    return (
      <div className="management-module flex items-center justify-center py-32">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-400 dark:text-slate-500 text-sm">Loading system data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="management-module space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-sky-600 bg-clip-text text-transparent dark:from-white dark:to-sky-400">
            Super Admin Dashboard
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            System Overview & Revenue Tracking
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => {
              const token = localStorage.getItem("token");
              window.open(`${import.meta.env.VITE_API_URL}/hotel/download-pdf?status=approved&token=${token}`, "_blank");
            }}
            className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
          >
            📄 Download PDF
          </button>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="form-select min-w-[170px] text-sm font-semibold"
          >
            <option value="all">📅 All Time</option>
            <option value="7days">⚡ Last 7 Days</option>
            <option value="1month">📅 Last 1 Month</option>
            <option value="6months">📅 Last 6 Months</option>
            <option value="1year">📅 Last 1 Year</option>
          </select>

          <select
            value={selectedAdminId}
            onChange={(e) => setSelectedAdminId(e.target.value)}
            className="form-select min-w-[180px] text-sm font-semibold"
          >
            <option value="all">👤 All Admins</option>
            {admins.map((a) => (
              <option key={a._id} value={a._id}>{a.adminname || a.name || a.email}</option>
            ))}
          </select>

          <select
            value={selectedHotelId}
            onChange={(e) => setSelectedHotelId(e.target.value)}
            className="form-select min-w-[180px] text-sm font-semibold"
          >
            <option value="all">🏨 All Hotels</option>
            {filteredHotels.map((h) => (
              <option key={h._id} value={h._id}>{h.hotelname}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="👤"
          label="Admins"
          value={selectedAdminId === "all" ? admins.length : 1}
          color="blue"
        />
        <StatCard
          icon="🏨"
          label="Hotels"
          value={selectedHotelId === "all" ? filteredHotels.length : 1}
          color="violet"
        />
        <StatCard
          icon="💰"
          label="Gross Revenue"
          value={`₹${totalRevenue.toLocaleString("en-IN")}`}
          color="amber"
          sub="Total hotel earnings"
        />
        <StatCard
          icon="💎"
          label="Super Admin Income"
          value={`₹${superAdminIncome.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`}
          color="emerald"
          sub="7% Commission"
        />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden p-6">
        <div className="pb-4 flex items-center justify-between gap-4 flex-wrap border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-slate-800 dark:text-white">Revenue by Hotel</h3>
          <span className="text-xs text-slate-400">{hotelStats.length} hotels listed</span>
        </div>
        {hotelStats.length === 0 ? (
          <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-sm">No hotels found.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-700/50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="px-5 py-3 text-left">Hotel Name</th>
                    {selectedAdminId === "all" && <th className="px-5 py-3 text-left">Admin</th>}
                    <th className="px-5 py-3 text-left">City / State</th>
                    <th className="px-5 py-3 text-left">Bookings</th>
                    <th className="px-5 py-3 text-left">Hotel Revenue</th>
                    <th className="px-5 py-3 text-left font-bold text-emerald-600 dark:text-emerald-400">My Income (7%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {displayedHotelStats.map((h) => (
                    <tr key={h._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-slate-800 dark:text-slate-200">{h.hotelname}</td>
                      {selectedAdminId === "all" && <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{h.adminName}</td>}
                      <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{h.cityId?.cityName || "—"}, {h.stateId?.stateName || "—"}</td>
                      <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{h.totalBookings}</td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">₹{h.revenue.toLocaleString("en-IN")}</td>
                      <td className="px-5 py-3.5 font-bold text-emerald-600 dark:text-emerald-400">₹{h.income.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {hotelStats.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Showing <span className="font-bold">{indexOfFirstItem + 1}</span> to{" "}
                    <span className="font-bold">{Math.min(indexOfLastItem, hotelStats.length)}</span> of{" "}
                    <span className="font-bold">{hotelStats.length}</span> hotels
                  </p>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Show:</span>
                    <select
                      className="form-select text-xs py-1 px-2"
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="btn-action-secondary text-xs px-3 py-1 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ← Prev
                  </button>

                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 text-xs font-bold rounded-lg transition-colors ${currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "btn-action-secondary"
                        }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="btn-action-secondary text-xs px-3 py-1 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
}

export default SuperAdminDashboardHome;
