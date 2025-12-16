import { v4 as uuidv4 } from 'uuid'
import { manageTokens } from '.'
import type { Platform, Token } from '@tinysync/core'
import { state } from '../../../state'
import { tokens } from '../../../tokens'
import { ui } from '../../../ui'
import { verifyToken } from './verify-token'

/**
 * Creates a new token. If verifiedToken is provided, skips all prompts
 * and uses the provided token data directly (including name).
 */
export async function createToken(verifiedToken?: Token) {
    let platform: Platform
    let accessToken: string
    let name: string

    if (verifiedToken) {
        // Save API token to config
        state.tokens.push(verifiedToken)
        await tokens.save()

        ui.prompt.log.success('✅ Key created!')
        return
    }

    // Prompt and verify token
    const tokenDetails = await promptForTokenDetails()

    if (!tokenDetails) {
        await manageTokens()
        return
    }

    platform = tokenDetails.platform
    accessToken = tokenDetails.accessToken

    // Ask user for label for API token
    const tokenName = await promptForTokenName()

    if (!tokenName) {
        await manageTokens()
        return
    }

    name = tokenName

    const key: Token = {
        name: name,
        token: accessToken,
        platform: platform,
        id: uuidv4(),
    }

    // Save API token to config
    state.tokens.push(key)
    await tokens.save()

    ui.prompt.log.success('✅ Key created!')
    await manageTokens()
}

/**
 * Prompts user for platform and access token, validates the token,
 * and returns a partial Token object with platform and accessToken.
 * Recursively calls itself if validation fails.
 */
async function promptForTokenDetails(): Promise<
    { platform: Platform; accessToken: string } | undefined
> {
    // Ask user for platform
    const platform = await ui.prompt.select({
        message: 'Select a platform',
        options: [
            { value: 'airtable', label: 'Airtable' },
            { value: 'webflow', label: 'Webflow' },
        ],
    })

    if (ui.prompt.isCancel(platform)) {
        return undefined
    }

    // Ask user for access token
    const accessToken = await ui.prompt.password({ message: 'Access token' })

    if (ui.prompt.isCancel(accessToken)) {
        return undefined
    }

    // Verify token based on platform
    let isValid = false

    if (platform === 'airtable') {
        isValid = await verifyToken.airtable(accessToken)
    } else if (platform === 'webflow') {
        isValid = await verifyToken.webflow(accessToken)
    }

    // If token is invalid, recursively prompt again
    if (!isValid) {
        ui.prompt.log.message('Please try again.')
        return await promptForTokenDetails()
    }

    return { platform, accessToken }
}

/**
 * Prompts user for a label/name for the token.
 */
export async function promptForTokenName(): Promise<string | undefined> {
    const name = await ui.prompt.text({ message: 'Token name' })

    if (ui.prompt.isCancel(name)) return undefined

    return name
}
