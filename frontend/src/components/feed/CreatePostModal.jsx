import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon, Smile, FileText, Globe, Clock } from 'lucide-react';

export default function CreatePostModal({ isOpen, onClose, onSubmit }) {
    const [content, setContent] = useState('');
    const [postType, setPostType] = useState('update');
    const [mediaUrls, setMediaUrls] = useState([]);
    const fileInputRef = useRef(null);

    const currentUser = JSON.parse(localStorage.getItem('user') || '{"name":"User","role":"student"}');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!content.trim() && mediaUrls.length === 0) return;
        onSubmit({ content, post_type: postType, media_urls: mediaUrls });
        setContent('');
        setPostType('update');
        setMediaUrls([]);
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            Promise.all(
                files.map(file => {
                    return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.readAsDataURL(file);
                    });
                })
            ).then(results => {
                setMediaUrls(prev => [...prev, ...results]);
            });
        }
    };

    const removeImage = (index) => {
        setMediaUrls(prev => prev.filter((_, i) => i !== index));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-[2rem] w-full max-w-[600px] shadow-2xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                
                {/* ── Header ──────────────────────────────────────────────────────── */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center font-black text-white text-lg">
                            {currentUser.name?.[0]}
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-900 leading-tight">{currentUser.name}</h2>
                            <div className="flex items-center gap-1 mt-0.5">
                                <button className="flex items-center gap-1 text-[11px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded-full transition-colors">
                                    <Globe size={10} /> Post to Anyone
                                </button>
                                <select 
                                    value={postType}
                                    onChange={e => setPostType(e.target.value)}
                                    className="text-[11px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded-full appearance-none outline-none cursor-pointer border-none transition-colors"
                                >
                                    <option value="update">Type: Update</option>
                                    <option value="project">Type: Project</option>
                                    <option value="job">Type: Opportunity</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} strokeWidth={2.5} />
                    </button>
                </div>

                {/* ── Body ────────────────────────────────────────────────────────── */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 flex flex-col min-h-[250px]">
                    <textarea
                        rows={mediaUrls.length > 0 ? 3 : 8}
                        placeholder="Share your thoughts..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full resize-none bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none flex-1 font-medium leading-relaxed"
                        autoFocus
                    />
                    
                    {mediaUrls.length > 0 && (
                        <div className={`mt-4 grid gap-2 ${mediaUrls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                            {mediaUrls.map((url, index) => (
                                <div key={index} className="relative bg-gray-50 rounded-xl border border-gray-100 p-2 group">
                                    <button 
                                        onClick={() => removeImage(index)}
                                        className="absolute top-4 right-4 bg-gray-900/60 hover:bg-gray-900 text-white p-1.5 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <X size={14} />
                                    </button>
                                    <img src={url} alt={`Preview ${index}`} className="w-full h-48 object-cover rounded-lg" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Footer ──────────────────────────────────────────────────────── */}
                <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100">
                    <div className="flex items-center gap-1">
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                        />
                        <button 
                            type="button" 
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2.5 text-gray-500 hover:bg-gray-100 hover:text-violet-600 rounded-full transition-colors relative group"
                        >
                            <ImageIcon size={20} />
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">Add photo(s)</span>
                        </button>
                        <button className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                            <Smile size={20} />
                        </button>
                        <button className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                            <FileText size={20} />
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                            <Clock size={18} />
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!content.trim() && mediaUrls.length === 0}
                            className="bg-violet-600 hover:bg-violet-700 disabled:bg-gray-200 disabled:text-gray-400 px-6 py-2 rounded-full text-sm font-bold text-white transition-colors"
                        >
                            Post
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
