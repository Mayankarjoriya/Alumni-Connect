import React from 'react';
import { Link } from 'react-router-dom';

export default function Header({ title = "Alumni Connect", badge = "Universal Feed" }) {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{"name": "User", "role": "student"}');

    return (
        <header className="h-20 px-8 flex items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur-md z-10 shadow-sm" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
            <div className="flex items-center gap-3">
                <span className="text-xl font-black text-gray-900 tracking-tight">{title}</span>
                {badge && (
                    <span className="bg-violet-50 text-violet-600 border border-violet-100 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                        {badge}
                    </span>
                )}
            </div>

            <div className="flex items-center gap-4">
                <div className="text-right text-xs">
                    <p className="font-bold text-gray-900">{currentUser.name}</p>
                    <p className="text-gray-500 capitalize font-medium">{currentUser.role} • {currentUser.college}</p>
                </div>
                <Link
                    to="/profile/me"
                    className="w-10 h-10 rounded-full bg-violet-100 border border-violet-200 flex items-center justify-center font-bold text-violet-700 hover:bg-violet-200 transition-colors shadow-sm"
                >
                    {currentUser.name?.[0] || 'U'}
                </Link>
            </div>
        </header>
    );
}
