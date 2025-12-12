import { WebflowClient } from 'webflow-api'
import type { Site, Sites } from 'webflow-api/api'
import { ui } from '../../../../ui'

export async function checkWebflowToken(
    token: string
): Promise<Array<Site> | undefined> {
    // Check if API token is valid by trying to get bases
    ui.spinner.start('Checking Webflow access token...')
    const webflowClient = new WebflowClient({ accessToken: token })

    let sites: Sites

    try {
        sites = await webflowClient.sites.list()
        ui.spinner.stop(
            `✅ ${ui.format.dim('Webflow access token validated.')}`
        )
        return sites.sites
    } catch (error) {
        ui.prompt.log.message('Please try again.')
        return undefined
    }
}
