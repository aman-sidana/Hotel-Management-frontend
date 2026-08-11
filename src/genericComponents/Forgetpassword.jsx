import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Forgetpassword() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        otp: "",
        newpassword: "",
        confirmpassword: ""
    });

    const [error, setError] = useState({});
    const [otpSent, setOtpSent] = useState(false);

    function handleChange(e) {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    }

    const sendOtp = async () => {
        if (!form.email) {
            setError({ email: "Email is required" });
            return;
        }
        try {
            const result = await axios.post(`${import.meta.env.VITE_API_URL}/user/sendotp`, { email: form.email, });
            alert(result.data.message);
            setOtpSent(true);
            setError({});
        } catch (error) {
            console.log(error);
            alert(error.response?.data?.message || "Something went wrong");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let obj = {};

        if (!form.email) obj.email = "Email is required";
        if (!form.otp) obj.otp = "OTP is required";
        if (!form.newpassword)
            obj.newpassword = "New Password is required";
        if (!form.confirmpassword)
            obj.confirmpassword = "Confirm Password is required";

        if (Object.keys(obj).length > 0) {
            setError(obj);
            return;
        }

        try {
            const result = await axios.post(`${import.meta.env.VITE_API_URL}/user/forgetpassword`, form);

            alert(result.data.message);
            navigate("/");
        } catch (error) {
            console.log(error);
            alert(error.response?.data?.message || "Something went wrong");
        }
    };

    return (
        <div className="auth-page-wrapper">
            <div className="gradient-orb orb-1"></div>
            <div className="gradient-orb orb-2"></div>
            <div className="gradient-orb orb-3"></div>

            <div className="auth-card max-w-sm">
                <div className="auth-header">
                    <div className="flex justify-center mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/40">
                            🔑
                        </div>
                    </div>
                    <h2 className="auth-title">Forgot Password</h2>
                    <p className="auth-subtitle">Enter your email to receive an OTP</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="input-group">
                        <label className="input-label">Email Address</label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className={`auth-input ${error.email ? 'border-red-500' : ''}`}
                        />
                        {error.email && (
                            <p className="text-red-400 text-xs mt-0.5">{error.email}</p>
                        )}
                    </div>

                    {!otpSent ? (
                        <button
                            type="button"
                            className="btn-primary"
                            onClick={sendOtp}
                        >
                            Send OTP
                        </button>
                    ) : (
                        <>
                            <div className="input-group">
                                <label className="input-label">OTP Code</label>
                                <input
                                    type="text"
                                    placeholder="Enter OTP"
                                    name="otp"
                                    value={form.otp}
                                    onChange={handleChange}
                                    className={`auth-input ${error.otp ? 'border-red-500' : ''}`}
                                />
                                {error.otp && (
                                    <p className="text-red-400 text-xs mt-0.5">{error.otp}</p>
                                )}
                            </div>

                            <div className="input-group">
                                <label className="input-label">New Password</label>
                                <input
                                    type="password"
                                    placeholder="New Password"
                                    name="newpassword"
                                    value={form.newpassword}
                                    onChange={handleChange}
                                    className={`auth-input ${error.newpassword ? 'border-red-500' : ''}`}
                                />
                                {error.newpassword && (
                                    <p className="text-red-400 text-xs mt-0.5">{error.newpassword}</p>
                                )}
                            </div>

                            <div className="input-group">
                                <label className="input-label">Confirm Password</label>
                                <input
                                    type="password"
                                    placeholder="Confirm Password"
                                    name="confirmpassword"
                                    value={form.confirmpassword}
                                    onChange={handleChange}
                                    className={`auth-input ${error.confirmpassword ? 'border-red-500' : ''}`}
                                />
                                {error.confirmpassword && (
                                    <p className="text-red-400 text-xs mt-0.5">{error.confirmpassword}</p>
                                )}
                            </div>

                            <button type="submit" className="btn-primary">
                                Reset Password
                            </button>
                        </>
                    )}

                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="btn-secondary"
                    >
                        ← Back to Login
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Forgetpassword;
