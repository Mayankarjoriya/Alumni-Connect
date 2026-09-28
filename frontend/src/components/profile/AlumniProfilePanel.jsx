import React, { useState, useEffect } from 'react';
import { Briefcase, MessageSquare, Heart, MapPin, TrendingUp, Users, Star, Zap, CheckCircle2 } from 'lucide-react';
import api from '../../api/client';

const POST_TYPE_COLORS = {
    opportunity: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    update: 'bg-blue-50 text-blue-700 border-blue-100',
    research: 'bg-violet-50 text-violet-700 border-violet-100',
    announcement: 'bg-amber-50 text-amber-700 border-amber-100',
};

function ActivityFeed({ userId }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;
        api.get(`/api/posts/by-user/${userId}`)
            .then(data => setPosts(data || []))
            .catch(() => setPosts([]))
            .finally(() => setLoading(false));
    }, [userId]);

    if (loading) return <p className="text-sm text-gray-400 font-medium py-6 text-center">Loading activity...</p>;
    if (posts.length === 0) return (
        <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <MessageSquare size={28} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400 font-medium">No posts yet.</p>
        </div>
    );

    return (
        <div className="space-y-4">
            {posts.map(post => (
                <div key={post.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border uppercase tracking-wider ${POST_TYPE_COLORS[post.post_type] || POST_TYPE_COLORS.update}`}>
                            {post.post_type}
                        </span>
                        <span className="text-[11px] text-gray-400 font-medium">{post.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-800 font-medium leading-relaxed">{post.content}</p>
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50">
                        <span className="flex items-center gap-1 text-xs text-gray-400"><Heart size={12} /> {post.likes?.length || 0}</span>
                        <span className="flex items-center gap-1 text-xs text-gray-400"><MessageSquare size={12} /> {post.comments?.length || 0}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function AlumniProfilePanel({ profileData }) {
    const [activeTab, setActiveTab] = useState('about');

    const TABS = [
        { id: 'about', label: 'Career', icon: <Briefcase size={14} /> },
        { id: 'activity', label: 'Activity', icon: <MessageSquare size={14} /> },
    ];

    const skillTags = profileData.skills
        ? profileData.skills.split(',').map(s => s.trim()).filter(Boolean)
        : [];

    const careerItems = [
        { label: 'Current Role', value: profileData.job_title },
        { label: 'Company', value: profileData.company },
        { label: 'Industry', value: profileData.industry },
        { label: 'Location', value: profileData.location },
        { label: 'Graduation Year', value: profileData.graduation_year || profileData.batch },
        { label: 'Experience', value: profileData.experience_years ? `${profileData.experience_years} years` : null },
        { label: 'Alumni of', value: profileData.college },
    ].filter(i => i.value);

    return (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden mb-8">
            <div className="flex border-b border-gray-100 px-6">
                {TABS.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 py-4 px-2 mr-6 text-xs font-bold border-b-2 transition-all ${
                            activeTab === tab.id ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'
                        }`}>
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            <div className="p-6">
                {activeTab === 'about' && (
                    <div className="space-y-6">
                        {/* Open to Mentor banner */}
                        {profileData.open_to_mentor && (
                            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3">
                                <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-black text-emerald-800">Open to Mentoring</p>
                                    <p className="text-xs text-emerald-600 font-medium">This alumnus is available to guide students</p>
                                </div>
                            </div>
                        )}

                        {/* Career Info */}
                        <div>
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Career Information</h4>
                            <div className="grid grid-cols-2 gap-3">
                                {careerItems.map((item, i) => (
                                    <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{item.label}</p>
                                        <p className="text-sm text-gray-900 font-bold">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Skills */}
                        {skillTags.length > 0 && (
                            <div>
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                    <Zap size={12} /> Skills & Expertise
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {skillTags.map(s => (
                                        <span key={s} className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-indigo-100">{s}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Career Stats */}
                        <div>
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Career Highlights</h4>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { icon: <TrendingUp size={18} className="text-indigo-500" />, label: 'Years Experience', value: profileData.experience_years ? `${profileData.experience_years}+` : 'N/A' },
                                    { icon: <Users size={18} className="text-amber-500" />, label: 'Open to Mentor', value: profileData.open_to_mentor ? 'Yes ✓' : 'No' },
                                    { icon: <Star size={18} className="text-emerald-500" />, label: 'Industry', value: profileData.industry ? profileData.industry.split('/')[0].trim() : '—' },
                                ].map((item, i) => (
                                    <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-center">
                                        <div className="flex justify-center mb-2">{item.icon}</div>
                                        <p className="text-sm font-black text-gray-900 leading-tight">{item.value}</p>
                                        <p className="text-[10px] text-gray-400 font-bold mt-0.5">{item.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'activity' && (
                    <div>
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Recent Activity & Opportunities Shared</h4>
                        <ActivityFeed userId={profileData.id} />
                    </div>
                )}
            </div>
        </div>
    );
}
