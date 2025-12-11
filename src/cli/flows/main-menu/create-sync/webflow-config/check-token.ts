import { WebflowClient } from 'webflow-api'
import { Site, Sites } from 'webflow-api/api'
import { ui } from '../../../../ui'
import { state } from '../../../../state'
import { errorHandler } from '../../../../error-handling'

export async function checkWebflowToken(
    token: string
): Promise<Array<Site> | undefined> {
    // Check if API token is valid by trying to get bases
    ui.spinner.start('Checking Webflow access token...')
    state.webflowClient = new WebflowClient({ accessToken: token })

    let sites: Sites

    try {
        sites = await state.webflowClient.sites.list()
        ui.spinner.stop(
            `✅ ${ui.format.dim('Webflow access token validated.')}`
        )
        return sites.sites
    } catch (error) {
        await errorHandler.webflow({
            error: error,
            location: 'checking Webflow access token',
            spinner: true,
        })

        ui.prompt.log.message('Please try again.')
        return undefined
    }
}
