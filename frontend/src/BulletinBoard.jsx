import React, { useState, useEffect } from 'react';
import { Megaphone, Users, ExternalLink, Plus, X, CheckCircle2, Trash2, Briefcase } from 'lucide-react';
import api from './api/client';
import Sidebar from './components/common/Sidebar';

/* ─── Board config ─── */
const BOARD_CONFIG = {
    jobs: {
        label: 'Jobs & Opportunities',
        icon: <Briefcase size={15} />,
        description: 'Internships, job openings, and professional opportunities — posted by faculty, alumni, and admins.',
        allowedRoles: ['faculty', 'alumni', 'college_admin'],
        accentTab:    'text-violet-600 border-violet-600 bg-white',
        accentBtn:    'bg-violet-600 hover:bg-violet-700 text-white',
        accentLink:   'text-violet-600 border-violet-200 bg-violet-50 hover:bg-violet-100',
        accentBorder: 'border-violet-200',
        emptyMsg:     'No job postings yet. Faculty and alumni can share opportunities here.',
        postBtnLabel: 'Post Opportunity',
        placeholder:  'e.g. Software Engineer Intern at Google — Summer 2025',
    },
    collab: {
        label: 'Student Collaboration',
        icon: <Users size={15} />,
        description: 'Find project partners, form study groups, or recruit teammates for hackathons and side projects.',
        allowedRoles: ['student'],
        accentTab:    'text-emerald-600 border-emerald-600 bg-white',
        accentBtn:    'bg-emerald-600 hover:bg-emerald-700 text-white',
        accentLink:   'text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100',
        accentBorder: 'border-emerald-200',
        emptyMsg:     'No collaboration posts yet. Students can post here to find teammates or study buddies.',
        postBtnLabel: 'Post Collab',
        placeholder:  'e.g. Looking for 2 devs to join my hackathon team (React + ML)',
    },
};

/* ─── Role styling ─── */
const ROLE_STYLE = {
    alumni:        { label: 'Alumni',  cls: 'text-purple-600 bg-purple-50' },
    faculty:       { label: 'Faculty', cls: 'text-blue-600 bg-blue-50' },
    student:       { label: 'Student', cls: 'text-emerald-600 bg-emerald-50' },
    college_admin: { label: 'Admin',   cls: 'text-amber-600 bg-amber-50' },
};

const AVATAR_GRAD = {
    alumni:        'from-purple-500 to-violet-600',
    faculty:       'from-blue-500 to-indigo-600',
    student:       'from-emerald-400 to-teal-500',
    college_admin: 'from-amber-400 to-orange-500',
};

function timeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = (Date.now() - new Date(dateStr)) / 1000;
    if (diff < 60)    return 'just now';
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

