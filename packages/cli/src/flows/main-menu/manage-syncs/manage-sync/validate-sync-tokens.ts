import type { Platform, Sync, Token, TokenPair } from '@tinysync/core'
import { airtable } from '@tinysync/core'
import { WebflowClient } from 'webflow-api'
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

        // Handle syncs with no tokens configured (e.g., imported syncs)
        if (!sync.tokens) {
            ui.prompt.log.warn(
                'This sync has no tokens configured. Please assign tokens.'
            )

            // Initialize tokens object
            sync.tokens = {
                webflow: '',
                airtable: '',
            }

            // Prompt for both tokens
            const airtableReplaced = await handleMissingToken(sync, 'airtable')
            if (!airtableReplaced) {
                return false
            }

            const webflowReplaced = await handleMissingToken(sync, 'webflow')
            if (!webflowReplaced) {
                return false
            }

            // Save the updated sync
            const saved = await saveSyncs()
            if (!saved) {
                ui.prompt.log.error('Failed to save sync with updated tokens.')
                return false
            }

            ui.prompt.log.success('✓ Sync tokens configured successfully')

            webflowToken = state.tokens.find(
                (token) => token.id === sync.tokens?.webflow
            )?.token as string

            airtableToken = state.tokens.find(
                (token) => token.id === sync.tokens?.airtable
            )?.token as string

            return {
                airtable: airtableToken,
                webflow: webflowToken,
            }
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
 * or return to the main menu. Validates that the token can access the
 * resource defined in the sync config before accepting it.
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

        ui.prompt.log.info(`Please select a ${platform} token for this sync:`)

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

        // Validate that the token can access the resource
        const isValid = await validateTokenAccess(sync, selectedToken, platform)
        if (!isValid) {
            // Ask if they want to try another token
            const tryAgain = await ui.prompt.confirm({
                message: 'Would you like to try a different token?',
            })
            await ui.handleCancel(tryAgain, manageSyncs)

            if (tryAgain) {
                return await handleMissingToken(sync, platform)
            }
            return false
        }

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

/**
 * Validates that a token can access the resource defined in the sync config.
 * For Airtable, checks if the token can access the base.
 * For Webflow, checks if the token can access the site.
 */
async function validateTokenAccess(
    sync: Sync,
    token: Token,
    platform: Platform
): Promise<boolean> {
    ui.spinner.start(`Validating ${platform} token access...`)

    try {
        if (platform === 'airtable') {
            const baseId = sync.config.airtable.base.id
            const baseName = sync.config.airtable.base.name

            // Get all accessible bases
            const bases = await airtable.get.bases(token.token)

            // Check if the sync's base is accessible
            const hasAccess = bases.some((base) => base.id === baseId)

            if (!hasAccess) {
                ui.spinner.stop()
                ui.prompt.log.error(
                    `Token "${token.name}" does not have access to base "${baseName}" (${baseId}).`
                )
                return false
            }

            ui.spinner.stop()
            ui.prompt.log.success(`✓ Token has access to base "${baseName}"`)
            return true
        } else {
            // Webflow
            const siteId = sync.config.webflow.site.id
            const siteName = sync.config.webflow.site.name

            // Initialize Webflow client and get sites
            const webflowClient = new WebflowClient({
                accessToken: token.token,
            })
            const response = await webflowClient.sites.list()

            if (!response.sites) {
                ui.spinner.stop()
                ui.prompt.log.error(
                    `Token "${token.name}" cannot access any Webflow sites.`
                )
                return false
            }

            // Check if the sync's site is accessible
            const hasAccess = response.sites.some((site) => site.id === siteId)

            if (!hasAccess) {
                ui.spinner.stop()
                ui.prompt.log.error(
                    `Token "${token.name}" does not have access to site "${siteName}" (${siteId}).`
                )
                return false
            }

            ui.spinner.stop()
            ui.prompt.log.success(`✓ Token has access to site "${siteName}"`)
            return true
        }
    } catch (error) {
        ui.spinner.stop()
        ui.prompt.log.error(
            `Failed to validate ${platform} token. The token may be invalid or expired.`
        )
        return false
    }
}
