import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../../api/client';
import { encryptMessage, decryptMessage } from '../../../utils/crypto';

export function useMessages(currentUser, getSharedKey, isE2EEReady) {
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState({}); // { [userId]: [msg1, msg2] }
    const [activeUserId, setActiveUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // Polling refs
    const pollInterval = useRef(null);
    const lastMessageId = useRef({}); // { [userId]: 'm_123' }

    // Decrypt conversation previews
    const processConversations = useCallback(async (convs) => {
        const processed = [...convs];
        for (let i = 0; i < processed.length; i++) {
            const c = processed[i];
            if (c.last_message_is_encrypted && c.last_message_iv) {
                const sharedKey = await getSharedKey(c.user_id);
                if (sharedKey) {
                    const decrypted = await decryptMessage(sharedKey, c.last_message, c.last_message_iv);
                    if (decrypted) {
                        c.last_message = decrypted;
                    } else {
                        c.last_message = "🔒 Encrypted message";
                    }
                } else {
                    c.last_message = "🔒 Encrypted message";
                }
            }
        }
        // Move ones with newest timestamps to top
        processed.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        return processed;
    }, [getSharedKey]);

    const loadConversations = useCallback(async () => {
        if (!isE2EEReady) return;
        try {
            const data = await api.get('/api/messages/conversations');
            const processed = await processConversations(data || []);
            setConversations(processed);
        } catch (err) {
            console.error(err);
        }
    }, [isE2EEReady, processConversations]);

    // Decrypt a list of messages
    const processMessages = useCallback(async (userId, rawMsgs) => {
        const sharedKey = await getSharedKey(userId);

        const processed = [];
        for (const m of rawMsgs) {
            if (m.is_encrypted && m.iv) {
                if (!sharedKey) {
                    processed.push({ ...m, content: "🔒 Waiting for key..." });
                } else {
                    const decrypted = await decryptMessage(sharedKey, m.content, m.iv);
                    processed.push({ ...m, content: decrypted || "🔒 Decryption failed" });
                }
            } else {
                processed.push(m); // old unencrypted messages
            }
        }
        return processed;
    }, [getSharedKey]);

    const loadChat = useCallback(async (userId) => {
        if (!userId || !isE2EEReady) return;
        setIsLoading(true);
        try {
            const data = await api.get(`/api/messages/${userId}`);
            const processed = await processMessages(userId, data || []);
            
            setMessages(prev => ({ ...prev, [userId]: processed }));
            if (processed.length > 0) {
                lastMessageId.current[userId] = processed[processed.length - 1].id;
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [isE2EEReady, processMessages]);

    // Poll for deltas
    const pollDeltas = useCallback(async () => {
        if (!activeUserId || !isE2EEReady) return;
        
        try {
            const afterId = lastMessageId.current[activeUserId];
            const url = afterId 
                ? `/api/messages/${activeUserId}?after=${afterId}` 
                : `/api/messages/${activeUserId}`;
                
            const data = await api.get(url);
            if (data && data.length > 0) {
                const processed = await processMessages(activeUserId, data);
                setMessages(prev => {
                    const existing = prev[activeUserId] || [];
                    // Check for duplicates just in case
                    const newMsgs = processed.filter(p => !existing.find(e => e.id === p.id));
                    return { ...prev, [activeUserId]: [...existing, ...newMsgs] };
                });
                lastMessageId.current[activeUserId] = data[data.length - 1].id;
                
                // Also update conversations to bump the active one up
                loadConversations();
            }
        } catch (err) {
            console.error(err);
        }
    }, [activeUserId, isE2EEReady, processMessages, loadConversations]);

    // Start polling loop
    useEffect(() => {
        loadConversations();
        if (activeUserId) loadChat(activeUserId);
        
        // Setup polling
        pollInterval.current = setInterval(() => {
            // Visibility API check could go here
            if (document.visibilityState === 'visible') {
                pollDeltas();
            }
        }, 3000);

        return () => clearInterval(pollInterval.current);
    }, [isE2EEReady, activeUserId, loadConversations, loadChat, pollDeltas]);

    const sendMessage = async (receiverId, content) => {
        if (!isE2EEReady) return false;
        
        // Optimistic UI update
        const tempId = `temp-${Date.now()}`;
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const tempMsg = {
            id: tempId,
            sender_id: currentUser.id || 'u1',
            receiver_id: receiverId,
            content: content,
            timestamp: timestamp,
            status: 'sending'
        };
        
        setMessages(prev => {
            const existing = prev[receiverId] || [];
            return { ...prev, [receiverId]: [...existing, tempMsg] };
        });

        try {
            // Encrypt before sending
            const sharedKey = await getSharedKey(receiverId);
            if (!sharedKey) throw new Error("No shared key available");
            
            const { ciphertext, iv } = await encryptMessage(sharedKey, content);
            
            const response = await api.post('/api/messages', {
                receiver_id: receiverId,
                content: ciphertext,
                iv: iv,
                is_encrypted: true
            });
            
            // Replace temp message with confirmed
            setMessages(prev => {
                const existing = prev[receiverId] || [];
                return {
                    ...prev,
                    [receiverId]: existing.map(m => m.id === tempId ? { ...response, content: content } : m)
                };
            });
            if (response.id) {
                lastMessageId.current[receiverId] = response.id;
            }
            loadConversations();
            return true;
        } catch (err) {
            console.error(err);
            // Mark failed
            setMessages(prev => {
                const existing = prev[receiverId] || [];
                return {
                    ...prev,
                    [receiverId]: existing.map(m => m.id === tempId ? { ...m, status: 'error' } : m)
                };
            });
            return false;
        }
    };

    return {
        conversations,
        messages: activeUserId ? (messages[activeUserId] || []) : [],
        activeUserId,
        setActiveUserId,
        sendMessage,
        isLoading
    };
}
