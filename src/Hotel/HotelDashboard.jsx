import React, { useState } from "react";
import HotelSidebar from "./HotelSidebar";
import HotelRoomManagement from "./HotelRoomManagement";
import BookingManagement from "./BookingManagement";
import HotelDashboardHome from "./HotelDashboardHome";

function HotelDashboard() {
  const [activetab, SetActivetab] = useState("dashboard");

  return (
    <div className="dashboard-layout">
      <HotelSidebar activetab={activetab} SetActivetab={SetActivetab} />
      <main className="dashboard-main">
        {activetab === "dashboard" && <HotelDashboardHome />}
        {activetab === "room" && <HotelRoomManagement />}
        {activetab === "booking" && <BookingManagement />}
      </main>
    </div>
  );
}

export default HotelDashboard;