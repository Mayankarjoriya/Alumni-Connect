import React from 'react';
import { User, Award, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UserCard({ user }) {
    const navigate = useNavigate();

    const ROLE_STYLES = {
        student: { bg: 'bg-emerald-50', text: 'text-emerald-700', badge: 'bg-emerald-500' },
        faculty: { bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-600' },
        alumni: { bg: 'bg-purple-50', text: 'text-purple-700', badge: 'bg-purple-600' },
        college_admin: { bg: 'bg-amber-50', text: 'text-amber-700', badge: 'bg-amber-500' },
    };

    const style = ROLE_STYLES[user.role] || ROLE_STYLES.student;

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg ${style.badge} shadow-sm`}>
                    {user.name?.[0] || <User size={20} />}
                </div>
                <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-gray-900 text-base truncate leading-tight">{user.name}</h4>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${style.bg} ${style.text}`}>
                        {user.role}
                    </span>
                    {user.role === 'student' && user.grad_year && (
                        <p className="text-xs text-gray-500 font-medium mt-1">Class of {user.grad_year}</p>
                    )}
                    {user.role === 'alumni' && user.current_company && (
                        <p className="text-xs text-gray-500 font-medium mt-1 truncate">{user.current_company}</p>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                <div className="flex items-center gap-2">
                    {user.badges && user.badges.length > 0 ? (
                        <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1 rounded-lg text-[10px] font-bold">
                            <Award size={12} /> {user.badges.length} Badges
                        </div>
                    ) : (
                        <span className="text-[10px] text-gray-400 font-medium px-1">No Badges</span>
                    )}
                </div>
                <button
                    onClick={() => navigate(`/profile/${user.id}`)}
                    className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
                >
                    View Profile <ExternalLink size={14} />
                </button>
            </div>
        </div>
    );
}