/* ─── Post card ─── */
function BulletinCard({ post, board, currentUser, onDelete }) {
    const roleInfo = ROLE_STYLE[post.author_role] || { label: post.author_role, cls: 'text-gray-600 bg-gray-100' };
    const cfg = BOARD_CONFIG[board];
    const canDelete = post.author_id === currentUser.id || currentUser.role === 'college_admin';

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md hover:border-gray-200 transition-all group" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
            {/* Author row */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${AVATAR_GRAD[post.author_role] || 'from-gray-400 to-gray-500'} flex items-center justify-center font-bold text-white text-sm flex-shrink-0 shadow-sm`}>
                        {post.author_name?.[0]}
                    </div>
                    <div className="min-w-0">
                        <p className="text-gray-900 text-sm font-bold leading-tight truncate">{post.author_name}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-lg font-bold ${roleInfo.cls}`}>
                            {roleInfo.label}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] text-gray-400 whitespace-nowrap font-medium">{timeAgo(post.created_at)}</span>
                    {canDelete && (
                        <button
                            onClick={() => onDelete(post.id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1.5 rounded-lg hover:bg-red-50"
                            title="Delete post"
                        >
                            <Trash2 size={13} />
                        </button>
                    )}
                </div>
            </div>

            {/* Title */}
            <h3 className="text-gray-900 font-bold text-sm leading-snug">{post.title}</h3>

            {/* Content */}
            {post.content && (
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-4">{post.content}</p>
            )}

            {/* Link */}
            {post.link && (
                <a
                    href={post.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2.5 rounded-xl border transition-colors self-start mt-1 ${cfg.accentLink}`}
                    onClick={e => e.stopPropagation()}
                >
                    <ExternalLink size={14} /> Open Link
                </a>
            )}
        </div>
    );
}

/* ─── Inline create form ─── */
function CreateForm({ board, onSubmit, onCancel }) {
    const cfg = BOARD_CONFIG[board];
    const [form, setForm] = useState({ title: '', content: '', link: '' });
    const [submitting, setSubmitting] = useState(false);
    const f = key => e => setForm(p => ({ ...p, [key]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        await onSubmit(form);
        setSubmitting(false);
    };

    return (
        <form
            onSubmit={handleSubmit}
            className={`mb-6 bg-white border border-gray-100 rounded-2xl p-6 space-y-4 shadow-md`}
        >
            <div className="flex items-center justify-between">
                <p className={`text-sm font-bold flex items-center gap-2 ${cfg.accentLink.split(' ')[0]}`}>{cfg.icon} New {cfg.postBtnLabel}</p>
                <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                    <X size={15} />
                </button>
            </div>

            <input
                type="text"
                placeholder={cfg.placeholder}
                value={form.title}
                onChange={f('title')}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-400 transition-colors"
            />

            <textarea
                placeholder="Add more details (optional)..."
                value={form.content}
                onChange={f('content')}
                rows={3}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-400 transition-colors resize-none"
            />

            <input
                type="url"
                placeholder="Paste a link (job posting, Google Form, GitHub repo...) — optional"
                value={form.link}
                onChange={f('link')}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-400 transition-colors"
            />

            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={onCancel} className="text-xs text-gray-500 font-bold hover:text-gray-800 px-4 py-2 rounded-xl transition-colors">
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={submitting}
                    className={`${cfg.accentBtn} text-xs px-6 py-2 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-sm`}
                >
                    {submitting ? 'Posting...' : 'Post'}
                </button>
            </div>
        </form>
    );
}

/* ─── Main page ─── */
export default function BulletinBoard() {
    const [activeBoard, setActiveBoard] = useState('jobs');
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [success, setSuccess] = useState('');

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const cfg = BOARD_CONFIG[activeBoard];
    const canPost = cfg.allowedRoles.includes(currentUser.role);

    const loadPosts = async () => {
        setLoading(true);
        try {
            const data = await api.get(`/api/bulletin?board=${activeBoard}`);
            setPosts(data || []);
        } catch (err) {
            console.error('Bulletin load error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPosts();
        setShowForm(false);
    }, [activeBoard]);

    const handleSubmit = async (form) => {
        try {
            await api.post('/api/bulletin', {
                board: activeBoard,
                title: form.title,
                content: form.content || null,
                link: form.link || null,
            });
            setSuccess('Posted successfully!');
            setShowForm(false);
            setTimeout(() => setSuccess(''), 3000);
            loadPosts();
        } catch (err) {
            console.error('Post failed:', err);
        }
    };

    const handleDelete = async (postId) => {
        try {
            await api.delete(`/api/bulletin/${postId}`);
            loadPosts();
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    return (
        <div className="h-screen bg-[#F4F5FA] flex p-4 gap-4 overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
            <Sidebar activeTab="bulletin" onSelectModal={() => {}} />

            <div className="flex-1 flex flex-col gap-4 min-w-0 overflow-hidden">
                {/* Header Match DesktopFeed layout for consistency */}
                <div className="bg-white rounded-2xl border border-gray-100 px-5 py-3.5 flex items-center justify-between flex-shrink-0" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md">
                            <Megaphone size={18} className="text-white" />
                        </div>
                        <div>
                            <h1 className="font-extrabold text-sm text-gray-900 leading-tight">Bulletin Board</h1>
                            <p className="text-[10px] text-gray-500 font-medium">Jobs · Opportunities · Collaboration</p>
                        </div>
                    </div>
                    <span className="text-[10px] font-bold bg-gray-50 text-gray-500 border border-gray-200 px-3 py-1 rounded-lg tracking-wide uppercase">
                        Notice Board
                    </span>
                </div>

                <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-2xl border border-gray-100" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
                    {/* Tab bar */}
                    <div className="flex gap-1 px-6 pt-3 border-b border-gray-100 flex-shrink-0 bg-gray-50/50">
                        {Object.entries(BOARD_CONFIG).map(([key, c]) => (
                            <button
                                key={key}
                                onClick={() => setActiveBoard(key)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-t-xl text-xs font-semibold transition-all border-b-2 ${
                                    activeBoard === key ? c.accentTab : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                {c.icon} {c.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                        {/* Description row + post button */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                            <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">{cfg.description}</p>
                            {canPost && !showForm && (
                                <button
                                    onClick={() => setShowForm(true)}
                                    className={`${cfg.accentBtn} text-xs px-5 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-1.5 flex-shrink-0 shadow-md`}
                                >
                                    <Plus size={14} /> {cfg.postBtnLabel}
                                </button>
                            )}
                        </div>

                        {/* Success toast */}
                        {success && (
                            <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-emerald-500" /> {success}
                            </div>
                        )}

                        {/* Inline create form */}
                        {showForm && canPost && (
                            <CreateForm
                                board={activeBoard}
                                onSubmit={handleSubmit}
                                onCancel={() => setShowForm(false)}
                            />
                        )}

                        {/* Board posts */}
                        {loading ? (
                            <div className="text-center py-20 text-gray-400 text-sm font-medium">Loading bulletin board...</div>
                        ) : posts.length === 0 ? (
                            <div className="text-center py-20">
                                <Megaphone className="mx-auto mb-3 text-gray-300" size={44} />
                                <p className="text-gray-500 text-sm">{cfg.emptyMsg}</p>
                                {canPost && !showForm && (
                                    <button
                                        onClick={() => setShowForm(true)}
                                        className="mt-4 text-xs text-violet-600 font-bold hover:underline transition-colors"
                                    >
                                        Be the first to post
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                {posts.map(post => (
                                    <BulletinCard
                                        key={post.id}
                                        post={post}
                                        board={activeBoard}
                                        currentUser={currentUser}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
