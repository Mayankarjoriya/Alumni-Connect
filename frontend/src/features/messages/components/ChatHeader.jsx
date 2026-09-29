import React from 'react';
import { Shield, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ChatHeader({ activeUser, isE2EEReady }) {
    if (!activeUser) return null;

    return (
        <div className="h-16 px-6 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-xl z-20">
            <div className="flex items-center gap-4">
                <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 flex items-center justify-center font-bold shadow-sm border border-white">
                        {activeUser.name?.[0] || 'U'}
                    </div>
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 leading-tight flex items-center gap-2">
                        {activeUser.name}
                        {isE2EEReady && (
                            <motion.div 
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex items-center text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide font-bold"
                            >
                                <Shield size={10} className="mr-1" />
                                E2EE
                            </motion.div>
                        )}
                    </h3>
                    <p className="text-xs text-gray-500 capitalize font-medium">
                        {activeUser.role} • {activeUser.college}
                    </p>
                </div>
            </div>
            
            <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                <Info size={18} />
            </button>
        </div>
    );
}
