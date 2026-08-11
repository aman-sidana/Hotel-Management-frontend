import React, { useEffect, useState } from "react";
import axios from "axios";
import useSearching from "../custom hooks/useSearching";

function StateManagement() {
  //seraching k liye 
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useSearching(searchQuery, 500);

  const [states, setStates] = useState([]);
  const [stateName, setStateName] = useState("");

  const [editId, setEditId] = useState("");
  const [editState, setEditState] = useState("");

  const [activeTab, setActiveTab] = useState("active");
  const [sortBy, setSortBy] = useState("asc");

  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalStates, setTotalStates] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, debouncedSearch, sortBy, itemsPerPage]);

  useEffect(() => {
    getStates();
  }, [debouncedSearch, sortBy, activeTab, currentPage, itemsPerPage]);

  const getStates = async () => {
    try {
      const token = localStorage.getItem("token");
      const result = await axios.get(
        `${import.meta.env.VITE_API_URL}/state/getstates`,
        {
          params: {
            search: debouncedSearch,
            sort: sortBy,
            status: activeTab,
            page: currentPage,
            limit: itemsPerPage,
          },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (result.data && result.data.success) {
        setStates(result.data.states || []);
        setTotalStates(result.data.totalStates || 0);
        setTotalPages(result.data.totalPages || 1);
      } else if (Array.isArray(result.data)) {
        setStates(result.data || []);
        setTotalStates(result.data.length || 0);
        setTotalPages(Math.ceil((result.data.length || 0) / itemsPerPage) || 1);
      }
    } catch (error) {
      console.log(error);
      setStates([]);
      setTotalStates(0);
      setTotalPages(1);
    }
  };

  const addState = async () => {
    if (!stateName) return;
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${import.meta.env.VITE_API_URL}/state/addstate`, { stateName }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStateName("");
      getStates();
    } catch (error) {
      console.log(error);
    }
  };

  const deleteState = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${import.meta.env.VITE_API_URL}/state/deletestate?id=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      getStates();
    } catch (error) {
      console.log(error);
    }
  };

  const updateState = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`${import.meta.env.VITE_API_URL}/state/updatestate?id=${editId}`, {
        stateName: editState,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditId("");
      setEditState("");
      getStates();
    } catch (error) {
      console.log(error);
    }
  };

  const softDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`${import.meta.env.VITE_API_URL}/state/softdeletestate?id=${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      getStates();
    } catch (error) {
      console.log(error);
    }
  };

  const restoreState = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`${import.meta.env.VITE_API_URL}/state/restorestate?id=${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      getStates();
    } catch (error) {
      console.log(error);
    }
  };

  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalStates);
  const displayedStates = states;

  const downloadPdf = () => {
    const token = localStorage.getItem("token");
    window.open(
      `${import.meta.env.VITE_API_URL}/state/download-pdf?search=${encodeURIComponent(searchQuery)}&sort=${sortBy}&status=${activeTab}&token=${token}`,
      "_blank"
    );
  };

  return (
    <div className="management-module">
      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <h2>State Management</h2>
        <button
          onClick={downloadPdf}
          className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
        >
          📄 Download PDF
        </button>
      </div>

      {/* Add Form */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <input
          type="text"
          className="form-input flex-1 min-w-[200px]"
          placeholder="Enter State Name"
          value={stateName}
          onChange={(e) => setStateName(e.target.value)}
        />
        <button className="btn-action-primary" onClick={addState}>+ Add State</button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center flex-wrap mb-5">
        <button
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === "active" ? "bg-blue-600 text-white" : "btn-action-secondary"}`}
          onClick={() => setActiveTab("active")}
        >
          Active States
        </button>
        <button
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === "inactive" ? "bg-blue-600 text-white" : "btn-action-secondary"}`}
          onClick={() => setActiveTab("inactive")}
        >
          Inactive States
        </button>

        <select
          className="form-select w-full sm:w-auto sm:ml-auto"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="asc">State (A - Z)</option>
          <option value="desc">State (Z - A)</option>
        </select>

        <input
          type="text"
          className="form-input w-full sm:w-44"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Country</th>
              <th>State</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedStates.map((item) => (
              <tr key={item._id}>
                <td>{item.countryName || "India"}</td>
                <td>
                  {editId === item._id ? (
                    <input
                      className="form-input w-36"
                      value={editState}
                      onChange={(e) => setEditState(e.target.value)}
                    />
                  ) : (
                    item.stateName
                  )}
                </td>
                <td>
                  <span className={`status-badge ${item.status ? "approved" : "rejected"}`}>
                    {item.status ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <div className="flex gap-2 flex-wrap">
                    {editId === item._id ? (
                      <>
                        <button className="btn-action-primary" onClick={updateState}>Save</button>
                        <button className="btn-action-secondary" onClick={() => setEditId("")}>Cancel</button>
                      </>
                    ) : (
                      <button
                        className="btn-action-secondary"
                        onClick={() => { setEditId(item._id); setEditState(item.stateName); }}
                      >
                        Edit
                      </button>
                    )}

                    <button className="btn-action-danger" onClick={() => deleteState(item._id)}>Delete</button>

                    {item.status ? (
                      <button className="btn-action-warning" onClick={() => softDelete(item._id)}>Deactivate</button>
                    ) : (
                      <button className="btn-action-success" onClick={() => restoreState(item._id)}>Restore</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {states.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-8 text-slate-400 dark:text-slate-500">
                  No {activeTab === "active" ? "Active" : "Inactive"} States Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalStates > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing <span className="font-bold">{indexOfFirstItem + 1}</span> to{" "}
              <span className="font-bold">{indexOfLastItem}</span> of{" "}
              <span className="font-bold">{totalStates}</span> states
            </p>

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
                className={`w-7 h-7 text-xs font-bold rounded-lg transition-colors ${
                  currentPage === pageNum
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

export default StateManagement;