import React, { useState, useRef, useEffect } from 'react';
import { Building2, Plus, ChevronRight, Trash2, MoreVertical } from 'lucide-react';

export default function DepartmentList({ departments = [], onOpenAddModal, onSelectDepartment, onDeleteDepartment, onChangeHod }) {
    const [openDropdown, setOpenDropdown] = useState(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">College Departments</h2>
                    <p className="text-xs text-gray-500 font-medium">Manage academic departments, assign faculty heads, and review department counts.</p>
                </div>
                <button
                    onClick={onOpenAddModal}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
                >
                    <Plus size={16} /> Create Department
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {departments.map((dept, idx) => (
                    <div 
                        key={idx} 
                        onClick={() => onSelectDepartment(dept.name)}
                        className="bg-white border border-gray-200 p-6 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md hover:border-emerald-200 cursor-pointer transition-all group relative"
                    >
                        <div className="absolute top-4 right-4" ref={openDropdown === dept.name ? dropdownRef : null}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenDropdown(openDropdown === dept.name ? null : dept.name);
                                }}
                                className="p-2 text-gray-300 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <MoreVertical size={16} />
                            </button>
                            
                            {openDropdown === dept.name && (
                                <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onChangeHod(dept.name);
                                            setOpenDropdown(null);
                                        }}
                                        className="w-full text-left px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-t-xl"
                                    >
                                        <Building2 size={14} /> Change HOD
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (window.confirm(`Are you sure you want to delete ${dept.name}?`)) {
                                                onDeleteDepartment(dept.name);
                                            }
                                            setOpenDropdown(null);
                                        }}
                                        className="w-full text-left px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-2 rounded-b-xl border-t border-gray-50"
                                    >
                                        <Trash2 size={14} /> Delete Dept
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        <div>
                            <div className="flex items-center justify-between mb-2 pr-8">
                                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2 group-hover:text-emerald-700 transition-colors">
                                    <Building2 className="text-emerald-500" size={18} /> {dept.name}
                                </h3>
                                <ChevronRight size={18} className="text-gray-300 group-hover:text-emerald-500 transition-colors" />
                            </div>
                            <p className="text-xs text-gray-500 mb-4 font-medium">
                                Head of Department: <span className="text-amber-600 font-bold">{dept.head}</span>
                            </p>
                        </div>

                        <div className="flex justify-between border-t border-gray-100 pt-4 text-[11px] sm:text-xs text-gray-500 font-bold">
                            <span>{dept.total_faculty || 0} Faculty</span>
                            <span>{dept.total_students || 0} Students</span>
                            <span>{dept.total_alumni || 0} Alumni</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
