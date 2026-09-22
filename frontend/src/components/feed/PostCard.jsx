import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Award, Briefcase, Send } from 'lucide-react';

const TYPE_STYLE = {
    project: { cls: 'text-violet-600 bg-violet-50',  bar: 'bg-violet-600' },
    job:     { cls: 'text-amber-600 bg-amber-50',    bar: 'bg-amber-500' },
    default: { cls: 'text-blue-600 bg-blue-50',      bar: 'bg-blue-500' },
};

export default function PostCard({ post, currentUser, onLike, onComment, onEvaluate, onChat }) {
    const [commentText, setCommentText] = useState('');
    const [showComments, setShowComments] = useState(false);
    const hasLiked = post.likes?.includes(currentUser.id || 'u1');
    const typeStyle = TYPE_STYLE[post.post_type] || TYPE_STYLE.default;

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        onComment(post.id, commentText);
        setCommentText('');
    };

    return (
        <div className="break-inside-avoid bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-200" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
            {/* Top accent bar */}
            <div className={`h-1 ${typeStyle.bar}`} />

            <div className="p-5">
                {/* Author row */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
                            {post.author_name?.[0] || 'U'}
                        </div>
                        <div>
                            <Link to={`/profile/${post.author_id}`}>
                                <h3 className="text-sm font-bold text-gray-900 hover:text-violet-600 transition-colors leading-tight">{post.author_name}</h3>
                            </Link>
                            <p className="text-[11px] text-gray-400 capitalize">{post.author_role} · {post.author_college}</p>
                        </div>
                    </div>
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wide ${typeStyle.cls}`}>
                        {post.post_type || 'post'}
                    </span>
                </div>

                {/* Content */}
                <p className="text-sm text-gray-700 leading-relaxed mb-4">{post.content}</p>

                {/* Contextual action buttons */}
                {currentUser.role === 'faculty' && post.author_role === 'student' && onEvaluate && (
                    <button
                        onClick={() => onEvaluate({ id: post.author_id, name: post.author_name })}
                        className="mb-4 w-full bg-violet-50 hover:bg-violet-100 text-violet-600 border border-violet-200 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                        <Award size={13} /> Upload Work & Award Credits
                    </button>
                )}
                {currentUser.role === 'alumni' && post.author_role === 'student' && onChat && (
                    <button
                        onClick={() => onChat({ id: post.author_id, name: post.author_name, role: post.author_role, college: post.author_college })}
                        className="mb-4 w-full bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                        <Briefcase size={13} /> Message for Referral / Hiring
                    </button>
                )}

                {/* Like & comment bar */}
                <div className="flex items-center gap-5 border-t border-gray-100 pt-3 text-xs text-gray-400">
                    <button
                        onClick={() => onLike(post.id)}
                        className={`flex items-center gap-1.5 font-semibold transition-colors ${hasLiked ? 'text-red-500' : 'hover:text-red-400'}`}
                    >
                        <Heart size={15} className={hasLiked ? 'fill-red-500 text-red-500' : ''} />
                        {post.likes?.length || 0}
                    </button>
                    <button
                        onClick={() => setShowComments(v => !v)}
                        className="flex items-center gap-1.5 font-semibold hover:text-violet-500 transition-colors"
                    >
                        <MessageCircle size={15} />
                        {post.comments?.length || 0} Comments
                    </button>
                </div>

                {/* Comments */}
                {showComments && post.comments?.length > 0 && (
                    <div className="mt-3 space-y-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                        {post.comments.map((c, i) => (
                            <div key={c.id || i} className="text-xs">
                                <span className="font-bold text-gray-700">{c.author_name}: </span>
                                <span className="text-gray-500">{c.content}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add comment */}
                <form onSubmit={handleCommentSubmit} className="mt-3 flex gap-2">
                    <input
                        type="text"
                        placeholder="Write a comment..."
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-violet-400 transition-colors"
                    />
                    <button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1">
                        <Send size={12} />
                    </button>
                </form>
            </div>
        </div>
    );
}
