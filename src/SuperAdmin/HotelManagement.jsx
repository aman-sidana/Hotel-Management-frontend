import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useSearching from "../custom hooks/useSearching";

function HotelManagement() {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");

  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const searching = useSearching(searchQuery, 500)
  const [sortBy, setSortBy] = useState("hotelAsc");

  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalHotels, setTotalHotels] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searching, sortBy, itemsPerPage]);

  useEffect(() => {
    getHotels();
  }, [searching, sortBy, activeTab, currentPage, itemsPerPage]);

  const getHotels = async () => {
    try {
      const token = localStorage.getItem("token");
      const result = await axios.get(`${import.meta.env.VITE_API_URL}/hotel/allhotels`, {
        params: {
          search: searching,
          sort: sortBy,
          status: activeTab,
          page: currentPage,
          limit: itemsPerPage,
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (result.data && result.data.success) {
        setHotels(result.data.hotels || []);
        setTotalHotels(result.data.totalHotels || 0);
        setTotalPages(result.data.totalPages || 1);
      } else if (Array.isArray(result.data)) {
        setHotels(result.data || []);
        setTotalHotels(result.data.length || 0);
        setTotalPages(Math.ceil((result.data.length || 0) / itemsPerPage) || 1);
      }
    } catch (error) {
      console.log(error);
      setHotels([]);
      setTotalHotels(0);
      setTotalPages(1);
    }
  };

  const viewHotel = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const result = await axios.get(`${import.meta.env.VITE_API_URL}/hotel/viewhotel?id=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedHotel(result.data.hotel);
      setShowModal(true);
    } catch (error) { console.log(error); }
  };

  const approveHotel = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`${import.meta.env.VITE_API_URL}/hotel/approvehotel?id=${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      getHotels();
    } catch (error) { console.log(error); }
  };

  const openRejectModal = (id) => {
    setRejectingId(id); setRejectReason(""); setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) { alert("Please provide a reason for rejection."); return; }
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`${import.meta.env.VITE_API_URL}/hotel/rejecthotel?id=${rejectingId}`, { description: rejectReason }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowRejectModal(false); setRejectingId(null); setRejectReason(""); getHotels();
    } catch (error) { console.log(error); }
  };

  const softDeleteHotel = async (id) => {
    try { const token = localStorage.getItem("token"); await axios.patch(`${import.meta.env.VITE_API_URL}/hotel/softdeletehotel?id=${id}`, {}, { headers: { Authorization: `Bearer ${token}` } }); getHotels(); } catch (error) { console.log(error); }
  };

  const restoreHotel = async (id) => {
    try { const token = localStorage.getItem("token"); await axios.patch(`${import.meta.env.VITE_API_URL}/hotel/restorehotel?id=${id}`, {}, { headers: { Authorization: `Bearer ${token}` } }); getHotels(); } catch (error) { console.log(error); }
  };

  const deleteHotel = async (id) => {
    if (!window.confirm("Delete this hotel?")) return;
    try { const token = localStorage.getItem("token"); await axios.delete(`${import.meta.env.VITE_API_URL}/hotel/deletehotel?id=${id}`, { headers: { Authorization: `Bearer ${token}` } }); getHotels(); } catch (error) { console.log(error); }
  };

  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalHotels);
  const displayedHotels = hotels;

  const tabs = [
    { id: "pending", label: "🕐 Pending" },
    { id: "approved", label: "✅ Approved" },
    { id: "rejected", label: "❌ Rejected" },
    { id: "active", label: "🟢 Active" },
    { id: "inactive", label: "⭕ Inactive" },
  ];

  const downloadPdf = () => {
    const token = localStorage.getItem("token");
    window.open(
      `${import.meta.env.VITE_API_URL}/hotel/download-pdf?search=${encodeURIComponent(searchQuery)}&sort=${sortBy}&status=${activeTab}&token=${token}`,
      "_blank"
    );
  };

  return (
    <div className="management-module">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-4">
        <h2 className="mb-0">Hotel Management</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={downloadPdf}
            className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
          >
            📄 Download PDF
          </button>
          <button
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all duration-200"
            onClick={() => navigate("/hotelform")}
          >
            + Add Hotel
          </button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === tab.id ? "bg-blue-600 text-white" : "btn-action-secondary"}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex gap-3 items-center flex-wrap mb-5">
        <select className="form-select w-full sm:w-auto sm:ml-auto" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="hotelAsc">Hotel (A - Z)</option>
          <option value="hotelDesc">Hotel (Z - A)</option>
          <option value="ownerAsc">Owner / Admin (A - Z)</option>
          <option value="ownerDesc">Owner / Admin (Z - A)</option>
        </select>
        <input type="text" className="form-input w-full sm:w-44" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      <div className="table-container">
        <table className="hotel-table">
          <thead>
            <tr>
              <th>Hotel</th>
              <th>Owner / Admin</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedHotels.map((hotel) => (
              <tr key={hotel._id}>
                <td className="font-semibold">{hotel.hotelname}</td>
                <td>{hotel.adminId?.adminname || hotel.ownername || hotel.hotelname}</td>
                <td>{hotel.hotelphone || hotel.ownerphone || "N/A"}</td>
                <td>
                  <div className="flex gap-2 flex-wrap">
                    {activeTab === "pending" && (
                      <>
                        <button className="btn-action-primary" onClick={() => viewHotel(hotel._id)}>View</button>
                        <button className="btn-action-success" onClick={() => approveHotel(hotel._id)}>Approve</button>
                        <button className="btn-action-danger" onClick={() => { setRejectingId(hotel._id); setShowRejectModal(true); }}>Reject</button>
                      </>
                    )}
                    {activeTab === "approved" && (
                      <>
                        <button className="btn-action-warning" onClick={() => softDeleteHotel(hotel._id)}>Make Inactive</button>
                        <button className="btn-action-danger" onClick={() => deleteHotel(hotel._id)}>Delete</button>
                      </>
                    )}
                    {activeTab === "rejected" && (
                      <button className="btn-action-danger" onClick={() => deleteHotel(hotel._id)}>Delete</button>
                    )}
                    {activeTab === "active" && (
                      <button className="btn-action-warning" onClick={() => softDeleteHotel(hotel._id)}>Make Inactive</button>
                    )}
                    {activeTab === "inactive" && (
                      <>
                        <button className="btn-action-success" onClick={() => restoreHotel(hotel._id)}>Restore Active</button>
                        <button className="btn-action-danger" onClick={() => deleteHotel(hotel._id)}>Delete</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {hotels.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-8 text-slate-400 dark:text-slate-500">
                  No {activeTab} Hotels Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalHotels > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing <span className="font-bold">{indexOfFirstItem + 1}</span> to{" "}
              <span className="font-bold">{indexOfLastItem}</span> of{" "}
              <span className="font-bold">{totalHotels}</span> hotels
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

      {showModal && selectedHotel && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setSelectedHotel(null); }}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Hotel Details</h2>
            <div className="flex flex-col gap-2">
              {[
                ["Hotel Name", selectedHotel.hotelname],
                ["Owner", selectedHotel.adminId?.adminname || "N/A"],
                ["Email", selectedHotel.hotelemail || "N/A"],
                ["Phone", selectedHotel.hotelphone || "N/A"],
                ["State", selectedHotel.stateId?.stateName || "N/A"],
                ["District", selectedHotel.districtId?.districtName || "N/A"],
                ["City", selectedHotel.cityId?.cityName || "N/A"],
                ["Address", selectedHotel.hoteladdress || "N/A"],
                ["Total Rooms", selectedHotel.totalrooms || 0],
                ["Total Staff", selectedHotel.totalstaff || 0],
                ["Request ID", selectedHotel.hotelRequestId || "N/A"],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-2 text-sm">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 min-w-[100px]">{label}:</span>
                  <span className="text-slate-600 dark:text-slate-400">{value}</span>
                </div>
              ))}
              <div className="flex gap-2 text-sm items-center">
                <span className="font-semibold text-slate-700 dark:text-slate-300 min-w-[100px]">Status:</span>
                <span className={`status-badge ${selectedHotel.status === "approved" ? "approved" : selectedHotel.status === "rejected" ? "rejected" : "pending"}`}>
                  {selectedHotel.status}
                </span>
              </div>
              {selectedHotel.description && (
                <div className="flex gap-2 text-sm">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 min-w-[100px]">Description:</span>
                  <span className="text-slate-600 dark:text-slate-400">{selectedHotel.description}</span>
                </div>
              )}
            </div>
            <button className="mt-5 w-full py-2.5 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors" onClick={() => { setShowModal(false); setSelectedHotel(null); }}>
              Close
            </button>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="modal-overlay" onClick={() => { setShowRejectModal(false); setRejectingId(null); setRejectReason(""); }}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Reject Hotel Request</h2>
            <p className="text-sm text-red-500 mb-3">Please provide a reason for rejecting this request:</p>
            <textarea
              className="form-textarea w-full min-h-[100px] resize-none"
              placeholder="Enter rejection details or reason here..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex gap-3 justify-end mt-4">
              <button className="btn-action-danger" onClick={confirmReject}>Confirm Reject</button>
              <button className="btn-action-secondary" onClick={() => { setShowRejectModal(false); setRejectingId(null); setRejectReason(""); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HotelManagement;
