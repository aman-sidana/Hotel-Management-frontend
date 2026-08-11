import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { gsap } from 'gsap'
import { useNavigate } from 'react-router-dom'


function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" })
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const formRef = useRef(null)

    useEffect(() => {
        const context = gsap.context(() => {
            gsap.from(formRef.current, {
                autoAlpha: 0,
                duration: 0.85,
                scale: 0.9,
                y: 30,
                ease: 'back.out(1.7)'
            })
        })
        return () => context.revert()
    }, [])

    function handleChange(e) {
        const { name, value } = e.target
        setForm({ ...form, [name]: value })
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
            <div className="gradient-orb orb-1"></div>
            <div className="gradient-orb orb-2"></div>
            <div className="gradient-orb orb-3"></div>

            <div ref={formRef} className="auth-card">
                <div className="auth-header">
                    <div className="flex justify-center mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-2xl shadow-lg shadow-blue-600/40">
                            🏨
                        </div>
                    </div>
                    <h2 className="auth-title">Welcome Back</h2>
                    <p className="auth-subtitle">Please sign in to continue to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="input-group">
                        <label className="input-label">Email Address</label>
                        <input
                            type="email"
                            placeholder="name@company.com"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="auth-input"
                        />
                    </div>

                    <div className="input-group">
                        <div className="label-row">
                            <label className="input-label">Password</label>
                            <span
                                onClick={() => navigate('/forget')}
                                className="forgot-link"
                            >
                                Forgot?
                            </span>
                        </div>
                        <input
                            type="password"
                            placeholder="••••••••"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            className="auth-input"
                        />
                    </div>

                    {error && <div className="error-banner">{error}</div>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary mt-1"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                Signing in...
                            </span>
                        ) : "Sign In"}
                    </button>

                    <p className="signup-prompt">
                        Don't have an account?{" "}
                        <strong
                            onClick={() => navigate("/signup")}
                            className="signup-link font-semibold"
                        >
                            Sign up
                        </strong>
                    </p>

                    <div className="divider">
                        <span>OR</span>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate('/adminform')}
                        className="btn-secondary"
                    >
                        Admin / Hotel Request
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Login