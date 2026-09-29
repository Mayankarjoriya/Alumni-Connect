import React from 'react';
import { X, ExternalLink, Users, Calendar, Building2 } from 'lucide-react';

export default function ProjectDetailsModal({ isOpen, onClose, project }) {
    if (!isOpen || !project) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header with Close Button */}
                <div className="absolute top-4 right-4 z-10">
                    <button 
                        onClick={onClose}
                        className="w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-md"
                    >
                        <X size={16} strokeWidth={3} />
                    </button>
                </div>

                {/* Hero / Media Section */}
                <div className="w-full h-64 bg-gray-100 flex-shrink-0 relative border-b border-gray-100">
                    {project.media_url ? (
                        <img 
                            src={project.media_url} 
                            alt={project.title} 
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-50 to-indigo-50">
                            <span className="text-violet-200 font-black text-6xl select-none">
                                {project.title?.[0] || 'P'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Content Section (Scrollable) */}
                <div className="p-8 overflow-y-auto custom-scrollbar">
                    
                    {/* Title & Github Link */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <h2 className="text-2xl font-black text-gray-900 leading-tight">
                            {project.title}
                        </h2>
                        {project.github && (
                            <a 
                                href={project.github} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-full transition-colors flex-shrink-0"
                            >
                                <ExternalLink size={14} /> View Project
                            </a>
                        )}
                    </div>

                    {/* Tech Stack Pills */}
                    {project.tech && (
                        <div className="flex flex-wrap gap-2 mb-6">
                            {project.tech.split(',').map((t, idx) => {
                                if (!t.trim()) return null;
                                return (
                                    <span key={idx} className="bg-violet-50 border border-violet-100 text-violet-700 text-xs font-bold px-3 py-1 rounded-full">
                                        {t.trim()}
                                    </span>
                                )
                            })}
                        </div>
                    )}

                    {/* Meta Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        
                        {/* Dates */}
                        {(project.start_month || project.start_year) && (
                            <div className="flex items-start gap-3 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                                    <Calendar size={14} className="text-gray-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-0.5">Duration</p>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {project.start_month} {project.start_year} 
                                        {' - '} 
                                        {project.is_current ? 'Present' : `${project.end_month || ''} ${project.end_year || ''}`}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Associated With */}
                        {project.associated_with && (
                            <div className="flex items-start gap-3 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                                    <Building2 size={14} className="text-gray-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-0.5">Associated With</p>
                                    <p className="text-sm font-semibold text-gray-800">{project.associated_with}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    {project.description && (
                        <div className="mb-8">
                            <h3 className="text-sm font-black text-gray-900 mb-2">About the Project</h3>
                            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap font-medium">
                                {project.description}
                            </p>
                        </div>
                    )}

                    {/* Contributors */}
                    {project.contributors && (
                        <div>
                            <h3 className="text-sm font-black text-gray-900 mb-3 flex items-center gap-2">
                                <Users size={16} className="text-gray-400" /> Contributors
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {project.contributors.split(',').map((c, idx) => {
                                    if (!c.trim()) return null;
                                    return (
                                        <div key={idx} className="flex items-center gap-2 bg-white border border-gray-200 rounded-full pl-1 pr-3 py-1 shadow-sm">
                                            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-700 uppercase">
                                                {c.trim()[0]}
                                            </div>
                                            <span className="text-xs font-bold text-gray-700">{c.trim()}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
