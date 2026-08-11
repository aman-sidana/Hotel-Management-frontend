import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";
import Navbar from "../genericComponents/Navbar";

function UserBooking() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const listRef = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [description, setDescription] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);
  const [reviewedIds, setReviewedIds] = useState(new Set());

  const currentUser = JSON.parse(localStorage.getItem("currentuser") || "null");

  const fetchBookings = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      const [response, ratingRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/booking/user-bookings`, {
          params: { userId: currentUser._id },
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/rating/view-rating`, {
          params: { userId: currentUser._id },
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: { ratings: [] } })),
      ]);

      if (response.data.success) {
        setBookings(response.data.bookings || []);
      }

      if (ratingRes.data && Array.isArray(ratingRes.data.ratings)) {
        const ratedSet = new Set();
        ratingRes.data.ratings.forEach((r) => {
          const bId = r.bookingId?._id || r.bookingId;
          if (bId) {
            ratedSet.add(bId.toString());
          }
        });
        setReviewedIds(ratedSet);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser?._id) {
      setLoading(false);
      return;
    }
    fetchBookings();
  }, [currentUser?._id]);

  useEffect(() => {
    if (loading || !listRef.current?.children.length) return;

    const ctx = gsap.context(() => {
      gsap.from(listRef.current.children, {
        opacity: 0,
        y: 25,
        duration: 0.5,
        stagger: 0.08,
        ease: "power3.out",
        clearProps: "all",
      });
    }, listRef);

    return () => ctx.revert();
  }, [loading, bookings.length]);

  const handleOpenRatingModal = (booking) => {
    setSelectedBooking(booking);
    setRatingValue(5);
    setDescription("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;

    try {
      setSubmittingRating(true);

      const details = {
        bookingId: selectedBooking._id,
        hotelId: selectedBooking.hotelId?._id || selectedBooking.hotelId,
        userId: currentUser._id,
        rating: ratingValue,
        description: description,
      };

      const token = localStorage.getItem("token");
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/rating/add-rating`, details, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        alert("Thank you! Your rating has been submitted successfully.");
        setReviewedIds((prev) => new Set(prev).add(selectedBooking._id.toString()));
        handleCloseModal();
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert(error.response?.data?.message || "Failed to submit rating.");
    } finally {
      setSubmittingRating(false);
    }
  };


  const statusBadgeClass = (status) => {
    const base = "inline-block px-2.5 py-1 rounded-full text-xs font-bold capitalize whitespace-nowrap";
    switch (status) {
      case "pending": return `${base} bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400`;
      case "approved": return `${base} bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400`;
      case "checkIn": return `${base} bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400`;
      case "checkOut": return `${base} bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400`;
      case "rejected":
      case "cancelled": return `${base} bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400`;
      default: return `${base} bg-slate-100 text-slate-500`;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Please Login</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">You need to be logged in to view your bookings.</p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 rounded-xl font-semibold text-sm text-white
              bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30
              transition-all duration-200"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-16">
      <Navbar />

      <div className="px-5 py-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold btn-action-secondary flex items-center gap-1.5 cursor-pointer"
            >
              ⬅️ Back
            </button>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              My Bookings
            </h1>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 dark:text-slate-500">Loading your booking history...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🧳</div>
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No Bookings Found</h3>
            <p className="text-slate-400 dark:text-slate-500 mb-6">You haven't reserved any hotel rooms yet.</p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 rounded-xl font-semibold text-sm text-white
                bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30
                transition-all duration-200"
            >
              Browse Available Hotels
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-5" ref={listRef}>
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="flex flex-col sm:flex-row rounded-2xl overflow-hidden border shadow-sm
                  bg-white dark:bg-slate-800
                  border-slate-200 dark:border-slate-700
                  hover:border-blue-400 dark:hover:border-blue-500
                  hover:shadow-md transition-all duration-200"
              >
                <div className="w-full sm:w-48 h-40 sm:h-auto bg-slate-100 dark:bg-slate-700 flex-shrink-0 overflow-hidden">
                  {booking.roomId?.images?.length > 0 ? (
                    <img src={booking.roomId.images[0]} alt="Room Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500 text-sm">🛏️ No Photo</div>
                  )}
                </div>

                <div className="flex-1 p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                          {booking.hotelId?.hotelname || "Hotel Reservation"}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Room #{booking.roomId?.roomNumber || "N/A"} · {booking.roomId?.roomType || "Standard"}
                        </p>
                      </div>
                      <span className={statusBadgeClass(booking.status)}>
                        {booking.status || "Pending"}
                      </span>
                    </div>

                    <div className="flex gap-6 mb-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Check In</p>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{formatDate(booking.startDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Check Out</p>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{formatDate(booking.endDate)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/50">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Total Amount</p>
                      <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">₹{booking.price}</p>
                    </div>

                    {booking.status === "checkOut" && (
                      reviewedIds.has(booking._id.toString()) ? (
                        <button
                          disabled
                          className="px-4 py-2 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 
                            bg-emerald-50 dark:bg-emerald-950/30 
                            border border-emerald-200 dark:border-emerald-800/50 
                            flex items-center gap-1.5 cursor-not-allowed opacity-80"
                        >
                          ✓ Reviewed
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenRatingModal(booking)}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400 
                            bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/30 dark:hover:bg-amber-900/40 
                            border border-amber-200 dark:border-amber-800/50 
                            transition-all duration-200 flex items-center gap-1.5 shadow-sm"
                        >
                          ⭐ Add Review
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold"
            >
              ✕
            </button>

            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">
              Rate Your Stay
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
              {selectedBooking?.hotelId?.hotelname || "Hotel Experience"}
            </p>

            <form onSubmit={handleSubmitRating} className="space-y-5">
              <div className="flex flex-col items-center justify-center py-2 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wider">
                  Select Rating
                </p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRatingValue(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="text-3xl transition-transform duration-100 hover:scale-110 focus:outline-none"
                    >
                      <span
                        className={(hoverRating || ratingValue) >= star ? "text-amber-400" : "text-slate-300 dark:text-slate-600"}
                      >
                        ★
                      </span>
                    </button>
                  ))}
                </div>
                <span className="text-xs font-medium text-amber-600 dark:text-amber-400 mt-2">
                  {ratingValue} out of 5 Stars
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Review Description
                </label>
                <textarea
                  rows="4"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us about room quality, service, cleanliness..."
                  className="w-full p-3.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 
                    border border-slate-200 dark:border-slate-700 
                    text-slate-800 dark:text-slate-100 
                    focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                ></textarea>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm text-slate-600 dark:text-slate-300 
                    bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRating}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm text-white 
                    bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 
                    disabled:opacity-50 transition-all"
                >
                  {submittingRating ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserBooking;