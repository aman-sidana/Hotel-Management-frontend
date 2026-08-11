import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ResetPassword() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        email: "",
        password: "",
        newpassword: "",
        confirmpassword: ""
    });
    const [error, setError] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        let obj = {};

        if (!form.email) obj.email = "Email is required";
        if (!form.password) obj.password = "Password is required";
        if (!form.newpassword) obj.newpassword = "New Password is required";
        if (!form.confirmpassword) obj.confirmpassword = "Confirm Password is required";

        if (form.newpassword && form.confirmpassword && form.newpassword !== form.confirmpassword) {
            obj.confirmpassword = "Passwords do not match";
        }

        setError(obj);

        if (Object.keys(obj).length === 0) {
            try {
                const token = localStorage.getItem("token");

                const result = await axios.post(
                    `${import.meta.env.VITE_API_URL}/user/resetpassword`,
                    form,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
                console.log(result.data);
                alert("Password changed successfully, please login again.");

                localStorage.removeItem("token");
                localStorage.removeItem("currentuser");

                navigate("/login");
            } catch (error) {
                console.error(error.response?.data.message);
                alert(`Error : ${error.response?.data.message || "Failed to reset password"}`);
            }
        }
    };

    function handleChange(e) {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
            <div className="p-4">
                <button
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                        text-slate-600 dark:text-slate-400
                        bg-white dark:bg-slate-800
                        border border-slate-200 dark:border-slate-700
                        hover:border-slate-300 dark:hover:border-slate-600
                        transition-all duration-200"
                    onClick={() => navigate(-1)}
                >
                    ⬅ Back
                </button>
            </div>

            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md rounded-2xl p-8 shadow-xl
                    bg-white dark:bg-slate-800
                    border border-slate-200 dark:border-slate-700">

                    <div className="text-center mb-7">
                        <div className="flex justify-center mb-4">
                            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-2xl shadow-lg shadow-blue-600/30">
                                🔐
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Reset Password</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Enter your current and new password</p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Email</label>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                className={`form-input w-full ${error.email ? 'border-red-500 dark:border-red-500' : ''}`}
                            />
                            {error.email && <p className="text-red-500 text-xs mt-1">{error.email}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Current Password</label>
                            <input
                                type="password"
                                placeholder="Current Password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                className={`form-input w-full ${error.password ? 'border-red-500 dark:border-red-500' : ''}`}
                            />
                            {error.password && <p className="text-red-500 text-xs mt-1">{error.password}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">New Password</label>
                            <input
                                type="password"
                                placeholder="New Password"
                                name="newpassword"
                                value={form.newpassword}
                                onChange={handleChange}
                                className={`form-input w-full ${error.newpassword ? 'border-red-500 dark:border-red-500' : ''}`}
                            />
                            {error.newpassword && <p className="text-red-500 text-xs mt-1">{error.newpassword}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Confirm Password</label>
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                value={form.confirmpassword}
                                name="confirmpassword"
                                onChange={handleChange}
                                className={`form-input w-full ${error.confirmpassword ? 'border-red-500 dark:border-red-500' : ''}`}
                            />
                            {error.confirmpassword && <p className="text-red-500 text-xs mt-1">{error.confirmpassword}</p>}
                        </div>

                        <button
                            type="submit"
                            className="mt-2 py-3 px-5 rounded-xl font-semibold text-sm text-white
                                bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30
                                transition-all duration-200 hover:-translate-y-0.5"
                        >
                            Reset Password
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;