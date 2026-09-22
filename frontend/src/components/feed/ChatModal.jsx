import React, { useState, useEffect } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import api from '../../api/client';

export default function ChatModal({
    isOpen,
    onClose,
    activeChatUser,
    onSelectChatUser
}) {
    const [conversations, setConversations] = useState([]);
    const [messagesList, setMessagesList] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const currentUser = JSON.parse(localStorage.getItem('user') || '{"name": "User", "id": "u1"}');

    const loadConversations = async () => {
        try {
            const data = await api.get('/api/messages/conversations');
            setConversations(data || []);
        } catch (err) {
            console.error("Failed to load conversations:", err);
        }
    };

    const loadChatMessages = async (otherUserId) => {
        try {
            const data = await api.get(`/api/messages/${otherUserId}`);
            setMessagesList(data || []);
        } catch (err) {
            console.error("Failed to load chat messages:", err);
        }
    };

    useEffect(() => {
        if (!isOpen) return;
        loadConversations();
        if (activeChatUser) {
            loadChatMessages(activeChatUser.id || activeChatUser.user_id);
        }
    }, [isOpen, activeChatUser]);

    if (!isOpen) return null;

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageInput.trim() || !activeChatUser) return;

        try {
            const receiverId = activeChatUser.id || activeChatUser.user_id;
            await api.post('/api/messages', {
                receiver_id: receiverId,
                content: messageInput
            });
            setMessageInput('');
            loadChatMessages(receiverId);
            loadConversations();
        } catch (err) {
            console.error("Failed to send message:", err);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white border border-gray-200 rounded-3xl w-full max-w-4xl h-[80vh] flex overflow-hidden shadow-xl text-gray-900"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Conversations Sidebar */}
                <div className="w-1/3 border-r border-gray-100 flex flex-col bg-gray-50/50">
                    <div className="p-4 border-b border-gray-100">
                        <h3 className="font-bold text-sm flex items-center gap-2 text-gray-900">
                            <MessageSquare className="text-violet-600" size={16} /> Direct Messages
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                        {conversations.length === 0 ? (
                            <p className="text-xs text-gray-500 text-center py-8 font-medium">No active chats.</p>
                        ) : (
                            conversations.map((c) => (
                                <button
                                    key={c.user_id}
                                    onClick={() => onSelectChatUser(c)}
                                    className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-colors ${
                                        (activeChatUser?.id === c.user_id || activeChatUser?.user_id === c.user_id)
                                            ? 'bg-white shadow-sm border border-gray-100'
                                            : 'hover:bg-gray-100 border border-transparent'
                                    }`}
                                >
                                    <div className="w-9 h-9 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                        {c.name?.[0] || 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold truncate text-gray-900">{c.name}</p>
                                        <p className="text-[11px] text-gray-500 truncate">{c.last_message}</p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Thread Panel */}
                <div className="flex-1 flex flex-col bg-white">
                    {activeChatUser ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
                                <div>
                                    <h4 className="font-bold text-sm text-gray-900">{activeChatUser.name}</h4>
                                    <p className="text-[11px] text-gray-500 capitalize font-medium">
                                        {activeChatUser.role} • {activeChatUser.college}
                                    </p>
                                </div>
                                <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xs font-bold">
                                    ✕ Close
                                </button>
                            </div>

                            {/* Message Bubble Feed */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                {messagesList.length === 0 ? (
                                    <p className="text-center text-gray-400 text-xs py-10 font-medium">No messages yet. Send a greeting!</p>
                                ) : (
                                    messagesList.map((m) => {
                                        const isMine = m.sender_id === (currentUser.id || 'u1');
                                        return (
                                            <div
                                                key={m.id}
                                                className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                                            >
                                                <div
                                                    className={`max-w-xs md:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                                                        isMine
                                                            ? 'bg-violet-600 text-white rounded-br-none'
                                                            : 'bg-gray-100 text-gray-800 rounded-bl-none'
                                                    }`}
                                                >
                                                    {m.content}
                                                </div>
                                                <span className="text-[9px] text-gray-400 mt-1 px-1 font-medium">{m.timestamp}</span>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Input Form */}
                            <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-100 flex gap-2 bg-gray-50/50">
                                <input
                                    type="text"
                                    placeholder="Type your message..."
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-400 transition-colors shadow-sm"
                                />
                                <button
                                    type="submit"
                                    className="bg-violet-600 hover:bg-violet-700 text-white p-2.5 rounded-xl transition-colors shadow-sm"
                                >
                                    <Send size={16} />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-sm p-6 font-medium">
                            <MessageSquare size={36} className="mb-3 text-gray-300" />
                            <p>Select a conversation or initiate a chat from the directory.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
