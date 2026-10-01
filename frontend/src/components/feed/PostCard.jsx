import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    Heart, MessageCircle, Award, Briefcase, Send, 
    MoreHorizontal, Share2, Bookmark, ThumbsUp, 
    ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react';

// ── Type config ───────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
    project:     { label: '🚀 Project',     bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-200',  glow: 'from-violet-500 to-indigo-500' },
    job:         { label: '💼 Job',          bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   glow: 'from-amber-400 to-orange-400' },
    achievement: { label: '🏆 Achievement', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', glow: 'from-emerald-400 to-teal-500' },
    update:      { label: '📢 Update',       bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    glow: 'from-blue-400 to-cyan-500' },
    general:     { label: '💬 General',      bg: 'bg-gray-100',   text: 'text-gray-600',    border: 'border-gray-200',    glow: 'from-gray-400 to-slate-500' },
};

// ── Avatar ────────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
    'from-violet-500 to-indigo-500',
    'from-emerald-400 to-teal-500',
    'from-rose-400 to-pink-500',
    'from-amber-400 to-orange-500',
    'from-blue-400 to-cyan-500',
];
function getAvatarColor(name) {
    const idx = (name?.charCodeAt(0) || 0) % AVATAR_COLORS.length;
    return AVATAR_COLORS[idx];
}

