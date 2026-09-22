import React, { useState } from 'react';

export default function AddDeptModal({ isOpen, onClose, onSubmit }) {
    const [deptName, setDeptName] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!deptName.trim()) return;
        onSubmit(deptName);
        setDeptName('');
    };

    return (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white border border-gray-100 rounded-3xl w-full max-w-md p-6 shadow-xl text-gray-900"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-lg font-bold mb-4">Add New College Department</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs text-gray-700 font-bold block mb-1">Department Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Mechanical Engineering"
                            value={deptName}
                            onChange={(e) => setDeptName(e.target.value)}
                            required
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-amber-400 transition-colors"
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
                            Save Department
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
