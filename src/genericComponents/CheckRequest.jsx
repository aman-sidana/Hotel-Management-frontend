import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function CheckRequest() {
    const navigate = useNavigate();

    const [requestID, setRequestID] = useState("");
    const [hotel, setHotel] = useState(null);
    const [loading, setLoading] = useState(false);

    const checkStatus = async () => {
        try {
            if (!requestID) {
                alert("Please enter Request ID");
                return;
            }
            setLoading(true);
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/hotel/checkrequestid`, { requestId: requestID });
            setHotel(res.data);
            setLoading(false);
        } catch (error) {
            console.log(error);
            setHotel(null);
            setLoading(false);
        }
    };

    const handleEditClick = () => {
        navigate("/hotelform", { state: { hotelData: hotel } });
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl p-8 shadow-xl
                bg-white dark:bg-slate-800
                border border-slate-200 dark:border-slate-700">

                <div className="text-center mb-7">
                    <div className="flex justify-center mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-sky-500 flex items-center justify-center text-2xl shadow-lg shadow-sky-500/30">
                            🔍
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Check Hotel Request</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Enter your request ID to check status</p>
                </div>

                <div className="flex flex-col gap-3">
                    <input
                        type="text"
                        className="form-input w-full"
                        placeholder="Enter Request ID"
                        value={requestID}
                        onChange={(e) => setRequestID(e.target.value)}
                    />

                    <button
                        className="py-3 px-5 rounded-xl font-semibold text-sm text-white
                            bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30
                            transition-all duration-200 hover:-translate-y-0.5
                            disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={checkStatus}
                        disabled={loading}
                    >
                        {loading ? "Checking..." : "Check Status"}
                    </button>
                </div>

                {hotel && hotel.status === "pending" && (
                    <div className="mt-6 rounded-xl border p-5
                        bg-slate-50 dark:bg-slate-700/30
                        border-slate-200 dark:border-slate-600">
                        <h3 className="font-bold text-base mb-4 text-slate-900 dark:text-white">Hotel Details</h3>

                        {[
                            ["Hotel Name", hotel.hotelname],
                            ["Owner Name", hotel.ownername],
                            ["Owner Phone", hotel.ownerphone],
                            ["Email", hotel.email],
                            ["Hotel Address", hotel.hoteladdress],
                            ["Total Rooms", hotel.totalrooms],
                            ["Request ID", hotel.hotelRequestId],
                        ].map(([label, value]) => (
                            <div key={label} className="flex gap-2 mb-2 text-sm">
                                <span className="font-semibold text-slate-700 dark:text-slate-300 min-w-[110px]">{label}:</span>
                                <span className="text-slate-600 dark:text-slate-400">{value}</span>
                            </div>
                        ))}

                        <div className="flex gap-2 mb-2 text-sm items-center">
                            <span className="font-semibold text-slate-700 dark:text-slate-300 min-w-[110px]">Status:</span>
                            <span className="status-badge pending">{hotel.status}</span>
                        </div>

                        {hotel.description && (
                            <div className="flex gap-2 mb-2 text-sm">
                                <span className="font-semibold text-slate-700 dark:text-slate-300 min-w-[110px]">Description:</span>
                                <span className="text-slate-600 dark:text-slate-400">{hotel.description}</span>
                            </div>
                        )}

                        {hotel.createdAt && (
                            <div className="flex gap-2 mb-4 text-sm">
                                <span className="font-semibold text-slate-700 dark:text-slate-300 min-w-[110px]">Requested On:</span>
                                <span className="text-slate-600 dark:text-slate-400">{new Date(hotel.createdAt).toLocaleString()}</span>
                            </div>
                        )}

                        <button
                            onClick={handleEditClick}
                            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white
                                bg-amber-500 hover:bg-amber-600 transition-all duration-200"
                        >
                            Update Details
                        </button>
                    </div>
                )}

                {hotel && hotel.status === "approved" && (
                    <div className="mt-6 rounded-xl border p-5 text-center
                        bg-emerald-50 dark:bg-emerald-900/20
                        border-emerald-200 dark:border-emerald-700">
                        <div className="text-3xl mb-2">🎉</div>
                        <h3 className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">
                            Request Approved!
                        </h3>
                        <p className="text-sm text-emerald-600/80 dark:text-emerald-400/70 mt-1">
                            Your hotel request has been successfully approved.
                        </p>
                    </div>
                )}

                {hotel && hotel.status === "rejected" && (
                    <div className="mt-6 rounded-xl border p-5 text-center
                        bg-red-50 dark:bg-red-900/20
                        border-red-200 dark:border-red-700">
                        <div className="text-3xl mb-2">❌</div>
                        <h3 className="font-bold text-red-600 dark:text-red-400 text-lg">
                            Request Rejected
                        </h3>
                        <p className="text-sm text-red-600/80 dark:text-red-400/70 mt-1">
                            Your hotel request has been rejected.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CheckRequest;