import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import UseTheme from "../custom hooks/Usetheme";

function Navbar() {

  const navigate = useNavigate();
  const location = useLocation();
  const { theme, changeTheme } = UseTheme();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem("currentuser")) || null;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const firstLetter = (currentUser?.name || currentUser?.username || "U")[0].toUpperCase();

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/85 dark:bg-slate-900/85 border-b border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors duration-200">
      <div className="w-full px-6 lg:px-10 h-16 flex items-center justify-between gap-4">

        {/* Brand Logo */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white text-xl shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
            🏨
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-blue-700 via-sky-600 to-indigo-600 dark:from-white dark:via-sky-300 dark:to-blue-400 bg-clip-text text-transparent">
                THE Guest's
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                Hotels
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: Theme Toggle & Profile Dropdown */}
        <div className="flex items-center gap-3">
          {/* Dark / Light Mode Switcher */}
          <button
            onClick={changeTheme}
            title="Toggle Light/Dark Theme"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg
              bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200
              border border-slate-200 dark:border-slate-700
              hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 active:scale-95"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          {currentUser ? (
            <div className="relative" ref={profileMenuRef}>
              {/* Profile Avatar Button */}
              <button
                onClick={() => setShowProfileMenu((prev) => !prev)}
                title={currentUser.name || currentUser.username || "Profile"}
                className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base flex items-center justify-center shadow-md shadow-blue-600/20 transition-all duration-200 active:scale-95 cursor-pointer"
              >
                {firstLetter}
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* User Profile Summary */}
                  <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                      {currentUser.name || currentUser.username || "User"}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 capitalize mt-0.5">
                      Role: <span className="font-semibold text-slate-600 dark:text-slate-300">{currentUser.role || "Guest"}</span>
                    </p>
                  </div>

                  {/* Options */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate("/userbookings");
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 flex items-center gap-2.5 transition-colors"
                    >
                      <span>🧳</span> My Bookings
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate("/resetpassword");
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 flex items-center gap-2.5 transition-colors"
                    >
                      <span>🔑</span> Reset Password
                    </button>
                  </div>

                  {/* Logout Action */}
                  <div className="border-t border-slate-100 dark:border-slate-700 pt-1">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        localStorage.removeItem("currentuser");
                        navigate("/");
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2.5 transition-colors"
                    >
                      <span>🚪</span> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white
                bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30 transition-all duration-200"
            >
              Login
            </button>
          )}
        </div>

      </div>
    </header>
  );
}

export default Navbar;
