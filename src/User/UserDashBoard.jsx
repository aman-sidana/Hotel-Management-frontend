import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";
import UseTheme from "../custom hooks/Usetheme";
import Navbar from "../genericComponents/Navbar";
import useSearching from "../custom hooks/useSearching";

function UserDashBoard() {
  const navigate = useNavigate();
  const { theme, changeTheme } = UseTheme();

  const [hotels, setHotels] = useState([]);
  const [totalHotels, setTotalHotels] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const hotelsPerPage = 6;

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searching = useSearching(searchQuery, 500);
  const [sortBy, setSortBy] = useState("default");

  const [filters, setFilters] = useState({
    kingSizeBed: false,
    queenSizeBed: false,
    singleBed: false,
    doubleBed: false,
    ac: false,
    wifi: false,
    tv: false,
    geyser: false,
    miniFridge: false,
    bathtub: false,
    balcony: false,
    sofa: false,
    locker: false,
    roomService: false,
    laundryService: false,
    housekeeping: false,
  });

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const handleFilterChange = (e) => {
    const { name, checked } = e.target;
    setFilters((prev) => ({ ...prev, [name]: checked }));
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSortBy("default");
    setFilters({
      kingSizeBed: false,
      queenSizeBed: false,
      singleBed: false,
      doubleBed: false,
      ac: false,
      wifi: false,
      tv: false,
      geyser: false,
      miniFridge: false,
      bathtub: false,
      balcony: false,
      sofa: false,
      locker: false,
      roomService: false,
      laundryService: false,
      housekeeping: false,
    });
  };

  const pageRef = useRef(null);
  const cardsRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem("currentuser")) || null;

  // Reset page to 1 when search query, sort order, or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searching, sortBy, filters]);

  useEffect(() => {
    async function loadHotels() {
      try {
        setLoading(true);

        const params = {
          search: searching,
          sort: sortBy,
          page: currentPage,
          limit: hotelsPerPage,
        };

        // Attach only selected boolean filters
        Object.keys(filters).forEach((key) => {
          if (filters[key]) {
            params[key] = true;
          }
        });

        const token = localStorage.getItem("token");
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/hotel/alluserhotels`, {
          params,
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data && res.data.success) {
          setHotels(res.data.hotels || []);
          setTotalHotels(res.data.totalHotels || 0);
          setTotalPages(res.data.totalPages || 1);
        } else if (Array.isArray(res.data)) {
          setHotels(res.data || []);
          setTotalHotels(res.data.length || 0);
          setTotalPages(Math.ceil((res.data.length || 0) / hotelsPerPage) || 1);
        }
      } catch (error) {
        console.log(error);
        setHotels([]);
        setTotalHotels(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    }

    loadHotels();
  }, [searching, sortBy, currentPage, filters]);

  useEffect(() => {
    const context = gsap.context(() => {
      gsap.from(".user-navbar, .user-hero", {
        autoAlpha: 0,
        duration: 0.7,
        y: -22,
        stagger: 0.1,
        ease: "power3.out",
      });
    }, pageRef);

    return () => context.revert();
  }, []);

  useEffect(() => {
    if (loading || !cardsRef.current?.children.length) return;

    const context = gsap.context(() => {
      gsap.from(cardsRef.current.children, {
        autoAlpha: 0,
        duration: 0.65,
        y: 28,
        stagger: 0.08,
        ease: "power3.out",
        clearProps: "all",
      });
    }, cardsRef);

    return () => context.revert();
  }, [loading, hotels.length, currentPage, searchQuery, sortBy]);

  const handleHotelClick = (hotel) => {
    if (!currentUser) {
      alert("Please login first to explore hotel details and book rooms!");
      navigate("/");
    } else {
      navigate("/hotelrooms", { state: { hotelData: hotel } });
    }
  };

  // Extract all hotel images for background slideshow
  const heroImages = hotels.flatMap((h) => h.images || []).filter(Boolean);
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const timer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const indexOfFirstHotel = (currentPage - 1) * hotelsPerPage;
  const indexOfLastHotel = Math.min(currentPage * hotelsPerPage, totalHotels);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    const hotelSection = document.getElementById("available-hotels-section");
    if (hotelSection) {
      hotelSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const filterCheckboxClass =
    "flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer hover:text-blue-600 dark:hover:text-sky-400 transition-colors";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 selection:bg-blue-500 selection:text-white" ref={pageRef}>
      <Navbar />

      {/* Hero Section with Automated Right-to-Left Sliding Background */}
      <div className="relative overflow-hidden py-24 px-5 mb-10 min-h-[460px] flex items-center justify-center">
        {heroImages.length > 0 ? (
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div
              className="flex h-full w-full transition-transform duration-1000 ease-out"
              style={{ transform: `translateX(-${bgIndex * 100}%)` }}
            >
              {heroImages.map((img, index) => (
                <div key={index} className="h-full w-full flex-shrink-0 relative">
                  <img
                    src={img}
                    alt={`Hero Background ${index + 1}`}
                    className="w-full h-full object-cover scale-105"
                  />
                </div>
              ))}
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/60 to-slate-950/85 backdrop-blur-[2px]" />
          </div>
        ) : (
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950" />
        )}

        {heroImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {heroImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setBgIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-500 ${idx === bgIndex
                    ? "w-8 bg-sky-400 shadow-md shadow-sky-400/50"
                    : "w-2 bg-white/40 hover:bg-white/70"
                  }`}
              />
            ))}
          </div>
        )}

        {/* Hero Content */}
        <div className="user-hero relative z-10 text-center max-w-4xl mx-auto w-full">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-5
            bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-sky-500/20 backdrop-blur-md text-sky-300 border border-sky-400/30 shadow-lg shadow-sky-500/10">
            <span className="animate-pulse">✨</span> Premium Hotel Stays
          </div>

          <h1 className="text-4xl sm:text-6xl font-black mb-5 bg-gradient-to-r from-white via-sky-100 to-blue-200 bg-clip-text text-transparent drop-shadow-2xl tracking-tight">
            Find Your Perfect Stay
          </h1>

          <p className="text-slate-200/90 text-lg sm:text-xl font-medium mb-10 max-w-2xl mx-auto drop-shadow-md leading-relaxed">
            Discover top-rated luxury hotels, suites, and comfortable rooms at unbeatable prices.
          </p>

          {/* Hero Search & Sort Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-2xl mx-auto backdrop-blur-xl bg-white/10 dark:bg-slate-900/40 p-3 rounded-3xl border border-white/20 dark:border-white/10 shadow-2xl shadow-black/40">
            <div className="relative w-full flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base">🔍</span>
              <input
                type="text"
                placeholder="Search by hotel name, city, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-5 py-3.5 rounded-2xl text-sm font-medium
                  bg-white/90 dark:bg-slate-900/90
                  border border-slate-200/60 dark:border-slate-700/60
                  text-slate-800 dark:text-slate-100
                  placeholder-slate-400 dark:placeholder-slate-500
                  focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-400/20
                  shadow-inner transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold bg-slate-200 dark:bg-slate-700 rounded-full w-5 h-5 flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-auto px-4 py-3.5 rounded-2xl text-sm font-bold
                bg-white/90 dark:bg-slate-900/90
                border border-slate-200/60 dark:border-slate-700/60
                text-slate-700 dark:text-slate-200
                focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-400/20
                shadow-inner cursor-pointer transition-all duration-200"
            >
              <option value="default">Sort By: Default</option>
              <option value="nameAsc">Name (A to Z)</option>
              <option value="nameDesc">Name (Z to A)</option>
              <option value="roomsHigh">Rooms (High to Low)</option>
              <option value="roomsLow">Rooms (Low to High)</option>
              <option value="cityAsc">City (A to Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area with Sidebar Filter */}
      <div className="w-full px-6 lg:px-12" id="available-hotels-section">
        <div className="flex items-center justify-between mb-8 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Available Hotels
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Handpicked luxury properties ready for booking
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white flex items-center gap-1.5 shadow-md shadow-blue-500/20"
            >
              🔍 {mobileFilterOpen ? "Hide Filters" : "Filter Hotels"}
            </button>

            {totalHotels > 0 && (
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">
                {totalHotels} {totalHotels === 1 ? "Hotel" : "Hotels"} Found
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-8 w-full items-start">
          {/* Filter Sidebar Component */}
          <aside className={`w-64 flex-shrink-0 ${mobileFilterOpen ? "block" : "hidden"} lg:block`}>
            <div className="sticky top-24 rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-1.5">
                  🔍 Filter Hotels
                </h3>
                <button
                  onClick={resetFilters}
                  className="text-xs text-blue-600 dark:text-sky-400 hover:underline font-bold"
                >
                  Reset
                </button>
              </div>

              {/* BED TYPE */}
              <div className="mb-4">
                <p className="text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase mb-2">
                  Bed Type
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    { name: "kingSizeBed", label: "🛏️ King Size" },
                    { name: "queenSizeBed", label: "🛏️ Queen Size" },
                    { name: "singleBed", label: "🛌 Single Bed" },
                    { name: "doubleBed", label: "🛏️ Double Bed" },
                  ].map((f) => (
                    <label key={f.name} className={filterCheckboxClass}>
                      <input
                        type="checkbox"
                        name={f.name}
                        checked={filters[f.name]}
                        onChange={handleFilterChange}
                        className="accent-blue-600 rounded"
                      />
                      {f.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* AMENITIES */}
              <div className="mb-4">
                <p className="text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase mb-2">
                  Amenities
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    { name: "ac", label: "❄️ AC" },
                    { name: "wifi", label: "📶 Free WiFi" },
                    { name: "tv", label: "📺 TV" },
                    { name: "geyser", label: "🚿 Geyser" },
                    { name: "miniFridge", label: "🧊 Mini Fridge" },
                    { name: "bathtub", label: "🛁 Bathtub" },
                    { name: "balcony", label: "🌅 Balcony" },
                    { name: "sofa", label: "🛋️ Sofa Set" },
                    { name: "locker", label: "🔐 Locker" },
                  ].map((f) => (
                    <label key={f.name} className={filterCheckboxClass}>
                      <input
                        type="checkbox"
                        name={f.name}
                        checked={filters[f.name]}
                        onChange={handleFilterChange}
                        className="accent-blue-600 rounded"
                      />
                      {f.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* SERVICES */}
              <div>
                <p className="text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase mb-2">
                  Services
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    { name: "roomService", label: "🍽️ Room Service" },
                    { name: "laundryService", label: "🧺 Laundry" },
                    { name: "housekeeping", label: "🧹 Housekeeping" },
                  ].map((f) => (
                    <label key={f.name} className={filterCheckboxClass}>
                      <input
                        type="checkbox"
                        name={f.name}
                        checked={filters[f.name]}
                        onChange={handleFilterChange}
                        className="accent-blue-600 rounded"
                      />
                      {f.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Hotel Grid Area */}
          <main className="flex-1 w-full">
            {loading ? (
              <div className="text-center py-28">
                <div className="relative inline-flex">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <div className="w-12 h-12 border-4 border-sky-400/30 rounded-full absolute inset-0"></div>
                </div>
                <p className="text-slate-400 dark:text-slate-500 text-sm font-medium mt-4">
                  Loading luxury hotels...
                </p>
              </div>
            ) : hotels.length === 0 ? (
              <div className="text-center py-24 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl max-w-md mx-auto">
                <div className="text-6xl mb-4 animate-bounce">🏨</div>
                <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mb-2">
                  No Hotels Found
                </h3>
                <p className="text-slate-400 dark:text-slate-500 text-sm px-6 mb-6">
                  We couldn't find any hotels matching your filter parameters.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-3 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25 transition-all duration-200"
                >
                  Clear Search & Filters
                </button>
              </div>
            ) : (
              <>
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-7"
                  ref={cardsRef}
                >
                  {hotels.map((hotel) => (
                    <div
                      key={hotel._id}
                      onClick={() => handleHotelClick(hotel)}
                      className="user-hotel-card group rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-md hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-500/40 dark:hover:border-sky-400/40 transition-all duration-300 ease-out flex flex-col cursor-pointer"
                    >
                      {/* Hotel Image Area */}
                      <div className="h-56 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                        {hotel.images && hotel.images.length > 0 ? (
                          <div className="flex h-full overflow-x-auto no-scrollbar">
                            {hotel.images.map((img, idx) => (
                              <img
                                key={idx}
                                src={img}
                                alt={`${hotel.hotelname} - ${idx + 1}`}
                                className="h-full w-auto flex-shrink-0 object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 text-sm gap-2">
                            <span className="text-4xl">🏨</span>
                            <span className="font-medium">Photo Unavailable</span>
                          </div>
                        )}

                        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/60 to-transparent pointer-events-none" />

                        {hotel.cityId?.cityName && (
                          <span className="absolute top-3.5 right-3.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-950/70 text-white backdrop-blur-md border border-white/10 shadow-lg">
                            📍 {hotel.cityId.cityName}
                          </span>
                        )}

                        {hotel.images && hotel.images.length > 1 && (
                          <span className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-950/70 text-white backdrop-blur-md border border-white/10">
                            📷 {hotel.images.length} photos
                          </span>
                        )}
                      </div>

                      {/* Hotel Info Content */}
                      <div className="p-5 flex flex-col gap-3 flex-1">
                        <div>
                          <h3 className="font-extrabold text-lg text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors">
                            {hotel.hotelname}
                          </h3>

                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                            <span className="text-blue-500">📍</span>
                            <span className="truncate">
                              {hotel.cityId?.cityName || "City"}, {hotel.stateId?.stateName || "State"}
                            </span>
                          </p>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[32px] leading-relaxed">
                          🏠 {hotel.hoteladdress}
                        </p>

                        <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 pt-3 border-t border-slate-100 dark:border-slate-800/80 mt-auto">
                          <span className="flex items-center gap-1 flex-wrap">
                            🛏️ <strong className="text-blue-600 dark:text-sky-400">{hotel.addedRoomsCount ?? 0}</strong> Added / <strong className="text-slate-800 dark:text-slate-200">{hotel.totalrooms || "N/A"}</strong> Total Rooms
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                            Verified ✓
                          </span>
                        </div>

                        <button
                          className="mt-1 w-full py-3 rounded-2xl text-sm font-extrabold text-white
                            bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500
                            shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/35
                            transition-all duration-300 transform group-hover:scale-[1.02] flex items-center justify-center gap-2"
                        >
                          <span>View Rooms & Book</span>
                          <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls Bar */}
                {totalPages > 1 && (
                  <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                      Showing <span className="font-bold text-slate-800 dark:text-slate-200">{indexOfFirstHotel + 1}</span> to{" "}
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {indexOfLastHotel}
                      </span>{" "}
                      of <span className="font-bold text-slate-800 dark:text-slate-200">{totalHotels}</span> hotels
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
      </div>
    </div>
  );
}

export default UserDashBoard;
