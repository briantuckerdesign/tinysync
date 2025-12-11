import type { PublishedWebflowItems } from './types'
import { ui } from '../../ui'

export async function publishItems(
    token: string,
    collectionId: string,
    itemIds: string[]
) {
    const url = `https://api.webflow.com/v2/collections/${collectionId}/items/publish`
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                accept: 'application/json',
                authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ itemIds: itemIds }),
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(
                `HTTP error! status: ${response.status}, message: ${errorText}`
            )
        }

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
        ui.prompt.log.error('Error publishing items.')
        throw error
    }
}
