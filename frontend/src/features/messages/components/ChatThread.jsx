import React, { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';

export default function ChatThread({ messages, currentUser }) {
    const bottomRef = useRef(null);

    useEffect(() => {
        // Auto-scroll to bottom on new messages
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (messages.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 border-2 border-white shadow-sm">
                    <span className="text-2xl">👋</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1">No messages here yet</h3>
                <p className="text-sm">Send a message to start the conversation.</p>
                <p className="text-xs text-emerald-600 mt-2 font-medium flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-md">
                    🔒 End-to-end encrypted
                </p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div className="max-w-4xl mx-auto flex flex-col justify-end min-h-full">
                {messages.map(m => (
                    <MessageBubble 
                        key={m.id} 
                        message={m} 
                        isMine={m.sender_id === (currentUser.id || 'u1')} 
                    />
                ))}
                <div ref={bottomRef} />
            </div>
        </div>
    );
}
