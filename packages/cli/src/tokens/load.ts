import { tokenFilePath } from '.'
import type { EncryptedData } from '../types'
import { ui } from '../ui'

export async function loadTokens(): Promise<EncryptedData | false> {
    try {
        const file = Bun.file(tokenFilePath)
        const exists = await file.exists()

        // Create empty token file if it doesn't exist
        if (!exists) {
            await Bun.write(tokenFilePath, '{}')
            // Return empty object directly - no need to re-read
            return {} as EncryptedData
        }

        // Read existing file
        const text = await file.text()

        // Handle empty file case
        if (!text || text.trim() === '') {
            await Bun.write(tokenFilePath, '{}')
            return {} as EncryptedData
        }

        const tokenFile = JSON.parse(text)

        // Make sure it's an object
        if (typeof tokenFile !== 'object' || tokenFile === null) {
            throw new Error('Invalid token file')
        }

        return tokenFile as EncryptedData
    } catch (error) {
        ui.prompt.log.error('Error loading tokens.')
        if (error instanceof Error) {
            ui.prompt.log.error(error.message)
        }
        return false
    }
}
