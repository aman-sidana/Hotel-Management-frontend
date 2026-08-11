import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import UseTheme from "./custom hooks/Usetheme";

import Login from "./genericComponents/Login";
import Signup from "./genericComponents/Signup";
import ResetPassword from "./genericComponents/ResetPassword";
import ForgetPassword from "./genericComponents/ForgetPassword";
import ProtectedRoute from "./genericComponents/ProtectedRoute";

import HotelForm from "./Hotel/HotelForm";
import CheckRequest from "./genericComponents/CheckRequest";

import Home from "./Home";
import Sidebar from "./SuperAdmin/Sidebar";
import StateManagement from "./SuperAdmin/StateManagent";
import DistrictManagement from "./SuperAdmin/DistrictManagement";
import CityManagement from "./SuperAdmin/CityManagement";
import HotelManagement from "./SuperAdmin/HotelManagement";
import CouponManagement from "./Admin/CouponManagement";

import UserDashBoard from "./User/UserDashBoard";

import AdminDashBoard from "./Admin/AdminDashBoard";
import AdminForm from "./Admin/AdminForm";
import CheckAdminRequest from "./Admin/CheckAdminRequest";
import RoomForm from "./Room/RoomForm";
import HotelRoomManagement from "./Hotel/HotelRoomManagement";

import HotelRoom from "./User/HotelRoom";
import UserBooking from "./User/UserBooking";

function App() {
  UseTheme();
  return (
    <div>
      <BrowserRouter>

        <Routes>
          <Route path="/" element={<UserDashBoard />} />

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forget" element={<ForgetPassword />} />
          <Route path="/resetpassword" element={<ResetPassword />} />
          <Route path="/adminform" element={<AdminForm />} />
          <Route path="/checkrequest" element={<CheckRequest />} />
          <Route path="/checkaddminrequest" element={<CheckAdminRequest />} />








          <Route path="/home" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/reset" element={
            <ProtectedRoute>
              <ResetPassword />
            </ProtectedRoute>
          } />

          <Route path="/state" element={
            <ProtectedRoute>
              <StateManagement />
            </ProtectedRoute>
          } />
          <Route path="/district" element={
            <ProtectedRoute>
              <DistrictManagement />
            </ProtectedRoute>
          } />
          <Route path="/city" element={
            <ProtectedRoute>
              <CityManagement />
            </ProtectedRoute>
          } />
          <Route path="/hotelmanage" element={
            <ProtectedRoute>
              <HotelManagement />
            </ProtectedRoute>
          } />

          <Route path="/coupon" element={
            <ProtectedRoute>
              <CouponManagement />
            </ProtectedRoute>
          } />

          <Route path="/sidebar" element={
            <ProtectedRoute>
              <Sidebar />
            </ProtectedRoute>
          } />


          <Route path="/admindashboard" element={
            <ProtectedRoute>
              <AdminDashBoard />
            </ProtectedRoute>
          } />
          <Route path="/hotelform" element={
            <ProtectedRoute>
              <HotelForm />
            </ProtectedRoute>
          } />

          <Route path="/roomform" element={
            <ProtectedRoute>
              <RoomForm />
            </ProtectedRoute>
          } />

          <Route path="/hotelroommanage" element={
            <ProtectedRoute>
              < HotelRoomManagement />
            </ProtectedRoute>
          } />
          <Route path="/hotelrooms" element={
            <ProtectedRoute>
              <HotelRoom />
            </ProtectedRoute>
          } />
          <Route path="/userbookings" element={
            <ProtectedRoute>
              <UserBooking />
            </ProtectedRoute>
          } />



        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
