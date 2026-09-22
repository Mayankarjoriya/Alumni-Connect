import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, GraduationCap, BookOpen, Briefcase } from 'lucide-react';
import BooksScene from './components/three/BooksScene';

/* ─── Static data ─── */
const STATS = [
    { value: '50+',  label: 'Institutions',    color: '#5B4DFB' },
    { value: '10K+', label: 'Alumni Connected', color: '#EC4899' },
    { value: '25K+', label: 'Students',         color: '#10B981' },
    { value: '500+', label: 'Faculty Members',  color: '#F59E0B' },
];

const FEATURES = [
    {
        icon: GraduationCap,
        title: 'Student Portfolio',
        desc: 'Showcase projects, earn faculty badges, and build a verified digital portfolio that stands out to every recruiter.',
        color: '#5B4DFB', bg: '#EEF2FF',
        items: ['Verified Project Showcase', 'Faculty Badges & Credits', 'Digital Portfolio URL'],
    },
    {
        icon: BookOpen,
        title: 'Faculty Evaluation',
        desc: 'Upload student work, write evaluation essays, award recognition — all in one seamless workflow.',
        color: '#EC4899', bg: '#FDF2F8',
        items: ['Work Uploads', 'Evaluation Essays', 'Credit Awards'],
    },
    {
        icon: Briefcase,
        title: 'Alumni Network',
        desc: 'Post job opportunities, browse the student leaderboard, and stay connected with your alma mater\'s best talent.',
        color: '#10B981', bg: '#ECFDF5',
        items: ['Jobs & Bulletin Board', 'Student Leaderboard', 'Direct Messaging'],
    },
];

const STEPS = [
    { num: '01', title: 'Sign Up & Verify', desc: 'Register with your college credentials. Faculty and alumni get verified by the college admin.' },
    { num: '02', title: 'Build Your Profile', desc: 'Add projects, skills, and achievements. Faculty can award badges and credits to standout students.' },
    { num: '03', title: 'Connect & Grow',  desc: 'Post on the feed, browse the bulletin board, find project partners, and message anyone in the network.' },
];

