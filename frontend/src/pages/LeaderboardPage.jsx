import React, { useState, useEffect } from 'react';
import { Trophy, ChevronRight, MessageSquare, Search, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import Sidebar from '../components/common/Sidebar';
import CreatePostModal from '../components/feed/CreatePostModal';
import SearchModal from '../components/feed/SearchModal';

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
                        {currentUser.name?.[0] || 'U'}
                    </div>
                    <div className="hidden md:block">
                        <p className="text-xs font-bold text-gray-900 leading-tight">{currentUser.name?.split(' ')[0]}</p>
                        <p className="text-[10px] text-gray-400 capitalize">{currentUser.role?.replace('_', ' ')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LeaderboardPage() {
    const navigate = useNavigate();
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeModal, setActiveModal] = useState(null);

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        api.get('/api/users/search?top_students=true')
           .then(data => setLeaderboard(data || []))
           .catch(err => console.error(err))
           .finally(() => setLoading(false));
    }, []);

    const handleCreatePost = async ({ content, post_type, media_urls }) => {
        try { await api.post('/api/posts', { content, post_type, media_urls }); setActiveModal(null); } catch {}
    };

    const rankBg    = ['bg-yellow-100 text-yellow-600', 'bg-gray-100 text-gray-600', 'bg-orange-100 text-orange-600'];
    const podiumH   = ['h-24', 'h-16', 'h-12'];
    const podiumBg  = ['bg-yellow-50', 'bg-gray-50', 'bg-orange-50'];
    const podiumOrder = [1, 0, 2]; // 2nd · 1st · 3rd

    return (
        <div className="h-screen bg-[#F4F5FA] flex p-4 gap-4 overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
            <Sidebar activeTab="leaderboard" onSelectModal={setActiveModal} />

            <div className="flex-1 flex flex-col gap-4 min-w-0 overflow-hidden">
                <DashboardHeader
                    currentUser={currentUser}
                    onSearch={() => setActiveModal('search')}
                    onMessages={() => navigate("/messages")}
                    onPost={() => setActiveModal('post')}
                />

                <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-white rounded-2xl border border-gray-100" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900">Student Leaderboard</h2>
                        <p className="text-xs text-gray-500 mt-1">Top students ranked by academic credits & achievements.</p>
                    </div>

                    {loading ? (
                        <div className="text-center py-20 text-gray-400 text-sm">Loading leaderboard...</div>
                    ) : (
                        <>
                            {leaderboard.length >= 3 && (
                                <div className="flex justify-center items-end gap-6 mb-10 mt-10">
                                    {podiumOrder.map(idx => {
                                        const s = leaderboard[idx];
                                        if (!s) return null;
                                        return (
                                            <div key={idx} className="flex flex-col items-center gap-2">
                                                {idx === 0 && <Trophy className="text-yellow-500 mb-1 animate-bounce" size={26} />}
                                                <div
                                                    className={`rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center font-extrabold text-white shadow-md cursor-pointer hover:scale-105 transition-transform
                                                        ${idx === 0 ? 'w-20 h-20 text-2xl ring-4 ring-yellow-200' : 'w-14 h-14 text-lg'}`}
                                                    onClick={() => navigate(`/profile/${s.id}`)}
                                                >
                                                    {s?.name?.[0]}
                                                </div>
                                                <div className="text-center mt-2">
                                                    <p className={`text-sm font-bold ${idx === 0 ? 'text-yellow-600' : idx === 1 ? 'text-gray-600' : 'text-orange-600'}`}>
                                                        {s?.name?.split(' ')[0]}
                                                    </p>
                                                    <p className="text-gray-500 font-medium text-xs mt-0.5">{s?.credits ?? 0} pts</p>
                                                </div>
                                                <div className={`${podiumBg[idx]} border-t border-x border-gray-100 rounded-t-2xl w-24 ${podiumH[idx]} flex items-center justify-center font-extrabold text-2xl ${rankBg[idx].split(' ')[1]} mt-2 shadow-[inset_0_4px_10px_rgba(0,0,0,0.02)]`}>
                                                    {idx + 1}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="space-y-3 max-w-4xl mx-auto">
                                {leaderboard.map((student, idx) => (
                                    <div
                                        key={student.id}
                                        onClick={() => navigate(`/profile/${student.id}`)}
                                        className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md hover:border-violet-200 cursor-pointer transition-all group"
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                                            idx < 3 ? rankBg[idx] : 'bg-gray-50 text-gray-500 font-medium'
                                        }`}>
                                            {idx + 1}
                                        </div>
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center font-bold text-white text-base flex-shrink-0 shadow-sm">
                                            {student.name?.[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-gray-900 text-sm font-bold truncate group-hover:text-violet-600 transition-colors">{student.name}</p>
                                            <p className="text-gray-500 text-xs truncate">{student.department} · {student.batch || 'N/A'}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-violet-600 font-bold text-sm">{student.credits ?? 0} pts</p>
                                            <p className="text-gray-400 text-[10px] font-medium">{student.badges?.length ?? 0} badges</p>
                                        </div>
                                        <ChevronRight size={16} className="text-gray-400 group-hover:text-violet-600 transition-colors flex-shrink-0 ml-2" />
                                    </div>
                                ))}

                                {leaderboard.length === 0 && !loading && (
                                    <div className="text-center py-20">
                                        <Trophy className="mx-auto mb-3 text-gray-300" size={44} />
                                        <p className="text-gray-500 text-sm">No student rankings yet.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <CreatePostModal isOpen={activeModal === 'post'} onClose={() => setActiveModal(null)} onSubmit={handleCreatePost} />
            <SearchModal isOpen={activeModal === 'search'} onClose={() => setActiveModal(null)} onSelectUserChat={(u) => navigate(`/messages?user=${u.id}`)} />
        </div>
    );
}
