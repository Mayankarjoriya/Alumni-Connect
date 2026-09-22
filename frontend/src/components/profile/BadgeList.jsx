import React from 'react';
import { Award } from 'lucide-react';

export default function BadgeList({ badges = [] }) {
    return (
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-gray-900">
                <Award size={18} className="text-amber-500" /> Verified Badges ({badges.length})
            </h3>
            <div className="space-y-3">
                {badges.length > 0 ? (
                    badges.map((b, idx) => (
                        <div
                            key={idx}
                            className="bg-gray-50 rounded-2xl p-4 border border-gray-100 hover:border-amber-200 transition-colors shadow-sm"
                        >
                            <p className="font-bold text-sm text-emerald-600">{b.name}</p>
                            <p className="text-[11px] text-gray-500 mt-1 font-medium">Awarded by: {b.issuer}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5 font-bold">{b.date}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-xs text-gray-500 py-4 text-center font-medium">No faculty badges awarded yet.</p>
                )}
            </div>
        </div>
    );
}
