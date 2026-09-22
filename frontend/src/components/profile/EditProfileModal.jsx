import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Link as LinkIcon, Code, Briefcase, User, Globe } from 'lucide-react';

export default function EditProfileModal({ isOpen, onClose, profileData, onSubmit }) {
    const [formData, setFormData] = useState({
        bio: '',
        profile_picture_url: '',
        linkedin_url: '',
        github_url: '',
        portfolio_url: ''
    });

    useEffect(() => {
        if (profileData && isOpen) {
            setFormData({
                bio: profileData.bio || '',
                profile_picture_url: profileData.profile_picture_url || '',
                linkedin_url: profileData.linkedin_url || '',
                github_url: profileData.github_url || '',
                portfolio_url: profileData.portfolio_url || ''
            });
        }
    }, [profileData, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-xl font-black text-gray-900">Edit Profile</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors bg-white p-2 rounded-full shadow-sm border border-gray-100">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    
                    {/* Profile Picture */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                            <ImageIcon size={14} className="text-violet-500" /> Profile Picture URL
                        </label>
                        <input
                            type="url"
                            name="profile_picture_url"
                            value={formData.profile_picture_url}
                            onChange={handleChange}
                            placeholder="https://example.com/your-image.jpg"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 text-sm font-medium transition-all"
                        />
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                            <User size={14} className="text-violet-500" /> Bio
                        </label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            placeholder="Write a short bio about yourself..."
                            rows="3"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 text-sm font-medium transition-all resize-none"
                        ></textarea>
                    </div>

                    {/* Social Links Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                                <Briefcase size={14} className="text-blue-600" /> LinkedIn URL
                            </label>
                            <input
                                type="url"
                                name="linkedin_url"
                                value={formData.linkedin_url}
                                onChange={handleChange}
                                placeholder="https://linkedin.com/in/..."
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 text-sm font-medium transition-all"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                                <Code size={14} className="text-gray-900" /> GitHub URL
                            </label>
                            <input
                                type="url"
                                name="github_url"
                                value={formData.github_url}
                                onChange={handleChange}
                                placeholder="https://github.com/..."
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 text-sm font-medium transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                            <Globe size={14} className="text-emerald-500" /> Portfolio Website
                        </label>
                        <input
                            type="url"
                            name="portfolio_url"
                            value={formData.portfolio_url}
                            onChange={handleChange}
                            placeholder="https://yourportfolio.com"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 text-sm font-medium transition-all"
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl transition-colors shadow-md"
                        >
                            Save Profile
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
