import React, { useEffect, useState } from "react";
import axios from "axios";
import useSearching from "../custom hooks/useSearching";

function CityManagement() {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);

  const [stateId, setStateId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [cityName, setCityName] = useState("");

  const [editId, setEditId] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editDistrictId, setEditDistrictId] = useState("");

  const [activeTab, setActiveTab] = useState("active");

  const [searchQuery, setSearchQuery] = useState("");
  const searching = useSearching(searchQuery, 500)
  const [sortBy, setSortBy] = useState("cityAsc");

  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCities, setTotalCities] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    getStates();
    getDistricts();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searching, sortBy, itemsPerPage]);

  useEffect(() => {
    getCities();
  }, [searching, sortBy, activeTab, currentPage, itemsPerPage]);

  const getStates = async () => {
    try {
      const result = await axios.get(`${import.meta.env.VITE_API_URL}/state/getstates`);
      if (result.data && result.data.states) {
        setStates(result.data.states);
      } else if (Array.isArray(result.data)) {
        setStates(result.data);
      }
    } catch (error) { console.log(error); }
  };

  const getDistricts = async () => {
    try {
      const result = await axios.get(`${import.meta.env.VITE_API_URL}/district/getdistricts`);
      if (result.data && result.data.districts) {
        setDistricts(result.data.districts);
      } else if (Array.isArray(result.data)) {
        setDistricts(result.data);
      }
    } catch (error) { console.log(error); }
  };

  const getCities = async () => {
    try {
      const result = await axios.get(`${import.meta.env.VITE_API_URL}/city/getcities`, {
        params: {
          search: searching,
          sort: sortBy,
          status: activeTab,
          page: currentPage,
          limit: itemsPerPage,
        }
      });

      if (result.data && result.data.success) {
        setCities(result.data.cities || []);
        setTotalCities(result.data.totalCities || 0);
        setTotalPages(result.data.totalPages || 1);
      } else if (Array.isArray(result.data)) {
        setCities(result.data || []);
        setTotalCities(result.data.length || 0);
        setTotalPages(Math.ceil((result.data.length || 0) / itemsPerPage) || 1);
      }
    } catch (error) {
      console.log(error);
      setCities([]);
      setTotalCities(0);
      setTotalPages(1);
    }
  };

const addCity = async () => {
  if (!cityName || !districtId) { return alert("Fill all fields"); }
  try {
  const token = localStorage.getItem("token");
  await axios.post(`${import.meta.env.VITE_API_URL}/city/addcity`, { cityName, districtId }, {
    headers: { Authorization: `Bearer ${token}` },
  });
    setCityName(""); setDistrictId(""); setStateId(""); getCities();
  } catch (error) { console.log(error); }
};

const updateCity = async () => {
  try {
  const token = localStorage.getItem("token");
  await axios.patch(`${import.meta.env.VITE_API_URL}/city/updatecity?id=${editId}`, {
    cityName: editCity, districtId: editDistrictId,
  }, {
    headers: { Authorization: `Bearer ${token}` },
  });
    setEditId(""); setEditCity(""); setEditDistrictId(""); getCities();
  } catch (error) { console.log(error); }
};

