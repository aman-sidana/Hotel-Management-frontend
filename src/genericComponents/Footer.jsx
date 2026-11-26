import React from "react";
import { useNavigate } from "react-router-dom";

function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="w-full bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-slate-800 transition-colors duration-200">
      {/* Top Banner / Newsletter */}
      <div className="w-full border-b border-slate-200 dark:border-slate-800/80 py-10 px-6 lg:px-12 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-sky-50/80 dark:from-blue-950/40 dark:via-slate-900 dark:to-indigo-950/40 transition-colors duration-200">
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>✨</span> Subscribe to Exclusive Deals
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-lg">
              Get the latest discounts, secret promotional codes, and luxury hotel stay offers straight to your inbox.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto max-w-md">
            <input
              type="email"
              placeholder="Enter your email address..."
              className="w-full sm:w-72 px-4 py-3 rounded-2xl text-xs sm:text-sm bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 shadow-sm focus:outline-none focus:border-blue-500 dark:focus:border-sky-400 focus:ring-2 focus:ring-blue-500/20"
            />
            <button
              onClick={() => alert("Thank you for subscribing to InnSync Hotels newsletter!")}
              className="px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25 transition-all whitespace-nowrap cursor-pointer"
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="w-full px-6 lg:px-12 py-14 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-10">
        {/* Brand Column */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5 cursor-pointer w-fit group"
          >
            <img
              src="/innsync-logo.png"
              alt="InnSync Logo"
              className="w-9 h-9 object-contain group-hover:scale-105 transition-transform duration-200"
            />
            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              InnSync
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
            Experience ultimate comfort and world-class hospitality. Book premium hotel rooms, luxury suites, and verified stays across prime locations with instant confirmations.
          </p>

          <div className="flex items-center gap-3 mt-2">
            {[
              { icon: "🌐", label: "Website", url: "#" },
              { icon: "📱", label: "App", url: "#" },
              { icon: "💬", label: "Support", url: "#" },
              { icon: "📧", label: "Email", url: "mailto:support@innsync.com" },
            ].map((s, idx) => (
              <a
                key={idx}
                href={s.url}
                title={s.label}
                className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 border border-slate-200 dark:border-slate-700/80 shadow-sm flex items-center justify-center text-sm transition-all duration-200"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-sky-400 mb-4">
            Navigation
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
            <li>
              <button
                onClick={() => navigate("/")}
                className="hover:text-blue-600 dark:hover:text-white transition-colors cursor-pointer"
              >
                Explore Hotels
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/userbookings")}
                className="hover:text-blue-600 dark:hover:text-white transition-colors cursor-pointer"
              >
                My Bookings
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/resetpassword")}
                className="hover:text-blue-600 dark:hover:text-white transition-colors cursor-pointer"
              >
                Account Settings
              </button>
            </li>
          </ul>
        </div>

        {/* Contact & Support */}
        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-sky-400 mb-4">
            Support
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
            <li className="flex items-center gap-2">
              <span>📍</span> 100 Hospitality Way, Metro City
            </li>
            <li className="flex items-center gap-2">
              <span>📞</span> +1 (800) 555-SYNC
            </li>
            <li className="flex items-center gap-2">
              <span>✉️</span> help@innsync.com
            </li>
            <li className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> 24/7 Concierge Support
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-200 dark:border-slate-800/80 py-6 px-6 lg:px-12 bg-slate-100 dark:bg-slate-950 w-full transition-colors duration-200">
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} InnSync Hotels Inc. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Cookie Preferences</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
