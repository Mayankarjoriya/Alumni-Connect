import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { Search } from 'lucide-react';

export default function ChangeHodModal({ isOpen, onClose, onSubmit, departmentName, college }) {
    const [hodSearch, setHodSearch] = useState('');
    const [selectedHod, setSelectedHod] = useState(null);
    const [facultyList, setFacultyList] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const fetchFaculty = async () => {
                try {
                    const data = await api.get(`/api/admin/faculty-list?college=${encodeURIComponent(college)}`);
                    setFacultyList(data || []);
                } catch (err) {
                    console.error("Failed to fetch faculty list", err);
                }
            };
            fetchFaculty();
            setHodSearch('');
            setSelectedHod(null);
            setShowDropdown(false);
        }
    }, [isOpen, college]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedHod) return;
        onSubmit(departmentName, selectedHod.id);
    };

    const filteredFaculty = facultyList.filter(f => f.name.toLowerCase().includes(hodSearch.toLowerCase()));

    return (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white border border-gray-100 rounded-3xl w-full max-w-md p-6 shadow-xl text-gray-900"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-lg font-bold mb-4">Change HOD for {departmentName}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <label className="text-xs text-gray-700 font-bold block mb-1">Search Faculty Member</label>
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name..."
                                value={hodSearch}
                                onChange={(e) => {
                                    setHodSearch(e.target.value);
                                    setSelectedHod(null);
                                    setShowDropdown(true);
                                }}
                                onFocus={() => setShowDropdown(true)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-amber-400 transition-colors"
                            />
                        </div>
                        
                        {showDropdown && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto custom-scrollbar">
                                {filteredFaculty.length === 0 ? (
                                    <div className="px-4 py-3 text-xs text-gray-500">No faculty found</div>
                                ) : (
                                    filteredFaculty.map(f => (
                                        <button
                                            key={f.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedHod(f);
                                                setHodSearch(f.name);
                                                setShowDropdown(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-900 transition-colors border-b border-gray-50 last:border-0"
                                        >
                                            <p className="font-bold">{f.name}</p>
                                            <p className="text-[10px] text-gray-400">{f.department || 'No Dept'}</p>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-gray-500 font-bold hover:text-gray-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!selectedHod}
                            className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:hover:bg-amber-500 px-6 py-2 rounded-xl text-sm font-bold text-white transition-colors shadow-sm"
                        >
                            Update HOD
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
