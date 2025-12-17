/**
 * Token decryption with password verification.
 *
 * Verifies the password against the stored Argon2id hash before attempting
 * decryption. This prevents unnecessary decryption attempts with wrong passwords.
 *
 * @module
 */
import type { Token } from '@tinysync/core'
import type { EncryptedData } from '../types'
import crypto from 'crypto'

/**
 * Decrypts encrypted token data using the user's password.
 *
 * @param encrypted - The encrypted data object from storage
 * @param password - The user's password
 * @returns Array of decrypted Token objects
 * @throws Error with 'Invalid password' message if password verification fails
 * @throws Error with 'Decryption failed' for other decryption errors
 * @throws Error with 'Encrypted data is corrupted' if required fields are missing
 */
export async function decryptTokens(
    encrypted: EncryptedData,
    password: string
): Promise<Token[]> {
    if (
        !encrypted.authTag ||
        !encrypted.encryptedData ||
        !encrypted.iv ||
        !encrypted.passwordHash ||
        !encrypted.salt
    ) {
        throw new Error('Encrypted data is corrupted')
    }
    try {
        // First verify the password matches the stored hash
        const isPasswordValid = await Bun.password.verify(
            password,
            encrypted.passwordHash
        )
        if (!isPasswordValid) {
            throw new Error('Invalid password')
        }

        // Use the stored salt instead of generating a new one
        const salt = Buffer.from(encrypted.salt, 'hex')
        const key = crypto.pbkdf2Sync(
            password,
            salt.toString('hex'),
            100000, // Match the iteration count from encrypt
            32,
            'sha256'
        )

        // Decrypt the data
        const iv = Buffer.from(encrypted.iv, 'hex')
        const authTag = Buffer.from(encrypted.authTag, 'hex')
        const decipher = crypto.createDecipheriv(
            'aes-256-gcm',
            new Uint8Array(key),
            new Uint8Array(iv)
        )

        decipher.setAuthTag(new Uint8Array(authTag))

        let decrypted = decipher.update(
            new Uint8Array(Buffer.from(encrypted.encryptedData, 'hex'))
        )
        let decryptedArray = new Uint8Array(decrypted)
        let final = new Uint8Array(decipher.final())
        decrypted = Buffer.concat([decryptedArray, final])

        // Zero out sensitive data
        key.fill(0)

        // Parse and return the decrypted data
        const decryptedString = decrypted.toString()
        const tokens = JSON.parse(decryptedString)

        if (!Array.isArray(tokens))
            throw new Error('Decrypted data is not an array')

        if (tokens.length && (!tokens[0].token || !tokens[0].platform)) {
            throw new Error('Decrypted data is not valid')
        }

        return tokens as Token[]
    } catch (error) {
        if ((error as any).message === 'Invalid password') throw error
        throw new Error('Decryption failed')
    }
}
