import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

function AdminForm() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentUser = JSON.parse(localStorage.getItem("currentuser"));
  const isSuperAdmin = currentUser?.role === "superadmin";

  const existingAdmin = location.state?.adminData || null;
  const isEditMode = !!existingAdmin;

  const [otp, setOtp] = useState("");
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [emailVerified, setEmailVerified] = useState(isEditMode);
  const [loading, setLoading] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);

  const [form, setForm] = useState({
    adminname: existingAdmin?.adminname || "",
    adminphone: existingAdmin?.adminphone || "",
    email: existingAdmin?.email || "",
    permanentaddress: existingAdmin?.permanentaddress || "",
    currentaddress: existingAdmin?.currentaddress || "",
  });

  const sendOTP = async () => {
    if (!form.email) { return alert("Please enter your email address first."); }
    try {
      setLoading(true);
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/admin/send-otp`, { email: form.email });
      alert(res.data.message || "OTP Sent successfully");
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
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/admin/verify-otp`, { email: form.email, otp });
      alert(res.data.message || "OTP Verified");
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
    if (e.target.files.length > 0) { setSelectedFile(e.target.files[0]); }
  };

  const submitAdmin = async () => {
    try {
      if (isSuperAdmin) {
        const token = localStorage.getItem("token");
        await axios.post(`${import.meta.env.VITE_API_URL}/admin/super-admin-add`, {
          adminname: form.adminname, adminphone: form.adminphone,
          email: form.email, permanentaddress: form.permanentaddress, currentaddress: form.currentaddress,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Admin Added Successfully");
        setForm({ adminname: "", adminphone: "", email: "", permanentaddress: "", currentaddress: "" });
        setSelectedFile(null); setEmailVerified(false); setShowOtpBox(false); setOtp("");
        navigate("/home");
        return;
      }

      if (!emailVerified && !isEditMode) { return alert("Please verify your email first."); }

      const formData = new FormData();
      formData.append("adminname", form.adminname);
      formData.append("adminphone", form.adminphone);
      formData.append("email", form.email);
      formData.append("permanentaddress", form.permanentaddress);
      formData.append("currentaddress", form.currentaddress);
      if (selectedFile) { formData.append("images", selectedFile); }

      if (isEditMode) {
        const token = localStorage.getItem("token");
        await axios.patch(`${import.meta.env.VITE_API_URL}/admin/update?id=${existingAdmin._id}`, formData, { headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` } });
        alert("Admin Updated Successfully");
        navigate("/checkaddminrequest");
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/admin/submit-request`, formData, { headers: { "Content-Type": "multipart/form-data" } });
        alert("Request Submitted Successfully");
        navigate("/");
      }

      setForm({ adminname: "", adminphone: "", email: "", permanentaddress: "", currentaddress: "" });
      setSelectedFile(null); setEmailVerified(false); setShowOtpBox(false); setOtp("");
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  const inputClass = "form-input w-full";

  return (
    <div className="max-w-4xl mx-auto my-6 px-4">
      <div className="rounded-2xl p-8 shadow-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent dark:from-white dark:to-sky-400">
          {isEditMode ? "Update Admin Registration" : "Admin Registration"}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          {isEditMode ? "Update the details for your admin account." : "Submit a request to become an admin."}
        </p>

        {!isSuperAdmin && (
          <div className="mb-6">
            <button
              className="px-4 py-2 rounded-xl text-sm font-semibold
                bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200
                border border-slate-200 dark:border-slate-600
                hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              onClick={() => navigate("/checkaddminrequest")}
            >
              📋 Check Request Status
            </button>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Admin Full Name</label>
            <input type="text" name="adminname" placeholder="Admin Full Name" value={form.adminname} onChange={handleChange} className={inputClass} />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Admin Phone Number</label>
            <input type="number" name="adminphone" placeholder="Admin Phone Number" value={form.adminphone} onChange={handleChange} className={inputClass} />
          </div>

          {/* Email + OTP */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Admin Email Address</label>
            <div className="flex gap-3">
              <input
                type="email" name="email" placeholder="Admin Email Address"
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
              <button
                type="button"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-sky-500 hover:bg-sky-600 transition-colors"
                onClick={verifyOTP}
              >
                Verify OTP
              </button>
            </div>
          )}

          {emailVerified && !isEditMode && !isSuperAdmin && (
            <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
              ✅ Email Verified Successfully
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Permanent Address</label>
            <textarea name="permanentaddress" placeholder="Permanent Address" value={form.permanentaddress} onChange={handleChange} className={`${inputClass} min-h-[80px] resize-none`} />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Current Address</label>
            <textarea name="currentaddress" placeholder="Current Address" value={form.currentaddress} onChange={handleChange} className={`${inputClass} min-h-[80px] resize-none`} />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Upload Owner Profile Image</label>
            <input type="file" name="images" accept="image/*" onChange={handleFileChange} className={inputClass} />
            {selectedFile && (
              <p className="text-xs text-slate-400 mt-1">Selected: {selectedFile.name}</p>
            )}
          </div>

          <button
            className={`mt-2 w-full py-3 px-5 rounded-xl font-semibold text-sm text-white
              transition-all duration-200 hover:-translate-y-0.5
              ${(!isSuperAdmin && !emailVerified && !isEditMode)
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30"}`}
            onClick={submitAdmin}
            disabled={!isSuperAdmin && !emailVerified && !isEditMode}
          >
            {isEditMode ? "Update Request" : "Submit Request"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminForm;
