import { WebflowClient } from 'webflow-api'
import { manageSyncs } from '../..'
import type { WebflowConfig } from '../../../../../types'
import { ui } from '../../../../../ui'
import { selectToken } from '../select-token'
import { selectCollection } from './select-collection'
import { selectSite } from './select-site'

export async function createWebflowConfig(): Promise<WebflowConfig> {
    try {
        {
            ui.prompt.log.info(`${ui.format.bold('Webflow')} details`)

            // User selects token
            const token = await selectToken('webflow')

            // Initialize webflowClient
            const webflowClient = new WebflowClient({
                accessToken: token.token,
            })

            // User selects site and collection
            const site = await selectSite(webflowClient)
            const collection = await selectCollection(webflowClient, site.id)

            return {
                token,
                site,
                collection,
            }
        }
    } catch (error) {
        ui.prompt.log.error('There was an error configuring Webflow.')
        await manageSyncs()
        process.exit(0)
    }
}
