import type { WebflowClient } from 'webflow-api'
import type { Site } from 'webflow-api/api'
import { manageSyncs } from '../..'
import { ui } from '../../../../../ui'

export async function selectSite(webflowClient: WebflowClient): Promise<Site> {
    try {
        const sites = await webflowClient.sites.list()
        if (!sites.sites) throw new Error('No sites found.')
        const site = (await ui.prompt.select({
            message: 'Airtable base:',
            options: sites.sites.map((site) => ({
                label: site.displayName ? site.displayName : site.id,
                value: site,
            })),
        })) as Site
        await ui.handleCancel(site, manageSyncs)

        return site
    } catch (error) {
        throw new Error('There was a problem selecting Webflow site.')
    }
}
