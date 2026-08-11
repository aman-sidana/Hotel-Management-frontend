import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { gsap } from 'gsap'
import { useNavigate, Link } from 'react-router-dom'

function Signup() {
    const navigate = useNavigate()
    const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" })
    const [error, setError] = useState("")
    const formRef = useRef(null)

    useEffect(() => {
        const context = gsap.context(() => {
            gsap.from(formRef.current, { autoAlpha: 0, duration: 0.75, scale: 0.92, y: 24, ease: 'back.out(1.7)' })
        })
        return () => context.revert()
    }, [])

    function handleChange(e) {
        const { name, value } = e.target
        setForm({ ...form, [name]: value })
        if (error) setError("")
    }

    async function handleSubmit(e) {
        e.preventDefault()
        if (!form.name || !form.email || !form.password) {
            setError("All fields are required")
            return
        }
        try {
            const result = await axios.post(`${import.meta.env.VITE_API_URL}/user/signup`, form)
            console.log(`>>>>signup`, result.data)
            navigate('/')
            setForm({ name: "", email: "", password: "", phone: "" })
        } catch (error) {
            setError(error.response?.data?.message || "An error occurred during signup")
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
                            ✨
                        </div>
                    </div>
                    <p className="text-xs uppercase tracking-widest text-sky-400 font-semibold mb-1">
                        Create Account
                    </p>
                    <h2 className="text-3xl font-bold text-white">Sign Up</h2>
                    <p className="auth-subtitle mt-1">Join us to explore and book your luxury stays</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="input-group">
                        <label className="input-label">Full Name</label>
                        <input
                            type="text"
                            placeholder="John Doe"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className="auth-input"
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Email Address</label>
                        <input
                            type="email"
                            placeholder="name@example.com"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="auth-input"
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            className="auth-input"
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Phone Number</label>
                        <input
                            type="tel"
                            placeholder="+91 98765 43210"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            className="auth-input"
                        />
                    </div>

                    {error && (
                        <div className="error-banner">{error}</div>
                    )}

                    <button
                        type="submit"
                        className="btn-primary mt-1"
                    >
                        Create Account
                    </button>
                </form>

                <div className="mt-5 pt-4 border-t border-white/10 text-center">
                    <p className="text-sm text-slate-400">
                        Already have an account?{" "}
                        <Link to="/" className="text-sky-400 font-semibold hover:text-sky-300 transition-colors">
                            Log In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Signup