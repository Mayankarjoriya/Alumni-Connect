import React from 'react';
import { motion } from 'motion/react';
import { listStagger, softSpring } from '../../../motion/presets';

export default function ConversationList({ 
    conversations, 
    activeUserId, 
    onSelect,
    searchQuery,
    setSearchQuery
}) {
    const filtered = conversations.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-white/50 border-r border-gray-100">
            <div className="p-4 border-b border-gray-100 backdrop-blur-md sticky top-0 z-10">
                <h2 className="text-xl font-bold mb-4 tracking-tight">Messages</h2>
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Search chats (Ctrl+K)" 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-100 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-violet-500 transition-all outline-none"
                    />
                </div>
            </div>
            
            <motion.div 
                className="flex-1 overflow-y-auto custom-scrollbar p-2"
                variants={listStagger}
                initial="hidden"
                animate="visible"
            >
                {filtered.length === 0 ? (
                    <div className="text-center p-8 text-gray-400 text-sm">
                        No conversations found.
                    </div>
                ) : (
                    filtered.map((c) => {
                        const isActive = activeUserId === c.user_id;
                        return (
                            <motion.button
                                layout="position"
                                key={c.user_id}
                                onClick={() => onSelect(c)}
                                className={`w-full text-left p-3 rounded-2xl flex items-center gap-3 transition-all relative group mb-1 ${
                                    isActive ? 'bg-white shadow-sm' : 'hover:bg-white/60'
                                }`}
                                whileHover={{ scale: 0.99 }}
                                whileTap={{ scale: 0.97 }}
                                transition={softSpring}
                            >
                                {isActive && (
                                    <motion.div 
                                        layoutId="active-conv" 
                                        className="absolute inset-0 bg-white border border-gray-100 rounded-2xl shadow-sm -z-10"
                                        transition={softSpring}
                                    />
                                )}
                                
                                <div className="relative flex-shrink-0">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-700 flex items-center justify-center font-bold text-lg border border-white shadow-sm">
                                        {c.name?.[0] || 'U'}
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <p className="font-bold text-sm truncate text-gray-900 group-hover:text-violet-700 transition-colors">
                                            {c.name}
                                        </p>
                                        <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap ml-2">
                                            {c.timestamp}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 truncate font-medium">
                                        {c.last_message}
                                    </p>
                                </div>
                            </motion.button>
                        );
                    })
                )}
            </motion.div>
        </div>
    );
}
