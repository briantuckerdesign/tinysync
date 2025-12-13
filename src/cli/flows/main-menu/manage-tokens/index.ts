import { mainMenu } from '..'
import { state } from '../../../state'
import { ui } from '../../../ui'
import { createToken } from './create-tokens'
import { manageToken } from './manage-token'

export async function manageTokens() {
    try {
        ui.prompt.log.info(ui.format.bold('🔑 Manage tokens'))

        /* --------------------------- User selection prep -------------------------- */
        // Add existing tokens to options
        const tokensToSelect: any = state.tokens.map((token) => ({
            label: `${token.name} [${token.platform}]`,
            value: token,
        }))
        // Add create new/go back options
        const createNewToken = {
            value: 'createNewToken',
            label: '+ Create new access token',
        }
        tokensToSelect.unshift(createNewToken)
        const backOption = { value: 'back', label: 'Back' }
        tokensToSelect.push(backOption)

        /* ----------------------------- User selection ----------------------------- */
        const selectedToken = (await ui.prompt.select({
            message: 'Select an access token',
            options: tokensToSelect,
        })) as any
        await ui.handleCancel(selectedToken)

        /* -------------------------- Parse user selection -------------------------- */
        switch (selectedToken) {
            case 'back':
                await mainMenu()
                return
            case 'createNewToken':
                await createToken()
                return
            default:
                const token = state.tokens.find(
                    (token) => token.id === selectedToken.id
                )
                if (!token) throw new Error('Token not found')

                await manageToken(token)
                return
        }
    } catch (error) {
        ui.prompt.log.error('Error managing keys.')
        return
    }
}
