import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

function RoomForm() {
  const navigate = useNavigate();
  const location = useLocation();

  const existingRoom = location.state?.roomData || null;
  const isEditMode = !!existingRoom;

  const currentUser = JSON.parse(localStorage.getItem("currentuser")) || {};
  const isAdmin =
    currentUser?.role?.toLowerCase() === "admin" ||
    currentUser?.role?.toLowerCase() === "superadmin";

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [form, setForm] = useState({
    hotelId: existingRoom?.hotelId?._id || existingRoom?.hotelId || "",
    roomNumber: existingRoom?.roomNumber || "",
    floor: existingRoom?.floor || 1,
    roomType: existingRoom?.roomType || "Single",
    pricePerNight: existingRoom?.pricePerNight || "",
    capacity: existingRoom?.capacity || 2,
    kingSizeBed: existingRoom?.kingSizeBed || false,
    queenSizeBed: existingRoom?.queenSizeBed || false,
    singleBed: existingRoom?.singleBed || false,
    doubleBed: existingRoom?.doubleBed || false,
    ac: existingRoom?.ac || false,
    cooler: existingRoom?.cooler || false,
    attachedBathroom: existingRoom?.attachedBathroom || false,
    bathtub: existingRoom?.bathtub || false,
    geyser: existingRoom?.geyser || false,
    tv: existingRoom?.tv || false,
    wifi: existingRoom?.wifi || false,
    telephone: existingRoom?.telephone || false,
    miniFridge: existingRoom?.miniFridge || false,
    microwave: existingRoom?.microwave || false,
    electricKettle: existingRoom?.electricKettle || false,
    sofa: existingRoom?.sofa || false,
    diningTable: existingRoom?.diningTable || false,
    wardrobe: existingRoom?.wardrobe || false,
    balcony: existingRoom?.balcony || false,
    locker: existingRoom?.locker || false,
    smokeDetector: existingRoom?.smokeDetector || false,
    fireExtinguisher: existingRoom?.fireExtinguisher || false,
    roomService: existingRoom?.roomService || false,
    laundryService: existingRoom?.laundryService || false,
    housekeeping: existingRoom?.housekeeping || false,
  });

  useEffect(() => { fetchHotels(); }, []);

  const fetchHotels = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/hotel/allhotels`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHotels(Array.isArray(res.data) ? res.data : res.data.result || []);
    } catch (error) { console.log("Error fetching hotels:", error); }
  };

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); };

  const handleCheckboxChange = (e) => { setForm({ ...form, [e.target.name]: e.target.checked }); };

  const handleFileChange = (e) => { setSelectedFiles([...e.target.files]); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.hotelId || !form.roomNumber || !form.pricePerNight) {
      return alert("Please fill in all mandatory fields (*)");
    }

    const formData = new FormData();
    Object.keys(form).forEach((key) => { formData.append(key, form[key]); });
    selectedFiles.forEach((file) => { formData.append("images", file); });

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (isEditMode) {
        await axios.patch(`${import.meta.env.VITE_API_URL}/room/updateroom?id=${existingRoom._id}`, formData, { headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` } });
        alert("Room Details Updated Successfully!");
      } else {
        const endpoint = isAdmin ? `${import.meta.env.VITE_API_URL}/room/admin-add-room` : `${import.meta.env.VITE_API_URL}/room/addroom`;
        await axios.post(endpoint, formData, { headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` } });
        alert("Room Entry Created Successfully!");
      }
      navigate(-1);
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Failed to process room details.");
    } finally { setLoading(false); }
  };

  const labelClass = "block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5";
  const sectionLabel = "block text-sm font-bold text-sky-600 dark:text-sky-400 mb-3";
  const checkboxLabel = "flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer";
  const checkboxGrid = "grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 p-4 rounded-xl";

  const beds = [
    { name: "kingSizeBed", label: "King Size Bed" },
    { name: "queenSizeBed", label: "Queen Size Bed" },
    { name: "singleBed", label: "Single Bed" },
    { name: "doubleBed", label: "Double Bed" },
  ];

  const facilities = [
    { name: "ac", label: "Air Conditioner" },
    { name: "cooler", label: "Cooler" },
    { name: "attachedBathroom", label: "Attached Bathroom" },
    { name: "bathtub", label: "Bathtub" },
    { name: "geyser", label: "Geyser" },
    { name: "tv", label: "Television" },
    { name: "wifi", label: "Free WiFi" },
    { name: "telephone", label: "Telephone" },
    { name: "miniFridge", label: "Mini Fridge" },
    { name: "microwave", label: "Microwave" },
    { name: "electricKettle", label: "Electric Kettle" },
    { name: "sofa", label: "Sofa Set" },
    { name: "diningTable", label: "Dining Table" },
    { name: "wardrobe", label: "Wardrobe" },
    { name: "balcony", label: "Balcony" },
    { name: "locker", label: "Locker / Safe" },
    { name: "smokeDetector", label: "Smoke Detector" },
    { name: "fireExtinguisher", label: "Fire Extinguisher" },
  ];

  const services = [
    { name: "roomService", label: "24/7 Room Service" },
    { name: "laundryService", label: "Laundry Service" },
    { name: "housekeeping", label: "Daily Housekeeping" },
  ];

  return (
    <div className="max-w-4xl mx-auto my-6 px-4">
      <div className="rounded-2xl p-8 shadow-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">

        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-xl text-sm font-semibold btn-action-secondary"
          >
            ← Back
          </button>
          <h2 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent dark:from-white dark:to-sky-400">
            {isEditMode ? "Edit Room Details" : "Add New Room Configuration"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          <div>
            <label className={labelClass}>Select Hotel *</label>
            <select name="hotelId" required value={form.hotelId} onChange={handleChange} className="form-select w-full">
              <option value="" disabled>-- Choose Hotel --</option>
              {hotels.map((hotel) => (
                <option key={hotel._id} value={hotel._id}>
                  {hotel.hotelname} ({hotel.hotelemail || hotel.hotelphone})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Room Number *</label>
              <input type="number" name="roomNumber" required placeholder="e.g. 101" value={form.roomNumber} onChange={handleChange} className="form-input w-full" />
            </div>
            <div>
              <label className={labelClass}>Floor Number</label>
              <input type="number" name="floor" placeholder="e.g. 1" value={form.floor} onChange={handleChange} className="form-input w-full" />
            </div>
            <div>
              <label className={labelClass}>Room Type</label>
              <select name="roomType" value={form.roomType} onChange={handleChange} className="form-select w-full">
                {["Single", "Double", "Twin", "Deluxe", "Suite", "Family"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Price Per Night (₹) *</label>
              <input type="number" name="pricePerNight" required placeholder="e.g. 2500" value={form.pricePerNight} onChange={handleChange} className="form-input w-full" />
            </div>
            <div>
              <label className={labelClass}>Guest Capacity</label>
              <input type="number" name="capacity" placeholder="e.g. 2" value={form.capacity} onChange={handleChange} className="form-input w-full" />
            </div>
          </div>

          <div>
            <label className={sectionLabel}>🛏️ Bed Configuration</label>
            <div className={checkboxGrid}>
              {beds.map((bed) => (
                <label key={bed.name} className={checkboxLabel}>
                  <input type="checkbox" name={bed.name} checked={form[bed.name]} onChange={handleCheckboxChange} className="accent-emerald-500 w-4 h-4" />
                  {bed.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className={sectionLabel}>🏨 Facilities & Amenities</label>
            <div className={checkboxGrid}>
              {facilities.map((item) => (
                <label key={item.name} className={checkboxLabel}>
                  <input type="checkbox" name={item.name} checked={form[item.name]} onChange={handleCheckboxChange} className="accent-emerald-500 w-4 h-4" />
                  {item.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className={sectionLabel}>🛎️ Services Offered</label>
            <div className={checkboxGrid}>
              {services.map((srv) => (
                <label key={srv.name} className={checkboxLabel}>
                  <input type="checkbox" name={srv.name} checked={form[srv.name]} onChange={handleCheckboxChange} className="accent-emerald-500 w-4 h-4" />
                  {srv.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>Upload Room Photos</label>
            <input
              type="file" multiple accept="image/*"
              onChange={handleFileChange}
              className="form-input w-full border-dashed"
            />
            {selectedFiles.length > 0 && (
              <p className="text-xs text-slate-400 mt-1">{selectedFiles.length} file(s) selected</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-200
              ${loading ? "bg-slate-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 hover:-translate-y-0.5"}`}
          >
            {loading ? "Processing..." : isEditMode ? "Update Room Profile" : "Register Room"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default RoomForm;