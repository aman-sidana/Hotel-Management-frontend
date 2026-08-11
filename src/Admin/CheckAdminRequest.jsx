import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import Navbar from "../genericComponents/Navbar";

function CheckAdminRequest() {

    const navigate = useNavigate();

    const [requestID, setRequestID] = useState("");
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(false);

    const checkStatus = async () => {
        if (!requestID) { return alert("Please Enter Request ID"); }
        try {
            setLoading(true);
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/admin/check-request-id`, { AdminRequestId: requestID });
            console.log("API Response :", res.data);
            setAdmin(res.data.data);
        } catch (error) {
            console.log(error);
            setAdmin(null);
            alert(error.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        console.log("Passing Admin :", admin);
        navigate("/adminform", { state: { adminData: admin } });
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Navbar />
            <div className="flex items-center justify-center p-4 pt-16">
                <div className="w-full max-w-sm rounded-2xl p-8 shadow-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="text-center mb-7">
                        <div className="flex justify-center mb-4">
                            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-2xl shadow-lg shadow-blue-600/30">
                                📋
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Check Admin Request</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Enter your admin request ID to view status</p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <input
                            value={requestID}
                            onChange={(e) => setRequestID(e.target.value)}
                            placeholder="Enter Request ID"
                            className="form-input w-full"
                        />
                        <button
                            onClick={checkStatus}
                            disabled={loading}
                            className="py-3 px-5 rounded-xl font-semibold text-sm text-white
                            bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30
                            transition-all duration-200 hover:-translate-y-0.5
                            disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Checking..." : "Check Status"}
                        </button>
                    </div>

                    {admin && (
                        <div className="mt-6 rounded-xl border p-4 bg-slate-50 dark:bg-slate-700/30 border-slate-200 dark:border-slate-600">
                            <h3 className="font-bold text-base mb-3 text-slate-900 dark:text-white">
                                {admin.adminname}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                {admin.email}
                            </p>
                            <button
                                onClick={handleEdit}
                                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white
                                bg-amber-500 hover:bg-amber-600 transition-all duration-200"
                            >
                                Update Details
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CheckAdminRequest;