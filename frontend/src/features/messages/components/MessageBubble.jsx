import React, { memo } from 'react';
import { motion } from 'motion/react';
import { softSpring } from '../../../motion/presets';
import { Check, CheckCheck } from 'lucide-react';

const MessageBubble = memo(({ message, isMine }) => {
    return (
        <motion.div 
            layout="position"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={softSpring}
            className={`flex flex-col mb-3 ${isMine ? 'items-end' : 'items-start'}`}
        >
            <div 
                className={`max-w-[75%] px-4 py-2.5 text-[15px] leading-relaxed shadow-sm relative group ${
                    isMine 
                        ? 'bubble-mine' 
                        : 'bubble-theirs'
                }`}
                style={{ borderRadius: '20px' }}
            >
                {/* Content */}
                <p className="whitespace-pre-wrap word-break break-words">
                    {message.content}
                </p>
                
                {/* Status overlay (sending/error) */}
                {message.status === 'sending' && (
                    <div className="absolute inset-0 bg-white/20 rounded-2xl flex items-center justify-center">
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    </div>
                )}
                {message.status === 'error' && (
                    <div className="absolute -right-2 -top-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
                        Failed
                    </div>
                )}
            </div>

            {/* Meta */}
            <div className={`flex items-center gap-1 mt-1 px-1 ${isMine ? 'flex-row-reverse' : ''}`}>
                <span className="text-[10px] text-gray-400 font-medium tracking-wide">
                    {message.timestamp}
                </span>
                {isMine && message.status !== 'sending' && message.status !== 'error' && (
                    <span className="text-violet-500">
                        {/* Fake read receipt for now - could be real later */}
                        <CheckCheck size={12} strokeWidth={3} />
                    </span>
                )}
            </div>
        </motion.div>
    );
});

export default MessageBubble;
