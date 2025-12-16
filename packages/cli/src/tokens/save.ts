import { tokenFilePath, tokens } from '.'
import { state } from '../state'
import { ui } from '../ui'

export async function saveTokens() {
    try {
        if (!state.password) return

        // If config is provided, use it rather than the state
        const encryptedTokens = await tokens.encrypt(
            JSON.stringify(state.tokens),
            state.password
        )

        if (typeof encryptedTokens !== 'object') {
            ui.prompt.log.error('Config is corrupted.')
            throw new Error()
        }

        await Bun.write(tokenFilePath, JSON.stringify(encryptedTokens, null, 2))
    } catch (error) {
        ui.prompt.log.error('Error saving config.')
        process.exit(0)
    }
}
