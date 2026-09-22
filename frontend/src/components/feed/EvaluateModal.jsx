import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import api from '../../api/client';

export default function EvaluateModal({ isOpen, onClose, student, onEvaluated }) {
    const [evalCredits, setEvalCredits] = useState(15);
    const [evalBadge, setEvalBadge] = useState('Skill Mastery');
    const [evalReason, setEvalReason] = useState('');
    const [evalSuccess, setEvalSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen || !student) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const data = await api.post('/api/faculty/evaluate', {
                student_id: student.id,
                credits: parseInt(evalCredits),
                badge_name: evalBadge,
                reason: evalReason,
            });
            setEvalSuccess(data.message || 'Evaluation submitted successfully!');
            setTimeout(() => {
                setEvalSuccess('');
                if (onEvaluated) onEvaluated();
                onClose();
            }, 1500);
        } catch (err) {
            console.error("Evaluation failed:", err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white border border-gray-100 rounded-3xl w-full max-w-md p-6 shadow-xl text-gray-900"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-lg font-bold mb-2">Faculty Evaluation & Credit Award</h2>
                <p className="text-xs text-gray-500 font-medium mb-6">
                    Evaluating student: <span className="text-emerald-600 font-bold">{student.name}</span>
                </p>

                {evalSuccess ? (
                    <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 p-4 rounded-xl text-sm font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" /> {evalSuccess}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs text-gray-700 font-bold block mb-1">Award Academic Credits</label>
                            <input
                                type="number"
                                min="5"
                                max="100"
                                value={evalCredits}
                                onChange={(e) => setEvalCredits(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-700 font-bold block mb-1">Badge Title</label>
                            <input
                                type="text"
                                value={evalBadge}
                                onChange={(e) => setEvalBadge(e.target.value)}
                                required
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-700 font-bold block mb-1">Reason / Evaluation Notes <span className="text-gray-400 font-medium">(optional)</span></label>
                            <textarea
                                placeholder="Brief reason for this award, achievement details..."
                                value={evalReason}
                                onChange={(e) => setEvalReason(e.target.value)}
                                rows={3}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none transition-colors"
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
                                disabled={submitting}
                                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-xl text-sm font-bold text-white transition-colors shadow-sm"
                            >
                                {submitting ? 'Submitting...' : 'Award Credits & Badge'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
