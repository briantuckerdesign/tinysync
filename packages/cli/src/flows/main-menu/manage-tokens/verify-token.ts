import { WebflowClient } from 'webflow-api'
import { airtable } from '@tinysync/core'
import { ui } from '../../../ui'

export const verifyToken = {
    webflow: verifyWebflowToken,
    airtable: verifyAirtableToken,
}

/**
 * Validates a Webflow access token.
 * Webflow API returns undefined if the token is invalid.
 */
export async function verifyWebflowToken(token: string): Promise<boolean> {
    // Check if API token is valid by trying to get bases
    ui.spinner.start('Checking access token...')
    const webflowClient = new WebflowClient({ accessToken: token })

    try {
        const sites = await webflowClient.sites.list()

        if (sites === undefined) return false

        ui.spinner.stop(`✅ ${ui.format.dim('Webflow token validated.')}`)

        return true
    } catch (error) {
        ui.spinner.stop()
        ui.prompt.log.error(
            'Either your token is invalid, or appropriate permissions.'
        )
        return false
    }
}

/**
 * Validates an Airtable access token by attempting to fetch bases.
 * Airtable API throws an error if the token is invalid.
 */
export async function verifyAirtableToken(token: string): Promise<boolean> {
    ui.spinner.start('Checking access token...')

    try {
        const bases = await airtable.get.bases(token)

        if (!bases || bases.length === 0) {
            ui.spinner.stop()
            ui.prompt.log.error(
                "Either your token is invalid, or it doesn't have 'create' permissions on any bases."
            )
            return false
        }

        ui.spinner.stop(`✅ ${ui.format.dim('Airtable token validated.')}`)
        return true
    } catch (error) {
        ui.spinner.stop()
        ui.prompt.log.error(
            "Either your token is invalid, or it doesn't have 'create' permissions on any bases."
        )
        return false
    }
}
