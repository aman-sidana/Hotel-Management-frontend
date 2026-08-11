import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

import Navbar from "../genericComponents/Navbar";

function HotelForm() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentUser = JSON.parse(localStorage.getItem("currentuser")) || {};

  const isSuperAdmin = currentUser?.role?.toLowerCase() === "superadmin";
  const isAdmin = currentUser?.role?.toLowerCase() === "admin";

  const existingHotel = location.state?.hotelData || null;
  const isEditMode = !!existingHotel;

  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [admins, setAdmins] = useState([]);

  const [otp, setOtp] = useState("");
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [emailVerified, setEmailVerified] = useState(isEditMode || isSuperAdmin);
  const [loading, setLoading] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState([]);

  const [form, setForm] = useState({
    hotelname: existingHotel?.hotelname || "",
    hotelphone: existingHotel?.hotelphone || "",
    email: existingHotel?.hotelemail || "",
    stateId: existingHotel?.stateId?._id || existingHotel?.stateId || "",
    districtId: existingHotel?.districtId?._id || existingHotel?.districtId || "",
    cityId: existingHotel?.cityId?._id || existingHotel?.cityId || "",
    hoteladdress: existingHotel?.hoteladdress || "",
    totalrooms: existingHotel?.totalrooms || "",
    totalstaff: existingHotel?.totalstaff || "",
    adminId: existingHotel?.adminId?._id || existingHotel?.adminId || (isAdmin ? currentUser?._id : ""),
  });

  useEffect(() => {
    getStates(); getDistricts(); getCities();
    if (isSuperAdmin) { getalladmin(); }
  }, [isSuperAdmin]);

  const getalladmin = async () => {
    try {
      const token = localStorage.getItem("token");
      const result = await axios.get(`${import.meta.env.VITE_API_URL}/admin/alladmin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmins(result.data);
    } catch (error) { console.log(error.response || error); }
  };

  const getStates = async () => {
    try {
      const result = await axios.get(`${import.meta.env.VITE_API_URL}/state/getstates`);
      setStates(result.data);
    } catch (error) { console.log(error); }
  };

  const getDistricts = async () => {
    try {
      const result = await axios.get(`${import.meta.env.VITE_API_URL}/district/getdistricts`);
      setDistricts(result.data);
    } catch (error) { console.log(error); }
  };

  const getCities = async () => {
    try {
      const result = await axios.get(`${import.meta.env.VITE_API_URL}/city/getcities`);
      setCities(result.data);
    } catch (error) { console.log(error); }
  };

  const sendOTP = async () => {
    if (!form.email) { return alert("Please enter your email address first."); }
    try {
      setLoading(true);
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/hotel/sendhotelotp`, { email: form.email });
      alert(res.data.message);
      setShowOtpBox(true);
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp) { return alert("Please enter the OTP sent to your email."); }
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/hotel/verifyotp`, { email: form.email, otp });
      alert(res.data.message);
      setEmailVerified(true);
      setShowOtpBox(false);
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Invalid or Expired OTP");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setSelectedFiles([...e.target.files]);
  };

  const submitHotel = async () => {
    if (isSuperAdmin && !isEditMode) {
      if (!form.adminId) { return alert("Please map an Admin to manage this hotel configuration."); }
      try {
        const payload = {
          hotelname: form.hotelname, hotelphone: form.hotelphone, hotelemail: form.email,
          stateId: form.stateId, districtId: form.districtId, cityId: form.cityId,
          hoteladdress: form.hoteladdress, totalrooms: form.totalrooms,
          totalstaff: form.totalstaff, adminId: form.adminId,
        };
        const token = localStorage.getItem("token");
        await axios.post(`${import.meta.env.VITE_API_URL}/hotel/super-admin-add`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Hotel Registered & Pre-Approved Successfully!");
        setForm({ hotelname: "", hotelphone: "", email: "", stateId: "", districtId: "", cityId: "", hoteladdress: "", totalrooms: "", totalstaff: "", adminId: "" });
        return navigate("/home");
      } catch (error) {
        console.log(error);
        return alert(error.response?.data?.message || "Superadmin creation flow failed");
      }
    }

    if (!emailVerified && !isEditMode) { return alert("Please verify your email address via OTP before submitting."); }

    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      if (key === "email") { formData.append("hotelemail", form.email); }
      else { formData.append(key, form[key]); }
    });
    selectedFiles.forEach((file) => { formData.append("images", file); });

    try {
      const token = localStorage.getItem("token");
      if (isEditMode) {
        await axios.patch(`${import.meta.env.VITE_API_URL}/hotel/updaterequest?id=${existingHotel._id}`, formData, { headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` } });
        alert("Hotel Request Updated Successfully");
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/hotel/hotelrequest`, formData, { headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` } });
        alert("Hotel Request Submitted Successfully! Awaiting SuperAdmin Approval.");
      }

      setForm({ hotelname: "", hotelphone: "", email: "", stateId: "", districtId: "", cityId: "", hoteladdress: "", totalrooms: "", totalstaff: "", adminId: "" });
      setSelectedFiles([]); setEmailVerified(false);
      navigate("/home");
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Something went wrong submitting hotel request.");
    }
  };

  const filteredDistricts = districts.filter((district) => district.stateId?._id === form.stateId);
  const filteredCities = cities.filter((city) => city.districtId?._id === form.districtId);

  const inputClass = "form-input w-full";
  const selectClass = "form-select w-full";
  const labelClass = "block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-12">
      {!isSuperAdmin && <Navbar />}
      <div className="max-w-4xl mx-auto my-6 px-4">
      <div className="rounded-2xl p-8 shadow-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent dark:from-white dark:to-sky-400">
          {isEditMode ? "Update Hotel Registration" : "Hotel Registration"}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          {isEditMode ? "Update your hotel details below." : "Fill in the details to register your hotel."}
        </p>

        {!isSuperAdmin && (
          <div className="mb-6">
            <button
              className="px-4 py-2 rounded-xl text-sm font-semibold
                bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200
                border border-slate-200 dark:border-slate-600
                hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              onClick={() => navigate("/checkrequest")}
            >
              📋 Request Status
            </button>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {/* Admin Assignment (SuperAdmin only) */}
          {isSuperAdmin && (
            <div>
              <label className={labelClass}>Assign Admin Manager</label>
              <select name="adminId" value={form.adminId} onChange={handleChange} className={`${selectClass} border-blue-400`}>
                <option value="">-- Assign Responsible Admin Manager --</option>
                {admins.map((admin) => (
                  <option key={admin._id} value={admin._id}>{admin.adminname} ({admin.email})</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className={labelClass}>Hotel Name</label>
            <input type="text" name="hotelname" placeholder="Hotel Name" value={form.hotelname} onChange={handleChange} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Hotel Phone Number</label>
            <input type="number" name="hotelphone" placeholder="Hotel Phone Number" value={form.hotelphone} onChange={handleChange} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Hotel Email</label>
            <div className="flex gap-3">
              <input
                type="email" name="email" placeholder="Hotel Email"
                value={form.email} onChange={handleChange}
                className="form-input flex-1"
                disabled={isEditMode || emailVerified}
              />
              {!isEditMode && !isSuperAdmin && (
                <button
                  type="button"
                  className={`px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 whitespace-nowrap
                    ${emailVerified ? "bg-emerald-500 cursor-default" : "bg-blue-600 hover:bg-blue-500"}`}
                  onClick={sendOTP}
                  disabled={emailVerified || loading}
                >
                  {emailVerified ? "Verified ✅" : loading ? "Sending..." : "Verify Email"}
                </button>
              )}
            </div>
          </div>

          {showOtpBox && !emailVerified && !isSuperAdmin && (
            <div className="flex gap-3">
              <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} className="form-input flex-1" />
              <button type="button" className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-sky-500 hover:bg-sky-600 transition-colors" onClick={verifyOTP}>
                Verify OTP
              </button>
            </div>
          )}

          {emailVerified && !isEditMode && !isSuperAdmin && (
            <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
              ✅ Email Verified Successfully
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>State</label>
              <select name="stateId" value={form.stateId} onChange={handleChange} className={selectClass}>
                <option value="">Select State</option>
                {states.map((state) => <option key={state._id} value={state._id}>{state.stateName}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>District</label>
              <select name="districtId" value={form.districtId} onChange={handleChange} className={selectClass}>
                <option value="">Select District</option>
                {filteredDistricts.map((district) => <option key={district._id} value={district._id}>{district.districtName}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>City</label>
              <select name="cityId" value={form.cityId} onChange={handleChange} className={selectClass}>
                <option value="">Select City</option>
                {filteredCities.map((city) => <option key={city._id} value={city._id}>{city.cityName}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Hotel Address</label>
            <textarea name="hoteladdress" placeholder="Hotel Address" value={form.hoteladdress} onChange={handleChange} className={`${inputClass} min-h-[80px] resize-none`} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Total Rooms</label>
              <input type="number" name="totalrooms" placeholder="Total Rooms" value={form.totalrooms} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Total Staff</label>
              <input type="text" name="totalstaff" placeholder="Total Staff" value={form.totalstaff} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Upload Hotel Images</label>
            <input type="file" name="images" multiple accept="image/*" onChange={handleFileChange} className={inputClass} />
            {selectedFiles.length > 0 && (
              <p className="text-xs text-slate-400 mt-1">{selectedFiles.length} file(s) selected</p>
            )}
          </div>

          <button
            className={`mt-2 w-full py-3 px-5 rounded-xl font-semibold text-sm text-white
              transition-all duration-200 hover:-translate-y-0.5
              ${(!emailVerified && !isEditMode && !isSuperAdmin)
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30"}`}
            onClick={submitHotel}
            disabled={!emailVerified && !isEditMode && !isSuperAdmin}
          >
            {isEditMode ? "Update Request" : "Submit Request"}
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}

export default HotelForm;
