import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { gsap } from "gsap";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../genericComponents/Navbar";
import RoomBookingCalendar from "../Hotel/RoomBookingCalendar";
import useSearching from "../custom hooks/useSearching"

function HotelRoom() {
  const location = useLocation();
  const navigate = useNavigate();

  const hotelData = location.state?.hotelData || null;
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewedRoom, setViewedRoom] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  const [activeHolds, setActiveHolds] = useState([]);
  const [holdTimerSeconds, setHoldTimerSeconds] = useState(600);
  const holdIntervalRef = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [totalNights, setTotalNights] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);

  const [submitting, setSubmitting] = useState(false);

  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const searching = useSearching(searchQuery, 500)
  const [sortBy, setSortBy] = useState("default");

  const [coupons, setCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);

  const [filters, setFilters] = useState({
    kingSizeBed: false, queenSizeBed: false, singleBed: false, doubleBed: false,
    ac: false, wifi: false, tv: false, geyser: false, miniFridge: false,
    bathtub: false, balcony: false, sofa: false, locker: false,
    roomService: false, laundryService: false, housekeeping: false,
  });

  const handleFilterChange = (e) => {
    const { name, checked } = e.target;
    setFilters((prev) => ({ ...prev, [name]: checked }));
  };

  const resetFilters = () => {
    setSearchQuery(""); setSortBy("default");
    setFilters({
      kingSizeBed: false, queenSizeBed: false, singleBed: false, doubleBed: false,
      ac: false, wifi: false, tv: false, geyser: false, miniFridge: false,
      bathtub: false, balcony: false, sofa: false, locker: false,
      roomService: false, laundryService: false, housekeeping: false,
    });
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [totalRooms, setTotalRooms] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const roomsPerPage = 8;

  useEffect(() => {
    setCurrentPage(1);
  }, [searching, sortBy, filters]);

  useEffect(() => {
    if (!hotelData?._id) return;

    const loadHotelRooms = async () => {
      try {
        setLoading(true);

        const params = {
          hotelId: hotelData._id,
          search: searching,
          sort: sortBy,
          page: currentPage,
          limit: roomsPerPage,
        };

        // Send only selected filters
        Object.keys(filters).forEach((key) => {
          if (filters[key]) {
            params[key] = true;
          }
        });

        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/room/getalluserrooms`,
          {
            params,
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data && res.data.success) {
          setRooms(res.data.rooms || []);
          setTotalRooms(res.data.totalRooms || 0);
          setTotalPages(res.data.totalPages || 1);
        } else if (Array.isArray(res.data)) {
          setRooms(res.data || []);
          setTotalRooms(res.data.length || 0);
          setTotalPages(Math.ceil((res.data.length || 0) / roomsPerPage) || 1);
        }
      } catch (error) {
        console.log(error);
        setRooms([]);
        setTotalRooms(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    loadHotelRooms();
  }, [hotelData, searching, sortBy, filters, currentPage]);

  const filteredRooms = rooms;

  const indexOfFirstRoom = (currentPage - 1) * roomsPerPage;
  const indexOfLastRoom = Math.min(currentPage * roomsPerPage, totalRooms);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    const roomsEl = document.getElementById("rooms-header-section");
    if (roomsEl) {
      roomsEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (!hotelData) return undefined;
    const contentEl = document.getElementById("hotel-room-content");
    if (!contentEl) return undefined;
    const context = gsap.context(() => {
      const targets = contentEl.querySelectorAll(".user-selected-hotel, .user-section-title");
      if (targets.length > 0) {
        gsap.from(targets, {
          autoAlpha: 0, duration: 0.6, y: 15, stagger: 0.1, ease: "power2.out",
        });
      }
    }, contentEl);
    return () => context.revert();
  }, [hotelData]);


  useEffect(() => {
    if (loading) return undefined;
    const roomsEl = document.getElementById("rooms-grid");
    if (!roomsEl || !roomsEl.children.length) return undefined;
    const context = gsap.context(() => {
      gsap.from(roomsEl.children, {
        autoAlpha: 0, duration: 0.5, y: 18, stagger: 0.05, ease: "power3.out",
        clearProps: "all",
      });
    }, roomsEl);
    return () => context.revert();
  }, [loading, rooms.length, currentPage]);

  useEffect(() => {
    if (!selectedRoom || !startDate || !endDate) return;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const difference = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    if (difference <= 0) {
      setTotalNights(1); setTotalPrice(selectedRoom.pricePerNight);
    } else {
      setTotalNights(difference); setTotalPrice(difference * selectedRoom.pricePerNight);
    }
  }, [startDate, endDate, selectedRoom]);

  const handleBookRoom = (room) => {
    setSelectedRoom(room);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    setStartDate(today.toISOString().split("T")[0]);
    setEndDate(tomorrow.toISOString().split("T")[0]);
    setTotalNights(1); setTotalPrice(room.pricePerNight);
    setFinalPrice(room.pricePerNight);
    setSelectedCoupon(null); setCouponDiscount(0);
    setBookingSuccess(false); setCreatedBooking(null);
    fetchHotelCoupons(hotelData._id);
    setIsModalOpen(true);
  };

  const fetchHotelCoupons = async (hotelId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/coupon/getallcoupon`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        const today = new Date();
        const valid = res.data.result.filter(
          (c) =>
            c.isActive &&
            c.hotelId?._id === hotelId &&
            new Date(c.startingDate) <= today &&
            new Date(c.dateUpTo) >= today
        );
        setCoupons(valid);
      }
    } catch (err) {
      console.error("Failed to fetch coupons:", err);
      setCoupons([]);
    }
  };

  useEffect(() => {
    if (!selectedCoupon || totalPrice <= 0) {
      setCouponDiscount(0);
      setFinalPrice(totalPrice);
      return;
    }
    if (selectedCoupon.minPriceAvail && totalPrice < selectedCoupon.minPriceAvail) {
      setSelectedCoupon(null);
      setCouponDiscount(0);
      setFinalPrice(totalPrice);
      return;
    }
    let discount = 0;
    if (selectedCoupon.couponType === "percentage") {
      discount = Math.round((totalPrice * selectedCoupon.discount) / 100);
    } else {
      discount = selectedCoupon.discount;
    }
    discount = Math.min(discount, totalPrice);
    setCouponDiscount(discount);
    setFinalPrice(totalPrice - discount);
  }, [totalPrice, selectedCoupon]);
  const fetchActiveHolds = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/temporary/active-holds`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data && res.data.holds) {
        setActiveHolds(res.data.holds);
      }
    } catch (err) {
      console.error("Error fetching active holds:", err);
    }
  };

  useEffect(() => {
    fetchActiveHolds();
    const interval = setInterval(fetchActiveHolds, 8000);
    return () => clearInterval(interval);
  }, []);

  const formatSeconds = (totalSecs) => {
    if (totalSecs <= 0) return "00:00";
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleViewDetails = async (roomId) => {
    const currentUser = JSON.parse(localStorage.getItem("currentuser") || "null");
    if (!currentUser) {
      alert("Please login first to view room details and hold room for booking.");
      return;
    }

    try {
      setViewLoading(true);

      const token = localStorage.getItem("token");
      // Create 10-minute temporary hold
      const holdRes = await axios.post(`${import.meta.env.VITE_API_URL}/temporary/create`, {
        roomId,
        userId: currentUser._id,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (holdRes.data && holdRes.data.success) {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/room/viewbyone?id=${roomId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setViewedRoom(res.data);
        setIsViewModalOpen(true);
        setHoldTimerSeconds(holdRes.data.expiresInSeconds || 600);
        fetchActiveHolds();
      }
    } catch (error) {
      console.error("Error creating hold / viewing room:", error);
      if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message);
      } else {
        alert("Failed to load room details.");
      }
      setIsViewModalOpen(false);
    } finally {
      setViewLoading(false);
    }
  };

  // 10-Minute Countdown Timer Effect
  useEffect(() => {
    if (!isViewModalOpen && !isModalOpen) {
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
      return;
    }

    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);

    holdIntervalRef.current = setInterval(() => {
      setHoldTimerSeconds((prev) => {
        if (
          prev <= 1) {
          clearInterval(holdIntervalRef.current);
          alert("Your 10-minute temporary hold on this room has expired. Returning to hotel booking list...");

          const currentRoomId = viewedRoom?._id || selectedRoom?._id;
          const currentUser = JSON.parse(localStorage.getItem("currentuser") || "null");
          if (currentRoomId && currentUser?._id) {
            const token = localStorage.getItem("token");
            axios.post(`${import.meta.env.VITE_API_URL}/temporary/release`, {
              roomId: currentRoomId,
              userId: currentUser._id,
            }, {
              headers: { Authorization: `Bearer ${token}` },
            }).catch(() => { });
          }

          setIsViewModalOpen(false);
          setViewedRoom(null);
          setIsModalOpen(false);
          setSelectedRoom(null);
          fetchActiveHolds();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    };
  }, [isViewModalOpen, isModalOpen, viewedRoom, selectedRoom]);

  const closeViewModal = () => {
    const currentUser = JSON.parse(localStorage.getItem("currentuser") || "null");
    const token = localStorage.getItem("token");
    if (viewedRoom?._id && currentUser?._id) {
      axios.post(`${import.meta.env.VITE_API_URL}/temporary/release`, {
        roomId: viewedRoom._id,
        userId: currentUser._id,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => { });
    }
    setIsViewModalOpen(false);
    setViewedRoom(null);
    fetchActiveHolds();
  };

  const amenityLabels = {
    ac: "❄️ AC", cooler: "🌀 Cooler", attachedBathroom: "🚻 Attached Bathroom",
    bathtub: "🛁 Bathtub", geyser: "🚿 Geyser", tv: "📺 TV", wifi: "📶 WiFi",
    telephone: "☎️ Telephone", miniFridge: "🧊 Mini Fridge", microwave: "📡 Microwave",
    electricKettle: "☕ Electric Kettle", sofa: "🛋️ Sofa", diningTable: "🍽️ Dining Table",
    wardrobe: "🚪 Wardrobe", balcony: "🌅 Balcony", locker: "🔐 Locker",
    smokeDetector: "🚨 Smoke Detector", fireExtinguisher: "🧯 Fire Extinguisher",
    roomService: "🍽️ Room Service", laundryService: "🧺 Laundry Service",
    housekeeping: "🧹 Housekeeping",
  };

  const bedLabels = {
    kingSizeBed: "King Size", queenSizeBed: "Queen Size",
    singleBed: "Single", doubleBed: "Double",
  };

  const closeModal = () => {
    const currentUser = JSON.parse(localStorage.getItem("currentuser") || "null");
    const token = localStorage.getItem("token");
    if (selectedRoom?._id && currentUser?._id) {
      axios.post(`${import.meta.env.VITE_API_URL}/temporary/release`, {
        roomId: selectedRoom._id,
        userId: currentUser._id,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => { });
    }
    setIsModalOpen(false); setSelectedRoom(null);
    setStartDate(""); setEndDate(""); setBookingSuccess(false);
    setSelectedCoupon(null); setCouponDiscount(0); setFinalPrice(0);
    fetchActiveHolds();
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    const currentUser = JSON.parse(localStorage.getItem("currentuser"));
    if (!currentUser) { alert("Please login first."); return; }
    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/booking/create`, {
        userId: currentUser._id, hotelId: hotelData._id,
        roomId: selectedRoom._id, price: finalPrice, startDate, endDate,
        couponId: selectedCoupon?._id || null,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setCreatedBooking(response.data.booking); setBookingSuccess(true);
        setRooms((prevRooms) => prevRooms.filter((room) => room._id !== selectedRoom._id));
      }
    } catch (error) {
      console.log(error); alert(error.response?.data?.message || "Booking Failed");
    } finally { setSubmitting(false); }
  };

  if (!hotelData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="text-5xl mb-4">🏨</div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">No Hotel Selected</h2>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all duration-200"
          >
            ⬅️ Back
          </button>
        </div>
      </div>
    );
  }

  const filterCheckboxClass = "flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 w-full" id="hotel-room-content">
      <Navbar />

      <div className="w-full px-6 lg:px-8 py-4 bg-white/60 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md" id="rooms-header-section">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold btn-action-secondary flex items-center gap-1.5"
            >
              ⬅️ Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                {hotelData.hotelname}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                <span>📍 {hotelData.cityId?.cityName || "City"}, {hotelData.stateId?.stateName || "State"}</span>
                <span>•</span>
                <span>🏠 {hotelData.hoteladdress}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* Search Room Input */}
            <div className="relative w-full sm:w-64">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
              <input
                type="text"
                placeholder="Search room # or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-2 rounded-xl text-xs font-medium
                  bg-white dark:bg-slate-900/90
                  border border-slate-200 dark:border-slate-700
                  text-slate-800 dark:text-slate-100
                  placeholder-slate-400 dark:placeholder-slate-500
                  focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-[10px] font-bold bg-slate-200 dark:bg-slate-700 rounded-full w-4 h-4 flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort By Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 rounded-xl text-xs font-bold
                bg-white dark:bg-slate-900/90
                border border-slate-200 dark:border-slate-700
                text-slate-700 dark:text-slate-200
                focus:outline-none focus:border-sky-400 cursor-pointer shadow-sm"
            >
              <option value="default">Sort By: Default</option>
              <option value="priceLowHigh">Price: Low to High</option>
              <option value="priceHighLow">Price: High to Low</option>
              <option value="roomAsc">Room # (Low to High)</option>
              <option value="roomDesc">Room # (High to Low)</option>
            </select>

            <span className="px-3 py-2 rounded-xl text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 whitespace-nowrap">
              🛏️ {totalRooms} Available {totalRooms === 1 ? "Room" : "Rooms"}
            </span>
          </div>
        </div>
      </div>

      <div className="w-full px-6 lg:px-8 py-6">
        <main className="w-full">
          {loading ? (
            <div className="text-center py-20 text-slate-400 dark:text-slate-500">Loading available rooms...</div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="text-5xl mb-4">🛏️</div>
              <p className="text-slate-500 dark:text-slate-400 mb-5">No active rooms match your selected filter criteria.</p>
              <button onClick={resetFilters} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all duration-200">
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              {/* 4 cards per row grid format */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6 w-full" id="rooms-grid">
                {rooms.map((room) => {
                  const currentUser = JSON.parse(localStorage.getItem("currentuser") || "null");
                  const isHeldByOther = activeHolds.some(
                    (h) => (h.roomId?._id || h.roomId) === room._id && (h.userId?._id || h.userId) !== currentUser?._id
                  );
                  return (
                    <div key={room._id} className={`user-hotel-card w-full flex flex-col justify-between ${isHeldByOther ? "opacity-80" : ""}`}>
                      <div>
                        {room.images && room.images.length > 0 ? (
                          <div className="flex overflow-x-auto gap-1 h-48 bg-slate-100 dark:bg-slate-700 no-scrollbar relative">
                            {room.images.map((img, idx) => (
                              <img key={idx} src={img} alt={`Room ${idx + 1}`} className="h-full w-auto flex-shrink-0 object-cover" />
                            ))}
                          </div>
                        ) : (
                          <div className="h-48 flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 text-sm">
                            🛏️ Photo Unavailable
                          </div>
                        )}

                        <div className="p-4 flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-base text-slate-800 dark:text-white">Room #{room.roomNumber}</h3>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                              {room.roomType}
                            </span>
                          </div>

                          {isHeldByOther && (
                            <div className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 shadow-sm flex items-center gap-1 w-fit">
                              🔒 Held by another user (10m)
                            </div>
                          )}

                          <p className="text-xs text-slate-500 dark:text-slate-400">Floor {room.floor} · {room.capacity} Guest(s)</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Bed: {room.kingSizeBed ? "King Size" : room.queenSizeBed ? "Queen Size" : room.doubleBed ? "Double" : room.singleBed ? "Single" : "Standard"}
                          </p>

                          <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">₹{room.pricePerNight} <span className="text-xs font-normal text-slate-400">/ night</span></p>

                          <div className="flex flex-wrap gap-1 mt-1">
                            {room.ac && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400">❄️ AC</span>}
                            {room.wifi && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400">📶 WiFi</span>}
                            {room.tv && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400">📺 TV</span>}
                            {room.geyser && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400">🚿 Geyser</span>}
                            {room.balcony && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400">🌅 Balcony</span>}
                          </div>
                        </div>
                      </div>

                      <div className="px-4 pb-4">
                        <h3
                          onClick={() => handleViewDetails(room._id)}
                          className="text-sm font-semibold text-blue-600 dark:text-blue-400 underline cursor-pointer hover:text-blue-500 dark:hover:text-blue-300 w-fit"
                        >
                          <strong>View Details</strong>
                        </h3>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Room Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                    Showing <span className="font-bold text-slate-800 dark:text-slate-200">{indexOfFirstRoom + 1}</span> to{" "}
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {indexOfLastRoom}
                    </span>{" "}
                    of <span className="font-bold text-slate-800 dark:text-slate-200">{totalRooms}</span> rooms
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold
                        bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800
                        text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800
                        disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                    >
                      ← Previous
                    </button>

                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: totalPages }, (_, index) => {
                        const pageNum = index + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-9 h-9 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${currentPage === pageNum
                              ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-105"
                              : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold
                        bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800
                        text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800
                        disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
      {isModalOpen && selectedRoom && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xl font-bold" onClick={closeModal}>✕</button>

            {!bookingSuccess ? (
              <form onSubmit={handleConfirmBooking} className="flex flex-col gap-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Confirm Booking</h2>

                {/* ── 10-Minute Hold Live Countdown Banner ── */}
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-300">⏱️ Temporary Hold Active</span>
                    <span className="text-[11px] text-amber-600 dark:text-amber-400 hidden sm:inline">(Locked for 10 min)</span>
                  </div>
                  <span className="font-mono text-xs font-extrabold text-amber-800 dark:text-amber-200 bg-amber-200/80 dark:bg-amber-900/80 px-2.5 py-1 rounded-xl shadow-inner">
                    {formatSeconds(holdTimerSeconds)}
                  </span>
                </div>

                <p className="text-base font-semibold text-blue-600 dark:text-blue-400">
                  Room #{selectedRoom.roomNumber} · {selectedRoom.roomType}
                </p>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1.5">Check In</label>
                  <input type="date" value={startDate} min={new Date().toISOString().split("T")[0]} onChange={(e) => setStartDate(e.target.value)} required className="form-input w-full" />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1.5">Check Out</label>
                  <input type="date" value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} required className="form-input w-full" />
                </div>

                {/* ── Coupon Dropdown ── */}
                {coupons.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                      🎟️ Apply Coupon
                    </label>
                    <select
                      className="form-select w-full"
                      value={selectedCoupon?._id || ""}
                      onChange={(e) => {
                        const found = coupons.find((c) => c._id === e.target.value);
                        setSelectedCoupon(found || null);
                      }}
                    >
                      <option value="">-- Select a coupon --</option>
                      {coupons
                        .filter((c) => !c.minPriceAvail || totalPrice >= c.minPriceAvail)
                        .map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.couponCode} —{" "}
                            {c.couponType === "percentage"
                              ? `${c.discount}% off`
                              : `₹${c.discount} off`}
                            {c.minPriceAvail ? ` (min ₹${c.minPriceAvail})` : ""}
                          </option>
                        ))}
                    </select>
                    {/* Show message if no eligible coupons after filtering */}
                    {coupons.filter((c) => !c.minPriceAvail || totalPrice >= c.minPriceAvail).length === 0 && (
                      <p className="text-xs text-amber-500 dark:text-amber-400 mt-1">
                        ⚠️ No coupons available for this booking amount. Increase your stay duration to unlock offers.
                      </p>
                    )}
                  </div>
                )}

                {/* ── Price Breakdown ── */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-700/30 flex flex-col gap-2">
                  <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                    <span>Price / Night</span>
                    <span>₹{selectedRoom.pricePerNight}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                    <span>Total Nights</span>
                    <span>{totalNights}</span>
                  </div>

                  {/* Original total */}
                  <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                    <span>Subtotal</span>
                    <span className={couponDiscount > 0 ? "line-through text-slate-400 dark:text-slate-500" : ""}>
                      ₹{totalPrice}
                    </span>
                  </div>

                  {/* Discount line — only visible when a coupon is applied */}
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
                      <span>🎟️ Coupon Discount ({selectedCoupon.couponCode})</span>
                      <span>- ₹{couponDiscount}</span>
                    </div>
                  )}

                  <hr className="border-slate-200 dark:border-slate-600" />

                  <div className="flex justify-between font-bold text-base text-slate-900 dark:text-white">
                    <span>Total Price</span>
                    <span className={couponDiscount > 0 ? "text-emerald-600 dark:text-emerald-400" : ""}>
                      ₹{finalPrice}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all duration-200 disabled:opacity-50"
                >
                  {submitting ? "Booking..." : `Confirm Booking ₹${finalPrice}`}
                </button>
              </form>
            ) : (
              <div className="flex flex-col items-center text-center gap-3">
                <div className="text-4xl mb-2">🎉</div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Booking Successful!</h2>
                <div className="w-full text-left flex flex-col gap-2 mt-2">
                  {[
                    ["Booking ID", createdBooking?._id],
                    ["Hotel", hotelData.hotelname],
                    ["Room", `#${selectedRoom.roomNumber}`],
                    ["Check In", startDate],
                    ["Check Out", endDate],
                    ...(couponDiscount > 0 ? [["Coupon", selectedCoupon?.couponCode], ["Discount", `- ₹${couponDiscount}`]] : []),
                    ["Total Paid", `₹${finalPrice}`],
                    ["Status", createdBooking?.status],
                  ].map(([label, value]) => (
                    <div key={label} className="flex gap-2 text-sm">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 min-w-[80px]">{label}:</span>
                      <span className={`text-slate-600 dark:text-slate-400 ${label === "Discount" ? "text-emerald-600 dark:text-emerald-400 font-semibold" : ""
                        }`}>{value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 w-full mt-3">
                  <button className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all duration-200" onClick={() => navigate("/userbookings")}>
                    View My Bookings
                  </button>
                  <button className="flex-1 py-2.5 rounded-xl text-sm font-semibold btn-action-secondary" onClick={closeModal}>
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}


      {isViewModalOpen && (
        <div className="modal-overlay" onClick={closeViewModal}>
          <div
            className="modal-box max-h-[90vh] overflow-y-auto"
            style={{ maxWidth: "860px", width: "95vw" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xl font-bold"
              onClick={closeViewModal}
            >
              ✕
            </button>

            {viewLoading ? (
              <div className="text-center py-16 text-slate-400 dark:text-slate-500">
                Loading room details...
              </div>
            ) : !viewedRoom ? (
              <div className="text-center py-16 text-slate-400 dark:text-slate-500">
                No details found.
              </div>
            ) : (
              <>
                {/* ── 10-Minute Hold Live Countdown Banner ── */}
                <div className="mb-4 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-300">⏱️ Temporary Hold Active</span>
                    <span className="text-[11px] text-amber-600 dark:text-amber-400 hidden sm:inline">(Locked for 10 min)</span>
                  </div>
                  <span className="font-mono text-xs font-extrabold text-amber-800 dark:text-amber-200 bg-amber-200/80 dark:bg-amber-900/80 px-2.5 py-1 rounded-xl shadow-inner">
                    {formatSeconds(holdTimerSeconds)}
                  </span>
                </div>

                {/* ── Split layout: Room info left | Calendar right ── */}
                <div className="flex flex-col lg:flex-row gap-6">

                  {/* ── Left: Full room details ── */}
                  <div className="flex-1 min-w-0 flex flex-col gap-5">

                    {viewedRoom.images && viewedRoom.images.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {viewedRoom.images.map((img, idx) => (
                          <div key={idx} className="h-32 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700">
                            <img src={img} alt={`Room ${viewedRoom.roomNumber} - ${idx + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-40 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 text-sm">
                        🛏️ Photo Unavailable
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Room #{viewedRoom.roomNumber}</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{viewedRoom.hotelId?.hotelname}</p>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                        {viewedRoom.roomType}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-700/30">
                      {[["Floor", viewedRoom.floor], ["Capacity", `${viewedRoom.capacity} Guest(s)`], ["Price / Night", `₹${viewedRoom.pricePerNight}`], ["Available", viewedRoom.isAvailable ? "Yes" : "No"], ["Status", viewedRoom.isActive ? "Active" : "Inactive"]].map(([label, val]) => (
                        <div key={label}>
                          <p className="text-[11px] font-bold uppercase text-slate-400 dark:text-slate-500">{label}</p>
                          <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">{val}</p>
                        </div>
                      ))}
                    </div>

                    <div>
                      <p className="text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase mb-2">Bed Type</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(bedLabels).filter(([key]) => viewedRoom[key]).map(([key, label]) => (
                          <span key={key} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400">🛏️ {label}</span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase mb-2">Amenities & Services</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(amenityLabels).filter(([key]) => viewedRoom[key]).map(([key, label]) => (
                          <span key={key} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400">{label}</span>
                        ))}
                      </div>
                    </div>


                    <button
                      onClick={() => { closeViewModal(); handleBookRoom(viewedRoom); }}
                      className="w-full py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-sm shadow-blue-600/20 transition-all duration-200"
                    >
                      Book Now
                    </button>
                  </div>

                  {/* ── Vertical divider ── */}
                  <div className="hidden lg:block w-px bg-slate-200 dark:bg-slate-700 self-stretch" />
                  <div className="block lg:hidden h-px bg-slate-200 dark:bg-slate-700" />

                  {/* ── Right: Booking Calendar ── */}
                  <div className="lg:w-[280px] shrink-0">
                    <RoomBookingCalendar roomId={viewedRoom._id} />
                  </div>

                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div >
  );
}

export default HotelRoom;