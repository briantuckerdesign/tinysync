import type { CollectionItem, CollectionItemList } from 'webflow-api/api'
import { ui } from '../../ui'

export async function getItems(
    token: string,
    collectionId: string
): Promise<CollectionItem[]> {
    try {
        let allItems: CollectionItem[] = []
        let offset = 0
        let total = 0
        let firstRun = true
        const baseUrl = `https://api.webflow.com/v2/collections/${collectionId}/items`

        do {
            const url = `${baseUrl}?limit=100&offset=${offset}`
            const response = await fetch(url, {
                headers: {
                    accept: 'application/json',
                    authorization: `Bearer ${token}`,
                },
            })

            if (!response.ok) throw new Error(`HTTP error: ${response.status}`)

            const data: any = await response.json()

            const itemList: CollectionItemList = data
            if (!itemList.items) throw new Error('No items found')
            if (!itemList.pagination) throw new Error('No pagination found')

            const items = itemList.items
            const pagination = itemList.pagination

            allItems.push(...items)

            if (firstRun) {
                if (!pagination.total)
                    throw new Error('No pagination total found')
                total = pagination.total
                firstRun = false
            }

            offset += items.length
        } while (offset < total)

        return allItems
    } catch (error) {
        ui.prompt.log.error('Error getting items.')
        throw error
    }
}
