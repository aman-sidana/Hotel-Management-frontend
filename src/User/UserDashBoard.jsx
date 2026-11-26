import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";
import UseTheme from "../custom hooks/Usetheme";
import Navbar from "../genericComponents/Navbar";
import Footer from "../genericComponents/Footer";
import useSearching from "../custom hooks/useSearching";

const DEFAULT_HERO_HOTELS = [
  {
    url: "/luxury_hotel_banner.jpg",
    title: "The Grand Horizon Luxury Resort & Spa",
    location: "Bali, Indonesia",
  },
  {
    url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2070&q=80",
    title: "Palais Grand Royale & Royal Suites",
    location: "Paris, France",
  },
  {
    url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=2080&q=80",
    title: "Azure Cliffside Marina & Villas",
    location: "Santorini, Greece",
  },
  {
    url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2070&q=80",
    title: "Aura Oceanfront Lagoon Sanctuary",
    location: "Maldives",
  },
  {
    url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=2070&q=80",
    title: "The Skyview Luxury Penthouse Collection",
    location: "Dubai, UAE",
  },
];

const POPULAR_DESTINATIONS = [
  {
    name: "Goa",
    tagline: "Beaches & Coastal Resorts",
    img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
    count: "45+ Luxury Stays",
  },
  {
    name: "Jaipur",
    tagline: "Royal Palaces & Heritage",
    img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80",
    count: "38+ Heritage Hotels",
  },
  {
    name: "Mumbai",
    tagline: "Coastal Metropolis & Suites",
    img: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80",
    count: "60+ Prime Hotels",
  },
  {
    name: "Manali",
    tagline: "Snow & Alpine Escapes",
    img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
    count: "29+ Scenic Stays",
  },
  {
    name: "Kerala",
    tagline: "Backwaters & Tropical Serenity",
    img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
    count: "34+ Eco Resorts",
  },
  {
    name: "Bengaluru",
    tagline: "Garden City & Modern Luxury",
    img: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80",
    count: "52+ Business Hotels",
  },
];

const TESTIMONIALS = [
  {
    name: "Aarav Sharma",
    role: "Verified Guest • Mumbai",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    review: "Booking through InnSync was the smoothest experience. The verified luxury suite in Goa was spotless and matched the photos 100%!",
    rating: 5,
    hotel: "Azure Marina Resort",
  },
  {
    name: "Priya Nair",
    role: "Solo Traveler • Bengaluru",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    review: "Instant confirmation and zero hassle at check-in. The room views and amenities in Jaipur were majestic. Highly recommend InnSync!",
    rating: 5,
    hotel: "Palais Grand Royale",
  },
  {
    name: "Rohan & Sneha",
    role: "Honeymooners • Delhi",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    review: "Found an unbelievable last-minute deal for our mountain anniversary trip to Manali. Customer support answered all our questions in minutes.",
    rating: 5,
    hotel: "Alpine Haven Suites",
  },
];

