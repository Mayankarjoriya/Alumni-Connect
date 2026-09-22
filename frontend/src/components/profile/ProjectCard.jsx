import React from 'react';

export default function ProjectCard({ project }) {
    return (
        <div className="bg-white rounded-[2rem] p-5 border border-gray-100 hover:border-violet-200 hover:-translate-y-1 transition-all flex flex-col justify-between shadow-sm hover:shadow-lg">
            <div className="bg-gray-50 rounded-2xl w-full h-32 mb-4 flex items-center justify-center border border-gray-100 overflow-hidden relative">
                <span className="text-gray-400 font-black text-4xl opacity-20 block">{project.title?.[0] || 'P'}</span>
            </div>
            <div>
                <h4 className="font-bold text-base text-gray-900 mb-1 group-hover:text-violet-700 transition-colors leading-tight">{project.title}</h4>
                <div className="flex items-center gap-2 mb-3">
                    <span className="bg-violet-50 text-violet-700 text-[10px] font-bold px-2 py-1 rounded-md">{project.tech}</span>
                </div>
                {project.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed font-medium">{project.description}</p>
                )}
            </div>
        </div>
    );
}
