import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import CouponManagement from "./CouponManagement";
import AdminHotelManagement from "./AdminHotelManagement";
import AdminBookings from "./AdminBookings";
import AdminDashboardHome from "./AdminDashboardHome";

function AdminDashBoard() {
  const [activetab, SetActivetab] = useState("dashboard");

  return (
    <div className="dashboard-layout">
      <AdminSidebar activetab={activetab} SetActivetab={SetActivetab} />
      <main className="dashboard-main">
        {activetab === "dashboard" && <AdminDashboardHome />}
        {activetab === "coupon" && <CouponManagement />}
        {activetab === "hotel" && <AdminHotelManagement />}
        {activetab === "bookings" && <AdminBookings />}
      </main>
    </div>
  );
}

export default AdminDashBoard;