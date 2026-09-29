import React, { useState } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { spring } from '../../../motion/presets';

export default function MessageComposer({ onSend, isReady }) {
    const [text, setText] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim() || !isReady) return;
        onSend(text);
        setText('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="p-4 bg-white/80 backdrop-blur-xl border-t border-gray-100 z-20">
            <form onSubmit={handleSubmit} className="flex items-end gap-3 max-w-4xl mx-auto">
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-3xl flex items-end shadow-sm focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100 transition-all px-2 py-1.5 relative overflow-hidden">
                    
                    <button type="button" className="p-2 text-gray-400 hover:text-violet-600 transition-colors rounded-full flex-shrink-0">
                        <Paperclip size={18} />
                    </button>
                    
                    <textarea
                        value={text}
                        onChange={e => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={isReady ? "Message (E2E Encrypted)..." : "Setting up encryption..."}
                        disabled={!isReady}
                        className="flex-1 bg-transparent border-none resize-none px-2 py-2 text-[15px] text-gray-900 placeholder-gray-400 focus:ring-0 max-h-32 min-h-[40px] outline-none"
                        rows={1}
                        style={{ fieldSizing: 'content' }} // Modern CSS for auto-growing if supported, else fallback to 1 row
                    />

                    <button type="button" className="p-2 text-gray-400 hover:text-violet-600 transition-colors rounded-full flex-shrink-0">
                        <Smile size={18} />
                    </button>
                </div>

                <AnimatePresence mode="popLayout">
                    {text.trim().length > 0 && (
                        <motion.button
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.9 }}
                            transition={spring}
                            type="submit"
                            disabled={!isReady}
                            className="h-11 w-11 rounded-full bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 mb-0.5"
                        >
                            <Send size={18} className="ml-1" />
                        </motion.button>
                    )}
                </AnimatePresence>
            </form>
        </div>
    );
}
