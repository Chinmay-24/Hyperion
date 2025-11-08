import CryptoJS from 'crypto-js';

/**
 * Encrypt patient data before storing on IPFS
 * @param {string} data - Data to encrypt
 * @param {string} key - Encryption key (derived from patient's wallet)
 * @returns {string} Encrypted data
 */
export function encryptData(data, key) {
  try {
    const encrypted = CryptoJS.AES.encrypt(data, key).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw error;
  }
}

/**
 * Decrypt patient data retrieved from IPFS
 * @param {string} encryptedData - Encrypted data
 * @param {string} key - Decryption key
 * @returns {string} Decrypted data
 */
export function decryptData(encryptedData, key) {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw error;
  }
}

/**
 * Generate encryption key from wallet address
 * @param {string} address - Wallet address
 * @param {string} privateKey - Optional private key for stronger encryption
 * @returns {string} Encryption key
 */
export function generateKeyFromAddress(address, privateKey = '') {
  // In production, use a more secure key derivation method
  // This is a simplified version
  const baseKey = address + privateKey;
  return CryptoJS.SHA256(baseKey).toString();
}

/**
 * Encrypt file buffer
 * @param {ArrayBuffer} fileBuffer - File buffer to encrypt
 * @param {string} key - Encryption key
 * @returns {string} Encrypted data as base64 string
 */
export function encryptFile(fileBuffer, key) {
  try {
    const wordArray = CryptoJS.lib.WordArray.create(fileBuffer);
    const encrypted = CryptoJS.AES.encrypt(wordArray, key).toString();
    return encrypted;
  } catch (error) {
    console.error('File encryption error:', error);
    throw error;
  }
}

/**
 * Decrypt file buffer
 * @param {string} encryptedData - Encrypted data
 * @param {string} key - Decryption key
 * @returns {ArrayBuffer} Decrypted file buffer
 */
export function decryptFile(encryptedData, key) {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    const wordArray = bytes;
    const buffer = new ArrayBuffer(wordArray.sigBytes);
    const view = new Uint8Array(buffer);
    
    for (let i = 0; i < wordArray.sigBytes; i++) {
      view[i] = (wordArray.words[Math.floor(i / 4)] >>> (24 - (i % 4) * 8)) & 0xff;
    }
    
    return buffer;
  } catch (error) {
    console.error('File decryption error:', error);
    throw error;
  }
}