export default function LandingPage() {
    const navigate = useNavigate();

    /* redirect already-logged-in users */
    useEffect(() => {
        const token = localStorage.getItem('token');
        const user  = JSON.parse(localStorage.getItem('user') || '{}');
        if (token && user.role) {
            navigate(user.role === 'college_admin' ? '/admin' : '/feed', { replace: true });
        }
    }, [navigate]);

    return (
        <div className="min-h-screen bg-white" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

            {/* ══════════════════════════════════ NAVBAR ══════════════════════════════════ */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-violet-200">✦</div>
                        <span className="font-extrabold text-gray-900 text-lg tracking-tight">Alumni Connect</span>
                    </div>

                    {/* Nav links */}
                    <nav className="hidden md:flex items-center gap-8">
                        {['Features', 'How it Works', 'Bulletin Board'].map(l => (
                            <a key={l} href="#" className="text-sm font-semibold text-gray-500 hover:text-violet-600 transition-colors">{l}</a>
                        ))}
                    </nav>

                    {/* CTAs */}
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/login')} className="text-sm font-bold text-gray-600 hover:text-violet-600 transition-colors px-4 py-2">
                            Sign In
                        </button>
                        <button onClick={() => navigate('/login')} className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-extrabold px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-violet-200 flex items-center gap-2">
                            Get Started <ArrowRight size={15} />
                        </button>
                    </div>
                </div>
            </header>

            {/* ══════════════════════════════════ HERO ══════════════════════════════════ */}
            <section className="bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 relative overflow-hidden">
                {/* Decorative bg */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-white/5 rounded-full" />
                    <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-white/5 rounded-full" />
                    <span className="absolute right-8 top-1/2 -translate-y-1/2 text-white/10 font-black leading-none select-none" style={{ fontSize: 220 }}>✦</span>
                    <span className="absolute bottom-10 right-24 text-white/10 font-black leading-none select-none" style={{ fontSize: 90 }}>✦</span>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-24 md:py-32 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

                        {/* ── Left: Text ── */}
                        <div>
                            <span className="inline-flex items-center gap-2 bg-white/15 border border-white/20 text-white text-xs font-bold px-4 py-2 rounded-full mb-7">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                Alumni · Students · Faculty · Admins
                            </span>

                            <h1 className="text-4xl md:text-[52px] font-black text-white leading-tight mb-6">
                                Connect, Grow,<br />and <span className="text-yellow-300">Give&nbsp;Back</span>.
                            </h1>

                            <p className="text-white/75 text-lg leading-relaxed mb-9 max-w-lg">
                                The unified platform where alumni post jobs, faculty evaluate students, and everyone stays connected to their alma mater — all in one beautiful dashboard.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 mb-12">
                                <button onClick={() => navigate('/login')} className="bg-white text-violet-700 font-extrabold text-sm px-8 py-3.5 rounded-xl hover:bg-violet-50 transition-colors shadow-2xl shadow-violet-900/30 flex items-center justify-center gap-2">
                                    Get Started Free <ArrowRight size={16} />
                                </button>
                                <button onClick={() => navigate('/login')} className="border-2 border-white/30 text-white font-bold text-sm px-8 py-3.5 rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center">
                                    Sign In →
                                </button>
                            </div>

                            {/* Mini stat row */}
                            <div className="flex gap-10">
                                {STATS.slice(0, 3).map(s => (
                                    <div key={s.label}>
                                        <p className="text-2xl font-black text-white">{s.value}</p>
                                        <p className="text-white/55 text-xs font-semibold mt-0.5">{s.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ── Right: 3D Books Scene ── */}
                        <div className="hidden md:flex flex-col items-end gap-3 relative">
                            <BooksScene />
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════ STATS BAR ══════════════════════════════════ */}
            <section className="bg-gray-50 border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-6 py-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {STATS.map(s => (
                            <div key={s.label} className="text-center">
                                <p className="text-4xl font-black" style={{ color: s.color }}>{s.value}</p>
                                <p className="text-gray-500 text-sm font-semibold mt-1">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════ FEATURES ══════════════════════════════════ */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="inline-block bg-violet-100 text-violet-600 text-xs font-extrabold px-4 py-2 rounded-full mb-5 tracking-wide">FEATURES</span>
                        <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Built for Every Role</h2>
                        <p className="text-gray-500 text-lg max-w-2xl mx-auto">One platform with role-specific dashboards for students, faculty, alumni, and administrators.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {FEATURES.map(f => (
                            <div key={f.title} className="bg-white border border-gray-100 rounded-3xl p-7 hover:shadow-xl hover:-translate-y-1 transition-all duration-200" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: f.bg }}>
                                    <f.icon size={24} style={{ color: f.color }} />
                                </div>
                                <h3 className="text-xl font-extrabold text-gray-900 mb-3">{f.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed mb-6">{f.desc}</p>
                                <ul className="space-y-2.5">
                                    {f.items.map(item => (
                                        <li key={item} className="flex items-center gap-2.5 text-sm font-semibold" style={{ color: f.color }}>
                                            <CheckCircle size={15} /> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════ HOW IT WORKS ══════════════════════════════════ */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="inline-block bg-violet-100 text-violet-600 text-xs font-extrabold px-4 py-2 rounded-full mb-5 tracking-wide">HOW IT WORKS</span>
                        <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Up and Running in Minutes</h2>
                        <p className="text-gray-500 text-lg">Three simple steps to join your institution's alumni network.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
                        {/* Connector */}
                        <div className="hidden md:block absolute top-8 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-violet-200" />
                        {STEPS.map(step => (
                            <div key={step.num} className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-violet-600 rounded-2xl flex items-center justify-center text-white font-black text-xl mb-6 shadow-lg shadow-violet-200 relative z-10">
                                    {step.num}
                                </div>
                                <h3 className="text-lg font-extrabold text-gray-900 mb-3">{step.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════ CTA BANNER ══════════════════════════════════ */}
            <section className="py-24 bg-gradient-to-r from-violet-600 to-indigo-600 relative overflow-hidden">
                <span className="absolute right-0 top-0 text-white/10 font-black leading-none pointer-events-none select-none" style={{ fontSize: 280 }}>✦</span>
                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <h2 className="text-3xl md:text-4xl font-black text-white mb-5">Ready to join your alumni network?</h2>
                    <p className="text-white/70 text-lg mb-10">Sign up today — it's free for students and takes less than 2 minutes.</p>
                    <button onClick={() => navigate('/login')} className="bg-white text-violet-700 font-extrabold text-base px-10 py-4 rounded-2xl hover:bg-violet-50 transition-colors shadow-2xl inline-flex items-center gap-2">
                        Join Alumni Connect <ArrowRight size={18} />
                    </button>
                </div>
            </section>

            {/* ══════════════════════════════════ FOOTER ══════════════════════════════════ */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center font-black text-lg">✦</div>
                        <span className="font-extrabold text-lg">Alumni Connect</span>
                    </div>
                    <div className="flex gap-8">
                        {['Privacy', 'Terms', 'Contact', 'About'].map(l => (
                            <a key={l} href="#" className="text-sm text-gray-400 hover:text-white transition-colors font-medium">{l}</a>
                        ))}
                    </div>
                    <p className="text-gray-500 text-sm">© 2026 Alumni Connect. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