const deleteCity = async (id) => {
  try {
  const token = localStorage.getItem("token");
  await axios.delete(`${import.meta.env.VITE_API_URL}/city/deletecity?id=${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
    getCities();
  } catch (error) { console.log(error); }
};

const softDeleteCity = async (id) => {
  try {
  const token = localStorage.getItem("token");
  await axios.patch(`${import.meta.env.VITE_API_URL}/city/softdeletecity?id=${id}`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
    getCities();
  } catch (error) { console.log(error); }
};

const restoreCity = async (id) => {
  try {
  const token = localStorage.getItem("token");
  await axios.patch(`${import.meta.env.VITE_API_URL}/city/restorecity?id=${id}`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
    getCities();
  } catch (error) { console.log(error); }
};

const filteredDistricts = districts.filter(
  (district) => district.stateId?._id === stateId
);

const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalCities);
const displayedCities = cities;

const downloadPdf = () => {
  const token = localStorage.getItem("token");
  window.open(
    `${import.meta.env.VITE_API_URL}/city/download-pdf?search=${encodeURIComponent(searchQuery)}&sort=${sortBy}&status=${activeTab}&token=${token}`,
    "_blank"
  );
};

return (
  <div className="management-module">
    <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
      <h2>City Management</h2>
      <button
        onClick={downloadPdf}
        className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
      >
        📄 Download PDF
      </button>
    </div>

    <div className="flex gap-3 mb-5 flex-wrap">
      <select className="form-select" value={stateId} onChange={(e) => { setStateId(e.target.value); setDistrictId(""); }}>
        <option value="">Select State</option>
        {states.map((state) => <option key={state._id} value={state._id}>{state.stateName}</option>)}
      </select>

      <select className="form-select" value={districtId} onChange={(e) => setDistrictId(e.target.value)}>
        <option value="">Select District</option>
        {filteredDistricts.map((district) => <option key={district._id} value={district._id}>{district.districtName}</option>)}
      </select>

      <input type="text" className="form-input flex-1 min-w-[140px]" placeholder="City Name" value={cityName} onChange={(e) => setCityName(e.target.value)} />
      <button className="btn-action-primary" onClick={addCity}>+ Add City</button>
    </div>

    <div className="flex gap-3 items-center flex-wrap mb-5">
      <button className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === "active" ? "bg-blue-600 text-white" : "btn-action-secondary"}`} onClick={() => setActiveTab("active")}>Active Cities</button>
      <button className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === "inactive" ? "bg-blue-600 text-white" : "btn-action-secondary"}`} onClick={() => setActiveTab("inactive")}>Inactive Cities</button>
      <select className="form-select w-full sm:w-auto sm:ml-auto" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
        <option value="cityAsc">City (A - Z)</option>
        <option value="cityDesc">City (Z - A)</option>
        <option value="districtAsc">District (A - Z)</option>
        <option value="districtDesc">District (Z - A)</option>
      </select>
      <input type="text" className="form-input w-full sm:w-44" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />

      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Show:</span>
        <select
          className="form-select text-xs py-1 px-2"
          value={itemsPerPage}
          onChange={(e) => setItemsPerPage(Number(e.target.value))}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
      </div>
    </div>

    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>City</th>
            <th>District</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {displayedCities.map((city) => (
            <tr key={city._id}>
              <td>
                {editId === city._id ? (
                  <input className="form-input w-32" value={editCity} onChange={(e) => setEditCity(e.target.value)} />
                ) : city.cityName}
              </td>
              <td>
                {editId === city._id ? (
                  <select className="form-select" value={editDistrictId} onChange={(e) => setEditDistrictId(e.target.value)}>
                    {districts.map((district) => <option key={district._id} value={district._id}>{district.districtName}</option>)}
                  </select>
                ) : city.districtId?.districtName}
              </td>
              <td>
                <span className={`status-badge ${city.status ? "approved" : "rejected"}`}>
                  {city.status ? "Active" : "Inactive"}
                </span>
              </td>
              <td>
                <div className="flex gap-2 flex-wrap">
                  {editId === city._id ? (
                    <>
                      <button className="btn-action-primary" onClick={updateCity}>Save</button>
                      <button className="btn-action-secondary" onClick={() => setEditId("")}>Cancel</button>
                    </>
                  ) : (
                    <button className="btn-action-secondary" onClick={() => { setEditId(city._id); setEditCity(city.cityName); setEditDistrictId(city.districtId?._id); }}>Edit</button>
                  )}
                  <button className="btn-action-danger" onClick={() => deleteCity(city._id)}>Delete</button>
                  {city.status ? (
                    <button className="btn-action-warning" onClick={() => softDeleteCity(city._id)}>Deactivate</button>
                  ) : (
                    <button className="btn-action-success" onClick={() => restoreCity(city._id)}>Restore</button>
                  )}
                </div>
              </td>
            </tr>
          ))}

          {cities.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center py-8 text-slate-400 dark:text-slate-500">
                No {activeTab === "active" ? "Active" : "Inactive"} Cities Found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    {/* Pagination Controls */}
    {totalCities > 0 && (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Showing <span className="font-bold">{indexOfFirstItem + 1}</span> to{" "}
          <span className="font-bold">{indexOfLastItem}</span> of{" "}
          <span className="font-bold">{totalCities}</span> cities
        </p>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="btn-action-secondary text-xs px-3 py-1 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Prev
          </button>

          {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
              className={`w-7 h-7 text-xs font-bold rounded-lg transition-colors ${currentPage === pageNum
                  ? "bg-blue-600 text-white"
                  : "btn-action-secondary"
                }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="btn-action-secondary text-xs px-3 py-1 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      </div>
    )}
  </div>
);
}

export default CityManagement;