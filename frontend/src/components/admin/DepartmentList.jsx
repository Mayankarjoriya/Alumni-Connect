import React from 'react';
import { Building2, Plus } from 'lucide-react';

export default function DepartmentList({ departments = [], onOpenAddModal }) {
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
                    <div key={idx} className="bg-white border border-gray-200 p-6 rounded-2xl flex flex-col justify-between shadow-sm">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                    <Building2 className="text-emerald-500" size={18} /> {dept.name}
                                </h3>
                            </div>
                            <p className="text-xs text-gray-500 mb-4 font-medium">
                                Head of Department: <span className="text-amber-600 font-bold">{dept.head}</span>
                            </p>
                        </div>

                        <div className="flex justify-between border-t border-gray-100 pt-4 text-xs text-gray-500 font-bold">
                            <span>{dept.total_faculty} Faculty Members</span>
                            <span>{dept.total_students} Students</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
