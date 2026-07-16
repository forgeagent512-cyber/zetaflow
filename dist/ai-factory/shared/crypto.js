import crypto from 'node:crypto';
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
function getEncryptionKey() {
    const keyStr = process.env.ENCRYPTION_KEY || 'default-encryption-key-must-be-32-chars-long!';
    // Normalize to 32 bytes using SHA-256
    return crypto.createHash('sha256').update(keyStr).digest();
}
export function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = getEncryptionKey();
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    // Format: iv:authTag:encryptedText
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}
export function decrypt(cipherText) {
    const parts = cipherText.split(':');
    if (parts.length !== 3) {
        throw new Error('Invalid cipher text format');
    }
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encryptedText = parts[2];
    const key = getEncryptionKey();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
