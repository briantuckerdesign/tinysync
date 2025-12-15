import type {
    Platform,
    Sync,
    Token,
    TokenPair,
} from '../../../../../core/types'
import { state } from '../../../../state'
import { ui } from '../../../../ui'
import { saveSyncs } from '../../../../syncs/save'
import { manageSyncs } from '..'

/**
 * Validates that the tokens referenced by a sync still exist in state.
 * If a token is missing, prompts the user to select a replacement token.
 * Returns the TokenPair (airtable and webflow token IDs) if valid or successfully replaced, false if user cancels.
 */
export async function validateSyncTokens(
    sync: Sync
): Promise<TokenPair | false> {
    try {
        let webflowToken = ''
        let airtableToken = ''
        if (!sync.tokens) {
            ui.prompt.log.warn('This sync has no tokens configured.')
            return false
        }

        const missingTokens: {
            platform: Platform
            tokenId: string
        }[] = []

        // Check Webflow token
        if (sync.tokens.webflow) {
            const webflowTokenExists = state.tokens.some(
                (token) => token.id === sync.tokens?.webflow
            )
            if (!webflowTokenExists) {
                missingTokens.push({
                    platform: 'webflow',
                    tokenId: sync.tokens.webflow,
                })
            }
            webflowToken = state.tokens.find(
                (token) => token.id === sync.tokens?.webflow
            )?.token as string
        }

        // Check Airtable token
        if (sync.tokens.airtable) {
            const airtableTokenExists = state.tokens.some(
                (token) => token.id === sync.tokens?.airtable
            )
            if (!airtableTokenExists) {
                missingTokens.push({
                    platform: 'airtable',
                    tokenId: sync.tokens.airtable,
                })
            }

            airtableToken = state.tokens.find(
                (token) => token.id === sync.tokens?.airtable
            )?.token as string
        }

        // If no missing tokens, return the token pair
        if (missingTokens.length === 0) {
            return {
                airtable: airtableToken,
                webflow: webflowToken,
            }
        }

        // Handle missing tokens
        ui.prompt.log.warn(
            `⚠️  This sync references ${missingTokens.length === 1 ? 'a token that has' : 'tokens that have'} been deleted.`
        )

        for (const missingToken of missingTokens) {
            const replaced = await handleMissingToken(
                sync,
                missingToken.platform
            )
            if (!replaced) {
                return false
            }
        }

        // Save the updated sync
        const saved = await saveSyncs()
        if (!saved) {
            ui.prompt.log.error('Failed to save sync with updated tokens.')
            return false
        }

        ui.prompt.log.success('✓ Sync tokens updated successfully')

        webflowToken = state.tokens.find(
            (token) => token.id === sync.tokens?.webflow
        )?.token as string

        airtableToken = state.tokens.find(
            (token) => token.id === sync.tokens?.airtable
        )?.token as string

        // Return the updated token pair
        return {
            airtable: airtableToken,
            webflow: webflowToken,
        }
    } catch (error) {
        ui.prompt.log.error('Error validating sync tokens.')
        return false
    }
}

/**
 * Handles a missing token by prompting the user to select a replacement
 * or return to the main menu.
 */
async function handleMissingToken(
    sync: Sync,
    platform: Platform
): Promise<boolean> {
    try {
        // Get available tokens for this platform
        const availableTokens = state.tokens.filter(
            (token) => token.platform === platform
        )

        if (availableTokens.length === 0) {
            ui.prompt.log.error(
                `No ${platform} tokens available. Please create a ${platform} token first.`
            )

            const choice = await ui.prompt.select({
                message: 'What would you like to do?',
                options: [
                    { label: 'Return to syncs menu', value: 'back' },
                    { label: 'Exit', value: 'exit' },
                ],
            })
            await ui.handleCancel(choice, manageSyncs)

            if (choice === 'exit') {
                ui.prompt.outro('See ya later! 👋')
                process.exit(0)
            }

            return false
        }

        // Prepare token selection options
        const tokenOptions = availableTokens.map((token) => ({
            label: token.name,
            value: token,
        })) as any[]

        tokenOptions.push(
            { label: 'Return to syncs menu', value: 'back' },
            { label: 'Exit', value: 'exit' }
        )

        ui.prompt.log.info(
            `Please select a replacement ${platform} token for this sync:`
        )

        const selectedOption = await ui.prompt.select({
            message: `Select ${platform} token:`,
            options: tokenOptions,
        })
        await ui.handleCancel(selectedOption, manageSyncs)

        if (selectedOption === 'back') {
            return false
        }

        if (selectedOption === 'exit') {
            ui.prompt.outro('See ya later! 👋')
            process.exit(0)
        }

        const selectedToken = selectedOption as Token

        // Update the sync with the new token ID
        if (!sync.tokens) {
            sync.tokens = {
                webflow: '',
                airtable: '',
            }
        }

        if (platform === 'webflow') {
            sync.tokens.webflow = selectedToken.id
        } else {
            sync.tokens.airtable = selectedToken.id
        }

        return true
    } catch (error) {
        ui.prompt.log.error(`Error handling missing ${platform} token.`)
        return false
    }
}
