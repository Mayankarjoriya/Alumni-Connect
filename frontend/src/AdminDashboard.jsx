import React, { useState, useEffect } from 'react';
import { Users, BookOpen, ShieldCheck, LogOut, Newspaper, Mail, Megaphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from './api/client';
import AdminStats from './components/admin/AdminStats';
import PendingUsersList from './components/admin/PendingUsersList';
import DepartmentList from './components/admin/DepartmentList';
import AddDeptModal from './components/admin/AddDeptModal';
import InvitePanel from './components/admin/InvitePanel';
import PostCard from './components/feed/PostCard';
import CreatePostModal from './components/feed/CreatePostModal';
import ChatModal from './components/feed/ChatModal';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('requests');
    const [pendingUsers, setPendingUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [posts, setPosts] = useState([]);
    const [stats, setStats] = useState({
        total_students: 0,
        total_faculty: 0,
        total_alumni: 0,
        pending_verifications: 0
    });
    const [showAddDeptModal, setShowAddDeptModal] = useState(false);
    const [notice, setNotice] = useState('');

    // Feed state
    const [activeChatUser, setActiveChatUser] = useState(null);
    const [feedModal, setFeedModal] = useState(null);

    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem('user') || '{"name": "College Admin", "college": "CIITM Institute of Technology"}');

    const loadAdminData = async () => {
        try {
            const college = currentUser.college || "CIITM Institute of Technology";

            const [pendingData, deptData, statsData] = await Promise.all([
                api.get(`/api/admin/pending-users?college=${encodeURIComponent(college)}`),
                api.get(`/api/admin/departments?college=${encodeURIComponent(college)}`),
                api.get(`/api/admin/stats?college=${encodeURIComponent(college)}`)
            ]);

            setPendingUsers(pendingData || []);
            setDepartments(deptData || []);
            setStats(statsData || {});
        } catch (err) {
            console.error("Failed loading admin data:", err);
        }
    };

    const loadPosts = async () => {
        try {
            const data = await api.get('/api/posts');
            setPosts(data || []);
        } catch (err) {
            console.error("Failed to load posts:", err);
        }
    };

    useEffect(() => {
        loadAdminData();
    }, []);

    useEffect(() => {
        if (activeTab === 'feed') loadPosts();
    }, [activeTab]);

    const handleVerify = async (userId, approve) => {
        try {
            const data = await api.post('/api/admin/verify-user', { user_id: userId, approve });
            setNotice(data.message || (approve ? 'Approved user successfully' : 'Rejected request'));
            setTimeout(() => setNotice(''), 3000);
            loadAdminData();
        } catch (err) {
            console.error("Failed to verify user:", err);
        }
    };

    const handleCreateDept = async (deptName) => {
        try {
            await api.post(`/api/admin/departments?college=${encodeURIComponent(currentUser.college)}`, {
                name: deptName
            });
            setShowAddDeptModal(false);
            loadAdminData();
        } catch (err) {
            console.error("Failed to create department:", err);
        }
    };

    const handleCreatePost = async ({ content, post_type }) => {
        try {
            await api.post('/api/posts', { content, post_type });
            setFeedModal(null);
            loadPosts();
        } catch (err) {
            console.error("Failed to create post:", err);
        }
    };

    const handleLike = async (postId) => {
        try { await api.post(`/api/posts/${postId}/like`); loadPosts(); } catch {}
    };
    const handleComment = async (postId, content) => {
        try { await api.post(`/api/posts/${postId}/comment`, { content }); loadPosts(); } catch {}
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const NAV_ITEMS = [
        { id: 'requests',    icon: <ShieldCheck size={18} />, label: 'Verification Hub', badge: pendingUsers.length },
        { id: 'departments', icon: <BookOpen size={18} />,    label: 'Departments' },
        { id: 'stats',       icon: <Users size={18} />,       label: 'Overview' },
        { id: 'feed',        icon: <Newspaper size={18} />,   label: 'Network Feed' },
        { id: 'invite',      icon: <Mail size={18} />,        label: 'Invite Alumni' },
    ];

    return (
        <div className="h-screen bg-[#F4F5FA] flex p-4 gap-4 overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
            {/* Admin Sidebar */}
            <aside className="w-64 bg-white rounded-2xl flex flex-col py-5 px-3 flex-shrink-0 border border-gray-100" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
                {/* Logo area */}
                <div className="flex items-center gap-2.5 px-2 mb-6">
                    <div className="w-8 h-8 bg-amber-500 rounded-xl flex items-center justify-center text-white font-black text-base shadow-md shadow-amber-200">A</div>
                    <span className="font-extrabold text-gray-900 text-sm tracking-tight leading-tight">Admin<br />Panel</span>
                </div>

                {/* User chip */}
                <div className="flex items-center gap-2.5 px-3 py-2.5 bg-gray-50 rounded-xl mb-5 border border-gray-100">
                    <div className="min-w-0">
                        <p className="text-gray-900 font-bold text-xs leading-tight truncate">{currentUser.name}</p>
                        <p className="text-gray-400 text-[10px] font-medium truncate">{currentUser.college}</p>
                    </div>
                </div>

                <p className="text-[10px] text-gray-400 font-bold tracking-widest px-3 mb-1.5 uppercase">Management</p>
                <nav className="space-y-0.5 mb-4">
                    {NAV_ITEMS.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                                activeTab === item.id
                                    ? 'bg-amber-500 text-white shadow-md shadow-amber-100'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                        >
                            <span className="flex items-center gap-3">{item.icon} {item.label}</span>
                            {item.badge > 0 && (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeTab === item.id ? 'bg-white text-amber-500' : 'bg-amber-100 text-amber-600'}`}>
                                    {item.badge}
                                </span>
                            )}
                        </button>
                    ))}
                    
                    {/* Bulletin Board — external link */}
                    <button
                        onClick={() => navigate('/bulletin')}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                    >
                        <Megaphone size={18} /> Bulletin Board
                    </button>
                </nav>

                <div className="mt-auto">
                    <p className="text-[10px] text-gray-400 font-bold tracking-widest px-3 mb-1.5 uppercase">Settings</p>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-xs text-red-500 hover:bg-red-50 rounded-xl transition-colors font-bold"
                    >
                        <LogOut size={18} /> Sign Out Admin
                    </button>
                </div>
            </aside>

            {/* Main Admin Content */}
            <main className="flex-1 flex flex-col gap-4 overflow-hidden min-w-0">
                
                {/* Notice Toast */}
                {notice && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-3 rounded-2xl text-sm font-bold shadow-sm">
                        {notice}
                    </div>
                )}

                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-6">
                    {/* Metric Summary Cards — always visible */}
                    <div className="flex-shrink-0">
                        <AdminStats stats={stats} />
                    </div>

                    <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-6 md:p-8" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
                        {/* Tab 1: Verification Hub */}
                        {activeTab === 'requests' && (
                            <PendingUsersList
                                pendingUsers={pendingUsers}
                                onVerify={handleVerify}
                                collegeName={currentUser.college}
                            />
                        )}

                        {/* Tab 2: Departments */}
                        {activeTab === 'departments' && (
                            <DepartmentList
                                departments={departments}
                                onOpenAddModal={() => setShowAddDeptModal(true)}
                            />
                        )}

                        {/* Tab 3: Institution Overview */}
                        {activeTab === 'stats' && (
                            <div>
                                <h2 className="text-xl font-bold mb-4 text-gray-900">Institution Activity & Authority Overview</h2>
                                <div className="bg-gray-50 border border-gray-200 p-6 rounded-2xl space-y-4">
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        As <span className="text-amber-600 font-bold">{currentUser.name}</span>, your authority covers student & faculty verification, department assignment, and skill credit oversight for <span className="text-gray-900 font-bold">{currentUser.college}</span>.
                                    </p>
                                    <div className="p-4 bg-white rounded-xl border border-gray-200 text-sm text-gray-700 space-y-2 font-medium">
                                        <p>✓ All verified students inherit authority to receive faculty badges.</p>
                                        <p>✓ Verified faculty members gain localized power to evaluate student projects.</p>
                                        <p>✓ Alumni gain direct messaging access to top student candidates.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab 4: Network Feed */}
                        {activeTab === 'feed' && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Network Feed</h2>
                                        <p className="text-xs text-gray-500 mt-1">View and interact with community posts across the network.</p>
                                    </div>
                                    <button
                                        onClick={() => setFeedModal('post')}
                                        className="bg-amber-500 hover:bg-amber-600 text-white text-xs px-5 py-2.5 rounded-xl font-bold transition-colors shadow-sm"
                                    >
                                        + New Post
                                    </button>
                                </div>

                                {posts.length === 0 ? (
                                    <div className="text-center py-20 text-gray-400 text-sm font-medium">No posts yet in the network.</div>
                                ) : (
                                    <div className="columns-1 xl:columns-2 gap-4 space-y-4">
                                        {posts.map(post => (
                                            <PostCard
                                                key={post.id}
                                                post={post}
                                                currentUser={{ ...currentUser, role: 'college_admin' }}
                                                onLike={handleLike}
                                                onComment={handleComment}
                                                onEvaluate={() => {}}
                                                onChat={(u) => { setActiveChatUser(u); setFeedModal('chat'); }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab 5: Invite Alumni */}
                        {activeTab === 'invite' && <InvitePanel />}
                    </div>
                </div>
            </main>

            {/* Modals: Create Department */}
            <AddDeptModal
                isOpen={showAddDeptModal}
                onClose={() => setShowAddDeptModal(false)}
                onSubmit={handleCreateDept}
            />

            {/* Modals: Feed */}
            <CreatePostModal
                isOpen={feedModal === 'post'}
                onClose={() => setFeedModal(null)}
                onSubmit={handleCreatePost}
            />
            <ChatModal
                isOpen={feedModal === 'chat'}
                onClose={() => setFeedModal(null)}
                activeChatUser={activeChatUser}
                onSelectChatUser={setActiveChatUser}
            />
        </div>
    );
}