function UserDashBoard() {
  const navigate = useNavigate();
  const { theme, changeTheme } = UseTheme();

  const [hotels, setHotels] = useState([]);
  const [totalHotels, setTotalHotels] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const hotelsPerPage = 16;

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

  const heroImages = hotels.flatMap((h) => h.images || []).filter(Boolean);
  const activeHeroSlides =
    heroImages.length > 0
      ? heroImages.map((img, idx) => ({
          url: img,
          title: hotels[idx]?.hotelname || "Luxury Verified Hotel",
          location: hotels[idx]?.cityId?.cityName || "Prime Destination",
        }))
      : DEFAULT_HERO_HOTELS;

  const [bgIndex, setBgIndex] = useState(0);
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("innsync_favorites")) || [];
    } catch {
      return [];
    }
  });

  const toggleWishlist = (hotelId) => {
    setFavorites((prev) => {
      const next = prev.includes(hotelId)
        ? prev.filter((id) => id !== hotelId)
        : [...prev, hotelId];
      localStorage.setItem("innsync_favorites", JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    if (activeHeroSlides.length <= 1) return;
    const timer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % activeHeroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeHeroSlides.length]);

  const handleSelectDestination = (destName) => {
    setSearchQuery(destName);
    const hotelSection = document.getElementById("available-hotels-section");
    if (hotelSection) {
      hotelSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText("INNSYNC20");
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2500);
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const hotelSection = document.getElementById("available-hotels-section");
    if (hotelSection) {
      hotelSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const indexOfFirstHotel = (currentPage - 1) * hotelsPerPage;
  const indexOfLastHotel = Math.min(currentPage * hotelsPerPage, totalHotels);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    const hotelSection = document.getElementById("available-hotels-section");
    if (hotelSection) {
      hotelSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between selection:bg-blue-500 selection:text-white" ref={pageRef}>
      <Navbar />

      {/* ============================================================== */}
      {/* 1. ELEGANT LUXURY HERO WITH FLOATING AIRBNB-STYLE SEARCH PILL  */}
      {/* ============================================================== */}
      <div className="relative mx-3 sm:mx-6 lg:mx-8 my-3 rounded-[2.5rem] overflow-hidden min-h-[500px] lg:min-h-[560px] flex items-center justify-center px-4 sm:px-8 lg:px-12 py-16 shadow-2xl border border-slate-200/50 dark:border-slate-800">
        {/* Background Rotating Slideshow */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {activeHeroSlides.map((slide, index) => {
            const isActive = index === bgIndex;
            return (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  isActive ? "opacity-100 scale-105" : "opacity-0 scale-100"
                } transform transition-transform duration-[7000ms] ease-out`}
              >
                <img
                  src={slide.url}
                  alt={slide.title}
                  className="w-full h-full object-cover object-center"
                />
              </div>
            );
          })}

          {/* Clean Natural Gradient Overlay - Bright & Inviting */}
          <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[1px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/30" />
        </div>

        {/* Hero Central Content */}
        <div className="user-hero relative z-10 text-center max-w-4xl mx-auto w-full space-y-6">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider
            bg-slate-900/50 backdrop-blur-md text-sky-200 border border-white/20 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Curated Stays & Luxury Resorts Worldwide</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-xl">
            Discover Exceptional Stays <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-sky-200 via-blue-200 to-indigo-200 bg-clip-text text-transparent">
              Around The World
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-200 text-sm sm:text-base font-medium max-w-xl mx-auto drop-shadow-md leading-relaxed">
            Handpicked luxury suites, boutique beach resorts, and private villas with verified amenities and instant confirmation.
          </p>

          {/* ============================================================== */}
          {/* FLOATING AIRBNB-INSPIRED UNIFIED SEARCH PILL */}
          {/* ============================================================== */}
          <form
            onSubmit={handleSearchSubmit}
            className="w-full max-w-4xl mx-auto bg-white/95 dark:bg-[#111827]/95 backdrop-blur-2xl p-2 sm:p-2.5 rounded-3xl md:rounded-full shadow-2xl border border-white/80 dark:border-sky-500/25 dark:shadow-[0_20px_50px_rgba(8,112,184,0.22)]"
          >
            <div className="flex flex-col md:flex-row items-center divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800 text-left">
              {/* Field 1: Destination / Where */}
              <div className="flex-1 w-full px-5 py-2.5">
                <span className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Where
                </span>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Search hotel name, city..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-slate-900 dark:text-white text-sm sm:text-base font-bold placeholder-slate-400 focus:outline-none pr-6"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-0 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Field 2: Dates */}
              <div className="w-full md:w-64 px-5 py-2.5">
                <span className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Dates
                </span>
                <input
                  type="text"
                  onFocus={(e) => (e.target.type = "date")}
                  onBlur={(e) => {
                    if (!e.target.value) e.target.type = "text";
                  }}
                  placeholder="Check-in — Check-out"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full bg-transparent text-slate-900 dark:text-white text-sm font-semibold placeholder-slate-400 focus:outline-none cursor-pointer"
                />
              </div>

              {/* Field 3: Search CTA */}
              <div className="w-full md:w-auto p-1">
                <button
                  type="submit"
                  className="w-full md:w-auto px-7 py-3.5 rounded-2xl md:rounded-full text-sm font-extrabold text-white
                    bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500
                    shadow-lg shadow-blue-500/35 transition-all transform hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>🔍</span>
                  <span>Search Stays</span>
                </button>
              </div>
            </div>
          </form>

          {/* Clean Trust Tags Strip */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 pt-1 text-xs text-slate-200 font-semibold drop-shadow">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/40 backdrop-blur-md border border-white/10">
              <span>🛡️</span> 100% Verified
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/40 backdrop-blur-md border border-white/10">
              <span>⚡</span> Instant Confirmation
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/40 backdrop-blur-md border border-white/10">
              <span>💰</span> Best Price Guarantee
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/40 backdrop-blur-md border border-white/10">
              <span className="text-amber-400">★★★★★</span> 4.9/5 Rating
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. POPULAR DESTINATIONS SHOWCASE */}
      {/* ============================================================== */}
      <section className="w-full px-4 sm:px-8 lg:px-12 py-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-sky-600 dark:text-sky-400">
              Inspiration for your next getaway
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
              Explore Popular Destinations
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Handpicked luxury stays across India's most loved travel hotspots
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            Click any city to view properties
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {POPULAR_DESTINATIONS.map((dest) => (
            <div
              key={dest.name}
              onClick={() => handleSelectDestination(dest.name)}
              className="group relative rounded-3xl overflow-hidden aspect-[4/5] cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5"
            >
              <img
                src={dest.img}
                alt={dest.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3.5 text-white">
                <h3 className="font-extrabold text-base sm:text-lg group-hover:text-sky-300 transition-colors">
                  {dest.name}
                </h3>
                <p className="text-[11px] text-slate-300 truncate">
                  {dest.tagline}
                </p>
                <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/20 backdrop-blur-md">
                  {dest.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. SEASONAL PROMO COUPON BANNER */}
      {/* ============================================================== */}
      <section className="w-full px-4 sm:px-8 lg:px-12 py-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-600 p-6 sm:p-8 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 border border-white/20">
          <div className="space-y-1.5 text-center md:text-left">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-md border border-white/25">
              🎉 Exclusive Welcome Offer
            </span>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">
              Get Flat 20% OFF On Your First Luxury Hotel Stay
            </h3>
            <p className="text-xs sm:text-sm text-sky-100 max-w-xl">
              Use code <strong className="text-white bg-white/20 px-2 py-0.5 rounded-md font-mono">INNSYNC20</strong> at checkout to unlock guaranteed savings across verified 5-star properties.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyCoupon}
              className="px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold text-slate-950 bg-white hover:bg-sky-50 shadow-xl transition-all transform hover:scale-105 cursor-pointer flex items-center gap-2"
            >
              <span>{copiedCoupon ? "✓ Copied!" : "📋 Copy Code"}</span>
            </button>
            <button
              onClick={() => {
                const hotelSection = document.getElementById("available-hotels-section");
                if (hotelSection) hotelSection.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold text-white bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all"
            >
              Explore Deals →
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. AVAILABLE HOTELS SECTION */}
      {/* ============================================================== */}
      <div className="w-full px-4 sm:px-8 lg:px-12 my-12 flex-1" id="available-hotels-section">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-4 border-b border-slate-200 dark:border-slate-800 gap-4">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-sky-600 dark:text-sky-400">
              Verified Properties
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              Available Hotels & Suites
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Showing handpicked luxury properties with real-time reservation confirmation
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold
                bg-white dark:bg-[#111827]
                border border-slate-200 dark:border-slate-800
                text-slate-700 dark:text-slate-200
                focus:outline-none focus:border-sky-400 shadow-sm cursor-pointer"
            >
              <option value="default">Sort: Default</option>
              <option value="nameAsc">Name (A to Z)</option>
              <option value="nameDesc">Name (Z to A)</option>
              <option value="roomsHigh">Rooms (High to Low)</option>
              <option value="roomsLow">Rooms (Low to High)</option>
              <option value="cityAsc">City (A to Z)</option>
            </select>

            {/* Filter Trigger Button */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all duration-200 shadow-sm ${
                Object.values(filters).filter(Boolean).length > 0
                  ? "bg-blue-600 text-white shadow-blue-500/25 ring-2 ring-blue-400/50"
                  : "bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-sky-500/50"
              }`}
            >
              <span>🔍</span>
              <span>Filters</span>
              {Object.values(filters).filter(Boolean).length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-400 text-slate-950">
                  {Object.values(filters).filter(Boolean).length}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="w-full">
          <main className="w-full">
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
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                  ref={cardsRef}
                >
                  {hotels.map((hotel) => (
                    <div
                      key={hotel._id}
                      onClick={() => handleHotelClick(hotel)}
                      className="user-hotel-card group rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#111827]/95 shadow-md hover:shadow-2xl hover:shadow-blue-500/15 dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)] dark:hover:shadow-[0_20px_40px_rgba(14,165,233,0.18)] hover:border-blue-500/40 dark:hover:border-sky-400/50 transition-all duration-300 ease-out flex flex-col cursor-pointer transform hover:-translate-y-1.5"
                    >
                      {/* Card Image Banner - 100% Full-bleed */}
                      <div className="h-60 bg-slate-100 dark:bg-slate-900/80 relative overflow-hidden rounded-t-3xl">
                        {hotel.images && hotel.images.length > 0 ? (
                          <img
                            src={hotel.images[0]}
                            alt={hotel.hotelname}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 text-sm gap-2">
                            <span className="text-4xl">🏨</span>
                            <span className="font-medium">Photo Preview</span>
                          </div>
                        )}

                        {/* Subtle Bottom Vignette */}
                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent pointer-events-none" />

                        {/* Top-Left: Verified Luxury Glass Badge */}
                        <div className="absolute top-3.5 left-3.5">
                          <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-slate-950/65 backdrop-blur-md text-emerald-300 border border-white/20 shadow-lg flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span>Verified Luxury</span>
                          </span>
                        </div>

                        {/* Top-Right: Glassmorphic Wishlist / Heart Toggle */}
                        <div className="absolute top-3.5 right-3.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWishlist(hotel._id);
                            }}
                            className="w-8 h-8 rounded-full bg-slate-950/60 hover:bg-slate-950/85 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-200 transform hover:scale-110 shadow-lg cursor-pointer"
                            title={favorites.includes(hotel._id) ? "Remove from favorites" : "Add to favorites"}
                          >
                            <span className="text-sm">
                              {favorites.includes(hotel._id) ? "❤️" : "🤍"}
                            </span>
                          </button>
                        </div>

                        {/* Bottom-Right: Star Rating Pill */}
                        <span className="absolute bottom-3 right-3.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-slate-950/80 backdrop-blur-md border border-white/15 text-amber-300 shadow-md flex items-center gap-1">
                          <span>★</span> 4.8
                        </span>
                      </div>

                      {/* Card Body */}
                      <div className="p-5 flex flex-col gap-3.5 flex-1">
                        <div>
                          <h3 className="font-extrabold text-lg text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors">
                            {hotel.hotelname}
                          </h3>

                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                            <span className="text-blue-500 text-sm">📍</span>
                            <span className="truncate">
                              {hotel.cityId?.cityName || "Prime Location"}, {hotel.stateId?.stateName || "India"}
                            </span>
                          </p>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-300 line-clamp-1 leading-relaxed">
                          {hotel.hoteladdress}
                        </p>

                        {/* Micro Amenities Badges */}
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-200 flex-wrap">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                            📶 Free WiFi
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                            ❄️ AC
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                            🏊 Pool
                          </span>
                        </div>

                        {/* Price & Availability Strip */}
                        <div className="flex items-center justify-between pt-3.5 border-t border-slate-100 dark:border-slate-800/80 mt-auto">
                          <div className="flex flex-col">
                            {hotel.startingPrice ? (
                              <>
                                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">
                                  Starting from
                                </span>
                                <div className="flex items-baseline gap-1">
                                  <span className="text-xl font-black text-slate-900 dark:text-white">
                                    ₹{hotel.startingPrice.toLocaleString("en-IN")}
                                  </span>
                                  <span className="text-[11px] text-slate-400 font-medium">/ night</span>
                                </div>
                              </>
                            ) : (
                              <>
                                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">
                                  Pricing
                                </span>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                  Check Details
                                </span>
                              </>
                            )}
                          </div>

                          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-1.5 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>{hotel.addedRoomsCount ?? 0} Rooms Left</span>
                          </span>
                        </div>

                        {/* Action CTA Button */}
                        <button
                          className="mt-1 w-full py-3 rounded-2xl text-xs sm:text-sm font-extrabold text-white
                            bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500
                            shadow-md shadow-blue-500/25 group-hover:shadow-blue-500/40
                            transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <span>View Rooms & Book</span>
                          <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

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
                              className={`w-9 h-9 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                                currentPage === pageNum
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

      {/* ============================================================== */}
      {/* 5. WHY CHOOSE INNSYNC FEATURE SECTION */}
      {/* ============================================================== */}
      <section className="w-full px-4 sm:px-8 lg:px-12 py-16 bg-slate-100/70 dark:bg-[#0f172a]/50 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="w-full space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-sky-600 dark:text-sky-400">
              The InnSync Hospitality Difference
            </span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Why Travelers Love Booking With Us
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Designed from the ground up for seamless luxury, verified cleanliness, and peace of mind.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 shadow-lg dark:shadow-[0_8px_25px_rgba(0,0,0,0.4)] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-sky-400 flex items-center justify-center text-2xl font-bold">
                🛡️
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                100% Verified Properties
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed">
                Every listed hotel undergoes rigorous quality inspection for safety, clean linens, and premium amenities.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 shadow-lg dark:shadow-[0_8px_25px_rgba(0,0,0,0.4)] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center text-2xl font-bold">
                ⚡
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Zero-Wait Digital Check-in
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed">
                Skip front-desk queues. Receive instant digital booking passes directly on your device.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 shadow-lg dark:shadow-[0_8px_25px_rgba(0,0,0,0.4)] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl font-bold">
                💰
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Best Rate Guarantee
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed">
                Direct partnerships with hotel owners mean zero hidden convenience fees and exclusive discounts.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 shadow-lg dark:shadow-[0_8px_25px_rgba(0,0,0,0.4)] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl font-bold">
                🕒
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                24/7 Dedicated Concierge
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed">
                Our hospitality specialists are available around the clock to assist with custom requests and bookings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 6. VERIFIED GUEST TESTIMONIALS */}
      {/* ============================================================== */}
      <section className="w-full px-4 sm:px-8 lg:px-12 py-16 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs uppercase font-extrabold tracking-widest text-sky-600 dark:text-sky-400">
            Real Experiences
          </span>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Loved By Over 50,000+ Guests
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Here's what our travelers have to say about their stays with InnSync.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="p-7 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 shadow-xl dark:shadow-[0_8px_25px_rgba(0,0,0,0.4)] flex flex-col justify-between gap-6"
            >
              <div className="space-y-4">
                <div className="flex text-amber-400 text-sm">
                  {"★".repeat(t.rating)}
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  "{t.review}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {t.name}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {t.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Filter Modal Popup */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md transition-opacity">
          {/* Backdrop Click */}
          <div
            className="fixed inset-0"
            onClick={() => setMobileFilterOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-10 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0b0f19]/70">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🔍</span>
                <h3 className="font-extrabold text-slate-800 dark:text-white text-base">
                  Filter Hotels
                </h3>
                {Object.values(filters).filter(Boolean).length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-sky-400">
                    {Object.values(filters).filter(Boolean).length} Active
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {Object.values(filters).filter(Boolean).length > 0 && (
                  <button
                    onClick={resetFilters}
                    className="text-xs text-blue-600 dark:text-sky-400 hover:underline font-bold"
                  >
                    Reset
                  </button>
                )}
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center font-bold text-sm transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Bed Type */}
              <div>
                <p className="text-[11px] font-extrabold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-3">
                  Bed Type
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { name: "kingSizeBed", label: "🛏️ King Size" },
                    { name: "queenSizeBed", label: "🛏️ Queen Size" },
                    { name: "singleBed", label: "🛌 Single Bed" },
                    { name: "doubleBed", label: "🛏️ Double Bed" },
                  ].map((f) => (
                    <label
                      key={f.name}
                      className={`flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-semibold cursor-pointer transition-all ${filters[f.name]
                          ? "bg-blue-50 dark:bg-blue-950/50 border-blue-500 text-blue-700 dark:text-blue-300 shadow-sm"
                          : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
                        }`}
                    >
                      <input
                        type="checkbox"
                        name={f.name}
                        checked={filters[f.name]}
                        onChange={handleFilterChange}
                        className="accent-blue-600 w-4 h-4 rounded cursor-pointer"
                      />
                      <span>{f.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div>
                <p className="text-[11px] font-extrabold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-3">
                  Amenities
                </p>
                <div className="grid grid-cols-2 gap-2.5">
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
                    <label
                      key={f.name}
                      className={`flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-semibold cursor-pointer transition-all ${filters[f.name]
                          ? "bg-blue-50 dark:bg-blue-950/50 border-blue-500 text-blue-700 dark:text-blue-300 shadow-sm"
                          : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
                        }`}
                    >
                      <input
                        type="checkbox"
                        name={f.name}
                        checked={filters[f.name]}
                        onChange={handleFilterChange}
                        className="accent-blue-600 w-4 h-4 rounded cursor-pointer"
                      />
                      <span>{f.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Services */}
              <div>
                <p className="text-[11px] font-extrabold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-3">
                  Services
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { name: "roomService", label: "🍽️ Room Service" },
                    { name: "laundryService", label: "🧺 Laundry" },
                    { name: "housekeeping", label: "🧹 Housekeeping" },
                  ].map((f) => (
                    <label
                      key={f.name}
                      className={`flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-semibold cursor-pointer transition-all ${filters[f.name]
                          ? "bg-blue-50 dark:bg-blue-950/50 border-blue-500 text-blue-700 dark:text-blue-300 shadow-sm"
                          : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
                        }`}
                    >
                      <input
                        type="checkbox"
                        name={f.name}
                        checked={filters[f.name]}
                        onChange={handleFilterChange}
                        className="accent-blue-600 w-4 h-4 rounded cursor-pointer"
                      />
                      <span>{f.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-3">
              <button
                onClick={resetFilters}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
              >
                Reset All
              </button>

              <button
                onClick={() => setMobileFilterOpen(false)}
                className="px-6 py-2.5 rounded-2xl text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/20 transition-all"
              >
                Show Results ({totalHotels})
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default UserDashBoard;
