import React, { useState, useEffect } from 'react';
import { Users, Search, MessageSquare, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import Sidebar from '../components/common/Sidebar';
import CreatePostModal from '../components/feed/CreatePostModal';
import SearchModal from '../components/feed/SearchModal';

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
                    <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">
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

export default function DirectoryPage() {
    const navigate = useNavigate();
    const [people, setPeople] = useState([]);
    const [peopleFilter, setPeopleFilter] = useState('all');
    const [peopleSearch, setPeopleSearch] = useState('');
    const [activeModal, setActiveModal] = useState(null);

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    const loadPeople = async () => {
        try {
            const roleParam   = peopleFilter !== 'all' ? `role=${peopleFilter}&` : '';
            const searchParam = peopleSearch ? `q=${encodeURIComponent(peopleSearch)}` : '';
            const data = await api.get(`/api/users/search?${roleParam}${searchParam}`);
            setPeople(data || []);
        } catch (err) {
            console.error('Load people error:', err);
        }
    };

    useEffect(() => { loadPeople(); }, [peopleFilter, peopleSearch]);

    const handleCreatePost = async ({ content, post_type, media_urls }) => {
        try { await api.post('/api/posts', { content, post_type, media_urls }); setActiveModal(null); } catch {}
    };

    return (
        <div className="h-screen bg-[#F4F5FA] flex p-4 gap-4 overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
            <Sidebar activeTab="directory" onSelectModal={setActiveModal} />

            <div className="flex-1 flex flex-col gap-4 min-w-0 overflow-hidden">
                <DashboardHeader
                    currentUser={currentUser}
                    onSearch={() => setActiveModal('search')}
                    onMessages={() => navigate("/messages")}
                    onPost={() => setActiveModal('post')}
                />

                <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-white rounded-2xl border border-gray-100" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-900">People Directory</h2>
                        <p className="text-xs text-gray-500 mt-1">Browse and connect with the entire academic network.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 mb-8">
                        <div className="flex bg-gray-50 border border-gray-200 rounded-xl p-1 gap-1 flex-shrink-0">
                            {ROLE_FILTERS.map(r => (
                                <button
                                    key={r}
                                    onClick={() => setPeopleFilter(r)}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors capitalize ${
                                        peopleFilter === r
                                            ? 'bg-white text-violet-700 shadow-sm'
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
                                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-400 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {people.map(person => (
                            <div
                                key={person.id}
                                onClick={() => navigate(`/profile/${person.id}`)}
                                className="bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md hover:border-violet-200 cursor-pointer transition-all flex items-start gap-3 group"
                            >
                                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${AVATAR_GRADIENT[person.role] || 'from-gray-400 to-gray-500'} flex items-center justify-center font-bold text-white text-base flex-shrink-0 shadow-sm`}>
                                    {person.name?.[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <p className="text-gray-900 text-sm font-bold truncate group-hover:text-violet-600 transition-colors">{person.name}</p>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-lg font-bold capitalize flex-shrink-0 ${ROLE_STYLE[person.role] || 'text-gray-600 bg-gray-100'}`}>
                                            {person.role}
                                        </span>
                                    </div>
                                    <p className="text-gray-500 text-xs truncate">{person.department}</p>
                                    <p className="text-gray-400 text-[11px] truncate font-medium">{person.college}</p>
                                    {person.company && (
                                        <p className="text-violet-600 font-semibold text-[11px] mt-1 truncate">💼 {person.company}</p>
                                    )}
                                    {person.job_title && (
                                        <p className="text-gray-500 text-[11px] truncate">{person.job_title}</p>
                                    )}
                                </div>
                                <button
                                    onClick={e => {
                                        e.stopPropagation();
                                        navigate(`/messages?user=${person.id}`);
                                    }}
                                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-50 text-gray-500 hover:text-violet-600 hover:bg-violet-50 transition-colors flex-shrink-0"
                                    title="Send message"
                                >
                                    <MessageSquare size={14} />
                                </button>
                            </div>
                        ))}

                        {people.length === 0 && (
                            <div className="col-span-full text-center py-20">
                                <Users className="mx-auto mb-3 text-gray-300" size={44} />
                                <p className="text-gray-500 text-sm">No users found matching your filter.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <CreatePostModal isOpen={activeModal === 'post'} onClose={() => setActiveModal(null)} onSubmit={handleCreatePost} />
            <SearchModal isOpen={activeModal === 'search'} onClose={() => setActiveModal(null)} onSelectUserChat={(u) => navigate(`/messages?user=${u.id}`)} />
        </div>
    );
}
