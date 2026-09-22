import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Code, Plus, Award } from 'lucide-react';
import api from './api/client';
import ProfileHeader from './components/profile/ProfileHeader';
import ProjectCard from './components/profile/ProjectCard';
import AddProjectModal from './components/profile/AddProjectModal';
import EditProfileModal from './components/profile/EditProfileModal';
import FacultyEvalPanel from './components/profile/FacultyEvalPanel';
import EvaluateModal from './components/feed/EvaluateModal';
import ChatModal from './components/feed/ChatModal';
import DeskScene from './components/three/DeskScene';

export default function ProfilePage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [profileData, setProfileData] = useState(null);
    const [assignedStudents, setAssignedStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modals
    const [showAddProjectModal, setShowAddProjectModal] = useState(false);
    const [showEditProfileModal, setShowEditProfileModal] = useState(false);
    const [evalStudent, setEvalStudent] = useState(null);
    const [showChatModal, setShowChatModal] = useState(false);

    // State for tabs
    const [activeTab, setActiveTab] = useState('Projects');

    const currentUser = JSON.parse(localStorage.getItem('user') || '{"name": "User", "role": "student"}');
    const isOwnProfile = id === 'me' || id === currentUser.id;
    const targetId = isOwnProfile ? (currentUser.id || "u1") : id;
    const queryClient = useQueryClient();

    const { data: profileData, isLoading: loadingProfile } = useQuery({
        queryKey: ['profile', targetId],
        queryFn: async () => {
            const data = await api.get(`/api/users/${targetId}`);
            return data;
        },
        retry: false
    });

    const { data: assignedStudents = [] } = useQuery({
        queryKey: ['assigned-students'],
        queryFn: async () => {
            const students = await api.get('/api/faculty/assigned-students');
            return students || [];
        },
        enabled: currentUser.role === 'faculty' && isOwnProfile
    });

    const addProjectMutation = useMutation({
        mutationFn: (projectData) => api.post('/api/projects', projectData),
        onSuccess: () => {
            setShowAddProjectModal(false);
            queryClient.invalidateQueries({ queryKey: ['profile', targetId] });
        }
    });

    const editProfileMutation = useMutation({
        mutationFn: (updateData) => api.put('/api/users/me', updateData),
        onSuccess: () => {
            setShowEditProfileModal(false);
            queryClient.invalidateQueries({ queryKey: ['profile', targetId] });
        }
    });

    const handleAddProject = (data) => addProjectMutation.mutate(data);
    const handleEditProfile = (data) => editProfileMutation.mutate(data);

    if (loadingProfile) {
        return (
            <div className="min-h-screen bg-[#F4F5FA] text-gray-900 flex items-center justify-center font-sans">
                <p className="text-gray-500 text-sm font-medium">Loading profile portfolio...</p>
            </div>
        );
    }

    if (!profileData) {
        return (
            <div className="min-h-screen bg-[#F4F5FA] text-gray-900 p-8 font-sans text-center">
                <p className="text-red-500 font-bold">User profile not found.</p>
                <button
                    onClick={() => navigate('/feed')}
                    className="mt-4 bg-white border border-gray-200 px-4 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                    Back to Feed
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F4F5FA] text-gray-900 font-sans custom-scrollbar relative overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
            {/* 3D Background */}
            <DeskScene />

            <div className="max-w-5xl mx-auto p-4 md:p-8 relative z-10">
                {/* Navigation Header */}
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-xs font-bold"
                    >
                        <ArrowLeft size={16} /> Back to Network Feed
                    </button>
                    {currentUser.role === 'college_admin' && (
                        <button
                            onClick={() => navigate('/admin')}
                            className="bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-amber-200 transition-colors"
                        >
                            Admin Control Panel
                        </button>
                    )}
                </div>

                {/* Profile Header Banner */}
                <ProfileHeader
                    profileData={profileData}
                    isOwnProfile={isOwnProfile}
                    onSendMessage={() => setShowChatModal(true)}
                    onEditProfile={() => setShowEditProfileModal(true)}
                />

                {/* Faculty Evaluation Panel */}
                {currentUser.role === 'faculty' && isOwnProfile && (
                    <FacultyEvalPanel
                        department={profileData.department}
                        assignedStudents={assignedStudents}
                        onEvaluateStudent={(st) => setEvalStudent(st)}
                    />
                )}

                {/* Custom Tabs Navigation */}
                <div className="flex items-center gap-8 border-b border-gray-200 mb-6 px-4">
                    {['Projects', 'Badges'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 text-sm font-bold transition-colors relative ${activeTab === tab ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-gray-900 rounded-t-full"></div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="mb-12">
                    {activeTab === 'Projects' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-black text-gray-900">Digital Workspace</h3>
                                {isOwnProfile && profileData.role === 'student' && (
                                    <button
                                        onClick={() => setShowAddProjectModal(true)}
                                        className="bg-violet-500 hover:bg-violet-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors shadow-sm"
                                    >
                                        <Plus size={14} /> Upload Project
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {profileData.projects && profileData.projects.length > 0 ? (
                                    profileData.projects.map((proj, idx) => (
                                        <ProjectCard key={proj.id || idx} project={proj} />
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500 py-12 text-center col-span-full font-medium">
                                        No projects uploaded to portfolio yet.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'Badges' && (
                        <div>
                            <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                                <Award size={20} className="text-amber-500" /> Verified Achievements
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {profileData.badges && profileData.badges.length > 0 ? (
                                    profileData.badges.map((b, idx) => (
                                        <div
                                            key={idx}
                                            className="bg-white rounded-3xl p-5 border border-gray-100 hover:border-amber-200 transition-colors shadow-sm flex flex-col items-center text-center"
                                        >
                                            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mb-3">
                                                <Award size={24} className="text-amber-500" />
                                            </div>
                                            <p className="font-bold text-sm text-emerald-600 mb-1">{b.name}</p>
                                            <p className="text-[11px] text-gray-500 font-medium">By: {b.issuer}</p>
                                            <p className="text-[10px] text-gray-400 mt-1 font-bold">{b.date}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500 py-12 text-center col-span-full font-medium">
                                        No faculty badges awarded yet.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <AddProjectModal
                isOpen={showAddProjectModal}
                onClose={() => setShowAddProjectModal(false)}
                onSubmit={handleAddProject}
            />

            <EditProfileModal
                isOpen={showEditProfileModal}
                onClose={() => setShowEditProfileModal(false)}
                profileData={profileData}
                onSubmit={handleEditProfile}
            />

            <EvaluateModal
                isOpen={!!evalStudent}
                onClose={() => setEvalStudent(null)}
                student={evalStudent}
                onEvaluated={() => queryClient.invalidateQueries({ queryKey: ['profile', targetId] })}
            />

            <ChatModal
                isOpen={showChatModal}
                activeChatUser={profileData}
                onClose={() => setShowChatModal(false)}
                onSelectChatUser={() => {}}
            />
        </div>
    );
}