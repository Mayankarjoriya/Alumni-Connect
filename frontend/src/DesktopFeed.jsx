import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Bell, MessageSquare, Plus, TrendingUp } from 'lucide-react';
import api from './api/client';
import Sidebar from './components/common/Sidebar';
import PostCard from './components/feed/PostCard';
import CreatePostModal from './components/feed/CreatePostModal';
import SearchModal from './components/feed/SearchModal';
import ChatModal from './components/feed/ChatModal';
import EvaluateModal from './components/feed/EvaluateModal';
import FacultyHub from './components/faculty/FacultyHub';
import AlumniHub from './components/alumni/AlumniHub';

/* ─── Top header bar ─── */
function DashboardHeader({ currentUser, onSearch, onMessages, onPost }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 px-5 py-3.5 flex items-center justify-between flex-shrink-0" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
            {/* Search pill */}
            <button
                onClick={onSearch}
                className="flex items-center gap-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl px-4 py-2 w-60 border border-gray-200 text-gray-400 text-sm transition-colors"
            >
                <Search size={15} /> Search students, faculty...
            </button>

            {/* Right: actions + user */}
            <div className="flex items-center gap-2">
                <button onClick={onPost} className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-md shadow-violet-100">
                    <Plus size={14} /> New Post
                </button>
                <button onClick={onMessages} className="w-9 h-9 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors">
                    <MessageSquare size={16} className="text-gray-500" />
                </button>

                {/* User chip */}
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
    );
}

/* ─── Stat pill ─── */
function StatPill({ value, label, color, bg }) {
    return (
        <div className="flex-1 rounded-xl p-3 text-center" style={{ backgroundColor: bg }}>
            <p className="font-extrabold text-xl leading-tight" style={{ color }}>{value ?? 0}</p>
            <p className="text-gray-500 text-[11px] font-semibold mt-0.5">{label}</p>
        </div>
    );
}

