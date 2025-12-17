/**
 * Token encryption using AES-256-GCM with Argon2id password hashing.
 *
 * Security features:
 * - PBKDF2 key derivation with 100,000 iterations
 * - Random 16-byte IV and salt per encryption
 * - Argon2id password hash stored for verification
 * - GCM authentication tag for integrity
 *
 * @module
 */
import crypto from 'crypto'
import type { EncryptedData } from '../types'
import pack from '../../package.json'

/**
 * Encrypts a JSON string of tokens using AES-256-GCM.
 *
 * @param text - The plaintext JSON string to encrypt (typically JSON.stringify'd Token[])
 * @param password - The user's password for encryption
 * @returns The encrypted data object, or false if encryption fails
 */
export async function encryptTokens(
    text: string,
    password: string
): Promise<EncryptedData | false> {
    try {
        const iv = crypto.randomBytes(16)
        const salt = crypto.randomBytes(16)
        const key = crypto.pbkdf2Sync(
            password,
            salt.toString('hex'),
            100000,
            32,
            'sha256'
        )
        const cipher = crypto.createCipheriv(
            'aes-256-gcm',
            new Uint8Array(key),
            new Uint8Array(iv)
        )

        // Hash the password with Argon2
        const passwordHash = await Bun.password.hash(password, {
            algorithm: 'argon2id',
            memoryCost: 65536, // 64MB
            timeCost: 3, // 3 iterations
        })

        let encrypted = cipher.update(text)
        const encryptedArray = new Uint8Array(encrypted)
        const final = new Uint8Array(cipher.final())
        encrypted = Buffer.concat([encryptedArray, final])

        return {
            version: pack.version,
            passwordHash,
            encryptedData: encrypted.toString('hex'),
            iv: iv.toString('hex'),
            authTag: cipher.getAuthTag().toString('hex'),
            salt: salt.toString('hex'),
        }
    } catch (error) {
        return false
    }
}
