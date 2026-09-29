import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MessageSquare, Plus, Pencil, Users, Rss, Flame } from 'lucide-react';
import api from './api/client';
import Sidebar from './components/common/Sidebar';
import PostCard from './components/feed/PostCard';
import CreatePostModal from './components/feed/CreatePostModal';
import SearchModal from './components/feed/SearchModal';
import ChatModal from './components/feed/ChatModal';
import EvaluateModal from './components/feed/EvaluateModal';
import FacultyHub from './components/faculty/FacultyHub';
import AlumniHub from './components/alumni/AlumniHub';

/* ── Greeting ─────────────────────────────────────────────────────────────── */
function greet() {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
}

/* ── Skeleton loading card ────────────────────────────────────────────────── */
function SkeletonCard() {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <div className="h-1 bg-gray-100 rounded-full mb-5 w-full" />
            <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-gray-100" />
                <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-100 rounded-full w-1/3" />
                    <div className="h-2.5 bg-gray-100 rounded-full w-1/2" />
                </div>
                <div className="h-6 w-20 bg-gray-100 rounded-lg" />
            </div>
            <div className="space-y-2 mb-4">
                <div className="h-3 bg-gray-100 rounded-full w-full" />
                <div className="h-3 bg-gray-100 rounded-full w-4/5" />
                <div className="h-3 bg-gray-100 rounded-full w-3/5" />
            </div>
            <div className="flex gap-4 pt-3 border-t border-gray-50">
                <div className="h-8 bg-gray-100 rounded-xl w-20" />
                <div className="h-8 bg-gray-100 rounded-xl w-24" />
                <div className="h-8 bg-gray-100 rounded-xl w-16" />
            </div>
        </div>
    );
}

