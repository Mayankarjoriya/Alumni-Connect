// E2EE Crypto Utility using WebCrypto API
// IndexedDB setup for key storage
function getDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('AlumniConnectCrypto', 1);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('keys')) {
                db.createObjectStore('keys');
            }
        };
        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => reject(e.target.error);
    });
}

export async function storePrivateKey(key) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('keys', 'readwrite');
        const store = tx.objectStore('keys');
        const request = store.put(key, 'myPrivateKey');
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

export async function getPrivateKey() {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('keys', 'readonly');
        const store = tx.objectStore('keys');
        const request = store.get('myPrivateKey');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function generateKeyPair() {
    const keyPair = await window.crypto.subtle.generateKey(
        { name: "ECDH", namedCurve: "P-256" },
        false, // non-extractable private key
        ["deriveKey"]
    );
    await storePrivateKey(keyPair.privateKey);
    return keyPair;
}

export async function exportPublicKey(publicKey) {
    const jwk = await window.crypto.subtle.exportKey("jwk", publicKey);
    return JSON.stringify(jwk);
}

export async function importPublicKey(jwkString) {
    const jwk = JSON.parse(jwkString);
    return await window.crypto.subtle.importKey(
        "jwk",
        jwk,
        { name: "ECDH", namedCurve: "P-256" },
        true,
        []
    );
}

export async function deriveSharedKey(myPrivateKey, theirPublicKey) {
    return await window.crypto.subtle.deriveKey(
        { name: "ECDH", public: theirPublicKey },
        myPrivateKey,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
    );
}

function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function base64ToArrayBuffer(base64) {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

export async function encryptMessage(sharedKey, plaintext) {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(plaintext);

    const ciphertextBuffer = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        sharedKey,
        encoded
    );

    return {
        ciphertext: arrayBufferToBase64(ciphertextBuffer),
        iv: arrayBufferToBase64(iv)
    };
}

export async function decryptMessage(sharedKey, ciphertextBase64, ivBase64) {
    try {
        const ciphertext = base64ToArrayBuffer(ciphertextBase64);
        const iv = base64ToArrayBuffer(ivBase64);

        const decryptedBuffer = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv: iv },
            sharedKey,
            ciphertext
        );

        return new TextDecoder().decode(decryptedBuffer);
    } catch (e) {
        console.error("Decryption failed:", e);
        return null;
    }
}
