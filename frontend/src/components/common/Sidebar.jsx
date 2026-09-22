import React from 'react';
import { Home, Search, MessageSquare, User, ShieldCheck, Megaphone, LogOut, PlusSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* ─── Single nav button ─── */
function NavItem({ icon: Icon, label, active, onClick, danger }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-xl transition-all text-left ${
                danger
                    ? 'text-red-500 hover:bg-red-50'
                    : active
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-100'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
        >
            <Icon size={17} className="flex-shrink-0" />
            <span className="truncate">{label}</span>
        </button>
    );
}

export default function Sidebar({ activeTab, onSelectModal }) {
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem('user') || '{"name":"User","role":"student"}');

    const handleLogout = () => { localStorage.clear(); navigate('/'); };

    const avatarColor = {
        student:       'bg-emerald-500',
        faculty:       'bg-blue-600',
        alumni:        'bg-purple-600',
        college_admin: 'bg-amber-500',
    }[currentUser.role] || 'bg-violet-600';

    return (
        <aside className="w-56 bg-white rounded-2xl flex flex-col py-5 px-3 flex-shrink-0 border border-gray-100" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>

            {/* Logo */}
            <div className="flex items-center gap-2.5 px-2 mb-6">
                <div className="w-8 h-8 bg-violet-600 rounded-xl flex items-center justify-center text-white font-black text-base shadow-md shadow-violet-200">✦</div>
                <span className="font-extrabold text-gray-900 text-sm tracking-tight leading-tight">Alumni<br />Connect</span>
            </div>

            {/* User chip */}
            <div className="flex items-center gap-2.5 px-3 py-2.5 bg-gray-50 rounded-xl mb-5 border border-gray-100">
                <div className={`w-8 h-8 rounded-lg ${avatarColor} flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0`}>
                    {currentUser.name?.[0] || 'U'}
                </div>
                <div className="min-w-0">
                    <p className="text-gray-900 font-bold text-xs leading-tight truncate">{currentUser.name}</p>
                    <p className="text-gray-400 text-[10px] capitalize font-medium">{currentUser.role?.replace('_', ' ')}</p>
                </div>
            </div>

            {/* OVERVIEW */}
            <p className="text-[10px] text-gray-400 font-bold tracking-widest px-3 mb-1.5">OVERVIEW</p>
            <div className="space-y-0.5 mb-4">
                <NavItem icon={Home}         label="Dashboard"      active={activeTab === 'feed'}     onClick={() => navigate('/feed')} />
                <NavItem icon={Megaphone}    label="Bulletin Board" active={activeTab === 'bulletin'} onClick={() => navigate('/bulletin')} />
                <NavItem icon={MessageSquare} label="Messages"                                        onClick={() => onSelectModal?.('messages')} />
                <NavItem icon={User}         label="My Profile"     active={activeTab === 'profile'}  onClick={() => navigate('/profile/me')} />
            </div>

            {/* NETWORK */}
            <p className="text-[10px] text-gray-400 font-bold tracking-widest px-3 mb-1.5">NETWORK</p>
            <div className="space-y-0.5 mb-4">
                <NavItem icon={Search}     label="Explore People" onClick={() => onSelectModal?.('search')} />
                <NavItem icon={PlusSquare} label="New Post"       onClick={() => onSelectModal?.('post')} />
                {currentUser.role === 'college_admin' && (
                    <NavItem icon={ShieldCheck} label="Admin Panel" onClick={() => navigate('/admin')} />
                )}
            </div>

            {/* SETTINGS */}
            <div className="mt-auto">
                <p className="text-[10px] text-gray-400 font-bold tracking-widest px-3 mb-1.5">SETTINGS</p>
                <NavItem icon={LogOut} label="Logout" danger onClick={handleLogout} />
            </div>
        </aside>
    );
}
