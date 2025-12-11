import crypto from 'crypto'
import { configTools } from '.'
import pack from '../../package.json'
import { state } from '../cli/state'

/**
 * Things I want to do
 * - split config into sensitive and non-sensitive
 * OR encrypt individual objects in config
 * -
 */

interface EncryptedData {
    version: string
    passwordHash: string
    encryptedData: string
    iv: string
    authTag: string
    salt: string
}
/* -------------------------------------------------------------------------- */
/*                            Config tools / Secure                           */
/* -------------------------------------------------------------------------- */

export const secure = {
    encrypt,
    decrypt,
}

async function encrypt(text: string, password: string) {
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
        let encryptedArray = new Uint8Array(encrypted)
        let final = new Uint8Array(cipher.final())
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
        console.log(error)
    }
}

/* -------------------------------------------------------------------------- */
/*                              Secure / Decrypt                              */
/* -------------------------------------------------------------------------- */
async function decrypt(
    encrypted: EncryptedData,
    password: string
): Promise<any> {
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
        return JSON.parse(decryptedString)
    } catch (error) {
        const json = await decryptOldVersionAndUpgrade(encrypted, password)
        if (json) return json

        if (error.message === 'Invalid password') throw error
        throw new Error('Decryption failed')
    }
}

async function decryptOldVersionAndUpgrade(
    encrypted: EncryptedData,
    password: string
): Promise<any> {
    try {
        const iv = Buffer.from(encrypted.iv, 'hex')
        const salt = Buffer.from(encrypted.salt, 'hex')
        // @ts-ignore
        const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha512')
        // @ts-ignore
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
        let decrypted = decipher.update(
            // @ts-ignore
            Buffer.from(encrypted.encryptedData, 'hex')
        )
        // @ts-ignore
        decrypted = Buffer.concat([decrypted, decipher.final()])
        const decryptedString = decrypted.toString()
        const json = JSON.parse(decryptedString)

        // Save the config with the new encryption method
        state.config = json
        state.password = password
        configTools.save()

        return json
    } catch (error) {
        return undefined
    }
}
