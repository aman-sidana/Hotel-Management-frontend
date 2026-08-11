import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import UseTheme from "../custom hooks/Usetheme";

function HotelSidebar({ activetab, SetActivetab }) {
  const navigate = useNavigate();
  const { theme, changeTheme } = UseTheme();
  const [hotelName, setHotelName] = useState("");
  const loggedInUser = JSON.parse(localStorage.getItem("currentuser")) || {};

  useEffect(() => {
    const fetchHotelInfo = async () => {
      try {
        if (!loggedInUser?._id) return;
        const token = localStorage.getItem("token");
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/hotel/allhotels`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data && res.data.hotels) {
          const myHotel = res.data.hotels.find(
            (h) => (h.adminId?._id || h.adminId) === loggedInUser._id
          );
          if (myHotel && myHotel.hotelname) {
            setHotelName(myHotel.hotelname);
            const currentUser = JSON.parse(localStorage.getItem("currentuser")) || {};
            if (currentUser.name !== myHotel.hotelname) {
              localStorage.setItem(
                "currentuser",
                JSON.stringify({ ...currentUser, name: myHotel.hotelname })
              );
            }
          }
        }
      } catch (err) {
        console.error("Error fetching hotel info for sidebar:", err);
      }
    };
    fetchHotelInfo();
  }, [loggedInUser._id]);

  const displayName = hotelName || loggedInUser.name || loggedInUser.username || "Hotel Manager";

  const menuItems = [
    { id: "dashboard", label: "📊 Dashboard" },
    { id: "room", label: "🛏️ Room Management" },
    { id: "booking", label: "📅 Booking Management" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentuser");
    navigate("/");
  };

  return (
    <aside className="sidebar-container flex flex-col justify-between">
      <div>
        <div className="sidebar-header border-b border-slate-200 dark:border-slate-700/70 p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              🏨 THE Guest's
            </h2>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30">
              Hotel Manager
            </span>
          </div>
          {displayName && (
            <div className="flex items-center gap-2.5 mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700/50">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-emerald-500/20 flex-shrink-0">
                {displayName[0].toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                  {displayName}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate capitalize">
                  {loggedInUser.role || "Hotel"}
                </p>
              </div>
            </div>
          )}
        </div>

        <nav className="sidebar-nav p-3 flex flex-col gap-1.5">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar-btn ${activetab === item.id ? "active" : ""}`}
              onClick={() => SetActivetab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-3.5 border-t border-slate-200 dark:border-slate-700/70 flex flex-col gap-2.5 bg-slate-50 dark:bg-slate-900/40">
        <button
          onClick={() => navigate("/resetpassword")}
          className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold
            bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200
            dark:bg-amber-500/15 dark:hover:bg-amber-500/25 dark:text-amber-400 dark:border-amber-500/30
            transition-all duration-200 flex items-center justify-center gap-2 active:scale-95"
        >
          <span>🔑</span> Reset Password
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={changeTheme}
            className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold
              bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200
              dark:bg-slate-700/80 dark:hover:bg-slate-600 dark:text-slate-200 dark:border-slate-600/50
              transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-95"
          >
            {theme === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>
          <button
            onClick={handleLogout}
            className="py-2 px-3 rounded-xl text-xs font-semibold
              bg-red-50 hover:bg-red-500 text-red-500 hover:text-white border border-red-200
              dark:bg-red-500/15 dark:hover:bg-red-500 dark:text-red-300 dark:border-red-500/30
              transition-all duration-200 flex items-center justify-center gap-1 active:scale-95"
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </aside>
  );
}

export default HotelSidebar;