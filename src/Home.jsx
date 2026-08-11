import { useNavigate } from "react-router-dom";
import UseTheme from "./custom hooks/Usetheme";

import SuperAdminDashboard from "./SuperAdmin/SuperAdminDashboard";
import AdminDashBoard from "./Admin/AdminDashBoard";
import UserDashBoard from "./User/UserDashBoard";
import HotelDashboard from "./Hotel/HotelDashboard";

function Home() {
  const { theme, changeTheme } = UseTheme();
  const navigate = useNavigate();

  const loggedInUser = JSON.parse(localStorage.getItem("currentuser")) || {};

  function logoutuser() {
    localStorage.removeItem("token");
    localStorage.removeItem("currentuser");
    navigate("/");
  }

  const renderDashboardByRole = () => {
    switch (loggedInUser?.role?.toLowerCase()) {
      case "superadmin":
        return <SuperAdminDashboard />;
      case "admin":
        return <AdminDashBoard />;
      case "hotel":
        return <HotelDashboard />;
      case "user":
        return <UserDashBoard />;
      default:
        return (
          <div className="text-center py-16 text-slate-500 dark:text-slate-400">
            Unauthorized or unknown role.
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50">
      {renderDashboardByRole()}
    </div>
  );
}

export default Home;
