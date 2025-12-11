import type { PublishedWebflowItems } from '../types/webflow'
import { ui } from '../ui'

export async function publishItem(
    token: string,
    collectionId: string,
    itemId: string
): Promise<PublishedWebflowItems> {
    const url = `https://api.webflow.com/beta/collections/${collectionId}/items/publish`
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                accept: 'application/json',
                authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ itemIds: [itemId] }),
        })

        if (!response.ok || response.status != 202) {
            const errorText = await response.text()
            throw new Error(
                `HTTP error! status: ${response.status}, message: ${errorText}`
            )
        }

        const data: any = await response.json()
        const publishedItems: PublishedWebflowItems = data

        return publishedItems
    } catch (error) {
        ui.prompt.log.error('Error publishing item.')
        throw error
    }
}
