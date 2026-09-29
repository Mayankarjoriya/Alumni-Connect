import React, { useState } from 'react';
import { X, Plus, Upload, Trash2 } from 'lucide-react';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const YEARS = Array.from({ length: 30 }, (_, i) => String(new Date().getFullYear() - i));

const INPUT_CLASS = "w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 text-sm font-medium transition-all bg-white";
const SELECT_CLASS = "w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 text-sm font-medium transition-all bg-white appearance-none";

export default function AddProjectModal({ isOpen, onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        tech_stack: '',
        github_link: '',
        media_url: '',
        is_current: false,
        start_month: '',
        start_year: '',
        end_month: '',
        end_year: '',
        associated_with: '',
    });
    const [skillInput, setSkillInput] = useState('');
    const [contributors, setContributors] = useState([]);
    const [contributorInput, setContributorInput] = useState('');

    if (!isOpen) return null;

    const handleChange = (e) => {
        const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: val });
    };

    const handleMediaUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setFormData({ ...formData, media_url: reader.result });
            reader.readAsDataURL(file);
        }
    };

    const handleAddSkill = (e) => {
        e.preventDefault();
        if (skillInput.trim()) {
            const current = formData.tech_stack ? formData.tech_stack.split(',').map(s => s.trim()) : [];
            if (!current.includes(skillInput.trim())) {
                setFormData({ ...formData, tech_stack: [...current, skillInput.trim()].join(',') });
            }
            setSkillInput('');
        }
    };

    const handleRemoveSkill = (skill) => {
        const current = formData.tech_stack.split(',').map(s => s.trim());
        setFormData({ ...formData, tech_stack: current.filter(s => s !== skill).join(',') });
    };

    const handleAddContributor = (e) => {
        e.preventDefault();
        if (contributorInput.trim() && !contributors.includes(contributorInput.trim())) {
            setContributors([...contributors, contributorInput.trim()]);
            setContributorInput('');
        }
    };

    const handleRemoveContributor = (c) => setContributors(contributors.filter(x => x !== c));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title.trim()) return;
        onSubmit({
            ...formData,
            contributors: contributors.join(',') || null,
            start_month: formData.start_month || null,
            start_year: formData.start_year || null,
            end_month: formData.is_current ? null : (formData.end_month || null),
            end_year: formData.is_current ? null : (formData.end_year || null),
        });
        // reset
        setFormData({ title:'',description:'',tech_stack:'',github_link:'',media_url:'',is_current:false,start_month:'',start_year:'',end_month:'',end_year:'',associated_with:'' });
        setContributors([]);
        setSkillInput('');
        setContributorInput('');
    };

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white border border-gray-100 rounded-3xl w-full max-w-lg shadow-2xl text-gray-900 flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-black text-gray-900">Add Project</h2>
                        <p className="text-xs text-gray-400 mt-0.5">* Indicates required</p>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 custom-scrollbar flex-1">
                    
                    {/* Project Name */}
                    <div>
                        <label className="block text-sm font-bold text-gray-800 mb-1.5">Project name *</label>
                        <input
                            type="text" name="title" value={formData.title} onChange={handleChange}
                            placeholder="e.g. Encrypted Password Manager" required maxLength={215}
                            className={INPUT_CLASS}
                        />
                        <p className="text-right text-xs text-gray-400 mt-1">{formData.title.length}/215</p>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-bold text-gray-800 mb-1.5">Description</label>
                        <textarea
                            name="description" value={formData.description} onChange={handleChange}
                            rows={4} placeholder="Describe your project, its goals, and what you built..."
                            maxLength={2000} className={`${INPUT_CLASS} resize-none`}
                        />
                        <p className="text-right text-xs text-gray-400 mt-1">{formData.description.length}/2000</p>
                    </div>

                    {/* GitHub Link */}
                    <div>
                        <label className="block text-sm font-bold text-gray-800 mb-1.5">GitHub / Project URL</label>
                        <input
                            type="url" name="github_link" value={formData.github_link} onChange={handleChange}
                            placeholder="https://github.com/..." className={INPUT_CLASS}
                        />
                    </div>

                    {/* Skills */}
                    <div>
                        <label className="block text-sm font-bold text-gray-800 mb-1">Skills</label>
                        <p className="text-xs text-gray-500 mb-3">We recommend adding your top 5 skills used in this project.</p>
                        
                        {formData.tech_stack && (
                            <div className="flex flex-wrap gap-2 mb-3">
                                {formData.tech_stack.split(',').map((skill, i) => {
                                    if (!skill.trim()) return null;
                                    return (
                                        <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm font-bold rounded-full border border-emerald-200">
                                            {skill.trim()}
                                            <button type="button" onClick={() => handleRemoveSkill(skill.trim())} className="hover:text-red-500 transition-colors">
                                                <X size={13} />
                                            </button>
                                        </span>
                                    );
                                })}
                            </div>
                        )}
                        <div className="flex gap-2">
                            <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(e); } }}
                                placeholder="e.g. Python, React, FastAPI" className={INPUT_CLASS}
                            />
                            <button type="button" onClick={handleAddSkill}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl border border-gray-200 transition-colors flex-shrink-0 flex items-center gap-1 text-sm">
                                <Plus size={15} /> Add skill
                            </button>
                        </div>
                    </div>

                    {/* Media */}
                    <div>
                        <label className="block text-sm font-bold text-gray-800 mb-1">Media</label>
                        <p className="text-xs text-gray-500 mb-3">Add media like images, documents, or screenshots of your project.</p>
                        
                        {formData.media_url ? (
                            <div className="relative w-full h-40 rounded-2xl overflow-hidden border border-gray-200 group">
                                <img src={formData.media_url} alt="Project media" className="w-full h-full object-cover" />
                                <button type="button" onClick={() => setFormData({ ...formData, media_url: '' })}
                                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-violet-400 hover:bg-violet-50 transition-all">
                                <Upload size={24} className="text-gray-300 mb-2" />
                                <span className="text-sm font-bold text-gray-400">+ Add media</span>
                                <span className="text-xs text-gray-300 mt-1">Images, screenshots, documents</span>
                                <input type="file" accept="image/*,application/pdf" onChange={handleMediaUpload} className="hidden" />
                            </label>
                        )}
                    </div>

                    {/* Additional Details */}
                    <div className="space-y-4">
                        <h3 className="text-base font-black text-gray-900">Additional details</h3>

                        {/* Currently Working */}
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox" name="is_current" checked={formData.is_current} onChange={handleChange}
                                className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500 cursor-pointer"
                            />
                            <span className="text-sm font-medium text-gray-700">I am currently working on this project</span>
                        </label>

                        {/* Start Date */}
                        <div>
                            <label className="block text-sm font-bold text-gray-800 mb-2">Start date</label>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="relative">
                                    <select name="start_month" value={formData.start_month} onChange={handleChange} className={SELECT_CLASS}>
                                        <option value="">Month</option>
                                        {MONTHS.map(m => <option key={m}>{m}</option>)}
                                    </select>
                                </div>
                                <div className="relative">
                                    <select name="start_year" value={formData.start_year} onChange={handleChange} className={SELECT_CLASS}>
                                        <option value="">Year</option>
                                        {YEARS.map(y => <option key={y}>{y}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* End Date */}
                        {!formData.is_current && (
                            <div>
                                <label className="block text-sm font-bold text-gray-800 mb-2">End date</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <select name="end_month" value={formData.end_month} onChange={handleChange} className={SELECT_CLASS}>
                                        <option value="">Month</option>
                                        {MONTHS.map(m => <option key={m}>{m}</option>)}
                                    </select>
                                    <select name="end_year" value={formData.end_year} onChange={handleChange} className={SELECT_CLASS}>
                                        <option value="">Year</option>
                                        {YEARS.map(y => <option key={y}>{y}</option>)}
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Contributors */}
                        <div>
                            <label className="block text-sm font-bold text-gray-800 mb-1">Contributors</label>
                            <p className="text-xs text-gray-500 mb-3">Tag people who played a key role in this project.</p>
                            
                            {contributors.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {contributors.map((c, i) => (
                                        <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-bold rounded-full border border-blue-200">
                                            {c}
                                            <button type="button" onClick={() => handleRemoveContributor(c)} className="hover:text-red-500 transition-colors">
                                                <X size={13} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                            <div className="flex gap-2">
                                <input type="text" value={contributorInput} onChange={(e) => setContributorInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddContributor(e); } }}
                                    placeholder="Enter contributor name" className={INPUT_CLASS}
                                />
                                <button type="button" onClick={handleAddContributor}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl border border-gray-200 transition-colors flex-shrink-0 flex items-center gap-1 text-sm">
                                    <Plus size={15} /> Add
                                </button>
                            </div>
                        </div>

                        {/* Associated With */}
                        <div>
                            <label className="block text-sm font-bold text-gray-800 mb-1.5">Associated with</label>
                            <select name="associated_with" value={formData.associated_with} onChange={handleChange} className={SELECT_CLASS}>
                                <option value="">Please select</option>
                                <option>CIITM Institute of Technology</option>
                                <option>Personal Project</option>
                                <option>Open Source</option>
                                <option>Internship</option>
                                <option>Hackathon</option>
                                <option>Research</option>
                            </select>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 flex-shrink-0">
                    <button type="button" onClick={onClose}
                        className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors rounded-xl hover:bg-gray-100">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="add-project-form"
                        onClick={handleSubmit}
                        className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