/* ─── Right panel: stats + weekly activity ─── */
function RightPanel({ currentUser }) {
    return (
        <aside className="w-64 flex-shrink-0 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
            {/* Greeting + stats */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
                <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">My Stats</p>
                    <TrendingUp size={14} className="text-violet-600" />
                </div>

                {/* Credits ring (CSS) */}
                <div className="flex justify-center mb-4">
                    <div className="relative w-20 h-20 rounded-full border-[6px] border-violet-100 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(#5B4DFB ${Math.min((currentUser.credits || 0) / 500 * 360, 360)}deg, #EEF2FF 0deg)`, borderRadius: '50%', opacity: 0.3 }} />
                        <div className="text-center z-10">
                            <p className="text-xl font-black text-violet-600 leading-none">{currentUser.credits || 0}</p>
                            <p className="text-[10px] text-gray-400 font-medium">credits</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <StatPill value={currentUser.badges?.length} label="Badges"   color="#EC4899" bg="#FDF2F8" />
                    <StatPill value={currentUser.projects?.length} label="Projects" color="#10B981" bg="#ECFDF5" />
                </div>
            </div>

            {/* Weekly activity chart */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Weekly Activity</p>
                <div className="flex items-end gap-1.5 h-16">
                    {[40, 65, 35, 80, 55, 90, 70].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <div className="w-full bg-violet-600 rounded-t-sm" style={{ height: `${h}%`, opacity: 0.5 + i * 0.07 }} />
                            <span className="text-[9px] text-gray-400 font-medium">{['M','T','W','T','F','S','S'][i]}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Badges list */}
            {currentUser.badges?.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Recent Badges</p>
                    <div className="space-y-2">
                        {currentUser.badges.slice(0, 4).map((b, i) => (
                            <div key={i} className="flex items-center gap-2.5 py-1">
                                <div className="w-7 h-7 bg-yellow-100 rounded-lg flex items-center justify-center text-sm flex-shrink-0">🏆</div>
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold text-gray-800 truncate">{b.name}</p>
                                    <p className="text-[10px] text-gray-400 truncate">{b.issuer}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </aside>
    );
}

/* ─── Main ─── */
export default function DesktopFeed() {
    const [activeModal, setActiveModal] = useState(null);
    const [activeChatUser, setActiveChatUser] = useState(null);
    const [evalStudent, setEvalStudent] = useState(null);
    
    const queryClient = useQueryClient();
    const currentUser = JSON.parse(localStorage.getItem('user') || '{"name":"User","role":"student"}');

    // Role dispatch
    if (currentUser.role === 'faculty') return <FacultyHub />;
    if (currentUser.role === 'alumni')  return <AlumniHub />;

    const { data: posts = [], isLoading: loading } = useQuery({
        queryKey: ['posts'],
        queryFn: async () => {
            const data = await api.get('/api/posts');
            return data || [];
        }
    });

    const createPostMutation = useMutation({
        mutationFn: ({ content, post_type }) => api.post('/api/posts', { content, post_type }),
        onSuccess: () => {
            setActiveModal(null);
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        }
    });

    const likeMutation = useMutation({
        mutationFn: (id) => api.post(`/api/posts/${id}/like`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] })
    });

    const commentMutation = useMutation({
        mutationFn: ({ id, content }) => api.post(`/api/posts/${id}/comment`, { content }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] })
    });

    const handleCreatePost = (data) => createPostMutation.mutate(data);
    const handleLike = (id) => likeMutation.mutate(id);
    const handleComment = (id, content) => commentMutation.mutate({ id, content });
    
    const handleOpenChat = (user) => { setActiveChatUser(user); setActiveModal('messages'); };
    const handleOpenEvaluate = (student) => { setEvalStudent(student); setActiveModal('evaluate'); };

    const greet = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good Morning';
        if (h < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <div className="h-screen bg-[#F4F5FA] flex p-4 gap-4 overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

            {/* Sidebar */}
            <Sidebar activeTab="feed" onSelectModal={m => setActiveModal(m)} />

            {/* Main column */}
            <div className="flex-1 flex flex-col gap-4 min-w-0 overflow-hidden">

                {/* Header */}
                <DashboardHeader
                    currentUser={currentUser}
                    onSearch={() => setActiveModal('search')}
                    onMessages={() => setActiveModal('messages')}
                    onPost={() => setActiveModal('post')}
                />

                {/* Scrollable content */}
                <div className="flex-1 flex gap-4 overflow-hidden">
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-5 pr-1">

                        {/* Hero banner */}
                        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white relative overflow-hidden">
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/10 font-black leading-none select-none" style={{ fontSize: 100 }}>✦</span>
                            <span className="absolute right-20 bottom-3 text-white/10 font-black leading-none select-none" style={{ fontSize: 40 }}>✦</span>
                            <span className="text-xs font-bold bg-white/20 border border-white/20 px-3 py-1 rounded-full inline-block mb-3 uppercase tracking-wide">
                                STUDENT DASHBOARD
                            </span>
                            <h2 className="text-2xl font-extrabold leading-tight mb-1">
                                {greet()}, {currentUser.name?.split(' ')[0]}! 🔥
                            </h2>
                            <p className="text-white/65 text-sm mb-4">Stay active, earn credits, and connect with your network.</p>
                            <div className="flex gap-3">
                                <StatPill value={currentUser.credits || 0}       label="Credits"  color="#5B4DFB" bg="rgba(255,255,255,0.15)" />
                                <StatPill value={currentUser.badges?.length || 0} label="Badges"   color="#EC4899" bg="rgba(255,255,255,0.15)" />
                                <StatPill value={currentUser.projects?.length || 0} label="Projects" color="#10B981" bg="rgba(255,255,255,0.15)" />
                            </div>
                        </div>

                        {/* Feed */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="font-extrabold text-gray-900 text-base">Network Feed</h2>
                                    <p className="text-gray-400 text-xs mt-0.5">Activity from across all institutions</p>
                                </div>
                            </div>

                            {loading ? (
                                <div className="text-center py-16 text-gray-400 text-sm">Loading feed...</div>
                            ) : posts.length === 0 ? (
                                <div className="text-center py-16">
                                    <p className="text-gray-400 text-sm">No posts yet.</p>
                                    <button onClick={() => setActiveModal('post')} className="mt-3 text-violet-600 text-xs font-bold hover:underline">Be the first to post →</button>
                                </div>
                            ) : (
                                <div className="columns-1 xl:columns-2 gap-4 space-y-4">
                                    {posts.map(post => (
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

                    {/* Right panel */}
                    <RightPanel currentUser={currentUser} />
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
                onEvaluated={() => queryClient.invalidateQueries({ queryKey: ['posts'] })}
            />
        </div>
    );
}
