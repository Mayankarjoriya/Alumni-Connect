import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, GraduationCap, UserCheck, Briefcase, Sparkles, AlertCircle } from 'lucide-react';
import api from './api/client';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('student@ciitm.org');
    const [password, setPassword] = useState('password123');
    const [name, setName] = useState('');
    const [role, setRole] = useState('student');
    const [college, setCollege] = useState('CIITM Institute of Technology');
    const [department, setDepartment] = useState('Computer Science');
    const [batch, setBatch] = useState('2024');
    const [company, setCompany] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [collegesList, setCollegesList] = useState([]);

    const [error, setError] = useState(null);
    const [notice, setNotice] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch registered colleges dynamically
        api.get('/api/colleges')
            .then((data) => setCollegesList(data || []))
            .catch(() => setCollegesList([
                { id: "ciitm", name: "CIITM Institute of Technology" },
                { id: "rtu", name: "Rajasthan Technical University" },
                { id: "iitd", name: "IIT Delhi" }
            ]));
    }, []);

    const handleQuickLogin = (demoEmail) => {
        setEmail(demoEmail);
        setPassword("password123");
        setError(null);
        setNotice(null);
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        setError(null);
        setNotice(null);
        setLoading(true);

        const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
        const payload = isLogin
            ? { email, password }
            : {
                email,
                password,
                name,
                role,
                college,
                department,
                batch,
                company,
                job_title: jobTitle
            };

        try {
            const data = await api.post(endpoint, payload);

            if (data.requires_approval) {
                setNotice(data.message || "Signup successful! Your account is pending verification by your College Admin.");
                setIsLogin(true);
            } else {
                localStorage.setItem("token", data.access_token);
                localStorage.setItem("user", JSON.stringify(data.user));

                if (data.user?.role === 'college_admin') {
                    navigate('/admin');
                } else {
                    navigate('/feed');
                }
            }
        } catch (err) {
            setError(err.message || "Authentication failed. Ensure the backend server is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F4F5FA] p-4 sm:p-8 flex items-center justify-center font-sans" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
            <div className="w-full max-w-5xl rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-xl bg-white border border-gray-100">

                {/* Left Side: Branding & Quick Role Demo Selector */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-between bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 relative overflow-hidden">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-violet-400/20 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="bg-white/10 backdrop-blur-md inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 mb-8">
                            <Sparkles className="w-4 h-4 text-white" />
                            <span className="text-xs font-bold text-white tracking-wide">Alumni Connect Network</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
                            Academic Proof-of-Work Platform
                        </h1>
                        <p className="text-white/80 text-sm leading-relaxed mb-8 font-medium">
                            Cross-college academic networking for Students, Faculty, Alumni, and College Administrators. Universal feeds, localized skill evaluation, and digital portfolios.
                        </p>
                    </div>

                    {/* Demo Quick Logins */}
                    <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl">
                        <p className="text-xs text-white/90 font-bold mb-3 uppercase tracking-widest">Quick Demo Login:</p>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <button
                                type="button"
                                onClick={() => handleQuickLogin('student@ciitm.org')}
                                className="flex items-center gap-2 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-left transition-colors border border-white/10 shadow-sm"
                            >
                                <GraduationCap className="w-4 h-4 text-white flex-shrink-0" />
                                <div><p className="font-bold">Student</p><p className="text-[10px] text-white/70 font-medium">CIITM</p></div>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleQuickLogin('faculty@ciitm.org')}
                                className="flex items-center gap-2 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-left transition-colors border border-white/10 shadow-sm"
                            >
                                <UserCheck className="w-4 h-4 text-white flex-shrink-0" />
                                <div><p className="font-bold">Faculty</p><p className="text-[10px] text-white/70 font-medium">CIITM</p></div>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleQuickLogin('alumni@ciitm.org')}
                                className="flex items-center gap-2 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-left transition-colors border border-white/10 shadow-sm"
                            >
                                <Briefcase className="w-4 h-4 text-white flex-shrink-0" />
                                <div><p className="font-bold">Alumni</p><p className="text-[10px] text-white/70 font-medium">CIITM</p></div>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleQuickLogin('admin@ciitm.org')}
                                className="flex items-center gap-2 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-left transition-colors border border-white/10 shadow-sm"
                            >
                                <Shield className="w-4 h-4 text-white flex-shrink-0" />
                                <div><p className="font-bold">Admin</p><p className="text-[10px] text-white/70 font-medium">CIITM</p></div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side: Auth Form */}
                <div className="w-full md:w-1/2 bg-white p-8 md:p-12 relative overflow-y-auto max-h-[90vh] custom-scrollbar">
                    <h2 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">
                        {isLogin ? "Welcome Back" : "Create Centralized Profile"}
                    </h2>

                    {notice && (
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 text-sm rounded-xl mb-6 flex items-start gap-2 shadow-sm font-medium">
                            <Sparkles className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span>{notice}</span>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-3 text-sm rounded-xl mb-6 flex items-start gap-2 shadow-sm font-medium">
                            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleAuth} className="space-y-4">
                        {!isLogin && (
                            <div>
                                <label className="text-xs text-gray-700 font-bold block mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. John Doe"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-violet-500 transition-colors"
                                />
                            </div>
                        )}

                        <div>
                            <label className="text-xs text-gray-700 font-bold block mb-1">Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@domain.edu"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-violet-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-gray-700 font-bold block mb-1">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-violet-500 transition-colors"
                            />
                        </div>

                        {!isLogin && (
                            <>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-700 font-bold block mb-1">Role</label>
                                        <select
                                            value={role}
                                            onChange={(e) => setRole(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-900 focus:outline-none focus:border-violet-500 transition-colors"
                                        >
                                            <option value="student">Student</option>
                                            <option value="faculty">Faculty</option>
                                            <option value="alumni">Alumni</option>
                                            <option value="college_admin">College Admin</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-700 font-bold block mb-1">Institution</label>
                                        <select
                                            value={college}
                                            onChange={(e) => setCollege(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-900 focus:outline-none focus:border-violet-500 transition-colors"
                                        >
                                            {collegesList.map((c) => (
                                                <option key={c.id} value={c.name}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-gray-700 font-bold block mb-1">Academic Department</label>
                                    <input
                                        type="text"
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                        placeholder="e.g. Computer Science"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-violet-500 transition-colors"
                                    />
                                </div>

                                {role === 'alumni' && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-gray-700 font-bold block mb-1">Company</label>
                                            <input
                                                type="text"
                                                value={company}
                                                onChange={(e) => setCompany(e.target.value)}
                                                placeholder="e.g. Google"
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-900 focus:outline-none focus:border-violet-500 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-700 font-bold block mb-1">Job Title</label>
                                            <input
                                                type="text"
                                                value={jobTitle}
                                                onChange={(e) => setJobTitle(e.target.value)}
                                                placeholder="e.g. Security Analyst"
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-900 focus:outline-none focus:border-violet-500 transition-colors"
                                            />
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg text-sm mt-6 disabled:opacity-50"
                        >
                            {loading ? "Processing..." : isLogin ? "Sign In" : "Register Account"}
                        </button>
                    </form>

                    <div className="text-center mt-8">
                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError(null);
                                setNotice(null);
                            }}
                            className="text-sm text-gray-500 font-medium hover:text-violet-600 transition-colors"
                        >
                            {isLogin ? "Need an account? Register your profile" : "Already have an account? Sign in"}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
