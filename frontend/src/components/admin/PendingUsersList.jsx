import React from 'react';
import { ShieldCheck, CheckCircle, XCircle } from 'lucide-react';

export default function PendingUsersList({ pendingUsers = [], onVerify, collegeName }) {
    return (
        <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
                <ShieldCheck className="text-amber-500" /> Pending Verification Hub
            </h2>
            <p className="text-xs text-gray-500 mb-6 font-medium">
                Approve or reject login/signup requests claiming affiliation with {collegeName}.
            </p>

            {pendingUsers.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 p-12 rounded-2xl text-center text-gray-500 text-sm font-medium">
                    No unapproved faculty or alumni registration requests pending.
                </div>
            ) : (
                <div className="space-y-4">
                    {pendingUsers.map((user) => (
                        <div
                            key={user.id}
                            className="bg-white border border-gray-200 p-6 rounded-2xl flex items-center justify-between shadow-sm"
                        >
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-base text-gray-900">{user.name}</h3>
                                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full capitalize">
                                        {user.role}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 font-medium">
                                    Email: {user.email} • Dept: <span className="text-gray-900 font-semibold">{user.department}</span>
                                    {user.role === 'alumni' && ` • Company: ${user.company || 'N/A'}`}
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => onVerify(user.id, true)}
                                    className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm"
                                >
                                    <CheckCircle size={16} /> Approve
                                </button>
                                <button
                                    onClick={() => onVerify(user.id, false)}
                                    className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-xs font-bold transition-colors"
                                >
                                    <XCircle size={16} /> Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
