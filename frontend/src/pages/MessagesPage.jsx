import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import ConversationList from '../features/messages/components/ConversationList';
import ChatHeader from '../features/messages/components/ChatHeader';
import ChatThread from '../features/messages/components/ChatThread';
import MessageComposer from '../features/messages/components/MessageComposer';
import { useE2EE } from '../features/messages/hooks/useE2EE';
import { useMessages } from '../features/messages/hooks/useMessages';
import { MessageSquare } from 'lucide-react';
import '../features/messages/styles/messages.css';

export default function MessagesPage() {
    const [searchParams] = useSearchParams();
    const deepLinkUser = searchParams.get('user');
    const [searchQuery, setSearchQuery] = useState('');
    
    const currentUser = JSON.parse(localStorage.getItem('user') || '{"name":"User","id":"u1"}');
    
    // Hooks
    const { isReady: isE2EEReady, getSharedKey, keyError } = useE2EE(currentUser);
    const {
        conversations,
        messages,
        activeUserId,
        setActiveUserId,
        sendMessage,
        isLoading
    } = useMessages(currentUser, getSharedKey, isE2EEReady);

    // Deep linking handler
    useEffect(() => {
        if (deepLinkUser && !activeUserId) {
            setActiveUserId(deepLinkUser);
            // Ideally we'd fetch the user's details if they aren't in the conversation list yet, 
            // but for now setting the ID is a start.
        }
    }, [deepLinkUser, activeUserId, setActiveUserId]);

    const activeUser = conversations.find(c => c.user_id === activeUserId) || 
        (deepLinkUser === activeUserId ? { user_id: deepLinkUser, name: 'Loading...', role: 'user', college: 'Institution' } : null);

    return (
        <div className="h-screen w-full messages-page-container flex overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* 1. Sidebar Panel */}
            <div className="w-20 lg:w-64 flex-shrink-0 z-30">
                <Sidebar activeTab="messages" />
            </div>

            {/* 2. Conversations List Panel */}
            <div className="w-80 lg:w-96 flex-shrink-0 border-r border-gray-100 bg-white/40 backdrop-blur-xl z-20">
                <ConversationList 
                    conversations={conversations} 
                    activeUserId={activeUserId} 
                    onSelect={(c) => setActiveUserId(c.user_id)} 
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />
            </div>

            {/* 3. Chat Thread Panel */}
            <div className="flex-1 flex flex-col relative z-10 bg-[#fbfbfe]">
                {keyError && (
                    <div className="bg-red-50 text-red-600 p-3 text-center text-sm font-medium border-b border-red-100">
                        {keyError}
                    </div>
                )}
                
                {activeUser ? (
                    <>
                        <ChatHeader activeUser={activeUser} isE2EEReady={isE2EEReady} />
                        
                        <div className="flex-1 overflow-hidden relative">
                            {/* Decorative blurred blob in background */}
                            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-400/10 rounded-full blur-3xl pointer-events-none" />
                            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />
                            
                            <ChatThread 
                                messages={messages} 
                                currentUser={currentUser}
                            />
                        </div>

                        <MessageComposer 
                            onSend={(content) => sendMessage(activeUserId, content)} 
                            isReady={isE2EEReady}
                        />
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
                        <div className="w-20 h-20 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center mb-6">
                            <MessageSquare size={32} className="text-violet-200" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Your Messages</h3>
                        <p className="text-gray-500 max-w-sm text-center">
                            Select a conversation from the left to start messaging, or search the directory to start a new chat. All messages are securely end-to-end encrypted.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
