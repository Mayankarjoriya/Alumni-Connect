import React, { useState, useEffect } from 'react';
import { GraduationCap, BookOpen, Newspaper, Award, CheckCircle2, Search, MessageSquare, Plus, TrendingUp } from 'lucide-react';
import api from '../../api/client';
import Sidebar from '../common/Sidebar';
import PostCard from '../feed/PostCard';
import CreatePostModal from '../feed/CreatePostModal';
import SearchModal from '../feed/SearchModal';
import ChatModal from '../feed/ChatModal';

const TABS = [
    { id: 'evaluate', label: 'My Students', icon: <GraduationCap size={16} /> },
    { id: 'upload',   label: 'Upload Work',  icon: <BookOpen size={16} /> },
    { id: 'feed',     label: 'Network Feed', icon: <Newspaper size={16} /> },
];

const EMPTY_FORM = {
    studentId: '', projectTitle: '', techStack: '',
    description: '', github: '', credits: 15, badgeName: 'Project Excellence',
};

/* ─── Top header bar ─── */
function DashboardHeader({ currentUser, onSearch, onMessages, onPost }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 px-5 py-3.5 flex items-center justify-between flex-shrink-0" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
            <button
                onClick={onSearch}
                className="flex items-center gap-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl px-4 py-2 w-60 border border-gray-200 text-gray-400 text-sm transition-colors"
            >
                <Search size={15} /> Search...
            </button>
            <div className="flex items-center gap-2">
                <button onClick={onPost} className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-md shadow-violet-100">
                    <Plus size={14} /> New Post
                </button>
                <button onClick={onMessages} className="w-9 h-9 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors">
                    <MessageSquare size={16} className="text-gray-500" />
                </button>
                <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 ml-1">
                    <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
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
function RightPanel({ currentUser, assignedStudents }) {
    return (
        <aside className="w-64 flex-shrink-0 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
            {/* Dept Info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
                <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">My Department</p>
                    <TrendingUp size={14} className="text-blue-600" />
                </div>
                <div className="text-center mb-4">
                    <p className="text-xl font-black text-blue-600 leading-tight">{assignedStudents.length}</p>
                    <p className="text-[10px] text-gray-400 font-medium">Assigned Students</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-gray-900 text-xs font-bold">{currentUser.department}</p>
                    <p className="text-[10px] text-gray-500">{currentUser.college}</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Resources</p>
                <div className="space-y-2 text-xs">
                    <button className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium">Evaluation Rubric</button>
                    <button className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium">Department Guidelines</button>
                    <button className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium">Contact Admin</button>
                </div>
            </div>
        </aside>
    );
}

export default function FacultyHub() {
    const [activeTab, setActiveTab] = useState('evaluate');
    const [assignedStudents, setAssignedStudents] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeModal, setActiveModal] = useState(null);
    const [activeChatUser, setActiveChatUser] = useState(null);

    const [uploadForm, setUploadForm] = useState(EMPTY_FORM);
    const [uploadSuccess, setUploadSuccess] = useState('');
    const [uploadError, setUploadError] = useState('');
    const [uploading, setUploading] = useState(false);

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    const loadData = async () => {
        try {
            const [students, postsData] = await Promise.all([
                api.get('/api/faculty/assigned-students'),
                api.get('/api/posts'),
            ]);
            setAssignedStudents(students || []);
            setPosts(postsData || []);
        } catch (err) {
            console.error('FacultyHub load error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleUploadWork = async (e) => {
        e.preventDefault();
        setUploading(true);
        setUploadError('');
        try {
            await api.post('/api/faculty/evaluate', {
                student_id: uploadForm.studentId,
                credits: parseInt(uploadForm.credits),
                badge_name: uploadForm.badgeName,
                project_title: uploadForm.projectTitle,
                project_tech: uploadForm.techStack,
                project_description: uploadForm.description,
                project_github: uploadForm.github,
                reason: uploadForm.description,
            });
            setUploadSuccess('Project uploaded and badge awarded successfully!');
            setUploadForm(EMPTY_FORM);
            setTimeout(() => setUploadSuccess(''), 4000);
            loadData();
        } catch (err) {
            setUploadError(err.message || 'Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleLike    = async (id) => { try { await api.post(`/api/posts/${id}/like`); loadData(); } catch {} };
    const handleComment = async (id, content) => { try { await api.post(`/api/posts/${id}/comment`, { content }); loadData(); } catch {} };
    const handleCreatePost = async ({ content, post_type }) => {
        try { await api.post('/api/posts', { content, post_type }); setActiveModal(null); loadData(); } catch {}
    };

    const field = (key) => (e) => setUploadForm(f => ({ ...f, [key]: e.target.value }));

    const greet = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good Morning';
        if (h < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <div className="h-screen bg-[#F4F5FA] flex p-4 gap-4 overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
            <Sidebar activeTab="feed" onSelectModal={setActiveModal} />

            {/* Main column */}
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
                                            ? 'text-blue-600 border-blue-600 bg-white'
                                            : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    {tab.icon} {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-white">
                            {/* ── Tab 1: Evaluate Students ── */}
                            {activeTab === 'evaluate' && (
                                <div>
                                    <div className="mb-6 flex justify-between items-center">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">My Department Students</h2>
                                            <p className="text-xs text-gray-500 mt-1">Review student progress and award credits.</p>
                                        </div>
                                    </div>

                                    {loading ? (
                                        <div className="text-center py-20 text-gray-400 text-sm">Loading students...</div>
                                    ) : assignedStudents.length === 0 ? (
                                        <div className="text-center py-20">
                                            <p className="text-gray-500 text-sm">No students assigned to your department yet.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {assignedStudents.map(student => (
                                                <div
                                                    key={student.id}
                                                    className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow group"
                                                >
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center font-extrabold text-white text-base shadow-md">
                                                                {student.name?.[0]}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-gray-900 text-sm">{student.name}</p>
                                                                <p className="text-xs text-gray-500">{student.batch || 'N/A'} · {student.department}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[10px] text-gray-500 mb-0.5 uppercase tracking-wide font-bold">Credits</p>
                                                            <p className="text-violet-600 font-bold text-lg leading-tight">{student.credits || 0}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-1.5 mb-4 min-h-[22px]">
                                                        {student.badges?.slice(0, 3).map((b, i) => (
                                                            <span key={i} className="bg-pink-50 text-pink-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                                                {b.name}
                                                            </span>
                                                        ))}
                                                        {(student.badges?.length || 0) > 3 && (
                                                            <span className="text-gray-500 text-[10px] font-semibold self-center">+{student.badges.length - 3} more</span>
                                                        )}
                                                        {!student.badges?.length && (
                                                            <span className="text-gray-400 text-[10px] font-medium">No badges yet</span>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                                        <p className="text-[10px] text-gray-500 font-semibold">{student.projects?.length || 0} project(s)</p>
                                                        <button
                                                            onClick={() => setActiveTab('upload')}
                                                            className="bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs px-4 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1.5"
                                                        >
                                                            <Award size={13} /> Upload Work
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── Tab 2: Upload Student Work ── */}
                            {activeTab === 'upload' && (
                                <div className="max-w-2xl mx-auto">
                                    <div className="mb-6">
                                        <h2 className="text-xl font-bold text-gray-900">Upload Student Work</h2>
                                        <p className="text-xs text-gray-500 mt-1">Document a student's project, write an evaluation essay, and award recognition.</p>
                                    </div>

                                    {uploadSuccess && (
                                        <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                                            <CheckCircle2 size={16} /> {uploadSuccess}
                                        </div>
                                    )}
                                    {uploadError && (
                                        <div className="mb-5 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2 font-bold">{uploadError}</div>
                                    )}

                                    <form onSubmit={handleUploadWork} className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4 shadow-sm">
                                        <div>
                                            <label className="text-xs text-gray-700 block mb-1.5 font-bold">Select Student *</label>
                                            <select
                                                value={uploadForm.studentId} onChange={field('studentId')} required
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
                                            >
                                                <option value="">— Choose a student —</option>
                                                {assignedStudents.map(s => <option key={s.id} value={s.id}>{s.name} ({s.batch || 'N/A'})</option>)}
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs text-gray-700 block mb-1.5 font-bold">Project Title *</label>
                                                <input
                                                    type="text" placeholder="e.g. Smart Library System"
                                                    value={uploadForm.projectTitle} onChange={field('projectTitle')} required
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-700 block mb-1.5 font-bold">Tech Stack *</label>
                                                <input
                                                    type="text" placeholder="e.g. React, FastAPI, SQLite"
                                                    value={uploadForm.techStack} onChange={field('techStack')} required
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs text-gray-700 block mb-1.5 font-bold">Evaluation Essay / Reason *</label>
                                            <textarea
                                                placeholder="Describe what the student built..."
                                                value={uploadForm.description} onChange={field('description')} required rows={4}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-xs text-gray-700 block mb-1.5 font-bold">GitHub / Project Link</label>
                                            <input
                                                type="url" placeholder="https://github.com/..."
                                                value={uploadForm.github} onChange={field('github')}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                                            <div>
                                                <label className="text-xs text-gray-700 block mb-1.5 font-bold">Credits to Award</label>
                                                <input
                                                    type="number" min="5" max="100"
                                                    value={uploadForm.credits} onChange={field('credits')}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-700 block mb-1.5 font-bold">Badge Name</label>
                                                <input
                                                    type="text" value={uploadForm.badgeName} onChange={field('badgeName')} required
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-2">
                                            <button
                                                type="submit" disabled={uploading || !uploadForm.studentId}
                                                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-md flex items-center gap-2"
                                            >
                                                <Award size={15} /> {uploading ? 'Submitting...' : 'Upload & Award Badge'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* ── Tab 3: Network Feed ── */}
                            {activeTab === 'feed' && (
                                <div>
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">Network Feed</h2>
                                            <p className="text-xs text-gray-500 mt-1">Academic community updates across all institutions.</p>
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

                    <RightPanel currentUser={currentUser} assignedStudents={assignedStudents} />
                </div>
            </div>

            {/* Modals */}
            <CreatePostModal isOpen={activeModal === 'post'}    onClose={() => setActiveModal(null)} onSubmit={handleCreatePost} />
            <SearchModal     isOpen={activeModal === 'search'}  onClose={() => setActiveModal(null)} onSelectUserChat={(u) => { setActiveChatUser(u); setActiveModal('messages'); }} />
            <ChatModal       isOpen={activeModal === 'messages'} onClose={() => setActiveModal(null)} activeChatUser={activeChatUser} onSelectChatUser={setActiveChatUser} />
        </div>
    );
}
