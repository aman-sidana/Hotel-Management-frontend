import React, { useState } from "react";
import Sidebar from "./Sidebar";
import StateManagement from "./StateManagent";
import DistrictManagement from "./DistrictManagement";
import CityManagement from "./CityManagement";
import HotelManagement from "./HotelManagement";
import AdminManagement from "./AdminManagement";
import AdminForm from "../Admin/AdminForm";
import SuperAdminDashboardHome from "./SuperAdminDashboardHome";

function SuperAdminDashboard() {
  const [activetab, setActivetab] = useState("dashboard");

  return (
    <div className="dashboard-layout">
      <Sidebar activetab={activetab} SetActivetab={setActivetab} />

      <main className="dashboard-main">
        {activetab === "dashboard" && <SuperAdminDashboardHome />}
        {activetab === "adminform" && <AdminForm />}
        {activetab === "state" && <StateManagement />}
        {activetab === "district" && <DistrictManagement />}
        {activetab === "city" && <CityManagement />}
        {activetab === "admin" && <AdminManagement />}
        {activetab === "hotel" && <HotelManagement />}
      </main>
    </div>
  );
}


export default SuperAdminDashboard;