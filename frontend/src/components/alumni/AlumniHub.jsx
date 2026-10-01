import React, { useState, useEffect } from "react";
import { Trophy, Users, Newspaper, Search, ChevronRight, MessageSquare, Plus, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import Sidebar from '../common/Sidebar';
import PostCard from '../feed/PostCard';
import CreatePostModal from '../feed/CreatePostModal';
import SearchModal from '../feed/SearchModal';
import ChatModal from '../feed/ChatModal';



const ROLE_FILTERS = ['all', 'alumni', 'student', 'faculty'];

const ROLE_STYLE = {
    alumni:  'text-purple-600 bg-purple-50',
    student: 'text-emerald-600 bg-emerald-50',
    faculty: 'text-blue-600 bg-blue-50',
};

const AVATAR_GRADIENT = {
    alumni:  'from-purple-500 to-violet-600',
    faculty: 'from-blue-500 to-indigo-600',
    student: 'from-emerald-400 to-teal-500',
};

/* ─── Top header bar ─── */
function DashboardHeader({ currentUser, onSearch, onMessages, onPost }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 px-5 py-3.5 flex items-center justify-between flex-shrink-0" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
            <button
                onClick={onSearch}
                className="flex items-center gap-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl px-4 py-2 w-60 border border-gray-200 text-gray-400 text-sm transition-colors"
            >
                <Search size={15} /> Search people...
            </button>
            <div className="flex items-center gap-2">
                <button onClick={onPost} className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-md shadow-violet-100">
                    <Plus size={14} /> New Post
                </button>
                <button onClick={onMessages} className="w-9 h-9 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors">
                    <MessageSquare size={16} className="text-gray-500" />
                </button>
                <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 ml-1">
                    <div className="w-7 h-7 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
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

/* ─── Right panel ─── */
function RightPanel({ currentUser }) {
    return (
        <aside className="w-64 flex-shrink-0 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
            {/* Professional Info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
                <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">My Network</p>
                    <TrendingUp size={14} className="text-purple-600" />
                </div>
                <div className="bg-purple-50 rounded-xl p-3 text-center mb-3">
                    <p className="text-purple-700 font-black text-lg">Alumni</p>
                    <p className="text-[10px] text-purple-500 font-bold">{currentUser.college}</p>
                </div>
                {currentUser.company && (
                    <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">Working at</p>
                        <p className="text-gray-900 font-bold text-sm mt-1 truncate">{currentUser.company}</p>
                        {currentUser.job_title && (
                            <p className="text-[10px] text-gray-500 mt-0.5 truncate">{currentUser.job_title}</p>
                        )}
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Opportunities</p>
                <div className="space-y-2 text-xs">
                    <button className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium">Post a Job / Internship</button>
                    <button className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium">Mentor a Student</button>
                    <button className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium">Alumni Events</button>
                </div>
            </div>
        </aside>
    );
}


export default function AlumniHub() {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeModal, setActiveModal] = useState(null);
    const [activeChatUser, setActiveChatUser] = useState(null);

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    const loadData = async () => {
        try {
            const data = await api.get('/api/posts');
            setPosts(data || []);
        } catch (err) {
            console.error('AlumniHub load error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleLike    = async (id) => { try { await api.post(`/api/posts/${id}/like`); loadData(); } catch {} };
    const handleComment = async (id, content) => { try { await api.post(`/api/posts/${id}/comment`, { content }); loadData(); } catch {} };
    const handleCreatePost = async ({ content, post_type, media_urls }) => {
        try { await api.post('/api/posts', { content, post_type, media_urls }); setActiveModal(null); loadData(); } catch {}
    };

    // Podium helper colours
    const rankBg    = ['bg-yellow-100 text-yellow-600', 'bg-gray-100 text-gray-600', 'bg-orange-100 text-orange-600'];
    const podiumH   = ['h-24', 'h-16', 'h-12'];
    const podiumBg  = ['bg-yellow-50', 'bg-gray-50', 'bg-orange-50'];
    const podiumOrder = [1, 0, 2]; // 2nd · 1st · 3rd

    return (
        <div className="h-screen bg-[#F4F5FA] flex p-4 gap-4 overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
            <Sidebar activeTab="feed" onSelectModal={setActiveModal} />

            <div className="flex-1 flex flex-col gap-4 min-w-0 overflow-hidden">
                <DashboardHeader
                    currentUser={currentUser}
                    onSearch={() => setActiveModal('search')}
                    onMessages={() => navigate("/messages")}
                    onPost={() => setActiveModal('post')}
                />

                <div className="flex-1 flex gap-4 overflow-hidden">
                    <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-2xl border border-gray-100" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-white">
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Network Feed</h2>
                                        <p className="text-xs text-gray-500 mt-1">Stay connected with the community.</p>
                                    </div>
                                </div>
                                {loading ? (
                                    <div className="text-center py-20 text-gray-400 text-sm">Loading feed...</div>
                                ) : posts.length === 0 ? (
                                    <div className="text-center py-20 text-gray-500 text-sm">No posts yet.</div>
                                ) : (
                                    <div className="flex flex-col gap-6 items-center w-full">
                                        {posts.map(post => (
                                            <div key={post.id} className="w-full max-w-3xl">
                                                <PostCard
                                                    post={post} currentUser={currentUser}
                                                    onLike={handleLike} onComment={handleComment}
                                                    onEvaluate={() => {}}
                                                    onChat={(u) => navigate(`/messages?user=${u.id}`)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <RightPanel currentUser={currentUser} />
                </div>
            </div>

            {/* Modals */}
            <CreatePostModal isOpen={activeModal === 'post'}     onClose={() => setActiveModal(null)} onSubmit={handleCreatePost} />
            <SearchModal     isOpen={activeModal === 'search'}   onClose={() => setActiveModal(null)} onSelectUserChat={(u) => navigate(`/messages?user=${u.id}`)} />
            <ChatModal       isOpen={activeModal === 'messages'} onClose={() => setActiveModal(null)} activeChatUser={activeChatUser} onSelectChatUser={setActiveChatUser} />
        </div>
    );
}
