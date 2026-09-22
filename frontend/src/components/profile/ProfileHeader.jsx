import React from 'react';
import { CheckCircle2, Award, Mail, Link as LinkIcon, Code, Briefcase, Edit3, Globe } from 'lucide-react';

export default function ProfileHeader({ profileData, isOwnProfile, onSendMessage, onEditProfile }) {
    const stats = [
        { label: 'Credits', value: profileData.credits || 0, color: '#f97316' }, // orange
        { label: 'Badges', value: profileData.badges?.length || 0, color: '#6366f1' }, // indigo
        { label: 'Projects', value: profileData.projects?.length || 0, color: '#1f2937' }, // gray-800
    ];

    return (
        <div className="bg-white border border-gray-100 rounded-[2.5rem] mb-8 overflow-hidden shadow-sm">
            {/* Top Banner (Gradient) */}
            <div className="h-36 bg-gradient-to-r from-violet-200 via-purple-100 to-pink-100 relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-violet-400/20 blur-3xl rounded-full pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
                
                {/* Edit Profile Button */}
                {isOwnProfile && onEditProfile && (
                    <button 
                        onClick={onEditProfile}
                        className="absolute top-6 right-8 bg-white/80 hover:bg-white backdrop-blur-md text-gray-800 px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-2 border border-gray-100"
                    >
                        <Edit3 size={14} /> Edit Profile
                    </button>
                )}
            </div>

            {/* Profile Info Section */}
            <div className="px-8 pb-8 flex flex-col md:flex-row gap-6 md:gap-8 relative">
                
                {/* Avatar (Overlapping banner) */}
                <div className="w-32 h-32 rounded-[2rem] bg-gradient-to-tr from-violet-500 to-indigo-400 p-1 flex-shrink-0 shadow-lg border-4 border-white -mt-12 relative z-10 overflow-hidden">
                    {profileData.profile_picture_url ? (
                        <img 
                            src={profileData.profile_picture_url} 
                            alt={profileData.name} 
                            className="w-full h-full object-cover rounded-[1.75rem]"
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                        />
                    ) : null}
                    <div className={`w-full h-full bg-white rounded-[1.75rem] flex items-center justify-center text-5xl font-black text-violet-600 shadow-inner ${profileData.profile_picture_url ? 'hidden' : 'flex'}`}>
                        {profileData.name?.[0] || 'U'}
                    </div>
                </div>

                {/* Info & Actions */}
                <div className="flex-1 pt-2">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        
                        {/* Name and Details */}
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-black text-gray-900 tracking-tight">{profileData.name}</h1>
                                <span className="bg-indigo-500 text-white text-[10px] px-2 py-1 rounded-lg font-bold flex items-center gap-1 shadow-sm uppercase tracking-wider">
                                    {profileData.role === 'student' ? 'PRO ✦' : profileData.role}
                                </span>
                            </div>
                            
                            <p className="text-gray-900 font-bold text-sm mb-1">
                                {profileData.role === 'alumni' && profileData.job_title 
                                    ? `${profileData.job_title} at ${profileData.company}`
                                    : `${profileData.department} Department`}
                            </p>
                            <p className="text-gray-500 text-sm font-medium mb-4">
                                based in {profileData.college}
                            </p>

                            {/* Action Buttons & Socials */}
                            <div className="flex flex-wrap items-center gap-3">
                                {!isOwnProfile && onSendMessage && (
                                    <button
                                        onClick={onSendMessage}
                                        className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-md flex items-center gap-2"
                                    >
                                        <Mail size={16} /> Get in touch
                                    </button>
                                )}
                                {profileData.role === 'student' && (
                                    <button className="bg-white border border-gray-200 text-gray-900 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm">
                                        View Resume
                                    </button>
                                )}

                                {/* Social Links */}
                                <div className="flex items-center gap-2 ml-2">
                                    {profileData.linkedin_url && (
                                        <a href={profileData.linkedin_url} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors border border-blue-100 shadow-sm">
                                            <Briefcase size={18} />
                                        </a>
                                    )}
                                    {profileData.github_url && (
                                        <a href={profileData.github_url} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-gray-50 text-gray-900 flex items-center justify-center hover:bg-gray-100 transition-colors border border-gray-200 shadow-sm">
                                            <Code size={18} />
                                        </a>
                                    )}
                                    {profileData.portfolio_url && (
                                        <a href={profileData.portfolio_url} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors border border-emerald-100 shadow-sm">
                                            <Globe size={18} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Stats Section (Right aligned) */}
                        <div className="flex gap-6 md:gap-8 bg-white/50 rounded-2xl p-4 border border-gray-50">
                            {stats.map((stat, i) => (
                                <div key={i} className="flex flex-col items-center">
                                    <p className="text-gray-500 text-xs font-bold mb-1">{stat.label}</p>
                                    <div 
                                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-lg shadow-sm"
                                        style={{ backgroundColor: stat.color }}
                                    >
                                        {stat.value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Bio (Optional, if exists) */}
            {profileData.bio && (
                <div className="px-8 pb-8">
                    <p className="text-gray-600 text-sm max-w-2xl leading-relaxed font-medium">{profileData.bio}</p>
                </div>
            )}
        </div>
    );
}
