import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function FacultyEvalPanel({ department, assignedStudents = [], onEvaluateStudent }) {
    return (
        <div className="mb-8 bg-white border border-blue-100 p-6 rounded-3xl relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50 blur-3xl rounded-full pointer-events-none"></div>

            <div className="flex items-center justify-between mb-4 relative z-10">
                <div>
                    <h3 className="text-lg font-bold text-blue-600 flex items-center gap-2">
                        <CheckCircle2 size={20} /> Faculty Evaluation Panel ({department} Dept)
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">
                        Review assigned department students, grant academic credits, and issue verified skill badges.
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-3 relative z-10">
                {assignedStudents.length === 0 ? (
                    <p className="text-xs text-gray-400 py-4 text-center font-medium">No students currently assigned to your department.</p>
                ) : (
                    assignedStudents.map((st) => (
                        <div
                            key={st.id}
                            className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors shadow-sm"
                        >
                            <div>
                                <p className="font-bold text-sm text-gray-900">{st.name}</p>
                                <p className="text-xs text-gray-500 font-medium">
                                    Current Credits: <span className="text-amber-600 font-bold">{st.credits || 0}</span> • Projects Submitted: <span className="font-bold">{st.projects?.length || 0}</span>
                                </p>
                            </div>
                            <button
                                onClick={() => onEvaluateStudent(st)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm"
                            >
                                Evaluate & Award Credits
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
