import React from 'react';

export default function AdminStats({ stats }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
            <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total Enrolled Students</p>
                <p className="text-2xl font-black text-emerald-600 mt-1">{stats?.total_students || 0}</p>
            </div>
            <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Verified Faculty Members</p>
                <p className="text-2xl font-black text-blue-600 mt-1">{stats?.total_faculty || 0}</p>
            </div>
            <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Verified Alumni Network</p>
                <p className="text-2xl font-black text-purple-600 mt-1">{stats?.total_alumni || 0}</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl shadow-sm">
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wide">Pending Approvals</p>
                <p className="text-2xl font-black text-amber-600 mt-1">{stats?.pending_verifications || 0}</p>
            </div>
        </div>
    );
}