/* ── Create Post bar ──────────────────────────────────────────────────────── */
function CreatePostBar({ currentUser, onPost }) {
    const avatarColors = ['from-violet-500 to-indigo-500', 'from-emerald-400 to-teal-500', 'from-rose-400 to-pink-500'];
    const color = avatarColors[(currentUser.name?.charCodeAt(0) || 0) % avatarColors.length];

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center font-black text-white text-sm flex-shrink-0`}>
                {currentUser.name?.[0]}
            </div>
            <button
                onClick={onPost}
                className="flex-1 text-left bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-400 font-medium transition-colors cursor-pointer"
            >
                Share something with your network...
            </button>
            <button
                onClick={onPost}
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-violet-200 flex-shrink-0"
            >
                <Pencil size={13} /> Post
            </button>
        </div>
    );
}

/* ── Feed filter tabs ─────────────────────────────────────────────────────── */
function FilterTabs({ active, onChange }) {
    const tabs = [
        { id: 'all',     label: 'All',          icon: Rss },
        { id: 'project', label: 'Projects',      icon: Flame },
        { id: 'job',     label: 'Opportunities', icon: Users },
    ];
    return (
        <div className="flex gap-1 bg-white rounded-xl border border-gray-100 p-1" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            {tabs.map(t => {
                const Icon = t.icon;
                const isActive = active === t.id;
                return (
                    <button
                        key={t.id}
                        onClick={() => onChange(t.id)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all duration-200
                            ${isActive ? 'bg-violet-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}
                    >
                        <Icon size={13} />
                        {t.label}
                    </button>
                );
            })}
        </div>
    );
}

/* ── Dashboard banner ─────────────────────────────────────────────────────── */
function DashboardBanner({ currentUser }) {
    return (
        <div className="bg-gradient-to-r from-violet-600 via-violet-700 to-indigo-700 rounded-2xl p-6 text-white relative overflow-hidden flex-shrink-0">
            {/* Decorative blobs */}
            <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/5 rounded-full" />
            <div className="absolute right-12 bottom-0 w-24 h-24 bg-white/5 rounded-full" />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/[0.07] font-black select-none leading-none" style={{ fontSize: 100 }}>✦</div>

            <span className="text-[10px] font-black bg-white/20 border border-white/20 px-3 py-1 rounded-full inline-block mb-3 uppercase tracking-widest">
                Student Dashboard
            </span>
            <h2 className="text-2xl font-extrabold leading-tight mb-1">
                {greet()}, {currentUser.name?.split(' ')[0]}! 🔥
            </h2>
            <p className="text-white/60 text-sm mb-5">Stay active, earn credits, and connect with your network.</p>

            <div className="flex gap-3">
                {[
                    { val: currentUser.credits || 0,          label: 'Credits',  bg: '#7C3AED' },
                    { val: currentUser.badges?.length || 0,   label: 'Badges',   bg: '#DB2777' },
                    { val: currentUser.projects?.length || 0, label: 'Projects', bg: '#059669' },
                ].map(({ val, label, bg }) => (
                    <div key={label} className="flex-1 rounded-xl p-3 text-center" style={{ backgroundColor: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(4px)' }}>
                        <p className="font-extrabold text-xl leading-tight text-white">{val}</p>
                        <p className="text-white/60 text-[11px] font-semibold mt-0.5">{label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ── Main ─────────────────────────────────────────────────────────────────── */
export default function DesktopFeed() {
    const [posts, setPosts]           = useState([]);
    const [activeModal, setActiveModal] = useState(null);
    const [loading, setLoading]       = useState(true);
    const navigate = useNavigate();
    const [activeChatUser, setActiveChatUser] = useState(null);
    const [evalStudent, setEvalStudent]       = useState(null);
    const [activeFilter, setActiveFilter]     = useState('all');

    const currentUser = JSON.parse(localStorage.getItem('user') || '{"name":"User","role":"student"}');

    if (currentUser.role === 'college_admin') { window.location.href = '/admin'; return null; }
    if (currentUser.role === 'faculty') return <FacultyHub />;
    if (currentUser.role === 'alumni')  return <AlumniHub />;

    const fetchPosts = async () => {
        try { const data = await api.get('/api/posts'); setPosts(data || []); }
        catch (err) { console.error('Fetch posts error:', err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchPosts(); }, []);

    const handleCreatePost = async ({ content, post_type, media_urls }) => {
        try { await api.post('/api/posts', { content, post_type, media_urls }); setActiveModal(null); fetchPosts(); } catch {}
    };
    const handleLike    = async (id) => { try { await api.post(`/api/posts/${id}/like`); fetchPosts(); } catch {} };
    const handleComment = async (id, content) => { try { await api.post(`/api/posts/${id}/comment`, { content }); fetchPosts(); } catch {} };
    const handleOpenChat     = (user)    => { navigate(`/messages?user=${user.id}`); };
    const handleOpenEvaluate = (student) => { setEvalStudent(student); setActiveModal('evaluate'); };

    const filteredPosts = activeFilter === 'all' 
        ? posts 
        : posts.filter(p => p.post_type === activeFilter);

    return (
        <div className="h-screen bg-[#F4F5FA] flex p-4 gap-4 overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

            {/* Sidebar */}
            <Sidebar activeTab="feed" onSelectModal={m => setActiveModal(m)} />

            {/* Main column */}
            <div className="flex-1 flex flex-col gap-4 min-w-0 overflow-hidden">

                {/* Top search bar */}
                <div className="bg-white rounded-2xl border border-gray-100 px-5 py-3.5 flex items-center justify-between flex-shrink-0" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
                    <button
                        onClick={() => setActiveModal('search')}
                        className="flex items-center gap-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl px-4 py-2 w-64 border border-gray-200 text-gray-400 text-sm transition-colors"
                    >
                        <Search size={15} /> Search students, faculty...
                    </button>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setActiveModal('post')} className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-md shadow-violet-100">
                            <Plus size={14} /> New Post
                        </button>
                        <button onClick={() => navigate("/messages")} className="w-9 h-9 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors">
                            <MessageSquare size={16} className="text-gray-500" />
                        </button>
                        <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 ml-1">
                            <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                                {currentUser.name?.[0]}
                            </div>
                            <div className="hidden md:block">
                                <p className="text-xs font-bold text-gray-900 leading-tight">{currentUser.name?.split(' ')[0]}</p>
                                <p className="text-[10px] text-gray-400 capitalize">{currentUser.role}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scrollable feed */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="w-full space-y-4 pb-6">

                        {/* Banner */}
                        <DashboardBanner currentUser={currentUser} />

                        {/* Create post bar */}
                        <CreatePostBar currentUser={currentUser} onPost={() => setActiveModal('post')} />

                        {/* Filter tabs */}
                        <FilterTabs active={activeFilter} onChange={setActiveFilter} />

                        {/* Section header */}
                        <div className="flex items-center justify-between px-1">
                            <div>
                                <h2 className="font-extrabold text-gray-900 text-base">Network Feed</h2>
                                <p className="text-gray-400 text-xs mt-0.5">
                                    {loading ? 'Loading...' : `${filteredPosts.length} post${filteredPosts.length !== 1 ? 's' : ''} from across all institutions`}
                                </p>
                            </div>
                        </div>

                        {/* Posts */}
                        {loading ? (
                            <div className="space-y-4">
                                <SkeletonCard />
                                <SkeletonCard />
                                <SkeletonCard />
                            </div>
                        ) : filteredPosts.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                                <p className="text-4xl mb-3">📭</p>
                                <p className="text-gray-700 font-bold text-base">No posts yet</p>
                                <p className="text-gray-400 text-sm mt-1 mb-5">Be the first to share something with your network.</p>
                                <button onClick={() => setActiveModal('post')} className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-colors shadow-sm">
                                    Create a Post
                                </button>
                            </div>
                        ) : (
                            <div className="columns-1 xl:columns-2 gap-4 space-y-4">
                                {filteredPosts.map(post => (
                                    <PostCard
                                        key={post.id} post={post} currentUser={currentUser}
                                        onLike={handleLike} onComment={handleComment}
                                        onEvaluate={handleOpenEvaluate} onChat={handleOpenChat}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <CreatePostModal isOpen={activeModal === 'post'}     onClose={() => setActiveModal(null)} onSubmit={handleCreatePost} />
            <SearchModal     isOpen={activeModal === 'search'}   onClose={() => setActiveModal(null)} onSelectUserChat={handleOpenChat} />
            <ChatModal       isOpen={activeModal === 'messages'} onClose={() => setActiveModal(null)} activeChatUser={activeChatUser} onSelectChatUser={setActiveChatUser} />
            <EvaluateModal
                isOpen={activeModal === 'evaluate'}
                onClose={() => { setActiveModal(null); setEvalStudent(null); }}
                student={evalStudent}
                onEvaluated={fetchPosts}
            />
        </div>
    );
}
