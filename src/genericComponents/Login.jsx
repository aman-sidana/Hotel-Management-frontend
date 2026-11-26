import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { gsap } from 'gsap'
import { useNavigate } from 'react-router-dom'

function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" })
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const showcaseRef = useRef(null)
    const formCardRef = useRef(null)

    useEffect(() => {
        const context = gsap.context(() => {
            gsap.from(showcaseRef.current, {
                autoAlpha: 0,
                x: -40,
                duration: 0.9,
                ease: 'power3.out'
            });
            gsap.from(formCardRef.current, {
                autoAlpha: 0,
                y: 30,
                duration: 0.85,
                scale: 0.96,
                ease: 'back.out(1.4)'
            });
        });
        return () => context.revert();
    }, []);

    function handleChange(e) {
        const { name, value } = e.target
        setForm({ ...form, [name]: value })
        if (error) setError("")
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setError("")
        if (!form.email || !form.password) {
            setError("Email and Password are required")
            return;
        }

        setLoading(true)
        try {
            const result = await axios.post(`${import.meta.env.VITE_API_URL}/user/login`, form)
            const token = result?.data?.token
            const currentuser = result?.data?.user

            localStorage.setItem('currentuser', JSON.stringify(currentuser))

            if (token) {
                localStorage.setItem('token', token)
                navigate('/home')
                setForm({ email: "", password: "" })
            } else {
                setError("Password is incorrect")
            }
        } catch (err) {
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page-wrapper">
            {/* Ambient Background Orbs */}
            <div className="gradient-orb orb-1"></div>
            <div className="gradient-orb orb-2"></div>
            <div className="gradient-orb orb-3"></div>

            {/* Split Screen Container */}
            <div className="auth-split-container">

                {/* Left Panel: Luxury Showcase */}
                <div ref={showcaseRef} className="auth-showcase-panel hidden lg:flex">
                    {/* Background Showcase Image */}
                    <img
                        src="/luxury_hotel_banner.jpg"
                        alt="Luxury Resort"
                        className="auth-showcase-img"
                    />
                    <div className="auth-showcase-overlay"></div>

                    {/* Showcase Content */}
                    <div className="relative z-10 flex flex-col justify-between h-full p-8 text-white">

                        {/* Brand Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-lg shadow-lg shadow-blue-500/30">
                                🏨
                            </div>
                            <div>
                                <span className="text-lg font-black tracking-tight bg-gradient-to-r from-white via-sky-200 to-blue-300 bg-clip-text text-transparent">
                                    THE Guest's
                                </span>
                                <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/30 text-sky-300 border border-sky-400/30">
                                    Hotels
                                </span>
                            </div>
                        </div>

                        {/* Hero Text Showcase */}
                        <div className="space-y-5 max-w-md my-auto">
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md border border-white/20 text-sky-200">
                                ✨ Experience Premium Hospitality
                            </span>
                            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-snug text-white">
                                Discover & Manage Exceptional Stays Worldwide
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                                Access seamless luxury hotel bookings, manage stays, and view real-time reservation details in one unified platform.
                            </p>

                            {/* Key Highlights */}
                            <div className="grid grid-cols-1 gap-3 pt-1">
                                <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15">
                                    <span className="text-lg">🌟</span>
                                    <div>
                                        <p className="text-xs font-bold text-white">500+ Luxury Verified Hotels</p>
                                        <p className="text-[11px] text-slate-300">Curated world-class stay experiences</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15">
                                    <span className="text-lg">⚡</span>
                                    <div>
                                        <p className="text-xs font-bold text-white">Instant Confirmation</p>
                                        <p className="text-[11px] text-slate-300">Fast & hassle-free booking management</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Testimonial Badge */}
                        <div className="pt-6 border-t border-white/15 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex -space-x-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-slate-900 flex items-center justify-center text-xs font-bold">JD</div>
                                    <div className="w-8 h-8 rounded-full bg-sky-400 border-2 border-slate-900 flex items-center justify-center text-xs font-bold">AS</div>
                                    <div className="w-8 h-8 rounded-full bg-indigo-500 border-2 border-slate-900 flex items-center justify-center text-xs font-bold">MK</div>
                                </div>
                                <div>
                                    <div className="flex text-amber-400 text-xs">★★★★★</div>
                                    <p className="text-[11px] text-slate-300 font-medium">Trusted by 10,000+ guests & hosts</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Right Panel: Login Form Card */}
                <div ref={formCardRef} className="auth-form-panel">
                    <div className="w-full max-w-md mx-auto space-y-6">

                        {/* Header */}
                        <div className="text-left space-y-2">
                            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-2xl mb-4 lg:hidden">
                                🏨
                            </div>
                            <h2 className="text-3xl font-extrabold text-white tracking-tight">
                                Welcome Back 👋
                            </h2>
                            <p className="text-sm text-slate-300">
                                Enter your credentials to access your account
                            </p>
                        </div>

                        {/* Login Form */}
                        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                            {/* Email Field */}
                            <div className="space-y-1.5">
                                <label className="input-label">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                        </svg>
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="name@company.com"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        className="auth-input pl-10"
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <label className="input-label">Password</label>
                                    <span
                                        onClick={() => navigate('/forget')}
                                        className="forgot-link"
                                    >
                                        Forgot Password?
                                    </span>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        className="auth-input pl-10 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors"
                                    >
                                        {showPassword ? (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.025 10.025 0 013.122-.863c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m-1.745 1.745l-12-12" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Error Banner */}
                            {error && (
                                <div className="error-banner animate-in fade-in zoom-in-95 duration-150">
                                    <span>⚠️ {error}</span>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary mt-2 flex items-center justify-center gap-2 group"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                        <span>Signing in...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Sign In to Account</span>
                                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </>
                                )}
                            </button>

                            {/* Signup Prompt */}
                            <p className="signup-prompt pt-1">
                                Don't have an account yet?{" "}
                                <strong
                                    onClick={() => navigate("/signup")}
                                    className="signup-link font-bold text-sky-400 hover:text-sky-300"
                                >
                                    Sign up now
                                </strong>
                            </p>

                            {/* Divider */}
                            <div className="divider my-4">
                                <span>OR</span>
                            </div>

                            {/* Secondary Action */}
                            <button
                                type="button"
                                onClick={() => navigate('/adminform')}
                                className="btn-secondary"
                            >
                                🏢 Register Hotel / Admin Request
                            </button>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Login