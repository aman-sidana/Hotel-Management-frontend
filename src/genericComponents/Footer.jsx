import React from "react";
import { useNavigate } from "react-router-dom";

function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="w-full bg-slate-900 dark:bg-slate-950 text-slate-300 border-t border-slate-800 transition-colors duration-200">
      {/* Top Banner / Newsletter */}
      <div className="w-full border-b border-slate-800/80 py-10 px-6 lg:px-12 bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40">
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>✨</span> Subscribe to Exclusive Deals
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-lg">
              Get the latest discounts, secret promotional codes, and luxury hotel stay offers straight to your inbox.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto max-w-md">
            <input
              type="email"
              placeholder="Enter your email address..."
              className="w-full sm:w-72 px-4 py-3 rounded-2xl text-xs sm:text-sm bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
            />
            <button
              onClick={() => alert("Thank you for subscribing to THE Guest's Hotels newsletter!")}
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
            className="flex items-center gap-3 cursor-pointer w-fit group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white text-xl shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
              🏨
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-white">
                THE Guest's
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-sky-400 border border-sky-400/30">
                Hotels
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed max-w-md">
            Experience ultimate comfort and world-class hospitality. Book premium hotel rooms, luxury suites, and verified stays across prime locations with instant confirmations.
          </p>

          <div className="flex items-center gap-3 mt-2">
            {[
              { icon: "🌐", label: "Website", url: "#" },
              { icon: "📱", label: "App", url: "#" },
              { icon: "💬", label: "Support", url: "#" },
              { icon: "📧", label: "Email", url: "mailto:support@theguestshotels.com" },
            ].map((s, idx) => (
              <a
                key={idx}
                href={s.url}
                title={s.label}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-blue-600 hover:text-white border border-slate-700/80 flex items-center justify-center text-sm transition-all duration-200"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-sky-400 mb-4">
            Navigation
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li>
              <button
                onClick={() => navigate("/")}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Explore Hotels
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/userbookings")}
                className="hover:text-white transition-colors cursor-pointer"
              >
                My Bookings
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/resetpassword")}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Account Settings
              </button>
            </li>
          </ul>
        </div>

        {/* Contact & Support */}
        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-sky-400 mb-4">
            Support
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li className="flex items-center gap-2">
              <span>📍</span> 100 Hospitality Way, Metro City
            </li>
            <li className="flex items-center gap-2">
              <span>📞</span> +1 (800) 555-GUEST
            </li>
            <li className="flex items-center gap-2">
              <span>✉️</span> help@theguestshotels.com
            </li>
            <li className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> 24/7 Concierge Support
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800/80 py-6 px-6 lg:px-12 bg-slate-950 w-full">
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} THE Guest's Hotels Inc. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Cookie Preferences</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