// ── Reaction pill ─────────────────────────────────────────────────────────────
function ReactionButton({ icon: Icon, count, label, active, activeColor, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 group
                ${active ? `${activeColor} scale-105` : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
        >
            <Icon 
                size={16} 
                className={`transition-transform duration-200 group-hover:scale-110 ${active ? 'fill-current' : ''}`} 
            />
            <span>{count || 0}</span>
            <span className="hidden sm:inline">{label}</span>
        </button>
    );
}

// ── Main PostCard ─────────────────────────────────────────────────────────────
export default function PostCard({ post, currentUser, onLike, onComment, onEvaluate, onChat }) {
    const [commentText, setCommentText] = useState('');
    const [showComments, setShowComments] = useState(false);
    const [isLiked, setIsLiked] = useState(post.likes?.includes(currentUser?.id || 'u1'));
    const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const type = TYPE_CONFIG[post.post_type] || TYPE_CONFIG.general;
    const isLong = post.content?.length > 200;
    const avatarGradient = getAvatarColor(post.author_name);

    const handleLike = () => {
        setIsLiked(v => !v);
        setLikeCount(c => isLiked ? c - 1 : c + 1);
        onLike?.(post.id);
    };

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        onComment?.(post.id, commentText);
        setCommentText('');
        setShowComments(true);
    };

    return (
        <div className="break-inside-avoid bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 group"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '1rem' }}>

            {/* Coloured top stripe */}
            <div className={`h-1 bg-gradient-to-r ${type.glow}`} />

            <div className="p-5">

                {/* ── Author row ─────────────────────────────────── */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <Link to={`/profile/${post.author_id}`} className="flex-shrink-0">
                            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center font-black text-white text-base shadow-sm transition-transform duration-200 hover:scale-105`}>
                                {post.author_name?.[0] || 'U'}
                            </div>
                        </Link>

                        {/* Name & meta */}
                        <div className="min-w-0">
                            <Link to={`/profile/${post.author_id}`}>
                                <h3 className="font-bold text-gray-900 text-sm leading-tight hover:text-violet-600 transition-colors truncate">
                                    {post.author_name}
                                </h3>
                            </Link>
                            <p className="text-[11px] text-gray-400 mt-0.5 capitalize font-medium">
                                <span className="capitalize">{post.author_role?.replace('_', ' ')}</span>
                                <span className="mx-1">·</span>
                                <span className="truncate">{post.author_college}</span>
                            </p>
                            <p className="text-[10px] text-gray-300 mt-0.5 font-medium">{post.timestamp}</p>
                        </div>
                    </div>

                    {/* Right side: type badge + menu */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg border tracking-wide ${type.bg} ${type.text} ${type.border}`}>
                            {type.label}
                        </span>
                        <button className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 opacity-0 group-hover:opacity-100 transition-all">
                            <MoreHorizontal size={15} />
                        </button>
                    </div>
                </div>

                {/* ── Content ────────────────────────────────────── */}
                <div className="mb-4">
                    <p className={`text-sm text-gray-700 leading-relaxed font-medium ${!isExpanded && isLong ? 'line-clamp-3' : ''}`}>
                        {post.content}
                    </p>
                    {isLong && (
                        <button
                            onClick={() => setIsExpanded(v => !v)}
                            className="text-violet-600 text-xs font-bold mt-1 hover:underline flex items-center gap-0.5"
                        >
                            {isExpanded ? (<>Show less <ChevronUp size={12} /></>) : (<>Read more <ChevronDown size={12} /></>)}
                        </button>
                    )}
                </div>

                {/* ── Media Slider ──────────────────────────────────────── */}
                {post.media_urls && post.media_urls.length > 0 && (
                    <div className="mb-4 relative rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center min-h-[300px]">
                        <img 
                            src={post.media_urls[currentImageIndex]} 
                            alt={`Post media ${currentImageIndex + 1}`} 
                            className="max-w-full max-h-[500px] object-contain transition-opacity duration-300"
                        />
                        
                        {post.media_urls.length > 1 && (
                            <>
                                {/* Arrows */}
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(i => i === 0 ? post.media_urls.length - 1 : i - 1); }}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <span className="font-bold text-lg leading-none transform -translate-x-[1px]">‹</span>
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(i => i === post.media_urls.length - 1 ? 0 : i + 1); }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <span className="font-bold text-lg leading-none transform translate-x-[1px]">›</span>
                                </button>
                                
                                {/* Dots */}
                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/20 px-2 py-1.5 rounded-full backdrop-blur-sm">
                                    {post.media_urls.map((_, i) => (
                                        <button 
                                            key={i}
                                            onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(i); }}
                                            className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'}`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* ── Contextual CTA ─────────────────────────────── */}
                {currentUser?.role === 'faculty' && post.author_role === 'student' && (
                    <button
                        onClick={() => onEvaluate?.({ id: post.author_id, name: post.author_name })}
                        className="mb-4 w-full bg-gradient-to-r from-violet-50 to-indigo-50 hover:from-violet-100 hover:to-indigo-100 text-violet-700 border border-violet-200 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow"
                    >
                        <Award size={14} className="text-violet-500" />
                        Evaluate Work & Award Credits
                    </button>
                )}
                {currentUser?.role === 'alumni' && post.author_role === 'student' && (
                    <button
                        onClick={() => onChat?.({ id: post.author_id, name: post.author_name, role: post.author_role, college: post.author_college })}
                        className="mb-4 w-full bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 text-blue-700 border border-blue-200 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow"
                    >
                        <Briefcase size={14} className="text-blue-500" />
                        Message for Referral / Opportunity
                    </button>
                )}

                {/* ── Stats row ──────────────────────────────────── */}
                {(likeCount > 0 || (post.comments?.length > 0)) && (
                    <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium mb-3 pb-3 border-b border-gray-100">
                        <div className="flex items-center gap-1.5">
                            {likeCount > 0 && (
                                <span className="flex items-center gap-1">
                                    <span className="w-4 h-4 bg-gradient-to-br from-red-400 to-rose-500 rounded-full flex items-center justify-center text-white text-[8px]">♥</span>
                                    {likeCount}
                                </span>
                            )}
                        </div>
                        {post.comments?.length > 0 && (
                            <button 
                                onClick={() => setShowComments(v => !v)}
                                className="hover:text-violet-600 transition-colors hover:underline"
                            >
                                {post.comments.length} comment{post.comments.length !== 1 ? 's' : ''}
                            </button>
                        )}
                    </div>
                )}

                {/* ── Action bar ─────────────────────────────────── */}
                <div className="flex items-center justify-between -mx-1">
                    <div className="flex items-center gap-0.5">
                        <ReactionButton
                            icon={Heart}
                            count={likeCount}
                            label="Like"
                            active={isLiked}
                            activeColor="text-rose-500 bg-rose-50"
                            onClick={handleLike}
                        />
                        <ReactionButton
                            icon={MessageCircle}
                            count={post.comments?.length}
                            label="Comment"
                            active={showComments}
                            activeColor="text-violet-600 bg-violet-50"
                            onClick={() => setShowComments(v => !v)}
                        />
                        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all duration-200">
                            <Share2 size={15} />
                            <span className="hidden sm:inline">Share</span>
                        </button>
                    </div>
                    <button
                        onClick={() => setIsSaved(v => !v)}
                        className={`p-2 rounded-xl transition-all duration-200 ${isSaved ? 'text-violet-600 bg-violet-50' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
                        title="Save post"
                    >
                        <Bookmark size={15} className={isSaved ? 'fill-violet-600' : ''} />
                    </button>
                </div>

                {/* ── Comments section ───────────────────────────── */}
                {showComments && (
                    <div className="mt-4 space-y-3">
                        {/* Existing comments */}
                        {post.comments?.length > 0 && (
                            <div className="space-y-3">
                                {post.comments.map((c, i) => (
                                    <div key={c.id || i} className="flex items-start gap-2.5">
                                        <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${getAvatarColor(c.author_name)} flex items-center justify-center font-bold text-white text-[10px] flex-shrink-0 shadow-sm`}>
                                            {c.author_name?.[0] || 'U'}
                                        </div>
                                        <div className="flex-1 bg-gray-50 rounded-2xl rounded-tl-sm px-3 py-2 border border-gray-100">
                                            <p className="text-[11px] font-black text-gray-800 mb-0.5">{c.author_name}</p>
                                            <p className="text-xs text-gray-600 leading-relaxed">{c.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add comment */}
                        <form onSubmit={handleCommentSubmit} className="flex items-center gap-2.5 mt-3">
                            <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${getAvatarColor(currentUser?.name)} flex items-center justify-center font-bold text-white text-[10px] flex-shrink-0 shadow-sm`}>
                                {currentUser?.name?.[0] || 'Y'}
                            </div>
                            <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2 focus-within:border-violet-300 focus-within:bg-white transition-all">
                                <input
                                    type="text"
                                    placeholder="Write a comment..."
                                    value={commentText}
                                    onChange={e => setCommentText(e.target.value)}
                                    className="flex-1 bg-transparent text-xs text-gray-700 placeholder-gray-400 focus:outline-none font-medium"
                                />
                                <button
                                    type="submit"
                                    disabled={!commentText.trim()}
                                    className="text-violet-600 hover:text-violet-700 disabled:text-gray-300 transition-colors disabled:cursor-not-allowed"
                                >
                                    <Send size={14} strokeWidth={2.5} />
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
