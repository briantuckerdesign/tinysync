import { v4 as uuidv4 } from 'uuid'
import type { Platform, Token } from '@tinysync/core'
import { state } from '../../../../state'
import { ui } from '../../../../ui'
import {
    createToken,
    promptForTokenName,
} from '../../manage-tokens/create-tokens'
import { verifyToken } from '../../manage-tokens/verify-token'
import { manageSyncs } from '..'

export async function selectToken(platform: Platform): Promise<Token> {
    try {
        let untestedToken
        let selectedToken

        // Get relevant tokens from config
        const tokenOptions = state.tokens
            .filter((token) => token.platform === platform)
            .map((token) => ({
                label: token.name,
                value: token,
            })) as any[]

        // If there are stored tokens, user can select one create a new one.
        if (tokenOptions.length) {
            tokenOptions.unshift({
                label: 'Create new token',
                value: 'createNewToken',
            })

            selectedToken = await ui.prompt.select({
                message: `${platform} token:`,
                options: tokenOptions,
            })
            await ui.handleCancel(selectedToken, manageSyncs)
        }

        // If user selects "Create new access token", or no saved tokens...
        if (selectedToken === 'createNewToken' || !tokenOptions.length) {
            // Ask for new access token
            untestedToken = (await ui.prompt.password({
                message: `${platform} access token:`,
            })) as string
            await ui.handleCancel(untestedToken, manageSyncs)

            const tokenVerified = await verifyToken[platform](
                untestedToken as string
            )

            if (!tokenVerified) return await selectToken(platform)

            const testedToken = untestedToken as string
            const name = await promptForTokenName()
            if (!name) return await selectToken(platform)

            const token: Token = {
                name,
                token: testedToken,
                platform,
                id: uuidv4(),
            }

            await createToken(token)

            return token
        } else {
            return selectedToken as Token
        }
    } catch (error) {
        ui.prompt.log.error(`Error selecting ${platform} token.`)
        throw error
    }
}
