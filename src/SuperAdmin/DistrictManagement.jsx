import React, { useEffect, useState } from "react";
import axios from "axios";
import useSearching from "../custom hooks/useSearching";

function DistrictManagement() {
    const [searchQuery, setSearchQuery] = useState("");
    const searching = useSearching(searchQuery, 500);

    const [sortBy, setSortBy] = useState("districtAsc");

    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);

    const [districtName, setDistrictName] = useState("");
    const [stateId, setStateId] = useState("");

    const [editId, setEditId] = useState("");
    const [editDistrict, setEditDistrict] = useState("");
    const [editStateId, setEditStateId] = useState("");

    const [activeTab, setActiveTab] = useState("active");


    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalDistricts, setTotalDistricts] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        getStates();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searching, sortBy, itemsPerPage]);

    useEffect(() => {
        getDistricts();
    }, [searching, sortBy, activeTab, currentPage, itemsPerPage]);

    const getStates = async () => {
        try {
            const result = await axios.get(`${import.meta.env.VITE_API_URL}/state/getstates`);
            if (result.data && result.data.states) {
                setStates(result.data.states);
            } else if (Array.isArray(result.data)) {
                setStates(result.data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const getDistricts = async () => {
        try {
            const result = await axios.get(`${import.meta.env.VITE_API_URL}/district/getdistricts`, {
                params: {
                    search: searching,
                    sort: sortBy,
                    status: activeTab,
                    page: currentPage,
                    limit: itemsPerPage,
                }
            });

            if (result.data && result.data.success) {
                setDistricts(result.data.districts || []);
                setTotalDistricts(result.data.totalDistricts || 0);
                setTotalPages(result.data.totalPages || 1);
            } else if (Array.isArray(result.data)) {
                setDistricts(result.data || []);
                setTotalDistricts(result.data.length || 0);
                setTotalPages(Math.ceil((result.data.length || 0) / itemsPerPage) || 1);
            }
        } catch (error) {
            console.log(error);
            setDistricts([]);
            setTotalDistricts(0);
            setTotalPages(1);
        }
    };

    const addDistrict = async () => {
        if (!districtName || !stateId) {
            return alert("Fill all fields")
        }
        try {
            const token = localStorage.getItem("token");
            await axios.post(`${import.meta.env.VITE_API_URL}/district/adddistrict`, { districtName, stateId }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDistrictName(""); setStateId(""); getDistricts();
        } catch (error) {
            console.log(error); alert("Failed to add district.");
        }
    };

    const updateDistrict = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.patch(`${import.meta.env.VITE_API_URL}/district/updatedistrict?id=${editId}`, {
                districtName: editDistrict, stateId: editStateId,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setEditId(""); setEditDistrict(""); setEditStateId(""); getDistricts();
        } catch (error) {
            console.log(error); alert("Failed to update district.");
        }
    };

    const deleteDistrict = async (id) => {
        if (!window.confirm("Are you sure you want to permanently delete this district?")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${import.meta.env.VITE_API_URL}/district/deletedistrict?id=${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            getDistricts();
        } catch (error) {
            console.log(error); alert("Failed to delete district.");
        }
    };

    const softDeleteDistrict = async (id) => {
        try {
            const token = localStorage.getItem("token");
            await axios.patch(`${import.meta.env.VITE_API_URL}/district/softdeletedistrict?id=${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            getDistricts();
        } catch (error) { console.log(error); }
    };

    const restoreDistrict = async (id) => {
        try {
            const token = localStorage.getItem("token");
            await axios.patch(`${import.meta.env.VITE_API_URL}/district/restoredistrict?id=${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            getDistricts();
        } catch (error) { console.log(error); }
    };

    const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
    const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalDistricts);
    const displayedDistricts = districts;

    return (
        <div className="management-module">
            <h2>District Management</h2>

            <div className="flex gap-3 mb-5 flex-wrap">
                <select className="form-select" value={stateId} onChange={(e) => setStateId(e.target.value)}>
                    <option value="">Select State</option>
                    {states.map((state) => (
                        <option key={state._id} value={state._id}>{state.stateName}</option>
                    ))}
                </select>
                <input
                    type="text" className="form-input flex-1 min-w-[160px]"
                    placeholder="District Name" value={districtName}
                    onChange={(e) => setDistrictName(e.target.value)}
                />
                <button className="btn-action-primary" onClick={addDistrict}>+ Add District</button>
            </div>

            <div className="flex gap-3 items-center flex-wrap mb-5">
                <button className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === "active" ? "bg-blue-600 text-white" : "btn-action-secondary"}`} onClick={() => setActiveTab("active")}>Active Districts</button>
                <button className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === "inactive" ? "bg-blue-600 text-white" : "btn-action-secondary"}`} onClick={() => setActiveTab("inactive")}>Inactive Districts</button>
                <select className="form-select w-full sm:w-auto sm:ml-auto" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="districtAsc">District (A - Z)</option>
                    <option value="districtDesc">District (Z - A)</option>
                    <option value="stateAsc">State (A - Z)</option>
                    <option value="stateDesc">State (Z - A)</option>
                </select>
                <input type="text" className="form-input w-full sm:w-44" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>District</th>
                            <th>State</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedDistricts.map((district) => (
                            <tr key={district._id}>
                                <td>
                                    {editId === district._id ? (
                                        <input className="form-input w-36" value={editDistrict} onChange={(e) => setEditDistrict(e.target.value)} />
                                    ) : district.districtName}
                                </td>
                                <td>
                                    {editId === district._id ? (
                                        <select className="form-select" value={editStateId} onChange={(e) => setEditStateId(e.target.value)}>
                                            <option value="">Select State</option>
                                            {states.map((state) => (
                                                <option key={state._id} value={state._id}>{state.stateName}</option>
                                            ))}
                                        </select>
                                    ) : district.stateId?.stateName}
                                </td>
                                <td>
                                    <span className={`status-badge ${district.status ? "approved" : "rejected"}`}>
                                        {district.status ? "Active" : "Inactive"}
                                    </span>
                                </td>
                                <td>
                                    <div className="flex gap-2 flex-wrap">
                                        {editId === district._id ? (
                                            <>
                                                <button className="btn-action-primary" onClick={updateDistrict}>Save</button>
                                                <button className="btn-action-secondary" onClick={() => setEditId("")}>Cancel</button>
                                            </>
                                        ) : (
                                            <button className="btn-action-secondary" onClick={() => { setEditId(district._id); setEditDistrict(district.districtName); setEditStateId(district.stateId?._id); }}>Edit</button>
                                        )}
                                        <button className="btn-action-danger" onClick={() => deleteDistrict(district._id)}>Delete</button>
                                        {district.status ? (
                                            <button className="btn-action-warning" onClick={() => softDeleteDistrict(district._id)}>Deactivate</button>
                                        ) : (
                                            <button className="btn-action-success" onClick={() => restoreDistrict(district._id)}>Restore</button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {districts.length === 0 && (
                            <tr>
                                <td colSpan="4" className="text-center py-8 text-slate-400 dark:text-slate-500">
                                    No {activeTab === "active" ? "Active" : "Inactive"} Districts Found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalDistricts > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Showing <span className="font-bold">{indexOfFirstItem + 1}</span> to{" "}
                            <span className="font-bold">{indexOfLastItem}</span> of{" "}
                            <span className="font-bold">{totalDistricts}</span> districts
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

export default DistrictManagement;