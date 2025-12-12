import { state } from '../../../state'
import { ui } from '../../../ui'
import { v4 as uuidv4 } from 'uuid'
import { checkWebflowToken } from '../create-sync/webflow-config/check-token'
import { manageTokens } from '.'
import { airtable } from '../../../../core/airtable'
import type { Token } from '../../../../core/types'
import { tokens } from '../../../tokens'

export async function createToken(
    verifiedToken?: any,
    verifiedPlatform?: 'airtable' | 'webflow'
) {
    let platform, accessToken, tokenLabel

    // If coming from test key flow, skip prompt and just save provided data
    if (verifiedToken && verifiedPlatform) {
        accessToken = verifiedToken
        platform = verifiedPlatform
    } else {
        // Ask user for platform
        platform = verifiedPlatform
            ? verifiedPlatform
            : await ui.prompt.select({
                  message: 'Select a platform',
                  options: [
                      { value: 'airtable', label: 'Airtable' },
                      { value: 'webflow', label: 'Webflow' },
                  ],
              })
        if (ui.prompt.isCancel(platform)) {
            await manageTokens()
            return
        }

        // Ask user for access token
        accessToken = await ui.prompt.password({ message: 'Access token' })
        if (ui.prompt.isCancel(accessToken)) {
            await manageTokens()
            return
        }

        // test token
        if (platform === 'airtable') {
            ui.spinner.start('Checking access token...')
            let bases = await airtable.get.bases(accessToken) // TODO: I dont think this works because of return type

            // If API token is invalid, ask user to try again
            if (!bases) {
                ui.prompt.log.error(
                    "Either your token is invalid, or it doesn't have 'create' permissions on any bases."
                )
                ui.spinner.stop()
                return await manageTokens() // Recursively call the function again
            }
            ui.spinner.stop(`✅ ${ui.format.dim('Airtable token validated.')}`)
        }
        if (platform === 'webflow') {
            const sites = await checkWebflowToken(accessToken)
            if (sites === undefined) {
                await createToken(null, platform) // Recursively call the function again
                return
            }
        }
    }
    {
        // Ask user for label for API token
        tokenLabel = await ui.prompt.text({ message: 'Key label' })
        if (ui.prompt.isCancel(tokenLabel)) {
            await manageTokens()
            return
        }
    }

    const key: Token = {
        name: tokenLabel,
        token: accessToken,
        platform: platform,
        id: uuidv4(),
    }
    // Save API token to config
    state.tokens.push(key)

    await tokens.save()

    ui.prompt.log.success('✅ Key created!')

    if (verifiedToken && verifiedPlatform) {
        return
    } else {
        await manageTokens()
    }
}
