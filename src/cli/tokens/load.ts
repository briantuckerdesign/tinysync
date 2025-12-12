import { tokenFilePath } from '.'
import type { EncryptedData } from '../types'
import { ui } from '../ui'

export async function loadTokens(): Promise<EncryptedData | false> {
    try {
        // Read the file
        const file = Bun.file(tokenFilePath)

        const exists = await file.exists()
        if (!exists) await Bun.write(tokenFilePath, '{}')

        const tokenFile = await file.json()

        // make sure it's an object
        if (typeof tokenFile !== 'object' || tokenFile === null)
            throw new Error('Invalid token file')

        return tokenFile as EncryptedData
    } catch (error) {
        ui.prompt.log.error('Error loading tokens.')
        return false
    }
}
