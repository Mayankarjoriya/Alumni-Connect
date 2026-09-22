import React, { useState, useEffect } from 'react';
import { Search, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/client';

export default function SearchModal({ isOpen, onClose, onSelectUserChat }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchRole, setSearchRole] = useState('');
    const [topStudentsOnly, setTopStudentsOnly] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    q: searchQuery,
                    role: searchRole,
                    top_students: topStudentsOnly ? 'true' : 'false'
                });
                const data = await api.get(`/api/users/search?${params.toString()}`);
                setSearchResults(data || []);
            } catch (err) {
                console.error("Search failed:", err);
            } finally {
                setLoading(false);
            }
        }, 200);

        return () => clearTimeout(timer);
    }, [searchQuery, searchRole, topStudentsOnly, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white border border-gray-100 rounded-3xl w-full max-w-2xl p-6 shadow-xl max-h-[85vh] flex flex-col text-gray-900"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Search className="text-violet-600" /> Global Directory Search
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xs font-bold transition-colors">✕ Close</button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                    <input
                        type="text"
                        placeholder="Search by Name, Dept, College..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-400 transition-colors"
                    />
                    <select
                        value={searchRole}
                        onChange={(e) => setSearchRole(e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-violet-400 transition-colors"
                    >
                        <option value="">All Roles</option>
                        <option value="student">Students Only</option>
                        <option value="faculty">Faculty Only</option>
                        <option value="alumni">Alumni Only</option>
                    </select>
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 cursor-pointer transition-colors">
                        <input
                            type="checkbox"
                            checked={topStudentsOnly}
                            onChange={(e) => setTopStudentsOnly(e.target.checked)}
                            className="rounded accent-violet-600 w-4 h-4"
                        />
                        <span>Top Students (Credits)</span>
                    </label>
                </div>

                {/* Search Results */}
                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                    {loading ? (
                        <p className="text-center text-gray-400 py-10 text-sm font-medium">Searching directory...</p>
                    ) : searchResults.length === 0 ? (
                        <p className="text-center text-gray-400 py-10 text-sm font-medium">No users matching search criteria found.</p>
                    ) : (
                        searchResults.map((u) => (
                            <div
                                key={u.id}
                                className="bg-white border border-gray-100 p-4 rounded-2xl flex items-center justify-between hover:shadow-md hover:border-gray-200 transition-all shadow-sm group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold">
                                        {u.name?.[0] || 'U'}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-sm text-gray-900">{u.name}</h4>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-gray-100 text-gray-600 capitalize">
                                                {u.role}
                                            </span>
                                            {u.role === 'student' && (
                                                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg">
                                                    ⭐ {u.credits || 0} pts
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                                            {u.department} • {u.college}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Link
                                        to={`/profile/${u.id}`}
                                        className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-violet-600 transition-colors"
                                        title="View Profile"
                                        onClick={onClose}
                                    >
                                        <ExternalLink size={16} />
                                    </Link>
                                    {onSelectUserChat && (
                                        <button
                                            onClick={() => {
                                                onSelectUserChat(u);
                                                onClose();
                                            }}
                                            className="bg-violet-50 text-violet-600 hover:bg-violet-100 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
                                        >
                                            Message
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
