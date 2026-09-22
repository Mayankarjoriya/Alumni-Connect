import React, { useState } from 'react';

export default function CreatePostModal({ isOpen, onClose, onSubmit }) {
    const [content, setContent] = useState('');
    const [postType, setPostType] = useState('update');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!content.trim()) return;
        onSubmit({ content, post_type: postType });
        setContent('');
        setPostType('update');
    };

    return (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white border border-gray-100 rounded-3xl w-full max-w-lg p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4 text-gray-900">Create Network Post</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs text-gray-700 font-bold block mb-1">Post Type</label>
                        <select
                            value={postType}
                            onChange={(e) => setPostType(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm text-gray-900 focus:outline-none focus:border-violet-400 transition-colors"
                        >
                            <option value="update">General Academic Update</option>
                            <option value="project">Project Showcase</option>
                            <option value="job">Job / Internship Referral (Alumni/Faculty)</option>
                        </select>
                    </div>
                    <div>
                        <textarea
                            rows={4}
                            placeholder="Share project details, research, or announcements..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-400 transition-colors"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-violet-600 hover:bg-violet-700 px-6 py-2 rounded-xl text-sm font-bold text-white transition-colors shadow-sm"
                        >
                            Publish Post
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
