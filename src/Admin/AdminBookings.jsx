import { useEffect, useState } from "react";
import axios from "axios";

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const currentUser = JSON.parse(localStorage.getItem("currentuser") || "null");

  useEffect(() => {
    if (currentUser?.email || currentUser?._id) {
      getBookings();
    } else {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage]);

  const getBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/booking/all-bookings`, {
        params: {
          adminId: currentUser._id || "",
          page: currentPage,
          limit: itemsPerPage,
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      setBookings(res.data.bookings || []);
      setTotalBookings(res.data.totalBookings || (res.data.bookings ? res.data.bookings.length : 0));
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.log("Error fetching admin bookings:", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value, 10);
    setItemsPerPage(newLimit);
    setCurrentPage(1);
  };

  const statusClass = (status) => {
    switch (status) {
      case "pending": return "status-badge pending";
      case "approved": return "status-badge approved";
      case "checkIn": return "status-badge checkin";
      case "checkOut": return "status-badge checkout";
      case "rejected": return "status-badge rejected";
      case "cancelled": return "status-badge cancelled";
      default: return "status-badge";
    }
  };

  const startRecordIndex = totalBookings === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endRecordIndex = Math.min(currentPage * itemsPerPage, totalBookings);

  return (
    <div className="management-module">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent dark:from-white dark:to-sky-400 mb-0">
            All Hotel Bookings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Total Bookings: <span className="font-bold text-slate-700 dark:text-slate-200">{totalBookings}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Show per page:
          </label>
          <select
            value={itemsPerPage}
            onChange={handleLimitChange}
            className="form-select text-xs py-1.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-slate-400 dark:text-slate-500 text-sm font-semibold">
          Loading bookings...
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500 font-semibold">
          No Bookings Found
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="hotel-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Hotel</th>
                  <th>Room</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td className="font-medium">{booking.userId?.name || "Guest User"}</td>
                    <td>{booking.hotelId?.hotelname || "—"}</td>
                    <td>
                      <span className="font-semibold">#{booking.roomId?.roomNumber || "N/A"}</span>
                      <br />
                      <span className="text-xs text-slate-400">{booking.roomId?.roomType || "Standard"}</span>
                    </td>
                    <td>{booking.startDate ? new Date(booking.startDate).toLocaleDateString() : "—"}</td>
                    <td>{booking.endDate ? new Date(booking.endDate).toLocaleDateString() : "—"}</td>
                    <td className="font-semibold text-emerald-600 dark:text-emerald-400">
                      ₹{booking.price}
                    </td>
                    <td>
                      <span className={statusClass(booking.status)}>{booking.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-6 flex-wrap gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Showing <span className="font-bold text-slate-700 dark:text-slate-200">{startRecordIndex}</span> to{" "}
              <span className="font-bold text-slate-700 dark:text-slate-200">{endRecordIndex}</span> of{" "}
              <span className="font-bold text-slate-700 dark:text-slate-200">{totalBookings}</span> entries
            </span>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                ◀ Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 text-xs font-bold rounded-lg transition-all ${
                    currentPage === pageNum
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Next ▶
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminBookings;