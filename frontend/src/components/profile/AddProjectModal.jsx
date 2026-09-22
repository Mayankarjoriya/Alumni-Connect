import React, { useState } from 'react';

export default function AddProjectModal({ isOpen, onClose, onSubmit }) {
    const [title, setTitle] = useState('');
    const [tech, setTech] = useState('');
    const [description, setDescription] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        onSubmit({
            title,
            tech_stack: tech,
            description
        });
        setTitle('');
        setTech('');
        setDescription('');
    };

    return (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white border border-gray-100 rounded-3xl w-full max-w-md p-6 shadow-xl text-gray-900"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-lg font-bold mb-4">Upload Project to Portfolio</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs text-gray-700 font-bold block mb-1">Project Title</label>
                        <input
                            type="text"
                            placeholder="e.g. Encrypted Password Vault"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-emerald-400 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-700 font-bold block mb-1">Tech Stack</label>
                        <input
                            type="text"
                            placeholder="e.g. Python, FastAPI, SQLite"
                            value={tech}
                            onChange={(e) => setTech(e.target.value)}
                            required
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-emerald-400 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-700 font-bold block mb-1">Description</label>
                        <textarea
                            rows={3}
                            placeholder="Brief description of your proof-of-work..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-900 focus:outline-none focus:border-emerald-400 transition-colors resize-none"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-gray-500 font-bold hover:text-gray-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-emerald-500 hover:bg-emerald-600 px-6 py-2 rounded-xl text-sm font-bold text-white transition-colors shadow-sm"
                        >
                            Save to Portfolio
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
