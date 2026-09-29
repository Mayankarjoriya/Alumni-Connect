import { useState, useEffect, useCallback } from 'react';
import { generateKeyPair, exportPublicKey, importPublicKey, deriveSharedKey, getPrivateKey } from '../../../utils/crypto';
import api from '../../../api/client';

export function useE2EE(currentUser) {
    const [isReady, setIsReady] = useState(false);
    const [myPublicKey, setMyPublicKey] = useState(null);
    const [sharedKeyCache, setSharedKeyCache] = useState(new Map()); // Map<userId, CryptoKey>
    const [keyError, setKeyError] = useState(null);

    // Initialize keys on mount
    useEffect(() => {
        async function initKeys() {
            try {
                let privKey = await getPrivateKey();
                
                // If no private key exists in IndexedDB, generate a new pair
                if (!privKey) {
                    await generateAndUploadKey();
                } else {
                    // Fetch our own public key from backend to make sure it exists
                    try {
                        const { public_key } = await api.get(`/api/users/${currentUser.id}/public-key`);
                        setMyPublicKey(public_key);
                    } catch (err) {
                        // If it fails (e.g. 404 because it didn't save last time), regenerate
                        console.warn("Public key missing from backend, regenerating...");
                        await generateAndUploadKey();
                    }
                }
                
                setIsReady(true);
            } catch (err) {
                console.error("Failed to initialize E2EE keys", err);
                setKeyError("Encryption key setup failed. Messages will be unavailable.");
            }
        }

        async function generateAndUploadKey() {
            const keyPair = await generateKeyPair();
            const pubKeyJwk = await exportPublicKey(keyPair.publicKey);
            await api.post('/api/users/public-key', { public_key: pubKeyJwk });
            setMyPublicKey(pubKeyJwk);
        }
        
        
        if (currentUser?.id) {
            initKeys();
        }
    }, [currentUser?.id]);

    // Get shared key for a user (with caching)
    const getSharedKey = useCallback(async (otherUserId) => {
        if (sharedKeyCache.has(otherUserId)) {
            return sharedKeyCache.get(otherUserId);
        }

        try {
            // Fetch their public key
            const { public_key: theirPubKeyString } = await api.get(`/api/users/${otherUserId}/public-key`);
            if (!theirPubKeyString) return null;

            const theirPubKey = await importPublicKey(theirPubKeyString);
            const myPrivKey = await getPrivateKey();
            
            const sharedKey = await deriveSharedKey(myPrivKey, theirPubKey);
            
            setSharedKeyCache(prev => {
                const newCache = new Map(prev);
                newCache.set(otherUserId, sharedKey);
                return newCache;
            });
            
            return sharedKey;
        } catch (err) {
            console.error(`Failed to derive shared key for ${otherUserId}:`, err);
            return null;
        }
    }, [sharedKeyCache]);

    return {
        isReady,
        keyError,
        getSharedKey
    };
}
