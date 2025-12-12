import type { SitesPublishRequest, SitesPublishResponse } from 'webflow-api/api'
import { getSites } from './get-sites'

export async function publishSite(
    token: string,
    siteId: string,
    publishToWebflowSubdomain: boolean = false,
    customDomainIds: string[] = []
): Promise<SitesPublishResponse> {
    const url = `https://api.webflow.com/v2/sites/${siteId}/publish`

    try {
        /**
         * If user didn't provide and domains and didn't enabled subdomain publishing,
         * We will fetch all custom domains from siteId and publish to those.
         */
        if (!customDomainIds.length && !publishToWebflowSubdomain) {
            const sites = await getSites(token)
            const site = sites.find((site) => site.id === siteId)
            if (!site) throw new Error('Provided siteId not found at token')
            if (site.customDomains) {
                for (const customDomain of site.customDomains)
                    customDomainIds.push(customDomain.id)
            }

            if (customDomainIds.length === 0) {
                throw new Error(
                    'No custom domains found for site and subdomain publishing is disabled. ' +
                        'Either provide customDomainIds, enable publishToWebflowSubdomain, or ensure the site has custom domains.'
                )
            }
        }

        const request: SitesPublishRequest = {
            customDomains: customDomainIds,
            publishToWebflowSubdomain,
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                accept: 'application/json',
                authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(request),
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(
                `HTTP error! status: ${response.status}, message: ${errorText}`
            )
        }

        const sitePublishResponse =
            (await response.json()) as SitesPublishResponse

        return sitePublishResponse
    } catch (error) {
        throw error
    }
}
