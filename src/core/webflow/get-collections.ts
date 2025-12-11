import type { Collection } from 'webflow-api/api'
import { ui } from '../ui'

export async function getCollections(
    token: string,
    siteId: string
): Promise<Collection[]> {
    const url = `https://api.webflow.com/v2/sites/${siteId}/collections`
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                accept: 'application/json',
                authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(
                `HTTP error! status: ${response.status}, message: ${errorText}`
            )
        }

        const data: any = await response.json()
        const collections: Collection[] = data.collections

        return collections
    } catch (error) {
        ui.prompt.log.error('Error getting collections.')
        throw error
    }
}
