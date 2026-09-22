import React, { useState, useEffect } from 'react';
import { Trophy, Users, Newspaper, Search, ChevronRight, MessageSquare, Plus, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import Sidebar from '../common/Sidebar';
import PostCard from '../feed/PostCard';
import CreatePostModal from '../feed/CreatePostModal';
import SearchModal from '../feed/SearchModal';
import ChatModal from '../feed/ChatModal';

const TABS = [
    { id: 'leaderboard', label: 'Leaderboard',      icon: <Trophy size={16} /> },
    { id: 'directory',   label: 'People Directory', icon: <Users size={16} /> },
    { id: 'feed',        label: 'Network Feed',     icon: <Newspaper size={16} /> },
];

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
    const [activeTab, setActiveTab] = useState('leaderboard');
    const [leaderboard, setLeaderboard] = useState([]);
    const [people, setPeople] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [peopleFilter, setPeopleFilter] = useState('all');
    const [peopleSearch, setPeopleSearch] = useState('');
    const [activeModal, setActiveModal] = useState(null);
    const [activeChatUser, setActiveChatUser] = useState(null);

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    const loadData = async () => {
        try {
            const [lb, postsData] = await Promise.all([
                api.get('/api/users/search?top_students=true'),
                api.get('/api/posts'),
            ]);
            setLeaderboard(lb || []);
            setPosts(postsData || []);
        } catch (err) {
            console.error('AlumniHub load error:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadPeople = async () => {
        try {
            const roleParam   = peopleFilter !== 'all' ? `&role=${peopleFilter}` : '';
            const searchParam = peopleSearch ? `&q=${encodeURIComponent(peopleSearch)}` : '';
            const data = await api.get(`/api/users/search?${roleParam}${searchParam}`);
            setPeople(data || []);
        } catch (err) {
            console.error('Load people error:', err);
        }
    };

    useEffect(() => { loadData(); }, []);
    useEffect(() => { if (activeTab === 'directory') loadPeople(); }, [activeTab, peopleFilter, peopleSearch]);

    const handleLike    = async (id) => { try { await api.post(`/api/posts/${id}/like`); loadData(); } catch {} };
    const handleComment = async (id, content) => { try { await api.post(`/api/posts/${id}/comment`, { content }); loadData(); } catch {} };
    const handleCreatePost = async ({ content, post_type }) => {
        try { await api.post('/api/posts', { content, post_type }); setActiveModal(null); loadData(); } catch {}
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
                    onMessages={() => setActiveModal('messages')}
                    onPost={() => setActiveModal('post')}
                />

                <div className="flex-1 flex gap-4 overflow-hidden">
                    <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-2xl border border-gray-100" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
                        {/* Tab bar */}
                        <div className="flex gap-1 px-6 pt-3 border-b border-gray-100 flex-shrink-0 bg-gray-50/50">
                            {TABS.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-t-xl text-xs font-semibold transition-all border-b-2 ${
                                        activeTab === tab.id
                                            ? 'text-purple-600 border-purple-600 bg-white'
                                            : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    {tab.icon} {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-white">
                            {/* ── Tab 1: Leaderboard ── */}
                            {activeTab === 'leaderboard' && (
                                <div>
                                    <div className="mb-8">
                                        <h2 className="text-xl font-bold text-gray-900">Student Leaderboard</h2>
                                        <p className="text-xs text-gray-500 mt-1">Top students ranked by academic credits & achievements.</p>
                                    </div>

                                    {/* Podium — top 3 */}
                                    {leaderboard.length >= 3 && (
                                        <div className="flex justify-center items-end gap-6 mb-10">
                                            {podiumOrder.map(idx => {
                                                const s = leaderboard[idx];
                                                return (
                                                    <div key={idx} className="flex flex-col items-center gap-2">
                                                        {idx === 0 && <Trophy className="text-yellow-500 mb-1" size={22} />}
                                                        <div
                                                            className={`rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center font-extrabold text-white shadow-md
                                                                ${idx === 0 ? 'w-16 h-16 text-xl ring-4 ring-yellow-200' : 'w-12 h-12 text-base'}`}
                                                        >
                                                            {s?.name?.[0]}
                                                        </div>
                                                        <div className="text-center">
                                                            <p className={`text-xs font-bold ${idx === 0 ? 'text-yellow-600' : idx === 1 ? 'text-gray-600' : 'text-orange-600'}`}>
                                                                {s?.name?.split(' ')[0]}
                                                            </p>
                                                            <p className="text-gray-500 text-[10px]">{s?.credits ?? 0} pts</p>
                                                        </div>
                                                        <div className={`${podiumBg[idx]} border-t border-x border-gray-100 rounded-t-xl w-20 ${podiumH[idx]} flex items-center justify-center font-extrabold text-xl ${rankBg[idx].split(' ')[1]}`}>
                                                            {idx + 1}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Full ranked list */}
                                    <div className="space-y-3">
                                        {leaderboard.map((student, idx) => (
                                            <div
                                                key={student.id}
                                                onClick={() => navigate(`/profile/${student.id}`)}
                                                className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md hover:border-purple-200 cursor-pointer transition-all group"
                                            >
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                                                    idx < 3 ? rankBg[idx] : 'bg-gray-50 text-gray-500'
                                                }`}>
                                                    {idx + 1}
                                                </div>
                                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center font-bold text-white text-sm flex-shrink-0 shadow-sm">
                                                    {student.name?.[0]}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-gray-900 text-sm font-bold truncate group-hover:text-purple-600 transition-colors">{student.name}</p>
                                                    <p className="text-gray-500 text-xs truncate">{student.department} · {student.batch || 'N/A'}</p>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <p className="text-purple-600 font-bold text-sm">{student.credits ?? 0} pts</p>
                                                    <p className="text-gray-400 text-[10px] font-medium">{student.badges?.length ?? 0} badges</p>
                                                </div>
                                                <ChevronRight size={16} className="text-gray-400 group-hover:text-purple-600 transition-colors flex-shrink-0" />
                                            </div>
                                        ))}

                                        {leaderboard.length === 0 && !loading && (
                                            <div className="text-center py-20">
                                                <Trophy className="mx-auto mb-3 text-gray-300" size={44} />
                                                <p className="text-gray-500 text-sm">No student rankings yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ── Tab 2: People Directory ── */}
                            {activeTab === 'directory' && (
                                <div>
                                    <div className="mb-6">
                                        <h2 className="text-xl font-bold text-gray-900">People Directory</h2>
                                        <p className="text-xs text-gray-500 mt-1">Browse and connect with the entire academic network.</p>
                                    </div>

                                    {/* Filters */}
                                    <div className="flex flex-col sm:flex-row gap-3 mb-6">
                                        <div className="flex bg-gray-50 border border-gray-200 rounded-xl p-1 gap-1 flex-shrink-0">
                                            {ROLE_FILTERS.map(r => (
                                                <button
                                                    key={r}
                                                    onClick={() => setPeopleFilter(r)}
                                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors capitalize ${
                                                        peopleFilter === r
                                                            ? 'bg-white text-purple-700 shadow-sm'
                                                            : 'text-gray-500 hover:text-gray-900'
                                                    }`}
                                                >
                                                    {r === 'all' ? 'All' : r}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex-1 relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                            <input
                                                type="text"
                                                placeholder="Search by name, department, college..."
                                                value={peopleSearch}
                                                onChange={e => setPeopleSearch(e.target.value)}
                                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {people.map(person => (
                                            <div
                                                key={person.id}
                                                onClick={() => navigate(`/profile/${person.id}`)}
                                                className="bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md hover:border-purple-200 cursor-pointer transition-all flex items-start gap-3 group"
                                            >
                                                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${AVATAR_GRADIENT[person.role] || 'from-gray-400 to-gray-500'} flex items-center justify-center font-bold text-white text-base flex-shrink-0 shadow-sm`}>
                                                    {person.name?.[0]}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                        <p className="text-gray-900 text-sm font-bold truncate group-hover:text-purple-600 transition-colors">{person.name}</p>
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-lg font-bold capitalize flex-shrink-0 ${ROLE_STYLE[person.role] || 'text-gray-600 bg-gray-100'}`}>
                                                            {person.role}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-500 text-xs truncate">{person.department}</p>
                                                    <p className="text-gray-400 text-[11px] truncate font-medium">{person.college}</p>
                                                    {person.company && (
                                                        <p className="text-purple-600 font-semibold text-[11px] mt-1 truncate">💼 {person.company}</p>
                                                    )}
                                                    {person.job_title && (
                                                        <p className="text-gray-500 text-[11px] truncate">{person.job_title}</p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        setActiveChatUser(person);
                                                        setActiveModal('messages');
                                                    }}
                                                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-50 text-gray-500 hover:text-purple-600 hover:bg-purple-50 transition-colors flex-shrink-0"
                                                    title="Send message"
                                                >
                                                    <MessageSquare size={14} />
                                                </button>
                                            </div>
                                        ))}

                                        {people.length === 0 && (
                                            <div className="col-span-2 text-center py-20">
                                                <Users className="mx-auto mb-3 text-gray-300" size={44} />
                                                <p className="text-gray-500 text-sm">No users found matching your filter.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ── Tab 3: Network Feed ── */}
                            {activeTab === 'feed' && (
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
                                        <div className="columns-1 xl:columns-2 gap-4 space-y-4">
                                            {posts.map(post => (
                                                <PostCard
                                                    key={post.id} post={post} currentUser={currentUser}
                                                    onLike={handleLike} onComment={handleComment}
                                                    onEvaluate={() => {}}
                                                    onChat={(u) => { setActiveChatUser(u); setActiveModal('messages'); }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <RightPanel currentUser={currentUser} />
                </div>
            </div>

            {/* Modals */}
            <CreatePostModal isOpen={activeModal === 'post'}     onClose={() => setActiveModal(null)} onSubmit={handleCreatePost} />
            <SearchModal     isOpen={activeModal === 'search'}   onClose={() => setActiveModal(null)} onSelectUserChat={(u) => { setActiveChatUser(u); setActiveModal('messages'); }} />
            <ChatModal       isOpen={activeModal === 'messages'} onClose={() => setActiveModal(null)} activeChatUser={activeChatUser} onSelectChatUser={setActiveChatUser} />
        </div>
    );
}
