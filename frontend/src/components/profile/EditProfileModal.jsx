import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Code, Briefcase, User, Globe, MapPin, BookOpen, Star, Zap, GraduationCap, Plus } from 'lucide-react';

const INPUT_CLASS = "w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 text-sm font-medium transition-all";
const LABEL_CLASS = "block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5";

const Section = ({ title, children }) => (
    <div className="space-y-3">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">{title}</p>
        {children}
    </div>
);

export default function EditProfileModal({ isOpen, onClose, profileData, onSubmit }) {
    const role = profileData?.role || 'student';

    const [formData, setFormData] = useState({
        bio: '',
        profile_picture_url: '',
        cover_picture_url: '',
        linkedin_url: '',
        github_url: '',
        portfolio_url: '',
        location: '',
        skills: '',
        // Faculty
        designation: '',
        experience_years: '',
        research_interests: '',
        courses_taught: '',
        // Alumni
        open_to_mentor: false,
        graduation_year: '',
        industry: '',
    });

    useEffect(() => {
        if (profileData && isOpen) {
            setFormData({
                bio: profileData.bio || '',
                profile_picture_url: profileData.profile_picture_url || '',
                cover_picture_url: profileData.cover_picture_url || '',
                linkedin_url: profileData.linkedin_url || '',
                github_url: profileData.github_url || '',
                portfolio_url: profileData.portfolio_url || '',
                location: profileData.location || '',
                skills: profileData.skills || '',
                designation: profileData.designation || '',
                experience_years: profileData.experience_years || '',
                research_interests: profileData.research_interests || '',
                courses_taught: profileData.courses_taught || '',
                open_to_mentor: profileData.open_to_mentor || false,
                graduation_year: profileData.graduation_year || profileData.batch || '',
                industry: profileData.industry || '',
            });
        }
    }, [profileData, isOpen]);

    const handleImageChange = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setFormData({ ...formData, [field]: reader.result });
            reader.readAsDataURL(file);
        }
    };

    const [skillInput, setSkillInput] = useState('');
    const handleAddSkill = (e) => {
        e.preventDefault();
        if (skillInput.trim()) {
            const currentSkills = formData.skills ? formData.skills.split(',').map(s => s.trim()) : [];
            if (!currentSkills.includes(skillInput.trim())) {
                setFormData({ ...formData, skills: [...currentSkills, skillInput.trim()].join(',') });
            }
            setSkillInput('');
        }
    };
    const handleRemoveSkill = (skillToRemove) => {
        const currentSkills = formData.skills.split(',').map(s => s.trim());
        setFormData({ ...formData, skills: currentSkills.filter(s => s !== skillToRemove).join(',') });
    };

    if (!isOpen) return null;

    const handleChange = (e) => {
        const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: val });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = { ...formData };
        
        // Clean up empty strings to avoid Pydantic validation errors on the backend
        Object.keys(payload).forEach(key => {
            if (payload[key] === '') {
                payload[key] = null;
            }
        });

        if (payload.experience_years) {
            payload.experience_years = parseInt(payload.experience_years, 10);
        }
        
        onSubmit(payload);
    };

    return (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-black text-gray-900">Edit Profile</h2>
                        <p className="text-xs text-gray-400 font-medium mt-0.5 capitalize">{role} profile</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors bg-white p-2 rounded-full shadow-sm border border-gray-100">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">

                    {/* === COMMON FIELDS === */}
                    <Section title="Profile Images">
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className={LABEL_CLASS}>Profile Photo</label>
                                <div className="flex items-center gap-4">
                                    {formData.profile_picture_url && (
                                        <img src={formData.profile_picture_url} alt="Profile" className="w-14 h-14 rounded-full object-cover shadow-sm border border-gray-200 flex-shrink-0" />
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageChange(e, 'profile_picture_url')}
                                        className="flex-1 px-4 py-2 text-sm text-gray-900 border border-gray-200 rounded-xl focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 cursor-pointer"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className={LABEL_CLASS}>Background Cover Photo</label>
                                <div className="flex items-center gap-4">
                                    {formData.cover_picture_url && (
                                        <img src={formData.cover_picture_url} alt="Cover" className="w-20 h-14 rounded-lg object-cover shadow-sm border border-gray-200 flex-shrink-0" />
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageChange(e, 'cover_picture_url')}
                                        className="flex-1 px-4 py-2 text-sm text-gray-900 border border-gray-200 rounded-xl focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>
                    </Section>

                    <Section title="Basic Info">
                        <div>
                            <label className={LABEL_CLASS}><User size={13} className="text-violet-500" /> Bio / About</label>
                            <textarea name="bio" value={formData.bio} onChange={handleChange}
                                placeholder="Write a short bio about yourself..."
                                rows="3" className={`${INPUT_CLASS} resize-none`} />
                        </div>
                        <div>
                            <label className={LABEL_CLASS}><MapPin size={13} className="text-red-400" /> Location</label>
                            <input type="text" name="location" value={formData.location} onChange={handleChange}
                                placeholder="e.g. Mumbai, India" className={INPUT_CLASS} />
                        </div>
                    </Section>

                    {/* === FACULTY FIELDS === */}
                    {role === 'faculty' && (
                        <Section title="Faculty Details">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={LABEL_CLASS}><GraduationCap size={13} className="text-indigo-500" /> Designation</label>
                                    <select name="designation" value={formData.designation} onChange={handleChange} className={INPUT_CLASS}>
                                        <option value="">Select...</option>
                                        <option>Assistant Professor</option>
                                        <option>Associate Professor</option>
                                        <option>Professor</option>
                                        <option>Head of Department</option>
                                        <option>Lecturer</option>
                                        <option>Visiting Faculty</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={LABEL_CLASS}><Zap size={13} className="text-amber-500" /> Years of Experience</label>
                                    <input type="number" name="experience_years" value={formData.experience_years} onChange={handleChange}
                                        placeholder="e.g. 10" className={INPUT_CLASS} />
                                </div>
                            </div>
                            <div>
                                <label className={LABEL_CLASS}><BookOpen size={13} className="text-violet-500" /> Research Interests</label>
                                <input type="text" name="research_interests" value={formData.research_interests} onChange={handleChange}
                                    placeholder="e.g. Machine Learning, Computer Vision, NLP (comma-separated)" className={INPUT_CLASS} />
                                <p className="text-[10px] text-gray-400 mt-1">Separate with commas</p>
                            </div>
                            <div>
                                <label className={LABEL_CLASS}><BookOpen size={13} className="text-emerald-500" /> Courses Taught</label>
                                <input type="text" name="courses_taught" value={formData.courses_taught} onChange={handleChange}
                                    placeholder="e.g. Data Structures, DBMS, Operating Systems (comma-separated)" className={INPUT_CLASS} />
                            </div>
                        </Section>
                    )}

                    {/* === ALUMNI FIELDS === */}
                    {role === 'alumni' && (
                        <Section title="Career Details">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={LABEL_CLASS}><Briefcase size={13} className="text-blue-500" /> Graduation Year</label>
                                    <input type="text" name="graduation_year" value={formData.graduation_year} onChange={handleChange}
                                        placeholder="e.g. 2020" className={INPUT_CLASS} />
                                </div>
                                <div>
                                    <label className={LABEL_CLASS}><Zap size={13} className="text-amber-500" /> Years of Experience</label>
                                    <input type="number" name="experience_years" value={formData.experience_years} onChange={handleChange}
                                        placeholder="e.g. 4" className={INPUT_CLASS} />
                                </div>
                            </div>
                            <div>
                                <label className={LABEL_CLASS}><Briefcase size={13} className="text-indigo-500" /> Industry / Sector</label>
                                <select name="industry" value={formData.industry} onChange={handleChange} className={INPUT_CLASS}>
                                    <option value="">Select Industry...</option>
                                    <option>Software / IT</option>
                                    <option>Finance / Banking</option>
                                    <option>Healthcare</option>
                                    <option>Education</option>
                                    <option>Consulting</option>
                                    <option>E-Commerce</option>
                                    <option>Manufacturing</option>
                                    <option>Research / Academia</option>
                                    <option>Startup / Entrepreneurship</option>
                                    <option>Government / Public Sector</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                                <input type="checkbox" id="open_to_mentor" name="open_to_mentor" checked={formData.open_to_mentor} onChange={handleChange}
                                    className="w-4 h-4 accent-emerald-500" />
                                <label htmlFor="open_to_mentor" className="text-sm font-bold text-emerald-800 cursor-pointer flex items-center gap-2">
                                    <Star size={14} className="text-emerald-500" /> I'm open to mentoring students
                                </label>
                            </div>
                        </Section>
                    )}

                    {/* === STUDENT FIELDS === */}
                    {role === 'student' && (
                        <Section title="Academic Info">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={LABEL_CLASS}><GraduationCap size={13} className="text-violet-500" /> Graduation Year</label>
                                    <input type="text" name="graduation_year" value={formData.graduation_year} onChange={handleChange}
                                        placeholder="e.g. 2027" className={INPUT_CLASS} />
                                </div>
                            </div>
                        </Section>
                    )}

                    {/* === SKILLS (all roles) === */}
                    <Section title="Skills & Expertise">
                        <div>
                            <label className={LABEL_CLASS}><Zap size={13} className="text-amber-500" /> Skills</label>
                            
                            <div className="flex flex-wrap gap-2 mb-3">
                                {formData.skills && formData.skills.split(',').map((skill, index) => {
                                    if (!skill.trim()) return null;
                                    return (
                                        <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0a66c2] text-white text-sm font-medium rounded-full shadow-sm">
                                            {skill.trim()}
                                            <button type="button" onClick={() => handleRemoveSkill(skill.trim())} className="hover:bg-blue-800 p-0.5 rounded-full transition-colors">
                                                <X size={14} />
                                            </button>
                                        </span>
                                    );
                                })}
                            </div>

                            <div className="flex gap-2">
                                <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(e); } }}
                                    placeholder="e.g. Machine Learning, React" className={INPUT_CLASS} />
                                <button type="button" onClick={handleAddSkill} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl border border-gray-200 transition-colors flex flex-shrink-0 items-center gap-1">
                                    <Plus size={16} /> Add Skill
                                </button>
                            </div>
                        </div>
                    </Section>

                    {/* === SOCIAL LINKS === */}
                    <Section title="Social & Portfolio Links">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className={LABEL_CLASS}><Briefcase size={13} className="text-[#0a66c2]" /> LinkedIn URL</label>
                                <input type="url" name="linkedin_url" value={formData.linkedin_url} onChange={handleChange}
                                    placeholder="https://linkedin.com/in/..." className={INPUT_CLASS} />
                            </div>
                            <div>
                                <label className={LABEL_CLASS}><Code size={13} className="text-gray-900" /> GitHub URL</label>
                                <input type="url" name="github_url" value={formData.github_url} onChange={handleChange}
                                    placeholder="https://github.com/..." className={INPUT_CLASS} />
                            </div>
                        </div>
                        <div>
                            <label className={LABEL_CLASS}><Globe size={13} className="text-emerald-500" /> Portfolio / Website</label>
                            <input type="url" name="portfolio_url" value={formData.portfolio_url} onChange={handleChange}
                                placeholder="https://yourportfolio.com" className={INPUT_CLASS} />
                        </div>
                    </Section>

                    <div className="pt-2 flex-shrink-0">
                        <button type="submit"
                            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-md text-sm">
                            Save Profile Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
