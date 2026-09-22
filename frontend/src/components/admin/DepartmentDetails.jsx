import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Filter } from 'lucide-react';
import api from '../../api/client';
import UserCard from './UserCard';

export default function DepartmentDetails({ department, college, onBack }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeRole, setActiveRole] = useState('All');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const data = await api.get(`/api/admin/departments/${encodeURIComponent(department)}/users?college=${encodeURIComponent(college)}`);
                setUsers(data || []);
            } catch (err) {
                console.error("Failed to fetch department users", err);
            } finally {
                setLoading(false);
            }
        };
        if (department) fetchUsers();
    }, [department, college]);

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = activeRole === 'All' || u.role === activeRole.toLowerCase();
        return matchesSearch && matchesRole;
    });

    const TABS = ['All', 'Student', 'Faculty', 'Alumni'];

    return (
        <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-100 p-6 md:p-8" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-xs font-bold mb-4 transition-colors"
                >
                    <ArrowLeft size={16} /> Back to Departments
                </button>
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 leading-tight">{department}</h2>
                        <p className="text-sm text-gray-500 font-medium mt-1">Total Members: <span className="font-bold text-emerald-600">{users.length}</span></p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search users by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                </div>
                
                <div className="flex bg-gray-50 border border-gray-200 rounded-xl p-1 overflow-x-auto custom-scrollbar flex-shrink-0">
                    {TABS.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveRole(tab)}
                            className={`px-4 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
                                activeRole === tab
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                {loading ? (
                    <div className="text-center py-20 text-gray-400 text-sm font-medium">Loading department members...</div>
                ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-20 text-gray-400 text-sm font-medium bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        No users found matching your filters.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredUsers.map(user => (
                            <UserCard key={user.id} user={user} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
