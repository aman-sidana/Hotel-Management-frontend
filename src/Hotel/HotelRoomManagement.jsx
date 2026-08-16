import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import RoomBookingCalendar from "./RoomBookingCalendar";

function HotelRoomManagement() {
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("currentuser") || "null");

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("numberAsc");

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { fetchRooms(); }, []);

  const handleExcelImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/hotel/import-excel`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(res.data.message || "Excel sheet imported successfully!");
      fetchRooms();
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Failed to import Excel file.");
    } finally {
      e.target.value = "";
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const [roomsRes, hotelsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/room/getallrooms`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${import.meta.env.VITE_API_URL}/hotel/allhotels`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const allRooms = roomsRes.data || [];
      const allHotels = hotelsRes.data || [];

      const myHotel = currentUser?.email
        ? allHotels.find((h) => h.hotelemail?.toLowerCase() === currentUser.email.toLowerCase())
        : null;

      const ownRooms = myHotel
        ? allRooms.filter((room) => room.hotelId === myHotel._id || room.hotelId?._id === myHotel._id)
        : [];

      setRooms(ownRooms);
    } catch (error) {
      console.log("Error fetching rooms:", error);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const softDeleteRoom = async (id) => {
    try { const token = localStorage.getItem("token"); await axios.patch(`${import.meta.env.VITE_API_URL}/room/softdelete?id=${id}`, {}, { headers: { Authorization: `Bearer ${token}` } }); fetchRooms(); } catch (error) { console.log(error); }
  };

  const restoreRoom = async (id) => {
    try { const token = localStorage.getItem("token"); await axios.patch(`${import.meta.env.VITE_API_URL}/room/restore?id=${id}`, {}, { headers: { Authorization: `Bearer ${token}` } }); fetchRooms(); } catch (error) { console.log(error); }
  };

  const deleteRoom = async (id) => {
    try { const token = localStorage.getItem("token"); await axios.delete(`${import.meta.env.VITE_API_URL}/room/delete?id=${id}`, { headers: { Authorization: `Bearer ${token}` } }); fetchRooms(); } catch (error) { console.log(error); }
  };

  const tabFilteredRooms = rooms.filter((room) =>
    activeTab === "active" ? room.isActive === true : room.isActive === false
  );

  const searchedRooms = tabFilteredRooms.filter((room) => {
    const q = searchQuery.toLowerCase();
    const roomNum = room.roomNumber ? room.roomNumber.toString().toLowerCase() : "";
    const type = room.roomType ? room.roomType.toLowerCase() : "";
    const hotel = room.hotelId?.hotelname ? room.hotelId.hotelname.toLowerCase() : "";
    return roomNum.includes(q) || type.includes(q) || hotel.includes(q);
  });

  const displayedRooms = [...searchedRooms].sort((a, b) => {
    if (sortBy === "numberAsc") return Number(a.roomNumber) - Number(b.roomNumber);
    else if (sortBy === "numberDesc") return Number(b.roomNumber) - Number(a.roomNumber);
    else if (sortBy === "priceLow") return Number(a.pricePerNight) - Number(b.pricePerNight);
    else if (sortBy === "priceHigh") return Number(b.pricePerNight) - Number(a.pricePerNight);
    return 0;
  });

  const facilityList = (room) => {
    const all = [
      { key: "ac", label: "❄️ AC" },
      { key: "wifi", label: "📶 WiFi" },
      { key: "tv", label: "📺 TV" },
      { key: "attachedBathroom", label: "🚿 Bathroom" },
      { key: "bathtub", label: "🛁 Bathtub" },
      { key: "geyser", label: "🔥 Geyser" },
      { key: "balcony", label: "🌿 Balcony" },
      { key: "miniFridge", label: "🧊 Mini Fridge" },
      { key: "roomService", label: "🍽️ Room Service" },
    ];
    return all.filter((f) => room?.amenities?.includes(f.key) || room[f.key]);
  };

  return (
    <div className="management-module">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent dark:from-white dark:to-sky-400">
            Room Management
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">View and manage all active and inactive hotel rooms.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer">
            📊 Import Excel
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleExcelImport}
              className="hidden"
            />
          </label>
          <button
            onClick={() => {
              const token = localStorage.getItem("token");
              window.open(`${import.meta.env.VITE_API_URL}/room/download-pdf?search=${encodeURIComponent(searchQuery)}&token=${token}`, "_blank");
            }}
            className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            📄 Download PDF
          </button>
          <button
            onClick={() => navigate("/roomform")}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all duration-200 cursor-pointer"
          >
            + Add Room
          </button>
        </div>
      </div>

      <div className="flex gap-3 items-center flex-wrap mb-6">
        <button className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === "active" ? "bg-blue-600 text-white" : "btn-action-secondary"}`} onClick={() => setActiveTab("active")}>Active Rooms</button>
        <button className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === "inactive" ? "bg-blue-600 text-white" : "btn-action-secondary"}`} onClick={() => setActiveTab("inactive")}>Inactive Rooms</button>
        <select className="form-select ml-auto" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="numberAsc">Room # (Low to High)</option>
          <option value="numberDesc">Room # (High to Low)</option>
          <option value="priceLow">Price (Low to High)</option>
          <option value="priceHigh">Price (High to Low)</option>
        </select>
        <input type="text" className="form-input w-52" placeholder="Search room number, type, hotel..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500">Loading rooms...</div>
      ) : displayedRooms.length === 0 ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500">
          No {activeTab === "active" ? "Active" : "Inactive"} rooms found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {displayedRooms.map((room) => (
            <div
              key={room._id}
              className={`admin-card ${!room.isActive ? "inactive" : ""}`}
            >
              <div className="h-40 bg-slate-100 dark:bg-slate-700 overflow-hidden">
                {room.images && room.images.length > 0 ? (
                  <img src={room.images[0]} alt="Room Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500 text-sm">No Photo</div>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-base text-slate-800 dark:text-white">Room #{room.roomNumber}</h3>
                  <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    {room.roomType}
                  </span>
                </div>
                {[
                  ["Hotel", room.hotelId?.hotelname || "N/A"],
                  ["Floor", room.floor],
                  ["Price", `₹${room.pricePerNight} / night`],
                  ["Capacity", `${room.capacity} Guests`],
                ].map(([label, value]) => (
                  <p key={label} className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{label}:</span> {value}
                  </p>
                ))}

                <hr className="my-3 border-slate-100 dark:border-slate-700" />

                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <button className="flex-1 btn-action-primary text-center" onClick={() => { setSelectedRoom(room); setShowModal(true); }}>View</button>
                    <button className="flex-1 btn-action-warning text-center" onClick={() => navigate("/roomform", { state: { roomData: room } })}>Edit</button>
                  </div>
                  <div className="flex gap-2">
                    {room.isActive ? (
                      <button className="flex-1 btn-action-secondary text-center" onClick={() => softDeleteRoom(room._id)}>Deactivate</button>
                    ) : (
                      <button className="flex-1 btn-action-success text-center" onClick={() => restoreRoom(room._id)}>Activate</button>
                    )}
                    <button className="flex-1 btn-action-danger text-center" onClick={() => deleteRoom(room._id)}>Delete</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && selectedRoom && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setSelectedRoom(null); }}>
          {/* Wider modal to fit calendar alongside details */}
          <div
            className="modal-box max-h-[90vh] overflow-y-auto"
            style={{ maxWidth: "780px", width: "95vw" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Header ── */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Room #{selectedRoom.roomNumber} Details
              </h2>
              <button
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl leading-none"
                onClick={() => { setShowModal(false); setSelectedRoom(null); }}
              >
                ✕
              </button>
            </div>

            {/* ── Split body: Details | Calendar ── */}
            <div className="flex flex-col lg:flex-row gap-6">

              {/* ── Left: Room details ── */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col gap-2 mb-4">
                  {[
                    ["Hotel Name", selectedRoom.hotelId?.hotelname || "N/A"],
                    ["Room Type", selectedRoom.roomType],
                    ["Floor", selectedRoom.floor],
                    ["Price Per Night", `₹${selectedRoom.pricePerNight}`],
                    ["Capacity", `${selectedRoom.capacity} Guests`],
                  ].map(([label, value]) => (
                    <div key={label} className="flex gap-2 text-sm">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 min-w-[130px]">{label}:</span>
                      <span className="text-slate-600 dark:text-slate-400">{value}</span>
                    </div>
                  ))}
                </div>

                <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300 mb-2">Enabled Facilities:</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {facilityList(selectedRoom).length > 0
                    ? facilityList(selectedRoom).map((f) => (
                      <span key={f.key} className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        {f.label}
                      </span>
                    ))
                    : <span className="text-xs text-slate-400">None enabled</span>
                  }
                </div>
              </div>

              {/* ── Divider (vertical on large, horizontal on small) ── */}
              <div className="hidden lg:block w-px bg-slate-200 dark:bg-slate-700 self-stretch" />
              <div className="block lg:hidden h-px bg-slate-200 dark:bg-slate-700" />

              {/* ── Right: Booking Calendar ── */}
              <div className="lg:w-[280px] shrink-0">
                <RoomBookingCalendar roomId={selectedRoom._id} />
              </div>

            </div>

            {/* ── Close button ── */}
            <button
              className="w-full mt-5 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              onClick={() => { setShowModal(false); setSelectedRoom(null); }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default HotelRoomManagement; 